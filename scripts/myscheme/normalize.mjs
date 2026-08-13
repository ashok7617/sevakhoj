/**
 * myScheme normalize — turn the raw crawl cache into a STAGING file shaped like
 * our scheme records (src/data/sampleSchemes.ts), ready for human review.
 *
 * This deliberately does NOT write into sampleSchemes.ts. myScheme text is
 * reusable with attribution, but SevaKhoj's honesty rule is that a human
 * curates state / group / government level / apply URL before anything ships.
 * Read scripts/myscheme/out/normalized.json, cherry-pick, and paste in.
 *
 * Usage: node scripts/myscheme/normalize.mjs
 */
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SCHEMES_DIR = path.join(HERE, "cache", "schemes");
const OUT_DIR = path.join(HERE, "out");

// Indian states/UTs — used only to HINT the state from the scheme text.
const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
  "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry",
  "Chandigarh", "Andaman and Nicobar", "Dadra and Nagar Haveli", "Daman and Diu", "Lakshadweep",
];

/** Split a "1.\t… 2.\t…" or newline document blob into a clean array. */
function splitDocs(blob) {
  if (!blob) return [];
  const parts = blob
    .replace(/^Documents\s*Required/i, "")
    .split(/\s*\n?\s*\d+[.)]\s*|\n+|•|;/)
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter((s) => s.length > 2 && !/^documents?\s*required$/i.test(s));
  return [...new Set(parts)].slice(0, 20);
}

/** Best-effort HINTS (clearly flagged) so the human curator starts from something. */
function hintState(text) {
  const hay = text || "";
  const hit = STATES.find((s) => new RegExp(`Government of ${s}\\b|\\b${s} (State|Government)`, "i").test(hay))
    || STATES.find((s) => new RegExp(`\\b${s}\\b`).test(hay));
  return hit || null;
}
function hintLevel(text) {
  if (/Ministry of|Government of India|centrally sponsored|central sector/i.test(text || "")) return "central";
  if (hintState(text)) return "state";
  return null;
}
function hintFirstUrl(text) {
  const m = (text || "").match(/https?:\/\/[^\s)"']+/);
  return m ? m[0] : null;
}

async function main() {
  if (!existsSync(SCHEMES_DIR)) {
    console.error(`No cache at ${SCHEMES_DIR}. Run: node scripts/myscheme/ingest.mjs`);
    process.exit(1);
  }
  await mkdir(OUT_DIR, { recursive: true });
  const files = (await readdir(SCHEMES_DIR)).filter((f) => f.endsWith(".json"));

  const normalized = [];
  for (const f of files) {
    const raw = JSON.parse(await readFile(path.join(SCHEMES_DIR, f), "utf8"));
    const blob = [raw.details, raw.eligibility, raw.sources].join("\n");
    normalized.push({
      // --- source & attribution (always kept) ---
      source: "myScheme (Government of India · DIC/MeitY)",
      sourceUrl: raw.url,
      mySchemeSlug: raw.slug,
      fetchedAt: raw.fetchedAt,

      // --- maps cleanly onto our scheme record ---
      schemeName: raw.title,
      benefits: raw.benefits,
      eligibility: raw.eligibility,
      documentsRequired: splitDocs(raw.documentsRequired),
      applicationProcess: raw.applicationProcess,

      // --- HINTS ONLY — a human must confirm these before shipping ---
      _hint_schemeGroupSlug: raw.group || null,
      _hint_state: hintState(blob),
      _hint_governmentLevel: hintLevel(blob),
      _hint_applicationUrl: hintFirstUrl(raw.applicationProcess) || hintFirstUrl(raw.sources),
    });
  }

  normalized.sort((a, b) => (a._hint_schemeGroupSlug || "").localeCompare(b._hint_schemeGroupSlug || ""));
  const outPath = path.join(OUT_DIR, "normalized.json");
  await writeFile(outPath, JSON.stringify(normalized, null, 2));

  // quick coverage report
  const byGroup = {};
  for (const n of normalized) byGroup[n._hint_schemeGroupSlug || "?"] = (byGroup[n._hint_schemeGroupSlug || "?"] || 0) + 1;
  console.log(`Normalized ${normalized.length} schemes → ${outPath}`);
  console.log("By vertical:", byGroup);
  console.log("\nReview the _hint_* fields, then curate the keepers into src/data/sampleSchemes.ts (set id, state, group, level, department, applicationUrl) and keep sourceUrl for attribution.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
