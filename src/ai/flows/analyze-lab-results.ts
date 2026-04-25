'use server';
/**
 * @fileOverview Оптимизированный анализ анализов.
 * Сокращены инструкции для снижения расхода токенов.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {z} from 'genkit';
import {runWithRetry} from '@/ai/utils';

const AnalyzeLabInputSchema = z.object({
  photoDataUri: z.string().describe("Data URI фото"),
  userContext: z.object({
    age: z.number().optional(),
    gender: z.string().optional(),
  }).optional(),
});
export type AnalyzeLabInput = z.infer<typeof AnalyzeLabInputSchema>;

const AnalyzeLabOutputSchema = z.object({
  summary: z.string().describe('Краткое заключение на русском'),
  markers: z.array(z.object({
    name: z.string().describe('Показатель'),
    value: z.string().describe('Значение'),
    referenceRange: z.string().describe('Только числа (мин-макс)'),
    status: z.enum(['normal', 'high', 'low']),
    interpretation: z.string().describe('Суть отклонения')
  })),
  recommendations: z.array(z.string()).describe('2-3 совета')
});
export type AnalyzeLabOutput = z.infer<typeof AnalyzeLabOutputSchema>;

export async function analyzeLabResults(input: AnalyzeLabInput): Promise<AnalyzeLabOutput> {
  return analyzeLabResultsFlow(input);
}

const labPrompt = ai.definePrompt({
  name: 'analyzeLabPrompt',
  input: {schema: AnalyzeLabInputSchema},
  output: {schema: AnalyzeLabOutputSchema},
  config: {
    safetySettings: [{ category: 'HARM_CATEGORY_CIVIC_INTEGRITY', threshold: 'BLOCK_NONE' }],
  },
  prompt: `Вы — мед.эксперт. Проведите OCR-анализ.
Данные пользователя: {{userContext.gender}}, {{userContext.age}} лет.
Правила: 1. Извлеките все маркеры. 2. Если нет нормы в бланке, рассчитайте персонально. 3. Ответ на русском.
Фото: {{media url=photoDataUri}}`,
});

const analyzeLabResultsFlow = ai.defineFlow(
  {
    name: 'analyzeLabResultsFlow',
    inputSchema: AnalyzeLabInputSchema,
    outputSchema: AnalyzeLabOutputSchema,
  },
  async (input) => {
    return runWithRetry(async () => {
      const {output} = await labPrompt(input);
      if (!output) throw new Error('Ошибка распознавания');
      return output;
    }, 3);
  }
);
