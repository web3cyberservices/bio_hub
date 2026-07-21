
'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    Telegram?: {
      WebApp: any;
    };
  }
}

export function TelegramInit() {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      
      // Безопасная установка цветов без HSL конфликтов
      const root = document.documentElement;
      if (tg.themeParams?.bg_color) {
        root.style.setProperty('--background', tg.themeParams.bg_color);
      }
      if (tg.themeParams?.text_color) {
        root.style.setProperty('--foreground', tg.themeParams.text_color);
      }
      if (tg.themeParams?.button_color) {
        root.style.setProperty('--primary', tg.themeParams.button_color);
      }
      
      tg.setHeaderColor(tg.themeParams?.header_bg_color || '#020617');
      tg.setBackgroundColor(tg.themeParams?.bg_color || '#020617');
    }
  }, []);

  return null;
}
