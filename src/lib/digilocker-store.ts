/**
 * Short-lived cookie storage for the DigiLocker flow:
 *   • dl_pkce    — the PKCE verifier + state, between connect and callback
 *   • dl_profile — the mapped profile, between callback and the apply page
 *
 * Prototype-grade: a production build would key these to the signed-in user's
 * session and persist the profile (consent-logged) in the DB instead of a cookie.
 * We deliberately never store the raw Aadhaar number or the eKYC photo here.
 */

import { cookies } from "next/headers";
import type { Profile } from "./digilocker";

const PKCE = "dl_pkce";
const PROFILE = "dl_profile";
const secure = process.env.NODE_ENV === "production";

export async function savePkce(state: string, verifier: string) {
  const c = await cookies();
  c.set(PKCE, JSON.stringify({ state, verifier }), {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 600,
  });
}

/** One-time read: validates state, returns the verifier, clears the cookie. */
export async function takePkce(state: string): Promise<string | null> {
  const c = await cookies();
  const raw = c.get(PKCE)?.value;
  c.delete(PKCE);
  if (!raw) return null;
  try {
    const o = JSON.parse(raw) as { state: string; verifier: string };
    return o.state === state ? o.verifier : null;
  } catch {
    return null;
  }
}

export async function saveProfile(p: Profile) {
  const c = await cookies();
  c.set(PROFILE, JSON.stringify(p), {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 3600,
  });
}

export async function readProfile(): Promise<Profile | null> {
  const c = await cookies();
  const raw = c.get(PROFILE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Profile;
  } catch {
    return null;
  }
}

export async function clearProfile() {
  const c = await cookies();
  c.delete(PROFILE);
}
