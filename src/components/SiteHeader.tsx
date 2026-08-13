import Link from "next/link";

const NAV = [
  { href: "/finder", label: "AI Care Finder" },
  { href: "/near", label: "Near Me" },
  { href: "/care-centers", label: "Care Centers" },
  { href: "/schemes", label: "Government Schemes" },
  { href: "/register", label: "Add a Center" },
  // Note: no public "Admin" link — the admin dashboard lives at /admin and is
  // password-protected (see src/proxy.ts). Admins reach it by URL directly so
  // ordinary visitors are never shown a login prompt.
];

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <svg viewBox="0 0 512 512" className="h-9 w-9" role="img" aria-label="SevaKhoj logo">
            <defs>
              <linearGradient id="sk-logo" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#10b981" />
                <stop offset="1" stopColor="#047857" />
              </linearGradient>
            </defs>
            <rect width="512" height="512" rx="112" fill="url(#sk-logo)" />
            <path
              d="M256 64C181 64 120 125 120 200c0 96 136 248 136 248s136-152 136-248c0-75-61-136-136-136z"
              fill="#ffffff"
            />
            <g transform="translate(178 100) scale(6.5)">
              <path
                d="M12 21l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.18L12 21z"
                fill="#059669"
              />
            </g>
          </svg>
          <span className="leading-tight">
            <span className="block text-sm font-semibold text-slate-900">
              SevaKhoj <span className="font-normal text-slate-400">· सेवा खोज</span>
            </span>
            <span className="block text-[11px] text-slate-500">
              Find care &amp; government schemes
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
            href="/account"
            className="rounded-md px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            Account
          </Link>
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
