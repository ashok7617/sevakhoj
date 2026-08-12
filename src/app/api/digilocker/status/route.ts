import { NextResponse } from "next/server";
import { DL, isConfigured } from "@/lib/digilocker";

export const dynamic = "force-dynamic";

/**
 * Non-secret diagnostic: confirm the DigiLocker env is wired without exposing
 * the client secret. `clientId` is shown masked (it's sent in the public
 * authorize URL anyway); the secret is only reported as present/absent.
 */
export async function GET() {
  const configured = isConfigured();
  return NextResponse.json({
    mode: configured ? "live" : "mock",
    configured,
    clientId: DL.clientId ? `…${DL.clientId.slice(-4)}` : null,
    clientSecretPresent: Boolean(DL.clientSecret),
    base: DL.base,
    redirectUri: DL.redirectUri || null,
    scopeSet: Boolean(DL.scope),
    endpoints: {
      authorize: DL.authorizePath,
      token: DL.tokenPath,
      issued: DL.issuedPath,
      ekyc: DL.ekycPath,
    },
    note: "No secret is returned. mode=mock uses a fixed sandbox test identity; mode=live requires DIGILOCKER_CLIENT_ID/SECRET/REDIRECT_URI.",
  });
}
