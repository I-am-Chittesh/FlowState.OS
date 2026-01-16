import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  console.log("--- API ROUTE STARTED ---"); // Spy Log 1

  try {
    const body = await req.json();
    console.log("Body received:", body); // Spy Log 2

    const apiKey = process.env.GEMINI_API_KEY;
    
    // CRITICAL CHECK: Print if key exists (don't print the actual key for security)
    console.log("API Key Status:", apiKey ? "EXISTS" : "MISSING"); // Spy Log 3

    if (!apiKey) {
      console.error("ERROR: API Key is missing in Vercel environment.");
      return NextResponse.json({ error: "No API Key found" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Use your working model

    const prompt = `
      You are an expert academic planner.
      SYLLABUS TEXT: "${body.syllabus}"
      Return ONLY a raw JSON array of strings.
    `;

    console.log("Sending request to Google..."); // Spy Log 4
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("Google Responded:", text.substring(0, 50) + "..."); // Spy Log 5

    const cleanJson = text.replace(/```json|```/g, '').trim();
    const subtasks = JSON.parse(cleanJson);

    return NextResponse.json({ subtasks });

  } catch (error: any) {
    console.error("CRASH REPORT:", error); // Spy Log 6
    return NextResponse.json({ 
      error: "Failed to parse syllabus", 
      details: error.message 
    }, { status: 500 });
  }
}