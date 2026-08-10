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
  applicationProcess?: string;
  incomeLimitInr?: number;
  sourceLastUpdated?: string; // ISO date of the cited source document
  // Defaults to "needs_verification"; set higher only when fields are taken
  // directly from an official government source (record match, NOT a quality
  // endorsement).
  verificationStatus?:
    | "government_verified"
    | "registration_verified"
    | "phone_verified"
    | "user_submitted"
    | "needs_verification";
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
    department: "Mission Vatsalya (erstwhile Child Protection Services / ICPS)",
    beneficiaryCategory:
      "Children in need of care & protection; children in conflict with law",
    schemeGroupSlug: "children",
    eligibility:
      "For children in difficult circumstances under the Juvenile Justice (Care & Protection of Children) Act, 2015 — “Children in Need of Care and Protection” and “Children in Conflict with Law”. Non-institutional support (Sponsorship / Foster Care / After Care) covers, for example: children whose mother is a widow, divorced or abandoned; orphans living with extended family; children whose parents are terminally ill or unable to provide care; and children who are homeless, trafficked, in child labour, victims of child marriage, HIV/AIDS-affected, with disabilities, missing/runaway or living on the street. Children under PM CARES for Children are also covered. Preventive sponsorship has a family-income ceiling of ₹72,000/year (rural) or ₹96,000/year (urban/others).",
    benefits:
      "Institutional care via Child Care Institutions — children’s homes, open shelters, observation & special homes and places of safety — and adoption through Specialized Adoption Agencies (CARA). Non-institutional care: Sponsorship, Foster Care and After Care, with a monthly grant of ₹4,000 per child; After Care supports young people leaving institutions at age 18, up to 21 and extendable to 23, to become self-dependent. A 24×7 Child Helpline (1098) and emergency outreach are also part of the scheme. (Financial norms are per the 2022 Mission Vatsalya guidelines — confirm current amounts with your DCPU.)",
    documentsRequired: [
      "Child’s birth / age proof",
      "Bank or post-office account in the child’s name (operated by the guardian)",
      "Family income certificate (for preventive sponsorship)",
      "Referral by the Child Welfare Committee (CWC) or District Child Protection Unit (DCPU)",
    ],
    applicationProcess:
      "Access is through your District Child Protection Unit (DCPU) or the Child Welfare Committee (CWC). A sponsorship / foster-care request can be filed on the Mission Vatsalya portal by the DCPU or the child’s family; the District Sponsorship & Foster Care Approval Committee (SFCAC) reviews cases and the District Magistrate sanctions support, credited monthly to an account in the child’s name. In an emergency, dial Child Helpline 1098.",
    incomeLimitInr: 96000,
    applicationUrl: "https://wcd.gov.in/",
    officialSourceUrl: "https://wcd.gov.in/",
    sourceLastUpdated: "2022-04-01",
    verificationStatus: "government_verified",
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
