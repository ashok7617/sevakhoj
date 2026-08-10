/**
 * Import the Government Data Source Master Matrix into `government_sources`.
 * Idempotent: upserts by source_url. Safe to re-run after editing the matrix.
 *
 * Run with: npm run db:import-sources
 */
import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import * as schema from "./schema";
import { MATRIX, matrixSummary } from "../data/governmentSourceMatrix";

const { governmentSources } = schema;

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL is not set (see .env.example).");

async function main() {
  const client = postgres(DATABASE_URL!, { max: 1 });
  const db = drizzle(client, { schema });

  const values = MATRIX.map((r) => ({
    governmentLevel: r.governmentLevel,
    ministry: r.ministry ?? null,
    department: r.department ?? null,
    state: r.state ?? null,
    sourceName: r.sourceName,
    sourceUrl: r.sourceUrl,
    apiUrl: r.apiUrl ?? null,
    dataFormat: r.formats.length ? r.formats.join("|") : null,
    licenseOrReuseNotes: r.reuseLicense ?? null,
    updateFrequency: r.updateFrequency ?? null,
    lastChecked: r.lastChecked ? new Date(r.lastChecked) : null,
    category: r.category,
    hasSchemes: r.hasSchemes,
    hasFacilityDb: r.hasFacilityDb,
    hasRegistrationData: r.hasRegistrationData,
    hasApi: r.hasApi,
    formats: r.formats,
    dataFields: r.dataFields,
    accessMethod: r.accessMethod ?? null,
    researchStatus: r.researchStatus,
    notes: r.notes ?? null,
  }));

  try {
    // Batch upsert; on conflict (source_url) refresh every matrix-managed field.
    await db
      .insert(governmentSources)
      .values(values)
      .onConflictDoUpdate({
        target: governmentSources.sourceUrl,
        set: {
          governmentLevel: sql`excluded.government_level`,
          ministry: sql`excluded.ministry`,
          department: sql`excluded.department`,
          state: sql`excluded.state`,
          sourceName: sql`excluded.source_name`,
          apiUrl: sql`excluded.api_url`,
          dataFormat: sql`excluded.data_format`,
          licenseOrReuseNotes: sql`excluded.license_or_reuse_notes`,
          updateFrequency: sql`excluded.update_frequency`,
          lastChecked: sql`excluded.last_checked`,
          category: sql`excluded.category`,
          hasSchemes: sql`excluded.has_schemes`,
          hasFacilityDb: sql`excluded.has_facility_db`,
          hasRegistrationData: sql`excluded.has_registration_data`,
          hasApi: sql`excluded.has_api`,
          formats: sql`excluded.formats`,
          dataFields: sql`excluded.data_fields`,
          accessMethod: sql`excluded.access_method`,
          researchStatus: sql`excluded.research_status`,
          notes: sql`excluded.notes`,
        },
      });

    const s = matrixSummary();
    console.log(
      `✓ imported ${s.total} sources ` +
        `(researched ${s.researched}, partial ${s.partial}, skeleton ${s.skeleton}; ` +
        `central ${s.central}, state ${s.state}, ut ${s.ut})`,
    );
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
