"use client";

import { useState } from "react";
import type { Profile } from "@/lib/digilocker";
import {
  type FieldCfg,
  ProfileBar,
  ProfileEditor,
  PhotoField,
  SubmitSteps,
  PrintStyle,
  Row,
  Sec,
  Box,
  EligBanner,
  ageOf,
  fmtDob,
} from "@/components/bocwApply";

const APPLY_PATH = "/apply/ka-bocw";

const SELF_DEFAULTS: Record<string, string> = {
  motherName: "Kamla Devi", marital: "Married", trade: "ಮೇಸ್ತ್ರಿ / Mason", days: "105",
  employer: "Prestige Constructions, Bengaluru", mobile: "98•••••10",
  bank: "State Bank of India", branch: "Bengaluru City", account: "XXXXXX4471", ifsc: "SBIN0003456",
  nomName: "Sunita Devi", nomRel: "Wife", nomAge: "32",
};

const FIELDS: FieldCfg[] = [
  { key: "aadhaar", label: "ಆಧಾರ್ (masked) / Aadhaar", group: "Identity / ಗುರುತು", src: "dl", wide: true },
  { key: "fullName", label: "ಹೆಸರು / Name", group: "Identity / ಗುರುತು", src: "dl", wide: true },
  { key: "relName", label: "ತಂದೆ/ಪತಿ / Father–Husband", group: "Identity / ಗುರುತು", src: "dl", wide: true },
  { key: "motherName", label: "ತಾಯಿ / Mother", group: "Identity / ಗುರುತು", src: "self", wide: true },
  { key: "dob", label: "ಜನ್ಮ ದಿನಾಂಕ / DOB", group: "Identity / ಗುರುತು", src: "dl" },
  { key: "gender", label: "ಲಿಂಗ / Gender", group: "Identity / ಗುರುತು", src: "dl" },
  { key: "category", label: "ವರ್ಗ / Category", group: "Identity / ಗುರುತು", src: "dl" },
  { key: "marital", label: "ವೈವಾಹಿಕ / Marital", group: "Identity / ಗುರುತು", src: "self", type: "select", opts: ["Married", "Unmarried", "Widowed"] },
  { key: "mobile", label: "ಮೊಬೈಲ್ / Mobile", group: "Identity / ಗುರುತು", src: "otp" },
  { key: "rationCard", label: "ಪಡಿತರ ಚೀಟಿ / Ration card", group: "Identity / ಗುರುತು", src: "dl" },
  { key: "village", label: "ಗ್ರಾಮ / ಪ್ರದೇಶ / Village–Area", group: "Address / ವಿಳಾಸ", src: "dl", wide: true },
  { key: "tehsil", label: "ತಾಲ್ಲೂಕು / Taluk", group: "Address / ವಿಳಾಸ", src: "dl" },
  { key: "district", label: "ಜಿಲ್ಲೆ / District", group: "Address / ವಿಳಾಸ", src: "dl" },
  { key: "post", label: "ಅಂಚೆ / Post", group: "Address / ವಿಳಾಸ", src: "dl" },
  { key: "pin", label: "ಪಿನ್ / PIN", group: "Address / ವಿಳಾಸ", src: "dl" },
  { key: "trade", label: "ಕೆಲಸದ ಸ್ವರೂಪ / Trade", group: "Work / ಉದ್ಯೋಗ", src: "self", type: "select", opts: ["ಮೇಸ್ತ್ರಿ / Mason", "ಬಡಗಿ / Carpenter", "ಪ್ಲಂಬರ್ / Plumber", "ಎಲೆಕ್ಟ್ರಿಷಿಯನ್ / Electrician", "ಪೇಂಟರ್ / Painter", "ವೆಲ್ಡರ್ / Welder", "ಕಮ್ಮಾರ / Blacksmith", "ನಿರ್ಮಾಣ ಸಹಾಯಕ / Helper", "ರಸ್ತೆ-ಸೇತುವೆ / Road & bridge", "… (ಇತರೆ / other)"] },
  { key: "days", label: "ಕೆಲಸದ ದಿನಗಳು / Days worked", group: "Work / ಉದ್ಯೋಗ", src: "self" },
  { key: "employer", label: "ಉದ್ಯೋಗದಾತ / Employer & site", group: "Work / ಉದ್ಯೋಗ", src: "self", wide: true },
  { key: "bank", label: "ಬ್ಯಾಂಕ್ / Bank", group: "Bank (DBT) / ಬ್ಯಾಂಕ್", src: "pd" },
  { key: "branch", label: "ಶಾಖೆ / Branch", group: "Bank (DBT) / ಬ್ಯಾಂಕ್", src: "pd" },
  { key: "account", label: "ಖಾತೆ (masked) / A/C", group: "Bank (DBT) / ಬ್ಯಾಂಕ್", src: "pd" },
  { key: "ifsc", label: "IFSC", group: "Bank (DBT) / ಬ್ಯಾಂಕ್", src: "pd" },
  { key: "nomName", label: "ನಾಮನಿರ್ದೇಶಿತ / Nominee", group: "Nominee / ನಾಮನಿರ್ದೇಶಿತ", src: "self" },
  { key: "nomRel", label: "ಸಂಬಂಧ / Relation", group: "Nominee / ನಾಮನಿರ್ದೇಶಿತ", src: "self", type: "select", opts: ["Wife", "Husband", "Son", "Daughter", "Mother", "Father"] },
  { key: "nomAge", label: "ವಯಸ್ಸು / Age", group: "Nominee / ನಾಮನಿರ್ದೇಶಿತ", src: "self" },
];

