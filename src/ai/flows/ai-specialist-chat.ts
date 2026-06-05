
'use server';
/**
 * @fileOverview Оптимизированный поток чата с ИИ-специалистом.
 * Использует архитектуру Direct Generation для стабильности в Next.js 15.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/google-genai';

export async function chatWithSpecialist(input: {
  message: string;
  history: Array<{role: 'user' | 'model', content: string}>;
  userContext?: {
    firstName?: string;
    healthGoal?: string;
    weight?: number;
    activityLevel?: string;
  };
  fileContext?: string;
}) {
  const { message, history, userContext, fileContext } = input;

  // Используем прямую генерацию вместо defineFlow для предотвращения HMR ошибок
  const response = await ai.generate({
    model: googleAI.model('gemini-2.5-flash'),
    system: `Вы — эксперт Bio Hub Pro (биохакинг/нутрициология).
    Ваша задача: помогать врачу анализировать данные и общаться с пациентами.
    ${userContext ? `ТЕКУЩИЙ ПАЦИЕНТ: ${userContext.firstName}, Цель: ${userContext.healthGoal}, Вес: ${userContext.weight}кг.` : ''}
    ${fileContext ? `КОНТЕКСТ ОТКРЫТОГО ФАЙЛА: ${fileContext}` : ''}
    ПРАВИЛА:
    1. Ответы должны быть краткими, профессиональными и на русском языке.
    2. Если предоставлен контекст файла, основывайте выводы на нем.
    3. Не ставьте диагнозы, давайте рекомендации на основе данных.`,
    prompt: [
      ...history.map(h => ({ role: h.role, content: [{ text: h.content }] })),
      { role: 'user', content: [{ text: message }] }
    ]
  });

  return {
    text: response.text || 'Извините, не удалось сформировать ответ.'
  };
}
