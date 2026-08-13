import { getCurrentUser } from "@/lib/auth";
import { getProfile } from "@/lib/profileStore";
import { MyProfileForm } from "./MyProfileForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "My profile — SevaKhoj" };

export default async function Page() {
  const [user, profile] = await Promise.all([getCurrentUser(), getProfile()]);
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <MyProfileForm initial={profile?.fields ?? {}} signedIn={Boolean(user)} email={user?.email} />
    </div>
  );
}
