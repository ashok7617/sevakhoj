/**
 * Map the myScheme crawl (cache + normalized) into SevaKhoj catalogue records
 * and emit src/data/myschemeSchemes.ts (a SEPARATE file spread into
 * SAMPLE_SCHEMES). Machine-assigned metadata → verificationStatus stays
 * "needs_verification"; the myScheme page is kept as officialSourceUrl for
 * attribution + verification.
 *
 * Usage: node scripts/myscheme/to-catalogue.mjs
 */
import { readFile, readdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const CACHE = path.join(HERE, "cache", "schemes");
const NORMALIZED = path.join(HERE, "out", "normalized.json");
const SAMPLE_TS = path.join(ROOT, "src", "data", "sampleSchemes.ts");
const OUT_TS = path.join(ROOT, "src", "data", "myschemeSchemes.ts");

// Off-topic schemes the broad "workers" keywords ("e-shram", "labour card")
// wrongly pulled in — students / farmers / food-security / health / transport,
// outside SevaKhoj's care focus. Excluded from the catalogue (verified by hand).
const DROP_SLUGS = new Set([
  // workers vertical (broad "e-shram" / "labour card" keywords)
  "bsccs", "dadoe", "doshc", "ersych", "e-yuvasbirace-yuvafugs", "kcc", "mgpy",
  "nets", "e-nam", "nfssaayprcuk", "nfssphwrc", "sfyyrc", "sghs", "spebj", "tufs", "ucuk",
  // women/disability verticals ("working women hostel" caught generic hostels;
  // an orphan-reservation cert landed under disability) — verified off-topic on myScheme
  "yhs", "jnktkhs", "hfshpbocwwb", "pmochro",
]);

const BENEFICIARY = {
  senior_citizens: "Senior citizens",
  widows: "Widows / single women",
  disability: "Persons with disabilities",
  workers: "Unorganised / construction workers",
  women: "Women & children",
};

const STOP = new Set("the of to for and a in on scheme yojana pension assistance financial state government india".split(" "));
const tokens = (s) =>
  new Set(
    (s || "")
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP.has(w)),
  );
const jaccard = (a, b) => {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
};

function uuidFromSlug(slug) {
  const h = createHash("md5").update("myscheme:" + slug).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-8${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

function deptFromDetails(details) {
  const m = (details || "").match(/implemented by (?:the )?([A-Z][^.,;\n]{6,90})/);
  return m ? m[1].trim() : undefined;
}

async function existingSchemes() {
  const src = await readFile(SAMPLE_TS, "utf8");
  const names = [...src.matchAll(/schemeName:\s*"([^"]+)"/g)].map((m) => m[1]);
  const states = [...src.matchAll(/state:\s*"([^"]+)"/g)].map((m) => m[1]);
  // pair loosely: we only need name token-sets (+ a global state presence check)
  return names.map((n) => ({ name: n, tok: tokens(n) }));
}

async function main() {
  const normalized = JSON.parse(await readFile(NORMALIZED, "utf8"));
  const existing = await existingSchemes();

  const good = normalized.filter(
    (n) => n.benefits && n.eligibility && n.schemeName && !DROP_SLUGS.has(n.mySchemeSlug),
  );
  const records = [];
  const skipped = [];

  for (const n of good) {
    // dedupe vs our hand-curated catalogue (conservative: high name overlap)
    const t = tokens(n.schemeName);
    const dup = existing.find((e) => jaccard(t, e.tok) >= 0.6);
    if (dup) {
      skipped.push({ slug: n.mySchemeSlug, name: n.schemeName, dupOf: dup.name });
      continue;
    }

    // pull raw details (for department) — cache has it, normalized doesn't
    let details = "";
    try {
      const raw = JSON.parse(await readFile(path.join(CACHE, `${n.mySchemeSlug}.json`), "utf8"));
      details = raw.details || "";
    } catch {}

    const level = n._hint_governmentLevel || (n._hint_state ? "state" : "central");
    const rec = {
      id: uuidFromSlug(n.mySchemeSlug),
      schemeName: n.schemeName,
      governmentLevel: level === "central" ? "central" : "state",
      ...(n._hint_state ? { state: n._hint_state } : {}),
      ...(deptFromDetails(details) ? { department: deptFromDetails(details) } : {}),
      beneficiaryCategory: BENEFICIARY[n._hint_schemeGroupSlug] || "Citizens",
      schemeGroupSlug: n._hint_schemeGroupSlug || "senior_citizens",
      eligibility: n.eligibility,
      benefits: n.benefits,
      documentsRequired: n.documentsRequired?.length ? n.documentsRequired : ["See official portal"],
      applicationUrl: n._hint_applicationUrl || n.sourceUrl,
      officialSourceUrl: n.sourceUrl,
      sourceKey: "myscheme",
      verificationStatus: "needs_verification",
    };
    records.push(rec);
  }

  records.sort((a, b) => a.schemeGroupSlug.localeCompare(b.schemeGroupSlug) || a.schemeName.localeCompare(b.schemeName));

  const header = `/**
 * myScheme-derived schemes (Government of India · myscheme.gov.in, DIC/MeitY).
 * Reproduced with attribution per myScheme's copyright policy; each record keeps
 * its officialSourceUrl. Metadata (state / group / level / department) was
 * auto-assigned from the crawl, so verificationStatus is "needs_verification" —
 * confirm on the linked myScheme page. Regenerate: node scripts/myscheme/to-catalogue.mjs
 */
import type { SampleScheme } from "./sampleSchemes";

export const MYSCHEME_SCHEMES: SampleScheme[] = ${JSON.stringify(records, null, 2)};
`;
  await writeFile(OUT_TS, header);

  console.log(`Wrote ${records.length} myScheme schemes → src/data/myschemeSchemes.ts`);
  console.log(`Skipped ${skipped.length} as likely duplicates of existing entries.`);
  const byGroup = {};
  for (const r of records) byGroup[r.schemeGroupSlug] = (byGroup[r.schemeGroupSlug] || 0) + 1;
  console.log("By vertical:", byGroup);
  if (skipped.length) console.log("Sample dupes:", skipped.slice(0, 6).map((s) => `${s.name} ≈ ${s.dupOf}`));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
