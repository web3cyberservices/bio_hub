import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * BioTech AI Hub - Конфигурация Genkit
 * Центр управления ИИ-моделями проекта "PRO Себя"
 * Использование Gemini 2.5 Flash для максимальной производительности и стабильности.
 */
export const ai = genkit({
  plugins: [
    // Явно указываем ключ из переменных окружения для стабильности на Vercel
    googleAI({ apiKey: process.env.GEMINI_API_KEY }),
  ],
  // Используем актуальную модель Gemini 2.5 Flash
  model: googleAI.model('gemini-2.5-flash'),
});

// Экспортируем Zod из Genkit для валидации схем в потоках
export { z } from 'genkit';