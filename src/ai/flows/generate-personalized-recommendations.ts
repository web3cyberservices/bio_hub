'use server';
/**
 * @fileOverview Оптимизированная генерация рекомендаций.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {z} from 'genkit';
import {runWithRetry} from '@/ai/utils';

const MealSchema = z.object({
  time: z.string(),
  name: z.string(),
  description: z.string(),
  calories: z.number(),
  protein: z.number(),
  fat: z.number(),
  carbs: z.number(),
  imageUrl: z.string(),
  components: z.array(z.object({ ingredient: z.string(), weight: z.string() })).default([])
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
  medications: z.string().optional(),
  deviceData: z.object({
    steps: z.number().optional(),
    sleepDurationHours: z.number().optional(),
  }).optional(),
});

const GenerateRecommendationsOutputSchema = z.object({
  bioScore: z.number().min(0).max(100),
  recommendations: z.object({ lifestyle: z.string(), diet: z.string(), supplements: z.string() }),
  macros: z.object({ calories: z.number(), protein: z.number(), fat: z.number(), carbs: z.number() }),
  mealPlan: z.array(z.object({ day: z.string(), meals: z.array(MealSchema) })).default([]),
});

export type GenerateRecommendationsInput = z.infer<typeof GenerateRecommendationsInputSchema>;
export type GenerateRecommendationsOutput = z.infer<typeof GenerateRecommendationsOutputSchema>;

const IMAGE_ID_PROMPT = `imageUrl IDs: 1517673400267-0251440c45dc (овсянка), 1525351484163-7529414344d8 (омлет), 1467003909585-2f8a72700288 (рыба), 1600891964092-4316c2850dbc (стейк), 1512621776951-a57141f2eefd (салат), 1473093226724-4e24059a9742 (паста).`;

const recommendationPrompt = ai.definePrompt({
  name: 'personalizedRecommendationPrompt',
  input: {schema: GenerateRecommendationsInputSchema},
  output: {schema: GenerateRecommendationsOutputSchema},
  prompt: `Вы — ИИ-диетолог. Рассчитайте КБЖУ и план питания.
Методы: Mifflin-St Jeor + Harris-Benedict.
Данные: Пол {{gender}}, {{weight}}кг, {{height}}см, {{age}}л, Активность {{activityLevel}}, Цель {{healthGoal}}, Лекарства: {{medications}}.
${IMAGE_ID_PROMPT}
Правила: 1. Точные макросы (Белки 1.8-2.2г/кг). 2. BioScore 0-100. 3. На русском.`,
});

export async function generatePersonalizedRecommendations(input: GenerateRecommendationsInput): Promise<GenerateRecommendationsOutput> {
  return runWithRetry(async () => {
    const {output} = await recommendationPrompt(input);
    if (!output) throw new Error('Ошибка генерации');
    return output;
  }, 2);
}
