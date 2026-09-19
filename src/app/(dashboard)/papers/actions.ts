"use server";

import { adminDb } from "@/lib/firebase-admin";
import { GeneratedPaper, GeneratedPaperQuestion } from "@/types/paper";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit";

export async function finalizePaper(paperId: string) {
  try {
    const docRef = adminDb.collection("papers").doc(paperId);
    await docRef.update({
      status: "Finalized",
      updatedAt: new Date().toISOString(),
    });
    
    await logAudit("Paper Finalized", `Paper ID: ${paperId} was locked and finalized.`);
    revalidatePath(`/papers/${paperId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Failed to finalize paper:", error);
    return { success: false, error: error.message };
  }
}

export async function swapQuestion(paperId: string, sectionId: string, oldQuestionId: string) {
  try {
    const docRef = adminDb.collection("papers").doc(paperId);
    const paperDoc = await docRef.get();
    if (!paperDoc.exists) throw new Error("Paper not found");
    
    const paper = paperDoc.data() as GeneratedPaper;
    if (paper.status === "Finalized") throw new Error("Cannot edit a finalized paper");

    // Find the section and question
    const sectionIndex = paper.sections.findIndex(s => s.sectionId === sectionId);
    if (sectionIndex === -1) throw new Error("Section not found");
    
    const section = paper.sections[sectionIndex];
    const qIndex = section.questions.findIndex(q => q.questionId === oldQuestionId);
    if (qIndex === -1) throw new Error("Question not found in section");
    
    const oldQ = section.questions[qIndex];
    
    // Get all current question IDs in the paper to avoid duplicates
    const currentQuestionIds = new Set<string>();
    paper.sections.forEach(s => s.questions.forEach(q => currentQuestionIds.add(q.questionId)));

    // Query for a replacement
    const qSnapshot = await adminDb.collection("questions")
      .where("subject", "==", paper.subjectCode)
      .where("status", "==", "Approved")
      .where("type", "==", oldQ.type)
      .get();
      
    const candidates = qSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as any))
      .filter(q => !currentQuestionIds.has(q.id)); // Exclude already used
      
    if (candidates.length === 0) {
      throw new Error(`No unused approved ${oldQ.type} questions left in the Question Bank for this subject to swap with.`);
    }
    
    // Pick a random candidate
    const newQData = candidates[Math.floor(Math.random() * candidates.length)];
    
    const newQuestion: GeneratedPaperQuestion = {
      questionId: newQData.id,
      text: newQData.text,
      marks: oldQ.marks, // Keep the marks from the blueprint section
      type: newQData.type,
      options: newQData.options,
      cognitiveLevel: newQData.cognitiveLevel || "Knowledge",
      difficulty: newQData.difficulty || "Medium"
    };
    
    // Swap them
    paper.sections[sectionIndex].questions[qIndex] = newQuestion;
    
    // Recompute Analytics (simplified)
    const difficultyCounts = { Easy: 0, Medium: 0, Hard: 0 };
    const cognitiveCounts: Record<string, number> = { Knowledge: 0, Comprehension: 0, Application: 0, Analysis: 0, Synthesis: 0, Evaluation: 0 };
    let total = 0;
    
    paper.sections.forEach(s => {
      s.questions.forEach(q => {
        if (difficultyCounts.hasOwnProperty(q.difficulty)) difficultyCounts[q.difficulty as keyof typeof difficultyCounts]++;
        if (cognitiveCounts.hasOwnProperty(q.cognitiveLevel)) cognitiveCounts[q.cognitiveLevel]++;
        total++;
      });
    });

    const newAnalytics = {
      difficulty: {
        Easy: total > 0 ? Math.round((difficultyCounts.Easy / total) * 100) : 0,
        Medium: total > 0 ? Math.round((difficultyCounts.Medium / total) * 100) : 0,
        Hard: total > 0 ? Math.round((difficultyCounts.Hard / total) * 100) : 0,
      },
      cognitiveLevel: {
        Knowledge: total > 0 ? Math.round((cognitiveCounts.Knowledge / total) * 100) : 0,
        Comprehension: total > 0 ? Math.round((cognitiveCounts.Comprehension / total) * 100) : 0,
        Application: total > 0 ? Math.round((cognitiveCounts.Application / total) * 100) : 0,
        Analysis: total > 0 ? Math.round((cognitiveCounts.Analysis / total) * 100) : 0,
        Synthesis: total > 0 ? Math.round((cognitiveCounts.Synthesis / total) * 100) : 0,
        Evaluation: total > 0 ? Math.round((cognitiveCounts.Evaluation / total) * 100) : 0,
      }
    };

    // Save
    await docRef.update({
      sections: paper.sections,
      analytics: newAnalytics,
      updatedAt: new Date().toISOString()
    });
    
    await logAudit("Question Swapped", `Paper ID: ${paperId}, Swapped ${oldQuestionId} for ${newQData.id}`);
    revalidatePath(`/papers/${paperId}`);
    return { success: true };
    
  } catch (error: any) {
    console.error("Failed to swap question:", error);
    return { success: false, error: error.message };
  }
}
