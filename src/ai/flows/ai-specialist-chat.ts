'use server';
/**
 * @fileOverview Поток Genkit для чата с ИИ-специалистом по биохакингу и нутрициологии.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const AISpecialistChatInputSchema = z.object({
  message: z.string().describe('Сообщение от пользователя.'),
  history: z.array(ChatMessageSchema).default([]).describe('История переписки.'),
  userContext: z.object({
    healthGoal: z.string().optional(),
    weight: z.number().optional(),
    activityLevel: z.string().optional(),
  }).optional(),
});
export type AISpecialistChatInput = z.infer<typeof AISpecialistChatInputSchema>;

const AISpecialistChatOutputSchema = z.object({
  text: z.string().describe('Ответ ИИ-специалиста.'),
});
export type AISpecialistChatOutput = z.infer<typeof AISpecialistChatOutputSchema>;

export async function chatWithSpecialist(input: AISpecialistChatInput): Promise<AISpecialistChatOutput> {
  return aiSpecialistChatFlow(input);
}

const specialistPrompt = ai.definePrompt({
  name: 'specialistChatPrompt',
  input: {schema: AISpecialistChatInputSchema},
  output: {schema: AISpecialistChatOutputSchema},
  prompt: `Вы — ИИ-специалист платформы "PRO Себя", эксперт в области биохакинга, нутрициологии и функциональной медицины.

ВАША МИССИЯ:
Помогать пользователю оптимизировать его здоровье, объяснять сложные медицинские концепции простым языком и давать практические советы.

КОНТЕКСТ ПОЛЬЗОВАТЕЛЯ:
{{#if userContext}}
- Цель: {{userContext.healthGoal}}
- Вес: {{userContext.weight}} кг
- Активность: {{userContext.activityLevel}}
{{/if}}

ПРАВИЛА ОБЩЕНИЯ:
1. Будьте профессиональны, но эмпатичны.
2. Используйте доказательный подход (EBM).
3. Не ставьте окончательных диагнозов, рекомендуйте консультацию с врачом при серьезных жалобах.
4. Отвечайте СТРОГО на русском языке.

ИСТОРИЯ ПЕРЕПИСКИ:
{{#each history}}
{{role}}: {{content}}
{{/each}}

ТЕКУЩЕЕ СООБЩЕНИЕ:
user: {{message}}`,
});

const aiSpecialistChatFlow = ai.defineFlow(
  {
    name: 'aiSpecialistChatFlow',
    inputSchema: AISpecialistChatInputSchema,
    outputSchema: AISpecialistChatOutputSchema,
  },
  async (input) => {
    const {output} = await specialistPrompt(input);
    if (!output) throw new Error('Не удалось получить ответ от специалиста');
    return output;
  }
);
