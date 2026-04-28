'use server';
/**
 * @fileOverview ИИ-поток для анализа бьюти-показателей (волосы, кожа, ногти, зубы).
 * Интегрирует внешние признаки с внутренними дефицитами организма.
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
  analysis: z.string().describe('Глубокий разбор состояния с описанием того, что видно на фото'),
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
  prompt: `Вы — эксперт Bio-Beauty и интегративной медицины (дерматолог, трихолог, нутрициолог). 
Анализируйте категорию: {{category}}.

КОНТЕКСТ ЗАПРОСА:
{{#if description}}Описание от пользователя: {{{description}}}{{/if}}
{{#if photoDataUri}}Фото для анализа: {{media url=photoDataUri}}{{/if}}

ПРАВИЛА АНАЛИЗА (ОБЯЗАТЕЛЬНО):
1. ВИЗУАЛЬНЫЙ РАЗБОР: Если приложено фото, начни анализ с описания того, что ты видишь (цвет эмали, структура волос, пятна или полосы на ногтях, текстура кожи).
2. НОГТИ: Связывай поперечные/продольные волны с дефицитом железа, B12 или проблемами ЖКТ. Белые пятна (лейконихия) — дефицит цинка или кальция.
3. ВОЛОСЫ: Анализируй густоту или состав средства (если на фото этикетка) на наличие агрессивных сульфатов (SLS/SLES) и силиконов.
4. КОЖА: Используй Face Mapping. Высыпания на подбородке — гормональный фон, на лбу — ЖКТ. При "гусиной коже" (фолликулярный кератоз) обязательно упомяни Витамин А.
5. ТОН: Профессиональный, поддерживающий, на русском языке.`,
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
      if (!output) throw new Error('Ошибка био-анализа');
      return output;
    });
  }
);
