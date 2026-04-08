'use server';
/**
 * @fileOverview Поток Genkit для генерации персонализированных рекомендаций по питанию и образу жизни.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRecommendationsInputSchema = z.object({
  weight: z.number().positive().describe('Текущий вес в килограммах.'),
  height: z.number().positive().describe('Текущий рост в сантиметрах.'),
  age: z.number().int().min(1).describe('Текущий возраст в годах.'),
  gender: z.enum(['мужской', 'женский']).describe('Пол пользователя.'),
  activityLevel:
    z.enum([
      'малоактивный',
      'среднеактивный',
      'средний',
      'активный',
      'перенагрузка',
    ])
    .describe('Уровень активности пользователя.'),
  healthGoal:
    z.enum([
      'снизить массу тела',
      'поддержать текущее состояние',
      'набор массы',
    ])
    .describe('Основная цель пользователя в области здоровья.'),
  dietaryInput: z
    .string()
    .optional()
    .describe('Дополнительный текст с описанием ежедневного рациона питания.'),
  labResultsInput: z
    .string()
    .optional()
    .describe('Дополнительный текст с результатами недавних лабораторных анализов.'),
  medicalConditionsInput: z
    .string()
    .optional()
    .describe('Описание хронических заболеваний, жалоб или аллергий пользователя.'),
});
export type GenerateRecommendationsInput = z.infer<
  typeof GenerateRecommendationsInputSchema
>;

const GenerateRecommendationsOutputSchema = z.object({
  recommendations: z.object({
    lifestyle:
      z.string().describe('Персонализированные рекомендации по образу жизни (сон, стресс, активность).'),
    diet:
      z.string().describe('Персонализированные диетические рекомендации, включая выбор продуктов.'),
    supplements:
      z.string().describe('Персонализированные рекомендации по витаминам и БАДам.'),
  }),
  macros: z.object({
    calories: z.number().describe('Рекомендуемая суточная норма калорий (ккал).'),
    protein: z.number().describe('Рекомендуемое количество белка (г).'),
    fat: z.number().describe('Рекомендуемое количество жиров (г).'),
    carbs: z.number().describe('Рекомендуемое количество углеводов (г).'),
  }),
});
export type GenerateRecommendationsOutput = z.infer<
  typeof GenerateRecommendationsOutputSchema
>;

export async function generatePersonalizedRecommendations(
  input: GenerateRecommendationsInput
): Promise<GenerateRecommendationsOutput> {
  return generateRecommendationsFlow(input);
}

const recommendationPrompt = ai.definePrompt({
  name: 'personalizedRecommendationPrompt',
  input: {schema: GenerateRecommendationsInputSchema},
  output: {schema: GenerateRecommendationsOutputSchema},
  prompt: `Вы — ИИ-нутрициолог, эксперт в области здоровья и велнеса. Ваша задача — предоставить персонализированные, контекстные и практические рекомендации.

ОТВЕЧАЙТЕ СТРОГО НА РУССКОМ ЯЗЫКЕ.

Профиль здоровья пользователя:
- Пол: {{{gender}}}
- Вес: {{{weight}}} кг
- Рост: {{{height}}} см
- Возраст: {{{age}}} лет
- Уровень активности: {{{activityLevel}}}
- Цель: {{{healthGoal}}}

{{#if medicalConditionsInput}}
Медицинские условия/заболевания:
{{{medicalConditionsInput}}}
{{/if}}

{{#if dietaryInput}}
Данные о рационе пользователя:
{{{dietaryInput}}}
{{/if}}

{{#if labResultsInput}}
Данные лабораторных анализов:
{{{labResultsInput}}}
{{/if}}

Важные инструкции:
1. Рассчитайте суточную норму калорий (TDEE) на основе формулы Миффлина-Сан Жеора и уровня активности.
2. Рассчитайте оптимальное распределение БЖУ (белки, жиры, углеводы) в граммах в зависимости от цели пользователя.
3. Подготовьте подробные рекомендации по образу жизни, диете и добавкам.
4. Если есть заболевания (medicalConditionsInput), обязательно учтите их в диетических рекомендациях (например, исключите сахар при диабете или глютен при целиакии).

Если предоставлены данные о рационе или анализах, обязательно интегрируйте их в свой анализ.`,
});

const generateRecommendationsFlow = ai.defineFlow(
  {
    name: 'generateRecommendationsFlow',
    inputSchema: GenerateRecommendationsInputSchema,
    outputSchema: GenerateRecommendationsOutputSchema,
  },
  async (input) => {
    const {output} = await recommendationPrompt(input);
    return output!;
  }
);
