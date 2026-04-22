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
    referenceRange: z.string().describe('Числовой интервал нормы. Если его нет в документе, обязательно предоставь экспертную цифровую норму для пола и возраста пользователя.'),
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

КОНТЕКСТ ПОЛЬЗОВАТЕЛЯ:
- Пол: {{userContext.gender}}
- Возраст: {{userContext.age}} лет

ПРАВИЛА:
1. ТЩАТЕЛЬНО распознайте ВСЕ ключевые биомаркеры и их значения.
2. Сравните значения с референсными интервалами (нормами), указанными в документе.
3. ВАЖНО: Если в документе ОТСУТСТВУЕТ колонка "Норма" или она пуста, вы ОБЯЗАНЫ предоставить КОНКРЕТНЫЙ ЧИСЛОВОЙ ИНТЕРВАЛ нормы, основываясь на данных профиля (пол и возраст) и стандартах доказательной медицины.
4. ЗАПРЕЩЕНО писать "По возрасту", "Не указано" или "undefined". Всегда пиши цифры (например, "4.1 — 5.9").
5. Оцените статус каждого маркера (normal/high/low) на основе найденных или предложенных вами цифровых норм.
6. Результат должен быть СТРОГО на русском языке.

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
      if (!output) throw new Error('ИИ не смог извлечь данные. Попробуйте сделать фото четче.');
      return output;
    }, 5);
  }
);