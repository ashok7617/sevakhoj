import Link from "next/link";

export const metadata = { title: "For Organizations · India Care & Support" };

const RUN_ORG = [
  "Grants and government schemes for your organization",
  "Registration requirements and renewals",
  "Minimum standards and compliance",
  "Funding opportunities and CSR matching",
  "Applicable licenses and approvals",
];

const START_CENTER = [
  "Which type of organization to establish",
  "Required registrations (e.g. Societies / Trust / Section 8, JJ Act, NGO DARPAN)",
  "Government schemes and grants you may qualify for",
  "Minimum standards and safety requirements",
  "Licenses and approvals, and the application processes",
  "Government contacts and nearby existing centers",
];

export default function ForOrganizationsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">For Organizations</h1>
      <p className="mt-2 text-slate-600">
        Tools for NGOs and care providers — and a guided path for people who want
        to start a new care center.
      </p>

      <Link
        href="/register"
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
      >
        + List your care center
      </Link>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          I run an organization
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          {RUN_ORG.map((x) => (
            <li key={x} className="flex gap-2">
              <span className="mt-1 text-emerald-600">✓</span>
              <span>{x}</span>
            </li>
          ))}
        </ul>
      </section>

      <section
        id="start"
        className="mt-6 scroll-mt-20 rounded-2xl border border-slate-200 bg-white p-6"
      >
        <h2 className="text-lg font-semibold text-slate-900">
          I want to start a care center
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          {START_CENTER.map((x) => (
            <li key={x} className="flex gap-2">
              <span className="mt-1 text-emerald-600">✓</span>
              <span>{x}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-slate-500">
          This platform is not a government service and does not provide legal
          advice. It links to official government portals and requirements.
        </p>
      </section>
    </div>
  );
}
