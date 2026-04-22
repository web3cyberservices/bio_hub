'use server';
/**
 * @fileOverview Поток Genkit для анализа медицинских анализов по фото/скану.
 * Оптимизирован для извлечения конкретных числовых норм на основе профиля пользователя.
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
  summary: z.string().describe('Общее заключение по результатам.'),
  markers: z.array(z.object({
    name: z.string().describe('Название показателя (например, Ферритин, Витамин D).'),
    value: z.string().describe('Значение с единицами измерения.'),
    referenceRange: z.string().describe('ОБЯЗАТЕЛЬНОЕ ПОЛЕ. Только числовой интервал нормы (например, "4.1 — 5.9"). Если в документе нет нормы, предоставь экспертную норму для пола и возраста пользователя.'),
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
  prompt: `Вы — ведущий медицинский эксперт. Ваша задача — выполнить глубокий OCR-анализ документа.

ДАННЫЕ ПОЛЬЗОВАТЕЛЯ:
- Пол: {{userContext.gender}}
- Возраст: {{userContext.age}} лет

КРИТИЧЕСКИЕ ПРАВИЛА ДЛЯ ПОЛЯ referenceRange:
1. Вы ОБЯЗАНЫ заполнить поле referenceRange для КАЖДОГО показателя.
2. ЗАПРЕЩЕНО использовать символы "—", "N/A", "undefined" или текст "Не указано".
3. ЗАПРЕЩЕНО писать "По возрасту". Вы должны знать медицинские нормы!
4. Если в документе колонка нормы пуста или отсутствует, вы ДОЛЖНЫ предоставить КОНКРЕТНЫЙ ЧИСЛОВОЙ ИНТЕРВАЛ (например: "135 — 175" для гемоглобина мужчины), основываясь на поле и возрасте пользователя.
5. Пишите только цифры и диапазон.

ИНСТРУКЦИЯ ПО ОФОРМЛЕНИЮ:
- Результат СТРОГО на русском языке.
- Тщательно распознавайте степени (например, 10^12).

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
        model: googleAI.model('gemini-3-flash-preview'),
      });
      if (!output) throw new Error('ИИ не смог извлечь данные. Попробуйте сделать фото четче.');
      return output;
    }, 5);
  }
);