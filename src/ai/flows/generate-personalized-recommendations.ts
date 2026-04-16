'use server';
/**
 * @fileOverview Поток Genkit для генерации персонализированных рекомендаций по питанию и образу жизни.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRecommendationsInputSchema = z.object({
  targetDate: z.string().describe('Дата, на которую составляется план (ISO формат).'),
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
    .describe('Общий уровень активности пользователя.'),
  healthGoal:
    z.enum([
      'снизить массу тела',
      'поддержать текущее состояние',
      'набор массы',
    ])
    .describe('Основная цель пользователя в области здоровья.'),
  smoking: z.enum(['да', 'нет']).describe('Курит ли пользователь.'),
  alcohol: z.enum(['не употребляю', 'редко', 'умеренно', 'часто']).describe('Частота употребления алкоголя.'),
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
  dailyActivities: z
    .string()
    .optional()
    .describe('Список конкретных активностей за сегодня (например: "Бег 5км", "Футбол 1 час", "Теннис").'),
  deviceData: z.object({
    steps: z.number().optional().describe('Количество шагов за сегодня.'),
    avgHeartRate: z.number().optional().describe('Средний пульс в покое (уд/мин).'),
    sleepDurationHours: z.number().optional().describe('Продолжительность сна (часы).'),
    bloodPressure: z.string().optional().describe('Артериальное давление (например, "120/80").'),
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
  currentIntake: z.object({
    calories: z.number().default(0),
    protein: z.number().default(0),
    fat: z.number().default(0),
    carbs: z.number().default(0),
  }).optional().describe('Текущее потребление за сегодня (для отображения прогресса).'),
  mealPlan: z.array(z.object({
    day: z.string().describe('День (например, "День 1" или "Понедельник").'),
    meals: z.array(z.object({
      time: z.string().describe('Время или название приема пищи (Завтрак, Обед и т.д.).'),
      name: z.string().describe('Название блюда.'),
      description: z.string().describe('Состав или краткий способ приготовления.'),
      calories: z.number().describe('Калорийность приема пищи.'),
      imageId: z.string().describe('ID изображения из СТРОГОГО списка.'),
    }))
  })).describe('Персонализированное меню на день или неделю.'),
  activityAnalysis: z.string().optional().describe('Краткий анализ данных с носимых устройств и активностей.'),
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
  prompt: `Вы — ИИ-нутрициолог, эксперт в области здоровья и велнеса. Ваша задача — предоставить персонализированные и практические рекомендации.

ОТВЕЧАЙТЕ СТРОГО НА РУССКОМ ЯЗЫКЕ.

Контекст пользователя:
- Вес: {{{weight}}} кг, Рост: {{{height}}} см, Возраст: {{{age}}} лет.
- Цель: {{{healthGoal}}}, Активность: {{{activityLevel}}}.
- Курение: {{{smoking}}}, Алкоголь: {{{alcohol}}}.
{{#if deviceData}}Данные устройств: Шаги: {{deviceData.steps}}, Пульс: {{deviceData.avgHeartRate}}, Сон: {{deviceData.sleepDurationHours}}ч, Давление: {{deviceData.bloodPressure}}.{{/if}}
{{#if favoriteFoods}}Любимая еда: {{{favoriteFoods}}}{{/if}}
{{#if dislikedFoods}}Нелюбимая еда: {{{dislikedFoods}}}{{/if}}
{{#if dailyActivities}}Активности сегодня: {{{dailyActivities}}}{{/if}}

Инструкции по Meal Plan:
1. Составьте план на {{{planDuration}}}.
2. Для КАЖДОГО блюда выберите ID СТРОГО из этого списка:
   - breakfast-omelette, breakfast-oatmeal, breakfast-smoothie
   - lunch-salad-chicken, lunch-salmon, lunch-soup
   - dinner-steak, dinner-white-fish, dinner-tofu
   - snack-nuts, snack-yogurt, snack-avocado, snack-fruit

3. Выдайте строго валидный JSON согласно схеме. Если какая-то информация отсутствует, используйте разумные значения по умолчанию на основе параметров пользователя.`,
});

const generateRecommendationsFlow = ai.defineFlow(
  {
    name: 'generateRecommendationsFlow',
    inputSchema: GenerateRecommendationsInputSchema,
    outputSchema: GenerateRecommendationsOutputSchema,
  },
  async (input) => {
    const {output} = await recommendationPrompt(input);
    if (!output) throw new Error('Model failed to generate valid output');
    
    // Симулируем текущее потребление для наглядности в демо, если оно не предоставлено
    return {
      ...output,
      currentIntake: {
        calories: Math.floor(output.macros.calories * 0.6),
        protein: Math.floor(output.macros.protein * 0.5),
        fat: Math.floor(output.macros.fat * 0.7),
        carbs: Math.floor(output.macros.carbs * 0.4),
      }
    };
  }
);