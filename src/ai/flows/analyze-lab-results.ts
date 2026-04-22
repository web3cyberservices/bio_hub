'use server';
/**
 * @fileOverview Поток Genkit для анализа медицинских анализов по фото/скану.
 * Добавлена логика вывода референсных значений в скобках при отклонениях.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {z} from 'genkit';
import { runWithRetry } from './generate-personalized-recommendations';

const AnalyzeLabInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "Фото анализа в формате data URI. Ожидаемый формат: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeLabInput = z.infer<typeof AnalyzeLabInputSchema>;

const AnalyzeLabOutputSchema = z.object({
  summary: z.string().describe('Общее заключение по результатам.'),
  markers: z.array(z.object({
    name: z.string().describe('Название показателя (например, Ферритин, Витамин D).'),
    value: z.string().describe('Значение с единицами измерения.'),
    status: z.enum(['normal', 'high', 'low']).describe('Статус относительно референсных значений.'),
    interpretation: z.string().describe('Краткое пояснение, что это значит для пользователя.')
  })).describe('Список найденных маркеров.'),
  recommendations: z.array(z.string()).describe('2-3 практических совета на основе анализов.')
});
export type AnalyzeLabOutput = z.infer<typeof AnalyzeLabOutputSchema>;

export async function analyzeLabResults(input: AnalyzeLabInput): Promise<AnalyzeLabOutput> {
  return analyzeLabResultsFlow(input);
}

const labPrompt = ai.definePrompt({
  name: 'analyzeLabPrompt',
  input: {schema: AnalyzeLabInputSchema},
  output: {schema: AnalyzeLabOutputSchema},
  prompt: `Вы — ведущий эксперт-диагност и специалист по функциональной медицине. Ваша задача — выполнить глубокий OCR-анализ медицинского отчета с фотографии.

ПРАВИЛА АНАЛИЗА:
1. ТЩАТЕЛЬНО распознайте все ключевые биомаркеры, их текущие значения и единицы измерения из предоставленного изображения.
2. ОБЯЗАТЕЛЬНО Сравните значения с референсными интервалами (нормами), указанными непосредственно в вашем документе.
3. Оцените статус каждого маркера: 
   - normal: если значение внутри интервала.
   - high: если значение выше верхней границы.
   - low: если значение ниже нижней границы.
4. Дайте краткую, но понятную интерпретацию каждому показателю. 
   ВАЖНО: Если показатель отклоняется от нормы (status high или low), в конце поля interpretation ОБЯЗАТЕЛЬНО добавьте норму из документа в скобках, например: "(Норма: 12.5 - 25.0)".
5. Напишите общее резюме (summary) и дайте 2-3 ТЕХНИЧЕСКИХ совета по образу жизни или питанию.
6. ПРЕДУПРЕЖДЕНИЕ: Обязательно добавьте фразу, что это ИИ-анализ и он не является окончательным диагнозом.
7. Отвечайте СТРОГО на русском языке. Будьте предельно точны с цифрами.

Фото анализа: {{media url=photoDataUri}}`,
});

const analyzeLabResultsFlow = ai.defineFlow(
  {
    name: 'analyzeLabResultsFlow',
    inputSchema: AnalyzeLabInputSchema,
    outputSchema: AnalyzeLabOutputSchema,
  },
  async (input) => {
    return runWithRetry(async () => {
      const {output} = await labPrompt(input, {
        model: googleAI.model('gemini-2.5-flash'),
      });
      if (!output) throw new Error('Не удалось проанализировать документ');
      return output;
    });
  }
);