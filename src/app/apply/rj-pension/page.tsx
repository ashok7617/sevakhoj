import { getProfile } from "@/lib/profileStore";
import { getCurrentUser } from "@/lib/auth";
import { isConfigured } from "@/lib/digilocker";
import { PensionApply, type PensionConfig, type PensionKind } from "@/components/pensionApply";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Apply · Rajasthan Social-Security Pension (RajSSP) — SevaKhoj",
};

/**
 * Rajasthan — Samajik Suraksha Pension (RajSSP, ssp.rajasthan.gov.in): old-age
 * (Mukhyamantri Vridhjan), widow / single-women (Ekal Nari) and disability
 * (Vishesh Yogyajan) pensions, all on one portal. Income ceilings differ by
 * type (disability ₹60k; old-age & widow ₹48k) and old-age age is
 * gender-based (women 55+, men 58+). Amounts are age-slab — verify on the portal.
 */
const RJ_PENSION: PensionConfig = {
  state: "Rajasthan",
  applyPath: "/apply/rj-pension",
  portalName: "RajSSP (ssp.rajasthan.gov.in)",
  portalUrl: "https://ssp.rajasthan.gov.in/",
  orgLocal: "सामाजिक न्याय एवं अधिकारिता विभाग, राजस्थान सरकार",
  orgEn: "Social Justice & Empowerment Dept. (RajSSP), Govt. of Rajasthan",
  deptLine: "राजस्थान सामाजिक सुरक्षा पेंशन · ssp.rajasthan.gov.in",
  incomeLimit: 48000, // default (old-age & widow); disability overrides to 60000 below
  incomeNote: "₹48,000 annual family income",
  oldAgeMin: 58, // men
  oldAgeMinFemale: 55, // women
  widowMin: 18,
  widowMax: null,
  disabilityMax: null,
  schemes: {
    "old-age": {
      local: "मुख्यमंत्री वृद्धजन सम्मान पेंशन",
      en: "Rajasthan Old Age Pension (Mukhyamantri Vridhjan Samman)",
      amount: "≈ ₹1,000–₹1,500/month, age-slab, via DBT (confirm on RajSSP)",
    },
    widow: {
      local: "मुख्यमंत्री एकल नारी सम्मान पेंशन",
      en: "Rajasthan Ekal Nari Samman Pension (Widow / single women)",
      amount: "₹500–₹1,500/month by age-slab, via DBT",
    },
    disability: {
      local: "मुख्यमंत्री विशेष योग्यजन सम्मान पेंशन",
      en: "Rajasthan Vishesh Yogyajan Pension (Disability)",
      amount: "≈ ₹1,000–₹2,500/month by category, via DBT",
      incomeLimit: 60000,
      incomeNote: "₹60,000 annual family income",
    },
  },
};

const TYPES: Record<string, PensionKind> = { "old-age": "old-age", widow: "widow", disability: "disability" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const [profile, user] = await Promise.all([getProfile(), getCurrentUser()]);
  return (
    <PensionApply
      config={RJ_PENSION}
      profile={profile}
      configured={isConfigured()}
      signedIn={Boolean(user)}
      error={sp.error}
      initialType={TYPES[sp.type ?? ""] ?? "old-age"}
    />
  );
}
