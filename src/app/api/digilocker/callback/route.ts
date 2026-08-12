import { NextResponse, type NextRequest } from "next/server";
import { exchangeToken, fetchEkyc, listIssued, mapToProfile } from "@/lib/digilocker";
import { takePkce, saveProfile } from "@/lib/digilocker-store";

export const dynamic = "force-dynamic";

/** DigiLocker redirects here with ?code&state (real mode only). */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const back = (q: string) => NextResponse.redirect(new URL(`/apply/up-bocw?${q}`, req.url));

  const error = url.searchParams.get("error");
  if (error) return back(`error=${encodeURIComponent(error)}`);

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) return back("error=missing_code");

  const verifier = await takePkce(state);
  if (!verifier) return back("error=invalid_state");

  try {
    const token = await exchangeToken(code, verifier);
    const ekyc = await fetchEkyc(token.access_token);
    const issued = await listIssued(token.access_token);
    await saveProfile(mapToProfile(ekyc, issued));
    return back("connected=1");
  } catch {
    return back("error=pull_failed");
  }
}
