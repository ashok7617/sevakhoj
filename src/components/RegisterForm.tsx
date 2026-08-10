"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { CareCategoryOption } from "@/lib/queries";

const STATES = [
  "Uttar Pradesh", "Delhi", "Maharashtra", "Karnataka", "Tamil Nadu", "West Bengal",
  "Telangana", "Rajasthan", "Bihar", "Madhya Pradesh", "Gujarat", "Punjab", "Haryana",
  "Kerala", "Odisha", "Assam", "Uttarakhand", "Jharkhand", "Chhattisgarh", "Andhra Pradesh",
];

export function RegisterForm({ categories }: { categories: CareCategoryOption[] }) {
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  // group categories into optgroups
  const grouped = useMemo(() => {
    const m = new Map<string, CareCategoryOption[]>();
    for (const c of categories) {
      const arr = m.get(c.groupName) ?? [];
      arr.push(c);
      m.set(c.groupName, arr);
    }
    return [...m.entries()];
  }, [categories]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = {
      name: fd.get("name"),
      careCategoryId: Number(fd.get("careCategoryId")) || undefined,
      category: categories.find((c) => c.id === Number(fd.get("careCategoryId")))?.name,
      residential: fd.get("residential") === "residential" ? true : fd.get("residential") === "day" ? false : undefined,
      gender: fd.get("gender"),
      costType: fd.get("costType") || undefined,
      capacity: fd.get("capacity") ? Number(fd.get("capacity")) : undefined,
      services: fd.get("services"),
      address: fd.get("address"),
      city: fd.get("city"),
      district: fd.get("district"),
      state: fd.get("state"),
      pincode: fd.get("pincode"),
      phone: fd.get("phone"),
      email: fd.get("email"),
      website: fd.get("website"),
      description: fd.get("description"),
      submitterName: fd.get("submitterName"),
      submitterContact: fd.get("submitterContact"),
      consent: fd.get("consent") === "on",
      company: fd.get("company"), // honeypot
    };

    setStatus("saving");
    setMessage(null);
    try {
      const res = await fetch("/api/register-facility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Something went wrong");
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setMessage((err as Error).message);
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
        <h2 className="text-lg font-semibold text-emerald-900">Thank you — submitted for review ✓</h2>
        <p className="mt-2 text-sm text-emerald-800">
          Your center has been added as <strong>User Submitted</strong> and is now visible with that
          badge. Our team will verify the details against official sources before it&apos;s marked
          verified. We may contact you at the number you provided to confirm.
        </p>
        <div className="mt-4 flex gap-3 text-sm">
          <Link href="/care-centers" className="font-medium text-emerald-700 hover:underline">
            View care centers →
          </Link>
          <button
            onClick={() => setStatus("idle")}
            className="text-slate-600 hover:underline"
          >
            Add another
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* honeypot (hidden from humans) */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-800">About the center</h2>
        <Field label="Center name" required>
          <input name="name" required maxLength={200} className={inputCls} placeholder="e.g. Shanti Senior Citizens Home" />
        </Field>
        <Field label="Category" required>
          <select name="careCategoryId" required defaultValue="" className={inputCls}>
            <option value="" disabled>Select the type of care…</option>
            {grouped.map(([groupName, opts]) => (
              <optgroup key={groupName} label={groupName}>
                {opts.map((o) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </Field>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Care type">
            <select name="residential" defaultValue="residential" className={inputCls}>
              <option value="residential">Residential (live-in)</option>
              <option value="day">Day-care</option>
            </select>
          </Field>
          <Field label="Serves">
            <select name="gender" defaultValue="all" className={inputCls}>
              <option value="all">Everyone</option>
              <option value="female">Women/girls only</option>
              <option value="male">Men/boys only</option>
            </select>
          </Field>
          <Field label="Cost">
            <select name="costType" defaultValue="" className={inputCls}>
              <option value="">Not specified</option>
              <option value="free">Free</option>
              <option value="subsidized">Subsidized</option>
              <option value="paid">Paid</option>
              <option value="mixed">Mixed</option>
            </select>
          </Field>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Capacity (optional)">
            <input name="capacity" type="number" min={0} className={inputCls} placeholder="e.g. 40" />
          </Field>
          <Field label="Services (comma-separated)">
            <input name="services" maxLength={500} className={inputCls} placeholder="Meals, Medical support, Physiotherapy" />
          </Field>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-800">Location &amp; contact</h2>
        <Field label="Address">
          <textarea name="address" rows={2} maxLength={500} className={inputCls} placeholder="Street, area, landmark" />
        </Field>
        <div className="grid gap-3 sm:grid-cols-4">
          <Field label="City" required><input name="city" required maxLength={120} className={inputCls} /></Field>
          <Field label="District"><input name="district" maxLength={120} className={inputCls} /></Field>
          <Field label="State" required>
            <select name="state" required defaultValue="Uttar Pradesh" className={inputCls}>
              {STATES.map((st) => <option key={st} value={st}>{st}</option>)}
            </select>
          </Field>
          <Field label="PIN code"><input name="pincode" maxLength={10} className={inputCls} placeholder="226001" /></Field>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Phone" required><input name="phone" required maxLength={40} className={inputCls} placeholder="+91 …" /></Field>
          <Field label="Email"><input name="email" type="email" maxLength={200} className={inputCls} /></Field>
          <Field label="Website"><input name="website" maxLength={300} className={inputCls} placeholder="https://…" /></Field>
        </div>
        <Field label="Short description (optional)">
          <textarea name="description" rows={2} maxLength={1000} className={inputCls} placeholder="What the center offers, who it serves…" />
        </Field>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-800">Your details (for verification)</h2>
        <p className="text-xs text-slate-500">Not shown publicly — used only to confirm the listing.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Your name" required><input name="submitterName" required maxLength={120} className={inputCls} /></Field>
          <Field label="Your phone or email" required><input name="submitterContact" required maxLength={200} className={inputCls} /></Field>
        </div>
        <label className="flex items-start gap-2 text-sm text-slate-700">
          <input type="checkbox" name="consent" required className="mt-1 accent-emerald-600" />
          <span>
            I confirm this information is accurate and I&apos;m authorized to submit it. I understand
            it will be shown as <strong>User Submitted</strong> until independently verified.
          </span>
        </label>
      </section>

      {message && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800">{message}</p>
      )}

      <button
        type="submit"
        disabled={status === "saving"}
        className="rounded-lg bg-emerald-600 px-6 py-2.5 font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {status === "saving" ? "Submitting…" : "Submit center"}
      </button>
    </form>
  );
}

const inputCls =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-600">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      {children}
    </label>
  );
}
