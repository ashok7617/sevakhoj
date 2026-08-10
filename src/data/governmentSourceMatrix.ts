/**
 * Government Data Source Master Matrix — the first Phase-0 research deliverable
 * (see memory.md). This typed module is the SOURCE OF TRUTH for the matrix.
 *
 *  - CENTRAL / UP rows are individually researched (verified URLs, formats,
 *    reuse terms) with a `lastChecked` date.
 *  - The remaining 27 states + 8 UTs are generated as a `skeleton` — one row
 *    per core department — defining the research worklist. Skeleton rows use a
 *    `pending:` sentinel URL (no real URL is invented) until researched.
 *
 * Import into the DB with:  npm run db:import-sources
 * Export a shareable CSV with:  npm run matrix:csv
 */

export type GovLevel = "central" | "state" | "ut" | "district" | "local";
export type Category = "schemes" | "facilities" | "registration" | "mixed";
export type ResearchStatus = "researched" | "partial" | "skeleton";

export type MatrixRow = {
  key: string;
  governmentLevel: GovLevel;
  state?: string;
  ministry?: string;
  department?: string;
  category: Category;
  sourceName: string;
  sourceUrl: string; // real URL, or `pending:...` sentinel for skeleton rows
  apiUrl?: string;
  hasApi: boolean;
  formats: string[]; // api | csv | excel | json | xml | pdf | html
  hasSchemes: boolean;
  hasFacilityDb: boolean;
  hasRegistrationData: boolean;
  dataFields: string[];
  updateFrequency?: string;
  reuseLicense?: string;
  accessMethod?: string;
  researchStatus: ResearchStatus;
  notes?: string;
  lastChecked?: string; // ISO date (YYYY-MM-DD)
};

const CHECKED = "2026-08-09";

/* ============================================================= CENTRAL */

