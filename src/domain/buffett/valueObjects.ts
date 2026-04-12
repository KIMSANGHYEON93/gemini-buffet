export interface BuffettWisdom {
  content: string;
  hasLetterContext: boolean;
}

export const INVESTMENT_PRINCIPLES = {
  ECONOMIC_MOAT: "Economic Moat - durable competitive advantage",
  MANAGEMENT_INTEGRITY: "Management Integrity - treat shareholders as partners",
  FINANCIAL_HEALTH: "Financial Health - ROE and Free Cash Flow focus",
} as const;

export const BUFFETT_SYSTEM_INSTRUCTION = "You are Warren Buffett. Speak in his wisdom and tone.";
