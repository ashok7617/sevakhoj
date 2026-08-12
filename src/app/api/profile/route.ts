import { NextResponse, type NextRequest } from "next/server";
import { saveProfile, clearProfile } from "@/lib/digilocker-store";

export const dynamic = "force-dynamic";

/**
 * Save the user's manually-entered universal profile (reused across every
 * apply form). Self-declared — stored in the same profile cookie the optional
 * DigiLocker pull would use, so both paths feed the forms identically.
 * Prototype-grade: production would key this to a signed-in user's DB record.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { fields?: Record<string, unknown> } | null;
  const raw = body?.fields;
  if (!raw || typeof raw !== "object") {
    return NextResponse.json({ error: "expected { fields: {...} }" }, { status: 400 });
  }

  const fields: Record<string, string> = {};
  const source: Record<string, string> = {};
  let n = 0;
  for (const [k, v] of Object.entries(raw)) {
    if (typeof v === "string" && v.trim() !== "" && n < 60) {
      fields[k] = v.slice(0, 200);
      source[k] = "self-entered";
      n++;
    }
  }

  await saveProfile({ fields, source });
  return NextResponse.json({ ok: true, saved: n });
}

export async function DELETE() {
  await clearProfile();
  return NextResponse.json({ ok: true });
}
