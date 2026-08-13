/**
 * Search keywords used to enumerate myScheme schemes in SevaKhoj's care
 * verticals. myScheme has no public listing API, so we drive its search box
 * with these terms and collect the /schemes/<slug> links from the results.
 *
 * Keep this list FOCUSED — we deliberately do NOT mirror all 4,700+ schemes.
 * Each entry tags the results with the SevaKhoj beneficiary group so the
 * normalize step can pre-fill schemeGroupSlug (still human-reviewed).
 *
 * `group` must be one of our GROUPS slugs (src/lib/groups.ts):
 *   senior_citizens | widows | disability | women | workers | children | homeless
 */
export const KEYWORDS = [
  // Elderly
  { group: "senior_citizens", terms: ["old age pension", "vridha pension", "vriddhavastha pension", "senior citizen", "old age home", "national old age pension"] },
  // Widows / single women
  { group: "widows", terms: ["widow pension", "vidhwa pension", "nirashrit mahila", "ekal nari", "women in distress", "destitute women pension"] },
  // Persons with disabilities
  { group: "disability", terms: ["disability pension", "divyang pension", "viklang pension", "handicapped pension", "disability certificate", "UDID", "differently abled assistance"] },
  // Construction / unorganised workers. NB: keep terms SPECIFIC — broad ones
  // like "e-shram" (matches e-content/e-tablet/e-bike) and "labour card"
  // (matches ration/soil-health/credit *cards*) pulled in off-topic schemes.
  { group: "workers", terms: ["construction worker pension", "BOCW", "building and other construction workers", "construction worker labour card", "silicosis pension"] },
  // Women & maternity
  { group: "women", terms: ["maternity benefit", "widow remarriage", "marriage assistance", "working women hostel", "single women"] },
];
