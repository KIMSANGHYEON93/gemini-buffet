import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const apiKey = process.env.GOOGLE_API_KEY;
const client = new GoogleGenAI({ apiKey });

export const maxDuration = 60;

// Get Store ID from environment variable
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

    let buffettWisdom = "";

    if (!STORE_ID) {
      console.warn("GOOGLE_RAG_STORE_ID is not set. Skipping RAG step.");
      buffettWisdom = "Note: Shareholder letters data is currently unavailable (Store ID missing). Analysis will be based on general knowledge and real-time data.";
    } else {
      try {
        const ragPrompt = `
              You are Warren Buffett. Search your shareholder letters for any mentions of ${symbol} or companies in the same industry.
              
              Analyze the business based on your core investment principles:
              1. **Economic Moat**: Is there a durable competitive advantage?
              2. **Management Integrity**: Do they treat shareholders as partners?
              3. **Financial Health**: Focus on Return on Equity (ROE) and Free Cash Flow.
              
              Summarize relevant quotes and principles from the letters. **You MUST cite the year of the shareholder letter for every quote or principle mentioned.**
            `;

        console.log(`Sending RAG request to Gemini... (Store ID: ${STORE_ID})`);
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
        buffettWisdom = "Note: Could not access shareholder letters at this moment due to an error.";
      }
    }

    // Step 2: Get Real-time Data and Synthesize (Google Search)
    console.log("Step 2: Fetching real-time data and synthesizing...");
    const finalPrompt = `
      You are Warren Buffett.
      
      Here is your wisdom regarding ${symbol} (based on your letters):
      "${buffettWisdom}"
      
      Now, use Google Search to find the **current price, market status, latest news, and key financial metrics** for ${symbol}.
      
      **IMPORTANT**: Search for these specific data points:
      1. **Financial Metrics**: P/E Ratio, Market Cap, Dividend Yield, ROE, Free Cash Flow.
      2. **Price Performance**: Returns for 1 day, 5 days, 1 month, 3 months, 6 months, and 1 year (YTD or 1 Year).
      3. **52-Week Range**: The 52-week High and 52-week Low prices.

      Combine your wisdom with this real-time data to provide a deep financial analysis **IN KOREAN**.
      
      **CRITICAL INSTRUCTIONS**:
      1. Write the "opinion" field entirely in Korean (한국어).
      2. You must cite the shareholder letters (e.g., "1987년 주주서한에서...") when referencing the wisdom provided above.
      3. For "investmentSummary", provide an array of objects for the 5 key metrics. Each object must have:
         - "metric": The name of the metric (e.g., "P/E Ratio").
         - "value": The numerical value (e.g., "24.5").
         - "evaluation": A short judgment (e.g., "Good", "High", "Fair").
         - "keyword": A 1-2 word description of why (e.g., "Undervalued", "Premium").
      4. For "priceReturns", provide the percentage change for each period (e.g., "+1.2%", "-5.4%").
      5. For "fiftyTwoWeekRange", provide the "low" and "high" prices as numbers or strings (e.g., 150.25).
      
      Return the response in the following JSON format:
      {
        "opinion": "한국어로 작성된 심층 분석 (주주서한 인용 포함)...",
        "currentPrice": "Real-time price with currency symbol",
        "marketStatus": "Open/Closed",
        "investmentSummary": [
          { "metric": "P/E Ratio", "value": "...", "evaluation": "...", "keyword": "..." },
          { "metric": "Market Cap", "value": "...", "evaluation": "...", "keyword": "..." },
          { "metric": "Dividend Yield", "value": "...", "evaluation": "...", "keyword": "..." },
          { "metric": "ROE", "value": "...", "evaluation": "...", "keyword": "..." },
          { "metric": "Free Cash Flow", "value": "...", "evaluation": "...", "keyword": "..." }
        ],
        "priceReturns": {
          "1d": "...", "5d": "...", "1m": "...", "3m": "...", "6m": "...", "1y": "..."
        },
        "fiftyTwoWeekRange": {
          "low": "...", "high": "..."
        },
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