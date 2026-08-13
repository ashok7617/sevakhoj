import { NextResponse, type NextRequest } from "next/server";
import { login, setSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { email?: unknown; password?: unknown } | null;
  const res = await login(body?.email, body?.password);
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 401 });
  await setSession(res.userId);
  return NextResponse.json({ ok: true });
}
