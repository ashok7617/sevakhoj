"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/db";
import { actionForType } from "@/lib/verification";

const { verifications, facilities, governmentSchemes } = schema;

type EnumStatus =
  | "government_verified"
  | "registration_verified"
  | "phone_verified"
  | "user_submitted"
  | "needs_verification";

/**
 * Record a verification decision: append an immutable row to the `verifications`
 * audit trail AND update the entity's badge + last-verified date. Used as a
 * <form action>. Only invoked from the admin queue when the DB is connected.
 */
export async function setVerification(formData: FormData): Promise<void> {
  const entityType = String(formData.get("entityType") || "");
  const entityId = String(formData.get("entityId") || "");
  const actionType = String(formData.get("actionType") || "");
  const reviewer = String(formData.get("reviewer") || "").trim() || "admin";
  const note = String(formData.get("note") || "").trim();

  if (entityType !== "facility" && entityType !== "scheme") return;
  const action = actionForType(actionType);
  if (!action || !entityId) return;

  const status = action.status as EnumStatus;

  // 1) immutable audit trail entry
  await db.insert(verifications).values({
    entityType,
    entityId,
    verificationType: action.type,
    source: "admin dashboard",
    verifiedBy: reviewer,
    status,
    evidence: note ? { note } : null,
  });

  // 2) update the live badge on the entity
  if (entityType === "facility") {
    await db
      .update(facilities)
      .set({ verificationStatus: status, lastVerified: new Date(), updatedAt: new Date() })
      .where(eq(facilities.id, entityId));
  } else {
    await db
      .update(governmentSchemes)
      .set({
        verificationStatus: status,
        verifiedDate: new Date().toISOString().slice(0, 10),
        updatedAt: new Date(),
      })
      .where(eq(governmentSchemes.id, entityId));
  }

  revalidatePath("/admin");
  revalidatePath("/admin/verify");
  if (entityType === "facility") revalidatePath(`/care-centers/${entityId}`);
}
