'use server';
/**
 * @fileOverview Оптимизированный поток чата с ИИ-специалистом.
 * - Ограничение истории до 6 сообщений для экономии токенов.
 * - Сжатые системные инструкции.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {runWithRetry} from '@/ai/utils';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const AISpecialistChatInputSchema = z.object({
  message: z.string().describe('Сообщение пользователя'),
  history: z.array(ChatMessageSchema).default([]),
  userContext: z.object({
    healthGoal: z.string().optional(),
    weight: z.number().optional(),
    activityLevel: z.string().optional(),
  }).optional(),
});
export type AISpecialistChatInput = z.infer<typeof AISpecialistChatInputSchema>;

const AISpecialistChatOutputSchema = z.object({
  text: z.string().describe('Ответ специалиста'),
});
export type AISpecialistChatOutput = z.infer<typeof AISpecialistChatOutputSchema>;

export async function chatWithSpecialist(input: AISpecialistChatInput): Promise<AISpecialistChatOutput> {
  return aiSpecialistChatFlow(input);
}

const specialistPrompt = ai.definePrompt({
  name: 'specialistChatPrompt',
  input: {schema: AISpecialistChatInputSchema},
  output: {schema: AISpecialistChatOutputSchema},
  prompt: `Вы — эксперт PRO Себя (биохакинг/нутрициология). 
Контекст: {{#if userContext}}Цель: {{userContext.healthGoal}}, Вес: {{userContext.weight}}кг, Активность: {{userContext.activityLevel}}{{/if}}
Правила: Кратко, профессионально, на русском.

История:
{{#each history}}
{{role}}: {{content}}
{{/each}}
user: {{message}}`,
});

const aiSpecialistChatFlow = ai.defineFlow(
  {
    name: 'aiSpecialistChatFlow',
    inputSchema: AISpecialistChatInputSchema,
    outputSchema: AISpecialistChatOutputSchema,
  },
  async (input) => {
    // Оптимизация: берем только последние 6 сообщений истории
    const optimizedHistory = input.history.slice(-6);
    
    return runWithRetry(async () => {
      const {output} = await specialistPrompt({
        ...input,
        history: optimizedHistory
      }, {
        model: googleAI.model('gemini-2.5-flash'),
      });
      if (!output) throw new Error('Ошибка связи');
      return output;
    });
  }
);