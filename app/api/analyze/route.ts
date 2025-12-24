import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const apiKey = process.env.GOOGLE_API_KEY;
const client = new GoogleGenAI({ apiKey });

export const maxDuration = 60;

// Use Store ID from environment variables for flexibility
const STORE_ID = process.env.GOOGLE_RAG_STORE_ID;

export async function POST(req: Request) {
  try {
    const { symbol } = await req.json();
    console.log(`Analyzing symbol: ${symbol}`);

    if (!apiKey) {
      throw new Error("GOOGLE_API_KEY is not defined");
    }

    // Use a newer, more capable model to avoid 500 errors and improve JSON generation
    const model = "gemini-2.0-flash";

    // Step 1: Get Buffett's Wisdom (RAG)
    console.log(`Step 1: Fetching Buffett's wisdom for ${symbol} using ${model}...`);
    const ragPrompt = `
      You are Warren Buffett. Search your shareholder letters for any mentions of ${symbol} or companies in the same industry.
      
      Analyze the business based on your core investment principles:
      1. **Economic Moat**: Is there a durable competitive advantage?
      2. **Management Integrity**: Do they treat shareholders as partners?
      3. **Financial Health**: Focus on Return on Equity (ROE) and Free Cash Flow.
      
      Summarize relevant quotes and principles from the letters. **You MUST cite the year of the shareholder letter for every quote or principle mentioned.**
    `;

    let buffettWisdom = "";
    try {
      const ragResult = await client.models.generateContent({
        model: model,
        contents: [{ role: "user", parts: [{ text: ragPrompt }] }],
        config: {
          tools: [{ fileSearch: { fileSearchStoreNames: [STORE_ID] } }],
        }
      });
      buffettWisdom = ragResult.text || "No specific mentions found in letters.";
      console.log("Step 1 Success. Wisdom length:", buffettWisdom.length);
    } catch (ragError) {
      console.error("RAG Step Failed:", ragError);
      buffettWisdom = "Note: Could not access shareholder letters at this moment.";
    }

    // Step 2: Get Real-time Data and Synthesize (Google Search)
    console.log("Step 2: Fetching real-time data and synthesizing...");
    const finalPrompt = `
      You are Warren Buffett.
      
      Here is your wisdom regarding ${symbol} (based on your letters):
      "${buffettWisdom}"
      
      Now, use Google Search to find the **current price, market status, latest news, and key financial metrics** for ${symbol}.
      
      **IMPORTANT**: Search for these specific financial metrics:
      - **P/E Ratio** (Price-to-Earnings Ratio)
      - **Market Cap** (Market Capitalization)
      - **Dividend Yield**
      - **ROE** (Return on Equity)
      - **Free Cash Flow** (FCF)
      
      Combine your wisdom with this real-time data to provide a deep financial analysis **IN KOREAN**.
      
      **CRITICAL INSTRUCTIONS**:
      1. Write the "opinion" field entirely in Korean (한국어).
      2. Provide a structured "investmentSummary" array. For each metric (Market Cap, PER, ROE, FCF, Dividend Yield), provide:
         - "metric": Name of the metric
         - "value": The numerical value (e.g., "$3.2T", "35.2")
         - "evaluation": A short qualitative assessment (e.g., "Top Tier", "High", "Excellent", "Low")
         - "keyword": A punchy 1-3 word description (e.g., "Market Leader", "Overvalued", "Cash Machine")
      3. For "radarChartData", provide 5 scores (0-100) for these categories:
         - "Moat" (Economic Moat)
         - "Management" (Management Quality)
         - "Financials" (Financial Health)
         - "Value" (Valuation)
         - "Growth" (Growth Potential)
         Return as objects with "subject", "A" (the score), and "fullMark" (100).
      4. Provide a "conclusion" paragraph giving a final verdict in Korean.
      
      Return the response in the following JSON format:
      {
        "opinion": "...",
        "currentPrice": "...",
        "marketStatus": "...",
        "investmentSummary": [
          { "metric": "Market Cap", "value": "...", "evaluation": "...", "keyword": "..." },
          { "metric": "PER", "value": "...", "evaluation": "...", "keyword": "..." },
          { "metric": "ROE", "value": "...", "evaluation": "...", "keyword": "..." },
          { "metric": "FCF", "value": "...", "evaluation": "...", "keyword": "..." },
          { "metric": "Dividend Yield", "value": "...", "evaluation": "...", "keyword": "..." }
        ],
        "radarChartData": [
          { "subject": "Moat", "A": 90, "fullMark": 100 },
          { "subject": "Management", "A": 85, "fullMark": 100 },
          { "subject": "Financials", "A": 95, "fullMark": 100 },
          { "subject": "Value", "A": 70, "fullMark": 100 },
          { "subject": "Growth", "A": 80, "fullMark": 100 }
        ],
        "conclusion": "...",
        "recentNews": [
           { "title": "...", "url": "..." }
        ]
      }
    `;

    const finalResult = await client.models.generateContent({
      model: model,
      contents: [{ role: "user", parts: [{ text: finalPrompt }] }],
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "You are Warren Buffett. Speak in his wisdom and tone."
      }
    });

    let responseText = finalResult.text;
    if (!responseText) {
      throw new Error("No response text received from Gemini in Step 2");
    }

    console.log("Step 2 Success. Response length:", responseText.length);

    // Clean up markdown code blocks
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      responseText = jsonMatch[0];
    }

    const analysis = JSON.parse(responseText);
    return NextResponse.json(analysis);

  } catch (error: unknown) {
    console.error("Analysis failed:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : "";
    return NextResponse.json(
      { error: "Failed to analyze stock", details: errorMessage, stack: errorStack },
      { status: 500 }
    );
  }
}
