import { listCareCategories } from "@/lib/queries";
import { RegisterForm } from "@/components/RegisterForm";
import { DbNotice } from "@/components/DbNotice";

export const metadata = { title: "Add your center · SevaKhoj" };
export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const { rows: categories, dbAvailable } = await listCareCategories();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Add / register your center</h1>
      <p className="mt-1 text-sm text-slate-600">
        Government-run, NGO, or private — list your care facility so families who
        need it can find you. You keep control of your own details.
      </p>

      <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 ring-1 ring-amber-600/20">
        Submissions appear immediately with a <strong>User Submitted</strong> badge,
        then get verified against official sources. Registration is not an
        endorsement, and this is not a government service.
      </p>

      <div className="mt-6">
        {!dbAvailable ? (
          <DbNotice />
        ) : (
          <RegisterForm categories={categories} />
        )}
      </div>
    </div>
  );
}
