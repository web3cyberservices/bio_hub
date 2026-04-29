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
    // Снимаем ограничения, чтобы ИИ не боялся анализировать части тела или медицинские составы
    safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
    ],
  },
  prompt: `Вы — эксперт Bio-Beauty и интегративной медицины (дерматолог, трихолог, нутрициолог). 
Анализируйте категорию: {{category}}.

КОНТЕКСТ ЗАПРОСА:
{{#if description}}Описание от пользователя: {{{description}}}{{/if}}
{{#if photoDataUri}}Медиа-файл для анализа: {{media url=photoDataUri}}{{/if}}

ПРАВИЛА АНАЛИЗА (ОБЯЗАТЕЛЬНО):
1. ВИЗУАЛЬНЫЙ РАЗБОР: Если приложено фото, начни анализ с детального описания того, что ты видишь. 
   - Если это СОСТАВ ШАМПУНЯ (текст на флаконе): Проведи OCR-анализ. Ищи SLS, SLES, силиконы, парабены. Сделай вывод, подходит ли это для здоровых волос.
   - Если это НОГТИ: Опиши форму, цвет, наличие пятен или полос.
   - Если это КОЖА: Опиши текстуру, высыпания, сухость.
   - Если это ВОЛОСЫ: Опиши блеск, структуру, секущиеся кончики.
2. НОГТИ: Связывай поперечные/продольные волны с дефицитом железа, B12 или проблемами ЖКТ. Белые пятна (лейконихия) — дефицит цинка или кальция.
3. КОЖА: Используй Face Mapping. Высыпания на подбородке — гормональный фон, на лбу — ЖКТ.
4. ВЫВОД: Ответ должен быть структурированным, экспертным и на русском языке. Если на фото неразборчиво, попроси сделать фото ближе.`,
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
      if (!output) throw new Error('ИИ не смог сформировать ответ. Попробуйте загрузить фото крупнее.');
      return output;
    });
  }
);
