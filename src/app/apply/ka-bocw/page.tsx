import { getProfile } from "@/lib/profileStore";
import { getCurrentUser } from "@/lib/auth";
import { isConfigured } from "@/lib/digilocker";
import { KaBocwForm } from "./KaBocwForm";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Apply · Karnataka Construction Worker (KBOCWWB) — SevaKhoj",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const [profile, user] = await Promise.all([getProfile(), getCurrentUser()]);
  return (
    <KaBocwForm
      profile={profile}
      configured={isConfigured()}
      signedIn={Boolean(user)}
      connectedVia={sp.connected}
      error={sp.error}
    />
  );
}
