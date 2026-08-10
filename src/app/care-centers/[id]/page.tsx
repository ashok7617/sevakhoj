import Link from "next/link";
import { notFound } from "next/navigation";
import { getFacility } from "@/lib/queries";
import { VerificationBadge } from "@/components/VerificationBadge";
import { BADGES, type VerificationStatus } from "@/lib/badges";

export const dynamic = "force-dynamic";

export default async function FacilityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { rows: f, dbAvailable } = await getFacility(id);

  if (dbAvailable && !f) notFound();
  if (!f) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-sm text-slate-600">
        Database not connected. Start Postgres and run <code>npm run db:setup</code>.
      </div>
    );
  }

  const status = f.verificationStatus as VerificationStatus;
  const services = Array.isArray(f.services) ? (f.services as string[]) : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/care-centers" className="text-sm text-emerald-700 hover:underline">
        ← Back to Care Centers
      </Link>

      <div className="mt-3 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{f.name}</h1>
          <p className="mt-1 text-slate-600">
            {f.category ?? f.groupName ?? "Care facility"}
            {f.city ? ` · ${f.city}` : ""}
            {f.district ? `, ${f.district}` : ""}
            {f.state ? `, ${f.state}` : ""}
          </p>
        </div>
        <VerificationBadge status={status} />
      </div>

      <p className="mt-2 rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-600">
        {BADGES[status].note} Government registration is not an endorsement of
        service quality.
      </p>

      <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
        <Field label="Residential" value={f.residential ? "Yes" : "No"} />
        <Field label="Medical support" value={f.medicalServices ? "Yes" : "No"} />
        <Field
          label="Cost"
          value={f.costType ? cap(f.costType) : "Not specified"}
        />
        <Field
          label="Capacity"
          value={f.capacity != null ? String(f.capacity) : "—"}
        />
        <Field
          label="Age range"
          value={ageRange(f.ageMin, f.ageMax)}
        />
        <Field label="Phone" value={f.phone ?? "—"} />
        <Field
          label="Address"
          value={[f.address, f.city, f.district, f.state, f.pincode]
            .filter(Boolean)
            .join(", ") || "—"}
        />
      </dl>

      {services.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-slate-800">Services</h2>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {services.map((s) => (
              <span
                key={s}
                className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs text-emerald-800 ring-1 ring-inset ring-emerald-600/20"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 text-xs text-slate-500">
        {f.officialSourceUrl ? (
          <a
            href={f.officialSourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-700 hover:underline"
          >
            Official source ↗
          </a>
        ) : (
          "Source attribution pending verification."
        )}
        {f.lastVerified
          ? ` · Last verified ${new Date(f.lastVerified).toLocaleDateString("en-IN")}`
          : ""}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-sm text-slate-800">{value}</dd>
    </div>
  );
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function ageRange(min: number | null, max: number | null) {
  if (min == null && max == null) return "—";
  if (min != null && max != null) return `${min}–${max}`;
  if (min != null) return `${min}+`;
  return `up to ${max}`;
}
