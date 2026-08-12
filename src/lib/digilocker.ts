/**
 * DigiLocker integration (server-side only).
 *
 * Pulls Aadhaar eKYC + issued documents and maps them into the universal
 * profile that pre-fills the UP BOCW Form-1 at /apply/up-bocw.
 *
 * Runs in one of two modes:
 *   • CONFIGURED  — real OAuth 2.0 (PKCE) against the DigiLocker sandbox/prod
 *                   when DIGILOCKER_CLIENT_ID/SECRET/REDIRECT_URI are set.
 *   • MOCK        — returns a fixed sandbox test identity so the flow is
 *                   demonstrable locally without partner credentials.
 *
 * The OAuth client_secret must never reach the browser — everything here is
 * imported only by route handlers / server components.
 *
 * ⚠ Endpoint paths + /1//2//3/ version segments follow the DigiLocker Partner
 *   API but differ by partner tier and are revised — confirm against your
 *   onboarded docs (partners.digilocker.gov.in / APISetu) before going live.
 *   The flow is stable; the path strings are what to verify.
 */

import crypto from "node:crypto";

export const DL = {
  base: process.env.DIGILOCKER_BASE ?? "https://digilocker.meripehchaan.gov.in",
  clientId: process.env.DIGILOCKER_CLIENT_ID ?? "",
  clientSecret: process.env.DIGILOCKER_CLIENT_SECRET ?? "",
  redirectUri: process.env.DIGILOCKER_REDIRECT_URI ?? "",
  authorizePath: "/public/oauth2/1/authorize",
  tokenPath: "/public/oauth2/1/token",
  ekycPath: "/public/oauth2/3/kyc/aadhaar", // demographic eKYC — VERIFY version
  issuedPath: "/public/oauth2/2/files/issued", // list of issued docs — VERIFY
  fileXmlPath: (uri: string) => `/public/oauth2/1/xml/${encodeURIComponent(uri)}`,
};

/** True when real partner credentials are present; otherwise we run in mock mode. */
export function isConfigured(): boolean {
  return Boolean(DL.clientId && DL.clientSecret && DL.redirectUri);
}

/* ------------------------------------------------------------- PKCE + auth */

export function makePkce() {
  const verifier = crypto.randomBytes(32).toString("base64url");
  const challenge = crypto.createHash("sha256").update(verifier).digest("base64url");
  return { verifier, challenge };
}

export function buildAuthorizeUrl(state: string, codeChallenge: string): string {
  const q = new URLSearchParams({
    response_type: "code",
    client_id: DL.clientId,
    redirect_uri: DL.redirectUri,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });
  return `${DL.base}${DL.authorizePath}?${q.toString()}`;
}

/* --------------------------------------------------------------- API calls */

export async function exchangeToken(code: string, codeVerifier: string) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: DL.clientId,
    client_secret: DL.clientSecret,
    redirect_uri: DL.redirectUri,
    code_verifier: codeVerifier,
  });
  const res = await fetch(`${DL.base}${DL.tokenPath}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`token exchange failed: ${res.status} ${await res.text()}`);
  return (await res.json()) as Record<string, unknown> & { access_token: string; digilockerid?: string };
}

export async function fetchEkyc(accessToken: string): Promise<EkycResponse> {
  const res = await fetch(`${DL.base}${DL.ekycPath}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`eKYC failed: ${res.status} ${await res.text()}`);
  return (await res.json()) as EkycResponse;
}

export async function listIssued(accessToken: string): Promise<IssuedDoc[]> {
  const res = await fetch(`${DL.base}${DL.issuedPath}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`issued list failed: ${res.status} ${await res.text()}`);
  const json = (await res.json()) as { items?: IssuedDoc[] };
  return json.items ?? [];
}

/** Pull one issued doc as XML. Parse with fast-xml-parser to read its fields. */
export async function pullIssued(accessToken: string, uri: string): Promise<string> {
  const res = await fetch(`${DL.base}${DL.fileXmlPath(uri)}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`pull doc failed: ${res.status} ${await res.text()}`);
  return await res.text();
}

/* ------------------------------------------------------------------- types */

