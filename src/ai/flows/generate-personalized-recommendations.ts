
'use server';
/**
 * @fileOverview Поток Genkit для генерации персонализированных рекомендаций по питанию и образу жизни.
 * Добавлена логика повторных попыток (retry) и строгая фильтрация изображений еды.
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
  favoriteFoods: z.string().optional(),
  dislikedFoods: z.string().optional(),
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
    calories: z.number(),
    protein: z.number(),
    fat: z.number(),
    carbs: z.number(),
  }),
  micronutrients: z.array(z.object({
    name: z.string().describe('Название (например, Магний, Витамин C).'),
    current: z.number().describe('Текущее значение (мг/мкг).'),
    goal: z.number().describe('Целевое значение.'),
    unit: z.string().describe('Единица измерения.'),
  })).describe('Микронутриенты для отслеживания.'),
  fastingWindow: z.object({
    type: z.string().describe('Тип (например, 16:8).'),
    remainingTime: z.string().describe('Осталось времени до конца окна.'),
    progress: z.number().describe('Процент прохождения окна.'),
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
      imageId: z.string().describe('ID изображения СТРОГО из списка: breakfast-omelette, breakfast-oatmeal, breakfast-smoothie, lunch-salmon, lunch-salad-chicken, lunch-soup, dinner-steak, dinner-white-fish, dinner-tofu, snack-nuts, snack-yogurt, snack-avocado, snack-fruit.'),
    }))
  })),
  activityAnalysis: z.string().optional(),
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
  prompt: `Вы — ИИ-биохакер и нутрициолог высшего уровня. Ваша задача — создать глубокий аналитический отчет.

ОТВЕЧАЙТЕ СТРОГО НА РУССКОМ ЯЗЫКЕ.

ИНСТРУКЦИИ ПО ИЗОБРАЖЕНИЯМ ЕДЫ (КРИТИЧЕСКИ ВАЖНО):
Для каждого приема пищи вы ДОЛЖНЫ выбрать наиболее подходящий imageId ТОЛЬКО из этого списка:
- Для каш, овсянки: breakfast-oatmeal
- Для яиц, омлетов: breakfast-omelette
- Для смузи, ягодных чаш: breakfast-smoothie
- Для лосося, семги, морепродуктов: lunch-salmon
- Для салатов с курицей или мясом: lunch-salad-chicken
- Для супов: lunch-soup
- Для говядины, стейков: dinner-steak
- Для белой рыбы (треска, минтай): dinner-white-fish
- Для вегетарианских блюд с тофу: dinner-tofu
- Для орехов: snack-nuts
- Для йогуртов: snack-yogurt
- Для авокадо-тостов: snack-avocado
- Для фруктовых нарезок: snack-fruit

ЗАПРЕЩЕНО использовать любые другие ID. Если подходящего ID нет, выберите максимально близкий по смыслу из списка.

Контекст пользователя:
- Вес: {{{weight}}} кг, Рост: {{{height}}} см, Возраст: {{{age}}} лет.
- Цель: {{{healthGoal}}}, Активность: {{{activityLevel}}}.
- Курение: {{{smoking}}}, Алкоголь: {{{alcohol}}}.
{{#if deviceData}}Данные устройств: Шаги: {{deviceData.steps}}, Пульс: {{deviceData.avgHeartRate}}, Сон: {{deviceData.sleepDurationHours}}ч.{{/if}}
{{#if labResultsInput}}Результаты анализов: {{{labResultsInput}}}{{/if}}`,
});

const generateRecommendationsFlow = ai.defineFlow(
  {
    name: 'generateRecommendationsFlow',
    inputSchema: GenerateRecommendationsInputSchema,
    outputSchema: GenerateRecommendationsOutputSchema,
  },
  async (input) => {
    let lastError;
    for (let i = 0; i < 3; i++) {
      try {
        const {output} = await recommendationPrompt(input);
        if (!output) throw new Error('Model failed to generate valid output');
        return output;
      } catch (err: any) {
        lastError = err;
        if (err.message?.includes('503') || err.status === 503) {
          await new Promise(resolve => setTimeout(resolve, 1500 * (i + 1)));
          continue;
        }
        throw err;
      }
    }
    throw lastError;
  }
);
