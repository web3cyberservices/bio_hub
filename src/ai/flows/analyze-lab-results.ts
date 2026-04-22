'use server';
/**
 * @fileOverview Поток Genkit для анализа медицинских анализов по фото/скану.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {z} from 'genkit';
import {runWithRetry} from '@/ai/utils';

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
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_CIVIC_INTEGRITY', threshold: 'BLOCK_NONE' },
    ],
  },
  prompt: `Вы — ведущий эксперт-диагност. Ваша задача — выполнить глубокий OCR-анализ медицинского отчета.

ПРАВИЛА:
1. ТЩАТЕЛЬНО распознайте ВСЕ ключевые биомаркеры и их значения.
2. Сравните значения с референсными интервалами (нормами), указанными в документе.
3. Оцените статус каждого маркера (normal/high/low).
4. В поле interpretation, если статус НЕ normal, ОБЯЗАТЕЛЬНО укажите норму в скобках.
5. Результат должен быть СТРОГО на русском языке.
6. ВАЖНО: Если данные на фото неразборчивы, попробуйте восстановить их по контексту таблицы.

Изображение для анализа: {{media url=photoDataUri}}`,
});

const analyzeLabResultsFlow = ai.defineFlow(
  {
    name: 'analyzeLabResultsFlow',
    inputSchema: AnalyzeLabInputSchema,
    outputSchema: AnalyzeLabOutputSchema,
  },
  async (input) => {
    return runWithRetry(async () => {
      // Используем gemini-3-flash-preview для лучшего OCR и стабильности
      const {output} = await labPrompt(input, {
        model: googleAI.model('gemini-3-flash-preview'),
      });
      if (!output) throw new Error('ИИ не смог извлечь данные. Попробуйте сделать фото четче или использовать другой файл.');
      return output;
    }, 5);
  }
);
