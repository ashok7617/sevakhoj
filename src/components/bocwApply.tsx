"use client";

/**
 * Shared engine for the BOCW scheme-application pattern. Each state supplies a
 * field list + its own paper-form layout; everything else (DigiLocker connect,
 * profile editor, eligibility, print, form primitives) lives here.
 */

import type { ReactNode } from "react";

export type Src = "dl" | "self" | "pd" | "otp";
export type FieldCfg = {
  key: string;
  label: string; // "देवनागरी / English"
  group: string;
  src: Src;
  type?: "text" | "select";
  opts?: string[];
  wide?: boolean;
};

export const SRC_STYLE: Record<Src, string> = {
  dl: "bg-sky-100 text-sky-700 ring-sky-600/20",
  self: "bg-slate-100 text-slate-500 ring-slate-500/20",
  pd: "bg-emerald-100 text-emerald-700 ring-emerald-600/20",
  otp: "bg-emerald-100 text-emerald-700 ring-emerald-600/20",
};
export const SRC_LABEL: Record<Src, string> = { dl: "DigiLocker", self: "self", pd: "penny-drop", otp: "OTP" };

/* ---- date + eligibility (shared BOCW rule: age 18–60, ≥90 days in 12 mo.) -- */

function parseDob(dob: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob || "");
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
}
export function ageOf(dob: string): number | null {
  const d = parseDob(dob);
  if (!d) return null;
  const t = new Date();
  let a = t.getFullYear() - d.getFullYear();
  const m = t.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < d.getDate())) a--;
  return a >= 0 && a < 130 ? a : null;
}
export function fmtDob(dob: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob || "");
  return m ? `${m[3]}-${m[2]}-${m[1]}` : dob || "—";
}
export function eligibility(dob: string, daysStr: string): { level: "wait" | "yes" | "no"; text: string } {
  const age = ageOf(dob);
  const days = parseInt(daysStr, 10);
  if (!dob) return { level: "wait", text: "Connect DigiLocker to pull age, then the eligibility check runs." };
  const ageOk = age !== null && age >= 18 && age <= 60;
  const daysOk = !isNaN(days) && days >= 90;
  if (ageOk && daysOk)
    return { level: "yes", text: `✓ Eligible — age ${age} (18–60) and ${days} days' work (≥90). Ready to e-sign & submit.` };
  const why = !ageOk ? `age must be 18–60 (now ${age ?? "?"})` : `needs ≥90 days' work (now ${isNaN(days) ? "?" : days})`;
  return { level: "no", text: `✕ Not eligible — ${why}.` };
}

/* ------------------------------------------------------------- print helper */

export function PrintStyle({ id }: { id: string }) {
  return (
    <style>{`@media print {
      body * { visibility: hidden !important; }
      #${id}, #${id} * { visibility: visible !important; }
      #${id} { position: absolute; inset: 0; margin: 0; box-shadow: none !important; border: none !important; }
    }`}</style>
  );
}

/* --------------------------------------------------------- DigiLocker card */

export function DigiLockerCard({
  connected,
  configured,
  connectedVia,
  applyPath,
  dlCount,
}: {
  connected: boolean;
  configured: boolean;
  connectedVia?: string;
  applyPath: string;
  dlCount: number;
}) {
  return (
    <div
      className={`mt-5 flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3 no-print ${
        connected ? "border-emerald-300 bg-emerald-50" : "border-sky-300 bg-sky-50"
      }`}
    >
      <div className={`grid h-9 w-9 flex-none place-items-center rounded-lg text-lg text-white ${connected ? "bg-emerald-600" : "bg-sky-700"}`}>
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
        <a href={`/api/digilocker/disconnect?next=${encodeURIComponent(applyPath)}`} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
          Disconnect
        </a>
      ) : (
        <a href={`/api/digilocker/connect?next=${encodeURIComponent(applyPath)}`} className="rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800">
          Connect DigiLocker
        </a>
      )}
    </div>
  );
}

/* --------------------------------------------------------- profile editor */

export function ProfileEditor({
  fields,
  value,
  connected,
  onSet,
}: {
  fields: FieldCfg[];
  value: (k: string) => string;
  connected: boolean;
  onSet: (k: string, v: string) => void;
}) {
  const groups = [...new Set(fields.map((f) => f.group))];
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      {groups.map((g) => (
        <div key={g} className="border-t border-slate-100 pt-3 first:border-t-0 first:pt-0 [&:not(:first-child)]:mt-3">
          <div className="mb-2 font-mono text-[0.62rem] uppercase tracking-widest text-slate-400">{g}</div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
            {fields.filter((f) => f.group === g).map((f) => {
              const isDL = f.src === "dl";
              const locked = isDL && !connected;
              const readOnly = isDL && connected;
              return (
                <div key={f.key} className={f.wide ? "col-span-2" : ""}>
                  <label className="mb-0.5 flex items-center gap-1.5 text-[0.7rem] text-slate-500">
                    <span className="flex-1 leading-tight">{f.label}</span>
                    <span className={`rounded px-1 py-px font-mono text-[0.55rem] ring-1 ring-inset ${locked ? "bg-slate-50 text-slate-400 ring-slate-300" : SRC_STYLE[f.src]}`}>
                      {locked ? "🔒 DigiLocker" : SRC_LABEL[f.src]}
                    </span>
                  </label>
                  {f.type === "select" && !readOnly ? (
                    <select
                      value={value(f.key)}
                      onChange={(e) => onSet(f.key, e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-slate-50 px-2 py-1.5 text-sm text-slate-800 outline-none focus:border-emerald-500"
                    >
                      {f.opts!.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      value={value(f.key)}
                      readOnly={readOnly}
                      disabled={locked}
                      placeholder={locked ? "🔒 via DigiLocker" : ""}
                      onChange={(e) => onSet(f.key, e.target.value)}
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
  );
}

/* ---------------------------------------------------------- paper primitives */

export function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-end gap-1.5 py-0.5">
      <span className="whitespace-nowrap text-slate-700">{label}</span>
      <span className={`min-h-[1.2em] flex-1 border-b border-dotted border-slate-400 bg-emerald-50/50 px-1 ${value ? "font-semibold text-slate-900" : "italic text-slate-400"}`}>
        {value || "—"}
      </span>
    </div>
  );
}
export function Sec({ children }: { children: ReactNode }) {
  return <div className="mt-3 mb-1.5 border border-slate-200 bg-slate-100 px-2 py-1 text-[11.5px] font-bold text-slate-700">{children}</div>;
}
export function Box({ on }: { on: boolean }) {
  return <span className="inline-grid h-3 w-3 place-items-center border border-slate-600 align-[-2px] text-[9px]">{on ? "✓" : ""}</span>;
}
export function EligBanner({ dob, days }: { dob: string; days: string }) {
  const e = eligibility(dob, days);
  const cls =
    e.level === "wait"
      ? "border-sky-200 bg-sky-50 text-sky-800"
      : e.level === "yes"
        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
        : "border-rose-200 bg-rose-50 text-rose-800";
  return <div className={`mt-3 rounded-md border px-3 py-1.5 text-[11px] ${cls}`}>{e.text}</div>;
}
