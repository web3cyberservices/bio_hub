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
      
      // Force dark mode styles
      const root = document.documentElement;
      root.classList.add('dark');
      
      tg.setHeaderColor('#020617');
      tg.setBackgroundColor('#020617');
    }
  }, []);

  return null;
}