export const CENTRAL_SOURCES: MatrixRow[] = [
  {
    key: "data-gov-in",
    governmentLevel: "central",
    ministry: "MeitY / NIC",
    department: "Open Government Data (OGD) Platform India",
    category: "mixed",
    sourceName: "data.gov.in",
    sourceUrl: "https://www.data.gov.in",
    apiUrl: "https://api.data.gov.in",
    hasApi: true,
    formats: ["api", "csv", "excel", "json", "xml"],
    hasSchemes: false,
    hasFacilityDb: false,
    hasRegistrationData: false,
    dataFields: ["Varied datasets published by ministries/states"],
    updateFrequency: "Varies by dataset",
    reuseLicense:
      "GODL-India (Government Open Data License – India): commercial + non-commercial reuse permitted, with attribution.",
    accessMethod: "Free API key (32-char) or bulk download",
    researchStatus: "researched",
    notes:
      "Single-point access to datasets from all ministries/states. Best programmatic entry point; search for facility/scheme datasets here first.",
    lastChecked: CHECKED,
  },
  {
    key: "myscheme",
    governmentLevel: "central",
    ministry: "MeitY / NeGD",
    department: "myScheme",
    category: "schemes",
    sourceName: "myScheme",
    sourceUrl: "https://www.myscheme.gov.in",
    hasApi: false,
    formats: ["html"],
    hasSchemes: true,
    hasFacilityDb: false,
    hasRegistrationData: false,
    dataFields: [
      "Scheme name",
      "Category",
      "Level (central/state)",
      "Eligibility",
      "Benefits",
      "Documents required",
      "Application URL",
      "State/UT",
    ],
    updateFrequency: "Ongoing",
    reuseLicense: "Reuse terms not stated — confirm before redistribution.",
    accessMethod: "Portal search (no documented open API)",
    researchStatus: "researched",
    notes:
      "2300+ Central & State/UT schemes across 15 categories. Internal JSON API exists but is not officially published — do not scrape without confirming terms.",
    lastChecked: CHECKED,
  },
  {
    key: "india-gov-in",
    governmentLevel: "central",
    ministry: "MeitY / NIC",
    department: "National Portal of India",
    category: "mixed",
    sourceName: "India.gov.in",
    sourceUrl: "https://www.india.gov.in",
    hasApi: false,
    formats: ["html"],
    hasSchemes: true,
    hasFacilityDb: false,
    hasRegistrationData: false,
    dataFields: ["Government services directory", "Scheme links", "Department links"],
    reuseLicense: "Confirm; largely links to source departments.",
    accessMethod: "Portal",
    researchStatus: "partial",
    notes: "Directory/aggregator; use to discover authoritative department sources.",
    lastChecked: CHECKED,
  },
  {
    key: "ngo-darpan",
    governmentLevel: "central",
    ministry: "NITI Aayog / NIC",
    department: "NGO DARPAN",
    category: "registration",
    sourceName: "NGO DARPAN",
    sourceUrl: "https://ngodarpan.gov.in",
    hasApi: false,
    formats: ["html"],
    hasSchemes: true,
    hasFacilityDb: false,
    hasRegistrationData: true,
    dataFields: [
      "NGO/VO name",
      "DARPAN ID (Unique ID)",
      "Registration type",
      "Sector/field of work",
      "State/district",
      "Contact",
    ],
    updateFrequency: "Ongoing (voluntary registration)",
    reuseLicense: "Confirm; some NGO data mirrored on data.gov.in.",
    accessMethod: "Portal search (no official public API)",
    researchStatus: "researched",
    notes:
      "National NGO/VO database + grant-scheme listings. Primary source for NGO discovery & the org-verification badge.",
    lastChecked: CHECKED,
  },
  {
    key: "nsap",
    governmentLevel: "central",
    ministry: "Ministry of Rural Development",
    department: "National Social Assistance Programme (NSAP)",
    category: "schemes",
    sourceName: "NSAP Portal",
    sourceUrl: "https://nsap.nic.in",
    hasApi: false,
    formats: ["html", "pdf"],
    hasSchemes: true,
    hasFacilityDb: false,
    hasRegistrationData: false,
    dataFields: [
      "Scheme (IGNOAPS/IGNWPS/IGNDPS/NFBS/Annapurna)",
      "Beneficiary category",
      "Eligibility",
      "Benefit amount",
      "State/district reports",
    ],
    updateFrequency: "Periodic",
    reuseLicense: "Public scheme information; confirm bulk reuse.",
    accessMethod: "Portal + reports; beneficiary data via state portals",
    researchStatus: "researched",
    notes:
      "Central pensions for old age (IGNOAPS), widows (IGNWPS), disability (IGNDPS), plus NFBS & Annapurna. Implemented via states.",
    lastChecked: CHECKED,
  },
  {
    key: "mission-vatsalya",
    governmentLevel: "central",
    ministry: "Ministry of Women & Child Development",
    department: "Mission Vatsalya",
    category: "facilities",
    sourceName: "Mission Vatsalya",
    sourceUrl: "https://missionvatsalya.wcd.gov.in",
    hasApi: false,
    formats: ["html", "pdf"],
    hasSchemes: true,
    hasFacilityDb: true,
    hasRegistrationData: true,
    dataFields: [
      "Child Care Institution (CCI) name",
      "Type (children's home, open shelter, observation home, SAA, etc.)",
      "JJ Act registration",
      "Capacity",
      "District/state",
    ],
    updateFrequency: "Ongoing",
    reuseLicense: "Restricted; child-safety sensitive.",
    accessMethod: "Portal (state/district/institution login) + guideline PDFs",
    researchStatus: "researched",
    notes:
      "Child Care Institutions under the JJ (Care & Protection) Act 2015. Requires strong verification & safety handling for children's data.",
    lastChecked: CHECKED,
  },
  {
    key: "cara",
    governmentLevel: "central",
    ministry: "Ministry of Women & Child Development",
    department: "Central Adoption Resource Authority (CARA)",
    category: "facilities",
    sourceName: "CARA",
    sourceUrl: "https://cara.wcd.gov.in",
    hasApi: false,
    formats: ["html", "pdf"],
    hasSchemes: false,
    hasFacilityDb: true,
    hasRegistrationData: true,
    dataFields: [
      "Specialized Adoption Agency (SAA) name",
      "State/district",
      "Recognition status",
      "Contact",
    ],
    updateFrequency: "Ongoing",
    reuseLicense: "Restricted; adoption-sensitive.",
    accessMethod: "Portal + PDF lists",
    researchStatus: "researched",
    notes: "Adoption regulator; authoritative list of Specialized Adoption Agencies.",
    lastChecked: CHECKED,
  },
  {
    key: "dosje-seniorcare-sage",
    governmentLevel: "central",
    ministry: "Ministry of Social Justice & Empowerment",
    department: "Dept. of Social Justice & Empowerment — Senior Citizens / SAGE",
    category: "mixed",
    sourceName: "SAGE (Seniorcare Ageing Growth Engine)",
    sourceUrl: "https://scw.dosje.gov.in",
    hasApi: false,
    formats: ["html"],
    hasSchemes: true,
    hasFacilityDb: false,
    hasRegistrationData: false,
    dataFields: ["Senior-care products & services", "Startups", "IPSrC (old-age home grants)"],
    reuseLicense: "Confirm.",
    accessMethod: "Portal",
    researchStatus: "researched",
    notes:
      "SAGE lists credible senior-care startups/services. IPSrC (Integrated Programme for Senior Citizens) funds old-age homes via NGOs. Elderline helpline 14567.",
    lastChecked: CHECKED,
  },
  {
    key: "depwd-manoashraya",
    governmentLevel: "central",
    ministry: "Ministry of Social Justice & Empowerment",
    department: "DEPwD — Manoashraya dashboard",
    category: "facilities",
    sourceName: "Manoashraya (Mental Health Institutions dashboard)",
    sourceUrl: "https://halfwayhomes.disabilityaffairs.gov.in",
    hasApi: false,
    formats: ["html"],
    hasSchemes: false,
    hasFacilityDb: true,
    hasRegistrationData: false,
    dataFields: [
      "Mental health institution",
      "Rehabilitation home",
      "Halfway home",
      "State/UT",
      "Counts/occupancy",
    ],
    updateFrequency: "Uploaded by States/UTs",
    reuseLicense: "Government dashboard; confirm reuse.",
    accessMethod: "Portal / dashboard",
    researchStatus: "researched",
    notes:
      "DEPwD dashboard created per Supreme Court directions — mental-health institutions, rehabilitation & halfway homes. Key source for the mental-health category.",
    lastChecked: CHECKED,
  },
  {
    key: "depwd",
    governmentLevel: "central",
    ministry: "Ministry of Social Justice & Empowerment",
    department: "Dept. of Empowerment of Persons with Disabilities (DEPwD)",
    category: "mixed",
    sourceName: "DEPwD",
    sourceUrl: "https://depwd.gov.in",
    hasApi: false,
    formats: ["html", "pdf"],
    hasSchemes: true,
    hasFacilityDb: true,
    hasRegistrationData: false,
    dataFields: [
      "Disability schemes (ADIP, DDRS)",
      "District Disability Rehabilitation Centres (DDRCs)",
      "National Institutes",
    ],
    reuseLicense: "Confirm.",
    accessMethod: "Portal + PDF",
    researchStatus: "researched",
    notes: "Disability schemes, DDRCs, National Institutes, assistive-device (ADIP) scheme.",
    lastChecked: CHECKED,
  },
  {
    key: "udid-swavlamban",
    governmentLevel: "central",
    ministry: "Ministry of Social Justice & Empowerment",
    department: "DEPwD — Unique Disability ID (UDID)",
    category: "registration",
    sourceName: "UDID / Swavlamban Card",
    sourceUrl: "https://www.swavlambancard.gov.in",
    hasApi: false,
    formats: ["html"],
    hasSchemes: false,
    hasFacilityDb: false,
    hasRegistrationData: true,
    dataFields: [
      "PwD name",
      "UDID number",
      "Disability type & %",
      "District",
      "Disability certificate",
    ],
    reuseLicense: "Personal data — NOT open. Aggregate statistics only.",
    accessMethod: "Portal (individual login)",
    researchStatus: "researched",
    notes:
      "National PwD registration database + disability certificate issuance. Do not ingest personal records; use only aggregate stats.",
    lastChecked: CHECKED,
  },
  {
    key: "mission-shakti",
    governmentLevel: "central",
    ministry: "Ministry of Women & Child Development",
    department: "Mission Shakti (Sambal & Samarthya)",
    category: "mixed",
    sourceName: "Mission Shakti",
    sourceUrl: "https://missionshakti.wcd.gov.in",
    hasApi: false,
    formats: ["html"],
    hasSchemes: true,
    hasFacilityDb: true,
    hasRegistrationData: false,
    dataFields: [
      "One Stop Centre (Sakhi)",
      "Women Helpline 181",
      "Shakti Sadan (women in distress/widows)",
      "Sakhi Niwas (working women hostel)",
    ],
    reuseLicense: "Confirm.",
    accessMethod: "Portal",
    researchStatus: "partial",
    notes:
      "Women-safety & empowerment. Shakti Sadan supports women in distress incl. widows. Confirm exact portal URL/datasets.",
    lastChecked: CHECKED,
  },
  {
    key: "mohua-nulm-shelters",
    governmentLevel: "central",
    ministry: "Ministry of Housing & Urban Affairs",
    department: "DAY-NULM — Shelters for Urban Homeless (SUH)",
    category: "facilities",
    sourceName: "DAY-NULM (Urban Homeless Shelters)",
    sourceUrl: "https://nulm.gov.in",
    hasApi: false,
    formats: ["html", "pdf"],
    hasSchemes: true,
    hasFacilityDb: true,
    hasRegistrationData: false,
    dataFields: ["Shelter for Urban Homeless", "City/ULB", "Capacity", "Type"],
    reuseLicense: "Confirm.",
    accessMethod: "Portal + reports",
    researchStatus: "partial",
    notes: "Primary source for the homeless/destitute category in urban areas.",
    lastChecked: CHECKED,
  },
  {
    key: "mohfw-mental-health",
    governmentLevel: "central",
    ministry: "Ministry of Health & Family Welfare",
    department: "National Mental Health Programme / Tele-MANAS",
    category: "mixed",
    sourceName: "MoHFW — Mental Health",
    sourceUrl: "https://www.mohfw.gov.in",
    hasApi: false,
    formats: ["html", "pdf"],
    hasSchemes: true,
    hasFacilityDb: true,
    hasRegistrationData: false,
    dataFields: ["Mental health programmes", "Tele-MANAS (14416)", "Hospitals/facilities"],
    reuseLicense: "Confirm.",
    accessMethod: "Portal",
    researchStatus: "partial",
    notes: "National Mental Health Programme; Tele-MANAS helpline 14416.",
    lastChecked: CHECKED,
  },
];

