
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
    referenceRange: z.string().describe('ТОЛЬКО ЧИСЛА. Например: "135 — 175". Категорически запрещено писать текст.'),
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
  prompt: `Вы — ведущий медицинский эксперт. Ваша задача — выполнить глубокий анализ документа и предоставить ЧИСЛОВЫЕ нормы.

ДАННЫЕ ПОЛЬЗОВАТЕЛЯ ДЛЯ РАСЧЕТА НОРМ:
- Пол: {{userContext.gender}}
- Возраст: {{userContext.age}} лет

КРИТИЧЕСКИЕ ПРАВИЛА ДЛЯ referenceRange:
1. Поле referenceRange должно содержать ТОЛЬКО ЧИСЛОВОЙ ИНТЕРВАЛ (например: "4.1 — 5.9" или "до 150").
2. КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО писать фразы: "не указано", "норма не указана", "N/A", "см. бланк", "по возрасту".
3. Если в документе колонка нормы пуста или содержит текст, вы ОБЯЗАНЫ предоставить ЧИСЛОВУЮ МЕДИЦИНСКУЮ НОРМУ из своей базы знаний для указанного пола и возраста пользователя.
4. Вы несете ответственность за точность цифр.

ИНСТРУКЦИЯ:
- Тщательно распознавайте значения. 
- Ответ СТРОГО на русском языке.

Изображение: {{media url=photoDataUri}}`,
});

const analyzeLabResultsFlow = ai.defineFlow(
  {
    name: 'analyzeLabResultsFlow',
    inputSchema: AnalyzeLabInputSchema,
    outputSchema: AnalyzeLabOutputSchema,
  },
  async (input) => {
    // Используем увеличенное количество попыток (7) для OCR анализов
    return runWithRetry(async () => {
      const {output} = await labPrompt(input, {
        model: googleAI.model('gemini-3.1-flash-preview'), // Используем самую свежую модель для лучшего распознавания
      });
      if (!output) throw new Error('ИИ не смог извлечь данные. Попробуйте сделать фото четче.');
      return output;
    }, 7, 5000);
  }
);
