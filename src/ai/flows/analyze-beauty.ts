'use server';
/**
 * @fileOverview ИИ-поток для глубокого анализа бьюти-показателей.
 * Оптимизирован для распознавания составов (OCR) и специфических маркеров здоровья (ногти, кожа).
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
  analysis: z.string().describe('Детальный визуальный разбор того, что видно на фото или описано.'),
  suggestedChecks: z.array(z.string()).describe('Список дефицитов или анализов (например, ферритин при волнах на ногтях).'),
  recommendations: z.array(z.string()).describe('Конкретные советы по уходу, выбору средств и питанию.'),
  specialistHint: z.string().optional().describe('Рекомендация по посещению конкретного врача.'),
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
  prompt: `Вы — эксперт Bio-Beauty Hub. Ваша задача — провести глубокий визуальный и текстовый анализ по категории: {{category}}.

КОНТЕКСТ ПОЛЬЗОВАТЕЛЯ:
{{#if userContext}}Возраст: {{userContext.age}}. Цель: {{userContext.healthGoal}}.{{/if}}
{{#if description}}Описание от пользователя: {{{description}}}{{/if}}
Медиа: {{#if photoDataUri}}{{media url=photoDataUri}}{{else}}Анализируйте только текстовое описание.{{/if}}

СПЕЦИФИКАЦИЯ АНАЛИЗА:
1. НОГТИ (nails): Если есть фото, ищи вертикальные/горизонтальные волны (признак дефицита железа/B12), белые пятна (дефицит цинка), ломкость.
2. ВОЛОСЫ/ШАМПУНЬ (hair): Если на фото этикетка шампуня, ПРОВЕДИ OCR-АНАЛИЗ СОСТАВА. Ищи сульфаты (SLS/SLES), жесткие силиконы, парабены. Сопоставь состав с жалобами на сухость или выпадение.
3. КОЖА (skin): Анализируй текстуру, тип высыпаний, признаки обезвоженности.
4. ЗУБЫ (teeth): Оцени состояние эмали, прозрачность краев, наличие налета или пятен.

АЛГОРИТМ ОТВЕТА:
1. ВИЗУАЛЬНЫЙ РАЗБОР: Обязательно начни с фразы "На фото я вижу..." и опиши детали (текстуру ногтя, конкретные ингредиенты состава, состояние кожи).
2. ГИПОТЕЗЫ ДЕФИЦИТОВ: На основе внешних признаков предложи, какие анализы стоит сдать.
3. ПРАКТИЧЕСКИЕ СОВЕТЫ: Дай конкретные рекомендации.

ТОН: Профессиональный, медицинский, лаконичный. Ответ на русском языке.`,
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
        throw new Error('ИИ не смог сформировать ответ. Попробуйте сделать фото более четким при хорошем освещении.');
      }
      return output;
    }, 2);
  }
);