/** Central ministries named in memory.md worth tracking, base sites only. */
export const CENTRAL_MINISTRY_STUBS: MatrixRow[] = (
  [
    ["mord", "Ministry of Rural Development", "https://rural.nic.in"],
    ["mohua", "Ministry of Housing & Urban Affairs", "https://mohua.gov.in"],
    ["molabour", "Ministry of Labour & Employment", "https://labour.gov.in"],
    ["motribal", "Ministry of Tribal Affairs", "https://tribal.nic.in"],
    ["mominority", "Ministry of Minority Affairs", "https://minorityaffairs.gov.in"],
    ["moe", "Ministry of Education", "https://www.education.gov.in"],
    ["moayush", "Ministry of Ayush", "https://ayush.gov.in"],
    ["msde", "Ministry of Skill Development & Entrepreneurship", "https://www.msde.gov.in"],
  ] as const
).map(([key, name, url]) => ({
  key,
  governmentLevel: "central" as const,
  ministry: name,
  department: name,
  category: "schemes" as const,
  sourceName: name,
  sourceUrl: url,
  hasApi: false,
  formats: ["html"],
  hasSchemes: true,
  hasFacilityDb: false,
  hasRegistrationData: false,
  dataFields: ["Ministry schemes & programmes (to be inventoried)"],
  accessMethod: "Portal",
  researchStatus: "partial" as const,
  notes: "Named in memory.md. Inventory relevant schemes/datasets for target beneficiary groups.",
  lastChecked: CHECKED,
}));

