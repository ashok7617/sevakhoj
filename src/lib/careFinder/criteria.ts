/**
 * Care Finder criteria model + a deterministic rule-based extractor.
 *
 * Turns a natural-language request into structured search filters. Handles
 * **English, Hindi (Devanagari), and Hinglish (romanized Hindi)** — no API key,
 * no cost, no data leaving the server. Serves as the fallback when the LLM
 * extractor is unavailable (and, for a free public site, as the default).
 *
 * Pure — no I/O, fully testable. Extraction only parses the USER'S OWN words
 * into filters; it never invents government facts.
 */

export type BeneficiaryGroup =
  | "senior_citizens"
  | "widows"
  | "children"
  | "women"
  | "mental_health"
  | "disability"
  | "homeless";

export type CareCriteria = {
  raw: string;
  ageYears?: number;
  gender?: "male" | "female" | "all";
  group?: BeneficiaryGroup;
  conditions: string[];
  locationText?: string;
  city?: string;
  district?: string;
  state?: string;
  lat?: number;
  lng?: number;
  budgetInr?: number;
  residential?: boolean;
  services: string[];
  wantsFinancialAssistance?: boolean;
};

/* ------------------------------------------------------------- gazetteer */

export type Place = {
  city: string;
  district: string;
  state: string;
  lat: number;
  lng: number;
};

