import Link from "next/link";
import { verificationOverview, type VerificationOverview } from "@/lib/queries";
import { SAMPLE_FACILITIES } from "@/data/sampleFacilities";
import { BADGES, BADGE_ORDER, type VerificationStatus } from "@/lib/badges";
import { STALE_DAYS, VERIFIED_STATUSES } from "@/lib/verification";

export const metadata = { title: "Admin · Verification Overview" };
export const dynamic = "force-dynamic";

/** Overview derived from bundled sample data when the DB isn't connected. */
function sampleOverview(): VerificationOverview {
  return {
    facilities: {
      total: SAMPLE_FACILITIES.length,
      byStatus: { needs_verification: SAMPLE_FACILITIES.length },
      stale: 0,
      fresh: 0,
      noSource: SAMPLE_FACILITIES.length,
    },
    schemes: { total: 0, byStatus: {} },
    recentVerifications: 0,
  };
}

export default async function AdminOverviewPage() {
  const { rows: live, dbAvailable } = await verificationOverview();
  const o = dbAvailable ? live : sampleOverview();

  const verified = VERIFIED_STATUSES.reduce((n, s) => n + (o.facilities.byStatus[s] ?? 0), 0);
  const needsAttention =
    (o.facilities.byStatus.needs_verification ?? 0) +
    (o.facilities.byStatus.user_submitted ?? 0) +
    o.facilities.stale;
  const freshPct = o.facilities.total
    ? Math.round((o.facilities.fresh / o.facilities.total) * 100)
    : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Verification Overview</h1>
          <p className="mt-1 text-sm text-slate-600">
            Data quality across facilities and schemes. Freshness target:
            re-verify within {STALE_DAYS} days.
          </p>
        </div>
        <Link
          href="/admin/verify"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Open verification queue →
        </Link>
      </div>

      {!dbAvailable && (
        <p className="mt-4 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600">
          Showing bundled <strong>sample</strong> data — the database isn&apos;t connected.
          Run <code className="rounded bg-slate-200 px-1">npm run db:setup</code> for live metrics.
        </p>
      )}

      {/* KPIs */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Kpi label="Facilities" value={o.facilities.total} />
        <Kpi label="Verified" value={verified} tone="emerald" />
        <Kpi label="Needs attention" value={needsAttention} tone="rose" />
        <Kpi label={`Stale (>${STALE_DAYS}d)`} value={o.facilities.stale} tone="amber" />
        <Kpi label="No source" value={o.facilities.noSource} tone="slate" />
        <Kpi label="Fresh" value={`${freshPct}%`} tone="emerald" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Facilities by status */}
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-800">Facilities by verification status</h2>
          <div className="mt-4 space-y-3">
            {BADGE_ORDER.map((status) => (
              <StatusBar
                key={status}
                status={status}
                count={o.facilities.byStatus[status] ?? 0}
                total={o.facilities.total}
              />
            ))}
          </div>
        </section>

        {/* Schemes by status + activity */}
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-800">Schemes by verification status</h2>
          <div className="mt-4 space-y-3">
            {BADGE_ORDER.map((status) => (
              <StatusBar
                key={status}
                status={status}
                count={o.schemes.byStatus[status] ?? 0}
                total={o.schemes.total}
              />
            ))}
          </div>
          <div className="mt-5 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
            <span className="font-medium text-slate-800">{o.recentVerifications}</span>{" "}
            verification{o.recentVerifications === 1 ? "" : "s"} recorded in the last 30 days.
          </div>
        </section>
      </div>

      <p className="mt-6 rounded-lg bg-amber-50 px-4 py-3 text-xs text-amber-800 ring-1 ring-amber-600/20">
        Reminder: a <strong>Government Verified</strong> badge means the record
        matches an official source — it is <strong>not</strong> an endorsement of
        service quality. Children&apos;s and mental-health facilities require
        stronger verification before public display.
      </p>
    </div>
  );
}

function Kpi({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number | string;
  tone?: "default" | "emerald" | "amber" | "rose" | "slate";
}) {
  const cls = {
    default: "text-slate-900",
    emerald: "text-emerald-700",
    amber: "text-amber-700",
    rose: "text-rose-700",
    slate: "text-slate-500",
  }[tone];
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className={`text-2xl font-bold ${cls}`}>{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}

function StatusBar({
  status,
  count,
  total,
}: {
  status: VerificationStatus;
  count: number;
  total: number;
}) {
  const pct = total ? Math.round((count / total) * 100) : 0;
  const b = BADGES[status];
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span
          className={`inline-flex rounded-full px-2 py-0.5 font-medium ring-1 ring-inset ${b.className}`}
        >
          {b.label}
        </span>
        <span className="text-slate-500">
          {count} · {pct}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-slate-400" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
