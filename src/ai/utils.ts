/**
 * @fileOverview Общие утилиты для ИИ-потоков.
 */

/**
 * Функция для повторных попыток выполнения ИИ-запросов с экспоненциальной задержкой.
 * Оптимизирована для работы в условиях высокой нагрузки и предотвращения таймаутов Next.js.
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
        errorMsg.includes('deadline') ||
        errorMsg.includes('unexpected response');
      
      // Если это фатальная ошибка (например, 400 Bad Request), нет смысла пробовать снова
      const isFatal = errorMsg.includes('400') || errorMsg.includes('invalid') || errorMsg.includes('not found');

      if (isFatal && !isTransient) {
        throw error;
      }

      // КРИТИЧЕСКИЙ МОМЕНТ: Если общее время выполнения превысило 80 секунд, 
      // прекращаем попытки, чтобы гарантированно ответить пользователю до таймаута Next.js (120с).
      // Это предотвращает ошибку "An unexpected response was received from the server".
      if (Date.now() - actionStartTime > 80000) {
        throw new Error('ИИ временно перегружен. Пожалуйста, попробуйте отправить запрос еще раз через минуту.');
      }
      
      console.warn(`AI Retry attempt ${i + 1}/${maxRetries} error:`, error.message);
      
      // Экспоненциальная задержка: 2s, 4s, 8s... + случайный фактор (jitter)
      const baseDelay = isTransient ? initialDelay : initialDelay / 2;
      const delay = baseDelay * Math.pow(2, i) + (Math.random() * 2000);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Сервис временно недоступен из-за высокой нагрузки. Пожалуйста, повторите попытку позже.');
}