/** Small offline gazetteer (latin keys): pilot cities + major metros. */
export const GAZETTEER: Record<string, Place> = {
  lucknow: { city: "Lucknow", district: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lng: 80.9462 },
  kanpur: { city: "Kanpur", district: "Kanpur Nagar", state: "Uttar Pradesh", lat: 26.4499, lng: 80.3319 },
  vrindavan: { city: "Vrindavan", district: "Mathura", state: "Uttar Pradesh", lat: 27.565, lng: 77.6593 },
  mathura: { city: "Mathura", district: "Mathura", state: "Uttar Pradesh", lat: 27.4924, lng: 77.6737 },
  bijnor: { city: "Bijnor", district: "Bijnor", state: "Uttar Pradesh", lat: 29.3724, lng: 78.1358 },
  varanasi: { city: "Varanasi", district: "Varanasi", state: "Uttar Pradesh", lat: 25.3176, lng: 82.9739 },
  agra: { city: "Agra", district: "Agra", state: "Uttar Pradesh", lat: 27.1767, lng: 78.0081 },
  prayagraj: { city: "Prayagraj", district: "Prayagraj", state: "Uttar Pradesh", lat: 25.4358, lng: 81.8463 },
  allahabad: { city: "Prayagraj", district: "Prayagraj", state: "Uttar Pradesh", lat: 25.4358, lng: 81.8463 },
  noida: { city: "Noida", district: "Gautam Buddh Nagar", state: "Uttar Pradesh", lat: 28.5355, lng: 77.391 },
  ghaziabad: { city: "Ghaziabad", district: "Ghaziabad", state: "Uttar Pradesh", lat: 28.6692, lng: 77.4538 },
  meerut: { city: "Meerut", district: "Meerut", state: "Uttar Pradesh", lat: 28.9845, lng: 77.7064 },
  delhi: { city: "Delhi", district: "Delhi", state: "Delhi", lat: 28.6139, lng: 77.209 },
  mumbai: { city: "Mumbai", district: "Mumbai", state: "Maharashtra", lat: 19.076, lng: 72.8777 },
  pune: { city: "Pune", district: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567 },
  bengaluru: { city: "Bengaluru", district: "Bengaluru", state: "Karnataka", lat: 12.9716, lng: 77.5946 },
  bangalore: { city: "Bengaluru", district: "Bengaluru", state: "Karnataka", lat: 12.9716, lng: 77.5946 },
  chennai: { city: "Chennai", district: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707 },
  kolkata: { city: "Kolkata", district: "Kolkata", state: "West Bengal", lat: 22.5726, lng: 88.3639 },
  hyderabad: { city: "Hyderabad", district: "Hyderabad", state: "Telangana", lat: 17.385, lng: 78.4867 },
  jaipur: { city: "Jaipur", district: "Jaipur", state: "Rajasthan", lat: 26.9124, lng: 75.7873 },
  patna: { city: "Patna", district: "Patna", state: "Bihar", lat: 25.5941, lng: 85.1376 },
  "new delhi": { city: "New Delhi", district: "New Delhi", state: "Delhi", lat: 28.6139, lng: 77.209 },
  gurugram: { city: "Gurugram", district: "Gurugram", state: "Haryana", lat: 28.4595, lng: 77.0266 },
  gurgaon: { city: "Gurugram", district: "Gurugram", state: "Haryana", lat: 28.4595, lng: 77.0266 },
  "greater noida": { city: "Greater Noida", district: "Gautam Buddha Nagar", state: "Uttar Pradesh", lat: 28.4744, lng: 77.504 },
  garhmukteshwar: { city: "Garhmukteshwar", district: "Hapur", state: "Uttar Pradesh", lat: 28.7802, lng: 78.1013 },
  ahmedabad: { city: "Ahmedabad", district: "Ahmedabad", state: "Gujarat", lat: 23.0225, lng: 72.5714 },
  ahmednagar: { city: "Ahmednagar", district: "Ahmednagar", state: "Maharashtra", lat: 19.0948, lng: 74.748 },
  "vadhu budruk": { city: "Vadhu Budruk", district: "Pune", state: "Maharashtra", lat: 18.63, lng: 74.07 },
  bhopal: { city: "Bhopal", district: "Bhopal", state: "Madhya Pradesh", lat: 23.2599, lng: 77.4126 },
  jabalpur: { city: "Jabalpur", district: "Jabalpur", state: "Madhya Pradesh", lat: 23.1815, lng: 79.9864 },
  mysuru: { city: "Mysuru", district: "Mysuru", state: "Karnataka", lat: 12.2958, lng: 76.6394 },
  mangaluru: { city: "Mangaluru", district: "Dakshina Kannada", state: "Karnataka", lat: 12.9141, lng: 74.856 },
  secunderabad: { city: "Secunderabad", district: "Hyderabad", state: "Telangana", lat: 17.4399, lng: 78.4983 },
  guntur: { city: "Guntur", district: "Guntur", state: "Andhra Pradesh", lat: 16.3067, lng: 80.4365 },
  kurnool: { city: "Kurnool", district: "Kurnool", state: "Andhra Pradesh", lat: 15.8281, lng: 78.0373 },
  coonoor: { city: "Coonoor", district: "Nilgiris", state: "Tamil Nadu", lat: 11.353, lng: 76.7959 },
  cuddalore: { city: "Cuddalore", district: "Cuddalore", state: "Tamil Nadu", lat: 11.748, lng: 79.7714 },
  kochi: { city: "Kochi", district: "Ernakulam", state: "Kerala", lat: 9.9312, lng: 76.2673 },
  thrissur: { city: "Thrissur", district: "Thrissur", state: "Kerala", lat: 10.5276, lng: 76.2144 },
  thiruvananthapuram: { city: "Thiruvananthapuram", district: "Thiruvananthapuram", state: "Kerala", lat: 8.5241, lng: 76.9366 },
  trivandrum: { city: "Thiruvananthapuram", district: "Thiruvananthapuram", state: "Kerala", lat: 8.5241, lng: 76.9366 },
  guwahati: { city: "Guwahati", district: "Kamrup Metropolitan", state: "Assam", lat: 26.1445, lng: 91.7362 },
  dehradun: { city: "Dehradun", district: "Dehradun", state: "Uttarakhand", lat: 30.3165, lng: 78.0322 },
  patiala: { city: "Patiala", district: "Patiala", state: "Punjab", lat: 30.3398, lng: 76.3869 },
  gurdaspur: { city: "Gurdaspur", district: "Gurdaspur", state: "Punjab", lat: 32.0417, lng: 75.4053 },
  porvorim: { city: "Porvorim", district: "North Goa", state: "Goa", lat: 15.538, lng: 73.8113 },
  panaji: { city: "Panaji", district: "North Goa", state: "Goa", lat: 15.4909, lng: 73.8278 },
  shillong: { city: "Shillong", district: "East Khasi Hills", state: "Meghalaya", lat: 25.5788, lng: 91.8933 },
  bhubaneswar: { city: "Bhubaneswar", district: "Khordha", state: "Odisha", lat: 20.2961, lng: 85.8245 },
  ranchi: { city: "Ranchi", district: "Ranchi", state: "Jharkhand", lat: 23.3441, lng: 85.3096 },
  raipur: { city: "Raipur", district: "Raipur", state: "Chhattisgarh", lat: 21.2514, lng: 81.6296 },
  visakhapatnam: { city: "Visakhapatnam", district: "Visakhapatnam", state: "Andhra Pradesh", lat: 17.6868, lng: 83.2185 },
  vizag: { city: "Visakhapatnam", district: "Visakhapatnam", state: "Andhra Pradesh", lat: 17.6868, lng: 83.2185 },
  coimbatore: { city: "Coimbatore", district: "Coimbatore", state: "Tamil Nadu", lat: 11.0168, lng: 76.9558 },
  srinagar: { city: "Srinagar", district: "Srinagar", state: "Jammu & Kashmir", lat: 34.0837, lng: 74.7973 },
  rourkela: { city: "Rourkela", district: "Sundargarh", state: "Odisha", lat: 22.2604, lng: 84.8536 },
  tirupati: { city: "Tirupati", district: "Tirupati", state: "Andhra Pradesh", lat: 13.6288, lng: 79.4192 },
  bhuj: { city: "Bhuj", district: "Kachchh", state: "Gujarat", lat: 23.2419, lng: 69.6669 },
  faridabad: { city: "Faridabad", district: "Faridabad", state: "Haryana", lat: 28.4089, lng: 77.3178 },
  puducherry: { city: "Puducherry", district: "Puducherry", state: "Puducherry", lat: 11.9416, lng: 79.8083 },
  pondicherry: { city: "Puducherry", district: "Puducherry", state: "Puducherry", lat: 11.9416, lng: 79.8083 },
  nagapattinam: { city: "Nagapattinam", district: "Nagapattinam", state: "Tamil Nadu", lat: 10.7672, lng: 79.8449 },
  begusarai: { city: "Begusarai", district: "Begusarai", state: "Bihar", lat: 25.4182, lng: 86.1272 },
  jammu: { city: "Jammu", district: "Jammu", state: "Jammu & Kashmir", lat: 32.7266, lng: 74.857 },
  chandigarh: { city: "Chandigarh", district: "Chandigarh", state: "Chandigarh", lat: 30.7333, lng: 76.7794 },
  itanagar: { city: "Itanagar", district: "Papum Pare", state: "Arunachal Pradesh", lat: 27.0844, lng: 93.6053 },
  amritsar: { city: "Amritsar", district: "Amritsar", state: "Punjab", lat: 31.634, lng: 74.8723 },
};

