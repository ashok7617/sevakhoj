import crypto from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import {
  isConfigured,
  makePkce,
  buildAuthorizeUrl,
  mockPull,
  mapToProfile,
  safeApplyPath,
} from "@/lib/digilocker";
import { savePkce, saveProfile } from "@/lib/digilocker-store";

export const dynamic = "force-dynamic";

/**
 * Start the DigiLocker pull. `?next` is the apply page to return to, so the
 * same pull can serve any state's form.
 *  • Real mode: PKCE + redirect to DigiLocker to sign in & consent.
 *  • Mock mode (no partner creds): map the sandbox test identity into the
 *    shared profile cookie so the flow is demonstrable locally.
 */
export async function GET(req: NextRequest) {
  const next = safeApplyPath(req.nextUrl.searchParams.get("next"));

  if (isConfigured()) {
    const state = crypto.randomUUID();
    const { verifier, challenge } = makePkce();
    await savePkce(state, verifier, next);
    return NextResponse.redirect(buildAuthorizeUrl(state, challenge));
  }

  const { ekyc, issued } = mockPull();
  await saveProfile(mapToProfile(ekyc, issued));
  return NextResponse.redirect(new URL(`${next}?connected=mock`, req.url));
}
