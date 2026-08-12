/**
 * Seed taxonomy (from memory.md) + a small set of SAMPLE Phase-1 records
 * (Uttar Pradesh: senior citizens, widows, children).
 *
 * IMPORTANT: The sample facilities/schemes below are PLACEHOLDER development
 * data, not verified government records. They are inserted with
 * verification_status = 'needs_verification' precisely so the UI never presents
 * them as official. Real ingestion replaces these via the source pipeline.
 *
 * Run with: npm run db:seed
 */
import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import * as schema from "./schema";
import { SAMPLE_SCHEMES } from "../data/sampleSchemes";

const {
  careCategories,
  schemeCategories,
  governmentSources,
  governmentSchemes,
} = schema;

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL is not set (see .env.example).");

/* ------------------------------------------------------------- taxonomy */

const CARE_CATEGORIES: {
  slug: string;
  name: string;
  groupSlug: string;
  groupName: string;
}[] = [
  // Children
  ["child-care-institutions", "Child Care Institutions", "children", "Children"],
  ["childrens-homes", "Children's Homes", "children", "Children"],
  ["open-shelters", "Open Shelters", "children", "Children"],
  ["specialized-adoption-agencies", "Specialized Adoption Agencies", "children", "Children"],
  ["observation-homes", "Observation Homes", "children", "Children"],
  ["special-homes", "Special Homes", "children", "Children"],
  ["places-of-safety", "Places of Safety", "children", "Children"],
  // Women & Widows
  ["womens-support", "Women's Support & Shelter", "women", "Women"],
  ["widow-support-homes", "Widow Support & Homes", "widows", "Widows"],
  // Senior Citizens
  ["old-age-homes", "Old-age Homes", "senior_citizens", "Senior Citizens"],
  ["dementia-care", "Dementia / Alzheimer's Care", "senior_citizens", "Senior Citizens"],
  ["assisted-living", "Assisted Living / Residential Senior Care", "senior_citizens", "Senior Citizens"],
  ["senior-day-care", "Day-care for Seniors", "senior_citizens", "Senior Citizens"],
  // Mental health
  ["psychiatric-care", "Mental Health / Psychiatric Care", "mental_health", "Mental Health"],
  ["psychiatric-rehabilitation", "Psychiatric Rehabilitation", "mental_health", "Mental Health"],
  ["rehabilitation-homes", "Rehabilitation Homes", "mental_health", "Mental Health"],
  ["halfway-homes", "Halfway Homes", "mental_health", "Mental Health"],
  // Disability
  ["ddrc", "District Disability Rehabilitation Centres", "disability", "Persons with Disabilities"],
  ["special-schools", "Special Schools", "disability", "Persons with Disabilities"],
  ["therapy-rehab-centers", "Therapy & Rehabilitation Centers", "disability", "Persons with Disabilities"],
  ["assistive-device-services", "Assistive-device Services", "disability", "Persons with Disabilities"],
  // Homeless / destitute
  ["homeless-rehabilitation", "Homeless / Destitute Rehabilitation", "homeless", "Homeless / Destitute"],
  // NGOs / caregivers
  ["ngos-charitable", "NGOs / Charitable Organizations", "ngos", "NGOs / Organizations"],
  ["caregiver-support", "Caregiver Support", "ngos", "NGOs / Organizations"],
].map(([slug, name, groupSlug, groupName], i) => ({
  slug,
  name,
  groupSlug,
  groupName,
  sortOrder: i,
}));

const SCHEME_CATEGORIES = [
  ["children", "Children"],
  ["women", "Women"],
  ["students", "Students / Scholarships"],
  ["widows", "Widows"],
  ["senior_citizens", "Senior Citizens"],
  ["disability", "Persons with Disabilities"],
  ["mental_health", "Mental Health"],
  ["homeless", "Homeless / Destitute"],
  ["low_income", "Low-income Households"],
  ["caregivers", "Caregivers"],
  ["ngos", "NGOs / Organizations"],
  ["other", "Other Vulnerable Groups"],
].map(([slug, name], i) => ({ slug, name, sortOrder: i }));

/* ---------------------------------------------------------- government sources */

