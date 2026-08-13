import { getProfile } from "@/lib/profileStore";
import { getCurrentUser } from "@/lib/auth";
import { isConfigured } from "@/lib/digilocker";
import { PensionApply, type PensionConfig, type PensionKind } from "@/components/pensionApply";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Apply · UP Social-Security Pension (SSPY) — SevaKhoj",
};

/**
 * Uttar Pradesh — Samajik Suraksha Pension (SSPY, sspy-up.gov.in): old-age
 * (Vriddhavastha), widow (Nirashrit Mahila) and Divyangjan pensions. Income
 * ceilings and amounts per the current SSPY portal; verify on submission.
 */
const UP_PENSION: PensionConfig = {
  state: "Uttar Pradesh",
  applyPath: "/apply/up-pension",
  portalName: "SSPY (sspy-up.gov.in)",
  portalUrl: "https://sspy-up.gov.in/",
  orgLocal: "समाज कल्याण / महिला कल्याण / दिव्यांगजन सशक्तिकरण विभाग, उत्तर प्रदेश",
  orgEn: "Integrated Social Security Pension (SSPY), Govt. of Uttar Pradesh",
  deptLine: "समेकित सामाजिक पेंशन प्रणाली · sspy-up.gov.in",
  incomeLimit: 56460, // urban ceiling; rural is ₹46,080
  incomeNote: "₹46,080 (rural) / ₹56,460 (urban) annual family income",
  oldAgeMin: 60,
  widowMin: 18,
  widowMax: 60, // above 60 → apply for old-age pension
  disabilityMax: null,
  schemes: {
    "old-age": {
      local: "वृद्धावस्था पेंशन",
      en: "UP Old Age Pension (Vriddhavastha)",
      amount: "≈ ₹1,000/month via DBT (confirm the current rate on SSPY)",
    },
    widow: {
      local: "निराश्रित महिला (विधवा) पेंशन",
      en: "UP Widow Pension (Nirashrit Mahila)",
      amount: "≈ ₹1,000/month (₹500 central + ₹500 state), paid quarterly",
    },
    disability: {
      local: "दिव्यांगजन (विकलांग) पेंशन",
      en: "UP Divyangjan Pension",
      amount: "≈ ₹1,000/month, paid as ₹3,000 quarterly via DBT",
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
      config={UP_PENSION}
      profile={profile}
      configured={isConfigured()}
      signedIn={Boolean(user)}
      error={sp.error}
      initialType={TYPES[sp.type ?? ""] ?? "old-age"}
    />
  );
}
