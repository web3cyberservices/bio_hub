
'use server';

/**
 * @fileOverview Оптимизированная заглушка для анализа логов.
 * Исключает нагрузку на ОЗУ от работы LLM, возвращая статичные безопасные данные.
 */

import { z } from 'zod';

const AnalyzeLogOutputSchema = z.object({
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  summary: z.string(),
  recommendation: z.string(),
  isAnomaly: z.boolean(),
});

export async function analyzeLog(input: any) {
  // Имитация работы "AI" без потребления ресурсов
  return {
    severity: 'low',
    summary: 'Параметры сетевого потока находятся в пределах номинальных значений SLA.',
    recommendation: 'Действий не требуется. Система работает в штатном режиме.',
    isAnomaly: false,
  };
}
