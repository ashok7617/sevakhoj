import { NextResponse, type NextRequest } from "next/server";
import { safeApplyPath } from "@/lib/digilocker";
import { clearProfile } from "@/lib/profileStore";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const next = safeApplyPath(req.nextUrl.searchParams.get("next"));
  await clearProfile();
  return NextResponse.redirect(new URL(next, req.url));
}
