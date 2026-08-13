/**
 * myScheme ingest — polite, resumable Playwright crawler.
 *
 * Drives a REAL browser through the Government of India's official scheme
 * portal (myscheme.gov.in) exactly like a person would: types a keyword in the
 * search box, opens each result, and reads the id-anchored sections
 * (#details / #benefits / #eligibility / #application-process /
 *  #documents-required / #sources). No API keys, no WAF evasion — just the
 * public pages, which robots.txt allows (`Allow: /`).
 *
 * myScheme's copyright policy permits reproduction free of charge WITH accurate
 * reproduction + prominent attribution — every cached record stores the source
 * URL so the app can attribute it.
 *
 * Usage:
 *   npm i                         # installs playwright (devDependency)
 *   npx playwright install chromium
 *   node scripts/myscheme/ingest.mjs            # crawl all keyword verticals
 *   node scripts/myscheme/ingest.mjs "widow pension"   # one ad-hoc keyword
 *
 * Output: scripts/myscheme/cache/schemes/<slug>.json (one per scheme, resumable)
 *         scripts/myscheme/cache/index.json          (slug → keyword/group map)
 */
import { chromium } from "playwright";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { KEYWORDS } from "./keywords.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ORIGIN = "https://www.myscheme.gov.in";
const CACHE = path.join(HERE, "cache");
const SCHEMES_DIR = path.join(CACHE, "schemes");

// Politeness knobs — be a good citizen of a government server.
const NAV_DELAY_MS = 2500; // between scheme-detail navigations
const SCROLL_ROUNDS = 15; // max load-more scrolls per keyword
const SCROLL_WAIT_MS = 1200;
const PER_KEYWORD_CAP = 120; // safety cap on slugs collected per keyword

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Type a keyword into myScheme search and collect unique scheme slugs. */
async function collectSlugs(page, keyword) {
  await page.goto(`${ORIGIN}/search`, { waitUntil: "domcontentloaded" });
  // The search box is a react-select whose bare <input type=text> is hidden;
  // the visible field is the only one carrying placeholder="Search".
  const input = page.locator('input[placeholder="Search"]:visible').first();
  await input.waitFor({ timeout: 15000 });
  await input.click();
  await input.fill(keyword);
  await input.press("Enter");
  const searchBtn = page.getByRole("button", { name: /^search$/i }).first();
  if (await searchBtn.count()) await searchBtn.click().catch(() => {});
  await sleep(2500);

  let prev = -1;
  for (let i = 0; i < SCROLL_ROUNDS; i++) {
    const count = await page.locator('a[href^="/schemes/"]').count();
    if (count === prev || count >= PER_KEYWORD_CAP) break;
    prev = count;
    await page.mouse.wheel(0, 24000);
    await sleep(SCROLL_WAIT_MS);
  }

  const hrefs = await page.$$eval('a[href^="/schemes/"]', (as) => as.map((a) => a.getAttribute("href")));
  return [...new Set(hrefs.map((h) => (h || "").split("/schemes/")[1]).filter(Boolean))].slice(0, PER_KEYWORD_CAP);
}

/** Read one scheme's structured sections from its detail page. */
async function extractScheme(page, slug) {
  await page.goto(`${ORIGIN}/schemes/${slug}`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#details", { timeout: 15000 }).catch(() => {});
  await sleep(600); // let client-rendered sections settle

  const data = await page.evaluate(() => {
    const clean = (t) =>
      (t || "")
        .replace(/\r/g, "")
        .replace(/[ \t]+\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
    // Each anchor div (id=details|benefits|…) wraps ONLY its own section, so
    // read the element's own innerText directly.
    const sectionText = (id) => {
      const el = document.getElementById(id);
      return el ? clean(el.innerText || "") : "";
    };
    // Strip the leading heading label(s), which myScheme often repeats
    // ("BenefitsBenefits Monthly pension …").
    const stripHead = (t, label) => clean(t.replace(new RegExp("^\\s*(?:(?:" + label + ")\\s*)+", "i"), ""));

    const main = document.querySelector("main");
    const title = main ? [...main.querySelectorAll("h1")].map((h) => h.textContent.trim()).filter(Boolean)[0] || "" : "";

    const eligibility = stripHead(sectionText("eligibility"), "Eligibility");
    const exclusions = stripHead(sectionText("exclusions"), "Exclusions");

    return {
      title,
      details: stripHead(sectionText("details"), "Details|Features"),
      benefits: stripHead(sectionText("benefits"), "Benefits"),
      eligibility: exclusions ? `${eligibility}\nExclusions: ${exclusions}` : eligibility,
      applicationProcess: stripHead(sectionText("application-process"), "Application Process"),
      documentsRequired: stripHead(sectionText("documents-required"), "Documents Required|List of the required documents"),
      sources: stripHead(sectionText("sources"), "Sources(?:\\s*And References)?"),
    };
  });

  return { slug, url: `${ORIGIN}/schemes/${slug}`, ...data, fetchedAt: new Date().toISOString() };
}

async function loadIndex() {
  const p = path.join(CACHE, "index.json");
  if (existsSync(p)) return JSON.parse(await readFile(p, "utf8"));
  return {};
}

async function main() {
  await mkdir(SCHEMES_DIR, { recursive: true });

  const adHoc = process.argv[2];
  const jobs = adHoc ? [{ group: "unassigned", terms: [adHoc] }] : KEYWORDS;

  const index = await loadIndex();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();

  let fetched = 0;
  let skipped = 0;
  try {
    for (const { group, terms } of jobs) {
      for (const term of terms) {
        process.stdout.write(`\n🔎 [${group}] "${term}"  … `);
        let slugs = [];
        try {
          slugs = await collectSlugs(page, term);
        } catch (e) {
          console.log(`search failed: ${e.message}`);
          continue;
        }
        console.log(`${slugs.length} results`);

        for (const slug of slugs) {
          // record which vertical surfaced this slug (first one wins)
          if (!index[slug]) index[slug] = { group, term };

          const out = path.join(SCHEMES_DIR, `${slug}.json`);
          if (existsSync(out)) {
            skipped++;
            continue;
          }
          try {
            const rec = await extractScheme(page, slug);
            rec.group = group; // SevaKhoj vertical hint (human-reviewed later)
            await writeFile(out, JSON.stringify(rec, null, 2));
            fetched++;
            console.log(`   ✓ ${slug} — ${rec.title || "(no title)"}`);
          } catch (e) {
            console.log(`   ✗ ${slug} — ${e.message}`);
          }
          await sleep(NAV_DELAY_MS);
        }
        await writeFile(path.join(CACHE, "index.json"), JSON.stringify(index, null, 2));
      }
    }
  } finally {
    await browser.close();
  }

  console.log(`\nDone. Fetched ${fetched} new, skipped ${skipped} cached. Cache: ${SCHEMES_DIR}`);
  console.log("Next: node scripts/myscheme/normalize.mjs");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
