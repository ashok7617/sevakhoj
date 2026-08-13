import Link from "next/link";
import { listSchemes, listSchemeStates } from "@/lib/queries";
import { SchemeCard } from "@/components/SchemeCard";
import { DbNotice } from "@/components/DbNotice";
import { GROUPS } from "@/lib/groups";

export const metadata = { title: "Government Schemes · SevaKhoj" };
export const dynamic = "force-dynamic";

const LEVELS = [
  { value: "central", label: "Central" },
  { value: "state", label: "State" },
  { value: "ut", label: "UT" },
  { value: "district", label: "District" },
];

export default async function SchemesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    group?: string;
    level?: string;
    state?: string;
  }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() || undefined;
  const group = sp.group?.trim() || undefined;
  const level = sp.level?.trim() || undefined;
  const state = sp.state?.trim() || undefined;

  const [{ rows: schemes, dbAvailable }, { rows: states }] = await Promise.all([
    listSchemes({ q, group, level, state }),
    listSchemeStates(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Government Schemes</h1>
      <p className="mt-1 text-sm text-slate-600">
        Central, State &amp; UT schemes with links to official application
        portals. Eligibility shown is preliminary — always confirm on the
        official source.
      </p>

      <a
        href="https://www.myscheme.gov.in/search"
        target="_blank"
        rel="noreferrer"
        className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-900 hover:bg-sky-100"
      >
        <span aria-hidden>🏛️</span>
        <span>
          SevaKhoj curates <b>care-related</b> schemes and adds <b>pre-filled applications</b>. For the
          Government of India&apos;s full registry of <b>4,700+ schemes</b> and the official eligibility
          finder, see <b className="underline">myScheme</b> (DIC · MeitY) ↗
        </span>
      </a>

      <form action="/schemes" method="get" className="mt-5 flex flex-wrap gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search scheme, benefit, beneficiary…"
          className="min-w-56 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
        />
        <select
          name="group"
          defaultValue={group ?? ""}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
        >
          <option value="">All beneficiaries</option>
          {GROUPS.map((g) => (
            <option key={g.slug} value={g.slug}>
              {g.name}
            </option>
          ))}
        </select>
        <select
          name="level"
          defaultValue={level ?? ""}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
        >
          <option value="">All levels</option>
          {LEVELS.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
        {states.length > 0 && (
          <select
            name="state"
            defaultValue={state ?? ""}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
          >
            <option value="">All states</option>
            {states.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        )}
        <button
          type="submit"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Apply
        </button>
        {(q || group || level || state) && (
          <Link
            href="/schemes"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
          >
            Clear
          </Link>
        )}
      </form>

      <div className="mt-6">
        {!dbAvailable ? (
          <DbNotice />
        ) : schemes.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
            No schemes match yet.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {schemes.map((s) => (
              <SchemeCard key={s.id} s={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
