/**
 * Re-verify each myScheme-derived catalogue entry against the LIVE myScheme page
 * and record which still match. Only matches earn government_verified (applied by
 * to-catalogue.mjs, which reads scripts/myscheme/verified.json).
 *
 * "Match" = the stored benefits AND eligibility still appear on the current
 * official page — i.e. our data is a faithful, up-to-date record of the source.
 * Mismatches (myScheme updated, or an extraction artifact) stay needs_verification.
 *
 * Usage: node scripts/myscheme/reverify.mjs   (needs network; run backgrounded)
 */
import { chromium } from "playwright";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const SRC = path.join(ROOT, "src", "data", "myschemeSchemes.ts");
const OUT = path.join(HERE, "verified.json");
const ORIGIN = "https://www.myscheme.gov.in";
const DELAY_MS = 2200;

const norm = (s) => (s || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function loadImports() {
  const txt = await readFile(SRC, "utf8");
  const arr = txt.slice(txt.indexOf("= [") + 2, txt.lastIndexOf("]") + 1);
  return JSON.parse(arr);
}

async function liveSections(page, slug) {
  let lastErr;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await page.goto(`${ORIGIN}/schemes/${slug}`, { waitUntil: "domcontentloaded", timeout: 30000 });
      await page.waitForSelector("#details", { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(500);
      return await page.evaluate(() => {
        const sec = (id) => { const el = document.getElementById(id); return el ? (el.innerText || "") : ""; };
        return { benefits: sec("benefits"), eligibility: sec("eligibility") + " " + sec("exclusions") };
      });
    } catch (e) {
      lastErr = e;
      await sleep(3000); // transient DNS / network — back off and retry
    }
  }
  throw lastErr;
}

/** stored content is confirmed if its opening still appears on the live page */
function matches(storedField, liveField) {
  const s = norm(storedField);
  const l = norm(liveField);
  if (!s) return true; // nothing to contradict
  const needle = s.slice(0, Math.min(80, s.length));
  return l.includes(needle);
}

async function main() {
  const imports = await loadImports();
  // Resume: keep slugs already confirmed in a prior run; only re-check the rest.
  let verified = [];
  try { verified = JSON.parse(await readFile(OUT, "utf8")); } catch {}
  const done = new Set(verified);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  // Warm up DNS/network so the first real checks don't false-fail.
  for (let w = 0; w < 4; w++) { try { await page.goto(ORIGIN, { timeout: 30000 }); break; } catch { await sleep(3000); } }

  const mismatched = [];
  let i = 0;
  try {
    for (const r of imports) {
      const slug = (r.officialSourceUrl || "").split("/schemes/")[1];
      i++;
      if (!slug || done.has(slug)) continue;
      try {
        const live = await liveSections(page, slug);
        const ok = matches(r.benefits, live.benefits) && matches(r.eligibility, live.eligibility);
        if (ok) {
          verified.push(slug);
          await writeFile(OUT, JSON.stringify(verified, null, 2)); // persist incrementally
        } else mismatched.push(slug);
        console.log(`${i}/${imports.length} ${ok ? "✓" : "✗ mismatch"} ${slug}`);
      } catch (e) {
        mismatched.push(slug);
        console.log(`${i}/${imports.length} ✗ error ${slug} — ${e.message.split("\n")[0]}`);
      }
      await sleep(DELAY_MS);
    }
  } finally {
    await browser.close();
  }
  await writeFile(OUT, JSON.stringify(verified, null, 2));
  console.log(`\nVerified ${verified.length}/${imports.length} still match live myScheme → ${OUT}`);
  if (mismatched.length) console.log(`${mismatched.length} kept needs_verification: ${mismatched.join(", ")}`);
  console.log("__REVERIFY_DONE__");
}

main().catch((e) => { console.error(e); process.exit(1); });
