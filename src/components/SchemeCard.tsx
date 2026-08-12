import Link from "next/link";
import type { Scheme } from "@/lib/queries";
import { VerificationBadge } from "./VerificationBadge";
import type { VerificationStatus } from "@/lib/badges";
import { applyPathForScheme } from "@/lib/applyRoutes";

const LEVEL_LABEL: Record<string, string> = {
  central: "Central",
  state: "State",
  ut: "UT",
  district: "District",
  local: "Local",
};

export function SchemeCard({ s }: { s: Scheme }) {
  const applyPath = applyPathForScheme(s);
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
      {s.eligibility ? (
        <p className="mt-1 text-sm text-slate-600">
          <span className="font-medium text-slate-700">Eligibility:</span>{" "}
          {s.eligibility}
        </p>
      ) : null}
      {s.benefits ? (
        <p className="mt-1 text-sm text-slate-600">
          <span className="font-medium text-slate-700">Benefits:</span>{" "}
          {s.benefits}
        </p>
      ) : null}
      {s.applicationProcess ? (
        <p className="mt-1 text-sm text-slate-600">
          <span className="font-medium text-slate-700">How to apply:</span>{" "}
          {s.applicationProcess}
        </p>
      ) : null}
      {s.documentsRequired && s.documentsRequired.length > 0 ? (
        <p className="mt-1 text-sm text-slate-600">
          <span className="font-medium text-slate-700">Documents:</span>{" "}
          {s.documentsRequired.join(" · ")}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
        {applyPath ? (
          <Link
            href={applyPath}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
          >
            Apply with SevaKhoj
            <span className="rounded bg-white/25 px-1 py-px text-[0.6rem] font-medium">
              pre-filled
            </span>
          </Link>
        ) : null}
        {s.sourceLastUpdated ? (
          <span className="text-xs text-slate-400">
            Source dated {new Date(s.sourceLastUpdated).toISOString().slice(0, 10)}
          </span>
        ) : null}
        {s.applicationUrl ? (
          <a
            href={s.applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={
              applyPath
                ? "text-slate-500 hover:underline"
                : "font-medium text-emerald-700 hover:underline"
            }
          >
            {applyPath ? "Official portal ↗" : "Apply on official portal ↗"}
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
