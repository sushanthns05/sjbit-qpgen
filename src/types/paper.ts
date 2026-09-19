export interface BlueprintSection {
  id: string;
  name: string; // e.g., "Section A"
  description?: string;
  questionType: "MCQ" | "Descriptive";
  numberOfQuestions: number;
  marksPerQuestion: number;
}

export interface Blueprint {
  id: string;
  name: string;
  subjectCode: string;
  totalMarks: number;
  sections: BlueprintSection[];
  
  // Overall distributions
  difficultyDistribution: {
    Easy: number; // percentage (0-100)
    Medium: number;
    Hard: number;
  };
  cognitiveLevelDistribution: {
    Knowledge: number;
    Comprehension: number;
    Application: number;
    Analysis: number;
    Synthesis: number;
    Evaluation: number;
  };
  
  createdAt: string;
  updatedAt: string;
}

export interface PaperTemplate {
  id: string;
  name: string;
  universityName: string;
  universityLogoUrl?: string; // Optional URL to a logo
  examName: string; // e.g., "B.E. Degree Examination, Dec 2026"
  examDuration: string; // e.g., "3 Hours"
  instructions: string[]; // List of instructions printed at the top
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedPaperQuestion {
  questionId: string; // Reference to the original question in Question Bank
  text: string;
  marks: number;
  type: "MCQ" | "Descriptive";
  options?: { id: string; text: string; isCorrect: boolean }[]; // Only for MCQ
  cognitiveLevel: string;
  difficulty: string;
}

export interface GeneratedPaperSection {
  sectionId: string; // Reference to the Blueprint Section
  name: string;
  description?: string;
  questions: GeneratedPaperQuestion[];
}

export interface GeneratedPaper {
  id: string;
  blueprintId: string;
  templateId: string;
  subjectCode: string;
  subjectName: string;
  status: "Draft" | "Finalized"; // Finalized papers cannot be regenerated
  sections: GeneratedPaperSection[];
  createdAt: string;
  updatedAt: string;
  
  // Analytics stored at generation time
  analytics: {
    difficulty: {
      Easy: number;
      Medium: number;
      Hard: number;
    };
    cognitiveLevel: {
      Knowledge: number;
      Comprehension: number;
      Application: number;
      Analysis: number;
      Synthesis: number;
      Evaluation: number;
    };
  };
}
