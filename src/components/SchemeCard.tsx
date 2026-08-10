import type { Scheme } from "@/lib/queries";
import { VerificationBadge } from "./VerificationBadge";
import type { VerificationStatus } from "@/lib/badges";

const LEVEL_LABEL: Record<string, string> = {
  central: "Central",
  state: "State",
  ut: "UT",
  district: "District",
  local: "Local",
};

export function SchemeCard({ s }: { s: Scheme }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900">{s.schemeName}</h3>
          <p className="mt-0.5 text-sm text-slate-500">
            {LEVEL_LABEL[s.governmentLevel] ?? s.governmentLevel}
            {s.state ? ` · ${s.state}` : ""}
            {s.ministry ? ` · ${s.ministry}` : ""}
          </p>
        </div>
        <VerificationBadge status={s.verificationStatus as VerificationStatus} />
      </div>

      {s.beneficiaryCategory ? (
        <p className="mt-2 text-sm text-slate-600">
          <span className="font-medium text-slate-700">For:</span>{" "}
          {s.beneficiaryCategory}
        </p>
      ) : null}
      {s.benefits ? (
        <p className="mt-1 text-sm text-slate-600">
          <span className="font-medium text-slate-700">Benefits:</span>{" "}
          {s.benefits}
        </p>
      ) : null}

      <div className="mt-3 flex items-center gap-3 text-sm">
        {s.applicationUrl ? (
          <a
            href={s.applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-emerald-700 hover:underline"
          >
            Apply on official portal ↗
          </a>
        ) : null}
        {s.officialSourceUrl ? (
          <a
            href={s.officialSourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:underline"
          >
            Source
          </a>
        ) : null}
      </div>
    </article>
  );
}
