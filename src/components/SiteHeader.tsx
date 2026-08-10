import Link from "next/link";

const NAV = [
  { href: "/finder", label: "AI Care Finder" },
  { href: "/near", label: "Near Me" },
  { href: "/care-centers", label: "Care Centers" },
  { href: "/schemes", label: "Government Schemes" },
  { href: "/register", label: "Add a Center" },
  { href: "/admin", label: "Admin" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-600 text-lg font-bold text-white">
            C
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold text-slate-900">
              India Care &amp; Support
            </span>
            <span className="block text-[11px] text-slate-500">
              Facilities · Schemes · Help
            </span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-md px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              {n.label}
            </Link>
          ))}
          <Link
            href="/care-centers"
            className="ml-1 rounded-md bg-emerald-600 px-3 py-2 font-medium text-white hover:bg-emerald-700"
          >
            Find Help
          </Link>
        </nav>
      </div>
    </header>
  );
}
