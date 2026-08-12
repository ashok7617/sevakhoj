import { readProfile } from "@/lib/digilocker-store";
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
  const profile = await readProfile();
  return (
    <KaBocwForm
      profile={profile}
      configured={isConfigured()}
      connectedVia={sp.connected}
      error={sp.error}
    />
  );
}
