
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * BioTech AI Hub - Конфигурация Genkit
 * Центр управления ИИ-моделями проекта "PRO Себя"
 * Принудительное использование Gemini 1.5 Flash для стабильности.
 */
export const ai = genkit({
  plugins: [
    googleAI(),
  ],
  // Используем Gemini 1.5 Flash для предотвращения ошибок thought_signature
  model: googleAI.model('gemini-1.5-flash'),
});

// Экспортируем Zod из Genkit для валидации схем в потоках
export { z } from 'genkit';
