import Link from "next/link";

export const metadata = {
  title: "About · SevaKhoj",
  description:
    "SevaKhoj is a free, India-wide platform to discover care & support facilities and government schemes — built on source-attributed data.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900">About SevaKhoj</h1>
      <p className="mt-2 text-lg text-slate-600">
        सेवा खोज — &ldquo;Seva&rdquo; (service / care) + &ldquo;Khoj&rdquo;
        (search). A care search for India.
      </p>

      <div className="mt-8 space-y-6 text-slate-700 leading-relaxed">
        <p>
          SevaKhoj helps people across India find <strong>care &amp; support
          facilities</strong> — old-age homes, shelters, day-care, disability
          and mental-health services, and more — alongside the{" "}
          <strong>government schemes</strong> they may be eligible for. It brings
          scattered, hard-to-find information into one place so families can act
          with confidence.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">
          A discovery platform — not a government service
        </h2>
        <p>
          SevaKhoj is an independent discovery platform. It is{" "}
          <strong>not</strong> a government website, and a facility appearing
          here — even one registered with a government body — is{" "}
          <strong>not</strong> an endorsement of its quality. Always confirm
          details with the facility and through official government portals
          before acting.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">
          How we handle data
        </h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>Source-attributed.</strong> Records link back to the
            official source they came from, with a last-verified date. See our{" "}
            <Link href="/data-sources" className="text-emerald-700 hover:underline">
              government data sources
            </Link>
            .
          </li>
          <li>
            <strong>Verification badges.</strong> Every record shows its status —
            from <em>government-verified</em> down to <em>needs-verification</em>{" "}
            — so you always know how confident to be.
          </li>
          <li>
            <strong>Original government data is never overwritten.</strong> Raw
            records are preserved for traceability.
          </li>
          <li>
            <strong>No invented information.</strong> Our AI Care Finder only
            helps interpret your query; the answers come from real data, not
            guesses.
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-slate-900">Free &amp; open</h2>
        <p>
          SevaKhoj is free to use. The project is open-source under the MIT
          license — you can view the code on{" "}
          <a
            href="https://github.com/ashok7617/sevakhoj"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-700 hover:underline"
          >
            GitHub
          </a>
          .
        </p>

        <h2 className="text-xl font-semibold text-slate-900">
          Run or list a center?
        </h2>
        <p>
          If you run a care facility, you can{" "}
          <Link href="/register" className="text-emerald-700 hover:underline">
            add your center
          </Link>{" "}
          so families can find it. Questions or corrections? Reach us via the{" "}
          <Link href="/contact" className="text-emerald-700 hover:underline">
            contact page
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
