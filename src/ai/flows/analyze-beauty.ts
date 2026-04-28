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
  analysis: z.string().describe('Глубокий разбор состояния'),
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

Контекст запроса:
{{#if description}}Описание состояния/состава: {{{description}}}{{/if}}
{{#if photoDataUri}}Фото: {{media url=photoDataUri}}{{/if}}

Правила анализа:
1. Волосы: Анализируйте состав (если есть фото) на агрессивные ПАВ.
2. Ногти: Связывайте волны с ЖКТ/железом, белые пятна с цинком/кальцием.
3. Кожа: Используйте принципы Face Mapping (связь зон лица с органами). При фолликулярном кератозе ("гусиная кожа") упоминайте дефицит Витамина А и Омеги-3.
4. Зубы: Если есть чувствительность, анализируйте кислоты в рационе.
5. Тон: Профессиональный, медицинский, на русском языке.`,
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
