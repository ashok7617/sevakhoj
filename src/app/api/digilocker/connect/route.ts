import crypto from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import {
  isConfigured,
  makePkce,
  buildAuthorizeUrl,
  mockPull,
  mapToProfile,
} from "@/lib/digilocker";
import { savePkce, saveProfile } from "@/lib/digilocker-store";

export const dynamic = "force-dynamic";

/**
 * Start the DigiLocker pull.
 *  • Real mode: PKCE + redirect the citizen to DigiLocker to sign in & consent.
 *  • Mock mode (no partner creds): map the sandbox test identity straight into
 *    the profile cookie so the flow is demonstrable locally.
 */
export async function GET(req: NextRequest) {
  if (isConfigured()) {
    const state = crypto.randomUUID();
    const { verifier, challenge } = makePkce();
    await savePkce(state, verifier);
    return NextResponse.redirect(buildAuthorizeUrl(state, challenge));
  }

  const { ekyc, issued } = mockPull();
  await saveProfile(mapToProfile(ekyc, issued));
  return NextResponse.redirect(new URL("/apply/up-bocw?connected=mock", req.url));
}
