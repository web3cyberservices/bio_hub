
'use client';

import { useEffect } from 'react';

export function TelegramInit() {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      
      // Set theme colors based on Telegram theme
      const root = document.documentElement;
      if (tg.themeParams.bg_color) {
        root.style.setProperty('--background', tg.themeParams.bg_color);
      }
      if (tg.themeParams.text_color) {
        root.style.setProperty('--foreground', tg.themeParams.text_color);
      }
    }
  }, []);

  return null;
}
