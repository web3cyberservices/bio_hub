
'use server';
/**
 * @fileOverview Поток Genkit для генерации персонализированных рекомендаций.
 * Обновлено: теперь ИИ возвращает прямые ссылки на качественные фото еды из Unsplash.
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
    carbs: z.number().describe('Целевое количество углевод на день.'),
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
      name: z.string().describe('Короткое аппетитное название блюда'),
      description: z.string().describe('Краткое описание пользы и состава'),
      calories: z.number(),
      protein: z.number().optional(),
      fat: z.number().optional(),
      carbs: z.number().optional(),
      imageUrl: z.string().describe('Прямая ссылка на качественное фото еды из Unsplash. СТРОГО ПО ПРАВИЛАМ.'),
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
  prompt: `Вы — эксперт-нутрициолог системы "PRO Себя". Ваша задача — создать глубокий аналитический отчет и план питания.

ПРАВИЛА ДЛЯ ПОЛЯ imageUrl:
Вы ОБЯЗАНЫ для каждого блюда вернуть качественную ссылку на фото еды с Unsplash.
1. Запрещено использовать заглушки с мостами, городами, людьми или абстракциями. Только ЕДА.
2. Формат ссылки СТРОГО: https://images.unsplash.com/photo-[ID]?auto=format&fit=crop&w=600&q=80
3. Подбирайте [ID] из примеров ниже или используйте известные вам ID качественных фуд-фото:
   - Салат: 1512621776951-a57141f2eefd
   - Каша/Овсянка: 1517673400267-0251440c45dc
   - Рыба: 1467003909585-2f8a72700288
   - Стейк/Мясо: 1600891964092-4316c2850dbc
   - Курица: 1632778149955-e80f8ceca23b
   - Смузи: 1505252585461-04db1eb84625
   - Яблоко/Фрукты: 1567306226416-28f0efdc88ce
   - Омлет/Яйца: 1525351484163-7529414344d8
   - Орехи: 1536592248-b0a688680074
   - Творог/Йогурт: 1481931098708-28308112ef81

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
      model: googleAI.model('gemini-1.5-flash'),
    });
    if (!output) throw new Error('Модель вернула пустой результат');
    return output;
  }
);
