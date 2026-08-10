/**
 * Shared SAMPLE government schemes (used by the DB seed and the Care Finder's
 * offline fallback). Real scheme names, but fields are NOT authoritative and are
 * seeded as `needs_verification` — confirm against the official source before
 * treating any eligibility/benefit as final.
 */
export type SampleScheme = {
  id: string;
  schemeName: string;
  governmentLevel: "central" | "state";
  state?: string;
  ministry?: string;
  department?: string;
  beneficiaryCategory: string;
  schemeGroupSlug: string; // matches scheme_categories.slug
  eligibility: string;
  benefits: string;
  documentsRequired: string[];
  applicationUrl: string;
  officialSourceUrl: string;
  sourceKey?: string; // government_sources key (for seed linkage)
};

export const SAMPLE_SCHEMES: SampleScheme[] = [
  {
    id: "a1111111-1111-4111-8111-111111111111",
    schemeName: "Indira Gandhi National Old Age Pension Scheme (IGNOAPS)",
    governmentLevel: "central",
    ministry: "Ministry of Rural Development",
    department: "National Social Assistance Programme (NSAP)",
    beneficiaryCategory: "Senior Citizens (BPL)",
    schemeGroupSlug: "senior_citizens",
    eligibility: "BPL senior citizens (verify age slabs and criteria on the official portal).",
    benefits: "Monthly old-age pension (amount varies by age slab and state top-up).",
    documentsRequired: ["Age proof", "BPL/ration card", "Bank account details"],
    applicationUrl: "https://nsap.nic.in/",
    officialSourceUrl: "https://nsap.nic.in/",
    sourceKey: "nsap",
  },
  {
    id: "a2222222-2222-4222-8222-222222222222",
    schemeName: "Indira Gandhi National Widow Pension Scheme (IGNWPS)",
    governmentLevel: "central",
    ministry: "Ministry of Rural Development",
    department: "National Social Assistance Programme (NSAP)",
    beneficiaryCategory: "Widows (BPL)",
    schemeGroupSlug: "widows",
    eligibility: "BPL widows within the notified age range (verify on official portal).",
    benefits: "Monthly widow pension (amount varies by state top-up).",
    documentsRequired: ["Age proof", "Death certificate of spouse", "BPL card", "Bank details"],
    applicationUrl: "https://nsap.nic.in/",
    officialSourceUrl: "https://nsap.nic.in/",
    sourceKey: "nsap",
  },
  {
    id: "a3333333-3333-4333-8333-333333333333",
    schemeName: "Mission Vatsalya (Child Protection Services)",
    governmentLevel: "central",
    ministry: "Ministry of Women & Child Development",
    department: "Mission Vatsalya",
    beneficiaryCategory: "Children in need of care and protection",
    schemeGroupSlug: "children",
    eligibility: "Children in need of care and protection (see official guidelines).",
    benefits: "Institutional and non-institutional child care and protection services.",
    documentsRequired: [],
    applicationUrl: "https://wcd.gov.in/",
    officialSourceUrl: "https://wcd.gov.in/",
    sourceKey: "vatsalya",
  },
  {
    id: "a4444444-4444-4444-8444-444444444444",
    schemeName: "UP Old Age Pension (Vriddhavastha Pension)",
    governmentLevel: "state",
    state: "Uttar Pradesh",
    department: "Social Welfare Department, Uttar Pradesh",
    beneficiaryCategory: "Senior Citizens (eligible households)",
    schemeGroupSlug: "senior_citizens",
    eligibility: "UP resident senior citizens meeting income criteria (verify on portal).",
    benefits: "Monthly state old-age pension.",
    documentsRequired: [],
    applicationUrl: "https://sspy-up.gov.in/",
    officialSourceUrl: "https://sspy-up.gov.in/",
    sourceKey: "up_social_welfare",
  },
];
