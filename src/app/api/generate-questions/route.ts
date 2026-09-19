import { NextResponse } from "next/server";
import { generateQuestionsBatch, GenerateQuestionParams } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { apiKey, count, ...params } = body;
    
    const numQuestions = count || 1;
    // Call the batch generator with the requested chunk size
    const questions = await generateQuestionsBatch(params as GenerateQuestionParams, numQuestions, apiKey);
    
    return NextResponse.json({ success: true, questions });
    
  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
