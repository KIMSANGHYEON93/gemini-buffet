import { AnalysisResult } from "./entities";
import { RagRepository, MarketDataRepository } from "./repositories";

export class BuffettAnalysisService {
  constructor(
    private ragRepo: RagRepository,
    private marketRepo: MarketDataRepository,
  ) {}

  async analyze(symbol: string): Promise<AnalysisResult> {
    const wisdom = await this.ragRepo.fetchWisdom(symbol);
    return this.marketRepo.fetchAnalysis(symbol, wisdom);
  }
}
