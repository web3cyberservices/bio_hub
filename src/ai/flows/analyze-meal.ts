'use server';
/**
 * @fileOverview Оптимизированный анализ еды.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {z} from 'genkit';
import {runWithRetry} from '@/ai/utils';

const AnalyzeMealInputSchema = z.object({
  description: z.string().optional(),
  photoDataUri: z.string().optional(),
  refinement: z.string().optional(),
});
export type AnalyzeMealInput = z.infer<typeof AnalyzeMealInputSchema>;

const AnalyzeMealOutputSchema = z.object({
  mealName: z.string(),
  calories: z.number(),
  protein: z.number(),
  fat: z.number(),
  carbs: z.number(),
  components: z.array(z.object({
    ingredient: z.string(),
    weight: z.string()
  })),
  analysis: z.string().describe('Краткий комментарий на русском'),
});
export type AnalyzeMealOutput = z.infer<typeof AnalyzeMealOutputSchema>;

export async function analyzeMeal(input: AnalyzeMealInput): Promise<AnalyzeMealOutput> {
  return analyzeMealFlow(input);
}

const mealPrompt = ai.definePrompt({
  name: 'analyzeMealPrompt',
  input: {schema: AnalyzeMealInputSchema},
  output: {schema: AnalyzeMealOutputSchema},
  prompt: `Вы — нутрициолог. Определите состав и КБЖУ блюда.
{{#if refinement}}Уточнение (приоритет): {{{refinement}}}{{/if}}
{{#if description}}Описание: {{{description}}}{{/if}}
{{#if photoDataUri}}Фото: {{media url=photoDataUri}}{{/if}}
Правила: Кратко, точно, на русском.`,
});

const analyzeMealFlow = ai.defineFlow(
  {
    name: 'analyzeMealFlow',
    inputSchema: AnalyzeMealInputSchema,
    outputSchema: AnalyzeMealOutputSchema,
  },
  async (input) => {
    return runWithRetry(async () => {
      const {output} = await mealPrompt(input);
      if (!output) throw new Error('Ошибка анализа');
      return output;
    });
  }
);
