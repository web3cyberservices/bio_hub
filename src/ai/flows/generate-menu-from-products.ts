
'use server';
/**
 * @fileOverview Поток Genkit для генерации меню на основе имеющихся у пользователя продуктов.
 * Поддерживает анализ нескольких фотографий.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import { runWithRetry } from './generate-personalized-recommendations';

const MealSchema = z.object({
  time: z.string().describe('Тип блюда (например, "Завтрак", "Обед", "Перекус")'),
  name: z.string().describe('Аппетитное название блюда'),
  description: z.string().describe('Краткое описание приготовления и пользы'),
  calories: z.number().describe('Калорийность'),
  protein: z.number().describe('Белки'),
  fat: z.number().describe('Жиры'),
  carbs: z.number().describe('Углеводы'),
  imageUrl: z.string().describe('Валидная ссылка Unsplash'),
  components: z.array(z.object({
    ingredient: z.string(),
    weight: z.string()
  }))
});

const GenerateMenuInputSchema = z.object({
  products: z.string().optional().describe('Список продуктов текстом.'),
  photoDataUris: z.array(z.string()).optional().describe('Список фото продуктов в формате data URI.'),
  userContext: z.object({
    healthGoal: z.string().optional(),
    dislikedFoods: z.string().optional(),
  }).optional(),
});

export type GenerateMenuInput = z.infer<typeof GenerateMenuInputSchema>;

const IMAGE_ID_PROMPT = `
ПРАВИЛА ДЛЯ imageUrl:
Верните ПОЛНУЮ валидную ссылку Unsplash: https://images.unsplash.com/photo-[ID]?auto=format&fit=crop&w=800&q=80
Используйте ОДИН из этих ID:
- Салат: 1512621776951-a57141f2eefd
- Каша: 1517673400267-0251440c45dc
- Рыба: 1467003909585-2f8a72700288
- Мясо: 1600891964092-4316c2850dbc
- Курица: 1632778149955-e80f8ceca23b
- Смузи: 1505252585461-04db1eb84625
- Яйца: 1525351484163-7529414344d8
- Паста: 1473093226724-4e24059a9742
- Суп: 1547592166903-89826d2d82bb
- Творог: 1481931098708-28308112ef81
- Овощи: 1566190063405-7c74468d62ad
`;

const menuPrompt = ai.definePrompt({
  name: 'generateMenuFromProductsPrompt',
  input: {schema: GenerateMenuInputSchema},
  output: {schema: z.array(MealSchema)},
  prompt: `Вы — креативный шеф-повар и нутрициолог.
ВАША ЗАДАЧА: Предложить 3 варианта блюд, которые можно приготовить из имеющихся продуктов.

СПИСОК ПРОДУКТОВ:
{{#if products}}Текст: {{{products}}}{{/if}}
{{#each photoDataUris}}
Фото продуктов №{{@index}}: {{media url=this}}
{{/each}}

КОНТЕКСТ:
Цель: {{userContext.healthGoal}}.
Исключить: {{userContext.dislikedFoods}}.

${IMAGE_ID_PROMPT}

ОТВЕЧАЙТЕ НА РУССКОМ ЯЗЫКЕ. Предложите максимально разнообразные варианты (например, завтрак, основной прием и легкий перекус).`,
});

export async function generateMenuFromProducts(input: GenerateMenuInput): Promise<z.infer<typeof MealSchema>[]> {
  return runWithRetry(async () => {
    const {output} = await menuPrompt(input, {
      model: googleAI.model('gemini-2.5-flash'),
    });
    if (!output) throw new Error('Не удалось составить меню');
    return output;
  });
}
