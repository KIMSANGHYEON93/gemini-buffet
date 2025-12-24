const { GoogleGenAI } = require("@google/genai");
const path = require("path");
const fs = require("fs");

// Load env
const envPath = path.join(__dirname, ".env.local");
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, "utf8");
    envConfig.split("\n").forEach((line) => {
        const [key, value] = line.split("=");
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
}

const client = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
const STORE_ID = "fileSearchStores/buffett-wisdom-store-popula-jjld8ateeii5";
const symbol = "AAPL";

async function testRag() {
    console.log("Testing RAG with store:", STORE_ID);
    try {
        const model = "gemini-2.5-flash-lite";
        const ragPrompt = `
          You are Warren Buffett. Search your shareholder letters for any mentions of ${symbol} or companies in the same industry.
          Summarize relevant quotes.
        `;

        const ragResult = await client.models.generateContent({
          model: model,
          contents: [{ role: "user", parts: [{ text: ragPrompt }] }],
          config: {
            tools: [{ fileSearch: { fileSearchStoreNames: [STORE_ID] } }],
          }
        });

        console.log("RAG Result Text:", ragResult.text);
    } catch (e) {
        console.error("RAG Test Failed:", e);
    }
}

testRag();
