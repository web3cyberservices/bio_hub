'use server';
/**
 * @fileOverview Поток Genkit для анализа состава еды по фото.
 * Обновлено для использования Gemini 2.5 Flash.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {z} from 'genkit';

const AnalyzeMealInputSchema = z.object({
  description: z.string().optional().describe('Текстовое описание приема пищи.'),
  photoDataUri: z
    .string()
    .optional()
    .describe(
      "Фото еды в формате data URI. Ожидаемый формат: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  refinement: z.string().optional().describe('Уточнение пользователя. Это приоритетная информация.'),
});
export type AnalyzeMealInput = z.infer<typeof AnalyzeMealInputSchema>;

const AnalyzeMealOutputSchema = z.object({
  mealName: z.string().describe('Название распознанного блюда.'),
  calories: z.number().describe('Калорийность (ккал).'),
  protein: z.number().describe('Белки (г).'),
  fat: z.number().describe('Жиры (г).'),
  carbs: z.number().describe('Углеводы (г).'),
  analysis: z.string().describe('Комментарий ИИ о составе и коррекции.'),
});
export type AnalyzeMealOutput = z.infer<typeof AnalyzeMealOutputSchema>;

export async function analyzeMeal(input: AnalyzeMealInput): Promise<AnalyzeMealOutput> {
  return analyzeMealFlow(input);
}

const mealPrompt = ai.definePrompt({
  name: 'analyzeMealPrompt',
  input: {schema: AnalyzeMealInputSchema},
  output: {schema: AnalyzeMealOutputSchema},
  prompt: `Вы — эксперт-нутрициолог. Ваша задача — максимально точно определить КБЖУ блюда.

ПРАВИЛА:
1. Если предоставлено уточнение (refinement), оно является приоритетным и исправляет визуальное распознавание.
2. Оценивайте размер порции по фото.
3. Отвечайте СТРОГО на русском языке.

Контекст:
Описание: {{{description}}}
{{#if refinement}}УТОЧНЕНИЕ: {{{refinement}}}{{/if}}
{{#if photoDataUri}}Фото: {{media url=photoDataUri}}{{/if}}`,
});

const analyzeMealFlow = ai.defineFlow(
  {
    name: 'analyzeMealFlow',
    inputSchema: AnalyzeMealInputSchema,
    outputSchema: AnalyzeMealOutputSchema,
  },
  async (input) => {
    const {output} = await mealPrompt(input, {
      model: googleAI.model('gemini-2.5-flash'),
    });
    if (!output) throw new Error('Не удалось проанализировать блюдо');
    return output;
  }
);