/** Devanagari + alternate-spelling city names → a GAZETTEER key. */
export const CITY_ALIASES: Record<string, string> = {
  "लखनऊ": "lucknow", "लखनउ": "lucknow",
  "कानपुर": "kanpur", "कानपूर": "kanpur",
  "बिजनौर": "bijnor",
  "वाराणसी": "varanasi", "बनारस": "varanasi", "banaras": "varanasi", "kashi": "varanasi", "काशी": "varanasi",
  "आगरा": "agra",
  "मथुरा": "mathura", "वृंदावन": "vrindavan", "वृन्दावन": "vrindavan",
  "प्रयागराज": "prayagraj", "इलाहाबाद": "allahabad",
  "नोएडा": "noida", "गाजियाबाद": "ghaziabad", "मेरठ": "meerut",
  "दिल्ली": "delhi",
  "मुंबई": "mumbai", "मुम्बई": "mumbai", "bombay": "mumbai",
  "पुणे": "pune", "बेंगलुरु": "bengaluru", "चेन्नई": "chennai",
  "कोलकाता": "kolkata", "हैदराबाद": "hyderabad", "जयपुर": "jaipur", "पटना": "patna",
};

const STATE_NAMES = [
  "Uttar Pradesh", "Maharashtra", "Karnataka", "Tamil Nadu", "West Bengal",
  "Telangana", "Rajasthan", "Bihar", "Delhi", "Kerala", "Gujarat",
  "Madhya Pradesh", "Punjab", "Haryana", "Odisha", "Assam", "Uttarakhand",
];

