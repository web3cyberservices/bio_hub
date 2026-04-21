import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

/**
 * Инициализация Genkit с использованием Google AI плагина.
 * Настроено на модель gemini-1.5-flash по запросу пользователя.
 */
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-1.5-flash',
});

export {z} from 'genkit';
