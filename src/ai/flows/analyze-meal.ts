'use server';
/**
 * @fileOverview Поток Genkit для анализа состава еды по фото или текстовому описанию с поддержкой обучения на правках.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeMealInputSchema = z.object({
  description: z.string().optional().describe('Текстовое описание приема пищи.'),
  photoDataUri: z
    .string()
    .optional()
    .describe(
      "Фото еды в формате data URI. Ожидаемый формат: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  refinement: z.string().optional().describe('Уточнение пользователя. Это ПРИОРТЕТНАЯ информация, исправляющая любые ошибки ИИ.'),
});
export type AnalyzeMealInput = z.infer<typeof AnalyzeMealInputSchema>;

const AnalyzeMealOutputSchema = z.object({
  mealName: z.string().describe('Название распознанного блюда.'),
  calories: z.number().describe('Калорийность (ккал).'),
  protein: z.number().describe('Белки (г).'),
  fat: z.number().describe('Жиры (г).'),
  carbs: z.number().describe('Углеводы (г).'),
  analysis: z.string().describe('Комментарий ИИ о коррекции и составе.'),
});
export type AnalyzeMealOutput = z.infer<typeof AnalyzeMealOutputSchema>;

export async function analyzeMeal(input: AnalyzeMealInput): Promise<AnalyzeMealOutput> {
  return analyzeMealFlow(input);
}

const mealPrompt = ai.definePrompt({
  name: 'analyzeMealPrompt',
  input: {schema: AnalyzeMealInputSchema},
  output: {schema: AnalyzeMealOutputSchema},
  prompt: `Вы — обучаемый ИИ-нутрициолог. Ваша задача — максимально точно определить КБЖУ.

ПРАВИЛА ОБУЧЕНИЯ И КОРРЕКЦИИ:
1. Если предоставлено уточнение (refinement), оно ЯВЛЯЕТСЯ ИСТИНОЙ. 
2. Если ваше визуальное распознавание противоречит уточнению (например, вы видели курицу, а пользователь говорит "это кролик"), вы ДОЛЖНЫ признать ошибку, "стереть" старое распознавание и выдать данные для КРОЛИКА.
3. В поле analysis кратко укажите: "Понял, исправляю: [блюдо] вместо [старое блюдо]. Данные пересчитаны".
4. Используйте глубокое понимание кухни СНГ.

ОТВЕЧАЙТЕ СТРОГО НА РУССКОМ ЯЗЫКЕ.

Контекст:
Описание: {{{description}}}
{{#if refinement}}УТОЧНЕНИЕ (ПРИОРИТЕТ): {{{refinement}}}{{/if}}
{{#if photoDataUri}}Фото (визуальный контекст): {{media url=photoDataUri}}{{/if}}`,
});

const analyzeMealFlow = ai.defineFlow(
  {
    name: 'analyzeMealFlow',
    inputSchema: AnalyzeMealInputSchema,
    outputSchema: AnalyzeMealOutputSchema,
  },
  async (input) => {
    const {output} = await mealPrompt(input);
    if (!output) throw new Error('Не удалось проанализировать блюдо');
    return output;
  }
);
