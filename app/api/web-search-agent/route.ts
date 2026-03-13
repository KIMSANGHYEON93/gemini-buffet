import { NextResponse } from "next/server";
import { geminiClient, GEMINI_MODEL } from "@/src/infrastructure/gemini/client";

export const maxDuration = 60;

const STORE_ID = process.env.GOOGLE_RAG_STORE_ID;

const SYSTEM_INSTRUCTION = `You are Warren Buffett's AI research assistant, combining the Oracle of Omaha's timeless investment wisdom with real-time web search capabilities.

Your role:
- Answer investment and financial questions using Google Search for up-to-date data
- Always ground your answers in Buffett's investment principles: value investing, economic moats, margin of safety, long-term thinking
- When relevant, reference Buffett's shareholder letters and known quotes
- Provide factual, data-driven answers with sources from your web searches
- Respond in the same language the user writes in (Korean if Korean, English if English)
- Be conversational but insightful — channel Buffett's folksy wisdom and sharp analytical mind

Guidelines:
- Always search the web when asked about current prices, news, market conditions, or recent events
- For company analysis, search for financial metrics, recent earnings, and news
- Cite your sources naturally in conversation
- If you use RAG context from shareholder letters, cite the year
- Keep responses focused and actionable`;

interface Message {
  role: "user" | "model";
  text: string;
}

export async function POST(req: Request) {
  try {
    const { message, history } = (await req.json()) as {
      message: string;
      history?: Message[];
    };

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Build conversation contents from history
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    if (history?.length) {
      for (const msg of history) {
        contents.push({
          role: msg.role === "model" ? "model" : "user",
          parts: [{ text: msg.text }],
        });
      }
    }

    // If we have a RAG store, first fetch relevant Buffett wisdom for investment queries
    let ragContext = "";
    if (STORE_ID) {
      try {
        const ragResult = await geminiClient.models.generateContent({
          model: GEMINI_MODEL,
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Based on this user question, search Warren Buffett's shareholder letters for any relevant investment principles, quotes, or mentions. Question: "${message}". If nothing relevant is found, say "No relevant shareholder letter content found."`,
                },
              ],
            },
          ],
          config: {
            tools: [{ fileSearch: { fileSearchStoreNames: [STORE_ID] } }],
          },
        });
        const ragText = ragResult.text || "";
        if (
          ragText &&
          !ragText.toLowerCase().includes("no relevant shareholder letter")
        ) {
          ragContext = ragText;
        }
      } catch {
        // RAG is optional — continue without it
      }
    }

    // Add the current user message, optionally enriched with RAG context
    const userMessageText = ragContext
      ? `[Context from Buffett's shareholder letters: ${ragContext}]\n\nUser question: ${message}`
      : message;

    contents.push({
      role: "user",
      parts: [{ text: userMessageText }],
    });

    // Generate response with Google Search grounding
    const result = await geminiClient.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    const responseText = result.text || "I couldn't generate a response. Please try again.";

    // Extract grounding metadata if available
    const groundingMetadata = result.candidates?.[0]?.groundingMetadata;
    const searchQueries = groundingMetadata?.webSearchQueries || [];
    const groundingChunks = groundingMetadata?.groundingChunks || [];

    const sources = groundingChunks
      .filter((chunk) => chunk.web)
      .map((chunk) => ({
        title: chunk.web?.title || "Source",
        url: chunk.web?.uri || "",
      }));

    return NextResponse.json({
      response: responseText,
      sources,
      searchQueries,
      hadRagContext: !!ragContext,
    });
  } catch (error: unknown) {
    console.error("Web search agent error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to process your question", details: errorMessage },
      { status: 500 }
    );
  }
}
