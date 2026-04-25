'use server';
/**
 * @fileOverview Оптимизированная генерация меню.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
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
  components: z.array(z.object({ ingredient: z.string(), weight: z.string() }))
});

const GenerateMenuInputSchema = z.object({
  products: z.string().optional(),
  photoDataUris: z.array(z.string()).optional(),
  userContext: z.object({
    healthGoal: z.string().optional(),
    dislikedFoods: z.string().optional(),
  }).optional(),
});

export type GenerateMenuInput = z.infer<typeof GenerateMenuInputSchema>;

const IMAGE_ID_PROMPT = `imageUrl: https://images.unsplash.com/photo-[ID]?auto=format&fit=crop&w=800&q=80
IDs: Салат:1512621776951-a57141f2eefd, Каша:1517673400267-0251440c45dc, Рыба:1467003909585-2f8a72700288, Мясо:1600891964092-4316c2850dbc, Курица:1632778149955-e80f8ceca23b, Яйца:1525351484163-7529414344d8, Паста:1473093226724-4e24059a9742, Суп:1547592166903-89826d2d82bb.`;

const menuPrompt = ai.definePrompt({
  name: 'generateMenuFromProductsPrompt',
  input: {schema: GenerateMenuInputSchema},
  output: {schema: z.array(MealSchema)},
  prompt: `Вы — шеф-повар. Предложите 3 блюда из имеющихся продуктов.
Продукты: {{products}}
{{#each photoDataUris}}Фото: {{media url=this}}{{/each}}
Контекст: Цель {{userContext.healthGoal}}, без {{userContext.dislikedFoods}}.
${IMAGE_ID_PROMPT}
На русском.`,
});

export async function generateMenuFromProducts(input: GenerateMenuInput): Promise<z.infer<typeof MealSchema>[]> {
  return runWithRetry(async () => {
    const {output} = await menuPrompt(input);
    if (!output) throw new Error('Ошибка генерации меню');
    return output;
  });
}
