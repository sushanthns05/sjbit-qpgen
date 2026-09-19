"use server";

import { adminDb } from "@/lib/firebase-admin";
import { Blueprint, GeneratedPaper, GeneratedPaperSection, GeneratedPaperQuestion, PaperTemplate } from "@/types/paper";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit";

// Helper to shuffle an array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function generatePaper(blueprintId: string, templateId: string): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    // 1. Fetch Blueprint
    const bpDoc = await adminDb.collection("blueprints").doc(blueprintId).get();
    if (!bpDoc.exists) throw new Error("Blueprint not found");
    const blueprint = { id: bpDoc.id, ...bpDoc.data() } as Blueprint;

    // 2. Fetch Template
    const tplDoc = await adminDb.collection("templates").doc(templateId).get();
    if (!tplDoc.exists) throw new Error("Template not found");
    // We don't strictly need the whole template object here, just verifying it exists
    
    // 3. Fetch Approved Questions for the subject
    const qSnapshot = await adminDb.collection("questions")
      .where("subject", "==", blueprint.subjectCode)
      .where("status", "==", "Approved")
      .get();
      
    const allQuestions = qSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    
    // Group questions by type
    let availableMCQ = allQuestions.filter(q => q.type === "MCQ");
    let availableDesc = allQuestions.filter(q => q.type === "Descriptive");
    
    // Shuffle to ensure random selection each time
    availableMCQ = shuffleArray(availableMCQ);
    availableDesc = shuffleArray(availableDesc);

    const generatedSections: GeneratedPaperSection[] = [];
    
    // Analytics counters
    const difficultyCounts = { Easy: 0, Medium: 0, Hard: 0 };
    const cognitiveCounts: Record<string, number> = {
      Knowledge: 0, Comprehension: 0, Application: 0, 
      Analysis: 0, Synthesis: 0, Evaluation: 0
    };
    let totalQuestionsSelected = 0;

    // 4. Build Sections
    for (const section of blueprint.sections) {
      const selectedQuestions: GeneratedPaperQuestion[] = [];
      const isMCQ = section.questionType === "MCQ";
      const requiredCount = section.numberOfQuestions;
      
      let pool = isMCQ ? availableMCQ : availableDesc;
      
      if (pool.length < requiredCount) {
        throw new Error(`Not enough approved ${section.questionType} questions in the Question Bank for ${section.name}. Required: ${requiredCount}, Available: ${pool.length}`);
      }
      
      // Select the first N questions from the shuffled pool
      for (let i = 0; i < requiredCount; i++) {
        const q = pool.pop()!;
        
        selectedQuestions.push({
          questionId: q.id,
          text: q.text,
          marks: section.marksPerQuestion,
          type: section.questionType,
          options: q.options,
          cognitiveLevel: q.cognitiveLevel || "Knowledge",
          difficulty: q.difficulty || "Medium"
        });
        
        // Update analytics
        if (difficultyCounts.hasOwnProperty(q.difficulty)) {
          difficultyCounts[q.difficulty as keyof typeof difficultyCounts]++;
        }
        if (cognitiveCounts.hasOwnProperty(q.cognitiveLevel)) {
          cognitiveCounts[q.cognitiveLevel]++;
        }
        totalQuestionsSelected++;
      }
      
      generatedSections.push({
        sectionId: section.id,
        name: section.name,
        description: section.description,
        questions: selectedQuestions,
      });
    }

    // 5. Calculate final analytics percentages
    const analytics = {
      difficulty: {
        Easy: totalQuestionsSelected > 0 ? Math.round((difficultyCounts.Easy / totalQuestionsSelected) * 100) : 0,
        Medium: totalQuestionsSelected > 0 ? Math.round((difficultyCounts.Medium / totalQuestionsSelected) * 100) : 0,
        Hard: totalQuestionsSelected > 0 ? Math.round((difficultyCounts.Hard / totalQuestionsSelected) * 100) : 0,
      },
      cognitiveLevel: {
        Knowledge: totalQuestionsSelected > 0 ? Math.round((cognitiveCounts.Knowledge / totalQuestionsSelected) * 100) : 0,
        Comprehension: totalQuestionsSelected > 0 ? Math.round((cognitiveCounts.Comprehension / totalQuestionsSelected) * 100) : 0,
        Application: totalQuestionsSelected > 0 ? Math.round((cognitiveCounts.Application / totalQuestionsSelected) * 100) : 0,
        Analysis: totalQuestionsSelected > 0 ? Math.round((cognitiveCounts.Analysis / totalQuestionsSelected) * 100) : 0,
        Synthesis: totalQuestionsSelected > 0 ? Math.round((cognitiveCounts.Synthesis / totalQuestionsSelected) * 100) : 0,
        Evaluation: totalQuestionsSelected > 0 ? Math.round((cognitiveCounts.Evaluation / totalQuestionsSelected) * 100) : 0,
      }
    };

    // 6. Save Generated Paper
    const now = new Date().toISOString();
    const paperDoc: Omit<GeneratedPaper, "id"> = {
      blueprintId,
      templateId,
      subjectCode: blueprint.subjectCode,
      subjectName: "Auto Generated Subject Name", // Could be fetched if we had a subjects collection
      status: "Draft",
      sections: generatedSections,
      analytics,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await adminDb.collection("papers").add(paperDoc);
    
    await logAudit("Generate Paper", `Generated paper for Blueprint ${blueprint.name} using Template ${templateId}`);
    
    revalidatePath("/paper-history");
    return { success: true, id: docRef.id };

  } catch (error: any) {
    console.error("Error generating paper:", error);
    return { success: false, error: error.message };
  }
}
