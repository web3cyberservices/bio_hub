/**
 * @fileOverview Общие утилиты для ИИ-потоков.
 * Оптимизировано для работы в условиях жестких таймаутов Next.js (120с)
 * и прозрачной обработки лимитов API (квот).
 */

/**
 * Функция для повторных попыток выполнения ИИ-запросов с экспоненциальной задержкой.
 */
export async function runWithRetry<T>(fn: () => Promise<T>, maxRetries = 5, initialDelay = 2000): Promise<T> {
  const actionStartTime = Date.now();
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      const errorMsg = error.message?.toLowerCase() || '';
      
      // 1. Проверка на исчерпание лимитов (Quota / 429)
      const isQuotaExceeded = errorMsg.includes('429') || errorMsg.includes('quota') || errorMsg.includes('limit');
      
      if (isQuotaExceeded) {
        throw new Error('Вы исчерпали лимит бесплатных запросов к ИИ. Пожалуйста, подождите 1-2 минуты и попробуйте снова.');
      }

      // 2. Список временных ошибок, которые стоит переповторить (503, таймауты)
      const isTransient = 
        errorMsg.includes('503') || 
        errorMsg.includes('overload') || 
        errorMsg.includes('timeout') ||
        errorMsg.includes('deadline') ||
        errorMsg.includes('unexpected response') ||
        errorMsg.includes('socket');
      
      // 3. Список фатальных ошибок (некорректный ввод, не найдено)
      const isFatal = 
        errorMsg.includes('400') || 
        errorMsg.includes('invalid') || 
        errorMsg.includes('not found') ||
        errorMsg.includes('permission');

      if (isFatal && !isTransient) {
        throw error;
      }

      // КРИТИЧЕСКИЙ ПРЕДОХРАНИТЕЛЬ:
      // Если прошло более 85 секунд, прекращаем попытки, чтобы вернуть ответ клиенту.
      if (Date.now() - actionStartTime > 85000) {
        throw new Error('ИИ-модуль не ответил вовремя. Попробуйте сделать фото четче или сократить текст.');
      }
      
      console.warn(`AI Retry attempt ${i + 1}/${maxRetries} error:`, error.message);
      
      // Экспоненциальная задержка с случайным фактором (jitter)
      const baseDelay = isTransient ? initialDelay : initialDelay / 2;
      const delay = baseDelay * Math.pow(2, i) + (Math.random() * 2000);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Сервис временно недоступен из-за высокой нагрузки. Пожалуйста, повторите попытку позже.');
}
