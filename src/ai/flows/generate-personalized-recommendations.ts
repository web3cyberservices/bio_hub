'use server';
/**
 * @fileOverview Поток Genkit для генерации персонализированных рекомендаций и замены блюд.
 * Улучшена логика повторных попыток для обработки высокой нагрузки на Gemini (Error 503).
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {z} from 'genkit';

const MealSchema = z.object({
  time: z.string().describe('Время приема пищи (например, "Завтрак", "08:00")'),
  name: z.string().describe('Короткое аппетитное название блюда'),
  description: z.string().describe('Краткое описание пользы и состава'),
  calories: z.number().describe('Калорийность (целое число)'),
  protein: z.number().describe('Белки в граммах'),
  fat: z.number().describe('Жиры в граммах'),
  carbs: z.number().describe('Углеводы в граммах'),
  imageUrl: z.string().describe('ОБЯЗАТЕЛЬНОЕ ПОЛЕ. ПОЛНАЯ прямая ссылка на фото Unsplash.'),
  components: z.array(z.object({
    ingredient: z.string().describe('Название ингредиента'),
    weight: z.string().describe('Вес с единицами измерения, например "200г"')
  })).default([])
});

const GenerateRecommendationsInputSchema = z.object({
  targetDate: z.string().describe('Дата, на которую составляется план (ISO формат).'),
  weight: z.number().positive().describe('Текущий вес в килограммах.'),
  height: z.number().positive().describe('Текущий рост в сантиметрах.'),
  age: z.number().int().min(1).describe('Текущий возраст в годах.'),
  gender: z.enum(['мужской', 'женский']).describe('Пол пользователя.'),
  activityLevel:
    z.enum([
      'minimal',
      'low',
      'moderate',
      'high',
      'athlete',
    ])
    .describe('Уровень активности.'),
  healthGoal:
    z.enum([
      'снизить массу тела',
      'поддержать текущее состояние',
      'набор массы',
    ])
    .describe('Основная цель пользователя.'),
  smoking: z.enum(['да', 'нет']).describe('Курит ли пользователь.'),
  alcohol: z.enum(['не употребляю', 'редко', 'умеренно', 'часто']).describe('Частота употребления алкоголя.'),
  favoriteFoods: z.string().optional().describe('Любимые продукты.'),
  dislikedFoods: z.string().optional().describe('Нелюбимые продукты.'),
  deviceData: z.object({
    steps: z.number().optional(),
    avgHeartRate: z.number().optional(),
    sleepDurationHours: z.number().optional(),
  }).optional(),
});

const ReplaceMealInputSchema = z.object({
  previousMealName: z.string().describe('Название блюда, которое нужно заменить.'),
  mealTime: z.string().describe('Тип приема пищи (Завтрак/Обед/Ужин).'),
  userContext: z.object({
    healthGoal: z.string(),
    favoriteFoods: z.string().optional(),
    dislikedFoods: z.string().optional(),
  })
});

const GenerateRecommendationsOutputSchema = z.object({
  bioScore: z.number().min(0).max(100).describe('Общий индекс здоровья (0-100).'),
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
  fastingWindow: z.object({
    type: z.string(),
    remainingTime: z.string(),
    progress: z.number(),
  }).optional(),
  mealPlan: z.array(z.object({
    day: z.string(),
    meals: z.array(MealSchema)
  })).default([]),
});

export type GenerateRecommendationsInput = z.infer<typeof GenerateRecommendationsInputSchema>;
export type GenerateRecommendationsOutput = z.infer<typeof GenerateRecommendationsOutputSchema>;
export type ReplaceMealInput = z.infer<typeof ReplaceMealInputSchema>;

const IMAGE_ID_PROMPT = `
ПРАВИЛА ДЛЯ imageUrl:
Для каждого блюда ОБЯЗАТЕЛЬНО верните ПОЛНУЮ валидную ссылку Unsplash: https://images.unsplash.com/photo-[ID]?auto=format&fit=crop&w=800&q=80
Используйте ОДИН из этих ID в зависимости от типа блюда (выбирайте наиболее подходящий):
- Салат/Зелень: 1512621776951-a57141f2eefd
- Каша/Овсянка: 1517673400267-0251440c45dc
- Рыба/Семга: 1467003909585-2f8a72700288
- Стейк/Мясо: 1600891964092-4316c2850dbc
- Курица/Птица: 1632778149955-e80f8ceca23b
- Смузи/Боул: 1505252585461-04db1eb84625
- Яблоко/Фрукты: 1567306226416-28f0efdc88ce
- Омлет/Яйца: 1525351484163-7529414344d8
- Орехи: 1536592248-b0a688680074
- Творог/Йогурт: 1481931098708-28308112ef81
- Паста/Макароны: 1473093226724-4e24059a9742
- Суп: 1547592166903-89826d2d82bb
- Авокадо-тост: 1525351484163-7529414344d8
`;

/**
 * Вспомогательная функция для повторных попыток при временных ошибках ИИ (503/429/UNAVAILABLE).
 * Усилена для работы в условиях высокой нагрузки.
 */