/* ================================================= UTTAR PRADESH (pilot) */

export const UP_SOURCES: MatrixRow[] = [
  {
    key: "up-sspy",
    governmentLevel: "state",
    state: "Uttar Pradesh",
    department: "Social Welfare Dept. — Integrated Pension Portal (SSPY)",
    category: "schemes",
    sourceName: "UP SSPY (Samajik Suraksha Pension Yojana)",
    sourceUrl: "https://sspy-up.gov.in",
    hasApi: false,
    formats: ["html"],
    hasSchemes: true,
    hasFacilityDb: false,
    hasRegistrationData: true,
    dataFields: [
      "Old-age pension",
      "Widow (Nirashrit Mahila) pension",
      "Disability pension",
      "Beneficiary lists (district/block)",
    ],
    updateFrequency: "Ongoing",
    reuseLicense: "Public beneficiary lists; confirm bulk reuse.",
    accessMethod: "Portal (pension application + beneficiary search)",
    researchStatus: "researched",
    notes:
      "Single portal for UP old-age, widow (Nirashrit Mahila) and disability pensions. Pilot priority for senior + widow groups.",
    lastChecked: CHECKED,
  },
  {
    key: "up-bal-vikas",
    governmentLevel: "state",
    state: "Uttar Pradesh",
    department: "Dept. of Women & Child Development / Bal Vikas Seva Evam Pushtahar",
    category: "mixed",
    sourceName: "UP Women & Child Development",
    sourceUrl: "https://balvikasup.gov.in",
    hasApi: false,
    formats: ["html", "pdf"],
    hasSchemes: true,
    hasFacilityDb: true,
    hasRegistrationData: true,
    dataFields: ["Child Care Institutions", "Sponsorship/Foster care", "Women & child schemes"],
    reuseLicense: "Confirm.",
    accessMethod: "Portal + PDF",
    researchStatus: "partial",
    notes: "UP CCIs & child/women schemes (Mission Vatsalya + Mission Shakti at state level). Confirm exact portal URL.",
    lastChecked: CHECKED,
  },
  {
    key: "up-divyangjan",
    governmentLevel: "state",
    state: "Uttar Pradesh",
    department: "Dept. for the Empowerment of Persons with Disabilities (Divyangjan)",
    category: "mixed",
    sourceName: "UP Divyangjan Sashaktikaran Vibhag",
    sourceUrl: "https://divyangjan.upsdc.gov.in",
    hasApi: false,
    formats: ["html"],
    hasSchemes: true,
    hasFacilityDb: true,
    hasRegistrationData: false,
    dataFields: ["Disability pension/schemes", "DDRCs", "Special schools"],
    reuseLicense: "Confirm.",
    accessMethod: "Portal",
    researchStatus: "partial",
    notes: "UP disability schemes and facilities. Confirm portal URL & datasets.",
    lastChecked: CHECKED,
  },
];

