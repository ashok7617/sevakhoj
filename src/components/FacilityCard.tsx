import Link from "next/link";
import type { Facility } from "@/lib/queries";
import { VerificationBadge } from "./VerificationBadge";
import type { VerificationStatus } from "@/lib/badges";

const COST_LABEL: Record<string, string> = {
  free: "Free",
  subsidized: "Subsidized",
  paid: "Paid",
  mixed: "Mixed",
};

export function FacilityCard({ f }: { f: Facility }) {
  return (
    <Link
      href={`/care-centers/${f.id}`}
      className="block rounded-xl border border-slate-200 bg-white p-4 transition hover:border-emerald-300 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900">{f.name}</h3>
          <p className="mt-0.5 text-sm text-slate-500">
            {f.category ?? f.groupName ?? "Care facility"}
            {f.city ? ` · ${f.city}` : ""}
            {f.district ? `, ${f.district}` : ""}
            {f.state ? `, ${f.state}` : ""}
          </p>
        </div>
        <VerificationBadge status={f.verificationStatus as VerificationStatus} />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] text-slate-600">
        {f.residential ? <Tag>Residential</Tag> : <Tag>Day-care</Tag>}
        {f.costType ? <Tag>{COST_LABEL[f.costType] ?? f.costType}</Tag> : null}
        {f.medicalServices ? <Tag>Medical support</Tag> : null}
        {typeof f.capacity === "number" ? <Tag>Capacity {f.capacity}</Tag> : null}
      </div>
    </Link>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-slate-100 px-2 py-0.5">{children}</span>
  );
}
