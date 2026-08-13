import type { Scheme } from "@/lib/queries";

/**
 * Maps a scheme to an internal assisted-application page (DigiLocker pre-fill),
 * or null when no such flow exists yet. Adding a state = one more entry here
 * plus its /apply/<slug> page.
 */
export function applyPathForScheme(
  s: Pick<Scheme, "categorySlug" | "state" | "governmentLevel" | "schemeName">,
): string | null {
  if (s.categorySlug === "workers" && s.governmentLevel === "state") {
    if (s.state === "Uttar Pradesh") return "/apply/up-bocw";
    if (s.state === "Maharashtra") return "/apply/mh-bocw";
    if (s.state === "Karnataka") return "/apply/ka-bocw";
  }

  // Social-security pensions (old-age / widow / disability) — one assisted page
  // per state serves all three types; the beneficiary group picks the ?type.
  const PENSION_TYPE: Record<string, string> = {
    senior_citizens: "old-age",
    widows: "widow",
    disability: "disability",
  };
  const type = s.categorySlug ? PENSION_TYPE[s.categorySlug] : undefined;
  if (type && s.governmentLevel === "state" && /pension/i.test(s.schemeName)) {
    if (s.state === "Uttar Pradesh") return `/apply/up-pension?type=${type}`;
    if (s.state === "Delhi") return `/apply/dl-pension?type=${type}`;
    if (s.state === "Rajasthan") return `/apply/rj-pension?type=${type}`;
  }

  return null;
}