/* --------------------------------------------------- multilingual keywords */

// Pronouns (he/she/his/her) are intentionally omitted — they cause false
// positives against common words ("the", "this", "shelter", "brother").
const FEMALE = [
  "widow", "widowed", "mother", "grandmother", "woman", "women", "daughter", "girl", "female", "wife",
  "maa", "mummy", "mata", "mataji", "ammi", "behen", "bahan", "beti", "patni", "biwi", "dadi", "nani",
  "mahila", "aurat", "ladki", "vidhwa", "बुढ़िया",
  "माँ", "मां", "माता", "बेटी", "पत्नी", "बहन", "दादी", "नानी", "महिला", "औरत", "लड़की", "विधवा",
];
const MALE = [
  "father", "grandfather", "son", "boy", "male", "husband",
  "pita", "papa", "pitaji", "abba", "bhai", "beta", "pati", "dada", "nana", "aadmi", "purush", "ladka",
  "पिता", "पापा", "बेटा", "पति", "भाई", "दादा", "नाना", "आदमी", "पुरुष", "लड़का",
];

const G_WIDOW = ["widow", "vidhwa", "विधवा"];
const G_CHILD = [
  "child", "children", "orphan", "kid", "minor", "bachcha", "bachche", "baccha", "bacchi", "bachchi",
  "baalak", "balak", "anaath", "anath", "बच्चा", "बच्चे", "बच्ची", "बालक", "अनाथ",
];
const G_DISAB = [
  "disab", "divyang", "viklang", "apang", "wheelchair", "blind", "andha", "deaf", "autism",
  "cerebral palsy", "special needs", "दिव्यांग", "विकलांग", "अपंग", "अंधा",
];
const G_MENTAL = [
  "mental health", "psychiatric", "maansik", "mansik", "schizophren", "depression", "bipolar",
  "addiction", "nasha", "de-addiction", "मानसिक", "नशा", "अवसाद",
];
const G_SENIOR = [
  "senior", "elderly", "old age", "old-age", "budha", "budhe", "budhi", "buzurg", "buzurgon", "bujurg",
  "vriddh", "vriddha", "dementia", "alzheimer", "grandmother", "grandfather", "dadi", "nani", "dada", "nana",
  "बुज़ुर्ग", "बुजुर्ग", "वृद्ध", "बुढ़ापा", "डिमेंशिया", "डिमेन्शिया",
];
const G_HOMELESS = ["homeless", "destitute", "beghar", "nirashrit", "bhikari", "beggar", "बेघर", "निराश्रित", "भिखारी"];
const G_WOMEN = ["woman", "women", "mahila", "aurat", "महिला", "औरत"];

const CONDITION_KEYWORDS: Record<string, string> = {
  dementia: "dementia", "डिमेंशिया": "dementia", "डिमेन्शिया": "dementia",
  alzheimer: "Alzheimer's", alzheimers: "Alzheimer's",
  yaadasht: "memory loss", "याददाश्त": "memory loss",
  paralysis: "paralysis", paralyzed: "paralysis", lakwa: "paralysis", "लकवा": "paralysis", falij: "paralysis", "फालिज": "paralysis",
  bedridden: "bedridden", stroke: "post-stroke care",
  schizophrenia: "schizophrenia", depression: "depression", "अवसाद": "depression", bipolar: "bipolar disorder",
  addiction: "addiction / de-addiction", nasha: "addiction / de-addiction", "नशा": "addiction / de-addiction",
  autism: "autism", "cerebral palsy": "cerebral palsy",
  blind: "visual impairment", andha: "visual impairment", "अंधा": "visual impairment", deaf: "hearing impairment",
};

