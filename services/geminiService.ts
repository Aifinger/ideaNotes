import { GoogleGenAI } from "@google/genai";

// Ensure API Key is present
const apiKey = process.env.API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey) {
  aiClient = new GoogleGenAI({ apiKey });
} else {
  console.warn("API_KEY is missing from environment variables.");
}

const MODEL_NAME = "gemini-2.5-flash";

export const GeminiService = {
  /**
   * Polishes the given text to make it more professional and clear.
   */
  polishText: async (text: string): Promise<string> => {
    if (!aiClient || !text.trim()) return text;

    try {
      const response = await aiClient.models.generateContent({
        model: MODEL_NAME,
        contents: `You are a professional editor. Please rewrite the following text to be more concise, clear, and professional. Maintain the original meaning. Output ONLY the rewritten text without explanations. \n\nText: ${text}`,
      });
      return response.text || text;
    } catch (error) {
      console.error("Gemini Polish Error:", error);
      throw error;
    }
  },

  /**
   * Summarizes the given text.
   */
  summarizeText: async (text: string): Promise<string> => {
    if (!aiClient || !text.trim()) return "";

    try {
      const response = await aiClient.models.generateContent({
        model: MODEL_NAME,
        contents: `Please provide a concise bullet-point summary of the following text. \n\nText: ${text}`,
      });
      return response.text || "";
    } catch (error) {
      console.error("Gemini Summarize Error:", error);
      throw error;
    }
  },

  /**
   * Continues writing based on the current context.
   */
  continueWriting: async (text: string): Promise<string> => {
    if (!aiClient || !text.trim()) return "";

    try {
      const response = await aiClient.models.generateContent({
        model: MODEL_NAME,
        contents: `You are a helpful writing assistant. Continue the following text naturally for 2-3 sentences. \n\nText: ${text}`,
      });
      return response.text || "";
    } catch (error) {
      console.error("Gemini Continue Error:", error);
      throw error;
    }
  },

  /**
   * Generates a title for the note based on content
   */
  generateTitle: async (text: string): Promise<string> => {
     if (!aiClient || !text.trim()) return "无标题笔记";
     try {
       const response = await aiClient.models.generateContent({
         model: MODEL_NAME,
         contents: `Generate a short, catchy title (maximum 10 words) for the following note content. Do not use quotes. \n\nContent: ${text}`,
       });
       return response.text?.trim() || "新笔记";
     } catch (error) {
       return "新笔记";
     }
  }
};
