import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { FirebaseClientProvider } from '@/firebase';
import { TelegramInit } from '@/components/telegram-init';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'PRO Себя | Ваш персональный ИИ нутрициолог',
  description: 'Индивидуальные рекомендации по питанию, образу жизни и добавкам на основе ваших данных и анализов.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
        {/* Подключаем скрипт Telegram WebApp для работы Mini App и Deep Linking */}
        <Script 
          src="https://telegram.org/js/telegram-web-app.js" 
          strategy="beforeInteractive" 
        />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <TelegramInit />
          {children}
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
