import Link from "next/link";
import { listSources } from "@/lib/queries";
import {
  MATRIX,
  matrixSummary,
  STATES,
  UNION_TERRITORIES,
  type MatrixRow,
} from "@/data/governmentSourceMatrix";

export const metadata = { title: "Govt Data Source Matrix · India Care & Support" };
export const dynamic = "force-dynamic";

type SourceView = {
  key: string;
  governmentLevel: string;
  state?: string | null;
  ministry?: string | null;
  department?: string | null;
  category?: string | null;
  sourceName: string;
  sourceUrl: string;
  apiUrl?: string | null;
  hasApi: boolean;
  hasSchemes: boolean;
  hasFacilityDb: boolean;
  hasRegistrationData: boolean;
  formats: string[];
  license?: string | null;
  accessMethod?: string | null;
  researchStatus: string;
  notes?: string | null;
  lastChecked?: string | null;
};

const STATUS_STYLE: Record<string, string> = {
  researched: "bg-emerald-100 text-emerald-800 ring-emerald-600/20",
  partial: "bg-amber-100 text-amber-800 ring-amber-600/20",
  skeleton: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

const LEVEL_LABEL: Record<string, string> = {
  central: "Central",
  state: "State",
  ut: "UT",
  district: "District",
  local: "Local",
};

function fromStatic(r: MatrixRow): SourceView {
  return {
    key: r.key,
    governmentLevel: r.governmentLevel,
    state: r.state ?? null,
    ministry: r.ministry ?? null,
    department: r.department ?? null,
    category: r.category,
    sourceName: r.sourceName,
    sourceUrl: r.sourceUrl,
    apiUrl: r.apiUrl ?? null,
    hasApi: r.hasApi,
    hasSchemes: r.hasSchemes,
    hasFacilityDb: r.hasFacilityDb,
    hasRegistrationData: r.hasRegistrationData,
    formats: r.formats,
    license: r.reuseLicense ?? null,
    accessMethod: r.accessMethod ?? null,
    researchStatus: r.researchStatus,
    notes: r.notes ?? null,
    lastChecked: r.lastChecked ?? null,
  };
}

function filterStatic(opts: {
  q?: string;
  level?: string;
  state?: string;
  status?: string;
  category?: string;
}): SourceView[] {
  const q = opts.q?.toLowerCase();
  return MATRIX.filter((r) => {
    if (opts.level && r.governmentLevel !== opts.level) return false;
    if (opts.state && r.state !== opts.state) return false;
    if (opts.status && r.researchStatus !== opts.status) return false;
    if (opts.category && r.category !== opts.category) return false;
    if (q) {
      const hay = [r.sourceName, r.department, r.ministry, r.notes]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  })
    .sort(
      (a, b) =>
        a.governmentLevel.localeCompare(b.governmentLevel) ||
        (a.state ?? "").localeCompare(b.state ?? "") ||
        a.sourceName.localeCompare(b.sourceName),
    )
    .map(fromStatic);
}

export default async function SourcesMatrixPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    level?: string;
    state?: string;
    status?: string;
    category?: string;
  }>;
}) {
  const sp = await searchParams;
  const opts = {
    q: sp.q?.trim() || undefined,
    level: sp.level?.trim() || undefined,
    state: sp.state?.trim() || undefined,
    status: sp.status?.trim() || undefined,
    category: sp.category?.trim() || undefined,
  };

  const { rows: dbRows, dbAvailable } = await listSources(opts);
  const usingDb = dbAvailable && dbRows.length > 0;

  const rows: SourceView[] = usingDb
    ? dbRows.map((r) => ({
        key: r.id,
        governmentLevel: r.governmentLevel,
        state: r.state,
        ministry: r.ministry,
        department: r.department,
        category: r.category,
        sourceName: r.sourceName,
        sourceUrl: r.sourceUrl,
        apiUrl: r.apiUrl,
        hasApi: r.hasApi,
        hasSchemes: r.hasSchemes,
        hasFacilityDb: r.hasFacilityDb,
        hasRegistrationData: r.hasRegistrationData,
        formats: r.formats ?? [],
        license: r.licenseOrReuseNotes,
        accessMethod: r.accessMethod,
        researchStatus: r.researchStatus,
        notes: r.notes,
        lastChecked: r.lastChecked
          ? new Date(r.lastChecked).toISOString().slice(0, 10)
          : null,
      }))
    : filterStatic(opts);

  const s = matrixSummary();
  const allJurisdictions = [...STATES, ...UNION_TERRITORIES];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Government Data Source Master Matrix
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-600">
            The Phase-0 research deliverable: an inventory of Central, State &amp;
            UT sources — what data each exposes, in what formats, under what
            reuse terms, and how far each row has been researched.
          </p>
        </div>
        <div className="text-right text-xs text-slate-500">
          {usingDb ? "Live from database" : "In-repo matrix (database not connected)"}
        </div>
      </div>

      {/* Summary */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Total sources" value={s.total} />
        <Stat label="Researched" value={s.researched} tone="emerald" />
        <Stat label="Partial" value={s.partial} tone="amber" />
        <Stat label="Skeleton (to do)" value={s.skeleton} tone="slate" />
        <Stat label="Central" value={s.central} />
        <Stat label="State + UT" value={s.state + s.ut} />
      </div>

      {/* Filters */}
      <form action="/admin/sources" method="get" className="mt-6 flex flex-wrap gap-2">
        <input
          type="search"
          name="q"
          defaultValue={opts.q ?? ""}
          placeholder="Search source, department, ministry, notes…"
          className="min-w-56 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
        />
        <Select name="level" value={opts.level} placeholder="All levels"
          options={[["central", "Central"], ["state", "State"], ["ut", "UT"]]} />
        <Select name="status" value={opts.status} placeholder="All statuses"
          options={[["researched", "Researched"], ["partial", "Partial"], ["skeleton", "Skeleton"]]} />
        <Select name="category" value={opts.category} placeholder="All categories"
          options={[["schemes", "Schemes"], ["facilities", "Facilities"], ["registration", "Registration"], ["mixed", "Mixed"]]} />
        <select
          name="state"
          defaultValue={opts.state ?? ""}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
        >
          <option value="">All states/UTs</option>
          {allJurisdictions.map((j) => (
            <option key={j} value={j}>
              {j}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Apply
        </button>
        {(opts.q || opts.level || opts.state || opts.status || opts.category) && (
          <Link
            href="/admin/sources"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
          >
            Clear
          </Link>
        )}
      </form>

      <p className="mt-4 text-sm text-slate-500">
        {rows.length} source{rows.length === 1 ? "" : "s"} shown
      </p>

      {/* Table */}
      <div className="mt-2 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[880px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <Th>Source</Th>
              <Th>Level / State</Th>
              <Th>Data available</Th>
              <Th>Formats</Th>
              <Th>Reuse / licensing</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} className="border-b border-slate-100 align-top">
                <td className="px-3 py-3">
                  <div className="font-medium text-slate-900">
                    {r.sourceUrl && !r.sourceUrl.startsWith("pending:") ? (
                      <a
                        href={r.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-700 hover:underline"
                      >
                        {r.sourceName} ↗
                      </a>
                    ) : (
                      <span>{r.sourceName}</span>
                    )}
                  </div>
                  {r.department && (
                    <div className="text-xs text-slate-500">{r.department}</div>
                  )}
                  {r.notes && (
                    <div className="mt-1 max-w-md text-xs text-slate-400">{r.notes}</div>
                  )}
                </td>
                <td className="px-3 py-3 text-slate-600">
                  <div>{LEVEL_LABEL[r.governmentLevel] ?? r.governmentLevel}</div>
                  {r.state && <div className="text-xs text-slate-400">{r.state}</div>}
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-1">
                    {r.hasSchemes && <Pill tone="sky">Schemes</Pill>}
                    {r.hasFacilityDb && <Pill tone="violet">Facilities</Pill>}
                    {r.hasRegistrationData && <Pill tone="indigo">Registration</Pill>}
                    {r.hasApi && <Pill tone="emerald">API</Pill>}
                    {!r.hasSchemes &&
                      !r.hasFacilityDb &&
                      !r.hasRegistrationData &&
                      !r.hasApi && <span className="text-xs text-slate-400">—</span>}
                  </div>
                </td>
                <td className="px-3 py-3 text-xs text-slate-500">
                  {r.formats.length ? r.formats.join(", ") : "—"}
                </td>
                <td className="px-3 py-3 text-xs text-slate-500">
                  <div className="max-w-xs">{r.license ?? "—"}</div>
                  {r.lastChecked && (
                    <div className="mt-1 text-[11px] text-slate-400">
                      Checked {r.lastChecked}
                    </div>
                  )}
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ring-1 ring-inset ${
                      STATUS_STYLE[r.researchStatus] ?? STATUS_STYLE.skeleton
                    }`}
                  >
                    {r.researchStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-slate-500">
        Source of truth:{" "}
        <code className="rounded bg-slate-100 px-1">
          src/data/governmentSourceMatrix.ts
        </code>
        . Load into the DB with <code className="rounded bg-slate-100 px-1">npm run db:import-sources</code>,
        export a spreadsheet with <code className="rounded bg-slate-100 px-1">npm run matrix:csv</code>.
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "emerald" | "amber" | "slate";
}) {
  const toneClass =
    tone === "emerald"
      ? "text-emerald-700"
      : tone === "amber"
        ? "text-amber-700"
        : tone === "slate"
          ? "text-slate-500"
          : "text-slate-900";
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className={`text-2xl font-bold ${toneClass}`}>{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-2 font-medium">{children}</th>;
}

function Pill({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "sky" | "violet" | "indigo" | "emerald";
}) {
  const map = {
    sky: "bg-sky-100 text-sky-800",
    violet: "bg-violet-100 text-violet-800",
    indigo: "bg-indigo-100 text-indigo-800",
    emerald: "bg-emerald-100 text-emerald-800",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${map[tone]}`}>
      {children}
    </span>
  );
}

function Select({
  name,
  value,
  placeholder,
  options,
}: {
  name: string;
  value?: string;
  placeholder: string;
  options: [string, string][];
}) {
  return (
    <select
      name={name}
      defaultValue={value ?? ""}
      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
    >
      <option value="">{placeholder}</option>
      {options.map(([v, l]) => (
        <option key={v} value={v}>
          {l}
        </option>
      ))}
    </select>
  );
}
