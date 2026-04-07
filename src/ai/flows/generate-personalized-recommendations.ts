'use server';
/**
 * @fileOverview A Genkit flow for generating personalized nutrition and lifestyle recommendations.
 *
 * - generatePersonalizedRecommendations - A function that handles the generation of recommendations.
 * - GenerateRecommendationsInput - The input type for the generatePersonalizedRecommendations function.
 * - GenerateRecommendationsOutput - The return type for the generatePersonalizedRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRecommendationsInputSchema = z.object({
  weight: z.number().positive().describe('Current weight in kilograms.'),
  height: z.number().positive().describe('Current height in centimeters.'),
  age: z.number().int().min(1).describe('Current age in years.'),
  activityLevel:
    z.enum([
      'малоактивный',
      'среднеактивный',
      'средний',
      'активный',
      'перенагрузка',
    ])
    .describe('User\u0027s activity level.'),
  healthGoal:
    z.enum([
      'снизить массу тела',
      'поддержать текущее состояние',
      'набор массы',
    ])
    .describe('User\u0027s primary health goal.'),
  dietaryInput: z
    .string()
    .optional()
    .describe('Optional free-form text describing daily food intake.'),
  labResultsInput: z
    .string()
    .optional()
    .describe('Optional free-form text describing recent lab analysis results.'),
});
export type GenerateRecommendationsInput = z.infer<
  typeof GenerateRecommendationsInputSchema
>;

const GenerateRecommendationsOutputSchema = z.object({
  recommendations: z.object({
    lifestyle:
      z.string().describe('Personalized lifestyle recommendations.'),
    diet:
      z.string().describe('Personalized dietary recommendations including food choices.'),
    supplements:
      z.string().describe('Personalized vitamin and supplement recommendations.'),
  }),
});
export type GenerateRecommendationsOutput = z.infer<
  typeof GenerateRecommendationsOutputSchema
>;

export async function generatePersonalizedRecommendations(
  input: GenerateRecommendationsInput
): Promise<GenerateRecommendationsOutput> {
  return generateRecommendationsFlow(input);
}

const recommendationPrompt = ai.definePrompt({
  name: 'personalizedRecommendationPrompt',
  input: {schema: GenerateRecommendationsInputSchema},
  output: {schema: GenerateRecommendationsOutputSchema},
  prompt: `You are an AI nutritionist, an expert in health and wellness. Your task is to provide personalized, context-aware, and actionable recommendations for lifestyle adjustments, diet plans, and suitable vitamin/supplement intake to improve health.

User's Health Profile:
- Weight: {{{weight}}} kg
- Height: {{{height}}} cm
- Age: {{{age}}} years
- Activity Level: {{{activityLevel}}}
- Health Goal: {{{healthGoal}}}

{{#if dietaryInput}}
User's Provided Food Intake:
{{{dietaryInput}}}
{{/if}}

{{#if labResultsInput}}
User's Provided Lab Analysis Results:
{{{labResultsInput}}}
{{/if}}

Based on all the provided information, generate comprehensive and personalized recommendations. Clearly explain the reasoning behind your suggestions. If optional dietary or lab results are provided, make sure to integrate them into your analysis and recommendations.`,
});

const generateRecommendationsFlow = ai.defineFlow(
  {
    name: 'generateRecommendationsFlow',
    inputSchema: GenerateRecommendationsInputSchema,
    outputSchema: GenerateRecommendationsOutputSchema,
  },
  async (input) => {
    const {output} = await recommendationPrompt(input);
    return output!;
  }
);
