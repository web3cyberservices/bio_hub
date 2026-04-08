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
  favoriteFoods: z
    .string()
    .optional()
    .describe('Список любимых продуктов пользователя для включения в меню.'),
  dislikedFoods: z
    .string()
    .optional()
    .describe('Список нелюбимых продуктов пользователя для исключения из меню.'),
  planDuration: z
    .enum(['день', 'неделя'])
    .default('день')
    .describe('Длительность плана питания.'),
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
  // Данные с устройств
  deviceData: z.object({
    steps: z.number().optional().describe('Количество шагов за сегодня.'),
    avgHeartRate: z.number().optional().describe('Средний пульс в покое (уд/мин).'),
    sleepDurationHours: z.number().optional().describe('Продолжительность сна (часы).'),
  }).optional().describe('Данные синхронизированные с носимых устройств (Apple Health, Google Fit и т.д.)'),
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
  mealPlan: z.array(z.object({
    day: z.string().describe('День (например, "День 1" или "Понедельник").'),
    meals: z.array(z.object({
      time: z.string().describe('Время или название приема пищи (Завтрак, Обед и т.д.).'),
      name: z.string().describe('Название блюда.'),
      description: z.string().describe('Состав или краткий способ приготовления.'),
      calories: z.number().describe('Калорийность приема пищи.'),
    }))
  })).describe('Персонализированное меню на день или неделю.'),
  activityAnalysis: z.string().optional().describe('Краткий анализ данных с носимых устройств.'),
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

{{#if favoriteFoods}}
Любимые продукты пользователя (используйте их как основу при составлении меню):
{{{favoriteFoods}}}
{{/if}}

{{#if dislikedFoods}}
Нелюбимые продукты пользователя (СТРОГО ИСКЛЮЧИТЕ их из меню):
{{{dislikedFoods}}}
{{/if}}

План нужен на: {{{planDuration}}}

{{#if deviceData}}
Данные с носимых устройств:
- Шаги сегодня: {{deviceData.steps}}
- Средний пульс: {{deviceData.avgHeartRate}} уд/мин
- Сон: {{deviceData.sleepDurationHours}} ч
{{/if}}

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
1. Рассчитайте суточную норму калорий (TDEE) на основе формулы Миффлина-Сан Жеора и уровня активности. Если данные о шагах (deviceData.steps) высоки, скорректируйте калории в сторону увеличения.
2. Рассчитайте оптимальное распределение БЖУ (белки, жиры, углеводы) в граммах в зависимости от цели пользователя.
3. Составьте план питания (mealPlan) на указанную длительность ({{{planDuration}}}). Если на неделю — распишите каждый из 7 дней. Если на день — 1 день. 
4. В плане питания СТРОГО УЧИТЫВАЙТЕ любимые продукты пользователя и СТРОГО ИСКЛЮЧАЙТЕ нелюбимые продукты.
5. Подготовьте подробные рекомендации по образу жизни, диете и добавкам. 
6. Если данные о сне низкие (менее 7 часов), добавьте конкретные советы по гигиене сна в раздел Образ жизни.
7. Если предоставлены данные о рационе или анализах, обязательно интегрируйте их в свой анализ.`,
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