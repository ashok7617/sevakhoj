"use client";

import { useState } from "react";
import type { Profile } from "@/lib/digilocker";
import {
  type FieldCfg,
  ProfileBar,
  ProfileEditor,
  PhotoField,
  PrintStyle,
  SubmitSteps,
  Row,
  Sec,
  Box,
  EligBanner,
  ageOf,
  fmtDob,
} from "@/components/bocwApply";

const APPLY_PATH = "/apply/up-bocw";

const SELF_DEFAULTS: Record<string, string> = {
  motherName: "Kamla Devi", marital: "Married", mandal: "Ayodhya", block: "Nawabganj",
  gramWard: "Rampur Bujurg", trade: "Mason (Rajmistri)", days: "96",
  employer: "Shakti Constructions Pvt Ltd, Lucknow", mobile: "98•••••10",
  bank: "State Bank of India", branch: "Barabanki", account: "XXXXXX4471", ifsc: "SBIN0001234",
  nomName: "Sunita Devi", nomRel: "Wife", nomAge: "32",
};

const FIELDS: FieldCfg[] = [
  { key: "aadhaar", label: "आधार (masked) / Aadhaar", group: "Identity / पहचान", src: "dl", wide: true },
  { key: "fullName", label: "नाम / Name", group: "Identity / पहचान", src: "dl", wide: true },
  { key: "relName", label: "पिता/पति / Father–Husband", group: "Identity / पहचान", src: "dl", wide: true },
  { key: "motherName", label: "माता / Mother", group: "Identity / पहचान", src: "self", wide: true },
  { key: "dob", label: "जन्म तिथि / DOB", group: "Identity / पहचान", src: "dl" },
  { key: "gender", label: "लिंग / Gender", group: "Identity / पहचान", src: "dl" },
  { key: "category", label: "श्रेणी / Category", group: "Identity / पहचान", src: "dl" },
  { key: "marital", label: "वैवाहिक / Marital", group: "Identity / पहचान", src: "self", type: "select", opts: ["Married", "Unmarried", "Widowed"] },
  { key: "mobile", label: "मोबाइल / Mobile", group: "Identity / पहचान", src: "otp" },
  { key: "rationCard", label: "राशन कार्ड / Ration card", group: "Identity / पहचान", src: "dl" },
  { key: "mandal", label: "मण्डल / Mandal", group: "Address / पता", src: "self" },
  { key: "district", label: "जनपद / District", group: "Address / पता", src: "dl" },
  { key: "tehsil", label: "तहसील / Tehsil", group: "Address / पता", src: "dl" },
  { key: "block", label: "विकास खण्ड / Block", group: "Address / पता", src: "self" },
  { key: "gramWard", label: "ग्राम पंचायत / वार्ड", group: "Address / पता", src: "self" },
  { key: "village", label: "ग्राम / मोहल्ला", group: "Address / पता", src: "dl", wide: true },
  { key: "post", label: "पोस्ट / Post", group: "Address / पता", src: "dl" },
  { key: "pin", label: "पिन / PIN", group: "Address / पता", src: "dl" },
  { key: "trade", label: "कार्य / Trade", group: "Work / नियोजन", src: "self", type: "select", opts: ["Mason (Rajmistri)", "Carpenter (Barhai)", "Plumber", "Electrician", "Painter", "Welder", "Blacksmith (Lohar)", "Construction helper", "Road & bridge", "Well digger", "… (40+ trades)"] },
  { key: "days", label: "कार्य दिवस / Days worked", group: "Work / नियोजन", src: "self" },
  { key: "employer", label: "नियोजक / Employer & site", group: "Work / नियोजन", src: "self", wide: true },
  { key: "bank", label: "बैंक / Bank", group: "Bank (DBT) / बैंक", src: "pd" },
  { key: "branch", label: "शाखा / Branch", group: "Bank (DBT) / बैंक", src: "pd" },
  { key: "account", label: "खाता (masked) / A/C", group: "Bank (DBT) / बैंक", src: "pd" },
  { key: "ifsc", label: "IFSC", group: "Bank (DBT) / बैंक", src: "pd" },
  { key: "nomName", label: "नामिनी / Nominee", group: "Nominee / नामिनी", src: "self" },
  { key: "nomRel", label: "सम्बन्ध / Relation", group: "Nominee / नामिनी", src: "self", type: "select", opts: ["Wife", "Husband", "Son", "Daughter", "Mother", "Father"] },
  { key: "nomAge", label: "आयु / Age", group: "Nominee / नामिनी", src: "self" },
];

