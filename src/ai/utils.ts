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
      // Если общее время выполнения превысило 2 минуты, прекращаем попытки
      if (Date.now() - actionStartTime > 120000) {
        throw new Error('Превышено время ожидания ИИ (2 мин). Попробуйте упростить запрос или сделать фото четче.');
      }
      
      console.warn(`AI Retry attempt ${i + 1}/${maxRetries} error:`, error.message);
      
      // Экспоненциальная задержка + случайный фактор
      const delay = initialDelay * Math.pow(2, i) + (Math.random() * 1000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('ИИ временно перегружен запросами. Пожалуйста, подождите 30 секунд и попробуйте снова.');
}
