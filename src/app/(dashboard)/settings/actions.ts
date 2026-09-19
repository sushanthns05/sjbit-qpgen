"use server";

import { adminDb } from "@/lib/firebase-admin";

export async function saveAiProviderConfig(data: {
  provider: string;
  apiKey: string;
  apiVersion: string;
  model: string;
}) {
  try {
    // In a real production app, we would encrypt the API key before saving it.
    // For this demonstration, we are storing it in a restricted 'system_settings' collection 
    // that is only accessible by Firebase Admin SDK (Server Actions).
    await adminDb.collection("system_settings").doc("ai_provider").set({
      ...data,
      updatedAt: new Date(),
    });
    return { success: true, message: "Configuration saved successfully." };
  } catch (error) {
    console.error("Failed to save AI config:", error);
    return { success: false, message: "Failed to save configuration." };
  }
}

export async function getAiProviderConfig() {
  try {
    const doc = await adminDb.collection("system_settings").doc("ai_provider").get();
    if (doc.exists) {
      return { success: true, data: doc.data() };
    }
    return { success: true, data: null };
  } catch (error) {
    console.error("Failed to get AI config:", error);
    return { success: false, message: "Failed to load configuration." };
  }
}
