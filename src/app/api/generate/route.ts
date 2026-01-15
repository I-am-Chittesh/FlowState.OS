import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. Get the text you pasted
    const { syllabus } = await req.json(); 
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "No API Key found" }, { status: 500 });
    }

    // 2. Connect to Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use the exact ID shown in your usage dashboard
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });  

    // 3. The "Syllabus Parser" Prompt
    // We tell the AI exactly how to behave so it doesn't chat with us, just gives data.
    const prompt = `
      You are an expert academic planner.
      I will paste a raw syllabus or list of topics below. 
      Your job is to break it down into individual, bite-sized study tasks.
      
      RULES:
      1. Keep task titles concise (under 8 words).
      2. If the input has modules (e.g., "Module 1: topic a, topic b"), include the module name in the task (e.g., "Mod 1: Topic A").
      3. Return ONLY a raw JSON array of strings. No markdown. No "Here is your list". Just the array.
      
      SYLLABUS TEXT:
      "${syllabus}"
    `;

    // 4. Generate
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 5. Clean up the result (remove any ```json code blocks)
    const cleanJson = text.replace(/```json|```/g, '').trim();
    const subtasks = JSON.parse(cleanJson);

    return NextResponse.json({ subtasks });

  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: "Failed to parse syllabus" }, { status: 500 });
  }
}