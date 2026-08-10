import Link from "next/link";

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
        <p>
          © {new Date().getFullYear()} SevaKhoj · सेवा खोज. Sources are attributed
          on each record with a last-verified date. See our{" "}
          <Link href="/data-sources" className="text-emerald-700 hover:underline">
            government data sources
          </Link>
          .
        </p>
      </div>
    </footer>
  );
}
