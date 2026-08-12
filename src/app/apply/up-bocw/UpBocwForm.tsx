"use client";

import { useState } from "react";
import type { Profile } from "@/lib/digilocker";

/* Fields the worker/agent supplies (never from DigiLocker). */
const SELF_DEFAULTS: Record<string, string> = {
  motherName: "Kamla Devi",
  marital: "Married",
  mandal: "Ayodhya",
  block: "Nawabganj",
  gramWard: "Rampur Bujurg",
  trade: "Mason (Rajmistri)",
  days: "96",
  employer: "Shakti Constructions Pvt Ltd, Lucknow",
  mobile: "98•••••10",
  bank: "State Bank of India",
  branch: "Barabanki",
  account: "XXXXXX4471",
  ifsc: "SBIN0001234",
  nomName: "Sunita Devi",
  nomRel: "Wife",
  nomAge: "32",
};

type Src = "dl" | "self" | "pd" | "otp";
type Field = {
  key: string;
  label: string; // "हिन्दी / English"
  group: string;
  src: Src;
  type?: "text" | "select";
  opts?: string[];
};

const FIELDS: Field[] = [
  { key: "aadhaar", label: "आधार (masked) / Aadhaar", group: "Identity / पहचान", src: "dl" },
  { key: "fullName", label: "नाम / Name", group: "Identity / पहचान", src: "dl" },
  { key: "relName", label: "पिता/पति / Father–Husband", group: "Identity / पहचान", src: "dl" },
  { key: "motherName", label: "माता / Mother", group: "Identity / पहचान", src: "self" },
  { key: "dob", label: "जन्म तिथि / DOB", group: "Identity / पहचान", src: "dl", type: "text" },
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
  { key: "village", label: "ग्राम / मोहल्ला", group: "Address / पता", src: "dl" },
  { key: "post", label: "पोस्ट / Post", group: "Address / पता", src: "dl" },
  { key: "pin", label: "पिन / PIN", group: "Address / पता", src: "dl" },
  { key: "trade", label: "कार्य / Trade", group: "Work / नियोजन", src: "self", type: "select", opts: ["Mason (Rajmistri)", "Carpenter (Barhai)", "Plumber", "Electrician", "Painter", "Welder", "Blacksmith (Lohar)", "Construction helper", "Road & bridge", "Well digger", "… (40+ trades)"] },
  { key: "days", label: "कार्य दिवस / Days worked", group: "Work / नियोजन", src: "self" },
  { key: "employer", label: "नियोजक / Employer & site", group: "Work / नियोजन", src: "self" },
  { key: "bank", label: "बैंक / Bank", group: "Bank (DBT) / बैंक", src: "pd" },
  { key: "branch", label: "शाखा / Branch", group: "Bank (DBT) / बैंक", src: "pd" },
  { key: "account", label: "खाता (masked) / A/C", group: "Bank (DBT) / बैंक", src: "pd" },
  { key: "ifsc", label: "IFSC", group: "Bank (DBT) / बैंक", src: "pd" },
  { key: "nomName", label: "नामिनी / Nominee", group: "Nominee / नामिनी", src: "self" },
  { key: "nomRel", label: "सम्बन्ध / Relation", group: "Nominee / नामिनी", src: "self", type: "select", opts: ["Wife", "Husband", "Son", "Daughter", "Mother", "Father"] },
  { key: "nomAge", label: "आयु / Age", group: "Nominee / नामिनी", src: "self" },
];

const DL_KEYS = new Set(FIELDS.filter((f) => f.src === "dl").map((f) => f.key));

const SRC_STYLE: Record<Src, string> = {
  dl: "bg-sky-100 text-sky-700 ring-sky-600/20",
  self: "bg-slate-100 text-slate-500 ring-slate-500/20",
  pd: "bg-emerald-100 text-emerald-700 ring-emerald-600/20",
  otp: "bg-emerald-100 text-emerald-700 ring-emerald-600/20",
};
const SRC_LABEL: Record<Src, string> = { dl: "DigiLocker", self: "self", pd: "penny-drop", otp: "OTP" };

/** Parse "yyyy-mm-dd" as a LOCAL date (avoids the UTC off-by-one drift). */
function parseDob(dob: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob || "");
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}
function ageOf(dob: string): number | null {
  const d = parseDob(dob);
  if (!d) return null;
  const t = new Date();
  let a = t.getFullYear() - d.getFullYear();
  const m = t.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < d.getDate())) a--;
  return a >= 0 && a < 130 ? a : null;
}
function fmtDob(dob: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob || "");
  return m ? `${m[3]}-${m[2]}-${m[1]}` : dob || "—";
}

