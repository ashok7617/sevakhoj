import { BADGES, type VerificationStatus } from "@/lib/badges";

export function VerificationBadge({
  status,
  withTooltip = true,
}: {
  status: VerificationStatus;
  withTooltip?: boolean;
}) {
  const b = BADGES[status];
  return (
    <span
      title={withTooltip ? b.note : undefined}
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${b.className}`}
    >
      {b.label}
    </span>
  );
}
