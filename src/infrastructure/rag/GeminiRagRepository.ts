import { RagRepository } from "../../domain/stock/repositories";
import { BuffettWisdom } from "../../domain/buffett/valueObjects";
import { geminiClient, GEMINI_MODEL } from "../gemini/client";

const STORE_ID = process.env.GOOGLE_RAG_STORE_ID;

export class GeminiRagRepository implements RagRepository {
  async fetchWisdom(symbol: string): Promise<BuffettWisdom> {
    if (!STORE_ID) {
      return {
        content: "Note: Shareholder letters data is currently unavailable (Store ID missing). Analysis will be based on general knowledge and real-time data.",
        hasLetterContext: false,
      };
    }

    try {
      const ragPrompt = `You are Warren Buffett. Search your shareholder letters for any mentions of ${symbol} or companies in the same industry.

Analyze the business based on your core investment principles:
1. **Economic Moat**: Is there a durable competitive advantage?
2. **Management Integrity**: Do they treat shareholders as partners?
3. **Financial Health**: Focus on Return on Equity (ROE) and Free Cash Flow.

Summarize relevant quotes and principles from the letters. **You MUST cite the year of the shareholder letter for every quote or principle mentioned.**`;

      const ragResult = await geminiClient.models.generateContent({
        model: GEMINI_MODEL,
        contents: [{ role: "user", parts: [{ text: ragPrompt }] }],
        config: {
          tools: [{ fileSearch: { fileSearchStoreNames: [STORE_ID] } }],
        },
      });

      return {
        content: ragResult.text || "No specific mentions found in letters.",
        hasLetterContext: true,
      };
    } catch (error) {
      console.error("RAG Step Failed:", error);
      return {
        content: "Note: Could not access shareholder letters at this moment due to an error.",
        hasLetterContext: false,
      };
    }
  }
}
