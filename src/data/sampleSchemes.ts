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

  /* ---- Additional central schemes (needs_verification; confirm details on
     each official portal — added from public scheme information, not a single
     source document). ---- */
  {
    id: "b1111111-1111-4111-8111-111111111111",
    schemeName: "Atal Vayo Abhyuday Yojana (AVYAY) — incl. Elderline 14567",
    governmentLevel: "central",
    ministry: "Ministry of Social Justice & Empowerment",
    department: "Dept. of Social Justice & Empowerment",
    beneficiaryCategory: "Senior citizens (60+)",
    schemeGroupSlug: "senior_citizens",
    eligibility:
      "Senior citizens aged 60 and above. Individual components (senior/continuous care homes, maintenance, assistive devices) have their own criteria — verify on the official portal.",
    benefits:
      "Umbrella scheme for the elderly: support to old-age / continuous-care homes (IPSrC), physical aids & assisted-living devices, awareness, and the national Elderline helpline 14567 for information, guidance and grievance redressal.",
    documentsRequired: ["Age proof", "Aadhaar"],
    applicationUrl: "https://socialjustice.gov.in/",
    officialSourceUrl: "https://socialjustice.gov.in/",
  },
  {
    id: "b2222222-2222-4222-8222-222222222222",
    schemeName: "Rashtriya Vayoshri Yojana (RVY)",
    governmentLevel: "central",
    ministry: "Ministry of Social Justice & Empowerment",
    department: "Dept. of Social Justice & Empowerment",
    beneficiaryCategory: "Senior citizens (60+) — BPL or low income",
    schemeGroupSlug: "senior_citizens",
    eligibility:
      "Senior citizens aged 60 and above belonging to the BPL category, or with a monthly income not exceeding ₹15,000, who have an age-related loss of ability (low vision, hearing impairment, loss of teeth or locomotor difficulty). Beneficiaries are identified at ALIMCO assessment camps.",
    benefits:
      "Free assisted-living devices distributed through camps — walking sticks, elbow crutches, walkers, tripods/quadpods, hearing aids, wheelchairs, artificial dentures and spectacles.",
    documentsRequired: ["Age proof", "BPL card / income proof (≤ ₹15,000/month)", "Aadhaar"],
    applicationUrl: "https://socialjustice.gov.in/",
    officialSourceUrl: "https://socialjustice.gov.in/schemes/43",
    verificationStatus: "government_verified",
  },
  {
    id: "b3333333-3333-4333-8333-333333333333",
    schemeName: "National Family Benefit Scheme (NFBS)",
    governmentLevel: "central",
    ministry: "Ministry of Rural Development",
    department: "National Social Assistance Programme (NSAP)",
    beneficiaryCategory: "BPL families on death of the primary breadwinner",
    schemeGroupSlug: "low_income",
    eligibility:
      "BPL households where the primary breadwinner — the member whose earnings substantially supported the household — died while aged 18 to 64 (over 18 and under 65). One-time assistance to the surviving household.",
    benefits:
      "One-time lump-sum family benefit of ₹20,000 to the bereaved BPL household, paid by DBT to a bank / post-office account.",
    documentsRequired: ["Death certificate of the breadwinner", "BPL card", "Bank details"],
    applicationUrl: "https://nsap.nic.in/",
    officialSourceUrl: "https://nsap.nic.in/Guidelines/nfbs.pdf",
    sourceKey: "nsap",
    verificationStatus: "government_verified",
  },
  {
    id: "b4444444-4444-4444-8444-444444444444",
    schemeName: "Indira Gandhi National Disability Pension Scheme (IGNDPS)",
    governmentLevel: "central",
    ministry: "Ministry of Rural Development",
    department: "National Social Assistance Programme (NSAP)",
    beneficiaryCategory: "BPL persons with severe or multiple disabilities",
    schemeGroupSlug: "disability",
    eligibility:
      "BPL persons aged 18–79 with severe or multiple disabilities. Verify the disability threshold and criteria on the NSAP portal.",
    benefits:
      "Monthly disability pension (central contribution, plus state top-up where applicable).",
    documentsRequired: ["Disability certificate / UDID", "Age proof", "BPL card", "Bank details"],
    applicationUrl: "https://nsap.nic.in/",
    officialSourceUrl: "https://nsap.nic.in/",
    sourceKey: "nsap",
  },
  {
    id: "b5555555-5555-4555-8555-555555555555",
    schemeName: "Annapurna Scheme",
    governmentLevel: "central",
    ministry: "Ministry of Rural Development",
    department: "National Social Assistance Programme (NSAP)",
    beneficiaryCategory: "Uncovered eligible senior citizens (food security)",
    schemeGroupSlug: "senior_citizens",
    eligibility:
      "Senior citizens (65+) who are eligible for, but not receiving, an old-age pension under NSAP. Verify on the NSAP portal.",
    benefits: "10 kg of foodgrain per month, free of cost.",
    documentsRequired: ["Age proof", "BPL card"],
    applicationUrl: "https://nsap.nic.in/",
    officialSourceUrl: "https://nsap.nic.in/",
    sourceKey: "nsap",
  },
  {
    id: "b6666666-6666-4666-8666-666666666666",
    schemeName: "Assistance to Disabled Persons (ADIP) Scheme",
    governmentLevel: "central",
    ministry: "Ministry of Social Justice & Empowerment",
    department: "Dept. of Empowerment of Persons with Disabilities (DEPwD)",
    beneficiaryCategory: "Persons with disabilities needing aids & appliances",
    schemeGroupSlug: "disability",
    eligibility:
      "Persons with disabilities holding a disability certificate, within the scheme's income limit. Verify the current income ceiling on the official portal.",
    benefits:
      "Free or subsidised assistive aids & appliances — e.g. motorised tricycles, wheelchairs, hearing aids, prostheses, and smart canes.",
    documentsRequired: ["Disability certificate / UDID", "Income certificate", "Aadhaar"],
    applicationUrl: "https://disabilityaffairs.gov.in/",
    officialSourceUrl: "https://disabilityaffairs.gov.in/",
  },
  {
    id: "b7777777-7777-4777-8777-777777777777",
    schemeName: "Pradhan Mantri Matru Vandana Yojana (PMMVY)",
    governmentLevel: "central",
    ministry: "Ministry of Women & Child Development",
    department: "Mission Shakti (Samarthya)",
    beneficiaryCategory: "Pregnant women & lactating mothers",
    schemeGroupSlug: "women",
    eligibility:
      "Pregnant and lactating mothers for the first living child (and for a second child if the child is a girl, per current norms). Verify eligibility and instalment conditions on the official portal.",
    benefits:
      "Conditional maternity cash benefit paid in instalments to partly compensate wage loss and support nutrition and health.",
    documentsRequired: ["MCP (mother–child protection) card", "Aadhaar", "Bank details"],
    applicationUrl: "https://wcd.gov.in/",
    officialSourceUrl: "https://wcd.gov.in/",
    sourceKey: "vatsalya",
  },
  {
    id: "b8888888-8888-4888-8888-888888888888",
    schemeName: "One Stop Centre (Sakhi) — incl. Women Helpline 181",
    governmentLevel: "central",
    ministry: "Ministry of Women & Child Development",
    department: "Mission Shakti (Sambal)",
    beneficiaryCategory: "Women affected by violence",
    schemeGroupSlug: "women",
    eligibility:
      "Any woman (and girls below 18, in coordination with child-protection authorities) affected by physical, sexual, emotional or economic abuse — regardless of income.",
    benefits:
      "Integrated support under one roof: emergency shelter, medical aid, police and legal assistance, and psychosocial counselling. Reach the Women Helpline on 181.",
    documentsRequired: [],
    applicationUrl: "https://wcd.gov.in/",
    officialSourceUrl: "https://wcd.gov.in/",
    sourceKey: "vatsalya",
  },
  {
    id: "b9999999-9999-4999-8999-999999999999",
    schemeName: "Ayushman Bharat — PM Jan Arogya Yojana (PM-JAY)",
    governmentLevel: "central",
    ministry: "Ministry of Health & Family Welfare",
    department: "National Health Authority",
    beneficiaryCategory: "Eligible low-income families (health cover)",
    schemeGroupSlug: "low_income",
    eligibility:
      "Families identified under the scheme's deprivation / occupational criteria and other notified categories; senior citizens aged 70+ are also covered under a recent expansion. Check your eligibility on the PM-JAY portal.",
    benefits:
      "Cashless health cover up to ₹5 lakh per family per year for secondary and tertiary hospitalisation at empanelled hospitals.",
    documentsRequired: ["Aadhaar", "Eligibility / ration details as per the portal"],
    applicationUrl: "https://pmjay.gov.in/",
    officialSourceUrl: "https://pmjay.gov.in/",
  },
  {
    id: "ba111111-1111-4111-8111-111111111111",
    schemeName: "National Tele Mental Health Programme (Tele MANAS)",
    governmentLevel: "central",
    ministry: "Ministry of Health & Family Welfare",
    department: "National Tele Mental Health Programme",
    beneficiaryCategory: "Anyone needing mental-health support",
    schemeGroupSlug: "mental_health",
    eligibility: "Open to everyone — the service is free and confidential.",
    benefits:
      "24×7 free tele-mental-health counselling and support. Dial 14416 (or 1-800-891-4416) from anywhere in India.",
    documentsRequired: [],
    applicationUrl: "https://telemanas.mohfw.gov.in/",
    officialSourceUrl: "https://telemanas.mohfw.gov.in/",
  },
  {
    id: "ba222222-2222-4222-8222-222222222222",
    schemeName: "SMILE — Support for Marginalized Individuals for Livelihood & Enterprise",
    governmentLevel: "central",
    ministry: "Ministry of Social Justice & Empowerment",
    department: "Dept. of Social Justice & Empowerment",
    beneficiaryCategory: "Persons engaged in begging; transgender persons",
    schemeGroupSlug: "homeless",
    eligibility:
      "Persons engaged in the act of begging / in destitution, and transgender persons, for rehabilitation and welfare. Verify on the official portal.",
    benefits:
      "Comprehensive rehabilitation — shelter, medical care, counselling, education and skill development / livelihood support; plus scholarships and welfare measures for transgender persons.",
    documentsRequired: [],
    applicationUrl: "https://socialjustice.gov.in/",
    officialSourceUrl: "https://socialjustice.gov.in/",
  },
  {
    id: "ba333333-3333-4333-8333-333333333333",
    schemeName: "PM CARES for Children",
    governmentLevel: "central",
    ministry: "Ministry of Women & Child Development",
    department: "PM CARES for Children",
    beneficiaryCategory: "Children who lost parents / guardian to COVID-19",
    schemeGroupSlug: "children",
    eligibility:
      "Children who lost both parents, or the surviving parent / legal guardian, to COVID-19 between 11 March 2020 and 28 February 2022 and were under 18 at the time. Verify on the official portal.",
    benefits:
      "Support up to age 23: a monthly stipend from 18–23, a ₹10 lakh corpus at 23, free schooling / education support, and health cover under Ayushman Bharat (₹5 lakh).",
    documentsRequired: [],
    applicationUrl: "https://pmcaresforchildren.in/",
    officialSourceUrl: "https://pmcaresforchildren.in/",
  },
];
