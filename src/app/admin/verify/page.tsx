import Link from "next/link";
import {
  listFacilityQueue,
  listSchemeQueue,
  type QueueFacility,
  type QueueScheme,
} from "@/lib/queries";
import { SAMPLE_FACILITIES } from "@/data/sampleFacilities";
import { VerificationBadge } from "@/components/VerificationBadge";
import { BADGE_ORDER, type VerificationStatus } from "@/lib/badges";
import { VERIFICATION_ACTIONS, isStale } from "@/lib/verification";
import { setVerification } from "../actions";

export const metadata = { title: "Admin · Verification Queue" };
export const dynamic = "force-dynamic";

const LEVEL_LABEL: Record<string, string> = {
  central: "Central", state: "State", ut: "UT", district: "District", local: "Local",
};

function sampleQueue(): QueueFacility[] {
  return SAMPLE_FACILITIES.map((f) => ({
    id: f.id,
    name: f.name,
    category: f.category,
    groupName: null,
    state: f.state,
    district: f.district,
    verificationStatus: "needs_verification",
    lastVerified: null,
    officialSourceUrl: null,
    sourceRecordId: null,
  }));
}

export default async function VerifyQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; status?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const type = sp.type === "scheme" ? "scheme" : "facility";
  const status = sp.status?.trim() || undefined;
  const q = sp.q?.trim() || undefined;

  const facRes = type === "facility" ? await listFacilityQueue({ status, q }) : null;
  const schRes = type === "scheme" ? await listSchemeQueue({ status, q }) : null;
  const dbAvailable = (facRes ?? schRes)!.dbAvailable;

  const facilities: QueueFacility[] =
    type === "facility" ? (dbAvailable ? facRes!.rows : sampleQueue()) : [];
  const schemes: QueueScheme[] = type === "scheme" ? schRes!.rows : [];

  const tabHref = (t: string) => `/admin/verify?type=${t}${status ? `&status=${status}` : ""}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Verification Queue</h1>
      <p className="mt-1 text-sm text-slate-600">
        Unverified and stale records first. Recording a decision writes to the
        audit trail and updates the badge.
      </p>

      {/* Tabs */}
      <div className="mt-4 flex gap-2 border-b border-slate-200">
        {[
          ["facility", "Facilities"],
          ["scheme", "Schemes"],
        ].map(([t, label]) => (
          <Link
            key={t}
            href={tabHref(t)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium ${
              type === t
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Filters */}
      <form action="/admin/verify" method="get" className="mt-4 flex flex-wrap gap-2">
        <input type="hidden" name="type" value={type} />
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search name…"
          className="min-w-56 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
        />
        <select
          name="status"
          defaultValue={status ?? ""}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
        >
          <option value="">All statuses</option>
          {BADGE_ORDER.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Filter
        </button>
      </form>

      {!dbAvailable && (
        <p className="mt-4 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600">
          Showing bundled <strong>sample</strong> facilities (read-only) — connect the
          database to record verifications.
        </p>
      )}

      {/* Facility queue */}
      {type === "facility" && (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-slate-500">{facilities.length} facilities</p>
          {facilities.map((f) => (
            <div key={f.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={`/care-centers/${f.id}`}
                    className="font-medium text-slate-900 hover:text-emerald-700"
                  >
                    {f.name}
                  </Link>
                  <div className="mt-0.5 text-xs text-slate-500">
                    {f.category ?? f.groupName ?? "Facility"}
                    {f.district ? ` · ${f.district}` : ""}
                    {f.state ? `, ${f.state}` : ""}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <VerificationBadge status={f.verificationStatus as VerificationStatus} />
                    {isStale(f.verificationStatus, f.lastVerified) && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">
                        Stale
                      </span>
                    )}
                    {!f.officialSourceUrl && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                        No source
                      </span>
                    )}
                    {f.lastVerified && (
                      <span className="text-[11px] text-slate-400">
                        Last verified {new Date(f.lastVerified).toLocaleDateString("en-IN")}
                      </span>
                    )}
                  </div>
                </div>

                {dbAvailable && (
                  <VerifyForm entityType="facility" entityId={f.id} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Scheme queue */}
      {type === "scheme" && (
        <div className="mt-4 space-y-3">
          {!dbAvailable ? (
            <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
              Connect the database to review schemes.
            </p>
          ) : (
            <>
              <p className="text-sm text-slate-500">{schemes.length} schemes</p>
              {schemes.map((s) => (
                <div key={s.id} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium text-slate-900">{s.schemeName}</div>
                      <div className="mt-0.5 text-xs text-slate-500">
                        {LEVEL_LABEL[s.governmentLevel] ?? s.governmentLevel}
                        {s.state ? ` · ${s.state}` : ""}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <VerificationBadge status={s.verificationStatus as VerificationStatus} />
                        {s.officialSourceUrl && (
                          <a
                            href={s.officialSourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-emerald-700 hover:underline"
                          >
                            Source ↗
                          </a>
                        )}
                      </div>
                    </div>
                    <VerifyForm entityType="scheme" entityId={s.id} />
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/** Inline action form — server action writes audit row + updates the badge. */
function VerifyForm({ entityType, entityId }: { entityType: string; entityId: string }) {
  return (
    <form action={setVerification} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="entityType" value={entityType} />
      <input type="hidden" name="entityId" value={entityId} />
      <select
        name="actionType"
        defaultValue={VERIFICATION_ACTIONS[0].type}
        className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs outline-none focus:border-emerald-500"
      >
        {VERIFICATION_ACTIONS.map((a) => (
          <option key={a.type} value={a.type}>
            {a.label}
          </option>
        ))}
      </select>
      <input
        name="note"
        placeholder="Note (optional)"
        className="w-36 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs outline-none focus:border-emerald-500"
      />
      <button
        type="submit"
        className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700"
      >
        Record
      </button>
    </form>
  );
}