const FINANCIAL_CUES = [
  "financial assistance", "financial help", "pension", "afford", "can spend", "cannot afford", "can't afford",
  "low income", "low-income", "scheme", "benefit", "subsidy", "assistance",
  "sahayata", "madad", "yojana", "aarthik", "kharch", "afford nahi",
  "सहायता", "मदद", "पेंशन", "योजना", "आर्थिक", "खर्च",
];
const RESIDENTIAL_TRUE = [
  "residential", "live-in", "old age home", "old-age home", "old age homes", "admission", "shelter",
  "home for", "aashram", "ashram", "vridhashram", "vriddhashram", "bharti", "bhorti", "dakhila",
  "rehne ke liye", "rehne ki", "आश्रम", "वृद्धाश्रम", "भर्ती", "दाखिला",
];
const RESIDENTIAL_FALSE = ["day-care", "day care", "daycare", "visiting", "din ki dekhbhaal", "दिन की देखभाल"];

/* ------------------------------------------------------------- helpers */

const hasAny = (t: string, words: string[]) => words.some((w) => t.includes(w));

/** Convert Devanagari digits (०–९) to ASCII so number parsing works. */
export function normalizeDigits(s: string): string {
  return s.replace(/[०-९]/g, (d) => String(d.charCodeAt(0) - 0x0966));
}

function parseAge(t: string): number | undefined {
  const patterns = [
    /\bage[d]?\s*(?:is|of|:)?\s*(\d{1,3})\b/,
    /(?<!\d)(\d{1,3})\s*[-\s]?(?:years?|yrs?|yo|year[-\s]?old|saal|sal|varsh|baras|साल|वर्ष|बरस)/,
    /(?:umra|umar|उम्र|आयु)\s*(?:hai|है|:|-)?\s*(\d{1,3})/,
    /\bis\s+(\d{1,3})\b/,
  ];
  for (const re of patterns) {
    const m = t.match(re);
    if (m) {
      const n = Number(m[1]);
      if (n >= 1 && n <= 120) return n;
    }
  }
  return undefined;
}

function parseBudget(t: string): number | undefined {
  // "5 hazaar" / "5 हज़ार" / "2 lakh"
  const mag = t.match(/(\d+(?:\.\d+)?)\s*(hazaar|hazar|hajaar|hajar|हज़ार|हजार|lakh|lac|लाख)/);
  if (mag) {
    const n = Number.parseFloat(mag[1]);
    const mult = /lakh|lac|लाख/.test(mag[2]) ? 100000 : 1000;
    if (n > 0) return Math.round(n * mult);
  }
  const m = t.match(/(?:₹|rs\.?|inr|rupaye|rupees|रुपये|रुपए|रु)\s*([\d,]{3,})/);
  if (m) {
    const n = Number(m[1].replace(/,/g, ""));
    if (n > 0) return n;
  }
  const m2 = t.match(/([\d,]{3,})\s*(?:\/|per\s*|prati\s*)?\s*(?:month|monthly|mahina|mahine|maheene|महीना|महीने|pm|p\.m\.)/);
  if (m2) {
    const n = Number(m2[1].replace(/,/g, ""));
    if (n > 0) return n;
  }
  return undefined;
}

function matchPlace(t: string): Place | undefined {
  for (const key of Object.keys(GAZETTEER)) {
    if (new RegExp(`\\b${key}\\b`).test(t)) return GAZETTEER[key];
  }
  for (const [alias, key] of Object.entries(CITY_ALIASES)) {
    if (t.includes(alias.toLowerCase())) return GAZETTEER[key];
  }
  return undefined;
}

