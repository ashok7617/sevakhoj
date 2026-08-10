import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import {
  extractCriteriaRuleBased,
  CRITERIA_JSON_SCHEMA,
  GAZETTEER,
  type CareCriteria,
} from "./criteria";

export type ExtractResult = { criteria: CareCriteria; method: "llm" | "rules" };

const SYSTEM = `You convert a person's natural-language request for care into structured search filters.
The request may be in English, Hindi (Devanagari), or Hinglish (romanized Hindi) — understand all three.

Rules:
- Extract ONLY what the user states or clearly implies about THEIR situation.
- Do NOT invent facilities, schemes, eligibility, benefits, or government facts — you only produce search filters; a database provides the actual answers.
- "group" is the primary beneficiary category. Prefer: widows > children (age < 18) > disability > mental_health > senior_citizens (elderly / age >= 60 / dementia) > homeless > women.
- Put health conditions (e.g. dementia, paralysis) in "conditions".
- Set residential=true for live-in/old-age-home needs, false for day-care.
- Set budgetInr only if a monthly rupee amount is stated.
- Set wantsFinancialAssistance=true if they mention affordability, pensions, schemes, or financial help.
Return only the structured object.`;

/**
 * Parse a natural-language request into structured criteria. Uses Claude
 * (Opus 5, structured output) when ANTHROPIC_API_KEY is set; otherwise falls
 * back to the deterministic rule-based extractor. Either way, geo-coordinates
 * are resolved locally from the gazetteer — the model never supplies them.
 */
export async function extractCriteria(query: string): Promise<ExtractResult> {
  const rules = extractCriteriaRuleBased(query);
  if (!process.env.ANTHROPIC_API_KEY) return { criteria: rules, method: "rules" };

  try {
    const client = new Anthropic();
    const resp = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 1024,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      output_config: { effort: "low", format: { type: "json_schema", schema: CRITERIA_JSON_SCHEMA } } as any,
      system: SYSTEM,
      messages: [{ role: "user", content: query }],
    });

    if (resp.stop_reason === "refusal") return { criteria: rules, method: "rules" };
    const block = resp.content.find((b) => b.type === "text");
    if (!block || block.type !== "text") return { criteria: rules, method: "rules" };

    const parsed = JSON.parse(block.text) as Partial<CareCriteria>;
    return { criteria: merge(query, rules, parsed), method: "llm" };
  } catch {
    // Any error (no network, bad key, parse failure) → deterministic fallback.
    return { criteria: rules, method: "rules" };
  }
}

/** Prefer LLM fields; fill geo/district from the gazetteer; keep rules as base. */
function merge(query: string, rules: CareCriteria, llm: Partial<CareCriteria>): CareCriteria {
  const pick = <T>(a: T | null | undefined, b: T | undefined): T | undefined =>
    a === null || a === undefined ? b : a;

  const city = pick(llm.city, rules.city);
  const place = city ? GAZETTEER[city.toLowerCase()] : undefined;

  return {
    raw: query,
    ageYears: pick(llm.ageYears, rules.ageYears),
    gender: pick(llm.gender, rules.gender),
    group: pick(llm.group, rules.group),
    conditions: llm.conditions?.length ? llm.conditions : rules.conditions,
    locationText: city ?? rules.locationText,
    city: place?.city ?? city,
    district: place?.district ?? rules.district,
    state: pick(llm.state, rules.state) ?? place?.state,
    lat: place?.lat ?? rules.lat,
    lng: place?.lng ?? rules.lng,
    budgetInr: pick(llm.budgetInr, rules.budgetInr),
    residential: pick(llm.residential, rules.residential),
    services: llm.services?.length ? llm.services : rules.services,
    wantsFinancialAssistance: pick(llm.wantsFinancialAssistance, rules.wantsFinancialAssistance),
  };
}
