/**
 * Shared SAMPLE facilities (Phase-1 Uttar Pradesh pilot). Used by both the DB
 * seed and the "near me" map's offline fallback, so ids are stable and the two
 * never drift. These are PLACEHOLDER development records — marked
 * `needs_verification` and prefixed `[SAMPLE]` so they're never shown as
 * official/verified data.
 */
export type SampleFacility = {
  id: string; // fixed UUID (seeded with this id, so detail links resolve)
  name: string;
  careCategorySlug: string;
  groupSlug: string;
  category: string;
  gender: "male" | "female" | "all";
  residential: boolean;
  costType: "free" | "subsidized" | "paid" | "mixed";
  medicalServices?: boolean;
  capacity?: number;
  ageMin?: number;
  ageMax?: number;
  services: string[];
  state: string;
  district: string;
  city: string;
  pincode: string;
  latitude: number;
  longitude: number;
};

export const SAMPLE_FACILITIES: SampleFacility[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    name: "[SAMPLE] Shanti Senior Citizens Home, Lucknow",
    careCategorySlug: "old-age-homes",
    groupSlug: "senior_citizens",
    category: "Old-age Home",
    gender: "all",
    residential: true,
    costType: "mixed",
    medicalServices: true,
    capacity: 40,
    ageMin: 60,
    services: ["Residential care", "Meals", "Basic medical support"],
    state: "Uttar Pradesh",
    district: "Lucknow",
    city: "Lucknow",
    pincode: "226001",
    latitude: 26.8467,
    longitude: 80.9462,
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    name: "[SAMPLE] Vrindavan Widow Ashram, Mathura",
    careCategorySlug: "widow-support-homes",
    groupSlug: "widows",
    category: "Widow Support Home",
    gender: "female",
    residential: true,
    costType: "free",
    capacity: 120,
    services: ["Residential support", "Meals", "Counselling"],
    state: "Uttar Pradesh",
    district: "Mathura",
    city: "Vrindavan",
    pincode: "281121",
    latitude: 27.565,
    longitude: 77.6593,
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    name: "[SAMPLE] Bal Ashray Children's Home, Kanpur",
    careCategorySlug: "childrens-homes",
    groupSlug: "children",
    category: "Children's Home",
    gender: "all",
    residential: true,
    costType: "free",
    capacity: 60,
    ageMin: 0,
    ageMax: 18,
    services: ["Residential care", "Education support", "Nutrition"],
    state: "Uttar Pradesh",
    district: "Kanpur Nagar",
    city: "Kanpur",
    pincode: "208001",
    latitude: 26.4499,
    longitude: 80.3319,
  },
  {
    id: "44444444-4444-4444-8444-444444444444",
    name: "[SAMPLE] Seva Day-Care for Seniors, Bijnor",
    careCategorySlug: "senior-day-care",
    groupSlug: "senior_citizens",
    category: "Senior Day-care",
    gender: "all",
    residential: false,
    costType: "subsidized",
    capacity: 25,
    ageMin: 60,
    services: ["Day-care", "Physiotherapy", "Recreation"],
    state: "Uttar Pradesh",
    district: "Bijnor",
    city: "Bijnor",
    pincode: "246701",
    latitude: 29.3724,
    longitude: 78.1358,
  },
];
