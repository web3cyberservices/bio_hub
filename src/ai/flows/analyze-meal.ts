'use server';
/**
 * @fileOverview Поток Genkit для анализа состава еды по фото или текстовому описанию с поддержкой уточнений.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeMealInputSchema = z.object({
  description: z.string().optional().describe('Текстовое описание приема пищи.'),
  photoDataUri: z
    .string()
    .optional()
    .describe(
      "Фото еды в формате data URI. Ожидаемый формат: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  refinement: z.string().optional().describe('Уточнение пользователя к предыдущему анализу (например, исправление состава или объема).'),
});
export type AnalyzeMealInput = z.infer<typeof AnalyzeMealInputSchema>;

const AnalyzeMealOutputSchema = z.object({
  mealName: z.string().describe('Название распознанного блюда.'),
  calories: z.number().describe('Примерная калорийность (ккал).'),
  protein: z.number().describe('Белки (г).'),
  fat: z.number().describe('Жиры (г).'),
  carbs: z.number().describe('Углеводы (г).'),
  analysis: z.string().describe('Краткий комментарий диетолога по этому блюду.'),
});
export type AnalyzeMealOutput = z.infer<typeof AnalyzeMealOutputSchema>;

export async function analyzeMeal(input: AnalyzeMealInput): Promise<AnalyzeMealOutput> {
  return analyzeMealFlow(input);
}

const mealPrompt = ai.definePrompt({
  name: 'analyzeMealPrompt',
  input: {schema: AnalyzeMealInputSchema},
  output: {schema: AnalyzeMealOutputSchema},
  prompt: `Вы — эксперт-нутрициолог мирового уровня с глубоким пониманием кухни стран СНГ (борщи, котлеты, каши, выпечка). 
  Проанализируйте предоставленные данные о приеме пищи (текст и/или фото) и оцените его состав.
  
  Если предоставлено фото, определите, что на нем изображено, учитывая возможную многослойность и скрытые ингредиенты (соусы, заправки). 
  Если предоставлен текст, используйте его как приоритетную информацию.
  
  {{#if refinement}}
  ВАЖНО: Пользователь предоставил уточнение к предыдущему анализу: "{{{refinement}}}". 
  Скорректируйте КБЖУ и название блюда на основе этого уточнения. Например, если пользователь говорит "там было больше мяса", увеличьте белки и калории.
  {{/if}}

  ОТВЕЧАЙТЕ СТРОГО НА РУССКОМ ЯЗЫКЕ.
  
  Описание: {{{description}}}
  {{#if photoDataUri}}Фото: {{media url=photoDataUri}}{{/if}}`,
});

const analyzeMealFlow = ai.defineFlow(
  {
    name: 'analyzeMealFlow',
    inputSchema: AnalyzeMealInputSchema,
    outputSchema: AnalyzeMealOutputSchema,
  },
  async (input) => {
    const {output} = await mealPrompt(input);
    if (!output) throw new Error('Не удалось проанализировать блюдо');
    return output;
  }
);
