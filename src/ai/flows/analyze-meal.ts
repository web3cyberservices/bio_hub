'use server';
/**
 * @fileOverview Поток Genkit для анализа состава еды по фото или текстовому описанию.
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
  prompt: `Вы — эксперт-нутрициолог. Проанализируйте предоставленные данные о приеме пищи (текст и/или фото) и оцените его состав.
  
  Если предоставлено фото, определите, что на нем изображено. 
  Если предоставлен текст, используйте его как основную информацию.
  
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
    return output!;
  }
);
