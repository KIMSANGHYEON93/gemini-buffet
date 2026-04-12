import { MarketDataRepository } from "../../domain/stock/repositories";
import { AnalysisResult } from "../../domain/stock/entities";
import { BuffettWisdom } from "../../domain/buffett/valueObjects";
import { BUFFETT_SYSTEM_INSTRUCTION } from "../../domain/buffett/valueObjects";
import { geminiClient, GEMINI_MODEL } from "../gemini/client";

export class GeminiMarketDataRepository implements MarketDataRepository {
  async fetchAnalysis(symbol: string, wisdom: BuffettWisdom): Promise<AnalysisResult> {
    const finalPrompt = `You are Warren Buffett.

Here is your wisdom regarding ${symbol} (based on your letters):
"${wisdom.content}"

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
}`;

    const finalResult = await geminiClient.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: "user", parts: [{ text: finalPrompt }] }],
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: BUFFETT_SYSTEM_INSTRUCTION,
      },
    });

    let responseText = finalResult.text;
    if (!responseText) {
      throw new Error("No response text received from Gemini");
    }

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      responseText = jsonMatch[0];
    }

    return JSON.parse(responseText) as AnalysisResult;
  }
}