const ERR: Record<string, string> = {
  invalid_state: "Session expired — please connect again.",
  missing_code: "DigiLocker did not return an authorization code.",
  pull_failed: "Could not fetch documents from DigiLocker. Try again.",
  access_denied: "You declined the DigiLocker consent.",
};

export function KaBocwForm({ profile, configured, signedIn, error }: { profile: Profile | null; configured: boolean; signedIn: boolean; connectedVia?: string; error?: string }) {
  const dlVerified = Boolean(profile) && Object.values(profile?.source ?? {}).some((s) => /DigiLocker/i.test(s));
  const [model, setModel] = useState<Record<string, string>>(() => ({ ...SELF_DEFAULTS, state: "Karnataka", ...(profile?.fields ?? {}) }));
  const set = (k: string, v: string) => setModel((m) => ({ ...m, [k]: v }));
  const V = (k: string) => model[k] || "";
  const age = ageOf(V("dob"));
  const daysOk = parseInt(V("days"), 10) >= 90;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <PrintStyle id="ka-paper" />
      <p className="text-xs font-mono uppercase tracking-widest text-emerald-700">SevaKhoj · Apply</p>
      <h1 className="mt-1 text-2xl font-bold text-slate-900">Karnataka Construction Worker — <span className="font-serif">ನೋಂದಣಿ</span> (KBOCWWB)</h1>
      <p className="mt-1 max-w-2xl text-sm text-slate-600">Third state, same engine and same saved profile. Your details flow into the Karnataka board form too; review and submit on karbwwb.karnataka.gov.in.</p>

      {error && <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-800">{ERR[error] ?? `Error: ${error}`}</div>}

      <ProfileBar configured={configured} dlVerified={dlVerified} signedIn={signedIn} applyPath={APPLY_PATH} getFields={() => { const { state, ...rest } = model; return rest; }} />

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]">
        <div className="no-print">
          <div className="mb-2 flex items-center gap-2">
            <span className="font-mono text-[0.62rem] uppercase tracking-widest text-emerald-700">Collected once</span>
            <h2 className="text-base font-semibold text-slate-900">Universal profile</h2>
          </div>
          <PhotoField value={V("photo")} onChange={(v) => set("photo", v)} />
          <ProfileEditor fields={FIELDS} value={V} dlVerified={dlVerified} onSet={set} />
          <p className="mt-3 flex gap-1.5 text-xs text-slate-500"><span>ⓘ</span><span>Same saved profile as UP &amp; Maharashtra — Karnataka uses <b>Taluk</b>. Adding this state took one form component, one page, and one line in the apply-route map.</span></p>
        </div>

        <div>
          <div className="mb-2 flex items-center gap-2 no-print">
            <span className="font-mono text-[0.62rem] uppercase tracking-widest text-emerald-700">Generated draft</span>
            <h2 className="text-base font-semibold text-slate-900">KBOCWWB ನೋಂದಣಿ ಅರ್ಜಿ</h2>
            <button onClick={() => window.print()} className="ml-auto rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700">Print / Save PDF</button>
          </div>

          <div id="ka-paper" className="relative overflow-hidden rounded-md border border-slate-300 bg-white p-6 text-[13px] leading-snug text-slate-800 shadow-sm">
            <div className="absolute -right-11 top-9 rotate-[24deg] bg-rose-600 px-12 py-1 text-[10px] font-bold tracking-widest text-white opacity-90">DRAFT · NOT SUBMITTED</div>
            <div className="border-b-2 border-slate-800 pb-2 text-center">
              <div className="font-serif text-[13px] font-bold">ಕರ್ನಾಟಕ ಕಟ್ಟಡ ಮತ್ತು ಇತರೆ ನಿರ್ಮಾಣ ಕಾರ್ಮಿಕರ ಕಲ್ಯಾಣ ಮಂಡಳಿ</div>
              <div className="text-[12px] font-bold">Karnataka Building &amp; Other Construction Workers Welfare Board</div>
              <div className="text-[10.5px] text-slate-600">ಕಾರ್ಮಿಕ ಇಲಾಖೆ, ಕರ್ನಾಟಕ ಸರ್ಕಾರ · Labour Department, Govt. of Karnataka</div>
            </div>
            <div className="py-2 text-center">
              <div className="text-[12px] font-bold">ನೋಂದಣಿ ಅರ್ಜಿ — ನಿರ್ಮಾಣ ಕಾರ್ಮಿಕ (ಫಲಾನುಭವಿ ನೋಂದಣಿ)</div>
              <div className="text-[10.5px] text-slate-600">Application for registration of a construction worker as a beneficiary</div>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-x-4 rounded border border-slate-300 bg-slate-50 px-2 py-1.5">
              <Row label="ಆಧಾರ್ / Aadhaar" value={V("aadhaar")} />
              <Row label="ಜಿಲ್ಲೆ / District" value={V("district")} />
              <Row label="ತಾಲ್ಲೂಕು / Taluk" value={V("tehsil")} />
            </div>

            <Sec>ಅ · ವೈಯಕ್ತಿಕ ವಿವರ / Personal details</Sec>
            <div className="grid grid-cols-[1fr_84px] gap-3">
              <div>
                <Row label="1. ಹೆಸರು / Name" value={V("fullName")} />
                <div className="grid grid-cols-2 gap-x-4">
                  <Row label={`2. ${V("relType") === "Husband" ? "ಪತಿ / Husband" : "ತಂದೆ / Father"}`} value={V("relName")} />
                  <Row label="3. ತಾಯಿ / Mother" value={V("motherName")} />
                  <Row label="4. ಜನ್ಮ ದಿನಾಂಕ / DOB" value={V("dob") ? fmtDob(V("dob")) : ""} />
                  <Row label="ವಯಸ್ಸು / Age" value={age !== null ? String(age) : ""} />
                  <Row label="5. ಲಿಂಗ / Gender" value={V("gender")} />
                  <Row label="6. ವರ್ಗ / Category" value={V("category")} />
                  <Row label="7. ವೈವಾಹಿಕ / Marital" value={V("marital")} />
                  <Row label="8. ಮೊಬೈಲ್ / Mobile" value={V("mobile")} />
                </div>
                <Row label="9. ಪಡಿತರ ಚೀಟಿ / Ration card" value={V("rationCard")} />
              </div>
              <div className="grid h-[104px] w-[84px] place-items-center overflow-hidden border border-slate-400 text-center text-[8.5px] text-slate-400">
                {V("photo") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={V("photo")} alt="applicant" className="h-full w-full object-cover" />
                ) : (
                  <span>ಫೋಟೋ<br />Photo<br />{dlVerified ? "✓ eKYC" : "(attach)"}</span>
                )}
              </div>
            </div>

            <Sec>ಆ · ಶಾಶ್ವತ ವಿಳಾಸ / Permanent address</Sec>
            <Row label="10. ಗ್ರಾಮ / ಪ್ರದೇಶ / Village–Area" value={V("village")} />
            <div className="grid grid-cols-3 gap-x-4">
              <Row label="ತಾಲ್ಲೂಕು / Taluk" value={V("tehsil")} />
              <Row label="ಜಿಲ್ಲೆ / District" value={V("district")} />
              <Row label="ಅಂಚೆ / Post" value={V("post")} />
              <Row label="ಪಿನ್ / PIN" value={V("pin")} />
              <Row label="ರಾಜ್ಯ / State" value="Karnataka" />
            </div>

            <Sec>ಇ · ಉದ್ಯೋಗದ ವಿವರ / Nature of employment</Sec>
            <div className="grid grid-cols-2 gap-x-4">
              <Row label="11. ಕೆಲಸದ ಸ್ವರೂಪ / Trade" value={V("trade")} />
              <Row label="12. ಕೆಲಸದ ದಿನಗಳು / Days worked" value={V("days")} />
            </div>
            <Row label="13. ಉದ್ಯೋಗದಾತ / Employer & site" value={V("employer")} />
            <div className="flex items-center gap-2 py-1 text-[11.5px]"><span>14. ಕಳೆದ 12 ತಿಂಗಳಲ್ಲಿ 90 ದಿನ ಕೆಲಸ / ≥90 days&apos; work</span><span className="ml-auto"><Box on={daysOk} /> ಹೌದು/Yes &nbsp; <Box on={!daysOk} /> ಇಲ್ಲ/No</span></div>

            <Sec>ಈ · ಬ್ಯಾಂಕ್ ವಿವರ (DBT) / Bank details</Sec>
            <div className="grid grid-cols-3 gap-x-4">
              <Row label="15. ಬ್ಯಾಂಕ್ / Bank" value={V("bank")} />
              <Row label="ಶಾಖೆ / Branch" value={V("branch")} />
              <Row label="IFSC" value={V("ifsc")} />
            </div>
            <Row label="ಖಾತೆ (masked) / A/C no." value={V("account")} />

            <Sec>ಉ · ನಾಮನಿರ್ದೇಶಿತ / Nominee</Sec>
            <div className="grid grid-cols-3 gap-x-4">
              <Row label="16. ಹೆಸರು / Name" value={V("nomName")} />
              <Row label="ಸಂಬಂಧ / Relation" value={V("nomRel")} />
              <Row label="ವಯಸ್ಸು / Age" value={V("nomAge")} />
            </div>

            <div className="mt-2 grid grid-cols-2 gap-x-4">
              <Row label="ನೋಂದಣಿ ಶುಲ್ಕ / Reg. fee" value="ಶುಲ್ಕವಿಲ್ಲ / Nil (online)" />
              <Row label="ವಂತಿಗೆ / Contribution" value="ನಿಯಮಾನುಸಾರ / as per rules" />
            </div>

            <EligBanner dob={V("dob")} days={V("days")} />

            <div className="mt-3 border-t border-slate-200 pt-2 text-[10px] text-slate-600"><b>ಘೋಷಣೆ / Declaration:</b> ಮೇಲಿನ ವಿವರಗಳು ನನ್ನ ಜ್ಞಾನದ ಪ್ರಕಾರ ಸತ್ಯ; ನಾನು BOCW ಕಾಯ್ದೆ 1996 ರ ಅಡಿಯಲ್ಲಿ ನೋಂದಣಿಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸುತ್ತೇನೆ. I consent to my documents being fetched from DigiLocker for this application.</div>
            <div className="mt-6 flex justify-between text-[10.5px] text-slate-600"><div className="text-center"><div className="mb-1 w-36 border-t border-slate-500" />ದಿನಾಂಕ ಮತ್ತು ಸ್ಥಳ / Date &amp; place</div><div className="text-center"><div className="mb-1 w-36 border-t border-slate-500" />ಸಹಿ / ಹೆಬ್ಬೆಟ್ಟು — Aadhaar eSign</div></div>
            <div className="mt-3 border-t border-slate-100 pt-2 text-center text-[9px] text-slate-400">Draft generated by SevaKhoj from the applicant&apos;s own profile · not an official document · verify on karbwwb.karnataka.gov.in before submission.</div>
          </div>

          <SubmitSteps
            portalName="karbwwb.karnataka.gov.in"
            portalUrl="https://karbwwb.karnataka.gov.in/"
            applyLabel="worker registration (Seva Sindhu)"
            docs="Aadhaar, bank passbook, and proof of 90+ days' construction work (employer / contractor certificate or self-declaration)"
            csc="any CSC / Karnataka One / Bangalore One / Grama One centre"
          />
        </div>
      </div>
    </div>
  );
}
