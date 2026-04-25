
'use server';
/**
 * @fileOverview Поток Genkit для генерации персонализированных рекомендаций.
 * Оптимизирован для предотвращения ошибок структуры JSON и обеспечения научной точности расчетов.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {z} from 'genkit';
import {runWithRetry} from '@/ai/utils';

const MealSchema = z.object({
  time: z.string().describe('Время приема пищи.'),
  name: z.string().describe('Название блюда.'),
  description: z.string().describe('Польза и краткое описание.'),
  calories: z.number().describe('Ккал.'),
  protein: z.number().describe('Белки.'),
  fat: z.number().describe('Жиры.'),
  carbs: z.number().describe('Углеводы.'),
  imageUrl: z.string().describe('Прямая ссылка Unsplash.'),
  components: z.array(z.object({
    ingredient: z.string(),
    weight: z.string()
  })).default([])
});

const GenerateRecommendationsInputSchema = z.object({
  targetDate: z.string(),
  weight: z.number(),
  height: z.number(),
  age: z.number(),
  gender: z.enum(['мужской', 'женский']),
  activityLevel: z.enum(['minimal', 'low', 'moderate', 'high', 'athlete']),
  healthGoal: z.enum(['снизить массу тела', 'поддержать текущее состояние', 'набор массы']),
  smoking: z.enum(['да', 'нет']),
  alcohol: z.enum(['не употребляю', 'редко', 'умеренно', 'часто']),
  favoriteFoods: z.string().optional(),
  dislikedFoods: z.string().optional(),
  medications: z.string().optional().describe('Лекарства или БАДы, которые принимает пользователь.'),
  deviceData: z.object({
    steps: z.number().optional(),
    avgHeartRate: z.number().optional(),
    sleepDurationHours: z.number().optional(),
    bloodPressure: z.string().optional(),
  }).optional(),
});

const GenerateRecommendationsOutputSchema = z.object({
  bioScore: z.number().min(0).max(100),
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
  mealPlan: z.array(z.object({
    day: z.string(),
    meals: z.array(MealSchema)
  })).default([]),
});

export type GenerateRecommendationsInput = z.infer<typeof GenerateRecommendationsInputSchema>;
export type GenerateRecommendationsOutput = z.infer<typeof GenerateRecommendationsOutputSchema>;

const IMAGE_ID_PROMPT = `
ПРАВИЛА ДЛЯ imageUrl: Используйте ТОЛЬКО эти ID: 
1517673400267-0251440c45dc (овсянка), 1525351484163-7529414344d8 (омлет), 
1467003909585-2f8a72700288 (рыба), 1600891964092-4316c2850dbc (стейк), 
1512621776951-a57141f2eefd (салат), 1473093226724-4e24059a9742 (паста).
`;

const recommendationPrompt = ai.definePrompt({
  name: 'personalizedRecommendationPrompt',
  input: {schema: GenerateRecommendationsInputSchema},
  output: {schema: GenerateRecommendationsOutputSchema},
  prompt: `Вы — ведущий мировой ИИ-нутрициолог и биохакер. 
ВАША ЗАДАЧА: Рассчитать точные КБЖУ и составить план питания на основе научно доказанных формул (Mifflin-St Jeor) и предоставленных данных.

КОНТЕКСТ ПОЛЬЗОВАТЕЛЯ:
- Пол: {{gender}}
- Вес: {{weight}} кг
- Рост: {{height}} см
- Возраст: {{age}} лет
- Активность: {{activityLevel}}
- Цель: {{healthGoal}}
- Курение: {{smoking}}, Алкоголь: {{alcohol}}
- Любит: {{favoriteFoods}}, Не любит: {{dislikedFoods}}
{{#if medications}}
- ПРИНИМАЕТ ЛЕКАРСТВА/БАДЫ: {{medications}} (Учтите это, чтобы избежать конфликтов при рекомендации добавок)
{{/if}}

{{#if deviceData}}
БИОМЕТРИЯ СЕГОДНЯ:
- Шаги: {{deviceData.steps}}
- Сон: {{deviceData.sleepDurationHours}}ч
{{/if}}

${IMAGE_ID_PROMPT}

ПРАВИЛА РАСЧЕТА:
1. Рассчитайте TDEE максимально точно для этого конкретного человека.
2. Распределите макронутриенты: Белки (1.8-2.2г на кг текущего веса), Жиры (0.8-1.0г на кг), остальное — Углеводы.
3. BioScore (0-100): Рассчитайте индекс здоровья на основе ИМТ, вредных привычек и биометрии.
4. План питания должен СТРОГО соответствовать рассчитанным макросам.
5. Ответ СТРОГО на русском языке.`,
});

export async function generatePersonalizedRecommendations(input: GenerateRecommendationsInput): Promise<GenerateRecommendationsOutput> {
  return runWithRetry(async () => {
    const {output} = await recommendationPrompt(input, {
      model: googleAI.model('gemini-2.5-flash'),
    });
    if (!output) throw new Error('Ошибка генерации. Попробуйте еще раз.');
    return output;
  }, 3, 2000);
}
