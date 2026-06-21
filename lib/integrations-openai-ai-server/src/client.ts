import OpenAI from "openai";

// Priority: Replit AI integration → Groq (free) → user's own OpenAI key
const groqApiKey = process.env.GROQ_API_KEY;
const replitApiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;
const replitBaseUrl = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;

let apiKey: string;
let baseURL: string | undefined;

if (replitBaseUrl && replitApiKey) {
  // Replit AI Integration
  apiKey = replitApiKey;
  baseURL = replitBaseUrl;
} else if (groqApiKey) {
  // Groq — free, OpenAI-compatible
  apiKey = groqApiKey;
  baseURL = "https://api.groq.com/openai/v1";
} else if (openaiApiKey) {
  // Direct OpenAI key
  apiKey = openaiApiKey;
  baseURL = undefined;
} else {
  throw new Error(
    "No AI API key found. Set GROQ_API_KEY (free at console.groq.com) or OPENAI_API_KEY."
  );
}

export const openai = new OpenAI({ apiKey, ...(baseURL ? { baseURL } : {}) });

/** Which provider is active — used to pick the right model */
export const aiProvider: "replit" | "groq" | "openai" =
  replitBaseUrl && replitApiKey ? "replit" : groqApiKey ? "groq" : "openai";
