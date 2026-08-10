/**
 * Upsert the curated government schemes (src/data/sampleSchemes.ts) into the
 * `government_schemes` table, keyed by id so re-running refreshes content
 * (e.g. the enriched Mission Vatsalya entry sourced from the official MWCD
 * guideline). Safe to run against local Postgres or the production (Neon) DB.
 *
 * Run with: npm run db:seed-schemes
 */
import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import * as schema from "../src/db/schema";
import { SAMPLE_SCHEMES } from "../src/data/sampleSchemes";

const { governmentSchemes, schemeCategories, governmentSources } = schema;

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL is not set (see .env.example).");

// sourceKey -> the source_url used when the government_sources row was seeded.
const SOURCE_URL_BY_KEY: Record<string, string> = {
  myscheme: "https://www.myscheme.gov.in/",
  nsap: "https://nsap.nic.in/",
  vatsalya: "https://wcd.gov.in/",
  up_social_welfare: "https://sspy-up.gov.in/",
};

async function main() {
  const client = postgres(DATABASE_URL!, { max: 1, prepare: false });
  const db = drizzle(client, { schema });
  try {
    const cats = await db
      .select({ id: schemeCategories.id, slug: schemeCategories.slug })
      .from(schemeCategories);
    const catIdBySlug = new Map(cats.map((c) => [c.slug, c.id]));

    const srcs = await db
      .select({ id: governmentSources.id, url: governmentSources.sourceUrl })
      .from(governmentSources);
    const srcIdByUrl = new Map(srcs.map((s) => [s.url, s.id]));

    let n = 0;
    for (const s of SAMPLE_SCHEMES) {
      const sourceId = s.sourceKey
        ? srcIdByUrl.get(SOURCE_URL_BY_KEY[s.sourceKey] ?? "")
        : undefined;

      const values = {
        id: s.id,
        schemeName: s.schemeName,
        governmentLevel: s.governmentLevel,
        state: s.state,
        ministry: s.ministry,
        department: s.department,
        beneficiaryCategory: s.beneficiaryCategory,
        schemeCategoryId: catIdBySlug.get(s.schemeGroupSlug),
        eligibility: s.eligibility,
        benefits: s.benefits,
        documentsRequired: s.documentsRequired,
        applicationProcess: s.applicationProcess ?? null,
        incomeLimitInr: s.incomeLimitInr ?? null,
        applicationUrl: s.applicationUrl,
        officialSourceUrl: s.officialSourceUrl,
        sourceId: sourceId ?? null,
        sourceLastUpdated: s.sourceLastUpdated ?? null,
        verificationStatus: s.verificationStatus ?? "needs_verification",
      };

      await db
        .insert(governmentSchemes)
        .values(values)
        .onConflictDoUpdate({
          target: governmentSchemes.id,
          set: {
            schemeName: sql`excluded.scheme_name`,
            governmentLevel: sql`excluded.government_level`,
            state: sql`excluded.state`,
            ministry: sql`excluded.ministry`,
            department: sql`excluded.department`,
            beneficiaryCategory: sql`excluded.beneficiary_category`,
            schemeCategoryId: sql`excluded.scheme_category_id`,
            eligibility: sql`excluded.eligibility`,
            benefits: sql`excluded.benefits`,
            documentsRequired: sql`excluded.documents_required`,
            applicationProcess: sql`excluded.application_process`,
            incomeLimitInr: sql`excluded.income_limit_inr`,
            applicationUrl: sql`excluded.application_url`,
            officialSourceUrl: sql`excluded.official_source_url`,
            sourceId: sql`excluded.source_id`,
            sourceLastUpdated: sql`excluded.source_last_updated`,
            verificationStatus: sql`excluded.verification_status`,
            updatedAt: sql`now()`,
          },
        });
      n++;
      console.log(`  ↻ ${s.schemeName}`);
    }
    console.log(`✓ upserted ${n} schemes (Mission Vatsalya enriched from the official MWCD guideline).`);
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
