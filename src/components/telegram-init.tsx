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
      
      tg.setHeaderColor('#02040a');
      tg.setBackgroundColor('#02040a');
      
      // Inform TG about primary theme color
      if (tg.setBottomBarColor) {
        tg.setBottomBarColor('#02040a');
      }
    }
  }, []);

  return null;
}