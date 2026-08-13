"use client";

/**
 * Shared assisted-application engine for state social-security pensions
 * (old-age / widow / disability). Same profile → pre-filled official form
 * pattern as the BOCW worker flow, but with pension-specific fields and an
 * advisory eligibility check per pension type. One <PensionApply/> serves all
 * three pension types for a state; a thin per-state page supplies the config.
 */

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
  ageOf,
  fmtDob,
} from "@/components/bocwApply";

export type PensionKind = "old-age" | "widow" | "disability";

export type PensionConfig = {
  state: string;
  applyPath: string; // "/apply/up-pension"
  portalName: string; // "SSPY"
  portalUrl: string; // "https://sspy-up.gov.in/"
  orgLocal: string; // dept name in local script (Devanagari)
  orgEn: string;
  deptLine: string; // small grey sub-line
  incomeLimit: number; // default annual family-income ceiling for the advisory check
  incomeNote: string; // human description of the default ceiling
  residenceNote?: string; // e.g. "5+ years' residence in Delhi"
  oldAgeMin: number; // usually 60
  oldAgeMinFemale?: number; // e.g. Rajasthan: women 55, men 58
  widowMin: number; // usually 18
  widowMax?: number | null; // Delhi has none; UP splits at 60 → old-age
  disabilityMax?: number | null;
  // A scheme may override the income ceiling per pension type (e.g. Rajasthan:
  // disability ₹60k, old-age/widow ₹48k). Falls back to the config-level ceiling.
  schemes: Record<PensionKind, { local: string; en: string; amount: string; incomeLimit?: number; incomeNote?: string }>;
};

const KIND_LABEL: Record<PensionKind, string> = {
  "old-age": "Old-age pension",
  widow: "Widow / women-in-distress pension",
  disability: "Disability (Divyangjan) pension",
};

const KINDS: PensionKind[] = ["old-age", "widow", "disability"];

/* ------------------------------------------------------------- field config */

function fieldsFor(kind: PensionKind): FieldCfg[] {
  const identity: FieldCfg[] = [
    { key: "aadhaar", label: "आधार (masked) / Aadhaar", group: "Identity / पहचान", src: "self", wide: true },
    { key: "fullName", label: "नाम / Name", group: "Identity / पहचान", src: "self", wide: true },
    { key: "relType", label: "पिता/पति / Guardian", group: "Identity / पहचान", src: "self", type: "select", opts: ["Father", "Husband"] },
    { key: "relName", label: "पिता/पति का नाम / Father–Husband", group: "Identity / पहचान", src: "self", wide: true },
    { key: "dob", label: "जन्म तिथि / DOB", group: "Identity / पहचान", src: "self" },
    { key: "gender", label: "लिंग / Gender", group: "Identity / पहचान", src: "self", type: "select", opts: ["Male", "Female", "Other"] },
    { key: "category", label: "श्रेणी / Category", group: "Identity / पहचान", src: "self", type: "select", opts: ["General", "OBC", "SC", "ST", "Minority"] },
    { key: "marital", label: "वैवाहिक / Marital", group: "Identity / पहचान", src: "self", type: "select", opts: ["Married", "Unmarried", "Widowed", "Divorced", "Separated"] },
    { key: "mobile", label: "मोबाइल / Mobile", group: "Identity / पहचान", src: "self" },
  ];

  const address: FieldCfg[] = [
    { key: "village", label: "ग्राम / मोहल्ला / Village–Area", group: "Address / पता", src: "self", wide: true },
    { key: "tehsil", label: "तहसील / Tehsil", group: "Address / पता", src: "self" },
    { key: "block", label: "विकास खण्ड / Block", group: "Address / पता", src: "self" },
    { key: "district", label: "जनपद / District", group: "Address / पता", src: "self" },
    { key: "pin", label: "पिन / PIN", group: "Address / पता", src: "self" },
  ];

  const income: FieldCfg[] = [
    { key: "income", label: "वार्षिक पारिवारिक आय ₹ / Annual family income", group: "Income / आय", src: "self" },
    { key: "incomeCert", label: "आय प्रमाण-पत्र सं. / Income certificate no.", group: "Income / आय", src: "self" },
  ];

  const widow: FieldCfg[] = [
    { key: "spouseName", label: "पति का नाम (दिवंगत) / Late husband's name", group: "Widow details / वैधव्य विवरण", src: "self", wide: true },
    { key: "deathCert", label: "मृत्यु प्रमाण-पत्र सं. / Death certificate no.", group: "Widow details / वैधव्य विवरण", src: "self", wide: true },
  ];

  const disability: FieldCfg[] = [
    { key: "disabilityType", label: "दिव्यांगता प्रकार / Disability type", group: "Disability / दिव्यांगता", src: "self" },
    { key: "disabilityPct", label: "दिव्यांगता % / Disability %", group: "Disability / दिव्यांगता", src: "self" },
    { key: "udid", label: "UDID / दिव्यांगता प्रमाण-पत्र सं.", group: "Disability / दिव्यांगता", src: "self", wide: true },
  ];

  const bank: FieldCfg[] = [
    { key: "bank", label: "बैंक / Bank", group: "Bank (DBT) / बैंक", src: "self" },
    { key: "branch", label: "शाखा / Branch", group: "Bank (DBT) / बैंक", src: "self" },
    { key: "account", label: "खाता (masked) / A/C", group: "Bank (DBT) / बैंक", src: "self" },
    { key: "ifsc", label: "IFSC", group: "Bank (DBT) / बैंक", src: "self" },
  ];

  return [
    ...identity,
    ...address,
    ...income,
    ...(kind === "widow" ? widow : []),
    ...(kind === "disability" ? disability : []),
    ...bank,
  ];
}