function matchState(t: string): string | undefined {
  for (const s of STATE_NAMES) {
    if (t.includes(s.toLowerCase())) return s;
  }
  return undefined;
}

/* ------------------------------------------------------------- extractor */

export function extractCriteriaRuleBased(raw: string): CareCriteria {
  const t = normalizeDigits(raw.toLowerCase());

  const age = parseAge(t);

  let gender: CareCriteria["gender"];
  if (hasAny(t, FEMALE)) gender = "female";
  else if (hasAny(t, MALE)) gender = "male";

  const conditions: string[] = [];
  for (const [kw, label] of Object.entries(CONDITION_KEYWORDS)) {
    if (t.includes(kw) && !conditions.includes(label)) conditions.push(label);
  }

  // group (priority order)
  let group: BeneficiaryGroup | undefined;
  const isChildAge = age != null && age < 18;
  if (hasAny(t, G_WIDOW)) group = "widows";
  else if (hasAny(t, G_CHILD) || isChildAge) group = "children";
  else if (hasAny(t, G_DISAB)) group = "disability";
  else if (hasAny(t, G_MENTAL)) group = "mental_health";
  else if (hasAny(t, G_SENIOR) || (age != null && age >= 60)) group = "senior_citizens";
  else if (hasAny(t, G_HOMELESS)) group = "homeless";
  else if (hasAny(t, G_WOMEN)) group = "women";

  // location
  const place = matchPlace(t);
  const inMatch = raw.match(/\b(?:in|at|near|from|mein)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)/);
  const state = place?.state ?? matchState(t);

  // budget + financial assistance
  const budgetInr = parseBudget(t);
  const wantsFinancialAssistance = hasAny(t, FINANCIAL_CUES) || budgetInr != null;

  // residential
  let residential: boolean | undefined;
  if (hasAny(t, RESIDENTIAL_FALSE)) residential = false;
  else if (hasAny(t, RESIDENTIAL_TRUE)) residential = true;

  // services
  const services: string[] = [];
  if (hasAny(t, ["medical", "nursing", "doctor", "medicine", "ilaj", "dawa", "इलाज", "दवा", "नर्सिंग"]))
    services.push("medical support");
  if (hasAny(t, ["physiotherapy", "physio", "फिजियोथेरेपी"])) services.push("physiotherapy");
  if (hasAny(t, ["counsel", "paramarsh", "परामर्श"])) services.push("counselling");
  if (hasAny(t, ["meals", "food", "nutrition", "khana", "bhojan", "poshan", "खाना", "भोजन", "पोषण"]))
    services.push("meals");

  return {
    raw,
    ageYears: age,
    gender,
    group,
    conditions,
    locationText: place?.city ?? inMatch?.[1],
    city: place?.city,
    district: place?.district,
    state,
    lat: place?.lat,
    lng: place?.lng,
    budgetInr,
    residential,
    services,
    wantsFinancialAssistance,
  };
}

/** JSON Schema for the LLM structured-output extractor (mirrors CareCriteria). */
export const CRITERIA_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    ageYears: { type: ["integer", "null"], description: "Age in years, if stated" },
    gender: { type: ["string", "null"], enum: ["male", "female", "all", null] },
    group: {
      type: ["string", "null"],
      enum: ["senior_citizens", "widows", "children", "women", "mental_health", "disability", "homeless", null],
      description: "Primary beneficiary group implied by the request",
    },
    conditions: { type: "array", items: { type: "string" }, description: "Health conditions/needs mentioned (e.g. dementia)" },
    city: { type: ["string", "null"] },
    state: { type: ["string", "null"] },
    budgetInr: { type: ["integer", "null"], description: "Monthly budget in INR, if stated" },
    residential: { type: ["boolean", "null"], description: "True if residential care is needed, false for day-care" },
    services: { type: "array", items: { type: "string" } },
    wantsFinancialAssistance: { type: ["boolean", "null"] },
  },
  required: ["conditions", "services"],
} as const;
