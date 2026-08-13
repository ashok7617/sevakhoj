"use client";

import { useState } from "react";
import Link from "next/link";
import { PhotoField } from "@/components/bocwApply";

type Field = { key: string; label: string; type?: "text" | "date" | "select"; opts?: string[]; wide?: boolean; hint?: string };

const GROUPS: { title: string; fields: Field[] }[] = [
  {
    title: "Identity",
    fields: [
      { key: "fullName", label: "Full name", wide: true },
      { key: "relType", label: "Guardian", type: "select", opts: ["Father", "Husband"] },
      { key: "relName", label: "Father's / Husband's name", wide: true },
      { key: "motherName", label: "Mother's name", wide: true },
      { key: "dob", label: "Date of birth", type: "date" },
      { key: "gender", label: "Gender", type: "select", opts: ["Male", "Female", "Other"] },
      { key: "category", label: "Category", type: "select", opts: ["General", "OBC", "SC", "ST"] },
      { key: "marital", label: "Marital status", type: "select", opts: ["Married", "Unmarried", "Widowed"] },
      { key: "mobile", label: "Mobile" },
      { key: "aadhaar", label: "Aadhaar", hint: "masked, e.g. XXXX XXXX 1234" },
      { key: "rationCard", label: "Ration card no." },
    ],
  },
  {
    title: "Address",
    fields: [
      { key: "village", label: "Village / Mohalla / Area", wide: true },
      { key: "tehsil", label: "Tehsil / Taluk" },
      { key: "district", label: "District" },
      { key: "block", label: "Block / Vikas Khand", hint: "UP" },
      { key: "gramWard", label: "Gram Panchayat / Ward", hint: "UP" },
      { key: "mandal", label: "Mandal", hint: "UP" },
      { key: "post", label: "Post office" },
      { key: "pin", label: "PIN code" },
    ],
  },
  {
    title: "Work",
    fields: [
      { key: "trade", label: "Trade / nature of work" },
      { key: "days", label: "Days worked (last 12 months)" },
      { key: "employer", label: "Last employer / site", wide: true },
    ],
  },
  {
    title: "Bank (for DBT)",
    fields: [
      { key: "bank", label: "Bank name" },
      { key: "branch", label: "Branch" },
      { key: "account", label: "Account no.", hint: "masked / last 4" },
      { key: "ifsc", label: "IFSC" },
    ],
  },
  {
    title: "Nominee",
    fields: [
      { key: "nomName", label: "Nominee name" },
      { key: "nomRel", label: "Relationship", type: "select", opts: ["Wife", "Husband", "Son", "Daughter", "Mother", "Father"] },
      { key: "nomAge", label: "Nominee age" },
    ],
  },
];

export function MyProfileForm({ initial, signedIn, email }: { initial: Record<string, string>; signedIn: boolean; email?: string }) {
  const [model, setModel] = useState<Record<string, string>>({ ...initial });
  const [st, setSt] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [err, setErr] = useState<string | null>(null);
  const set = (k: string, v: string) => setModel((m) => ({ ...m, [k]: v }));

  async function save() {
    setSt("saving");
    setErr(null);
    const fields = Object.fromEntries(Object.entries(model).filter(([, v]) => v && v.trim() !== ""));
    try {
      const r = await fetch("/api/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fields }) });
      if (r.ok) {
        setSt("saved");
        setTimeout(() => setSt("idle"), 2500);
      } else {
        const j = (await r.json().catch(() => ({}))) as { error?: string };
        setSt("error");
        setErr(j.error ?? "Save failed.");
      }
    } catch {
      setSt("error");
      setErr("Network error.");
    }
  }

  async function clearAll() {
    if (!confirm("Clear all saved profile details?")) return;
    await fetch("/api/profile", { method: "DELETE" });
    setModel({});
    setSt("idle");
  }

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-emerald-700">SevaKhoj · My profile</p>
      <h1 className="mt-1 text-2xl font-bold text-slate-900">My details</h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-600">
        Fill these once — they pre-fill every scheme application. Update anytime; it re-uses across{" "}
        <Link href="/apply/up-bocw" className="text-emerald-700 hover:underline">UP</Link>,{" "}
        <Link href="/apply/mh-bocw" className="text-emerald-700 hover:underline">Maharashtra</Link> and{" "}
        <Link href="/apply/ka-bocw" className="text-emerald-700 hover:underline">Karnataka</Link> worker forms.
      </p>

      {!signedIn ? (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
          You&apos;re not signed in — details save on this device only.{" "}
          <Link href="/account" className="font-medium underline">Sign in</Link> to keep them on your account.
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-500">Signed in as <b className="text-slate-700">{email}</b> — saved to your account.</p>
      )}

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <PhotoField value={model.photo ?? ""} onChange={(v) => set("photo", v)} />
        {GROUPS.map((g) => (
          <div key={g.title} className="border-t border-slate-100 pt-4 first:border-t-0 first:pt-0 [&:not(:first-child)]:mt-4">
            <div className="mb-2 font-mono text-[0.62rem] uppercase tracking-widest text-slate-400">{g.title}</div>
            <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
              {g.fields.map((f) => (
                <div key={f.key} className={f.wide ? "sm:col-span-2" : ""}>
                  <label className="mb-1 block text-xs text-slate-500">
                    {f.label} {f.hint ? <span className="text-slate-400">({f.hint})</span> : null}
                  </label>
                  {f.type === "select" ? (
                    <select
                      value={model[f.key] ?? ""}
                      onChange={(e) => set(f.key, e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                    >
                      <option value="">—</option>
                      {f.opts!.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={f.type === "date" ? "date" : "text"}
                      value={model[f.key] ?? ""}
                      onChange={(e) => set(f.key, e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {err ? <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{err}</div> : null}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          onClick={save}
          disabled={st === "saving"}
          className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {st === "saving" ? "Saving…" : st === "saved" ? "Saved ✓" : "Save profile"}
        </button>
        <button onClick={clearAll} className="text-sm text-slate-500 hover:text-rose-700 hover:underline">
          Clear all
        </button>
      </div>

      <p className="mt-4 text-xs text-slate-400">
        Enter Aadhaar &amp; account numbers <b>masked</b> (last 4 only). Prototype storage — details are kept solely to pre-fill your applications.
      </p>
    </div>
  );
}
