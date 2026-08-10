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

  /* ---- Little Sisters of the Poor — Homes for the Aged (charitable; welcome
     the elderly poor & destitute irrespective of caste/creed). Locations from
     the congregation's official India site; verify each home's exact address
     and contact via the source. ---- */
  {
    slug: "lsp-bangalore",
    name: "Little Sisters of the Poor — Home for the Aged, Bengaluru",
    careCategorySlug: "old-age-homes",
    category: "Old-age Home (charitable)",
    gender: "all",
    residential: true,
    costType: "free",
    services: ["Residential care", "Meals", "Medical care"],
    address: "Near Baldwin Boys School, Hosur Road, Richmond Town",
    city: "Bengaluru",
    district: "Bengaluru",
    state: "Karnataka",
    pincode: "560025",
    website: "https://www.littlesistersofthepoorindia.org",
  },
  {
    slug: "lsp-mumbai",
    name: "Little Sisters of the Poor — Home for the Aged, Mumbai",
    careCategorySlug: "old-age-homes",
    category: "Old-age Home (charitable)",
    gender: "all",
    residential: true,
    costType: "free",
    services: ["Residential care", "Meals", "Medical care"],
    address: "Mahakali Caves Road, Andheri East",
    city: "Mumbai",
    district: "Mumbai",
    state: "Maharashtra",
    pincode: "400093",
    website: "https://www.littlesistersofthepoorindia.org",
  },
  {
    slug: "lsp-kolkata",
    name: "Little Sisters of the Poor — Home for the Aged, Kolkata",
    careCategorySlug: "old-age-homes",
    category: "Old-age Home (charitable)",
    gender: "all",
    residential: true,
    costType: "free",
    services: ["Residential care", "Meals", "Medical care"],
    address: "2, AJC Bose Road",
    city: "Kolkata",
    district: "Kolkata",
    state: "West Bengal",
    pincode: "700020",
    website: "https://www.littlesistersofthepoorindia.org",
  },
  {
    slug: "lsp-chennai",
    name: "Little Sisters of the Poor — Home for the Aged, Chennai",
    careCategorySlug: "old-age-homes",
    category: "Old-age Home (charitable)",
    gender: "all",
    residential: true,
    costType: "free",
    services: ["Residential care", "Meals", "Medical care"],
    city: "Chennai",
    district: "Chennai",
    state: "Tamil Nadu",
    website: "https://www.littlesistersofthepoorindia.org",
  },
  {
    slug: "lsp-secunderabad",
    name: "Little Sisters of the Poor — Home for the Aged, Secunderabad",
    careCategorySlug: "old-age-homes",
    category: "Old-age Home (charitable)",
    gender: "all",
    residential: true,
    costType: "free",
    services: ["Residential care", "Meals", "Medical care"],
    city: "Secunderabad",
    district: "Hyderabad",
    state: "Telangana",
    website: "https://www.littlesistersofthepoorindia.org/secunderabad",
  },
  {
    slug: "lsp-mysuru",
    name: "Little Sisters of the Poor — Home for the Aged, Mysuru",
    careCategorySlug: "old-age-homes",
    category: "Old-age Home (charitable)",
    gender: "all",
    residential: true,
    costType: "free",
    services: ["Residential care", "Meals", "Medical care"],
    city: "Mysuru",
    district: "Mysuru",
    state: "Karnataka",
    website: "https://www.littlesistersofthepoorindia.org",
  },
  {
    slug: "lsp-mangaluru",
    name: "Little Sisters of the Poor — Home for the Aged, Mangaluru",
    careCategorySlug: "old-age-homes",
    category: "Old-age Home (charitable)",
    gender: "all",
    residential: true,
    costType: "free",
    services: ["Residential care", "Meals", "Medical care"],
    city: "Mangaluru",
    district: "Dakshina Kannada",
    state: "Karnataka",
    website: "https://www.littlesistersofthepoorindia.org",
  },
  {
    slug: "lsp-guntur",
    name: "Little Sisters of the Poor — Home for the Aged, Guntur",
    careCategorySlug: "old-age-homes",
    category: "Old-age Home (charitable)",
    gender: "all",
    residential: true,
    costType: "free",
    services: ["Residential care", "Meals", "Medical care"],
    city: "Guntur",
    district: "Guntur",
    state: "Andhra Pradesh",
    website: "https://www.littlesistersofthepoorindia.org",
  },
  {
    slug: "lsp-jabalpur",
    name: "Little Sisters of the Poor — Home for the Aged, Jabalpur",
    careCategorySlug: "old-age-homes",
    category: "Old-age Home (charitable)",
    gender: "all",
    residential: true,
    costType: "free",
    services: ["Residential care", "Meals", "Medical care"],
    city: "Jabalpur",
    district: "Jabalpur",
    state: "Madhya Pradesh",
    website: "https://www.littlesistersofthepoorindia.org",
  },
  {
    slug: "lsp-coonoor",
    name: "Little Sisters of the Poor — Home for the Aged, Coonoor",
    careCategorySlug: "old-age-homes",
    category: "Old-age Home (charitable)",
    gender: "all",
    residential: true,
    costType: "free",
    services: ["Residential care", "Meals", "Medical care"],
    city: "Coonoor",
    district: "Nilgiris",
    state: "Tamil Nadu",
    website: "https://www.littlesistersofthepoorindia.org",
  },

  /* ---- SOS Children's Villages of India — family-based long-term care for
     children who have lost parental care (india's largest self-implementing
     childcare NGO, since 1964). Locations from soschildrensvillages.in. ---- */
  {
    slug: "sos-bengaluru",
    name: "SOS Children's Village, Bengaluru",
    careCategorySlug: "childrens-homes",
    category: "Children's Home (family-based care)",
    gender: "all",
    residential: true,
    costType: "free",
    services: ["Family-based child care", "Education", "Healthcare"],
    city: "Bengaluru",
    district: "Bengaluru",
    state: "Karnataka",
    website: "https://www.soschildrensvillages.in/sos-children-s-village-bangalore/",
  },
  {
    slug: "sos-chennai",
    name: "SOS Children's Village, Chennai",
    careCategorySlug: "childrens-homes",
    category: "Children's Home (family-based care)",
    gender: "all",
    residential: true,
    costType: "free",
    services: ["Family-based child care", "Education", "Healthcare"],
    city: "Chennai",
    district: "Chennai",
    state: "Tamil Nadu",
    website: "https://www.soschildrensvillages.in/sos-children-s-village-chennai/",
  },
  {
    slug: "sos-hyderabad",
    name: "SOS Children's Village, Hyderabad",
    careCategorySlug: "childrens-homes",
    category: "Children's Home (family-based care)",
    gender: "all",
    residential: true,
    costType: "free",
    services: ["Family-based child care", "Education", "Healthcare"],
    city: "Hyderabad",
    district: "Hyderabad",
    state: "Telangana",
    website: "https://www.soschildrensvillages.in/sos-children-s-village-hyderabad/",
  },
  {
    slug: "sos-kolkata",
    name: "SOS Children's Village, Kolkata",
    careCategorySlug: "childrens-homes",
    category: "Children's Home (family-based care)",
    gender: "all",
    residential: true,
    costType: "free",
    services: ["Family-based child care", "Education", "Healthcare"],
    city: "Kolkata",
    district: "Kolkata",
    state: "West Bengal",
    website: "https://www.soschildrensvillages.in/sos-children-s-village-kolkata/",
  },
  {
    slug: "sos-bhopal",
    name: "SOS Children's Village, Bhopal",
    careCategorySlug: "childrens-homes",
    category: "Children's Home (family-based care)",
    gender: "all",
    residential: true,
    costType: "free",
    services: ["Family-based child care", "Education", "Healthcare"],
    city: "Bhopal",
    district: "Bhopal",
    state: "Madhya Pradesh",
    website: "https://www.soschildrensvillages.in/sos-children-s-village-bhopal/",
  },
  {
    slug: "sos-thrissur",
    name: "SOS Children's Village, Thrissur",
    careCategorySlug: "childrens-homes",
    category: "Children's Home (family-based care)",
    gender: "all",
    residential: true,
    costType: "free",
    services: ["Family-based child care", "Education", "Healthcare"],
    city: "Thrissur",
    district: "Thrissur",
    state: "Kerala",
    website: "https://www.soschildrensvillages.in/sos-children-s-village-thrissur/",
  },

  /* ---- HelpAge India — Senior Care Homes (model homes for disadvantaged
     elders). From helpageindia.org/our-work/agecare/senior-care-homes/. ---- */
  {
    slug: "helpage-patiala",
    name: "HelpAge India — Senior Care Home, Patiala",
    careCategorySlug: "old-age-homes",
    category: "Senior care home (charitable)",
    gender: "all",
    residential: true,
    costType: "mixed",
    services: ["Residential elder care", "Medical care"],
    city: "Patiala",
    district: "Patiala",
    state: "Punjab",
    website: "https://www.helpageindia.org/our-work/agecare/senior-care-homes/",
  },
  {
    slug: "helpage-gurdaspur",
    name: "HelpAge India — Senior Care Home, Gurdaspur",
    careCategorySlug: "old-age-homes",
    category: "Senior care home (charitable)",
    gender: "all",
    residential: true,
    costType: "mixed",
    services: ["Residential elder care", "Medical care"],
    city: "Gurdaspur",
    district: "Gurdaspur",
    state: "Punjab",
    website: "https://www.helpageindia.org/our-work/agecare/senior-care-homes/",
  },
  {
    slug: "helpage-cuddalore",
    name: "HelpAge India — Senior Care Home, Cuddalore",
    careCategorySlug: "old-age-homes",
    category: "Senior care home (charitable)",
    gender: "all",
    residential: true,
    costType: "mixed",
    services: ["Residential elder care", "Medical care"],
    city: "Cuddalore",
    district: "Cuddalore",
    state: "Tamil Nadu",
    website: "https://www.helpageindia.org/our-work/agecare/senior-care-homes/",
  },
  {
    slug: "helpage-kolkata",
    name: "HelpAge India — Senior Care Home, Kolkata",
    careCategorySlug: "old-age-homes",
    category: "Senior care home (charitable)",
    gender: "all",
    residential: true,
    costType: "mixed",
    services: ["Residential elder care", "Medical care"],
    city: "Kolkata",
    district: "Kolkata",
    state: "West Bengal",
    website: "https://www.helpageindia.org/our-work/agecare/senior-care-homes/",
  },

  /* ---- Ramakrishna Math, Barisha — Home for the Aged (Kolkata). ---- */
  {
    slug: "rk-barisha-kolkata",
    name: "Ramakrishna Math Barisha — Home for the Aged, Kolkata",
    careCategorySlug: "old-age-homes",
    category: "Old-age Home (charitable)",
    gender: "all",
    residential: true,
    costType: "mixed",
    services: ["Residential care", "Medical care"],
    city: "Kolkata",
    district: "Kolkata",
    state: "West Bengal",
    website: "https://ramakrishnamathbarisha.com/old-age-home/",
  },

  /* ---- Mental health / psychiatric rehabilitation ---- */
  {
    slug: "banyan-chennai",
    name: "The Banyan — Emergency Care & Recovery Centre, Chennai",
    careCategorySlug: "psychiatric-rehabilitation",
    category: "Mental health care & recovery (homeless / destitute)",
    gender: "all",
    residential: true,
    costType: "free",
    services: ["Emergency mental health care", "Inpatient & recovery care", "Rehabilitation & reintegration"],
    city: "Chennai",
    district: "Chennai",
    state: "Tamil Nadu",
    website: "https://thebanyan.org/",
  },
  {
    slug: "rfs-bangalore",
    name: "Richmond Fellowship Society (India), Bengaluru — Psychiatric Rehabilitation",
    careCategorySlug: "psychiatric-rehabilitation",
    category: "Psychiatric rehabilitation (halfway / long-stay / day care)",
    gender: "all",
    residential: true,
    costType: "mixed",
    services: ["Halfway home", "Long-stay home", "Day-care rehabilitation"],
    city: "Bengaluru",
    district: "Bengaluru",
    state: "Karnataka",
    website: "https://www.rfsbangalore.ngo/",
  },
  {
    slug: "rfs-vishwas-delhi",
    name: "Richmond Fellowship Society (Vishwas), Delhi-NCR — Psychiatric Rehabilitation",
    careCategorySlug: "psychiatric-rehabilitation",
    category: "Psychiatric rehabilitation (halfway home)",
    gender: "all",
    residential: true,
    costType: "mixed",
    services: ["Halfway home", "Psychosocial rehabilitation"],
    address: "Knowledge Park III, Greater Noida",
    city: "Greater Noida",
    district: "Gautam Buddha Nagar",
    state: "Uttar Pradesh",
    pincode: "201310",
    website: "https://rfsdelhi.in/",
  },
  {
    slug: "rfs-lucknow",
    name: "Richmond Fellowship Society (India), Lucknow — Psychiatric Rehabilitation",
    careCategorySlug: "psychiatric-rehabilitation",
    category: "Psychiatric rehabilitation",
    gender: "all",
    residential: true,
    costType: "mixed",
    services: ["Psychosocial rehabilitation"],
    city: "Lucknow",
    district: "Lucknow",
    state: "Uttar Pradesh",
    website: "https://rfsindia.ngo/",
  },

  /* ---- Women's support & shelter ---- */
  {
    slug: "snehalaya-ahmednagar",
    name: "Snehalaya — Snehadhar Women's Refuge, Ahmednagar",
    careCategorySlug: "womens-support",
    category: "Shelter & rehabilitation for women in distress",
    gender: "female",
    residential: true,
    costType: "free",
    services: ["Shelter", "Counselling", "Rehabilitation", "Support for trafficking/violence survivors"],
    city: "Ahmednagar",
    district: "Ahmednagar",
    state: "Maharashtra",
    website: "https://www.snehalaya.org/snehadhar",
  },
  {
    slug: "snehalaya-pune",
    name: "Snehalaya — Snehadhar, Pune",
    careCategorySlug: "womens-support",
    category: "Shelter & rehabilitation for women in distress",
    gender: "female",
    residential: true,
    costType: "free",
    services: ["Shelter", "Counselling", "Rehabilitation"],
    city: "Pune",
    district: "Pune",
    state: "Maharashtra",
    website: "https://www.snehalaya.org/post/snehadhar-pune",
  },
  {
    slug: "swayam-kolkata",
    name: "Swayam, Kolkata — Support for Women Facing Violence",
    careCategorySlug: "womens-support",
    category: "Support services for women affected by violence",
    gender: "female",
    residential: false,
    costType: "free",
    services: ["Counselling", "Legal support", "Shelter referral", "Vocational support"],
    city: "Kolkata",
    district: "Kolkata",
    state: "West Bengal",
    website: "https://www.swayam.info/",
  },
  {
    slug: "shakti-shalini-delhi",
    name: "Shakti Shalini — Pehchan Shelter Home, Delhi",
    careCategorySlug: "womens-support",
    category: "Shelter home for women in distress",
    gender: "female",
    residential: true,
    costType: "free",
    services: ["Shelter", "Crisis intervention", "Counselling", "Helpline"],
    city: "New Delhi",
    district: "New Delhi",
    state: "Delhi",
    website: "https://shaktishalini.org/pehchan-shelter-home/",
  },
  {
    slug: "maher-pune",
    name: "Maher — Home for Destitute Women, Men & Children, near Pune",
    careCategorySlug: "womens-support",
    category: "Interfaith home for the destitute (women, children, mentally ill)",
    gender: "all",
    residential: true,
    costType: "free",
    services: ["Shelter", "Rehabilitation", "Care for destitute & mentally ill", "Child support"],
    address: "Vadhu Budruk",
    city: "Vadhu Budruk",
    district: "Pune",
    state: "Maharashtra",
    website: "https://maherashram.org/",
  },
  {
    slug: "sneha-mumbai",
    name: "SNEHA — Women & Children (Violence Prevention & Response), Mumbai",
    careCategorySlug: "womens-support",
    category: "Support for women & children facing violence",
    gender: "female",
    residential: false,
    costType: "free",
    services: ["Crisis intervention", "Counselling", "Community outreach", "Health support"],
    city: "Mumbai",
    district: "Mumbai",
    state: "Maharashtra",
    website: "https://snehamumbai.org/",
  },

  /* ---- Disability rehabilitation & special education ---- */
  {
    slug: "bpa-ahmedabad",
    name: "Blind People's Association (BPA), Ahmedabad",
    careCategorySlug: "therapy-rehab-centers",
    category: "Comprehensive disability rehabilitation & special education",
    gender: "all",
    residential: false,
    costType: "mixed",
    services: ["Special education", "Rehabilitation", "Skill training", "Community-based rehabilitation"],
    city: "Ahmedabad",
    district: "Ahmedabad",
    state: "Gujarat",
    website: "https://bpaindia.org/",
  },
  {
    slug: "nab-delhi",
    name: "National Association for the Blind (NAB), Delhi",
    careCategorySlug: "therapy-rehab-centers",
    category: "Rehabilitation & education for the visually impaired",
    gender: "all",
    residential: false,
    costType: "mixed",
    services: ["Early intervention", "Inclusive schooling", "Rehabilitation (all ages)", "Home for the aged blind"],
    city: "New Delhi",
    district: "New Delhi",
    state: "Delhi",
    website: "https://www.nabdelhi.in/",
  },
  {
    slug: "amar-jyoti-delhi",
    name: "Amar Jyoti Charitable Trust, Delhi",
    careCategorySlug: "special-schools",
    category: "Integrated education & rehabilitation for children with disabilities",
    gender: "all",
    residential: false,
    costType: "mixed",
    services: ["Inclusive/integrated school", "Therapy & rehabilitation", "Vocational training"],
    city: "New Delhi",
    district: "New Delhi",
    state: "Delhi",
    website: "https://www.amarjyoti.org.in/",
  },
  {
    slug: "vidyasagar-chennai",
    name: "Vidya Sagar, Chennai — Disability (Cerebral Palsy & Special Needs)",
    careCategorySlug: "therapy-rehab-centers",
    category: "Therapy & rehabilitation for persons with disabilities",
    gender: "all",
    residential: false,
    costType: "mixed",
    services: ["Therapy", "Special education", "Assistive technology", "Caregiver training"],
    city: "Chennai",
    district: "Chennai",
    state: "Tamil Nadu",
    website: "https://vidyasagar.co.in/",
  },

  /* ---- Widow support (Vrindavan) ---- */
  {
    slug: "madham-vrindavan",
    name: "Ma Dham Mahila Ashram (Guild for Service), Vrindavan",
    careCategorySlug: "widow-support-homes",
    category: "Shelter & rehabilitation for widows / abandoned women",
    gender: "female",
    residential: true,
    costType: "free",
    services: ["Residential care", "Meals", "Medical care", "Livelihood / income generation"],
    address: "Chaitanya Vihar, Vrindavan",
    city: "Vrindavan",
    district: "Mathura",
    state: "Uttar Pradesh",
    website: "https://guildforservice.org/",
  },
  {
    slug: "sulabh-widows-vrindavan",
    name: "Sulabh International — Widow Welfare, Vrindavan",
    careCategorySlug: "widow-support-homes",
    category: "Widow welfare & support (stipend, food, medical camps)",
    gender: "female",
    residential: true,
    costType: "free",
    services: ["Monthly stipend", "Food & nutrition", "Medical camps", "Support in government ashrams"],
    city: "Vrindavan",
    district: "Mathura",
    state: "Uttar Pradesh",
    website: "https://www.sulabhinternational.org/",
  },

  /* ---- Homeless / destitute & dying ---- */
  {
    slug: "moc-nirmal-hriday-kolkata",
    name: "Missionaries of Charity — Nirmal Hriday (Kalighat Home for the Dying), Kolkata",
    careCategorySlug: "homeless-rehabilitation",
    category: "Home for the sick & dying destitute",
    gender: "all",
    residential: true,
    costType: "free",
    services: ["Shelter for destitute", "Palliative & nursing care", "Meals"],
    address: "Kalighat",
    city: "Kolkata",
    district: "Kolkata",
    state: "West Bengal",
    website: "https://missionariesofcharity.org/what-we-do/homes-for-the-abandoned/",
  },
  {
    slug: "moc-prem-dan-kolkata",
    name: "Missionaries of Charity — Prem Dan, Kolkata",
    careCategorySlug: "homeless-rehabilitation",
    category: "Home for the sick, destitute & mentally ill",
    gender: "all",
    residential: true,
    costType: "free",
    services: ["Shelter for destitute", "Care for sick & mentally ill", "Meals"],
    city: "Kolkata",
    district: "Kolkata",
    state: "West Bengal",
    website: "https://missionariesofcharity.org/what-we-do/homes-for-the-abandoned/",
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
