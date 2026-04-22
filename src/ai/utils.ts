/**
 * @fileOverview Общие утилиты для ИИ-потоков.
 */

/**
 * Функция для повторных попыток выполнения ИИ-запросов с экспоненциальной задержкой.
 */
export async function runWithRetry<T>(fn: () => Promise<T>, maxRetries = 3, initialDelay = 3000): Promise<T> {
  const actionStartTime = Date.now();
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      // Если это ошибка квоты или перегрузки, увеличиваем задержку
      const isOverload = error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('overloaded');
      
      // Если общее время выполнения превысило 1.5 минуты, прекращаем попытки, чтобы не упасть по таймауту Next.js
      if (Date.now() - actionStartTime > 90000) {
        throw new Error('Превышено время ожидания ИИ. Пожалуйста, попробуйте сделать запрос позже или упростите его.');
      }
      
      console.warn(`AI Retry attempt ${i + 1}/${maxRetries} error:`, error.message);
      
      // Экспоненциальная задержка + случайный фактор (jitter)
      const baseDelay = isOverload ? initialDelay * 2 : initialDelay;
      const delay = baseDelay * Math.pow(2, i) + (Math.random() * 2000);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('ИИ временно перегружен. Пожалуйста, подождите минуту и попробуйте снова.');
}
