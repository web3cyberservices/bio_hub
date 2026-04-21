import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * BioTech AI Hub - Конфигурация Genkit
 * Центр управления ИИ-моделями проекта "PRO Себя"
 */
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY,
    }),
  ],
  // Используем Gemini 1.5 Flash для максимальной стабильности в Studio
  model: 'googleai/gemini-1.5-flash',
});

// Экспортируем Zod из Genkit для валидации схем в потоках
export { z } from 'genkit';