export function UpBocwForm({
  profile,
  configured,
  connectedVia,
  error,
}: {
  profile: Profile | null;
  configured: boolean;
  connectedVia?: string;
  error?: string;
}) {
  const connected = Boolean(profile);
  const [model, setModel] = useState<Record<string, string>>(() => ({
    ...SELF_DEFAULTS,
    state: "Uttar Pradesh",
    ...(profile?.fields ?? {}),
  }));

  const set = (k: string, v: string) => setModel((m) => ({ ...m, [k]: v }));
  const V = (k: string) => model[k] || "";

  const age = ageOf(V("dob"));
  const days = parseInt(V("days"), 10);
  const ageOk = age !== null && age >= 18 && age <= 60;
  const daysOk = !isNaN(days) && days >= 90;
  const dlCount = FIELDS.filter((f) => f.src === "dl" && V(f.key)).length;

  const errText: Record<string, string> = {
    invalid_state: "Session expired — please connect again.",
    missing_code: "DigiLocker did not return an authorization code.",
    pull_failed: "Could not fetch documents from DigiLocker. Try again.",
    access_denied: "You declined the DigiLocker consent.",
  };

  const groups = [...new Set(FIELDS.map((f) => f.group))];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <style>{`@media print {
        body * { visibility: hidden !important; }
        #up-paper, #up-paper * { visibility: visible !important; }
        #up-paper { position: absolute; inset: 0; margin: 0; box-shadow: none !important; border: none !important; }
      }`}</style>

      <p className="text-xs font-mono uppercase tracking-widest text-emerald-700">SevaKhoj · Apply</p>
      <h1 className="mt-1 text-2xl font-bold text-slate-900">
        UP Construction Worker — Labour Card (BOCW <span className="font-serif">प्रपत्र-1</span>)
      </h1>
      <p className="mt-1 max-w-2xl text-sm text-slate-600">
        Connect DigiLocker to pull your verified identity &amp; address; add the rest; then review, e-sign and submit on
        upbocw.in. Your DigiLocker details fill automatically and can&apos;t be edited.
      </p>

      {error && (
        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-800">
          {errText[error] ?? `Error: ${error}`}
        </div>
      )}

      {/* DigiLocker connect card */}
      <div
        className={`mt-5 flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3 no-print ${
          connected ? "border-emerald-300 bg-emerald-50" : "border-sky-300 bg-sky-50"
        }`}
      >
        <div
          className={`grid h-9 w-9 flex-none place-items-center rounded-lg text-lg text-white ${
            connected ? "bg-emerald-600" : "bg-sky-700"
          }`}
        >
          {connected ? "✓" : "🔗"}
        </div>
        <div className="min-w-[180px] flex-1">
          <div className="text-sm font-semibold text-slate-800">
            {connected ? `DigiLocker connected — ${dlCount} fields pulled` : "Connect DigiLocker to auto-fill verified details"}
          </div>
          <div className="text-xs text-slate-600">
            {connected
              ? `Aadhaar eKYC + issued certificates${connectedVia === "mock" ? " · sandbox test identity" : ""}`
              : configured
                ? "You'll sign in to your own DigiLocker and consent"
                : "Sandbox mock mode — no partner credentials configured yet"}
          </div>
        </div>
        {connected ? (
          <a href="/api/digilocker/disconnect" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
            Disconnect
          </a>
        ) : (
          <a href="/api/digilocker/connect" className="rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800">
            Connect DigiLocker
          </a>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]">
        {/* profile editor */}
        <div className="no-print">
          <div className="mb-2 flex items-center gap-2">
            <span className="font-mono text-[0.62rem] uppercase tracking-widest text-emerald-700">Collected once</span>
            <h2 className="text-base font-semibold text-slate-900">Universal profile</h2>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            {groups.map((g) => (
              <div key={g} className="border-t border-slate-100 pt-3 first:border-t-0 first:pt-0 [&:not(:first-child)]:mt-3">
                <div className="mb-2 font-mono text-[0.62rem] uppercase tracking-widest text-slate-400">{g}</div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
                  {FIELDS.filter((f) => f.group === g).map((f) => {
                    const isDL = f.src === "dl";
                    const locked = isDL && !connected;
                    const readOnly = isDL && connected;
                    const wide = ["fullName", "relName", "employer", "aadhaar", "village", "motherName"].includes(f.key);
                    return (
                      <div key={f.key} className={wide ? "col-span-2" : ""}>
                        <label className="mb-0.5 flex items-center gap-1.5 text-[0.7rem] text-slate-500">
                          <span className="flex-1 leading-tight">{f.label}</span>
                          <span className={`rounded px-1 py-px font-mono text-[0.55rem] ring-1 ring-inset ${locked ? "bg-slate-50 text-slate-400 ring-slate-300" : SRC_STYLE[f.src]}`}>
                            {locked ? "🔒 DigiLocker" : SRC_LABEL[f.src]}
                          </span>
                        </label>
                        {f.type === "select" && !readOnly ? (
                          <select
                            value={V(f.key)}
                            onChange={(e) => set(f.key, e.target.value)}
                            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-2 py-1.5 text-sm text-slate-800 outline-none focus:border-emerald-500"
                          >
                            {f.opts!.map((o) => (
                              <option key={o} value={o}>{o}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            value={V(f.key)}
                            readOnly={readOnly}
                            disabled={locked}
                            placeholder={locked ? "🔒 via DigiLocker" : ""}
                            onChange={(e) => set(f.key, e.target.value)}
                            title={readOnly ? "Verified by DigiLocker — not editable" : undefined}
                            className={`w-full rounded-lg border px-2 py-1.5 text-sm outline-none focus:border-emerald-500 ${
                              readOnly
                                ? "border-sky-300 bg-sky-50 font-medium text-slate-800"
                                : locked
                                  ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                                  : "border-slate-300 bg-slate-50 text-slate-800"
                            }`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 flex gap-1.5 text-xs text-slate-500">
            <span>ⓘ</span>
            <span>
              <b className="text-sky-700">DigiLocker</b> = pulled on consent · <b className="text-emerald-700">penny-drop / OTP</b> = verified other ways · self = self-declared. Aadhaar &amp;
              A/C are masked; DigiLocker never returns the raw Aadhaar. Bank isn&apos;t a DigiLocker field — it&apos;s Account Aggregator / penny-drop.
            </span>
          </p>
        </div>

        {/* form preview */}
        <div>
          <div className="mb-2 flex items-center gap-2 no-print">
            <span className="font-mono text-[0.62rem] uppercase tracking-widest text-emerald-700">Generated draft</span>
            <h2 className="text-base font-semibold text-slate-900">UP BOCW Form-1</h2>
            <button
              onClick={() => window.print()}
              className="ml-auto rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Print / Save PDF
            </button>
          </div>

          <div id="up-paper" className="relative overflow-hidden rounded-md border border-slate-300 bg-white p-6 text-[13px] leading-snug text-slate-800 shadow-sm">
            <div className="absolute -right-11 top-9 rotate-[24deg] bg-rose-600 px-12 py-1 text-[10px] font-bold tracking-widest text-white opacity-90">
              DRAFT · NOT SUBMITTED
            </div>
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
                  <Row label={`2. ${V("relType") === "Husband" ? "पति" : "पिता"} / ${V("relType") === "Husband" ? "Husband" : "Father"}`} value={V("relName")} />
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
              <div className="grid h-[104px] w-[84px] place-items-center border border-slate-400 text-center text-[8.5px] text-slate-400">
                फोटो<br />Photo<br />{connected ? "✓ eKYC" : "(eKYC)"}
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
            <div className="flex items-center gap-2 py-1 text-[11.5px]">
              <span>14. विगत 12 माह में 90 दिन कार्य / ≥90 days&apos; work</span>
              <span className="ml-auto">
                <Box on={daysOk} /> हाँ/Yes &nbsp; <Box on={!daysOk} /> नहीं/No
              </span>
            </div>

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

            <div
              className={`mt-3 rounded-md border px-3 py-1.5 text-[11px] ${
                !V("dob")
                  ? "border-sky-200 bg-sky-50 text-sky-800"
                  : ageOk && daysOk
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-rose-200 bg-rose-50 text-rose-800"
              }`}
            >
              {!V("dob")
                ? "Connect DigiLocker to pull age, then the eligibility check runs."
                : ageOk && daysOk
                  ? `✓ पात्र / Eligible — age ${age} (18–60) and ${days} days' work (≥90). Ready to e-sign & submit on upbocw.in.`
                  : `✕ अपात्र / Not eligible — ${!ageOk ? `age must be 18–60 (now ${age ?? "?"})` : `needs ≥90 days' work (now ${isNaN(days) ? "?" : days})`}.`}
            </div>

            <div className="mt-3 border-t border-slate-200 pt-2 text-[10px] text-slate-600">
              <b>घोषणा / Declaration:</b> मैं घोषणा करता/करती हूँ कि उपर्युक्त विवरण सत्य है व मैं BOCW अधिनियम 1996 के अंतर्गत पंजीकरण हेतु आवेदन करता/करती हूँ। I
              consent to my documents being fetched from DigiLocker for this application.
            </div>
            <div className="mt-6 flex justify-between text-[10.5px] text-slate-600">
              <div className="text-center"><div className="mb-1 w-36 border-t border-slate-500" />दिनांक व स्थान / Date &amp; place</div>
              <div className="text-center"><div className="mb-1 w-36 border-t border-slate-500" />हस्ताक्षर / अंगूठा — Aadhaar eSign</div>
            </div>
            <div className="mt-3 border-t border-slate-100 pt-2 text-center text-[9px] text-slate-400">
              Draft generated by SevaKhoj from the applicant&apos;s own profile · not an official document · verify on upbocw.in before submission.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-end gap-1.5 py-0.5">
      <span className="whitespace-nowrap text-slate-700">{label}</span>
      <span className={`min-h-[1.2em] flex-1 border-b border-dotted border-slate-400 bg-emerald-50/50 px-1 ${value ? "font-semibold text-slate-900" : "italic text-slate-400"}`}>
        {value || "—"}
      </span>
    </div>
  );
}
function Sec({ children }: { children: React.ReactNode }) {
  return <div className="mt-3 mb-1.5 border border-slate-200 bg-slate-100 px-2 py-1 text-[11.5px] font-bold text-slate-700">{children}</div>;
}
function Box({ on }: { on: boolean }) {
  return <span className="inline-grid h-3 w-3 place-items-center border border-slate-600 align-[-2px] text-[9px]">{on ? "✓" : ""}</span>;
}
