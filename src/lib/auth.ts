/**
 * Minimal self-contained auth: email + password (scrypt) + an HMAC-signed
 * session cookie. No external services or dependencies. Prototype-grade —
 * production would add email verification, rate limiting, and rotation.
 */

import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { appUsers } from "@/db/schema";

const SESSION = "sk_session";
const SECRET = process.env.AUTH_SECRET ?? "dev-insecure-secret-change-me";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const secure = process.env.NODE_ENV === "production";

if (process.env.NODE_ENV === "production" && SECRET === "dev-insecure-secret-change-me") {
  console.warn("[auth] AUTH_SECRET is not set — sessions are insecure. Set it in the environment.");
}

/* --------------------------------------------------------------- passwords */

export function hashPassword(pw: string): string {
  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(pw, salt, 64);
  return `${salt.toString("hex")}.${key.toString("hex")}`;
}

export function verifyPassword(pw: string, stored: string): boolean {
  const [saltHex, keyHex] = stored.split(".");
  if (!saltHex || !keyHex) return false;
  const key = Buffer.from(keyHex, "hex");
  const test = crypto.scryptSync(pw, Buffer.from(saltHex, "hex"), 64);
  return key.length === test.length && crypto.timingSafeEqual(key, test);
}

/* ---------------------------------------------------------------- sessions */

function sign(payload: string): string {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
}

export async function setSession(userId: string) {
  const payload = `${userId}.${Date.now() + MAX_AGE * 1000}`;
  const token = `${payload}.${sign(payload)}`;
  (await cookies()).set(SESSION, token, { httpOnly: true, sameSite: "lax", secure, path: "/", maxAge: MAX_AGE });
}

export async function clearSession() {
  (await cookies()).delete(SESSION);
}

function verifyToken(token: string | undefined): string | null {
  if (!token) return null;
  const i = token.lastIndexOf(".");
  if (i < 0) return null;
  const payload = token.slice(0, i);
  const sig = token.slice(i + 1);
  const expected = sign(payload);
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  const [userId, expStr] = payload.split(".");
  if (!userId || !expStr || Date.now() > Number(expStr)) return null;
  return userId;
}

/** The signed-in user (id + email), or null. Safe to call in server components. */
export async function getCurrentUser(): Promise<{ id: string; email: string } | null> {
  const token = (await cookies()).get(SESSION)?.value;
  const userId = verifyToken(token);
  if (!userId) return null;
  const rows = await db
    .select({ id: appUsers.id, email: appUsers.email })
    .from(appUsers)
    .where(eq(appUsers.id, userId))
    .limit(1);
  return rows[0] ?? null;
}

/* -------------------------------------------------------------- signup/login */

export type AuthResult = { ok: true; userId: string } | { ok: false; error: string };

export function normalizeEmail(email: unknown): string | null {
  if (typeof email !== "string") return null;
  const e = email.trim().toLowerCase();
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e) ? e : null;
}

export async function signup(emailRaw: unknown, password: unknown): Promise<AuthResult> {
  const email = normalizeEmail(emailRaw);
  if (!email) return { ok: false, error: "Enter a valid email address." };
  if (typeof password !== "string" || password.length < 8) return { ok: false, error: "Password must be at least 8 characters." };

  const existing = await db.select({ id: appUsers.id }).from(appUsers).where(eq(appUsers.email, email)).limit(1);
  if (existing[0]) return { ok: false, error: "An account with this email already exists — sign in instead." };

  const rows = await db.insert(appUsers).values({ email, passwordHash: hashPassword(password) }).returning({ id: appUsers.id });
  return { ok: true, userId: rows[0].id };
}

export async function login(emailRaw: unknown, password: unknown): Promise<AuthResult> {
  const email = normalizeEmail(emailRaw);
  if (!email || typeof password !== "string") return { ok: false, error: "Enter your email and password." };

  const rows = await db.select({ id: appUsers.id, passwordHash: appUsers.passwordHash }).from(appUsers).where(eq(appUsers.email, email)).limit(1);
  const user = rows[0];
  if (!user || !verifyPassword(password, user.passwordHash)) return { ok: false, error: "Email or password is incorrect." };
  return { ok: true, userId: user.id };
}
