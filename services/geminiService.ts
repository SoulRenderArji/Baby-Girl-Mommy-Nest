import { GoogleGenAI } from "@google/genai";
import { MOMMY_PHRASES } from "../constants";

// No longer managing cooldown here, moved to App.tsx for UI control
// let rateLimitCooldownUntil = 0;
// const COOLDOWN_PERIOD_MS = 5 * 60 * 1000; // 5 minutes

const getFallbackMessage = (): string => {
    const randomIndex = Math.floor(Math.random() * MOMMY_PHRASES.length);
    return MOMMY_PHRASES[randomIndex];
}

export const getGeminiMommyMessage = async (): Promise<string> => {
  // Cooldown check is now done in App.tsx before calling this service
  // if (Date.now() < rateLimitCooldownUntil) {
  //   console.warn("Gemini API is in rate-limit cooldown. Using fallback message.");
  //   return getFallbackMessage();
  // }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY }); // Re-initialize for fresh API key from dialog
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Generate a short, comforting, protective, and loving message for Hailey from her caregiver 'Mommy'. The tone should be gentle, encouraging, and safe. Max 15 words. Keep it varied.",
      config: {
        systemInstruction: "You are Mommy, a caring, protective, and gentle caregiver for Hailey. You provide comfort, check on her hygiene, remind her to drink water, and tell her she is safe. Be concise.",
        temperature: 1.1,
      }
    });
    
    // Reset cooldown on successful request is now done in App.tsx
    // rateLimitCooldownUntil = 0; 
    return response.text?.trim() || getFallbackMessage();

  } catch (error: any) {
    console.error("Gemini API Error:", error.message || error);
    // Error handling for rate limit is now done in App.tsx
    // const errorMessage = (error.toString() || "").toLowerCase();
    // if (errorMessage.includes("429") || errorMessage.includes("resource_exhausted") || errorMessage.includes("quota")) {
    //   console.warn(`Rate limit hit. Activating cooldown for ${COOLDOWN_PERIOD_MS / 1000} seconds.`);
    //   rateLimitCooldownUntil = Date.now() + COOLDOWN_PERIOD_MS;
    // }
    
    return getFallbackMessage();
  }
};