/** Verification badge presentation. Mirrors the verification_status enum. */
export type VerificationStatus =
  | "government_verified"
  | "registration_verified"
  | "phone_verified"
  | "user_submitted"
  | "needs_verification";

export const BADGES: Record<
  VerificationStatus,
  { label: string; className: string; note: string }
> = {
  government_verified: {
    label: "Government Verified",
    className: "bg-emerald-100 text-emerald-800 ring-emerald-600/20",
    note: "Matched directly against an official government source.",
  },
  registration_verified: {
    label: "Registration Verified",
    className: "bg-sky-100 text-sky-800 ring-sky-600/20",
    note: "Registration information confirmed. Not an endorsement of service quality.",
  },
  phone_verified: {
    label: "Phone Verified",
    className: "bg-indigo-100 text-indigo-800 ring-indigo-600/20",
    note: "Organization confirmed its contact information.",
  },
  user_submitted: {
    label: "User Submitted",
    className: "bg-amber-100 text-amber-800 ring-amber-600/20",
    note: "Submitted but not independently verified.",
  },
  needs_verification: {
    label: "Needs Verification",
    className: "bg-rose-100 text-rose-800 ring-rose-600/20",
    note: "Outdated, conflicting, or unconfirmed information.",
  },
};

export const BADGE_ORDER: VerificationStatus[] = [
  "government_verified",
  "registration_verified",
  "phone_verified",
  "user_submitted",
  "needs_verification",
];
