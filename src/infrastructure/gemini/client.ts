import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
  console.warn("GOOGLE_API_KEY is not defined");
}

export const geminiClient = new GoogleGenAI({ apiKey });
export const GEMINI_MODEL = "gemini-2.5-flash";