export type EkycResponse = {
  name: string;
  dob: string; // dd-mm-yyyy
  gender: "M" | "F" | "O";
  careof?: string;
  house?: string;
  street?: string;
  vtc?: string;
  po?: string;
  subdist?: string;
  dist?: string;
  state?: string;
  pincode?: string;
  maskedaadhaar?: string;
  photo?: string; // base64 jpeg
};

export type IssuedDoc = {
  name: string;
  type: string;
  issuer: string;
  uri: string;
  /** Present in mock mode; in production, parse from pullIssued(uri). */
  fields?: Record<string, string>;
};

export type Profile = {
  fields: Record<string, string>;
  /** field key -> where it came from (for provenance badges) */
  source: Record<string, string>;
};

/* ---------------------------------------------------------- mock (sandbox) */

/** Fixed sandbox test identity used when partner credentials aren't configured. */
export function mockPull(): { ekyc: EkycResponse; issued: IssuedDoc[] } {
  return {
    ekyc: {
      name: "Ramesh Kumar Yadav",
      dob: "14-06-1989",
      gender: "M",
      careof: "S/O Mohan Lal Yadav",
      house: "H.No 42",
      street: "Rampur Bujurg",
      vtc: "Rampur Bujurg",
      po: "Barabanki",
      subdist: "Nawabganj",
      dist: "Barabanki",
      state: "Uttar Pradesh",
      pincode: "225001",
      maskedaadhaar: "XXXX XXXX 4321",
      photo: "",
    },
    issued: [
      { name: "Caste Certificate", type: "CASTE", issuer: "UP e-District", uri: "in.gov.up-CASTE-2231", fields: { category: "OBC" } },
      { name: "Ration Card", type: "RCUP", issuer: "UP FCS", uri: "in.gov.up-RCUP-90", fields: { rationCardNo: "UP••••••2781" } },
    ],
  };
}

/* ----------------------------------------------------------------- mapping */

/**
 * Map DigiLocker responses -> universal profile. What DigiLocker does NOT give:
 * mother's name, admin granularity (mandal/block/gram-panchayat), employer,
 * nominee -> self-declared; bank -> Account Aggregator / penny-drop.
 */
export function mapToProfile(ekyc: EkycResponse, issued: IssuedDoc[]): Profile {
  const fields: Record<string, string> = {};
  const source: Record<string, string> = {};
  const set = (k: string, v: string | undefined, src: string) => {
    if (v) {
      fields[k] = v;
      source[k] = src;
    }
  };

  const co = ekyc.careof ?? "";
  const relType = /^W\/O/i.test(co) ? "Husband" : "Father";
  const relName = co.replace(/^[SDWC]\/O\s*/i, "").trim();
  const dob = ekyc.dob?.includes("-") ? ekyc.dob.split("-").reverse().join("-") : ekyc.dob; // dd-mm-yyyy -> yyyy-mm-dd

  set("aadhaar", ekyc.maskedaadhaar, "DigiLocker · eKYC");
  set("fullName", ekyc.name, "DigiLocker · eKYC");
  set("relType", relType, "DigiLocker · eKYC");
  set("relName", relName, "DigiLocker · eKYC");
  set("dob", dob, "DigiLocker · eKYC");
  set("gender", ekyc.gender === "M" ? "Male" : ekyc.gender === "F" ? "Female" : "Other", "DigiLocker · eKYC");
  set("village", ekyc.vtc, "DigiLocker · eKYC");
  set("tehsil", ekyc.subdist, "DigiLocker · eKYC");
  set("post", ekyc.po, "DigiLocker · eKYC");
  set("district", ekyc.dist, "DigiLocker · eKYC");
  set("state", ekyc.state, "DigiLocker · eKYC");
  set("pin", ekyc.pincode, "DigiLocker · eKYC");

  const caste = issued.find((d) => /caste/i.test(d.name) || d.type === "CASTE");
  const ration = issued.find((d) => /ration/i.test(d.name) || d.type === "RCUP");
  // In production, values come from pullIssued(uri) + XML parse; here we read
  // the mock's inline fields when present, else leave the value for later.
  if (caste?.fields?.category) set("category", caste.fields.category, `DigiLocker · ${caste.name}`);
  if (ration?.fields?.rationCardNo) set("rationCard", ration.fields.rationCardNo, `DigiLocker · ${ration.name}`);

  return { fields, source };
}
