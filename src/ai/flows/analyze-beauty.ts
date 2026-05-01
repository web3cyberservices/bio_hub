'use server';
/**
 * @fileOverview ИИ-поток для анализа бьюти-показателей (волосы, кожа, ногти, зубы).
 * Интегрирует внешние признаки с внутренними дефицитами организма.
 * Оптимизирован для глубокого визуального анализа и OCR составов.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {runWithRetry} from '@/ai/utils';

const BeautyInputSchema = z.object({
  category: z.enum(['hair', 'nails', 'skin', 'teeth']),
  description: z.string().optional(),
  photoDataUri: z.string().optional(),
  userContext: z.object({
    age: z.number().optional(),
    healthGoal: z.string().optional(),
  }).optional(),
});

const BeautyOutputSchema = z.object({
  analysis: z.string().describe('Детальный визуальный разбор того, что видно на фото или в описании'),
  suggestedChecks: z.array(z.string()).describe('Список дефицитов (витамины, минералы) или анализов для проверки'),
  recommendations: z.array(z.string()).describe('Конкретные советы по уходу, продуктам питания и образу жизни'),
  specialistHint: z.string().optional().describe('Рекомендация по посещению профильного врача'),
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
  prompt: `Вы — ведущий эксперт Bio-Beauty и интегративной медицины. 
Ваша задача — провести глубокий анализ по категории: {{category}}.

КОНТЕКСТ:
{{#if userContext}}Возраст пользователя: {{userContext.age}} лет. Цель: {{userContext.healthGoal}}.{{/if}}
{{#if description}}Сообщение пользователя: {{{description}}}{{/if}}
Медиа-данные: {{#if photoDataUri}}{{media url=photoDataUri}}{{else}}Фото не предоставлено, анализируйте только текст.{{/if}}

АЛГОРИТМ ДЕЙСТВИЯ (ОБЯЗАТЕЛЬНО):
1. ЕСЛИ ПРЕДОСТАВЛЕНО ФОТО:
   - ВОЛОСЫ/ШАМПУНЬ: Проведите OCR-анализ этикетки. Ищите сульфаты (SLS/SLES), парабены, силиконы. Сделайте вывод о безопасности для типа волос.
   - НОГТИ: Опишите структуру (волны, белые пятна, ломкость). Свяжите это с дефицитами Цинка, Железа или Кальция.
   - КОЖА (Face Mapping): Определите локализацию проблем. Свяжите "гусиную кожу" с Витамином А/Омега-3, а высыпания — с работой ЖКТ.
   - ЗУБЫ: Оцените состояние эмали и десен, если это видно.
2. СВЯЗЬ С ПИТАНИЕМ: На основе внешних признаков предложите продукты-суперфуды для решения проблемы.
3. ТОН: Профессиональный, медицинский, на русском языке.`,
});

const analyzeBeautyFlow = ai.defineFlow(
  {
    name: 'analyzeBeautyFlow',
    inputSchema: BeautyInputSchema,
    outputSchema: BeautyOutputSchema,
  },
  async (input) => {
    return runWithRetry(async () => {
      const {output} = await beautyPrompt(input);
      if (!output) {
        throw new Error('ИИ не смог распознать изображение. Пожалуйста, сделайте фото при более ярком освещении и убедитесь, что объект в фокусе.');
      }
      return output;
    }, 2); // 2 попытки достаточно для тяжелых запросов с фото
  }
);
