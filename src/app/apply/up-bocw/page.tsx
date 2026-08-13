import { getProfile } from "@/lib/profileStore";
import { getCurrentUser } from "@/lib/auth";
import { isConfigured } from "@/lib/digilocker";
import { UpBocwForm } from "./UpBocwForm";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Apply · UP Construction Worker Labour Card — SevaKhoj",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const [profile, user] = await Promise.all([getProfile(), getCurrentUser()]);
  return (
    <UpBocwForm
      profile={profile}
      configured={isConfigured()}
      signedIn={Boolean(user)}
      connectedVia={sp.connected}
      error={sp.error}
    />
  );
}
