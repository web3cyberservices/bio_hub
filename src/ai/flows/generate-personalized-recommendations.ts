'use server';
/**
 * @fileOverview Поток Genkit для генерации персонализированных рекомендаций и замены блюд.
 * Оптимизирована логика подбора изображений и повторных попыток.
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
  activityLevel: z.enum(['minimal', 'low', 'moderate', 'high', 'athlete']).describe('Уровень активности.'),
  healthGoal: z.enum(['снизить массу тела', 'поддержать текущее состояние', 'набор массы']).describe('Основная цель пользователя.'),
  smoking: z.enum(['да', 'нет']).describe('Курит ли пользователь.'),
  alcohol: z.enum(['не употребляю', 'редко', 'умеренно', 'часто']).describe('Частота употребления алкоголя.'),
  favoriteFoods: z.string().optional().describe('Любимые продукты.'),
  dislikedFoods: z.string().optional().describe('Нелюбимые продукты.'),
  deviceData: z.object({
    steps: z.number().optional(),
    avgHeartRate: z.number().optional(),
    sleepDurationHours: z.number().optional(),
    bloodPressure: z.string().optional(),
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
ПРАВИЛА ДЛЯ imageUrl (КРИТИЧЕСКИ ВАЖНО):
Выбирайте ID строго в соответствии с типом блюда. Верните ПОЛНУЮ ссылку: https://images.unsplash.com/photo-[ID]?auto=format&fit=crop&w=800&q=80
СПИСОК РАЗРЕШЕННЫХ ID:
- Овсяная каша / Злаки: 1517673400267-0251440c45dc
- Омлет / Яичница: 1525351484163-7529414344d8
- Смузи / Боул / Детокс: 1505252585461-04db1eb84625
- Творог / Йогурт: 1481931098708-28308112ef81
- Суп / Борщ: 1547592166903-89826d2d82bb
- Салат овощной: 1512621776951-a57141f2eefd
- Лосось / Форель / Рыба: 1467003909585-2f8a72700288
- Стейк / Говядина: 1600891964092-4316c2850dbc
- Куриная грудка / Птица: 1632778149955-e80f8ceca23b
- Паста / Макароны / Спагетти: 1473093226724-4e24059a9742
- Рис / Плов / Ризотто: 1512058560367-0035672fb799
- Фрукты / Яблоко / Плоды: 1567306226416-28f0efdc88ce
- Орехи / Миндаль / Перекус: 1536592248-b0a688680074
- Авокадо тост / Брускетта: 1525351484163-7529414344d8
- Гречка / Крупа: 1500315331676-957a82b3b5c8
- Индейка / Запеченное филе: 1604908176997-125c9306b3a2
- Морепродукты / Креветки: 1514362545818-201c4d699ac2
- Сыр / Сырная нарезка: 1486297678142-f87ea97a03f0
- Блины / Оладьи / Панкейки: 1567620905049-cf37180b7ccf
- Бутерброд / Сэндвич / Бургер: 1528735602780-2552da2451b6
- Ягоды / Черника / Клубника: 1464965811803-9d273f4aa019
- Овощи на гриле / Брокколи: 1566190063405-7c74468d62ad
`;

export async function runWithRetry<T>(fn: () => Promise<T>, maxRetries = 3, initialDelay = 3000): Promise<T> {
  const actionStartTime = Date.now();
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (Date.now() - actionStartTime > 120000) {
        throw new Error('Превышено время ожидания ИИ (2 мин). Попробуйте упростить запрос или сделать фото четче.');
      }
      
      console.warn(`AI Retry attempt ${i + 1}/${maxRetries} error:`, error.message);
      
      const delay = initialDelay * Math.pow(2, i) + (Math.random() * 1000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('ИИ временно перегружен запросами. Пожалуйста, подождите 30 секунд и попробуйте снова.');
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

Выдавайте результат СТРОГО в формате JSON. Подбирайте imageUrl из списка разрешенных максимально точно.

Контекст:
Вес: {{weight}}кг, Рост: {{height}}см, Возраст: {{age}} лет. Цель: {{healthGoal}}. Активность: {{activityLevel}}.
Показатели: {{#if deviceData}}Шаги: {{deviceData.steps}}, Сон: {{deviceData.sleepDurationHours}}ч, Давление: {{deviceData.bloodPressure}}{{/if}}`,
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

Предложите НОВОЕ вкусное блюдо. Отвечайте на русском языке. Результат должен быть валидным JSON. Используйте максимально подходящий imageUrl из списка.`,
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
      if (!output) throw new Error('Ошибка генерации био-отчета: Пустой ответ');
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
      if (!output) throw new Error('Ошибка замены блюда: Пустой ответ');
      return output;
    });
  }
);

export async function generatePersonalizedRecommendations(
  input: GenerateRecommendationsInput
): Promise<GenerateRecommendationsOutput> {
  return generateRecommendationsFlow(input);
}

export async function replaceMeal(input: ReplaceMealInput): Promise<z.infer<typeof MealSchema> | null> {
  try {
    return await replaceMealFlow(input);
  } catch (e: any) {
    console.error('AI Replace Meal Action Error:', e);
    return null;
  }
}
