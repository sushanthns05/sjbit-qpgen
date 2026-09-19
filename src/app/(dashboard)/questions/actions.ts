"use strict";
"use server";

import { adminDb } from "@/lib/firebase-admin";
import { generateQuestionsBatch, GenerateQuestionParams } from "@/lib/ai";
import { serializeFirestoreDoc } from "@/lib/firestore-utils";

export async function createQuestionAI(params: GenerateQuestionParams) {
  try {
    const aiResponses = await generateQuestionsBatch(params, 1);
    const aiResponse = aiResponses[0];
    
    // Save to Firestore as Draft
    const questionDoc = {
      subject: params.subject,
      topic: params.topic,
      difficulty: params.difficulty,
      cognitiveLevel: params.cognitiveLevel,
      type: params.type,
      text: aiResponse.text,
      options: aiResponse.options || [],
      explanation: aiResponse.explanation,
      status: "Draft",
      createdBy: "AI",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    };

    const docRef = await adminDb.collection("questions").add(questionDoc);
    
    return {
      success: true,
      message: "Question generated and saved as Draft.",
      id: docRef.id,
      question: { id: docRef.id, ...questionDoc }
    };
  } catch (error: any) {
    console.error("Error creating question with AI:", error);
    return { success: false, message: error.message || "Failed to generate question" };
  }
}

export async function getQuestions(filters?: { subject?: string; status?: string }) {
  try {
    let query: any = adminDb.collection("questions");
    
    if (filters?.subject) {
      query = query.where("subject", "==", filters.subject);
    }
    if (filters?.status) {
      query = query.where("status", "==", filters.status);
    }
    
    query = query.orderBy("createdAt", "desc");
    const snapshot = await query.get();
    
    const questions = snapshot.docs.map((doc: any) => serializeFirestoreDoc(doc));
    
    return { success: true, data: questions };
  } catch (error: any) {
    console.error("Failed to fetch questions:", error);
    return { success: false, message: "Failed to fetch questions" };
  }
}

export async function updateQuestionStatus(id: string, status: "Draft" | "Review" | "Approved") {
  try {
    await adminDb.collection("questions").doc(id).update({
      status,
      updatedAt: new Date().toISOString(),
    });
    return { success: true, message: `Status updated to ${status}` };
  } catch (error) {
    console.error("Failed to update question status:", error);
    return { success: false, message: "Failed to update status" };
  }
}

export async function updateQuestionContent(id: string, text: string, options?: any[], explanation?: string) {
  try {
    const updateData: any = {
      text,
      updatedAt: new Date().toISOString(),
    };
    if (options) updateData.options = options;
    if (explanation) updateData.explanation = explanation;

    await adminDb.collection("questions").doc(id).update(updateData);
    return { success: true, message: "Question content updated" };
  } catch (error) {
    console.error("Failed to update question content:", error);
    return { success: false, message: "Failed to update content" };
  }
}