const SOURCES = [
  {
    key: "myscheme",
    governmentLevel: "central" as const,
    ministry: "Government of India (multiple ministries)",
    sourceName: "myScheme",
    sourceUrl: "https://www.myscheme.gov.in/",
    dataFormat: "html",
    licenseOrReuseNotes: "Verify reuse terms before commercial redistribution.",
  },
  {
    key: "nsap",
    governmentLevel: "central" as const,
    ministry: "Ministry of Rural Development",
    department: "National Social Assistance Programme (NSAP)",
    sourceName: "NSAP Portal",
    sourceUrl: "https://nsap.nic.in/",
    dataFormat: "html",
  },
  {
    key: "vatsalya",
    governmentLevel: "central" as const,
    ministry: "Ministry of Women & Child Development",
    department: "Mission Vatsalya",
    sourceName: "Mission Vatsalya",
    sourceUrl: "https://wcd.gov.in/",
    dataFormat: "html",
  },
  {
    key: "up_social_welfare",
    governmentLevel: "state" as const,
    state: "Uttar Pradesh",
    department: "Social Welfare Department",
    sourceName: "UP Social Welfare Department",
    sourceUrl: "https://sspy-up.gov.in/",
    dataFormat: "html",
  },
];

async function main() {
  const client = postgres(DATABASE_URL!, { max: 1, prepare: false });
  const db = drizzle(client, { schema });

  try {
    // 1) Taxonomy (idempotent by slug).
    await db.insert(careCategories).values(CARE_CATEGORIES).onConflictDoNothing({
      target: careCategories.slug,
    });
    await db.insert(schemeCategories).values(SCHEME_CATEGORIES).onConflictDoNothing({
      target: schemeCategories.slug,
    });
    console.log(
      `✓ taxonomy: ${CARE_CATEGORIES.length} care categories, ${SCHEME_CATEGORIES.length} scheme categories`,
    );

    // 2) Government sources (idempotent by source_url).
    const sourceIdByKey = new Map<string, string>();
    for (const s of SOURCES) {
      const existing = await db
        .select({ id: governmentSources.id })
        .from(governmentSources)
        .where(sql`${governmentSources.sourceUrl} = ${s.sourceUrl}`)
        .limit(1);
      if (existing[0]) {
        sourceIdByKey.set(s.key, existing[0].id);
        continue;
      }
      const [row] = await db
        .insert(governmentSources)
        .values({
          governmentLevel: s.governmentLevel,
          ministry: s.ministry,
          department: s.department,
          state: s.state,
          sourceName: s.sourceName,
          sourceUrl: s.sourceUrl,
          dataFormat: s.dataFormat,
          licenseOrReuseNotes: s.licenseOrReuseNotes,
        })
        .returning({ id: governmentSources.id });
      sourceIdByKey.set(s.key, row.id);
    }
    console.log(`✓ sources: ${sourceIdByKey.size}`);

    // Map scheme category slugs -> ids for the scheme seed below.
    const schemeCats = await db
      .select({ id: schemeCategories.id, slug: schemeCategories.slug })
      .from(schemeCategories);
    const schemeIdBySlug = new Map(schemeCats.map((c) => [c.slug, c.id]));

    // 3) Facilities are intentionally NOT seeded with placeholder data.
    //    Real facilities come from the public registration form (/register),
    //    government-data ingestion, or verified manual curation — never fake
    //    samples on a live care site. (SAMPLE_FACILITIES still exists only as
    //    the offline demo fallback when the DB is unreachable.)

    // 4) Sample schemes — real scheme names, but fields are NOT authoritative
    //    and must be verified against the official source before display as
    //    government-verified. Seeded as needs_verification.
    const schCount = await db.select({ n: sql<number>`count(*)::int` }).from(governmentSchemes);
    if (schCount[0].n === 0) {
      await db.insert(governmentSchemes).values(
        SAMPLE_SCHEMES.map((s) => ({
          id: s.id,
          schemeName: s.schemeName,
          governmentLevel: s.governmentLevel,
          state: s.state,
          ministry: s.ministry,
          department: s.department,
          beneficiaryCategory: s.beneficiaryCategory,
          schemeCategoryId: schemeIdBySlug.get(s.schemeGroupSlug),
          eligibility: s.eligibility,
          benefits: s.benefits,
          documentsRequired: s.documentsRequired,
          applicationUrl: s.applicationUrl,
          officialSourceUrl: s.officialSourceUrl,
          sourceId: s.sourceKey ? sourceIdByKey.get(s.sourceKey) : undefined,
          verificationStatus: "needs_verification" as const,
        })),
      );
      console.log(`✓ sample schemes: ${SAMPLE_SCHEMES.length}`);
    } else {
      console.log("• schemes already present — skipping sample schemes");
    }

    console.log("Seed complete.");
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
