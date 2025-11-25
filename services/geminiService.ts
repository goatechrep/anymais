import { GoogleGenAI } from "@google/genai";

// Note: In a real app, API calls should be proxied through a backend to protect the key.
// For this demo, we assume the key is in process.env.API_KEY.
// If the key is missing, we'll return a mock string to prevent crashing in the UI demo.

export const generatePetBio = async (name: string, breed: string, traits: string): Promise<string> => {
  if (!process.env.API_KEY) {
    console.warn("API_KEY is missing. Returning mock bio.");
    return `(AI Bio Mock): ${name} is a wonderful ${breed} who is very ${traits}. They love playing and are looking for new friends!`;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-2.5-flash';
    
    const prompt = `Write a short, fun, and engaging social media bio (max 50 words) for a pet named ${name}. It is a ${breed} and has these traits: ${traits}. Use emojis.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "Bio generation failed.";
  } catch (error) {
    console.error("Error generating bio:", error);
    return "Could not generate bio at this time.";
  }
};