/* =================================================== STATE/UT SKELETON */

export const STATES: string[] = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

export const UNION_TERRITORIES: string[] = [
  "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi",
  "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

/** Core departments to track for every state/UT (maps to our care categories). */
const STANDARD_DEPARTMENTS: {
  dept: string;
  category: Category;
  hasSchemes: boolean;
  hasFacilityDb: boolean;
  hasRegistrationData: boolean;
  fields: string[];
}[] = [
  {
    dept: "Social Welfare Department",
    category: "mixed",
    hasSchemes: true,
    hasFacilityDb: true,
    hasRegistrationData: false,
    fields: ["Old-age/widow/disability pensions", "Old-age homes", "Welfare schemes"],
  },
  {
    dept: "Women & Child Development Department",
    category: "mixed",
    hasSchemes: true,
    hasFacilityDb: true,
    hasRegistrationData: true,
    fields: ["Child Care Institutions", "One Stop Centres", "Women & child schemes"],
  },
  {
    dept: "Health & Family Welfare Department",
    category: "facilities",
    hasSchemes: true,
    hasFacilityDb: true,
    hasRegistrationData: false,
    fields: ["Hospitals", "Mental health facilities", "Health schemes"],
  },
  {
    dept: "Disability / Divyangjan Commissionerate",
    category: "mixed",
    hasSchemes: true,
    hasFacilityDb: true,
    hasRegistrationData: false,
    fields: ["DDRCs", "Special schools", "Disability certificates & schemes"],
  },
  {
    dept: "Rural Development Department",
    category: "schemes",
    hasSchemes: true,
    hasFacilityDb: false,
    hasRegistrationData: false,
    fields: ["NSAP pension implementation", "Rural welfare schemes"],
  },
  {
    dept: "Urban Development / Municipal (Homeless Shelters)",
    category: "facilities",
    hasSchemes: false,
    hasFacilityDb: true,
    hasRegistrationData: false,
    fields: ["Shelters for Urban Homeless (DAY-NULM)", "Night shelters"],
  },
];

const slug = (s: string) =>
  s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function skeletonFor(jurisdiction: string, level: GovLevel): MatrixRow[] {
  return STANDARD_DEPARTMENTS.map((d) => ({
    key: `${slug(jurisdiction)}-${slug(d.dept)}`,
    governmentLevel: level,
    state: jurisdiction,
    department: d.dept,
    category: d.category,
    sourceName: `${jurisdiction} — ${d.dept}`,
    sourceUrl: `pending:${slug(jurisdiction)}/${slug(d.dept)}`,
    hasApi: false,
    formats: [],
    hasSchemes: d.hasSchemes,
    hasFacilityDb: d.hasFacilityDb,
    hasRegistrationData: d.hasRegistrationData,
    dataFields: d.fields,
    reuseLicense: undefined,
    accessMethod: undefined,
    researchStatus: "skeleton" as const,
    notes: "To research: confirm official portal URL, datasets, formats, reuse/licensing terms.",
  }));
}

/** Skeleton rows for every state/UT except UP (which has explicit rows above). */
export function skeletonRows(): MatrixRow[] {
  const rows: MatrixRow[] = [];
  for (const s of STATES) {
    if (s === "Uttar Pradesh") continue;
    rows.push(...skeletonFor(s, "state"));
  }
  for (const ut of UNION_TERRITORIES) {
    rows.push(...skeletonFor(ut, "ut"));
  }
  return rows;
}

/* ==================================================== FULL MATRIX ===== */

export const MATRIX: MatrixRow[] = [
  ...CENTRAL_SOURCES,
  ...CENTRAL_MINISTRY_STUBS,
  ...UP_SOURCES,
  ...skeletonRows(),
];

/** Small summary used by the importer and viewer. */
export function matrixSummary(rows: MatrixRow[] = MATRIX) {
  const by = (pred: (r: MatrixRow) => boolean) => rows.filter(pred).length;
  return {
    total: rows.length,
    researched: by((r) => r.researchStatus === "researched"),
    partial: by((r) => r.researchStatus === "partial"),
    skeleton: by((r) => r.researchStatus === "skeleton"),
    central: by((r) => r.governmentLevel === "central"),
    state: by((r) => r.governmentLevel === "state"),
    ut: by((r) => r.governmentLevel === "ut"),
  };
}
