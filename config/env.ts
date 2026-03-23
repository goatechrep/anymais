const env = import.meta.env;

export const appEnv = {
  geminiApiKey: env.VITE_GEMINI_API_KEY || '',
} as const;
