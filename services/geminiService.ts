import { GoogleGenAI } from "@google/genai";
import { MOMMY_PHRASES } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getGeminiMommyMessage = async (): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Generate a short, comforting, protective, and loving message for Hailey from her caregiver 'Mommy'. The tone should be gentle, encouraging, and safe. Max 15 words. Keep it varied.",
      config: {
        systemInstruction: "You are Mommy, a caring, protective, and gentle caregiver for Hailey. You provide comfort, check on her hygiene, remind her to drink water, and tell her she is safe. Be concise.",
        temperature: 1.1,
      }
    });
    
    return response.text?.trim() || MOMMY_PHRASES[Math.floor(Math.random() * MOMMY_PHRASES.length)];
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback on error
    const randomIndex = Math.floor(Math.random() * MOMMY_PHRASES.length);
    return MOMMY_PHRASES[randomIndex];
  }
};