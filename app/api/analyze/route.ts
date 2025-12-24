import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const apiKey = process.env.GOOGLE_API_KEY;
const client = new GoogleGenAI({ apiKey });

export const maxDuration = 60;

// Hardcoded Store ID from setup script
const STORE_ID = "fileSearchStores/buffett-wisdom-store-popula-jjld8ateeii5";

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
      - **Market Cap** (Market Capitalization in USD or appropriate currency)
      - **Dividend Yield** (as a percentage)
      - **ROE** (Return on Equity as a percentage)
      - **Free Cash Flow** (in USD or appropriate currency)
      
      Combine your wisdom with this real-time data to provide a deep financial analysis **IN KOREAN**.
      Your tone should be wise, patient, and focused on long-term value.
      
      **CRITICAL INSTRUCTIONS**:
      1. Write the "opinion" field entirely in Korean (한국어).
      2. You must cite the shareholder letters (e.g., "1987년 주주서한에서...") when referencing the wisdom provided above.
      3. For keyFinancials, provide actual numerical values or "N/A" if not found. Use proper formatting (e.g., "$3.2T" for market cap, "15.2%" for percentages).
      
      Return the response in the following JSON format:
      {
        "opinion": "한국어로 작성된 심층 분석 (주주서한 인용 포함)...",
        "currentPrice": "Real-time price with currency symbol",
        "marketStatus": "Open/Closed",
        "keyFinancials": {
          "peRatio": "Exact P/E ratio or 'N/A'",
          "marketCap": "Market cap with currency (e.g., '$3.2T') or 'N/A'",
          "dividendYield": "Dividend yield percentage (e.g., '0.5%') or 'N/A'",
          "roe": "ROE percentage (e.g., '147%') or 'N/A'",
          "freeCashFlow": "Free cash flow with currency (e.g., '$96B') or 'N/A'"
        },
        "recentNews": [
          { "title": "News title", "url": "News URL" }
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
