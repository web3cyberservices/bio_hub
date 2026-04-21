'use server';
/**
 * @fileOverview Поток Genkit для генерации персонализированных рекомендаций.
 * Использует Gemini 2.5 Flash для глубокого анализа биометрии.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/google-genai';
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
  labResultsInput: z.string().optional(),
  deviceData: z.object({
    steps: z.number().optional(),
    avgHeartRate: z.number().optional(),
    sleepDurationHours: z.number().optional(),
    bloodPressure: z.string().optional(),
  }).optional(),
});
export type GenerateRecommendationsInput = z.infer<typeof GenerateRecommendationsInputSchema>;

const GenerateRecommendationsOutputSchema = z.object({
  bioScore: z.number().min(0).max(100).describe('Общий индекс здоровья за сегодня (0-100).'),
  recommendations: z.object({
    lifestyle: z.string(),
    diet: z.string(),
    supplements: z.string(),
  }),
  macros: z.object({
    calories: z.number().describe('Целевая калорийность на день.'),
    protein: z.number().describe('Целевое количество белков (г) на день.'),
    fat: z.number().describe('Целевое количество жиров (г) на день.'),
    carbs: z.number().describe('Целевое количество углеводов (г) на день.'),
  }),
  micronutrients: z.array(z.object({
    name: z.string(),
    current: z.number(),
    goal: z.number(),
    unit: z.string(),
  })),
  fastingWindow: z.object({
    type: z.string(),
    remainingTime: z.string(),
    progress: z.number(),
  }).optional(),
  mealPlan: z.array(z.object({
    day: z.string(),
    meals: z.array(z.object({
      time: z.string(),
      name: z.string(),
      description: z.string(),
      calories: z.number(),
      protein: z.number().optional(),
      fat: z.number().optional(),
      carbs: z.number().optional(),
      imageId: z.string().describe('ID из списка изображений (например: lunch-salmon).'),
      components: z.array(z.object({
        ingredient: z.string().describe('Название ингредиента'),
        weight: z.string().describe('Вес с единицами измерения, например "200г"')
      })).describe('Разбивка блюда на компоненты.')
    }))
  })),
});
export type GenerateRecommendationsOutput = z.infer<typeof GenerateRecommendationsOutputSchema>;

export async function generatePersonalizedRecommendations(
  input: GenerateRecommendationsInput
): Promise<GenerateRecommendationsOutput> {
  return generateRecommendationsFlow(input);
}

const recommendationPrompt = ai.definePrompt({
  name: 'personalizedRecommendationPrompt',
  input: {schema: GenerateRecommendationsInputSchema},
  output: {schema: GenerateRecommendationsOutputSchema},
  prompt: `Вы — ИИ-биохакер и нутрициолог системы "PRO Себя".

ВАША ЗАДАЧА:
Создать глубокий аналитический отчет на основе биометрических данных.

ПРАВИЛА ДЕТАЛИЗАЦИИ БЛЮД:
Для каждого приема пищи в mealPlan вы ОБЯЗАНЫ предоставить массив components с граммами.

ИСПОЛЬЗУЙТЕ ТОЛЬКО ЭТИ ИЗОБРАЖЕНИЯ:
breakfast-oatmeal, breakfast-omelette, breakfast-smoothie, lunch-salmon, lunch-salad-chicken, lunch-soup, dinner-steak, dinner-white-fish, dinner-tofu, snack-nuts, snack-yogurt, snack-avocado, snack-fruit.

ОТВЕЧАЙТЕ СТРОГО НА РУССКОМ ЯЗЫКЕ.

Контекст:
Вес: {{weight}}кг, Рост: {{height}}см, Возраст: {{age}} лет. Цель: {{healthGoal}}.
{{#if deviceData}}Шаги: {{deviceData.steps}}, Сон: {{deviceData.sleepDurationHours}}ч.{{/if}}`,
});

const generateRecommendationsFlow = ai.defineFlow(
  {
    name: 'generateRecommendationsFlow',
    inputSchema: GenerateRecommendationsInputSchema,
    outputSchema: GenerateRecommendationsOutputSchema,
  },
  async (input) => {
    const {output} = await recommendationPrompt(input, {
      model: googleAI.model('gemini-2.5-flash'),
    });
    if (!output) throw new Error('Модель вернула пустой результат');
    return output;
  }
);
