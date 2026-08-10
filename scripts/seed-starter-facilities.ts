/**
 * Honest starter set of REAL, currently-operating senior-care organisations,
 * sourced from each organisation's OWN official website (the `website` field is
 * the citable source). Loaded as `needs_verification` with `retrieved_at` = now
 * and `official_source_url` = the org site — NOT "government_verified", because
 * an org's own site is not an official government source and these have not been
 * independently confirmed. Users can click through to the source to verify.
 *
 * Only details clearly stated on the official source are included; uncertain
 * fields (e.g. a phone we couldn't confirm) are left blank on purpose.
 *
 * Idempotent: rows are keyed by external_id `starter:<slug>` and re-inserted.
 * Run with: npm run db:seed-starter
 */
import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import * as schema from "../src/db/schema";
import { GAZETTEER } from "../src/lib/careFinder/criteria";

const { facilities, careCategories } = schema;

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL is not set.");

type Rec = {
  slug: string;
  name: string;
  careCategorySlug: string;
  category: string;
  gender: "male" | "female" | "all";
  residential: boolean;
  costType?: "free" | "subsidized" | "paid" | "mixed";
  services: string[];
  address?: string;
  city: string;
  district: string;
  state: string;
  pincode?: string;
  phone?: string;
  email?: string;
  website: string; // official source
};

const RECORDS: Rec[] = [
  {
    slug: "rkmm-varanasi",
    name: "Ramakrishna Mission Home of Service, Varanasi",
    careCategorySlug: "old-age-homes",
    category: "Old-age Home (charitable)",
    gender: "all",
    residential: true,
    services: ["Residential care", "Medical care"],
    address: "Luxa, Varanasi",
    city: "Varanasi",
    district: "Varanasi",
    state: "Uttar Pradesh",
    pincode: "221010",
    phone: "0542-2451727",
    email: "varanasi@rkmm.org",
    website: "https://varanasi.rkmm.org",
  },
  {
    slug: "sheows-garhmukteshwar",
    name: "Guru Vishram Vridh Ashram, Garhmukteshwar (SHEOWS)",
    careCategorySlug: "old-age-homes",
    category: "Old-age Home for destitute elderly",
    gender: "all",
    residential: true,
    costType: "free",
    services: ["Residential care", "Meals", "Medical care"],
    city: "Garhmukteshwar",
    district: "Hapur",
    state: "Uttar Pradesh",
    email: "oldagehome@sheows.org",
    website: "https://sheows.org",
  },
  {
    slug: "sheows-delhi",
    name: "Guru Vishram Vridh Ashram, Delhi (SHEOWS)",
    careCategorySlug: "old-age-homes",
    category: "Old-age Home for destitute elderly",
    gender: "all",
    residential: true,
    costType: "free",
    services: ["Residential care", "Meals", "Medical care", "Clothing"],
    address: "Gautampuri Phase-I, Near NTPC Badarpur, Mathura Road",
    city: "New Delhi",
    district: "South East Delhi",
    state: "Delhi",
    pincode: "110044",
    email: "oldagehome@sheows.org",
    website: "https://sheows.org",
  },
  {
    slug: "earth-saviours-gurugram",
    name: "The Earth Saviours Foundation (Shelter for Destitute Elderly)",
    careCategorySlug: "old-age-homes",
    category: "Shelter for destitute elderly & disabled",
    gender: "all",
    residential: true,
    costType: "free",
    services: ["Residential care", "Meals", "Medical care"],
    address: "Bandhwari Village, Faridabad–Gurgaon Road, Near TERI Golf Course",
    city: "Gurugram",
    district: "Gurugram",
    state: "Haryana",
    pincode: "122001",
    website: "https://earthsaviours.in",
  },
  {
    slug: "dignity-foundation-mumbai",
    name: "Dignity Foundation (Senior Citizens), Mumbai",
    careCategorySlug: "senior-day-care",
    category: "Senior citizen support & day-care",
    gender: "all",
    residential: false,
    costType: "mixed",
    services: ["Day-care", "Dementia day-care", "Helpline (1800-267-8780)", "Companionship"],
    address: "B-206, Byculla Service Industries Premises, Dadoji Konddeo Road, Byculla (East)",
    city: "Mumbai",
    district: "Mumbai",
    state: "Maharashtra",
    pincode: "400027",
    phone: "022-61381100",
    email: "responsedignity@dignityfoundation.com",
    website: "https://www.dignityfoundation.com",
  },
  {
    slug: "nightingales-bengaluru",
    name: "Nightingales Centre for Ageing & Alzheimer's (Nightingales Medical Trust)",
    careCategorySlug: "dementia-care",
    category: "Dementia / Alzheimer's care",
    gender: "all",
    residential: false,
    costType: "mixed",
    services: ["Dementia day-care", "Elder care", "Memory clinic"],
    address: "8P6, 3rd A Cross, Kasturinagar, Banaswadi",
    city: "Bengaluru",
    district: "Bengaluru",
    state: "Karnataka",
    pincode: "560043",
    phone: "080-42426565",
    email: "contact@nightingaleseldercare.com",
    website: "https://www.nightingaleseldercare.com",
  },
  {
    slug: "apnaghar-lucknow",
    name: "Apna Ghar Ashram, Lucknow",
    careCategorySlug: "old-age-homes",
    category: "Home for destitute persons (residential)",
    gender: "all",
    residential: true,
    costType: "free",
    services: ["Residential care", "Meals", "Clothing", "Medical care"],
    address: "Near Maharaja Agrasen Inter College, Motinagar",
    city: "Lucknow",
    district: "Lucknow",
    state: "Uttar Pradesh",
    phone: "7976766620",
    website: "https://apnagharashram.org/lucknow/",
  },
  {
    slug: "apnaghar-vrindavan",
    name: "Apna Ghar Ashram, Vrindavan",
    careCategorySlug: "old-age-homes",
    category: "Home for destitute persons (residential)",
    gender: "all",
    residential: true,
    costType: "free",
    services: ["Residential care", "Meals", "Clothing", "Medical care"],
    address: "Parwati Sewa Sadan Bhawan, Chaitanya Vihar Phase 2, Vrindavan",
    city: "Vrindavan",
    district: "Mathura",
    state: "Uttar Pradesh",
    website: "https://apnagharashram.org/vrindavan/",
  },
  {
    slug: "helpage-lucknow",
    name: "HelpAge India — Lucknow (Agecare)",
    careCategorySlug: "senior-day-care",
    category: "Senior citizen support & day-care",
    gender: "all",
    residential: false,
    costType: "mixed",
    services: ["Elder day-care", "Mobile healthcare", "Elders' helpline (1800-180-1253)"],
    address: "3/129, Vikas Nagar",
    city: "Lucknow",
    district: "Lucknow",
    state: "Uttar Pradesh",
    pincode: "226022",
    phone: "0522-2738048",
    email: "lucknow@helpageindia.org",
    website: "https://www.helpageindia.org",
  },
];