async function runWithRetry<T>(fn: () => Promise<T>, maxRetries = 5, initialDelay = 2000): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      const errorMsg = error.message || '';
      const isTransient = errorMsg.includes('503') || 
                          errorMsg.includes('UNAVAILABLE') || 
                          errorMsg.includes('429') ||
                          errorMsg.includes('overloaded') ||
                          errorMsg.includes('demand');
      
      if (isTransient && i < maxRetries - 1) {
        // Экспоненциальная задержка с небольшим "дребезгом" (jitter)
        const delay = initialDelay * Math.pow(2, i) + (Math.random() * 500); 
        console.warn(`[BioTech AI] Временная ошибка (попытка ${i + 1}/${maxRetries}). Ожидание ${Math.round(delay)}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error('ИИ временно недоступен из-за экстремальной нагрузки на серверы Google. Пожалуйста, попробуйте еще раз через 30-60 секунд.');
}

const recommendationPrompt = ai.definePrompt({
  name: 'personalizedRecommendationPrompt',
  input: {schema: GenerateRecommendationsInputSchema},
  output: {schema: GenerateRecommendationsOutputSchema},
  prompt: `Вы — эксперт-нутрициолог. Ваша задача — создать глубокий аналитический отчет и план питания.
ОТВЕЧАЙТЕ СТРОГО НА РУССКОМ ЯЗЫКЕ.

УЧЕТ ПРЕДПОЧТЕНИЙ:
{{#if favoriteFoods}}Любимая еда: {{{favoriteFoods}}}.{{/if}}
{{#if dislikedFoods}}Исключить: {{{dislikedFoods}}}.{{/if}}

${IMAGE_ID_PROMPT}

Выдавайте результат СТРОГО в формате JSON, соответствующем схеме.

Контекст:
Вес: {{weight}}кг, Рост: {{height}}см, Возраст: {{age}} лет. Цель: {{healthGoal}}. Активность: {{activityLevel}}.`,
});

const replaceMealPrompt = ai.definePrompt({
  name: 'replaceMealPrompt',
  input: {schema: ReplaceMealInputSchema},
  output: {schema: MealSchema},
  prompt: `Вы — эксперт-нутрициолог. Пользователь хочет заменить блюдо "{{previousMealName}}" на другое альтернативное (прием пищи: {{mealTime}}).

Цель пользователя: {{userContext.healthGoal}}.
{{#if userContext.favoriteFoods}}Любит: {{userContext.favoriteFoods}}.{{/if}}
{{#if userContext.dislikedFoods}}Не любит: {{userContext.dislikedFoods}}.{{/if}}

${IMAGE_ID_PROMPT}

Предложите НОВОЕ вкусное блюдо, которое отличается от {{previousMealName}}, но подходит по КБЖУ и времени приема пищи.
Отвечайте на русском языке. Результат должен быть валидным JSON.`,
});

const generateRecommendationsFlow = ai.defineFlow(
  {
    name: 'generateRecommendationsFlow',
    inputSchema: GenerateRecommendationsInputSchema,
    outputSchema: GenerateRecommendationsOutputSchema,
  },
  async (input) => {
    return runWithRetry(async () => {
      const {output} = await recommendationPrompt(input, {
        model: googleAI.model('gemini-2.5-flash'),
      });
      if (!output) throw new Error('Ошибка генерации био-отчета');
      return output;
    });
  }
);

const replaceMealFlow = ai.defineFlow(
  {
    name: 'replaceMealFlow',
    inputSchema: ReplaceMealInputSchema,
    outputSchema: MealSchema,
  },
  async (input) => {
    return runWithRetry(async () => {
      const {output} = await replaceMealPrompt(input, {
        model: googleAI.model('gemini-2.5-flash'),
      });
      if (!output) throw new Error('Ошибка замены блюда');
      return output;
    });
  }
);

export async function generatePersonalizedRecommendations(
  input: GenerateRecommendationsInput
): Promise<GenerateRecommendationsOutput> {
  return generateRecommendationsFlow(input);
}

export async function replaceMeal(input: ReplaceMealInput): Promise<z.infer<typeof MealSchema>> {
  return replaceMealFlow(input);
}
