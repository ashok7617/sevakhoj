/**
 * User-aware profile storage. Signed-in users get a durable DB record
 * (user_profiles); anonymous users fall back to the httpOnly cookie so the
 * apply flow still works without an account. Both the manual save and the
 * (dormant) DigiLocker pull persist through here.
 */

import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { userProfiles } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import type { Profile } from "@/lib/digilocker";
import {
  readProfile as readCookie,
  saveProfile as saveCookie,
  clearProfile as clearCookie,
} from "@/lib/digilocker-store";

export async function getProfile(): Promise<Profile | null> {
  const u = await getCurrentUser();
  if (u) {
    const rows = await db.select({ data: userProfiles.data }).from(userProfiles).where(eq(userProfiles.userId, u.id)).limit(1);
    const data = rows[0]?.data as Profile | undefined;
    return data && data.fields ? data : null;
  }
  return readCookie();
}

export async function persistProfile(p: Profile): Promise<void> {
  const u = await getCurrentUser();
  if (u) {
    await db
      .insert(userProfiles)
      .values({ userId: u.id, data: p, updatedAt: new Date() })
      .onConflictDoUpdate({ target: userProfiles.userId, set: { data: p, updatedAt: new Date() } });
  } else {
    await saveCookie(p);
  }
}

export async function saveManualFields(fields: Record<string, string>): Promise<void> {
  const source: Record<string, string> = {};
  for (const k of Object.keys(fields)) source[k] = "self-entered";
  await persistProfile({ fields, source });
}

export async function clearProfile(): Promise<void> {
  const u = await getCurrentUser();
  if (u) await db.delete(userProfiles).where(eq(userProfiles.userId, u.id));
  else await clearCookie();
}