const ERR: Record<string, string> = {
  invalid_state: "Session expired — please connect again.",
  missing_code: "DigiLocker did not return an authorization code.",
  pull_failed: "Could not fetch documents from DigiLocker. Try again.",
  access_denied: "You declined the DigiLocker consent.",
};

export function UpBocwForm({ profile, configured, signedIn, error }: { profile: Profile | null; configured: boolean; signedIn: boolean; connectedVia?: string; error?: string }) {
  const dlVerified = Boolean(profile) && Object.values(profile?.source ?? {}).some((s) => /DigiLocker/i.test(s));
  const [model, setModel] = useState<Record<string, string>>(() => ({ ...SELF_DEFAULTS, state: "Uttar Pradesh", ...(profile?.fields ?? {}) }));
  const set = (k: string, v: string) => setModel((m) => ({ ...m, [k]: v }));
  const V = (k: string) => model[k] || "";
  const age = ageOf(V("dob"));
  const daysOk = parseInt(V("days"), 10) >= 90;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <PrintStyle id="up-paper" />
      <p className="text-xs font-mono uppercase tracking-widest text-emerald-700">SevaKhoj · Apply</p>
      <h1 className="mt-1 text-2xl font-bold text-slate-900">UP Construction Worker — Labour Card (BOCW <span className="font-serif">प्रपत्र-1</span>)</h1>
      <p className="mt-1 max-w-2xl text-sm text-slate-600">Enter your details once — they&apos;re saved and reused across every scheme form. Review the generated UP Form-1, then e-sign and submit on upbocw.in.</p>

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
          <p className="mt-3 flex gap-1.5 text-xs text-slate-500"><span>ⓘ</span><span>All fields are self-declared — enter them exactly as on your Aadhaar &amp; bank passbook. Hit <b>Save my details</b> and they carry to every other form.</span></p>
        </div>

        <div>
          <div className="mb-2 flex items-center gap-2 no-print">
            <span className="font-mono text-[0.62rem] uppercase tracking-widest text-emerald-700">Generated draft</span>
            <h2 className="text-base font-semibold text-slate-900">UP BOCW Form-1</h2>
            <button onClick={() => window.print()} className="ml-auto rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700">Print / Save PDF</button>
          </div>

          <div id="up-paper" className="relative overflow-hidden rounded-md border border-slate-300 bg-white p-6 text-[13px] leading-snug text-slate-800 shadow-sm">
            <div className="absolute -right-11 top-9 rotate-[24deg] bg-rose-600 px-12 py-1 text-[10px] font-bold tracking-widest text-white opacity-90">DRAFT · NOT SUBMITTED</div>
            <div className="border-b-2 border-slate-800 pb-2 text-center">
              <div className="font-serif text-[13px] font-bold">उत्तर प्रदेश भवन एवं अन्य सन्निर्माण कर्मकार कल्याण बोर्ड</div>
              <div className="text-[12px] font-bold">U.P. Building &amp; Other Construction Workers Welfare Board</div>
              <div className="text-[10.5px] text-slate-600">श्रम विभाग, उत्तर प्रदेश शासन · Labour Department, Govt. of Uttar Pradesh</div>
            </div>
            <div className="py-2 text-center">
              <div className="text-[12px] font-bold">FORM-1 · प्रपत्र-1 — हिताधिकारी पंजीकरण हेतु आवेदन पत्र</div>
              <div className="text-[10.5px] text-slate-600">Application for registration of a building worker as a beneficiary</div>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-x-4 rounded border border-slate-300 bg-slate-50 px-2 py-1.5">
              <Row label="आधार / Aadhaar" value={V("aadhaar")} />
              <Row label="मण्डल / Mandal" value={V("mandal")} />
              <Row label="जनपद / District" value={V("district")} />
            </div>

            <Sec>क · व्यक्तिगत विवरण / Personal details</Sec>
            <div className="grid grid-cols-[1fr_84px] gap-3">
              <div>
                <Row label="1. नाम / Name" value={V("fullName")} />
                <div className="grid grid-cols-2 gap-x-4">
                  <Row label={`2. ${V("relType") === "Husband" ? "पति / Husband" : "पिता / Father"}`} value={V("relName")} />
                  <Row label="3. माता / Mother" value={V("motherName")} />
                  <Row label="4. जन्म तिथि / DOB" value={V("dob") ? fmtDob(V("dob")) : ""} />
                  <Row label="आयु / Age" value={age !== null ? String(age) : ""} />
                  <Row label="5. लिंग / Gender" value={V("gender")} />
                  <Row label="6. श्रेणी / Category" value={V("category")} />
                  <Row label="7. वैवाहिक / Marital" value={V("marital")} />
                  <Row label="8. मोबाइल / Mobile" value={V("mobile")} />
                </div>
                <Row label="9. राशन कार्ड / Ration card" value={V("rationCard")} />
              </div>
              <div className="grid h-[104px] w-[84px] place-items-center overflow-hidden border border-slate-400 text-center text-[8.5px] text-slate-400">
                {V("photo") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={V("photo")} alt="applicant" className="h-full w-full object-cover" />
                ) : (
                  <span>फोटो<br />Photo<br />{dlVerified ? "✓ eKYC" : "(attach)"}</span>
                )}
              </div>
            </div>

            <Sec>ख · स्थायी पता / Permanent address</Sec>
            <Row label="10. ग्राम / मोहल्ला / Village" value={V("village")} />
            <div className="grid grid-cols-3 gap-x-4">
              <Row label="तहसील / Tehsil" value={V("tehsil")} />
              <Row label="विकास खण्ड / Block" value={V("block")} />
              <Row label="ग्राम पंचायत / वार्ड" value={V("gramWard")} />
              <Row label="पोस्ट / Post" value={V("post")} />
              <Row label="जनपद / District" value={V("district")} />
              <Row label="पिन / PIN" value={V("pin")} />
            </div>
            <Row label="राज्य / State" value="Uttar Pradesh" />

            <Sec>ग · नियोजन / Nature of employment</Sec>
            <div className="grid grid-cols-2 gap-x-4">
              <Row label="11. कार्य / Trade" value={V("trade")} />
              <Row label="12. कार्य दिवस / Days worked" value={V("days")} />
            </div>
            <Row label="13. नियोजक / Employer & site" value={V("employer")} />
            <div className="flex items-center gap-2 py-1 text-[11.5px]"><span>14. विगत 12 माह में 90 दिन कार्य / ≥90 days&apos; work</span><span className="ml-auto"><Box on={daysOk} /> हाँ/Yes &nbsp; <Box on={!daysOk} /> नहीं/No</span></div>

            <Sec>घ · बैंक विवरण (DBT) / Bank details</Sec>
            <div className="grid grid-cols-3 gap-x-4">
              <Row label="15. बैंक / Bank" value={V("bank")} />
              <Row label="शाखा / Branch" value={V("branch")} />
              <Row label="IFSC" value={V("ifsc")} />
            </div>
            <Row label="खाता (masked) / A/C no." value={V("account")} />

            <Sec>ङ · नामिनी / Nominee</Sec>
            <div className="grid grid-cols-3 gap-x-4">
              <Row label="16. नाम / Name" value={V("nomName")} />
              <Row label="सम्बन्ध / Relation" value={V("nomRel")} />
              <Row label="आयु / Age" value={V("nomAge")} />
            </div>

            <EligBanner dob={V("dob")} days={V("days")} />

            <div className="mt-3 border-t border-slate-200 pt-2 text-[10px] text-slate-600"><b>घोषणा / Declaration:</b> मैं घोषणा करता/करती हूँ कि उपर्युक्त विवरण सत्य है व मैं BOCW अधिनियम 1996 के अंतर्गत पंजीकरण हेतु आवेदन करता/करती हूँ। I consent to my documents being fetched from DigiLocker for this application.</div>
            <div className="mt-6 flex justify-between text-[10.5px] text-slate-600"><div className="text-center"><div className="mb-1 w-36 border-t border-slate-500" />दिनांक व स्थान / Date &amp; place</div><div className="text-center"><div className="mb-1 w-36 border-t border-slate-500" />हस्ताक्षर / अंगूठा — Aadhaar eSign</div></div>
            <div className="mt-3 border-t border-slate-100 pt-2 text-center text-[9px] text-slate-400">Draft generated by SevaKhoj from the applicant&apos;s own profile · not an official document · verify on upbocw.in before submission.</div>
          </div>

          <SubmitSteps
            portalName="upbocw.in"
            portalUrl="https://upbocw.in/"
            applyLabel="labour-card registration (श्रमिक पंजीयन)"
            docs="Aadhaar, bank passbook, and proof of 90+ days' construction work (employer / contractor certificate or self-declaration)"
            csc="any CSC / Jan Seva Kendra / Shram Suvidha Kendra"
          />
        </div>
      </div>
    </div>
  );
}
