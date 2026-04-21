import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

/**
 * Инициализация Genkit с использованием Google AI плагина.
 * Модель принудительно установлена на gemini-1.5-flash для предотвращения ошибок thought_signature.
 */
export const ai = genkit({
  plugins: [googleAI()],
  model: googleAI.model('gemini-1.5-flash'),
});

export {z} from 'genkit';
