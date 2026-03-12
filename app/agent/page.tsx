"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Send,
  ArrowLeft,
  Globe,
  BookOpen,
  AlertCircle,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { GlassCard } from "@/app/components/ui/GlassCard";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const Scene = dynamic(() => import("@/app/components/3d/Scene"), {
  ssr: false,
});

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Source {
  title: string;
  url: string;
}

interface ChatMessage {
  role: "user" | "model";
  text: string;
  sources?: Source[];
  searchQueries?: string[];
  hadRagContext?: boolean;
}

export default function AgentPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMessage: ChatMessage = { role: "user", text: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      // Build history from previous messages (exclude the one we just added)
      const history = messages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const response = await fetch("/api/web-search-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, history }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to get response");
      }

      const modelMessage: ChatMessage = {
        role: "model",
        text: result.response,
        sources: result.sources,
        searchQueries: result.searchQueries,
        hadRagContext: result.hadRagContext,
      };

      setMessages((prev) => [...prev, modelMessage]);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Something went wrong.";
      setError(msg);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <main className="relative min-h-screen bg-black text-foreground font-sans overflow-x-hidden">
      {/* 3D Background */}
      <div className="fixed inset-0 z-0 opacity-30">
        <Scene />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-screen">
        {/* Header */}
        <header className="flex items-center gap-4 p-4 md:p-6 border-b border-white/10 backdrop-blur-xl bg-black/60">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <div className="flex-1 text-center">
            <h1 className="text-xl md:text-2xl font-bold text-white">
              Buffett{" "}
              <span className="text-accent">Search Agent</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Powered by Gemini + Google Search + Buffett&apos;s Letters
            </p>
          </div>
          <div className="w-20" />
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-6 opacity-60">
              <Globe className="w-16 h-16 text-accent" />
              <div className="text-center space-y-2 max-w-md">
                <h2 className="text-xl font-semibold text-white">
                  Ask me anything about investing
                </h2>
                <p className="text-gray-400 text-sm">
                  I search the web for real-time data and combine it with
                  Warren Buffett&apos;s investment wisdom from 21 years of
                  shareholder letters.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                {[
                  "What is NVIDIA's current P/E ratio?",
                  "Is Apple a good value investment right now?",
                  "Compare Tesla and BYD financials",
                  "What did Buffett say about tech stocks?",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setInput(suggestion);
                      inputRef.current?.focus();
                    }}
                    className="text-xs px-3 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "flex",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] md:max-w-[70%]",
                    msg.role === "user" ? "" : "w-full md:w-auto"
                  )}
                >
                  {msg.role === "user" ? (
                    <div className="bg-accent/20 border border-accent/30 rounded-2xl rounded-br-sm px-5 py-3">
                      <p className="text-white whitespace-pre-wrap">
                        {msg.text}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm px-5 py-4 backdrop-blur-sm">
                        {msg.hadRagContext && (
                          <div className="flex items-center gap-1.5 text-xs text-amber-400/80 mb-3">
                            <BookOpen className="w-3 h-3" />
                            <span>
                              Includes insights from Buffett&apos;s
                              shareholder letters
                            </span>
                          </div>
                        )}
                        <div className="text-gray-200 whitespace-pre-wrap leading-relaxed">
                          {msg.text}
                        </div>
                      </div>

                      {/* Sources */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="flex flex-wrap gap-2 px-2">
                          {msg.sources.slice(0, 5).map((source, sIdx) => (
                            <a
                              key={sIdx}
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-accent hover:border-accent/30 transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span className="truncate max-w-[200px]">
                                {source.title}
                              </span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading indicator */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm px-5 py-4 backdrop-blur-sm">
                <div className="flex items-center gap-3 text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin text-accent" />
                  <span className="text-sm">
                    Searching the web and analyzing...
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center"
            >
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-white/10 backdrop-blur-xl bg-black/60 p-4 md:p-6">
          <div className="max-w-3xl mx-auto">
            <GlassCard
              className="rounded-2xl p-1.5 bg-white/5 border-white/15"
              delay={0}
            >
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask about stocks, markets, or Buffett's wisdom..."
                  className="flex-1 bg-transparent border-none py-3 px-4 text-base placeholder:text-gray-500 focus:ring-0 text-white font-medium"
                  disabled={loading}
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="bg-accent hover:bg-green-400 text-black font-bold p-3 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </main>
  );
}
