import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

// Initialize the Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Using a fast, standard model

export interface GenerateQuestionParams {
  subject: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  cognitiveLevel: "Knowledge" | "Comprehension" | "Application" | "Analysis" | "Synthesis" | "Evaluation";
  type: "MCQ" | "Descriptive";
  context?: string; // Optional context from the syllabus
}

const questionSchema = {
  type: SchemaType.OBJECT,
  properties: {
    text: {
      type: SchemaType.STRING,
      description: "The HTML formatted question text. Can include simple tags like <p>, <strong>, <em>, <ul>, <li>.",
    },
    options: {
      type: SchemaType.ARRAY,
      description: "Only provide if type is MCQ. Do not provide for Descriptive questions.",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: {
            type: SchemaType.STRING,
            description: "A unique identifier for the option (e.g., a, b, c, d)",
          },
          text: {
            type: SchemaType.STRING,
            description: "The option text",
          },
          isCorrect: {
            type: SchemaType.BOOLEAN,
            description: "Whether this option is the correct answer",
          }
        },
        required: ["id", "text", "isCorrect"]
      }
    },
    explanation: {
      type: SchemaType.STRING,
      description: "Explanation for the correct answer or grading rubric for descriptive questions.",
    }
  },
  required: ["text", "explanation"]
};

export async function generateQuestion(params: GenerateQuestionParams) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in environment variables");
  }

  const prompt = `
    You are an expert exam question generator for a university. 
    Generate a high-quality question based on the following parameters:
    
    Subject: ${params.subject}
    Topic: ${params.topic}
    Difficulty: ${params.difficulty}
    Cognitive Level (Bloom's Taxonomy): ${params.cognitiveLevel}
    Question Type: ${params.type}
    
    ${params.context ? `Use the following syllabus context to inform your question:\n${params.context}` : ""}
    
    Requirements:
    1. If the type is MCQ, provide exactly 4 options with only 1 correct answer.
    2. The question text should be formatted as basic HTML for a rich text editor (e.g., use <p>, <strong>, <em>, <ul>, <li>). Do not use markdown backticks in the text field, just HTML.
    3. Ensure the cognitive level and difficulty accurately match the requested parameters.
    4. Provide a clear explanation for the answer.
  `;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: questionSchema,
        temperature: 0.7,
      },
    });

    const responseText = result.response.text();
    return JSON.parse(responseText);
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw new Error("Failed to generate question with AI");
  }
}
