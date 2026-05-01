'use server';
/**
 * @fileOverview ИИ-поток для анализа бьюти-показателей (волосы, кожа, ногти, зубы).
 * Оптимизирован для предотвращения таймаутов (408) и точного визуального распознавания.
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
  analysis: z.string().describe('Детальный визуальный разбор того, что видно на фото или в описании.'),
  suggestedChecks: z.array(z.string()).describe('Список дефицитов или анализов для проверки.'),
  recommendations: z.array(z.string()).describe('Конкретные советы по уходу и питанию.'),
  specialistHint: z.string().optional().describe('Рекомендация по посещению врача.'),
});

export async function analyzeBeauty(input: z.infer<typeof BeautyInputSchema>) {
  return analyzeBeautyFlow(input);
}

const beautyPrompt = ai.definePrompt({
  name: 'analyzeBeautyPrompt',
  input: {schema: BeautyInputSchema},
  output: {schema: BeautyOutputSchema},
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_CIVIC_INTEGRITY', threshold: 'BLOCK_NONE' },
    ],
  },
  prompt: `Вы — эксперт Bio-Beauty. Ваша задача — проанализировать данные по категории: {{category}}.

КОНТЕКСТ:
{{#if userContext}}Возраст: {{userContext.age}}. Цель: {{userContext.healthGoal}}.{{/if}}
{{#if description}}Описание: {{{description}}}{{/if}}
Медиа: {{#if photoDataUri}}{{media url=photoDataUri}}{{else}}Анализируйте только текст.{{/if}}

АЛГОРИТМ:
1. ВИЗУАЛЬНЫЙ АНАЛИЗ (ОБЯЗАТЕЛЬНО): Если есть фото, начни с фразы "На фото я вижу...". Опиши текстуру, цвет, пятна или состав этикетки (OCR).
2. СВЯЗЬ: Свяжи внешние признаки с дефицитами (Железо, Цинк, Витамин А/Е).
3. ТОН: Профессиональный, медицинский, на русском. Будь лаконичным, чтобы избежать долгой генерации.`,
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
        throw new Error('ИИ не смог проанализировать изображение. Попробуйте сделать фото четче или при другом освещении.');
      }
      return output;
    }, 2); // 2 попытки достаточно для предотвращения 408 без лишнего ожидания
  }
);
