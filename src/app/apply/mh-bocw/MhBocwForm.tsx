"use client";

import { useState } from "react";
import type { Profile } from "@/lib/digilocker";
import {
  type FieldCfg,
  DigiLockerCard,
  ProfileEditor,
  PrintStyle,
  Row,
  Sec,
  Box,
  EligBanner,
  ageOf,
  fmtDob,
} from "@/components/bocwApply";

const APPLY_PATH = "/apply/mh-bocw";

const SELF_DEFAULTS: Record<string, string> = {
  motherName: "Kamla Devi", marital: "Married", trade: "गवंडी / Mason", days: "110",
  employer: "Shree Constructions, Pune", mobile: "98•••••10",
  bank: "State Bank of India", branch: "Pune Camp", account: "XXXXXX4471", ifsc: "SBIN0002345",
  nomName: "Sunita Devi", nomRel: "Wife", nomAge: "32",
};

const FIELDS: FieldCfg[] = [
  { key: "aadhaar", label: "आधार (masked) / Aadhaar", group: "Identity / ओळख", src: "dl", wide: true },
  { key: "fullName", label: "नाव / Name", group: "Identity / ओळख", src: "dl", wide: true },
  { key: "relName", label: "वडील/पती / Father–Husband", group: "Identity / ओळख", src: "dl", wide: true },
  { key: "motherName", label: "आई / Mother", group: "Identity / ओळख", src: "self", wide: true },
  { key: "dob", label: "जन्मतारीख / DOB", group: "Identity / ओळख", src: "dl" },
  { key: "gender", label: "लिंग / Gender", group: "Identity / ओळख", src: "dl" },
  { key: "category", label: "प्रवर्ग / Category", group: "Identity / ओळख", src: "dl" },
  { key: "marital", label: "वैवाहिक / Marital", group: "Identity / ओळख", src: "self", type: "select", opts: ["Married", "Unmarried", "Widowed"] },
  { key: "mobile", label: "मोबाईल / Mobile", group: "Identity / ओळख", src: "otp" },
  { key: "rationCard", label: "शिधापत्रिका / Ration card", group: "Identity / ओळख", src: "dl" },
  { key: "village", label: "गाव / भाग / Village–Area", group: "Address / पत्ता", src: "dl", wide: true },
  { key: "tehsil", label: "तालुका / Taluka", group: "Address / पत्ता", src: "dl" },
  { key: "district", label: "जिल्हा / District", group: "Address / पत्ता", src: "dl" },
  { key: "post", label: "पोस्ट / Post", group: "Address / पत्ता", src: "dl" },
  { key: "pin", label: "पिन / PIN", group: "Address / पत्ता", src: "dl" },
  { key: "trade", label: "कामाचा प्रकार / Trade", group: "Work / रोजगार", src: "self", type: "select", opts: ["गवंडी / Mason", "सुतार / Carpenter", "प्लंबर / Plumber", "इलेक्ट्रिशियन / Electrician", "रंगारी / Painter", "वेल्डर / Welder", "लोहार / Blacksmith", "बांधकाम मजूर / Helper", "रस्ता-पूल / Road & bridge", "… (इतर / other)"] },
  { key: "days", label: "कामाचे दिवस / Days worked", group: "Work / रोजगार", src: "self" },
  { key: "employer", label: "मालक / Employer & site", group: "Work / रोजगार", src: "self", wide: true },
  { key: "bank", label: "बँक / Bank", group: "Bank (DBT) / बँक", src: "pd" },
  { key: "branch", label: "शाखा / Branch", group: "Bank (DBT) / बँक", src: "pd" },
  { key: "account", label: "खाते (masked) / A/C", group: "Bank (DBT) / बँक", src: "pd" },
  { key: "ifsc", label: "IFSC", group: "Bank (DBT) / बँक", src: "pd" },
  { key: "nomName", label: "वारसदार / Nominee", group: "Nominee / वारसदार", src: "self" },
  { key: "nomRel", label: "नाते / Relation", group: "Nominee / वारसदार", src: "self", type: "select", opts: ["Wife", "Husband", "Son", "Daughter", "Mother", "Father"] },
  { key: "nomAge", label: "वय / Age", group: "Nominee / वारसदार", src: "self" },
];

const ERR: Record<string, string> = {
  invalid_state: "Session expired — please connect again.",
  missing_code: "DigiLocker did not return an authorization code.",
  pull_failed: "Could not fetch documents from DigiLocker. Try again.",
  access_denied: "You declined the DigiLocker consent.",
};

