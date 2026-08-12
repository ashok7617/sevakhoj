import { readProfile } from "@/lib/digilocker-store";
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
  const profile = await readProfile();
  return (
    <MhBocwForm
      profile={profile}
      configured={isConfigured()}
      connectedVia={sp.connected}
      error={sp.error}
    />
  );
}
