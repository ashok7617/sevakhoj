import Link from "next/link";

export const metadata = {
  title: "Contact · SevaKhoj",
  description: "Get in touch with SevaKhoj — corrections, questions, or to list a care center.",
};

const CONTACT_EMAIL = "ashok.n.kumar2@gmail.com";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900">Contact us</h1>
      <p className="mt-2 text-lg text-slate-600">
        We&rsquo;d love to hear from you — corrections, questions, or to help a
        family find care.
      </p>

      <div className="mt-8 space-y-6 text-slate-700 leading-relaxed">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">Email</h2>
          <p className="mt-1">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-emerald-700 hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
          </p>
          <p className="mt-1 text-sm text-slate-500">
            We aim to respond within a few business days.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Run a care center?
          </h2>
          <p className="mt-1">
            List it so families can find it — it&rsquo;s free and takes a couple
            of minutes.
          </p>
          <Link
            href="/register"
            className="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Add your center
          </Link>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Spotted incorrect information?
          </h2>
          <p className="mt-1">
            SevaKhoj aggregates data from many sources and some of it can go out
            of date. Please email us the facility name and what&rsquo;s wrong,
            and we&rsquo;ll review it against the official source. You can also
            check where a record came from on our{" "}
            <Link href="/data-sources" className="text-emerald-700 hover:underline">
              government data sources
            </Link>{" "}
            page.
          </p>
        </div>

        <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-600/20">
          SevaKhoj is a discovery platform, not a government service or a care
          provider. For emergencies, contact local emergency services. For
          scheme applications, use the official government portal linked on each
          scheme.
        </p>
      </div>
    </div>
  );
}
