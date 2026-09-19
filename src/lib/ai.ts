import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

// The client will be instantiated per request if custom key is provided
function getAIClient(customKey?: string) {
  const key = customKey || process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not provided");
  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
}

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

const batchSchema = {
  type: SchemaType.ARRAY,
  description: "A list of generated exam questions.",
  items: questionSchema,
};

export async function generateQuestionsBatch(params: GenerateQuestionParams, count: number, customKey?: string) {
  const prompt = `
    You are an expert exam question generator for a university. 
    Generate EXACTLY ${count} high-quality questions based on the following parameters:
    
    Subject: ${params.subject}
    Topic: ${params.topic}
    Difficulty: ${params.difficulty}
    Cognitive Level (Bloom's Taxonomy): ${params.cognitiveLevel}
    Question Type: ${params.type}
    
    ${params.context ? `Use the following syllabus context to inform your questions:\n${params.context}` : ""}
    
    Requirements for each question:
    1. If the type is MCQ, provide exactly 4 options with only 1 correct answer.
    2. The question text should be formatted as basic HTML for a rich text editor (e.g., use <p>, <strong>, <em>, <ul>, <li>). Do not use markdown backticks in the text field, just HTML.
    3. Ensure the cognitive level and difficulty accurately match the requested parameters.
    4. Provide a clear explanation for the answer.
    
    IMPORTANT: You must return an array of exactly ${count} questions.
  `;

  try {
    const model = getAIClient(customKey);
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: batchSchema as any,
        temperature: 0.7,
      },
    });

    const responseText = result.response.text();
    const parsed = JSON.parse(responseText);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw new Error("Failed to generate questions with AI");
  }
}
