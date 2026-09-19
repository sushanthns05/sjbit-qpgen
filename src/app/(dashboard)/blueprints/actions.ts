"use server";

import { getFirestore } from "firebase-admin/firestore";
import { getFirebaseAdminApp } from "@/lib/firebase-admin";
import { Blueprint } from "@/types/paper";
import { revalidatePath } from "next/cache";

// Helper to get Firestore instance
const db = () => getFirestore(getFirebaseAdminApp());

const COLLECTION_NAME = "blueprints";

export async function getBlueprints(): Promise<Blueprint[]> {
  try {
    const snapshot = await db().collection(COLLECTION_NAME).orderBy("createdAt", "desc").get();
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
      } as Blueprint;
    });
  } catch (error) {
    console.error("Error fetching blueprints:", error);
    return [];
  }
}

export async function createBlueprint(data: Omit<Blueprint, "id" | "createdAt" | "updatedAt">): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const now = new Date().toISOString();
    const docRef = await db().collection(COLLECTION_NAME).add({
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    
    revalidatePath("/blueprints");
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error("Error creating blueprint:", error);
    return { success: false, error: error.message };
  }
}

export async function updateBlueprint(id: string, data: Partial<Blueprint>): Promise<{ success: boolean; error?: string }> {
  try {
    const now = new Date().toISOString();
    await db().collection(COLLECTION_NAME).doc(id).update({
      ...data,
      updatedAt: now,
    });
    
    revalidatePath("/blueprints");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating blueprint:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteBlueprint(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await db().collection(COLLECTION_NAME).doc(id).delete();
    revalidatePath("/blueprints");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting blueprint:", error);
    return { success: false, error: error.message };
  }
}