export function MhBocwForm({ profile, configured, connectedVia, error }: { profile: Profile | null; configured: boolean; connectedVia?: string; error?: string }) {
  const connected = Boolean(profile);
  const [model, setModel] = useState<Record<string, string>>(() => ({ ...SELF_DEFAULTS, state: "Maharashtra", ...(profile?.fields ?? {}) }));
  const set = (k: string, v: string) => setModel((m) => ({ ...m, [k]: v }));
  const V = (k: string) => model[k] || "";
  const age = ageOf(V("dob"));
  const daysOk = parseInt(V("days"), 10) >= 90;
  const dlCount = FIELDS.filter((f) => f.src === "dl" && V(f.key)).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <PrintStyle id="mh-paper" />
      <p className="text-xs font-mono uppercase tracking-widest text-emerald-700">SevaKhoj · Apply</p>
      <h1 className="mt-1 text-2xl font-bold text-slate-900">Maharashtra Construction Worker — <span className="font-serif">बांधकाम कामगार नोंदणी</span> (MahaBOCW)</h1>
      <p className="mt-1 max-w-2xl text-sm text-slate-600">Same DigiLocker pull, a different state&apos;s form. Connect once and your verified identity flows into MahaBOCW too; add the rest and submit on mahabocw.in.</p>

      {error && <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-800">{ERR[error] ?? `Error: ${error}`}</div>}

      <DigiLockerCard connected={connected} configured={configured} connectedVia={connectedVia} applyPath={APPLY_PATH} dlCount={dlCount} />

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]">
        <div className="no-print">
          <div className="mb-2 flex items-center gap-2">
            <span className="font-mono text-[0.62rem] uppercase tracking-widest text-emerald-700">Collected once</span>
            <h2 className="text-base font-semibold text-slate-900">Universal profile</h2>
          </div>
          <ProfileEditor fields={FIELDS} value={V} connected={connected} onSet={set} />
          <p className="mt-3 flex gap-1.5 text-xs text-slate-500"><span>ⓘ</span><span>The DigiLocker fields are the <b>same profile</b> that filled the UP form — one pull, many forms. Maharashtra uses <b>Taluka</b> (from Aadhaar sub-district) and no Mandal/Block.</span></p>
        </div>

        <div>
          <div className="mb-2 flex items-center gap-2 no-print">
            <span className="font-mono text-[0.62rem] uppercase tracking-widest text-emerald-700">Generated draft</span>
            <h2 className="text-base font-semibold text-slate-900">MahaBOCW नोंदणी अर्ज</h2>
            <button onClick={() => window.print()} className="ml-auto rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700">Print / Save PDF</button>
          </div>

          <div id="mh-paper" className="relative overflow-hidden rounded-md border border-slate-300 bg-white p-6 text-[13px] leading-snug text-slate-800 shadow-sm">
            <div className="absolute -right-11 top-9 rotate-[24deg] bg-rose-600 px-12 py-1 text-[10px] font-bold tracking-widest text-white opacity-90">DRAFT · NOT SUBMITTED</div>
            <div className="border-b-2 border-slate-800 pb-2 text-center">
              <div className="font-serif text-[13px] font-bold">महाराष्ट्र इमारत व इतर बांधकाम कामगार कल्याणकारी मंडळ</div>
              <div className="text-[12px] font-bold">Maharashtra Building &amp; Other Construction Workers Welfare Board</div>
              <div className="text-[10.5px] text-slate-600">कामगार विभाग, महाराष्ट्र शासन · Labour Department, Govt. of Maharashtra</div>
            </div>
            <div className="py-2 text-center">
              <div className="text-[12px] font-bold">नोंदणी अर्ज — बांधकाम कामगार (लाभार्थी नोंदणी)</div>
              <div className="text-[10.5px] text-slate-600">Application for registration of a construction worker as a beneficiary</div>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-x-4 rounded border border-slate-300 bg-slate-50 px-2 py-1.5">
              <Row label="आधार / Aadhaar" value={V("aadhaar")} />
              <Row label="जिल्हा / District" value={V("district")} />
              <Row label="तालुका / Taluka" value={V("tehsil")} />
            </div>

            <Sec>अ · वैयक्तिक माहिती / Personal details</Sec>
            <div className="grid grid-cols-[1fr_84px] gap-3">
              <div>
                <Row label="1. नाव / Name" value={V("fullName")} />
                <div className="grid grid-cols-2 gap-x-4">
                  <Row label={`2. ${V("relType") === "Husband" ? "पती / Husband" : "वडील / Father"}`} value={V("relName")} />
                  <Row label="3. आई / Mother" value={V("motherName")} />
                  <Row label="4. जन्मतारीख / DOB" value={V("dob") ? fmtDob(V("dob")) : ""} />
                  <Row label="वय / Age" value={age !== null ? String(age) : ""} />
                  <Row label="5. लिंग / Gender" value={V("gender")} />
                  <Row label="6. प्रवर्ग / Category" value={V("category")} />
                  <Row label="7. वैवाहिक / Marital" value={V("marital")} />
                  <Row label="8. मोबाईल / Mobile" value={V("mobile")} />
                </div>
                <Row label="9. शिधापत्रिका / Ration card" value={V("rationCard")} />
              </div>
              <div className="grid h-[104px] w-[84px] place-items-center border border-slate-400 text-center text-[8.5px] text-slate-400">फोटो<br />Photo<br />{connected ? "✓ eKYC" : "(eKYC)"}</div>
            </div>

            <Sec>ब · कायमचा पत्ता / Permanent address</Sec>
            <Row label="10. गाव / भाग / Village–Area" value={V("village")} />
            <div className="grid grid-cols-3 gap-x-4">
              <Row label="तालुका / Taluka" value={V("tehsil")} />
              <Row label="जिल्हा / District" value={V("district")} />
              <Row label="पोस्ट / Post" value={V("post")} />
              <Row label="पिन / PIN" value={V("pin")} />
              <Row label="राज्य / State" value="Maharashtra" />
            </div>

            <Sec>क · रोजगाराचा तपशील / Nature of employment</Sec>
            <div className="grid grid-cols-2 gap-x-4">
              <Row label="11. कामाचा प्रकार / Trade" value={V("trade")} />
              <Row label="12. कामाचे दिवस / Days worked" value={V("days")} />
            </div>
            <Row label="13. मालक / Employer & site" value={V("employer")} />
            <div className="flex items-center gap-2 py-1 text-[11.5px]"><span>14. मागील 12 महिन्यांत 90 दिवस काम / ≥90 days&apos; work</span><span className="ml-auto"><Box on={daysOk} /> होय/Yes &nbsp; <Box on={!daysOk} /> नाही/No</span></div>

            <Sec>ड · बँक तपशील (DBT) / Bank details</Sec>
            <div className="grid grid-cols-3 gap-x-4">
              <Row label="15. बँक / Bank" value={V("bank")} />
              <Row label="शाखा / Branch" value={V("branch")} />
              <Row label="IFSC" value={V("ifsc")} />
            </div>
            <Row label="खाते (masked) / A/C no." value={V("account")} />

            <Sec>इ · वारसदार / Nominee</Sec>
            <div className="grid grid-cols-3 gap-x-4">
              <Row label="16. नाव / Name" value={V("nomName")} />
              <Row label="नाते / Relation" value={V("nomRel")} />
              <Row label="वय / Age" value={V("nomAge")} />
            </div>

            <div className="mt-2 grid grid-cols-2 gap-x-4">
              <Row label="नोंदणी शुल्क / Reg. fee" value="नियमानुसार / as notified" />
              <Row label="वर्गणी / Contribution" value="₹1 / वर्ष (confirm)" />
            </div>

            <EligBanner dob={V("dob")} days={V("days")} />

            <div className="mt-3 border-t border-slate-200 pt-2 text-[10px] text-slate-600"><b>घोषणा / Declaration:</b> मी घोषित करतो/करते की वरील माहिती खरी आहे व मी BOCW कायदा 1996 अंतर्गत नोंदणीसाठी अर्ज करतो/करते. I consent to my documents being fetched from DigiLocker for this application.</div>
            <div className="mt-6 flex justify-between text-[10.5px] text-slate-600"><div className="text-center"><div className="mb-1 w-36 border-t border-slate-500" />दिनांक व ठिकाण / Date &amp; place</div><div className="text-center"><div className="mb-1 w-36 border-t border-slate-500" />सही / अंगठा — Aadhaar eSign</div></div>
            <div className="mt-3 border-t border-slate-100 pt-2 text-center text-[9px] text-slate-400">Draft generated by SevaKhoj from the applicant&apos;s own profile · not an official document · verify on mahabocw.in before submission.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
