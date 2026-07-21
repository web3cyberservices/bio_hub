
import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { TelegramInit } from "@/components/telegram-init";
import Script from 'next/script';

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
};

export const metadata: Metadata = {
  title: "Bio Hub Pro | Ваш персональный ИИ нутрициолог",
  description: "Индивидуальные рекомендации по питанию, образу жизни и добавкам на основе ваших данных и анализов.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    title: "Bio Hub Pro",
    statusBarStyle: "default",
    capable: true,
  },
  other: {
    "mobile-web-app-capable": "yes",
    "google-site-verification": "google-site-verification-code-here"
  }
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
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(
                  function(registration) { console.log('SW registered: ', registration.scope); },
                  function(err) { console.log('SW registration failed: ', err); }
                );
              });
            }
          `,
          }}
        />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-body antialiased`} suppressHydrationWarning>
        <FirebaseClientProvider>
          <TelegramInit />
          {children}
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
