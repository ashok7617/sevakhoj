import Link from "next/link";

const SUBNAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/verify", label: "Verification Queue" },
  { href: "/data-sources", label: "Data Sources" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Admin
            </h2>
          </div>
          <nav className="mt-2 flex gap-1 text-sm">
            {SUBNAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="rounded-t-lg px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Admin is protected by a shared password (HTTP Basic Auth via middleware). */}
      <div className="border-b border-amber-200 bg-amber-50">
        <div className="mx-auto max-w-7xl px-4 py-2 text-xs text-amber-800">
          🔒 Protected by a shared admin password. For multiple admins or
          fine-grained control, add proper auth + role-based access later.
        </div>
      </div>

      {children}
    </div>
  );
}
