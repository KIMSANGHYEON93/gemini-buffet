import { AnalysisResult } from "../../domain/stock/entities";
import { BuffettAnalysisService } from "../../domain/stock/services";
import { GeminiRagRepository } from "../../infrastructure/rag/GeminiRagRepository";
import { GeminiMarketDataRepository } from "../../infrastructure/search/GeminiMarketDataRepository";

const ragRepo = new GeminiRagRepository();
const marketRepo = new GeminiMarketDataRepository();
const analysisService = new BuffettAnalysisService(ragRepo, marketRepo);

export async function analyzeStock(symbol: string): Promise<AnalysisResult> {
  return analysisService.analyze(symbol);
}
