/**
 * @fileOverview Общие утилиты для ИИ-потоков.
 */

/**
 * Функция для повторных попыток выполнения ИИ-запросов с экспоненциальной задержкой.
 * Оптимизирована для работы в условиях высокой нагрузки.
 */
export async function runWithRetry<T>(fn: () => Promise<T>, maxRetries = 5, initialDelay = 2000): Promise<T> {
  const actionStartTime = Date.now();
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      const errorMsg = error.message?.toLowerCase() || '';
      
      // Проверяем, является ли ошибка временной (перегрузка, квоты, таймауты)
      const isTransient = 
        errorMsg.includes('429') || 
        errorMsg.includes('quota') || 
        errorMsg.includes('overload') || 
        errorMsg.includes('503') || 
        errorMsg.includes('timeout') ||
        errorMsg.includes('deadline');
      
      // Если это фатальная ошибка (например, 400 Bad Request), нет смысла пробовать снова
      const isFatal = errorMsg.includes('400') || errorMsg.includes('invalid') || errorMsg.includes('not found');

      if (isFatal && !isTransient) {
        throw error;
      }

      // Если общее время выполнения превысило 100 секунд, прекращаем попытки, чтобы не упасть по таймауту Next.js (120с)
      if (Date.now() - actionStartTime > 100000) {
        throw new Error('Превышено время ожидания ИИ. Пожалуйста, попробуйте сделать запрос позже или упростите его.');
      }
      
      console.warn(`AI Retry attempt ${i + 1}/${maxRetries} error:`, error.message);
      
      // Экспоненциальная задержка: 2s, 4s, 8s, 16s... + случайный фактор (jitter)
      const baseDelay = isTransient ? initialDelay : initialDelay / 2;
      const delay = baseDelay * Math.pow(2, i) + (Math.random() * 2000);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('ИИ временно перегружен запросами. Пожалуйста, подождите минуту и попробуйте снова.');
}