/* --------------------------------------------------------------- eligibility */

type Elig = { level: "yes" | "no" | "wait"; reasons: string[] };

function toInt(s: string): number | null {
  const n = parseInt((s || "").replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(n) ? n : null;
}

function assess(kind: PensionKind, m: Record<string, string>, cfg: PensionConfig): Elig {
  const reasons: string[] = [];
  const fails: string[] = [];
  let missing = false;

  const age = ageOf(m.dob || "");
  const income = toInt(m.income || "");
  const incomeLimit = cfg.schemes[kind].incomeLimit ?? cfg.incomeLimit;

  if (kind === "old-age") {
    const min = m.gender === "Female" && cfg.oldAgeMinFemale ? cfg.oldAgeMinFemale : cfg.oldAgeMin;
    if (age === null) missing = true;
    else if (age < min) fails.push(`Age ${age} is below ${min} — this is an old-age pension.`);
    else reasons.push(`Age ${age} ≥ ${min} ✓`);
  }

  if (kind === "widow") {
    if (m.gender && m.gender !== "Female") fails.push("Applicant must be a woman.");
    if (m.marital && /^(married|unmarried)$/i.test(m.marital)) fails.push("Marital status should be Widowed / Divorced / Separated.");
    if (age === null) missing = true;
    else if (age < cfg.widowMin) fails.push(`Age ${age} is below ${cfg.widowMin}.`);
    else if (cfg.widowMax && age > cfg.widowMax) fails.push(`Above ${cfg.widowMax} — apply for the old-age pension instead.`);
    else reasons.push(`Age ${age} ✓`);
  }

  if (kind === "disability") {
    const pct = toInt(m.disabilityPct || "");
    if (pct === null) missing = true;
    else if (pct < 40) fails.push(`Disability ${pct}% is below the 40% minimum.`);
    else reasons.push(`Disability ${pct}% ≥ 40% ✓`);
    if (cfg.disabilityMax && age !== null && age > cfg.disabilityMax) reasons.push(`Note: above ${cfg.disabilityMax}, the old-age pension may apply instead.`);
  }

  if (income === null) missing = true;
  else if (income > incomeLimit) fails.push(`Family income ₹${income.toLocaleString("en-IN")} exceeds the ₹${incomeLimit.toLocaleString("en-IN")} ceiling.`);
  else reasons.push(`Income within the ₹${incomeLimit.toLocaleString("en-IN")} ceiling ✓`);

  if (fails.length) return { level: "no", reasons: fails };
  if (missing) return { level: "wait", reasons: ["Fill date of birth, income" + (kind === "disability" ? " and disability %" : "") + " to check eligibility."] };
  return { level: "yes", reasons };
}

function EligBanner({ elig, cfg }: { elig: Elig; cfg: PensionConfig }) {
  const style =
    elig.level === "yes"
      ? "border-emerald-300 bg-emerald-50 text-emerald-900"
      : elig.level === "no"
        ? "border-rose-300 bg-rose-50 text-rose-900"
        : "border-amber-300 bg-amber-50 text-amber-900";
  const head =
    elig.level === "yes" ? "Likely eligible" : elig.level === "no" ? "Likely not eligible" : "Add a little more";
  return (
    <div className={`mt-3 rounded border px-3 py-2 text-[11px] ${style}`}>
      <b>{head}</b> — {elig.reasons.join(" ")}{" "}
      <span className="opacity-70">Advisory only; the final decision rests with the {cfg.portalName} portal / verifying officer.</span>
    </div>
  );
}

/* ---------------------------------------------------------------- component */

const ERR: Record<string, string> = {
  invalid_state: "Session expired — please connect again.",
  missing_code: "DigiLocker did not return an authorization code.",
  pull_failed: "Could not fetch documents from DigiLocker. Try again.",
  access_denied: "You declined the DigiLocker consent.",
};

export function PensionApply({
  config,
  profile,
  configured,
  signedIn,
  error,
  initialType,
}: {
  config: PensionConfig;
  profile: Profile | null;
  configured: boolean;
  signedIn: boolean;
  error?: string;
  initialType: PensionKind;
}) {
  const dlVerified = Boolean(profile) && Object.values(profile?.source ?? {}).some((s) => /DigiLocker/i.test(s));
  const [kind, setKind] = useState<PensionKind>(initialType);
  const [model, setModel] = useState<Record<string, string>>(() => ({ state: config.state, ...(profile?.fields ?? {}) }));
  const set = (k: string, v: string) => setModel((m) => ({ ...m, [k]: v }));
  const V = (k: string) => model[k] || "";

  const fields = fieldsFor(kind);
  const scheme = config.schemes[kind];
  const elig = assess(kind, model, config);
  const paperId = `${config.applyPath.replace(/\W+/g, "")}-paper`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <PrintStyle id={paperId} />
      <p className="text-xs font-mono uppercase tracking-widest text-emerald-700">SevaKhoj · Apply</p>
      <h1 className="mt-1 text-2xl font-bold text-slate-900">
        {config.state} Social-Security Pension — {KIND_LABEL[kind]}
      </h1>
      <p className="mt-1 max-w-2xl text-sm text-slate-600">
        Enter your details once — they&apos;re saved and reused across every scheme form. Review the generated form,
        then submit online (with the required documents) on{" "}
        <a href={config.portalUrl} target="_blank" rel="noreferrer" className="text-emerald-700 underline">
          {config.portalName}
        </a>
        .
      </p>

      {error && <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-800">{ERR[error] ?? `Error: ${error}`}</div>}

      {/* pension-type selector */}
      <div className="mt-5 flex flex-wrap gap-2 no-print">
        {KINDS.map((k) => (
          <button
            key={k}
            onClick={() => setKind(k)}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
              k === kind ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            {KIND_LABEL[k]}
          </button>
        ))}
      </div>

      <ProfileBar configured={configured} dlVerified={dlVerified} signedIn={signedIn} applyPath={config.applyPath} getFields={() => { const { state, ...rest } = model; void state; return rest; }} />

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]">
        <div className="no-print">
          <div className="mb-2 flex items-center gap-2">
            <span className="font-mono text-[0.62rem] uppercase tracking-widest text-emerald-700">Collected once</span>
            <h2 className="text-base font-semibold text-slate-900">Universal profile</h2>
          </div>
          <PhotoField value={V("photo")} onChange={(v) => set("photo", v)} />
          <ProfileEditor fields={fields} value={V} dlVerified={dlVerified} onSet={set} />
          <p className="mt-3 flex gap-1.5 text-xs text-slate-500">
            <span>ⓘ</span>
            <span>All fields are self-declared — enter them exactly as on your Aadhaar, income &amp; (if any) disability certificate. Hit <b>Save my details</b> and they carry to every other form.</span>
          </p>
        </div>

        <div>
          <div className="mb-2 flex items-center gap-2 no-print">
            <span className="font-mono text-[0.62rem] uppercase tracking-widest text-emerald-700">Generated draft</span>
            <h2 className="text-base font-semibold text-slate-900">{scheme.en}</h2>
            <button onClick={() => window.print()} className="ml-auto rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700">Print / Save PDF</button>
          </div>

          <div id={paperId} className="relative overflow-hidden rounded-md border border-slate-300 bg-white p-6 text-[13px] leading-snug text-slate-800 shadow-sm">
            <div className="absolute -right-11 top-9 rotate-[24deg] bg-rose-600 px-12 py-1 text-[10px] font-bold tracking-widest text-white opacity-90">DRAFT · NOT SUBMITTED</div>

            <div className="border-b-2 border-slate-800 pb-2 text-center">
              <div className="font-serif text-[13px] font-bold">{config.orgLocal}</div>
              <div className="text-[12px] font-bold">{config.orgEn}</div>
              <div className="text-[10.5px] text-slate-600">{config.deptLine}</div>
            </div>
            <div className="py-2 text-center">
              <div className="font-serif text-[12px] font-bold">{scheme.local}</div>
              <div className="text-[12px] font-bold">{scheme.en}</div>
              <div className="text-[10.5px] text-slate-600">आवेदन पत्र / Application for pension — {scheme.amount}</div>
            </div>

            <div className="mt-2 grid grid-cols-3 gap-x-4 rounded border border-slate-300 bg-slate-50 px-2 py-1.5">
              <Row label="आधार / Aadhaar" value={V("aadhaar")} />
              <Row label="जनपद / District" value={V("district")} />
              <Row label="तहसील / Tehsil" value={V("tehsil")} />
            </div>

            <Sec>क · व्यक्तिगत विवरण / Personal details</Sec>
            <div className="grid grid-cols-[1fr_84px] gap-3">
              <div>
                <Row label="1. नाम / Name" value={V("fullName")} />
                <div className="grid grid-cols-2 gap-x-4">
                  <Row label={`2. ${V("relType") === "Husband" ? "पति / Husband" : "पिता / Father"}`} value={V("relName")} />
                  <Row label="3. जन्म तिथि / DOB" value={V("dob") ? fmtDob(V("dob")) : ""} />
                  <Row label="आयु / Age" value={ageOf(V("dob")) !== null ? String(ageOf(V("dob"))) : ""} />
                  <Row label="4. लिंग / Gender" value={V("gender")} />
                  <Row label="5. श्रेणी / Category" value={V("category")} />
                  <Row label="6. वैवाहिक / Marital" value={V("marital")} />
                  <Row label="7. मोबाइल / Mobile" value={V("mobile")} />
                </div>
              </div>
              <div className="grid h-[104px] w-[84px] place-items-center overflow-hidden border border-slate-400 text-center text-[8.5px] text-slate-400">
                {V("photo") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={V("photo")} alt="applicant" className="h-full w-full object-cover" />
                ) : (
                  <span>फोटो<br />Photo<br />(attach)</span>
                )}
              </div>
            </div>

            <Sec>ख · पता / Address</Sec>
            <Row label="8. ग्राम / मोहल्ला / Village–Area" value={V("village")} />
            <div className="grid grid-cols-3 gap-x-4">
              <Row label="विकास खण्ड / Block" value={V("block")} />
              <Row label="तहसील / Tehsil" value={V("tehsil")} />
              <Row label="जनपद / District" value={V("district")} />
              <Row label="पिन / PIN" value={V("pin")} />
              <Row label="राज्य / State" value={config.state} />
            </div>

            <Sec>ग · आय / Income</Sec>
            <div className="grid grid-cols-2 gap-x-4">
              <Row label="9. वार्षिक पारिवारिक आय ₹ / Annual family income" value={V("income")} />
              <Row label="आय प्रमाण-पत्र सं. / Income certificate" value={V("incomeCert")} />
            </div>
            <div className="py-1 text-[10.5px] text-slate-600">पात्रता आय सीमा / Eligible income ceiling: {scheme.incomeNote ?? config.incomeNote}{config.residenceNote ? ` · ${config.residenceNote}` : ""}</div>

            {kind === "widow" ? (
              <>
                <Sec>घ · वैधव्य विवरण / Widow details</Sec>
                <div className="grid grid-cols-2 gap-x-4">
                  <Row label="10. पति का नाम (दिवंगत) / Late husband" value={V("spouseName")} />
                  <Row label="मृत्यु प्रमाण-पत्र सं. / Death certificate" value={V("deathCert")} />
                </div>
              </>
            ) : null}

            {kind === "disability" ? (
              <>
                <Sec>घ · दिव्यांगता विवरण / Disability details</Sec>
                <div className="grid grid-cols-3 gap-x-4">
                  <Row label="10. प्रकार / Type" value={V("disabilityType")} />
                  <Row label="दिव्यांगता % / %" value={V("disabilityPct")} />
                  <Row label="UDID / प्रमाण-पत्र सं." value={V("udid")} />
                </div>
              </>
            ) : null}

            <Sec>{kind === "old-age" ? "घ" : "ङ"} · बैंक विवरण (DBT) / Bank details</Sec>
            <div className="grid grid-cols-3 gap-x-4">
              <Row label="बैंक / Bank" value={V("bank")} />
              <Row label="शाखा / Branch" value={V("branch")} />
              <Row label="IFSC" value={V("ifsc")} />
            </div>
            <Row label="खाता (masked) / A/C no." value={V("account")} />

            <EligBanner elig={elig} cfg={config} />

            <div className="mt-3 border-t border-slate-200 pt-2 text-[10px] text-slate-600">
              <b>घोषणा / Declaration:</b> मैं घोषणा करता/करती हूँ कि उपर्युक्त विवरण सत्य है तथा मैं इस पेंशन हेतु पात्र हूँ। I declare that the above particulars are true and I am eligible for this pension.
            </div>
            <div className="mt-6 flex justify-between text-[10.5px] text-slate-600">
              <div className="text-center"><div className="mb-1 w-36 border-t border-slate-500" />दिनांक व स्थान / Date &amp; place</div>
              <div className="text-center"><div className="mb-1 w-36 border-t border-slate-500" />हस्ताक्षर / अंगूठा — Signature / Thumb</div>
            </div>
            <div className="mt-3 border-t border-slate-100 pt-2 text-center text-[9px] text-slate-400">
              Draft generated by SevaKhoj from the applicant&apos;s own profile · not an official document · verify &amp; submit on {config.portalName} ({config.portalUrl}) before it counts.
            </div>
          </div>

          <SubmitSteps
            portalName={config.portalName}
            portalUrl={config.portalUrl}
            applyLabel="pension application"
            docs={
              kind === "widow"
                ? "Aadhaar, bank passbook, income certificate and the husband's death certificate"
                : kind === "disability"
                  ? "Aadhaar, bank passbook, income certificate and the 40%+ disability certificate / UDID"
                  : "Aadhaar, bank passbook, age proof and income certificate"
            }
            csc="any CSC / e-Mitra / common service centre"
          />
        </div>
      </div>
    </div>
  );
}
