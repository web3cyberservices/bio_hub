
'use server';

/**
 * @fileOverview AI-агент для анализа аномалий в логах CyberLog.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeLogInputSchema = z.object({
  logData: z.string().describe('Текст логов или дамб транзакции для анализа.'),
  context: z.string().optional().describe('Дополнительный контекст системы.'),
});

const AnalyzeLogOutputSchema = z.object({
  severity: z.enum(['low', 'medium', 'high', 'critical']).describe('Уровень угрозы.'),
  summary: z.string().describe('Краткое описание проблемы на русском языке.'),
  recommendation: z.string().describe('Рекомендация по устранению.'),
  isAnomaly: z.boolean().describe('Является ли это аномалией.'),
});

export async function analyzeLog(input: z.infer<typeof AnalyzeLogInputSchema>) {
  return analyzeLogFlow(input);
}

const analyzeLogPrompt = ai.definePrompt({
  name: 'analyzeLogPrompt',
  input: { schema: AnalyzeLogInputSchema },
  output: { schema: AnalyzeLogOutputSchema },
  prompt: `Вы — ведущий инженер по безопасности в CyberLog Enterprise.
Ваша задача — проанализировать предоставленные данные логов и выявить признаки взлома, сбоев или аномального поведения.

Данные для анализа:
{{{logData}}}

Контекст:
{{{context}}}

Проведите глубокий аудит и верните результат строго в структурированном формате.`,
});

const analyzeLogFlow = ai.defineFlow(
  {
    name: 'analyzeLogFlow',
    inputSchema: AnalyzeLogInputSchema,
    outputSchema: AnalyzeLogOutputSchema,
  },
  async (input) => {
    const { output } = await analyzeLogPrompt(input);
    if (!output) throw new Error('AI не смог проанализировать данные');
    return output;
  }
);
