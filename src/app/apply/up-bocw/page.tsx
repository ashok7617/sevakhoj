import { readProfile } from "@/lib/digilocker-store";
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
  const profile = await readProfile();
  return (
    <UpBocwForm
      profile={profile}
      configured={isConfigured()}
      connectedVia={sp.connected}
      error={sp.error}
    />
  );
}
