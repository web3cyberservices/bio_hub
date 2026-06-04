'use server';
/**
 * @fileOverview ИИ-поток для глубокого анализа бьюти-показателей.
 * Оптимизировано для предотвращения таймаутов (408) и ложных срабатываний фильтров.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {runWithRetry} from '@/ai/utils';

const BeautyInputSchema = z.object({
  category: z.enum(['hair', 'nails', 'skin', 'teeth']),
  description: z.string().optional(),
  photoDataUri: z.string().optional().describe(
    "A photo as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
  userContext: z.object({
    age: z.number().optional(),
    healthGoal: z.string().optional(),
  }).optional(),
});

const BeautyOutputSchema = z.object({
  analysis: z.string().describe('Краткий визуальный разбор того, что видно на фото.'),
  suggestedChecks: z.array(z.string()).describe('Список 2-3 дефицитов или анализов.'),
  recommendations: z.array(z.string()).describe('2-3 конкретных совета.'),
});

export async function analyzeBeauty(input: z.infer<typeof BeautyInputSchema>) {
  try {
    return await analyzeBeautyFlow(input);
  } catch (error: any) {
    console.error("[SERVER-ACTION] Beauty Flow Error:", error);
    throw new Error(error.message || 'Ошибка обработки ИИ. Попробуйте еще раз.');
  }
}

const beautyPrompt = ai.definePrompt({
  name: 'analyzeBeautyPrompt',
  input: {schema: BeautyInputSchema},
  output: {schema: BeautyOutputSchema},
  config: {
    // Отключаем все фильтры для исключения ложных блокировок медицинских фото
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_CIVIC_INTEGRITY', threshold: 'BLOCK_NONE' },
    ],
  },
  prompt: `Вы — эксперт Bio-Beauty Hub. Проведите быстрый анализ категории: {{category}}.

КОНТЕКСТ:
Возраст: {{userContext.age}}. Описание: {{{description}}}
{{#if photoDataUri}}Медиа: {{media url=photoDataUri}}{{/if}}

ПРАВИЛА:
1. НОГТИ: ищи волны (дефицит железа), пятна (цинк), ломкость или изменение цвета.
2. ШАМПУНЬ/КОСМЕТИКА: OCR состава (сульфаты/силиконы/парабены).
3. КОЖА/ЗУБЫ: оценка текстуры, пор, увлажненности или прозрачности эмали.

Ответ на русском. Начни с фразы "На фото я вижу...". Будь профессионален и краток.`,
});

const analyzeBeautyFlow = ai.defineFlow(
  {
    name: 'analyzeBeautyFlow',
    inputSchema: BeautyInputSchema,
    outputSchema: BeautyOutputSchema,
  },
  async (input) => {
    return runWithRetry(async () => {
      const {output} = await beautyPrompt(input, {
        model: googleAI.model('gemini-2.5-flash'),
      });
      if (!output) {
        throw new Error('ИИ не смог распознать изображение. Убедитесь, что фото четкое и не содержит посторонних объектов.');
      }
      return output;
    }, 2); // 2 попытки
  }
);
