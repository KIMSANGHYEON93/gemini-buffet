import { BuffettWisdom } from "../buffett/valueObjects";
import { AnalysisResult } from "./entities";

export interface RagRepository {
  fetchWisdom(symbol: string): Promise<BuffettWisdom>;
}

export interface MarketDataRepository {
  fetchAnalysis(symbol: string, wisdom: BuffettWisdom): Promise<AnalysisResult>;
}
