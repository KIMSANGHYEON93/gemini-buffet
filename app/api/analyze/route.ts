import { NextResponse } from "next/server";
import { analyzeStock } from "../../../src/application/useCases/AnalyzeStockUseCase";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { symbol } = await req.json();
    console.log(`Analyzing symbol: ${symbol}`);

    if (!process.env.GOOGLE_API_KEY) {
      throw new Error("GOOGLE_API_KEY is not defined");
    }

    const analysis = await analyzeStock(symbol);
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
