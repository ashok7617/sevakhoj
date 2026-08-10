import Link from "next/link";

export const metadata = {
  title: "Terms of Service · SevaKhoj",
  description: "The terms for using SevaKhoj, a care & schemes discovery platform.",
};

const LAST_UPDATED = "10 August 2026";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900">Terms of Service</h1>
      <p className="mt-2 text-sm text-slate-500">Last updated: {LAST_UPDATED}</p>

      <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-600/20">
        These are plain-language starter terms. Please have them reviewed by a
        qualified professional before relying on them.
      </p>

      <div className="mt-8 space-y-6 text-slate-700 leading-relaxed">
        <p>
          By using SevaKhoj (the &ldquo;Service&rdquo;), you agree to these
          terms. If you do not agree, please do not use the Service.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">
          1. What SevaKhoj is
        </h2>
        <p>
          SevaKhoj is a free <strong>discovery platform</strong> that helps you
          find care facilities and government schemes. It is{" "}
          <strong>not a government service</strong>, not a care provider, and not
          a substitute for professional medical, legal, or financial advice.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">
          2. Information is provided &ldquo;as is&rdquo;
        </h2>
        <p>
          We aggregate information from many sources and work to keep it
          accurate and attributed, but we cannot guarantee it is complete,
          current, or error-free. A listing&rsquo;s presence is{" "}
          <strong>not an endorsement</strong>, and government registration is not
          a guarantee of service quality.{" "}
          <strong>
            Always confirm details directly with the facility and through
            official government portals before acting.
          </strong>
        </p>

        <h2 className="text-xl font-semibold text-slate-900">
          3. Government schemes
        </h2>
        <p>
          Eligibility, benefits, and documents shown for schemes are for general
          guidance only and may change. Apply only through the official
          government portal linked on each scheme, and rely on the official
          source for authoritative terms.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">
          4. Listings you submit
        </h2>
        <p>
          If you submit a center via{" "}
          <Link href="/register" className="text-emerald-700 hover:underline">
            Add your center
          </Link>
          , you confirm you are entitled to share that information and that it is
          accurate. Submissions may be reviewed, edited, or removed. Do not
          submit false, misleading, or private personal information.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">
          5. Acceptable use
        </h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>Do not misuse the Service, disrupt it, or attempt unauthorized access.</li>
          <li>Do not scrape or reuse data in violation of the underlying source licenses.</li>
          <li>Do not use the Service for any unlawful purpose.</li>
        </ul>

        <h2 className="text-xl font-semibold text-slate-900">
          6. No warranties &amp; limitation of liability
        </h2>
        <p>
          To the fullest extent permitted by law, the Service is provided without
          warranties of any kind, and SevaKhoj is not liable for any loss or harm
          arising from reliance on information found here. Decisions about care
          are yours to make with appropriate professional guidance.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">
          7. Emergencies
        </h2>
        <p>
          SevaKhoj is not for emergencies. If someone is in danger or needs
          urgent help, contact local emergency services immediately.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">
          8. Changes
        </h2>
        <p>
          We may update these terms or the Service at any time. Continued use
          after changes means you accept the updated terms.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">
          9. Governing law
        </h2>
        <p>
          These terms are governed by the laws of India. (Confirm the specific
          jurisdiction with your legal advisor.)
        </p>

        <h2 className="text-xl font-semibold text-slate-900">10. Contact</h2>
        <p>
          Questions about these terms? Reach us via the{" "}
          <Link href="/contact" className="text-emerald-700 hover:underline">
            contact page
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
