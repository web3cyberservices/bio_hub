/**
 * @fileOverview Общие утилиты для ИИ-потоков.
 * Оптимизировано для работы в условиях жестких таймаутов Next.js (120с).
 */

/**
 * Функция для повторных попыток выполнения ИИ-запросов с экспоненциальной задержкой.
 * Предотвращает ошибку "An unexpected response was received from the server"
 * путем контроля общего времени выполнения.
 */
export async function runWithRetry<T>(fn: () => Promise<T>, maxRetries = 5, initialDelay = 2000): Promise<T> {
  const actionStartTime = Date.now();
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      const errorMsg = error.message?.toLowerCase() || '';
      
      // Список временных ошибок, которые стоит переповторить
      const isTransient = 
        errorMsg.includes('429') || 
        errorMsg.includes('quota') || 
        errorMsg.includes('overload') || 
        errorMsg.includes('503') || 
        errorMsg.includes('timeout') ||
        errorMsg.includes('deadline') ||
        errorMsg.includes('unexpected response') ||
        errorMsg.includes('socket');
      
      // Список фатальных ошибок (некорректный ввод, не найдено и т.д.)
      const isFatal = 
        errorMsg.includes('400') || 
        errorMsg.includes('invalid') || 
        errorMsg.includes('not found') ||
        errorMsg.includes('permission');

      if (isFatal && !isTransient) {
        throw error;
      }

      // КРИТИЧЕСКИЙ ПРЕДОХРАНИТЕЛЬ:
      // Если прошло более 80 секунд, мы должны прекратить попытки.
      // Это позволяет вернуть ошибку пользователю до того, как Next.js (120с) или Vercel (60-120с)
      // принудительно обрубят соединение с ошибкой 504/500.
      if (Date.now() - actionStartTime > 80000) {
        throw new Error('ИИ временно перегружен. Пожалуйста, попробуйте отправить запрос еще раз через минуту.');
      }
      
      console.warn(`AI Retry attempt ${i + 1}/${maxRetries} error:`, error.message);
      
      // Экспоненциальная задержка с случайным фактором (jitter)
      // 2s, 4s, 8s...
      const baseDelay = isTransient ? initialDelay : initialDelay / 2;
      const delay = baseDelay * Math.pow(2, i) + (Math.random() * 2000);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Сервис временно недоступен из-за высокой нагрузки. Пожалуйста, повторите попытку позже.');
}
