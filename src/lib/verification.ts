/** Verification policy + helpers (shared server/client, no DB). */
import type { VerificationStatus } from "./badges";

/** Target freshness: verified records should be re-checked within this window. */
export const STALE_DAYS = 180;

/** Statuses that count as "independently verified" (vs. unverified/needs work). */
export const VERIFIED_STATUSES: VerificationStatus[] = [
  "government_verified",
  "registration_verified",
  "phone_verified",
];

/** Statuses that belong in the verification queue as "not yet verified". */
export const UNVERIFIED_STATUSES: VerificationStatus[] = [
  "needs_verification",
  "user_submitted",
];

/** A verified record is stale if it has no last-verified date or it's too old. */
export function isStale(
  status: string,
  lastVerified: Date | string | null,
): boolean {
  if (!VERIFIED_STATUSES.includes(status as VerificationStatus)) return false;
  if (!lastVerified) return true;
  const d = typeof lastVerified === "string" ? new Date(lastVerified) : lastVerified;
  const ageMs = Date.now() - d.getTime();
  return ageMs > STALE_DAYS * 24 * 60 * 60 * 1000;
}

/** Queue ordering: unverified first, then everything else. */
export function statusPriority(status: string): number {
  if (status === "needs_verification") return 0;
  if (status === "user_submitted") return 1;
  return 2;
}

/**
 * Verification actions an admin can record. `status` is the resulting badge;
 * the action is logged to the `verifications` audit table.
 */
export const VERIFICATION_ACTIONS: {
  type: string;
  label: string;
  status: VerificationStatus;
}[] = [
  { type: "government_source_match", label: "Matched to official government source", status: "government_verified" },
  { type: "registration_confirmed", label: "Registration confirmed", status: "registration_verified" },
  { type: "phone_confirmed", label: "Phone/contact confirmed", status: "phone_verified" },
  { type: "flagged", label: "Flag — needs (re)verification", status: "needs_verification" },
];

export function actionForType(type: string) {
  return VERIFICATION_ACTIONS.find((a) => a.type === type);
}