async function geocode(r: Rec): Promise<{ lat: number; lng: number } | null> {
  const g = GAZETTEER[r.city.toLowerCase()];
  if (g) return { lat: g.lat, lng: g.lng };
  const q = [r.city, r.district, r.state, r.pincode].filter(Boolean).join(", ");
  try {
    const url =
      "https://nominatim.openstreetmap.org/search?" +
      new URLSearchParams({ q: `${q}, India`, format: "json", limit: "1", countrycodes: "in" });
    const res = await fetch(url, { headers: { "User-Agent": "india-care-setu/0.1 (starter seed)" } });
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{ lat: string; lon: string }>;
    const first = data[0];
    if (!first) return null;
    return { lat: Number.parseFloat(first.lat), lng: Number.parseFloat(first.lon) };
  } catch {
    return null;
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const client = postgres(DATABASE_URL!, { max: 1, prepare: false });
  const db = drizzle(client, { schema });
  try {
    const cats = await db
      .select({ id: careCategories.id, slug: careCategories.slug })
      .from(careCategories);
    const idBySlug = new Map(cats.map((c) => [c.slug, c.id]));

    // idempotent: clear previous starter rows
    await db.execute(sql`DELETE FROM facilities WHERE external_id LIKE 'starter:%'`);

    let geocoded = 0;
    for (const r of RECORDS) {
      const geo = await geocode(r);
      if (geo) geocoded++;
      await db.insert(facilities).values({
        externalId: `starter:${r.slug}`,
        name: r.name,
        careCategoryId: idBySlug.get(r.careCategorySlug),
        category: r.category,
        gender: r.gender,
        residential: r.residential,
        costType: r.costType,
        services: r.services,
        address: r.address,
        city: r.city,
        district: r.district,
        state: r.state,
        pincode: r.pincode,
        phone: r.phone,
        email: r.email,
        latitude: geo?.lat,
        longitude: geo?.lng,
        officialSourceUrl: r.website,
        retrievedAt: new Date(),
        verificationStatus: "needs_verification",
      });
      console.log(`  + ${r.name}${geo ? "" : "  (not geocoded)"}`);
      if (!GAZETTEER[r.city.toLowerCase()]) await sleep(1100); // Nominatim rate limit
    }
    console.log(`✓ starter facilities: ${RECORDS.length} (geocoded ${geocoded}). All needs_verification, sourced from official websites.`);
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
