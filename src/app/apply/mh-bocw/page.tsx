import { getProfile } from "@/lib/profileStore";
import { getCurrentUser } from "@/lib/auth";
import { isConfigured } from "@/lib/digilocker";
import { MhBocwForm } from "./MhBocwForm";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Apply · Maharashtra Construction Worker (MahaBOCW) — SevaKhoj",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const [profile, user] = await Promise.all([getProfile(), getCurrentUser()]);
  return (
    <MhBocwForm
      profile={profile}
      configured={isConfigured()}
      signedIn={Boolean(user)}
      connectedVia={sp.connected}
      error={sp.error}
    />
  );
}
