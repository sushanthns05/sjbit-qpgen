import { adminDb } from "@/lib/firebase-admin";

export async function logAudit(action: string, details: string, userId: string = "System") {
  try {
    await adminDb.collection("audit_logs").add({
      action,
      details,
      userId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}
