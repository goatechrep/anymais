import { GoogleGenAI } from "@google/genai";
import { Language } from "../types";

// Note: In a real app, API calls should be proxied through a backend to protect the key.
// For this demo, we assume the key is in process.env.API_KEY.
// If the key is missing, we'll return a mock string to prevent crashing in the UI demo.

export const generatePetBio = async (name: string, breed: string, traits: string, lang: Language = Language.PT): Promise<string> => {
  if (!process.env.API_KEY) {
    console.warn("API_KEY is missing. Returning mock bio.");
    const mockMsg = lang === Language.PT 
      ? `(Bio IA Mock): ${name} é um ${breed} maravilhoso e muito ${traits}. Adora brincar e procura novos amigos!`
      : `(AI Bio Mock): ${name} is a wonderful ${breed} who is very ${traits}. They love playing and are looking for new friends!`;
    return mockMsg;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-2.5-flash';
    
    let languageName = 'Portuguese';
    if (lang === Language.EN) languageName = 'English';
    if (lang === Language.ES) languageName = 'Spanish';

    const prompt = `Write a short, fun, and engaging social media bio (max 50 words) for a pet named ${name}. It is a ${breed} and has these traits: ${traits}. Use emojis. Write the bio in ${languageName}.`;

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