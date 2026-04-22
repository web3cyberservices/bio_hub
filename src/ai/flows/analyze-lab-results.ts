'use server';
/**
 * @fileOverview Поток Genkit для анализа медицинских анализов по фото/скану.
 * Оптимизирован для извлечения конкретных числовых норм и минимизации ошибок генерации.
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
  userContext: z.object({
    age: z.number().optional(),
    gender: z.string().optional(),
  }).optional(),
});
export type AnalyzeLabInput = z.infer<typeof AnalyzeLabInputSchema>;

const AnalyzeLabOutputSchema = z.object({
  summary: z.string().describe('Общее заключение по результатам на русском языке.'),
  markers: z.array(z.object({
    name: z.string().describe('Название показателя.'),
    value: z.string().describe('Значение с единицами измерения.'),
    referenceRange: z.string().describe('ТОЛЬКО ЧИСЛА. Например: "135 — 175".'),
    status: z.enum(['normal', 'high', 'low']).describe('Статус относительно референсных значений.'),
    interpretation: z.string().describe('Краткое пояснение отклонения.')
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
  prompt: `Вы — ведущий медицинский эксперт. Выполните OCR-анализ документа.

ДАННЫЕ ПОЛЬЗОВАТЕЛЯ:
- Пол: {{userContext.gender}}
- Возраст: {{userContext.age}} лет

ПРАВИЛА:
1. Извлеките все показатели (маркеры).
2. Поле referenceRange должно содержать ТОЛЬКО ЧИСЛОВОЙ ИНТЕРВАЛ.
3. Если нормы нет в бланке, рассчитайте её на основе пола и возраста пользователя.
4. Ответ СТРОГО на русском языке.
5. Если изображение нечеткое, постарайтесь извлечь максимум возможного.

Изображение: {{media url=photoDataUri}}`,
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
      if (!output) throw new Error('ИИ не смог прочитать данные. Попробуйте сделать фото четче.');
      return output;
    }, 4, 3000); // 4 попытки для баланса между успехом и временем выполнения
  }
);
