import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

/**
 * Инициализация Genkit с использованием Google AI плагина.
 * Принудительно используем gemini-1.5-flash для стабильности.
 */
export const ai = genkit({
  plugins: [googleAI()],
  model: googleAI.model('gemini-1.5-flash'),
});

export {z} from 'genkit';
