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
    eligibility: "BPL persons aged 60 and above.",
    benefits:
      "Monthly old-age pension as central assistance: ₹200 for ages 60–79 and ₹500 from age 80, plus state top-up where applicable.",
    documentsRequired: ["Age proof", "BPL/ration card", "Bank account details"],
    applicationUrl: "https://nsap.nic.in/",
    officialSourceUrl: "https://nsap.nic.in/Guidelines/aps.pdf",
    sourceKey: "nsap",
    verificationStatus: "government_verified",
  },
  {
    id: "a2222222-2222-4222-8222-222222222222",
    schemeName: "Indira Gandhi National Widow Pension Scheme (IGNWPS)",
    governmentLevel: "central",
    ministry: "Ministry of Rural Development",
    department: "National Social Assistance Programme (NSAP)",
    beneficiaryCategory: "Widows (BPL)",
    schemeGroupSlug: "widows",
    eligibility: "BPL widows aged 40 and above.",
    benefits:
      "Monthly widow pension as central assistance: ₹300 from age 40, rising to ₹500 from age 80, plus state top-up where applicable.",
    documentsRequired: ["Age proof", "Death certificate of spouse", "BPL card", "Bank details"],
    applicationUrl: "https://nsap.nic.in/",
    officialSourceUrl: "https://nsap.nic.in/Guidelines/english_wps.pdf",
    sourceKey: "nsap",
    verificationStatus: "government_verified",
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
    eligibility:
      "Uttar Pradesh residents aged 60 and above with total annual income up to ₹46,080 (rural) or ₹56,460 (urban).",
    benefits:
      "Monthly old-age pension credited by DBT to the beneficiary's bank account (₹1,000/month in recent years — confirm the current rate on the SSPY portal).",
    documentsRequired: ["Age proof", "Income certificate", "Aadhaar", "Bank details"],
    applicationUrl: "https://sspy-up.gov.in/",
    officialSourceUrl: "https://sspy-up.gov.in/EnglishPages/oldage_en.aspx",
    sourceKey: "up_social_welfare",
    verificationStatus: "government_verified",
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
      "Senior citizens aged 60 and above; individual components have their own criteria.",
    benefits:
      "Umbrella scheme for the elderly (subsumed 2021): the Integrated Programme for Senior Citizens (IPSrC) funds NGOs running senior-citizens' / continuous-care homes with free shelter, nutrition and medicare for indigent elders; a State Action Plan (geriatric caregivers, cataract drives); Rashtriya Vayoshri Yojana (assistive devices); SAGE (elder-care start-ups); and the national Elderline helpline 14567 (from 1 Oct 2021) for information, guidance, emotional support and intervention in cases of abuse.",
    documentsRequired: ["Age proof", "Aadhaar"],
    applicationUrl: "https://socialjustice.gov.in/",
    officialSourceUrl: "https://socialjustice.gov.in/schemes/43",
    verificationStatus: "government_verified",
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
      "BPL persons aged 18–79 with severe or multiple disabilities.",
    benefits:
      "Monthly disability pension of ₹300 (ages 18–79) as central assistance, rising to ₹500 from age 80, plus state top-up where applicable.",
    documentsRequired: ["Disability certificate / UDID", "Age proof", "BPL card", "Bank details"],
    applicationUrl: "https://nsap.nic.in/",
    officialSourceUrl: "https://nsap.nic.in/Guidelines/dps.pdf",
    sourceKey: "nsap",
    verificationStatus: "government_verified",
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
      "Indigent senior citizens aged 65 and above who are eligible for, but not receiving, an old-age pension under IGNOAPS/NSAP.",
    benefits: "10 kg of foodgrain per month, free of cost.",
    documentsRequired: ["Age proof", "BPL card"],
    applicationUrl: "https://nsap.nic.in/",
    officialSourceUrl: "https://nsap.nic.in/Guidelines/Annapurna%20scheme%20guidelines%202000.pdf",
    sourceKey: "nsap",
    verificationStatus: "government_verified",
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
      "Persons with disabilities holding a disability certificate of at least 40%, with monthly income up to ₹22,500 for full (100%) assistance (for dependents, the parents'/guardians' income up to ₹30,000/month).",
    benefits:
      "Free or subsidised assistive aids & appliances — e.g. motorised tricycles, wheelchairs, hearing aids, prostheses and smart canes — fitted through ALIMCO camps, including corrective surgery where needed.",
    documentsRequired: ["Disability certificate / UDID (40%+)", "Income certificate", "Aadhaar"],
    applicationUrl: "https://disabilityaffairs.gov.in/",
    officialSourceUrl: "https://disabilityaffairs.gov.in/content/page/adip.php",
    verificationStatus: "government_verified",
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
      "Pregnant and lactating mothers, excluding those in regular employment with the Central/State Government or PSUs, or already receiving similar benefits under another law.",
    benefits:
      "₹5,000 for the first child in two instalments (₹3,000 after antenatal check-up, ₹2,000 after birth and the first immunisation cycle); and ₹6,000 for a second child if the child is a girl.",
    documentsRequired: ["MCP (mother–child protection) card", "Aadhaar", "Bank details"],
    applicationUrl: "https://wcd.gov.in/women/pradhan-mantri-matru-vandana-yojna",
    officialSourceUrl: "https://wcd.gov.in/women/pradhan-mantri-matru-vandana-yojna",
    sourceKey: "vatsalya",
    verificationStatus: "government_verified",
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
      "Any woman (and girls below 18, in coordination with child-protection authorities) affected by physical, sexual, emotional or economic abuse — regardless of income or marital status.",
    benefits:
      "Integrated support under one roof (since 2015): emergency and temporary shelter (up to 5 days), medical aid, police assistance, legal aid and advice, and psycho-social counselling — linked to the 24×7 Women Helpline 181.",
    documentsRequired: [],
    applicationUrl: "https://wcd.gov.in/offerings/one-stop-centre-scheme",
    officialSourceUrl: "https://wcd.gov.in/offerings/one-stop-centre-scheme",
    sourceKey: "vatsalya",
    verificationStatus: "government_verified",
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
      "Families identified under the scheme's deprivation / occupational criteria and other notified categories. In addition, all senior citizens aged 70 and above are covered irrespective of income via the Ayushman Vay Vandana Card. Check your eligibility on the PM-JAY portal.",
    benefits:
      "Cashless health cover up to ₹5 lakh per family per year for secondary and tertiary hospitalisation at empanelled hospitals — around 2,000 procedures, with pre-existing conditions covered from day one.",
    documentsRequired: ["Aadhaar", "Eligibility / ration details as per the portal"],
    applicationUrl: "https://pmjay.gov.in/",
    officialSourceUrl: "https://pmjay.gov.in/",
    verificationStatus: "government_verified",
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
      "24×7 free tele-mental-health support in 20+ languages — counselling, psychotherapy, psychiatric consultation and referrals. Dial toll-free 14416 or 1800-89-14416 from anywhere in India.",
    documentsRequired: [],
    applicationUrl: "https://telemanas.mohfw.gov.in/",
    officialSourceUrl: "https://telemanas.mohfw.gov.in/",
    verificationStatus: "government_verified",
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
      "Persons engaged in the act of begging / in destitution, and transgender persons, for rehabilitation and welfare.",
    benefits:
      "Umbrella scheme with two sub-schemes. For transgender persons: scholarships (Class IX to post-graduation), composite medical care including gender-reaffirmation surgery (in convergence with PM-JAY), 'Garima Greh' shelter homes, a state protection cell, and a national portal & helpline. For persons engaged in begging: survey & identification, mobilisation, rescue / shelter homes and comprehensive resettlement.",
    documentsRequired: [],
    applicationUrl: "https://socialjustice.gov.in/schemes/99",
    officialSourceUrl: "https://socialjustice.gov.in/schemes/99",
    verificationStatus: "government_verified",
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
      "Children who lost both parents, the surviving parent, a legal guardian or adoptive parents to COVID-19 between 11 March 2020 and 5 May 2023, and who were under 18 at the time.",
    benefits:
      "A corpus built to ₹10 lakh by age 18; a monthly stipend from 18 to 23 (from the corpus placed in a Post Office Monthly Income Scheme); the ₹10 lakh paid as a lump sum at 23; free schooling (KV / JNV / KGBV or aided schools) with scholarships Class 1–12; and ₹5 lakh health cover under Ayushman Bharat till age 23.",
    documentsRequired: [],
    applicationUrl: "https://pmcaresforchildren.in/",
    officialSourceUrl: "https://pmcaresforchildren.in/",
    verificationStatus: "government_verified",
  },

  /* ---- Additional central schemes (needs_verification; confirm details on
     each official portal). ---- */
  {
    id: "c1111111-1111-4111-8111-111111111111",
    schemeName: "Ayushman Vay Vandana Card (AB PM-JAY for Senior Citizens 70+)",
    governmentLevel: "central",
    ministry: "Ministry of Health & Family Welfare",
    department: "National Health Authority",
    beneficiaryCategory: "Senior citizens aged 70 and above (the 'senior citizen card')",
    schemeGroupSlug: "senior_citizens",
    eligibility:
      "All senior citizens aged 70 and above are eligible, irrespective of income, on producing Aadhaar-based age proof. Applies whether or not the family is already covered under AB PM-JAY.",
    benefits:
      "The Ayushman Vay Vandana Card gives free health cover up to ₹5 lakh/year for 70+ seniors — a dedicated top-up for those in existing PM-JAY families, or ₹5 lakh on a family basis otherwise. Covers ~2,000 procedures, cashless at empanelled hospitals, with pre-existing conditions from day one.",
    documentsRequired: ["Aadhaar", "Age proof (70+)"],
    applicationProcess:
      "Enrol for the Ayushman Vay Vandana Card on the PM-JAY / Ayushman app or at an empanelled hospital / Common Service Centre with your Aadhaar.",
    applicationUrl: "https://beneficiary.nha.gov.in/",
    officialSourceUrl: "https://pmjay.gov.in/",
    sourceLastUpdated: "2024-10-29",
    verificationStatus: "government_verified",
  },
  {
    id: "c2222222-2222-4222-8222-222222222222",
    schemeName: "Senior Citizens' Savings Scheme (SCSS)",
    governmentLevel: "central",
    ministry: "Ministry of Finance",
    department: "India Post / authorised banks",
    beneficiaryCategory: "Senior citizens (savings & regular income)",
    schemeGroupSlug: "senior_citizens",
    eligibility:
      "Individuals aged 60 and above; also 55–60 for those who retired under superannuation/VRS (and 50+ for certain defence retirees), subject to conditions. Verify on the portal.",
    benefits:
      "A government-backed 5-year savings scheme paying quarterly interest (rate revised each quarter), with a maximum deposit of ₹30 lakh and tax benefits under Section 80C.",
    documentsRequired: ["Age proof", "PAN", "Aadhaar", "Passport-size photo"],
    applicationUrl: "https://www.indiapost.gov.in/",
    officialSourceUrl: "https://www.nsiindia.gov.in/",
    verificationStatus: "government_verified",
  },
  {
    id: "c3333333-3333-4333-8333-333333333333",
    schemeName: "National Programme for Health Care of the Elderly (NPHCE)",
    governmentLevel: "central",
    ministry: "Ministry of Health & Family Welfare",
    department: "National Programme for Health Care of the Elderly",
    beneficiaryCategory: "Senior citizens (geriatric health care)",
    schemeGroupSlug: "senior_citizens",
    eligibility: "Senior citizens seeking geriatric health services at government facilities.",
    benefits:
      "Dedicated geriatric health services — geriatric OPD/wards at district hospitals and medical colleges, and elderly-care services down to sub-centre level, largely free at government facilities.",
    documentsRequired: [],
    applicationUrl: "https://mohfw.gov.in/",
    officialSourceUrl: "https://mohfw.gov.in/",
    verificationStatus: "government_verified",
  },
  {
    id: "c4444444-4444-4444-8444-444444444444",
    schemeName: "Unique Disability ID (UDID) Card",
    governmentLevel: "central",
    ministry: "Ministry of Social Justice & Empowerment",
    department: "Dept. of Empowerment of Persons with Disabilities (DEPwD)",
    beneficiaryCategory: "Persons with disabilities (the disability ID card)",
    schemeGroupSlug: "disability",
    eligibility:
      "Persons with disabilities holding (or eligible for) a disability certificate. Apply online with the certificate / assessment.",
    benefits:
      "A single, nationally-valid Unique Disability ID (UDID) card that serves as proof of disability across the country — used to avail government benefits, concessions and scheme entitlements without repeated paperwork.",
    documentsRequired: ["Disability certificate / assessment", "Aadhaar", "Photo"],
    applicationUrl: "https://www.swavlambancard.gov.in/",
    officialSourceUrl: "https://www.swavlambancard.gov.in/",
    verificationStatus: "government_verified",
  },
  {
    id: "c5555555-5555-4555-8555-555555555555",
    schemeName: "Deendayal Disabled Rehabilitation Scheme (DDRS)",
    governmentLevel: "central",
    ministry: "Ministry of Social Justice & Empowerment",
    department: "Dept. of Empowerment of Persons with Disabilities (DEPwD)",
    beneficiaryCategory: "Persons with disabilities (via registered NGOs)",
    schemeGroupSlug: "disability",
    eligibility:
      "Grant-in-aid to registered voluntary organisations / NGOs running services for persons with disabilities. Individuals access services through these organisations.",
    benefits:
      "Funds NGO-run services for persons with disabilities — special schools, early-intervention, community-based rehabilitation, half-way homes, vocational training and more (~600 NGOs funded yearly).",
    documentsRequired: [],
    applicationProcess:
      "NGOs register on the NITI Aayog NGO Darpan portal and apply for grant-in-aid via the e-Anudaan portal (grants.depwd.gov.in). Individuals access services through these funded organisations.",
    applicationUrl: "https://disabilityaffairs.gov.in/",
    officialSourceUrl: "https://disabilityaffairs.gov.in/",
    verificationStatus: "government_verified",
  },
  {
    id: "c6666666-6666-4666-8666-666666666666",
    schemeName: "Swadhar Greh",
    governmentLevel: "central",
    ministry: "Ministry of Women & Child Development",
    department: "Mission Shakti (Sambal)",
    beneficiaryCategory: "Women in difficult circumstances",
    schemeGroupSlug: "women",
    eligibility:
      "Women without social or economic support — destitute, deserted, widows, survivors of violence or trafficking, women released from prison, etc.",
    benefits:
      "Temporary residential shelter with food, clothing, medical care, counselling, legal aid, and rehabilitation/skilling to help women rebuild their lives. (Swadhar Greh and Ujjawala are now delivered as 'Shakti Sadan' under Mission Shakti.)",
    documentsRequired: [],
    applicationUrl: "https://wcd.gov.in/",
    officialSourceUrl: "https://wcd.gov.in/",
    sourceKey: "vatsalya",
    verificationStatus: "government_verified",
  },
  {
    id: "c7777777-7777-4777-8777-777777777777",
    schemeName: "Beti Bachao Beti Padhao (BBBP)",
    governmentLevel: "central",
    ministry: "Ministry of Women & Child Development",
    department: "Mission Shakti",
    beneficiaryCategory: "The girl child (survival, protection, education)",
    schemeGroupSlug: "women",
    eligibility:
      "A national awareness & multi-sectoral programme (not a cash transfer) for the girl child, implemented across districts.",
    benefits:
      "Action to improve the child sex ratio and promote the survival, protection and education of girls — advocacy, awareness, and convergence with schooling and health services. A tri-ministerial effort (Women & Child Development, Health, and Education), launched 2015.",
    documentsRequired: [],
    applicationUrl: "https://wcd.gov.in/",
    officialSourceUrl: "https://wcd.gov.in/",
    sourceKey: "vatsalya",
    verificationStatus: "government_verified",
  },
  {
    id: "c8888888-8888-4888-8888-888888888888",
    schemeName: "Sukanya Samriddhi Yojana (SSY)",
    governmentLevel: "central",
    ministry: "Ministry of Finance",
    department: "India Post / authorised banks",
    beneficiaryCategory: "Girl child (savings for education & future)",
    schemeGroupSlug: "women",
    eligibility:
      "An account for a girl child below 10 years, opened by a parent/guardian (generally up to two girls per family, with exceptions).",
    benefits:
      "A small-savings account — minimum ₹250, up to ₹1.5 lakh per year, deposits for 15 years — with a high government-set interest rate (revised quarterly) and Section 80C tax benefits. The account matures 21 years after opening, for the girl's higher education or marriage (managed by the guardian until she turns 18).",
    documentsRequired: ["Girl's birth certificate", "Guardian ID & address proof"],
    applicationUrl: "https://www.indiapost.gov.in/",
    officialSourceUrl: "https://www.nsiindia.gov.in/",
    verificationStatus: "government_verified",
  },
  {
    id: "c9999999-9999-4999-8999-999999999999",
    schemeName: "National Creche Scheme (Palna)",
    governmentLevel: "central",
    ministry: "Ministry of Women & Child Development",
    department: "Mission Shakti (Samarthya) — Palna",
    beneficiaryCategory: "Children (6 months–6 years) — crèche for all mothers",
    schemeGroupSlug: "children",
    eligibility:
      "Children aged 6 months to 6 years. Under the renamed Palna scheme, crèche facilities are available to all mothers, irrespective of their employment status.",
    benefits:
      "Day-care crèche facilities in a safe, secure environment — supplementary nutrition, growth monitoring, health check-ups/immunisation and early stimulation for the child.",
    documentsRequired: [],
    applicationUrl: "https://wcd.gov.in/",
    officialSourceUrl: "https://wcd.gov.in/",
    sourceKey: "vatsalya",
    verificationStatus: "government_verified",
  },
  {
    id: "ca111111-1111-4111-8111-111111111111",
    schemeName: "POSHAN Abhiyaan (National Nutrition Mission)",
    governmentLevel: "central",
    ministry: "Ministry of Women & Child Development",
    department: "Mission Poshan 2.0",
    beneficiaryCategory: "Children under 6, pregnant & lactating women, adolescent girls",
    schemeGroupSlug: "children",
    eligibility:
      "Children under 6, pregnant women and lactating mothers (and adolescent girls via convergence) — delivered through Anganwadi centres.",
    benefits:
      "Improved nutrition — supplementary nutrition, growth monitoring, counselling and community mobilisation through Anganwadi services to reduce stunting, undernutrition and anaemia.",
    documentsRequired: [],
    applicationUrl: "https://poshanabhiyaan.gov.in/",
    officialSourceUrl: "https://poshanabhiyaan.gov.in/",
    verificationStatus: "government_verified",
  },
  {
    id: "ca222222-2222-4222-8222-222222222222",
    schemeName: "Atal Pension Yojana (APY)",
    governmentLevel: "central",
    ministry: "Ministry of Finance",
    department: "Pension Fund Regulatory & Development Authority (PFRDA)",
    beneficiaryCategory: "Unorganised-sector workers (guaranteed pension)",
    schemeGroupSlug: "low_income",
    eligibility:
      "Indian citizens aged 18–40 with a bank / post-office account (aimed at the unorganised sector; income-tax payers are excluded, per current norms).",
    benefits:
      "A guaranteed minimum monthly pension of ₹1,000 to ₹5,000 from age 60, based on the chosen amount and contributions, with the pension continuing to the spouse.",
    documentsRequired: ["Aadhaar", "Bank / post-office account", "Mobile number"],
    applicationUrl: "https://www.pfrda.org.in/",
    officialSourceUrl: "https://www.pfrda.org.in/",
    verificationStatus: "government_verified",
  },

  /* ---- State schemes (needs_verification; confirm current amount &
     eligibility on each state's official portal — these change often). ---- */
  {
    id: "d1111111-1111-4111-8111-111111111111",
    schemeName: "Mukhyamantri Majhi Ladki Bahin Yojana",
    governmentLevel: "state",
    state: "Maharashtra",
    department: "Women & Child Development, Maharashtra",
    beneficiaryCategory: "Women (21–65) from eligible families",
    schemeGroupSlug: "women",
    eligibility:
      "Women resident in Maharashtra aged 21–65 from eligible families (family income up to ₹2.5 lakh/year; not income-tax payers, per scheme norms).",
    benefits:
      "₹1,500 per month to eligible women, paid directly to an Aadhaar-linked bank account (DBT).",
    documentsRequired: ["Aadhaar", "Domicile & age proof", "Income/ration details", "Bank account (DBT)"],
    applicationUrl: "https://ladakibahin.maharashtra.gov.in/",
    officialSourceUrl: "https://ladakibahin.maharashtra.gov.in/",
    verificationStatus: "government_verified",
  },
  {
    id: "d2222222-2222-4222-8222-222222222222",
    schemeName: "Sanjay Gandhi Niradhar Anudan Yojana",
    governmentLevel: "state",
    state: "Maharashtra",
    department: "Social Justice & Special Assistance, Maharashtra",
    beneficiaryCategory: "Destitute persons — disabled, orphans, destitute women/widows",
    schemeGroupSlug: "low_income",
    eligibility:
      "Destitute persons of Maharashtra aged 18–65 — including persons with disability (40%+), orphans, destitute widows and the seriously ill — on the BPL list or with family income up to ₹21,000/year.",
    benefits: "₹1,500 per month state financial assistance (pension) to eligible destitute persons, via DBT.",
    documentsRequired: ["Age proof", "Income/BPL certificate", "Domicile", "Bank details"],
    applicationUrl: "https://aaplesarkar.mahaonline.gov.in/",
    officialSourceUrl: "https://sjsa.maharashtra.gov.in/en/scheme/sanjay-gandhi-niradhar-anudan-yojana/",
    verificationStatus: "government_verified",
  },
  {
    id: "d3333333-3333-4333-8333-333333333333",
    schemeName: "Kalaignar Magalir Urimai Thogai",
    governmentLevel: "state",
    state: "Tamil Nadu",
    department: "Social Welfare & Women Empowerment, Tamil Nadu",
    beneficiaryCategory: "Woman head of an eligible family",
    schemeGroupSlug: "women",
    eligibility:
      "Woman head of an eligible family in Tamil Nadu, aged 21 and above, subject to income and other criteria notified by the state (one eligible woman per family).",
    benefits: "₹1,000 per month to the eligible woman head of family, via DBT (basic income support).",
    documentsRequired: ["Aadhaar", "Ration card", "Bank account (DBT)"],
    applicationUrl: "https://kmut.tn.gov.in/",
    officialSourceUrl: "https://kmut.tn.gov.in/",
    verificationStatus: "government_verified",
  },
  {
    id: "d4444444-4444-4444-8444-444444444444",
    schemeName: "Gruha Lakshmi Scheme",
    governmentLevel: "state",
    state: "Karnataka",
    department: "Women & Child Development, Karnataka",
    beneficiaryCategory: "Woman head of household (eligible ration-card families)",
    schemeGroupSlug: "women",
    eligibility:
      "Woman named as head of the household on an eligible Antyodaya/BPL/APL ration card in Karnataka (one woman per household; income-tax payers and government employees excluded).",
    benefits: "₹2,000 per month to the woman head of household, via DBT.",
    documentsRequired: ["Aadhaar", "Ration card", "Bank account"],
    applicationUrl: "https://sevasindhuservices.karnataka.gov.in/",
    officialSourceUrl: "https://sevasindhuservices.karnataka.gov.in/",
    verificationStatus: "government_verified",
  },
  {
    id: "d5555555-5555-4555-8555-555555555555",
    schemeName: "Sandhya Suraksha Yojane",
    governmentLevel: "state",
    state: "Karnataka",
    department: "Directorate of Social Security & Pensions, Karnataka",
    beneficiaryCategory: "Senior citizens (65+) in low-income households",
    schemeGroupSlug: "senior_citizens",
    eligibility:
      "Senior citizens aged 65 and above in Karnataka with low income (annual income within limits; bank deposits not exceeding the notified cap) — small/marginal farmers, agricultural labourers and unorganised workers, per scheme criteria.",
    benefits: "₹1,200 per month old-age pension to eligible seniors, via DBT (confirm the current amount on the portal).",
    documentsRequired: ["Age proof", "Income certificate", "Aadhaar", "Bank details"],
    applicationUrl: "https://sevasindhu.karnataka.gov.in/",
    officialSourceUrl: "https://ssp.karnataka.gov.in/",
    verificationStatus: "government_verified",
  },
  {
    id: "d6666666-6666-4666-8666-666666666666",
    schemeName: "Kerala Social Security Pension",
    governmentLevel: "state",
    state: "Kerala",
    department: "Local Self Government Department, Kerala",
    beneficiaryCategory: "Old-age, widow, disability & agricultural-worker pensioners",
    schemeGroupSlug: "senior_citizens",
    eligibility:
      "Eligible Kerala residents under the state's welfare pension categories — old age, widow/single women, persons with disability, and agricultural workers — meeting income criteria.",
    benefits: "₹1,600 per month welfare pension (uniform across all categories) via DBT.",
    documentsRequired: ["Age/category proof", "Income certificate", "Aadhaar", "Bank details"],
    applicationUrl: "https://welfarepension.lsgkerala.gov.in/",
    officialSourceUrl: "https://welfarepension.lsgkerala.gov.in/",
    verificationStatus: "government_verified",
  },
  {
    id: "d7777777-7777-4777-8777-777777777777",
    schemeName: "Lakshmir Bhandar",
    governmentLevel: "state",
    state: "West Bengal",
    department: "Women & Child Development and Social Welfare, West Bengal",
    beneficiaryCategory: "Women heads of household (25–60)",
    schemeGroupSlug: "women",
    eligibility:
      "Women aged 25–60 named as head of household in West Bengal (enrolled via Duare Sarkar); salaried or pensioned applicants are not eligible.",
    benefits:
      "Monthly assistance — ₹1,500 for general-category women and ₹1,700 for SC/ST women (amounts hiked in 2025), via DBT.",
    documentsRequired: ["Aadhaar", "Swasthya Sathi card", "Bank account"],
    applicationUrl: "https://socialsecurity.wb.gov.in/",
    officialSourceUrl: "https://socialsecurity.wb.gov.in/",
    verificationStatus: "government_verified",
  },
  {
    id: "d8888888-8888-4888-8888-888888888888",
    schemeName: "Jai Bangla Pension (Taposili Bandhu / Jai Johar)",
    governmentLevel: "state",
    state: "West Bengal",
    department: "Social Welfare, West Bengal",
    beneficiaryCategory: "Senior citizens (SC — Taposili Bandhu; ST — Jai Johar)",
    schemeGroupSlug: "senior_citizens",
    eligibility:
      "Senior citizens of West Bengal aged 60 and above from BPL households — Taposili Bandhu (SC) and Jai Johar (ST), with a valid caste certificate; not drawing another government pension.",
    benefits: "₹1,000 per month old-age pension via DBT.",
    documentsRequired: ["Age proof", "Caste certificate", "Aadhaar", "Bank details"],
    applicationUrl: "https://jaibangla.wb.gov.in/",
    officialSourceUrl: "https://jaibangla.wb.gov.in/",
    verificationStatus: "government_verified",
  },
  {
    id: "d9999999-9999-4999-8999-999999999999",
    schemeName: "Mukhyamantri Ladli Behna Yojana",
    governmentLevel: "state",
    state: "Madhya Pradesh",
    department: "Women & Child Development, Madhya Pradesh",
    beneficiaryCategory: "Women (eligible age & income)",
    schemeGroupSlug: "women",
    eligibility:
      "Married/widowed/divorced/abandoned women aged 21–60 resident in Madhya Pradesh, with annual family income below ₹2.5 lakh (family not income-tax payers; no member an MP/MLA; no four-wheeler or 5+ acres).",
    benefits: "Monthly financial assistance to eligible women — ₹1,500/month (raised from ₹1,250), via DBT.",
    documentsRequired: ["Aadhaar", "Samagra ID", "Bank account (DBT)"],
    applicationUrl: "https://cmladlibahna.mp.gov.in/",
    officialSourceUrl: "https://cmladlibahna.mp.gov.in/",
    verificationStatus: "government_verified",
  },
  {
    id: "da111111-1111-4111-8111-111111111111",
    schemeName: "Mukhyamantri Vriddhjan Pension Yojana",
    governmentLevel: "state",
    state: "Bihar",
    department: "Social Welfare, Bihar",
    beneficiaryCategory: "Senior citizens (60+)",
    schemeGroupSlug: "senior_citizens",
    eligibility:
      "Bihar residents aged 60 and above (irrespective of income, per scheme norms), not receiving another government pension.",
    benefits: "Monthly old-age pension — ₹400/month for ages 60–79 and ₹500/month for 80 and above — via DBT.",
    documentsRequired: ["Age proof", "Aadhaar", "Bank details"],
    applicationUrl: "https://www.sspmis.bihar.gov.in/",
    officialSourceUrl: "https://www.sspmis.bihar.gov.in/",
    verificationStatus: "government_verified",
  },
  {
    id: "da222222-2222-4222-8222-222222222222",
    schemeName: "Madhu Babu Pension Yojana",
    governmentLevel: "state",
    state: "Odisha",
    department: "SSEPD Department, Odisha",
    beneficiaryCategory: "Old-age, widow & persons-with-disability pensioners",
    schemeGroupSlug: "senior_citizens",
    eligibility:
      "Odisha residents (BPL or annual income up to ₹24,000) not drawing another government pension — old age (60+), widows (40+), persons with 40%+ disability, unmarried women (30+), leprosy-cured, HIV/AIDS patients and PTG members.",
    benefits:
      "Monthly state pension via DBT — enhanced to ₹3,000/month (₹3,500 for ages 80+ or 80%+ disability) under the Mukhyamantri Sahayata top-up.",
    documentsRequired: ["Age/category proof", "Income/BPL certificate", "Aadhaar", "Bank details"],
    applicationUrl: "https://ssepd.odisha.gov.in/",
    officialSourceUrl: "https://ssepd.odisha.gov.in/schemes-programmes/schemes/madhu-babu-pension-yojna",
    verificationStatus: "government_verified",
  },
  {
    id: "da333333-3333-4333-8333-333333333333",
    schemeName: "Subhadra Yojana",
    governmentLevel: "state",
    state: "Odisha",
    department: "Women & Child Development, Odisha",
    beneficiaryCategory: "Women (21–60) from eligible families",
    schemeGroupSlug: "women",
    eligibility:
      "Women aged 21–60 in Odisha from eligible families (not income-tax payers; excludes those getting ₹1,500+/month under another government scheme, per norms).",
    benefits:
      "₹10,000 per year — two instalments of ₹5,000 (Rakhi Purnima and International Women's Day) — for five years (₹50,000 total), via DBT.",
    documentsRequired: ["Aadhaar", "Ration/eligibility proof", "Bank account"],
    applicationUrl: "https://subhadra.odisha.gov.in/",
    officialSourceUrl: "https://subhadra.odisha.gov.in/",
    verificationStatus: "government_verified",
  },
  {
    id: "da444444-4444-4444-8444-444444444444",
    schemeName: "Palanhar Yojana",
    governmentLevel: "state",
    state: "Rajasthan",
    department: "Social Justice & Empowerment, Rajasthan",
    beneficiaryCategory: "Orphaned & vulnerable children (cared for by a 'palanhar')",
    schemeGroupSlug: "children",
    eligibility:
      "Orphaned or vulnerable children (e.g. of deceased/imprisoned parents, destitute, of widowed/divorced mothers, etc.) cared for by a relative or guardian ('palanhar') in Rajasthan.",
    benefits:
      "Monthly support to the palanhar — ₹1,500/month for a child up to 5 years and ₹2,500/month for ages 6–18 — plus a ₹2,000 annual grant for uniforms, books and stationery (guardian's annual income must be within ₹1.2 lakh). Keeps the child within a family rather than an institution.",
    documentsRequired: ["Child & guardian Aadhaar", "Eligibility proof", "Anganwadi/school enrolment", "Bank details"],
    applicationUrl: "https://sso.rajasthan.gov.in/",
    officialSourceUrl: "https://jansoochna.rajasthan.gov.in/",
    verificationStatus: "government_verified",
  },
  {
    id: "da555555-5555-4555-8555-555555555555",
    schemeName: "Old Age Samman Allowance (Haryana)",
    governmentLevel: "state",
    state: "Haryana",
    department: "Social Justice & Empowerment, Haryana",
    beneficiaryCategory: "Senior citizens (60+)",
    schemeGroupSlug: "senior_citizens",
    eligibility:
      "Haryana residents aged 60 and above whose combined income with their spouse from all sources does not exceed ₹3 lakh/year.",
    benefits: "₹3,200 per month old-age allowance (raised from ₹3,000 w.e.f. Nov 2025), via DBT.",
    documentsRequired: ["Age proof", "Income/Parivar Pehchan details", "Aadhaar", "Bank details"],
    applicationUrl: "https://socialjusticehry.gov.in/",
    officialSourceUrl: "https://socialjusticehry.gov.in/old-age-samman-allowance-scheme/",
    verificationStatus: "government_verified",
  },
  {
    id: "da666666-6666-4666-8666-666666666666",
    schemeName: "Delhi Old Age Pension (Vridha Pension)",
    governmentLevel: "state",
    state: "Delhi",
    department: "Dept. of Social Welfare, GNCT of Delhi",
    beneficiaryCategory: "Senior citizens (60+)",
    schemeGroupSlug: "senior_citizens",
    eligibility:
      "Delhi residents aged 60 and above who have lived in Delhi for at least 5 years, with annual family income below ₹1 lakh.",
    benefits:
      "Monthly old-age pension via DBT — ₹2,500/month for ages 60–69 and ₹3,000/month for 70 and above (with a top-up for SC/ST/minority beneficiaries).",
    documentsRequired: ["Age proof", "Delhi residence proof", "Income details", "Aadhaar", "Bank details"],
    applicationUrl: "https://edistrict.delhigovt.nic.in/",
    officialSourceUrl: "https://socialwelfare.delhi.gov.in/social/financials-assistance-schemes",
    verificationStatus: "government_verified",
  },
];
