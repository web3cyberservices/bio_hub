'use server';
/**
 * @fileOverview ИИ-поток для анализа бьюти-показателей (волосы, кожа, ногти, зубы).
 * Интегрирует внешние признаки с внутренними дефицитами организма.
 * Оптимизирован для анализа фото частей тела и составов косметики.
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
  analysis: z.string().describe('Глубокий разбор состояния с описанием того, что видно на фото или в тексте состава'),
  suggestedChecks: z.array(z.string()).describe('Список нутриентов или органов для проверки'),
  recommendations: z.array(z.string()).describe('Советы по уходу и питанию'),
  specialistHint: z.string().optional().describe('Совет по посещению врача'),
});

export async function analyzeBeauty(input: z.infer<typeof BeautyInputSchema>) {
  return analyzeBeautyFlow(input);
}

const beautyPrompt = ai.definePrompt({
  name: 'analyzeBeautyPrompt',
  input: {schema: BeautyInputSchema},
  output: {schema: BeautyOutputSchema},
  config: {
    // МАКСИМАЛЬНОЕ СНЯТИЕ ОГРАНИЧЕНИЙ:
    // Позволяем ИИ анализировать кожу, ногти и медицинские составы без блокировок.
    safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_CIVIC_INTEGRITY', threshold: 'BLOCK_NONE' },
    ],
  },
  prompt: `Вы — эксперт Bio-Beauty и интегративной медицины (дерматолог, трихолог, нутрициолог). 
Ваша задача — провести глубокий анализ по категории: {{category}}.

КОНТЕКСТ ЗАПРОСА:
{{#if userContext}}Данные пользователя: Возраст {{userContext.age}} лет, Цель: {{userContext.healthGoal}}{{/if}}
{{#if description}}Описание от пользователя: {{{description}}}{{/if}}
{{#if photoDataUri}}Медиа-файл для визуального анализа: {{media url=photoDataUri}}{{/if}}

ПРАВИЛА АНАЛИЗА (СТРОГО):
1. ВИЗУАЛЬНЫЙ РАЗБОР: Обязательно начни анализ с детального описания того, что ты видишь на фото. 
   - Если это СОСТАВ ШАМПУНЯ/КОСМЕТИКИ: Проведи OCR-анализ. Ищи SLS, SLES, парабены, минеральные масла. Сделай вывод, подходит ли это для типа волос/кожи пользователя.
   - Если это НОГТИ: Ищи и описывай горизонтальные/вертикальные волны, белые пятна (лейконихия), ломкость, цвет.
   - Если это КОЖА: Опиши локализацию высыпаний, текстуру, шелушения. Используй Face Mapping.
   - Если это ВОЛОСЫ: Оцени блеск, посеченность, густоту (если видно).
2. СВЯЗЬ С ДЕФИЦИТАМИ: На основе визуальных признаков предложи конкретные витамины и минералы для проверки (Железо, Ферритин, Цинк, B12, Биотин и др.).
3. ТОН ОТВЕТА: Экспертный, поддерживающий, на русском языке. 
4. ОТКАЗ ОТ ОТВЕТА: Только если на фото абсолютно ничего не видно (черный экран или сильный размыв). В остальных случаях старайся дать максимум пользы.`,
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
      if (!output) throw new Error('ИИ не смог сформировать ответ. Попробуйте сделать фото четче или при другом освещении.');
      return output;
    }, 3);
  }
);
