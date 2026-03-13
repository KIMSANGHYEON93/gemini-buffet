export interface StockSymbol {
  symbol: string;
}

export interface InvestmentMetric {
  metric: string;
  value: string;
  evaluation: string;
  keyword: string;
}

export interface PriceReturns {
  "1d": string;
  "5d": string;
  "1m": string;
  "3m": string;
  "6m": string;
  "1y": string;
}

export interface FiftyTwoWeekRange {
  low: string;
  high: string;
}

export interface NewsItem {
  title: string;
  url: string;
}

export interface AnalysisResult {
  opinion: string;
  currentPrice: string;
  marketStatus: string;
  investmentSummary: InvestmentMetric[];
  priceReturns: PriceReturns;
  fiftyTwoWeekRange: FiftyTwoWeekRange;
  recentNews: NewsItem[];
}
