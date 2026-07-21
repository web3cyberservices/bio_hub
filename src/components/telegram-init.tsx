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
      
      const root = document.documentElement;
      root.classList.add('dark');
      
      if (tg.isVersionAtLeast('6.1')) {
        try {
          // HEX #5fad86
          tg.setHeaderColor('#5fad86');
          tg.setBackgroundColor('#5fad86');
          
          if (tg.setBottomBarColor) {
            tg.setBottomBarColor('#5fad86');
          }
        } catch (e) {
          console.warn("Telegram UI color customization is not supported in this environment", e);
        }
      }
    }
  }, []);

  return null;
}
