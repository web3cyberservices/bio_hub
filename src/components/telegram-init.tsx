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
      
      // Force extreme dark mode for premium look
      const root = document.documentElement;
      root.classList.add('dark');
      
      // Check version for color methods support (v6.1+)
      if (tg.isVersionAtLeast('6.1')) {
        try {
          tg.setHeaderColor('#090b11');
          tg.setBackgroundColor('#090b11');
          
          if (tg.setBottomBarColor) {
            tg.setBottomBarColor('#090b11');
          }
        } catch (e) {
          console.warn("Telegram UI color customization is not supported in this environment", e);
        }
      }
    }
  }, []);

  return null;
}