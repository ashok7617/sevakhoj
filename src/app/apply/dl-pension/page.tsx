import { getProfile } from "@/lib/profileStore";
import { getCurrentUser } from "@/lib/auth";
import { isConfigured } from "@/lib/digilocker";
import { PensionApply, type PensionConfig, type PensionKind } from "@/components/pensionApply";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Apply · Delhi Social-Security Pension (e-District) — SevaKhoj",
};

/**
 * Delhi — social-security pensions applied via e-District Delhi
 * (edistrict.delhi.gov.in): old-age (Vridha), pension to women in distress
 * (widows) and disability (persons with special needs). Household income
 * ceiling ₹1 lakh/yr with a 5-year Delhi-residence rule; verify on submission.
 */
const DL_PENSION: PensionConfig = {
  state: "Delhi",
  applyPath: "/apply/dl-pension",
  portalName: "e-District Delhi",
  portalUrl: "https://edistrict.delhi.gov.in/",
  orgLocal: "समाज कल्याण / महिला एवं बाल विकास विभाग, दिल्ली सरकार",
  orgEn: "Dept. of Social Welfare / WCD, Govt. of NCT of Delhi",
  deptLine: "e-District Delhi · edistrict.delhi.gov.in",
  incomeLimit: 100000,
  incomeNote: "below ₹1,00,000 annual household income",
  residenceNote: "5+ years' residence in Delhi",
  oldAgeMin: 60,
  widowMin: 18,
  widowMax: null, // Delhi women-in-distress pension has no upper age limit
  disabilityMax: 59,
  schemes: {
    "old-age": {
      local: "वृद्धावस्था पेंशन",
      en: "Delhi Old Age Pension (Vridha)",
      amount: "₹2,500/month (60–69) · ₹3,000/month (70+) via DBT",
    },
    widow: {
      local: "संकटग्रस्त महिला (विधवा) पेंशन",
      en: "Delhi Pension to Women in Distress (Widows)",
      amount: "₹2,500/month via DBT",
    },
    disability: {
      local: "दिव्यांगजन पेंशन",
      en: "Delhi Disability Pension (Persons with Special Needs)",
      amount: "₹2,500/month via DBT",
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
      config={DL_PENSION}
      profile={profile}
      configured={isConfigured()}
      signedIn={Boolean(user)}
      error={sp.error}
      initialType={TYPES[sp.type ?? ""] ?? "old-age"}
    />
  );
}
