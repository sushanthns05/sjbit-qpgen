import { NextResponse } from "next/server";
import { generateQuestion, GenerateQuestionParams } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { apiKey, count, ...params } = body;
    
    // We will generate multiple questions by calling the API multiple times concurrently
    const promises = [];
    const numQuestions = count || 1;
    
    for (let i = 0; i < numQuestions; i++) {
      promises.push(generateQuestion(params as GenerateQuestionParams, apiKey));
    }
    
    const questions = await Promise.all(promises);
    return NextResponse.json({ success: true, questions });
    
  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
