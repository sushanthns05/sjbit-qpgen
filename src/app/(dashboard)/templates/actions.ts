"use server";

import { adminDb } from "@/lib/firebase-admin";
import { PaperTemplate } from "@/types/paper";
import { revalidatePath } from "next/cache";

const COLLECTION_NAME = "templates";

import { serializeFirestoreDoc } from "@/lib/firestore-utils";

export async function getTemplates(): Promise<PaperTemplate[]> {
  const snapshot = await adminDb.collection(COLLECTION_NAME).orderBy("createdAt", "desc").get();
  return snapshot.docs.map((doc) => serializeFirestoreDoc(doc) as PaperTemplate);
}

export async function createTemplate(data: Omit<PaperTemplate, "id" | "createdAt" | "updatedAt">): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const now = new Date().toISOString();
    const docRef = await adminDb.collection(COLLECTION_NAME).add({
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    
    revalidatePath("/templates");
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error("Error creating template:", error);
    return { success: false, error: error.message };
  }
}

export async function updateTemplate(id: string, data: Partial<PaperTemplate>): Promise<{ success: boolean; error?: string }> {
  try {
    const now = new Date().toISOString();
    await adminDb.collection(COLLECTION_NAME).doc(id).update({
      ...data,
      updatedAt: now,
    });
    
    revalidatePath("/templates");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating template:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteTemplate(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await adminDb.collection(COLLECTION_NAME).doc(id).delete();
    revalidatePath("/templates");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting template:", error);
    return { success: false, error: error.message };
  }
}
