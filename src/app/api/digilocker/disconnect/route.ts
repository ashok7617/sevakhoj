import { NextResponse, type NextRequest } from "next/server";
import { clearProfile } from "@/lib/digilocker-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await clearProfile();
  return NextResponse.redirect(new URL("/apply/up-bocw", req.url));
}
