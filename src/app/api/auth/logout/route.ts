import { NextResponse, type NextRequest } from "next/server";
import { clearSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  await clearSession();
  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  await clearSession();
  return NextResponse.redirect(new URL("/account", req.url));
}
