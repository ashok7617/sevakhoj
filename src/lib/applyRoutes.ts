import type { Scheme } from "@/lib/queries";

/**
 * Maps a scheme to an internal assisted-application page (DigiLocker pre-fill),
 * or null when no such flow exists yet. Adding a state = one more entry here
 * plus its /apply/<slug> page.
 */
export function applyPathForScheme(
  s: Pick<Scheme, "categorySlug" | "state" | "governmentLevel">,
): string | null {
  if (s.categorySlug === "workers" && s.governmentLevel === "state") {
    if (s.state === "Uttar Pradesh") return "/apply/up-bocw";
    if (s.state === "Maharashtra") return "/apply/mh-bocw";
    if (s.state === "Karnataka") return "/apply/ka-bocw";
  }
  return null;
}
