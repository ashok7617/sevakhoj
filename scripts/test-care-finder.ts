/**
 * Offline check of the rule-based criteria extractor against the two documented
 * examples from memory.md. Run with: npx tsx scripts/test-care-finder.ts
 */
import { extractCriteriaRuleBased } from "../src/lib/careFinder/criteria";

let failures = 0;
function check(label: string, cond: boolean, got?: unknown) {
  const ok = cond ? "✓" : "✗";
  if (!cond) failures++;
  console.log(`  ${ok} ${label}${cond ? "" : `  (got: ${JSON.stringify(got)})`}`);
}

console.log("Example 1: widowed mother in Bijnor");
const c1 = extractCriteriaRuleBased(
  "My 68-year-old widowed mother lives in Bijnor and needs affordable residential care and financial assistance.",
);
check("age = 68", c1.ageYears === 68, c1.ageYears);
check("gender = female", c1.gender === "female", c1.gender);
check("group = widows", c1.group === "widows", c1.group);
check("city = Bijnor", c1.city === "Bijnor", c1.city);
check("state = Uttar Pradesh", c1.state === "Uttar Pradesh", c1.state);
check("residential = true", c1.residential === true, c1.residential);
check("wantsFinancialAssistance = true", c1.wantsFinancialAssistance === true, c1.wantsFinancialAssistance);
check("has coordinates", c1.lat != null && c1.lng != null, { lat: c1.lat, lng: c1.lng });

console.log("\nExample 2: mother with dementia in Lucknow, ₹8,000/month");
const c2 = extractCriteriaRuleBased(
  "My mother is 75, has dementia, lives alone in Lucknow, and we can spend ₹8,000/month.",
);
check("age = 75", c2.ageYears === 75, c2.ageYears);
check("gender = female", c2.gender === "female", c2.gender);
check("group = senior_citizens", c2.group === "senior_citizens", c2.group);
check("conditions include dementia", c2.conditions.includes("dementia"), c2.conditions);
check("city = Lucknow", c2.city === "Lucknow", c2.city);
check("budget = 8000", c2.budgetInr === 8000, c2.budgetInr);
check("wantsFinancialAssistance = true", c2.wantsFinancialAssistance === true, c2.wantsFinancialAssistance);

console.log("\nExample 3 (Hinglish): vidhwa maa in Bijnor, aashram + pension");
const c3 = extractCriteriaRuleBased(
  "Meri 70 saal ki vidhwa maa Bijnor mein hai, use aashram aur pension chahiye.",
);
check("age = 70", c3.ageYears === 70, c3.ageYears);
check("gender = female", c3.gender === "female", c3.gender);
check("group = widows", c3.group === "widows", c3.group);
check("city = Bijnor", c3.city === "Bijnor", c3.city);
check("residential = true", c3.residential === true, c3.residential);
check("wantsFinancialAssistance = true", c3.wantsFinancialAssistance === true, c3.wantsFinancialAssistance);

console.log("\nExample 4 (Devanagari): माँ ७५ साल, डिमेंशिया, लखनऊ");
const c4 = extractCriteriaRuleBased(
  "मेरी माँ ७५ साल की है, उसे डिमेंशिया है और वो लखनऊ में अकेली रहती है।",
);
check("age = 75 (Devanagari digits)", c4.ageYears === 75, c4.ageYears);
check("gender = female", c4.gender === "female", c4.gender);
check("group = senior_citizens", c4.group === "senior_citizens", c4.group);
check("conditions include dementia", c4.conditions.includes("dementia"), c4.conditions);
check("city = Lucknow (लखनऊ)", c4.city === "Lucknow", c4.city);

console.log("\nExample 5 (Hinglish): papa, mansik bimari, Kanpur, 5 hazaar/mahine");
const c5 = extractCriteriaRuleBased(
  "Papa ko mansik bimari hai, Kanpur mein, hum 5 hazaar mahine kharch kar sakte hain.",
);
check("gender = male", c5.gender === "male", c5.gender);
check("group = mental_health", c5.group === "mental_health", c5.group);
check("city = Kanpur", c5.city === "Kanpur", c5.city);
check("budget = 5000 (5 hazaar)", c5.budgetInr === 5000, c5.budgetInr);

console.log(`\n${failures === 0 ? "All checks passed." : `${failures} check(s) FAILED.`}`);
process.exit(failures === 0 ? 0 : 1);
