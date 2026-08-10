"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GROUPS } from "@/lib/groups";
import { VerificationBadge } from "@/components/VerificationBadge";
import type { VerificationStatus } from "@/lib/badges";

type Criteria = {
  ageYears?: number;
  gender?: string;
  group?: string;
  conditions: string[];
  city?: string;
  state?: string;
  budgetInr?: number;
  residential?: boolean;
  wantsFinancialAssistance?: boolean;
};
type Facility = {
  id: string;
  name: string;
  category: string | null;
  city: string | null;
  district: string | null;
  verificationStatus: string;
  distanceKm: number | null;
};
type Scheme = {
  id: string;
  schemeName: string;
  governmentLevel: string;
  state: string | null;
  ministry: string | null;
  beneficiaryCategory: string | null;
  benefits: string | null;
  applicationUrl: string | null;
  officialSourceUrl: string | null;
  verificationStatus: string;
};
type Result = {
  criteria: Criteria;
  method: "llm" | "rules";
  facilities: Facility[];
  schemes: Scheme[];
  dbAvailable: boolean;
};

const EXAMPLES = [
  "My 68-year-old widowed mother lives in Bijnor and needs affordable residential care and financial assistance.",
  "My mother is 75, has dementia, lives alone in Lucknow, and we can spend ₹8,000/month.",
  "Meri 70 saal ki vidhwa maa Bijnor mein hai, use aashram aur pension chahiye.",
  "मेरी माँ ७५ साल की है, उसे डिमेंशिया है और वो लखनऊ में रहती है।",
];

const groupName = (slug?: string) => GROUPS.find((g) => g.slug === slug)?.name;

export default function CareFinderPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(q: string) {
    const text = q.trim();
    if (!text) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/care-finder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Something went wrong");
      setResult(json);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  // Deep-link support: /finder?q=... prefills and runs the search on load.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (!q) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery(q);
    submit(q);
  }, []);

  const c = result?.criteria;
  const chips: string[] = [];
  if (c) {
    if (c.group) chips.push(groupName(c.group) ?? c.group);
    if (c.ageYears) chips.push(`Age ${c.ageYears}`);
    if (c.gender && c.gender !== "all") chips.push(c.gender === "female" ? "Female" : "Male");
    if (c.city || c.state) chips.push([c.city, c.state].filter(Boolean).join(", "));
    if (c.residential === true) chips.push("Residential");
    if (c.residential === false) chips.push("Day-care");
    if (c.budgetInr) chips.push(`Budget ≈ ₹${c.budgetInr.toLocaleString("en-IN")}/mo`);
    if (c.wantsFinancialAssistance) chips.push("Financial assistance");
    for (const cond of c.conditions ?? []) chips.push(cond);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">AI Care Finder</h1>
      <p className="mt-1 text-sm text-slate-600">
        Describe your situation in plain words — English, हिंदी, or Hinglish. We
        turn it into a structured search and show matching facilities and schemes
        from official sources.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(query);
        }}
        className="mt-4"
      >
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          rows={3}
          placeholder={EXAMPLES[0]}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
        />
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? "Finding help…" : "Find help"}
          </button>
          <span className="text-xs text-slate-400">Try:</span>
          {EXAMPLES.map((ex, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setQuery(ex);
                submit(ex);
              }}
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 hover:border-emerald-300"
            >
              {ex.length > 42 ? ex.slice(0, 42) + "…" : ex}
            </button>
          ))}
        </div>
      </form>

      <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 ring-1 ring-amber-600/20">
        The assistant only interprets your request into a search — it does not
        decide eligibility. Eligibility and benefits shown come from official
        records and are <strong>preliminary</strong>; confirm on the official
        source and apply through government portals.
      </p>

      {error && (
        <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</p>
      )}

      {result && (
        <div className="mt-6 space-y-6">
          {/* Understood criteria */}
          <section>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-800">We understood</h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                {result.method === "llm" ? "AI-parsed" : "keyword match"}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {chips.length ? (
                chips.map((chip, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800 ring-1 ring-inset ring-emerald-600/20"
                  >
                    {chip}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">
                  Couldn&apos;t detect specific filters — showing broad results.
                </span>
              )}
            </div>
          </section>

          {!result.dbAvailable && (
            <p className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600">
              Showing bundled <strong>sample</strong> results — the database isn&apos;t connected.
            </p>
          )}

          {/* Facilities */}
          <section>
            <h2 className="text-sm font-semibold text-slate-800">
              Care facilities ({result.facilities.length})
            </h2>
            {result.facilities.length === 0 ? (
              <p className="mt-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                No matching facilities found. Try widening your description or a nearby city.
              </p>
            ) : (
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                {result.facilities.map((f) => (
                  <Link
                    key={f.id}
                    href={`/care-centers/${f.id}`}
                    className="block rounded-xl border border-slate-200 bg-white p-4 hover:border-emerald-300"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-medium text-slate-900">{f.name}</div>
                        <div className="text-xs text-slate-500">
                          {f.category ?? "Facility"}
                          {f.city ? ` · ${f.city}` : ""}
                          {f.district ? `, ${f.district}` : ""}
                        </div>
                      </div>
                      {f.distanceKm != null && (
                        <span className="whitespace-nowrap rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                          {f.distanceKm.toFixed(1)} km
                        </span>
                      )}
                    </div>
                    <div className="mt-2">
                      <VerificationBadge status={f.verificationStatus as VerificationStatus} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Schemes */}
          <section>
            <h2 className="text-sm font-semibold text-slate-800">
              Government schemes ({result.schemes.length})
            </h2>
            {result.schemes.length === 0 ? (
              <p className="mt-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                No matching schemes found.
              </p>
            ) : (
              <div className="mt-2 grid gap-3 md:grid-cols-2">
                {result.schemes.map((s) => (
                  <article key={s.id} className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-medium text-slate-900">{s.schemeName}</div>
                      <VerificationBadge status={s.verificationStatus as VerificationStatus} />
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      {s.governmentLevel === "central" ? "Central" : s.state ?? "State"}
                      {s.ministry ? ` · ${s.ministry}` : ""}
                    </div>
                    {s.benefits && (
                      <p className="mt-2 text-sm text-slate-600">
                        <span className="font-medium text-slate-700">Benefits:</span> {s.benefits}
                      </p>
                    )}
                    <p className="mt-1 text-[11px] text-slate-400">
                      Preliminary — confirm eligibility on the official source.
                    </p>
                    <div className="mt-2 flex gap-3 text-sm">
                      {s.applicationUrl && (
                        <a
                          href={s.applicationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-emerald-700 hover:underline"
                        >
                          Apply on official portal ↗
                        </a>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
