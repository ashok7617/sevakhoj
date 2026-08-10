import Link from "next/link";
import { GROUPS } from "@/lib/groups";
import { countByGroup } from "@/lib/queries";

export const dynamic = "force-dynamic";

const JOURNEYS = [
  {
    title: "I need help",
    blurb:
      "Find a care facility, government scheme, financial assistance, NGO, or helpline near you.",
    href: "/care-centers",
    cta: "Find help",
  },
  {
    title: "I run an organization",
    blurb:
      "Discover grants, government schemes, registration requirements, standards, and CSR opportunities.",
    href: "/for-organizations",
    cta: "For organizations",
  },
  {
    title: "I want to start a care center",
    blurb:
      "Understand registrations, licenses, minimum standards, funding, and application processes.",
    href: "/for-organizations#start",
    cta: "Get started",
  },
];

export default async function HomePage() {
  const { rows: counts } = await countByGroup();

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-emerald-50 to-background">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <p className="text-sm font-medium text-emerald-700">
            Find trusted care and government support across India
          </p>
          <h1 className="mt-2 max-w-3xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Find care facilities, government schemes, and support services across
            India.
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Standardized, source-attributed information for senior citizens,
            widows, children, and more — starting with Uttar Pradesh.
          </p>

          {/* Search */}
          <form
            action="/care-centers"
            method="get"
            className="mt-6 flex max-w-xl flex-col gap-2 sm:flex-row"
          >
            <input
              type="search"
              name="q"
              placeholder="Search e.g. 'senior home in Lucknow' or 'widow support'"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            />
            <button
              type="submit"
              className="rounded-lg bg-emerald-600 px-5 py-2.5 font-medium text-white hover:bg-emerald-700"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Journeys */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-lg font-semibold text-slate-900">How can we help?</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {JOURNEYS.map((j) => (
            <Link
              key={j.title}
              href={j.href}
              className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-emerald-300 hover:shadow-sm"
            >
              <h3 className="font-semibold text-slate-900">{j.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{j.blurb}</p>
              <span className="mt-3 inline-block text-sm font-medium text-emerald-700 group-hover:underline">
                {j.cta} →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Browse by who needs care
          </h2>
          <span className="text-xs text-slate-500">Pilot · MVP scope</span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {GROUPS.map((g) => (
            <Link
              key={g.slug}
              href={`/care-centers?group=${g.slug}`}
              className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-emerald-300 hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{g.emoji}</span>
                {g.phase1 ? (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                    Pilot
                  </span>
                ) : null}
              </div>
              <h3 className="mt-2 font-semibold text-slate-900">{g.name}</h3>
              <p className="mt-0.5 text-xs text-slate-500">{g.blurb}</p>
              {counts[g.slug] ? (
                <p className="mt-2 text-xs font-medium text-emerald-700">
                  {counts[g.slug]} listed
                </p>
              ) : null}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
