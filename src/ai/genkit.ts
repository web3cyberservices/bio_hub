import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * BioTech AI Hub - Конфигурация Genkit
 * Центр управления ИИ-моделями проекта "PRO Себя"
 * Использует стабильные API Google Cloud (v1).
 */
export const ai = genkit({
  plugins: [
    googleAI(),
  ],
  // Используем Gemini 2.5 Flash для максимальной скорости и точности
  model: googleAI.model('gemini-2.5-flash'),
});

// Экспортируем Zod из Genkit для валидации схем в потоках
export { z } from 'genkit';
