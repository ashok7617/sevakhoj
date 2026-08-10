import Link from "next/link";

export const metadata = {
  title: "Privacy Policy · SevaKhoj",
  description: "How SevaKhoj collects, uses, and protects your information.",
};

const LAST_UPDATED = "10 August 2026";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
      <p className="mt-2 text-sm text-slate-500">Last updated: {LAST_UPDATED}</p>

      <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-600/20">
        This is a plain-language starter policy describing how SevaKhoj works
        today. Please have it reviewed by a qualified professional before relying
        on it, and update it whenever the service changes.
      </p>

      <div className="mt-8 space-y-6 text-slate-700 leading-relaxed">
        <p>
          SevaKhoj (&ldquo;we&rdquo;, &ldquo;us&rdquo;) is a free platform for
          discovering care facilities and government schemes across India. We aim
          to collect as little personal information as possible.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">
          Information we collect
        </h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>Center registrations.</strong> If you use{" "}
            <Link href="/register" className="text-emerald-700 hover:underline">
              Add your center
            </Link>
            , we collect the facility details you enter and the submitter name
            and contact you provide, so we can follow up and verify the listing.
          </li>
          <li>
            <strong>Location (only if you allow it).</strong> The{" "}
            <Link href="/near" className="text-emerald-700 hover:underline">
              Near&nbsp;Me
            </Link>{" "}
            map asks your browser for your location to find nearby facilities.
            This happens only with your permission and is used to run the search;
            we do not build a profile of your movements.
          </li>
          <li>
            <strong>Search queries.</strong> Text you type into the Care Finder
            or search boxes is processed to return results.
          </li>
          <li>
            <strong>Basic technical logs.</strong> Like most websites, our
            hosting provider records standard request logs (e.g. IP address,
            browser type) for security and reliability.
          </li>
          <li>
            <strong>No accounts, and no advertising trackers.</strong> SevaKhoj
            does not require you to create an account and does not use
            third-party advertising cookies.
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-slate-900">
          How we use information
        </h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>To show you relevant facilities and schemes.</li>
          <li>To verify and improve the accuracy of listings.</li>
          <li>To keep the service secure and working.</li>
        </ul>

        <h2 className="text-xl font-semibold text-slate-900">
          Service providers we rely on
        </h2>
        <p>
          We use a small number of third parties to run the service. Your use of
          SevaKhoj is subject to their handling of data as well:
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li><strong>Vercel</strong> — website hosting and request logs.</li>
          <li><strong>Neon</strong> — database hosting for listings.</li>
          <li>
            <strong>OpenStreetMap / Nominatim</strong> — converting place names
            and coordinates for maps and search.
          </li>
          <li>
            <strong>Anthropic</strong> — <em>only if</em> the AI Care Finder is
            enabled, your query text may be sent to interpret it. When the
            free rule-based finder is used, queries are processed on our own
            server and are not sent to any AI provider.
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-slate-900">
          Sharing &amp; selling
        </h2>
        <p>
          We do <strong>not</strong> sell your personal information. We share it
          only with the service providers above as needed to run SevaKhoj, or
          where required by law.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">
          Facility contact details
        </h2>
        <p>
          Listings may include publicly available contact information for
          organizations (not private individuals). If you represent a listed
          organization and want your details corrected or removed, contact us.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">Your choices</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>You can deny or revoke location permission in your browser at any time.</li>
          <li>
            You can ask us to correct or delete information you submitted — email
            us via the{" "}
            <Link href="/contact" className="text-emerald-700 hover:underline">
              contact page
            </Link>
            .
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-slate-900">Children</h2>
        <p>
          SevaKhoj is intended for adults seeking care information. We do not
          knowingly collect personal information directly from children.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">
          Changes to this policy
        </h2>
        <p>
          We may update this policy as the service evolves. Material changes will
          be reflected by the &ldquo;last updated&rdquo; date above.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">Contact</h2>
        <p>
          Questions about privacy? Reach us via the{" "}
          <Link href="/contact" className="text-emerald-700 hover:underline">
            contact page
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
