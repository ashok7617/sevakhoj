import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/about", label: "About" },
  { href: "/data-sources", label: "Data Sources" },
  { href: "/register", label: "Add a Center" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl space-y-3 px-4 py-8 text-sm text-slate-500">
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-amber-800 ring-1 ring-amber-600/20">
          <strong>This is not a government service.</strong> Information is
          aggregated from official sources for discovery only. Government
          registration is <strong>not</strong> an endorsement of service
          quality. Always confirm details with the official source before acting,
          and apply through official government portals where available.
        </p>
        <nav className="flex flex-wrap gap-x-4 gap-y-2 pt-1">
          {FOOTER_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-slate-600 hover:text-emerald-700 hover:underline"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <p>
            © {new Date().getFullYear()} SevaKhoj · सेवा खोज. Sources are
            attributed on each record with a last-verified date.
          </p>
          {/*
            Plain <a>, NOT next/link: the App Router prefetches <Link> routes as
            they enter the viewport. Prefetching the password-protected /admin
            returns 401 with a Basic-Auth challenge, which pops the browser login
            dialog on ordinary pages. A plain anchor is never prefetched; a click
            still navigates to /admin and prompts for credentials as intended.
          */}
          <a
            href="/admin"
            className="rounded-md border border-slate-200 px-3 py-1 text-xs text-slate-400 hover:border-emerald-300 hover:text-emerald-700"
          >
            Admin
          </a>
        </div>
      </div>
    </footer>
  );
}
