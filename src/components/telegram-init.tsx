'use client';
/**
 * @fileOverview Обработчик инициализации Telegram Mini App и глубоких ссылок.
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function TelegramInit() {
  const router = useRouter();

  useEffect(() => {
    // Безопасный доступ к объекту Telegram WebApp
    const tg = (window as any)?.Telegram?.WebApp;
    
    if (tg) {
      // Сообщаем Telegram, что приложение готово
      tg.ready();
      // Расширяем приложение на все доступное пространство
      tg.expand();
      
      // Извлекаем параметр старта (ID специалиста из startapp)
      // В Telegram WebApp параметр startapp попадает в start_param
      const startParam = tg.initDataUnsafe?.start_param;

      if (startParam) {
        console.log("[TELEGRAM-DEEP-LINK] Обнаружен ID специалиста:", startParam);
        
        // Автоматический редирект на страницу специалиста
        // Используем replace, чтобы не забивать историю переходов
        router.replace(`/specialist/${startParam}`);
      }
    }
  }, [router]);

  return null;
}
