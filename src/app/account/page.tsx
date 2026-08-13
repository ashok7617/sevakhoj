import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getProfile } from "@/lib/profileStore";
import { AccountClient } from "./AccountClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Account — SevaKhoj" };

export default async function Page() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-12">
        <AccountClient />
      </div>
    );
  }

  const profile = await getProfile();
  const saved = profile ? Object.keys(profile.fields).length : 0;

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <p className="font-mono text-xs uppercase tracking-widest text-emerald-700">SevaKhoj · Account</p>
      <h1 className="mt-1 text-2xl font-bold text-slate-900">Your account</h1>
      <p className="mt-2 text-sm text-slate-600">
        Signed in as <b className="text-slate-900">{user.email}</b>.
      </p>

      <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
        <div className="text-sm font-semibold text-slate-800">Saved profile</div>
        <p className="mt-1 text-sm text-slate-600">
          {saved > 0
            ? `${saved} field${saved === 1 ? "" : "s"} saved to your account — they pre-fill every scheme application.`
            : "No details saved yet. Start an application and hit “Save my details”."}
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <Link href="/apply/up-bocw" className="font-medium text-emerald-700 hover:underline">Start an application →</Link>
          <Link href="/schemes" className="text-slate-500 hover:underline">Browse schemes</Link>
        </div>
      </div>

      <a
        href="/api/auth/logout"
        className="mt-5 inline-block rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
      >
        Sign out
      </a>
    </div>
  );
}
