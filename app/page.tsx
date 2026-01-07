"use client";

import { useState } from "react";
import dynamic from 'next/dynamic';
import { Search, TrendingUp, DollarSign, Newspaper, AlertCircle, ArrowRight } from "lucide-react";
import { GlassCard } from "@/app/components/ui/GlassCard";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Dynamically import Scene to avoid SSR issues with WebGL
const Scene = dynamic(() => import('@/app/components/3d/Scene'), { ssr: false });

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AnalysisData {
  opinion: string;
  currentPrice: string;
  marketStatus: string;
  investmentSummary: Array<{
    metric: string;
    value: string;
    evaluation: string;
    keyword: string;
  }>;
  priceReturns?: {
    "1d": string;
    "5d": string;
    "1m": string;
    "3m": string;
    "6m": string;
    "1y": string;
  };
  fiftyTwoWeekRange?: {
    low: string;
    high: string;
  };
  recentNews: Array<{
    title: string;
    url: string;
  }>;
}

export default function Home() {
  const [symbol, setSymbol] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AnalysisData | null>(null);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!symbol.trim()) return;

    console.log("Starting analysis for:", symbol);
    setLoading(true);
    setError("");
    setData(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol }),
      });

      console.log("Response status:", response.status);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to analyze stock");
      }

      setData(result);
    } catch (err: unknown) {
      console.error("Analysis error:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateRangePosition = (low: string, high: string, current: string) => {
    const parse = (s: string) => parseFloat(s.replace(/[^0-9.-]/g, ''));
    const l = parse(low);
    const h = parse(high);
    const c = parse(current);
    if (isNaN(l) || isNaN(h) || isNaN(c) || h === l) return 50;
    return Math.min(100, Math.max(0, ((c - l) / (h - l)) * 100));
  };

  return (
    <main className="relative min-h-screen bg-black text-foreground font-sans overflow-x-hidden">
      {/* 3D Background Scene */}
      <div className="fixed inset-0 z-0">
        <Scene />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col items-center p-6 md:p-12 w-full">

        {/* Hero Section */}
        <div className="max-w-4xl w-full flex flex-col items-center gap-4 mb-16 mt-32 pointer-events-none">
          {/* Note: The 3D coin is in the background at center */}
          <div className="text-center space-y-4 animate-in slide-in-from-bottom-4 fade-in duration-700 delay-150 backdrop-blur-md bg-black/40 p-8 rounded-3xl border border-white/10 shadow-2xl">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.3)]">
              Gemini <span className="text-accent drop-shadow-[0_2px_15px_rgba(34,197,94,0.6)]">Buffett</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-100 max-w-2xl mx-auto font-medium drop-shadow-md">
              &quot;Price is what you pay. Value is what you get.&quot;
            </p>
          </div>
        </div>

        {/* Search Section */}
        <div className="w-full max-w-xl mb-20 z-20">
          <GlassCard className="rounded-full p-2 bg-white/10 border-white/20 backdrop-blur-xl shadow-[0_0_30px_rgba(34,197,94,0.1)]" delay={0.2}>
            <div className="relative flex items-center">
              <Search className="absolute left-6 text-gray-300 w-6 h-6" />
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="Enter stock symbol (e.g., AAPL, NVDA)"
                className="w-full bg-transparent border-none py-4 pl-16 pr-40 text-xl placeholder:text-gray-400 focus:ring-0 text-white rounded-full font-medium"
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              />
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="absolute right-2 top-2 bottom-2 bg-accent hover:bg-green-400 text-black font-extrabold text-lg px-8 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_30px_rgba(34,197,94,0.6)] hover:scale-105 active:scale-95"
              >
                {loading ? (
                  <span className="animate-pulse">Thinking...</span>
                ) : (
                  <>
                    Analyze <ArrowRight className="w-5 h-5 stroke-[3px]" />
                  </>
                )}
              </button>
            </div>
          </GlassCard>

          {error && (
            <GlassCard className="mt-6 p-4 bg-red-500/20 border-red-500/30 flex items-center gap-3 text-red-300" delay={0}>
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </GlassCard>
          )}
        </div>

        {/* Results Grid */}
        {data && (
          <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-12 gap-6">

            {/* Buffett's Opinion */}
            <div className="md:col-span-8">
              <GlassCard className="h-full p-8" delay={0.1}>
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <TrendingUp className="w-32 h-32 text-accent" />
                </div>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-accent">
                  <span className="bg-accent/10 p-2 rounded-lg backdrop-blur-md">Oracle&apos;s Insight</span>
                </h2>
                <p className="text-xl md:text-2xl leading-relaxed text-gray-100 font-serif italic drop-shadow-md">
                  &quot;{data.opinion}&quot;
                </p>
              </GlassCard>
            </div>

            {/* Price Card */}
            <div className="md:col-span-4">
              <GlassCard className="h-full p-8 flex flex-col justify-between" delay={0.2}>
                <div>
                  <h3 className="text-gray-400 font-medium mb-2">Current Price</h3>
                  <div className="text-4xl font-bold text-white tracking-tight drop-shadow-lg">{data.currentPrice}</div>
                </div>
                <div className="mt-8">
                  <div className={cn(
                    "inline-flex items-center px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm shadow-inner",
                    data.marketStatus.toLowerCase().includes("closed")
                      ? "bg-red-500/20 text-red-300 border border-red-500/30"
                      : "bg-green-500/20 text-green-300 border border-green-500/30"
                  )}>
                    {data.marketStatus}
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Financials */}
            <div className="md:col-span-6">
              <GlassCard className="h-full p-8" delay={0.3}>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                  <DollarSign className="w-5 h-5 text-accent" /> Key Financials
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {data.investmentSummary?.map((item, idx) => (
                    <div key={idx} className="space-y-2 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors shadow-inner">
                      <p className="text-gray-400 text-xs uppercase tracking-widest">{item.metric}</p>
                      <div className="flex flex-col">
                        <p className="text-2xl font-bold text-white">{item.value}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-accent text-[10px] font-bold uppercase tracking-tighter px-2 py-0.5 rounded-md bg-accent/10 border border-accent/20">
                            {item.evaluation}
                          </span>
                          <span className="text-gray-400 text-[10px] italic">
                            {item.keyword}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>

            {/* News */}
            <div className="md:col-span-6">
              <GlassCard className="h-full p-8" delay={0.4}>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                  <Newspaper className="w-5 h-5 text-accent" /> Latest News
                </h3>
                <div className="space-y-4">
                  {data.recentNews?.map((item, idx) => (
                    <a
                      key={idx}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group shadow-sm hover:shadow-md border border-transparent hover:border-accent/20"
                    >
                      <h4 className="font-medium text-gray-200 group-hover:text-accent transition-colors line-clamp-2">
                        {item.title}
                      </h4>
                    </a>
                  ))}
                </div>
              </GlassCard>
            </div>

            {/* Price Performance */}
            {data.priceReturns && (
              <div className="md:col-span-6">
                <GlassCard className="h-full p-8" delay={0.5}>
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                    <TrendingUp className="w-5 h-5 text-accent" /> Price Returns
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {Object.entries(data.priceReturns).map(([period, value]) => (
                      <div key={period} className="text-center p-3 rounded-xl bg-white/5 shadow-inner">
                        <p className="text-xs text-gray-500 uppercase mb-1">{period}</p>
                        <p className={cn(
                          "font-bold text-lg",
                          value.includes("-") ? "text-red-400" : "text-green-400"
                        )}>{value}</p>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>
            )}

            {/* 52-Week Range */}
            {data.fiftyTwoWeekRange && (
              <div className="md:col-span-6">
                <GlassCard className="h-full p-8" delay={0.6}>
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                    <TrendingUp className="w-5 h-5 text-accent" /> 52-Week Range
                  </h3>
                  <div className="mt-8 relative pt-2">
                    <div className="flex justify-between text-sm text-gray-400 mb-2 font-mono">
                      <span>Low: {data.fiftyTwoWeekRange.low}</span>
                      <span>High: {data.fiftyTwoWeekRange.high}</span>
                    </div>
                    <div className="h-4 bg-white/10 rounded-full overflow-hidden relative shadow-inner">
                      <div
                        className="absolute top-0 bottom-0 w-2 bg-accent rounded-full shadow-[0_0_15px_rgba(34,197,94,1)] box-content border-2 border-white/20"
                        style={{ left: `${calculateRangePosition(data.fiftyTwoWeekRange.low, data.fiftyTwoWeekRange.high, data.currentPrice)}%` }}
                      />
                    </div>
                    <div
                      className="absolute top-0 transform -translate-x-1/2 mt-0"
                      style={{ left: `${calculateRangePosition(data.fiftyTwoWeekRange.low, data.fiftyTwoWeekRange.high, data.currentPrice)}%` }}
                    >
                      <div className="text-accent text-xs font-bold text-center mt-2 drop-shadow-md">Current</div>
                    </div>
                  </div>
                </GlassCard>
              </div>
            )}

          </div>
        )}
      </div>
    </main>
  );
}