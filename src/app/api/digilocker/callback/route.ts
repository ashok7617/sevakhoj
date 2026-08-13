import { NextResponse, type NextRequest } from "next/server";
import { exchangeToken, fetchEkyc, listIssued, mapToProfile, safeApplyPath } from "@/lib/digilocker";
import { takePkce } from "@/lib/digilocker-store";
import { persistProfile } from "@/lib/profileStore";

export const dynamic = "force-dynamic";

/** DigiLocker redirects here with ?code&state (real mode only). */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const state = url.searchParams.get("state");
  const taken = state ? await takePkce(state) : null;
  const next = safeApplyPath(taken?.next);
  const back = (q: string) => NextResponse.redirect(new URL(`${next}?${q}`, req.url));

  const error = url.searchParams.get("error");
  if (error) return back(`error=${encodeURIComponent(error)}`);

  const code = url.searchParams.get("code");
  if (!code || !state) return back("error=missing_code");
  if (!taken) return back("error=invalid_state");

  try {
    const token = await exchangeToken(code, taken.verifier);
    const ekyc = await fetchEkyc(token.access_token);
    const issued = await listIssued(token.access_token);
    await persistProfile(mapToProfile(ekyc, issued));
    return back("connected=1");
  } catch {
    return back("error=pull_failed");
  }
}
