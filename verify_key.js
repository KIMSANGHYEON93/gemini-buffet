const { GoogleGenAI } = require("@google/genai");
const path = require("path");
const fs = require("fs");

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

async function listModels() {
    try {
        console.log("Checking API Key...");
        const result = await client.models.list();
        console.log("API Key is VALID. Models available.");
    } catch (e) {
        console.error("API Key Check Failed:", e.message);
    }
}

listModels();
