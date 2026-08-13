import { NextResponse, type NextRequest } from "next/server";
import { signup, setSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { email?: unknown; password?: unknown } | null;
  const res = await signup(body?.email, body?.password);
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 400 });
  await setSession(res.userId);
  return NextResponse.json({ ok: true });
}
