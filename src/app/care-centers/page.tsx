import Link from "next/link";
import { listFacilities } from "@/lib/queries";
import { FacilityCard } from "@/components/FacilityCard";
import { DbNotice } from "@/components/DbNotice";
import { GROUPS, groupBySlug } from "@/lib/groups";

export const metadata = { title: "Care Centers · India Care & Support" };
export const dynamic = "force-dynamic";

export default async function CareCentersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; group?: string; state?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() || undefined;
  const group = sp.group?.trim() || undefined;
  const state = sp.state?.trim() || undefined;

  const { rows: facilities, dbAvailable } = await listFacilities({ q, group, state });
  const activeGroup = group ? groupBySlug(group) : undefined;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Care Centers</h1>
      <p className="mt-1 text-sm text-slate-600">
        {activeGroup ? `${activeGroup.name} · ` : ""}
        {q ? `Results for “${q}”` : "Browse verified and listed facilities."}
      </p>

      {/* Filters */}
      <form action="/care-centers" method="get" className="mt-5 flex flex-wrap gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search name, city, district…"
          className="min-w-56 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
        />
        <select
          name="group"
          defaultValue={group ?? ""}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
        >
          <option value="">All groups</option>
          {GROUPS.map((g) => (
            <option key={g.slug} value={g.slug}>
              {g.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Apply
        </button>
        {(q || group || state) && (
          <Link
            href="/care-centers"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Results */}
      <div className="mt-6">
        {!dbAvailable ? (
          <DbNotice />
        ) : facilities.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
            No facilities match yet. Try clearing filters, or load more data via
            the ingestion pipeline.
          </p>
        ) : (
          <>
            <p className="mb-3 text-sm text-slate-500">
              {facilities.length} result{facilities.length === 1 ? "" : "s"}
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {facilities.map((f) => (
                <FacilityCard key={f.id} f={f} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
