
/**
 * @fileOverview Общие утилиты для ИИ-потоков.
 */

/**
 * Функция для повторных попыток выполнения ИИ-запросов с экспоненциальной задержкой.
 */
export async function runWithRetry<T>(fn: () => Promise<T>, maxRetries = 5, initialDelay = 4000): Promise<T> {
  const actionStartTime = Date.now();
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      // Если это ошибка квоты или перегрузки, увеличиваем задержку
      const isOverload = error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('overloaded');
      
      // Если общее время выполнения превысило 2.5 минуты, прекращаем попытки
      if (Date.now() - actionStartTime > 150000) {
        throw new Error('Превышено время ожидания ИИ. Попробуйте упростить запрос или сделать фото четче.');
      }
      
      console.warn(`AI Retry attempt ${i + 1}/${maxRetries} error:`, error.message);
      
      // Экспоненциальная задержка + случайный фактор (jitter)
      // Для перегрузки (isOverload) используем более длинную паузу
      const baseDelay = isOverload ? initialDelay * 2 : initialDelay;
      const delay = baseDelay * Math.pow(2, i) + (Math.random() * 2000);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('ИИ временно перегружен запросами из-за высокой активности. Пожалуйста, подождите немного и попробуйте снова.');
}
