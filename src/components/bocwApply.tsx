"use client";

/**
 * Shared engine for the BOCW scheme-application pattern. Each state supplies a
 * field list + its own paper-form layout; everything else (profile bar, editor,
 * eligibility, print, form primitives) lives here.
 *
 * Primary flow is MANUAL: the citizen types their universal profile once, it's
 * saved (server cookie) and reused across every state's form. DigiLocker
 * auto-fill is optional and only surfaces when partner creds are configured.
 */

import { useState, type ChangeEvent, type ReactNode } from "react";

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
export const SRC_LABEL: Record<Src, string> = { dl: "you enter", self: "you enter", pd: "you enter", otp: "you enter" };

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
  if (!dob) return { level: "wait", text: "Enter date of birth and work days to check eligibility (age 18–60, ≥90 days)." };
  const ageOk = age !== null && age >= 18 && age <= 60;
  const daysOk = !isNaN(days) && days >= 90;
  if (ageOk && daysOk)
    return { level: "yes", text: `✓ Eligible — age ${age} (18–60) and ${days} days' work (≥90). Ready to e-sign & submit.` };
  const why = !ageOk ? `age must be 18–60 (now ${age ?? "?"})` : `needs ≥90 days' work (now ${isNaN(days) ? "?" : days})`;
  return { level: "no", text: `✕ Not eligible — ${why}.` };
}

/* --------------------------------------------------------------- photo field */

/** Read any image file → auto-crop to a passport ratio → small JPEG data URL. */
function fileToPassport(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read failed"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("decode failed"));
      img.onload = () => {
        const TW = 220, TH = 264; // passport 5:6
        const c = document.createElement("canvas");
        c.width = TW;
        c.height = TH;
        const ctx = c.getContext("2d");
        if (!ctx) return reject(new Error("no canvas"));
        const scale = Math.max(TW / img.width, TH / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, TW, TH);
        ctx.drawImage(img, (TW - w) / 2, (TH - h) / 2, w, h);
        resolve(c.toDataURL("image/jpeg", 0.72));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function PhotoField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(false);
  async function pick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setErr(false);
    try {
      onChange(await fileToPassport(file));
    } catch {
      setErr(true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="mb-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 no-print">
      <div className="grid h-[72px] w-[60px] flex-none place-items-center overflow-hidden rounded border border-slate-300 bg-slate-50 text-[9px] text-slate-400">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="passport photo preview" className="h-full w-full object-cover" />
        ) : (
          "Photo"
        )}
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-slate-800">Passport photo</div>
        <div className="text-xs text-slate-500">
          {err ? <span className="text-rose-600">Couldn&apos;t read that image — try a JPG/PNG.</span> : "Clear, front-facing. Auto-cropped & resized for the form."}
        </div>
      </div>
      <label className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100">
        {busy ? "…" : value ? "Change" : "Upload"}
        <input type="file" accept="image/*" onChange={pick} className="hidden" />
      </label>
      {value ? (
        <button type="button" onClick={() => onChange("")} className="text-xs text-slate-400 hover:text-rose-700">
          Remove
        </button>
      ) : null}
    </div>
  );
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

/* --------------------------------------------------------- save + profile bar */

async function postProfile(fields: Record<string, string>): Promise<boolean> {
  try {
    const r = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields }),
    });
    return r.ok;
  } catch {
    return false;
  }
}

export function ProfileBar({
  configured,
  dlVerified,
  signedIn,
  applyPath,
  getFields,
}: {
  configured: boolean;
  dlVerified: boolean;
  signedIn: boolean;
  applyPath: string;
  getFields: () => Record<string, string>;
}) {
  const [st, setSt] = useState<"idle" | "saving" | "saved" | "error">("idle");

  if (dlVerified) {
    return (
      <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 no-print">
        <div className="grid h-9 w-9 flex-none place-items-center rounded-lg bg-emerald-600 text-lg text-white">✓</div>
        <div className="min-w-[180px] flex-1">
          <div className="text-sm font-semibold text-slate-800">Verified via DigiLocker</div>
          <div className="text-xs text-slate-600">Identity &amp; address pulled from your DigiLocker.</div>
        </div>
        <a href={`/api/digilocker/disconnect?next=${encodeURIComponent(applyPath)}`} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
          Clear
        </a>
      </div>
    );
  }

  async function save() {
    setSt("saving");
    const ok = await postProfile(getFields());
    setSt(ok ? "saved" : "error");
    if (ok) setTimeout(() => setSt("idle"), 2500);
  }

  return (
    <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 no-print">
      <div className="grid h-9 w-9 flex-none place-items-center rounded-lg bg-slate-700 text-lg text-white">📝</div>
      <div className="min-w-[180px] flex-1">
        <div className="text-sm font-semibold text-slate-800">Enter your details once</div>
        <div className="text-xs text-slate-600">
          {signedIn ? "Saved to your account — reused across every scheme form." : "Saved on this device. Sign in to keep them on your account."}
        </div>
      </div>
      <button
        onClick={save}
        disabled={st === "saving"}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {st === "saving" ? "Saving…" : st === "saved" ? "Saved ✓" : st === "error" ? "Retry save" : "Save my details"}
      </button>
      {!signedIn ? (
        <a href="/account" className="text-xs font-medium text-emerald-700 hover:underline">Sign in</a>
      ) : null}
      {configured ? (
        <a href={`/api/digilocker/connect?next=${encodeURIComponent(applyPath)}`} className="text-xs text-sky-700 hover:underline">
          or auto-fill via DigiLocker
        </a>
      ) : null}
    </div>
  );
}

/* --------------------------------------------------------- profile editor */

export function ProfileEditor({
  fields,
  value,
  dlVerified,
  onSet,
}: {
  fields: FieldCfg[];
  value: (k: string) => string;
  dlVerified: boolean;
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
              const readOnly = f.src === "dl" && dlVerified; // locked only when DigiLocker-verified
              const tag = readOnly ? "DigiLocker ✓" : "you enter";
              const tagCls = readOnly ? SRC_STYLE.dl : SRC_STYLE.self;
              return (
                <div key={f.key} className={f.wide ? "col-span-2" : ""}>
                  <label className="mb-0.5 flex items-center gap-1.5 text-[0.7rem] text-slate-500">
                    <span className="flex-1 leading-tight">{f.label}</span>
                    <span className={`rounded px-1 py-px font-mono text-[0.55rem] ring-1 ring-inset ${tagCls}`}>{tag}</span>
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
                      onChange={(e) => onSet(f.key, e.target.value)}
                      title={readOnly ? "Verified by DigiLocker — not editable" : undefined}
                      className={`w-full rounded-lg border px-2 py-1.5 text-sm outline-none focus:border-emerald-500 ${
                        readOnly ? "border-sky-300 bg-sky-50 font-medium text-slate-800" : "border-slate-300 bg-slate-50 text-slate-800"
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
