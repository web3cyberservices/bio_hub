import type {Metadata, Viewport} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { TelegramInit } from '@/components/telegram-init';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Bio Hub Pro | Ваш персональный ИИ нутрициолог',
  description: 'Индивидуальные рекомендации по питанию, образу жизни и добавкам на основе ваших данных и анализов.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: 'https://placehold.co/32x32/010411/00ffff?text=🧬',
    apple: 'https://placehold.co/180x180/010411/00ffff?text=🧬',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Bio Hub Pro',
  }
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
        <Script 
          src="https://telegram.org/js/telegram-web-app.js" 
          strategy="beforeInteractive" 
        />
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(
                  function(registration) { console.log('SW registered: ', registration.scope); },
                  function(err) { console.log('SW registration failed: ', err); }
                );
              });
            }
          `
        }} />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <FirebaseClientProvider>
          <TelegramInit />
          {children}
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
