/**
 * Export the Government Data Source Master Matrix to a shareable CSV
 * (Excel-friendly) at data/government-source-matrix.csv.
 *
 * Run with: npm run matrix:csv
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { MATRIX, matrixSummary, type MatrixRow } from "../src/data/governmentSourceMatrix";

const COLUMNS: { header: string; get: (r: MatrixRow) => string }[] = [
  { header: "Government level", get: (r) => r.governmentLevel },
  { header: "State/UT", get: (r) => r.state ?? "" },
  { header: "Ministry", get: (r) => r.ministry ?? "" },
  { header: "Department", get: (r) => r.department ?? "" },
  { header: "Category", get: (r) => r.category },
  { header: "Source name", get: (r) => r.sourceName },
  { header: "Official URL", get: (r) => (r.sourceUrl.startsWith("pending:") ? "" : r.sourceUrl) },
  { header: "API URL", get: (r) => r.apiUrl ?? "" },
  { header: "Has API", get: (r) => yn(r.hasApi) },
  { header: "Formats", get: (r) => r.formats.join("; ") },
  { header: "Has schemes", get: (r) => yn(r.hasSchemes) },
  { header: "Has facility DB", get: (r) => yn(r.hasFacilityDb) },
  { header: "Has registration data", get: (r) => yn(r.hasRegistrationData) },
  { header: "Data fields", get: (r) => r.dataFields.join("; ") },
  { header: "Update frequency", get: (r) => r.updateFrequency ?? "" },
  { header: "Reuse/licensing", get: (r) => r.reuseLicense ?? "" },
  { header: "Access method", get: (r) => r.accessMethod ?? "" },
  { header: "Research status", get: (r) => r.researchStatus },
  { header: "Notes", get: (r) => r.notes ?? "" },
  { header: "Last checked", get: (r) => r.lastChecked ?? "" },
];

const yn = (b: boolean) => (b ? "Y" : "N");

/** RFC-4180 CSV quoting. */
function cell(v: string): string {
  if (/[",\n\r]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

function main() {
  const header = COLUMNS.map((c) => cell(c.header)).join(",");
  const lines = MATRIX.map((r) => COLUMNS.map((c) => cell(c.get(r))).join(","));
  const csv = [header, ...lines].join("\r\n") + "\r\n";

  const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "data");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "government-source-matrix.csv");
  writeFileSync(outPath, csv, "utf8");

  const s = matrixSummary();
  console.log(`✓ wrote ${outPath}`);
  console.log(
    `  ${s.total} rows — researched ${s.researched}, partial ${s.partial}, skeleton ${s.skeleton}`,
  );
}

main();
