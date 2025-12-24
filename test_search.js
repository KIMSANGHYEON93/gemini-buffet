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
const symbol = "AAPL";

async function testSearch() {
    console.log("Testing Google Search tool...");
    try {
        const model = "gemini-2.5-flash-lite";
        const finalPrompt = `
          Find current price of ${symbol}.
        `;

        const finalResult = await client.models.generateContent({
          model: model,
          contents: [{ role: "user", parts: [{ text: finalPrompt }] }],
          config: {
            tools: [{ googleSearch: {} }],
          }
        });

        console.log("Search Result Text:", finalResult.text);
    } catch (e) {
        console.error("Search Test Failed:", e);
    }
}

testSearch();
