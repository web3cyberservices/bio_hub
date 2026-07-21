import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { TelegramInit } from "@/components/telegram-init";
import Script from 'next/script';

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: 'swap',
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#5fad86",
};

export const metadata: Metadata = {
  title: "Cyber Armor VPN | 2026 Premium Edition",
  description: "Ультраскоростной VLESS туннель нового поколения. Защита военного уровня. Версия 2026.",
  icons: {
    icon: "/fonts/favicon180x180.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning className="dark">
      <head>
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
        <style dangerouslySetInnerHTML={{ __html: `
          body { 
            background-color: #5fad86 !important; 
            color: #ffffff !important; 
            margin: 0; 
            padding: 0; 
          }
        `}} />
      </head>
      <body className={`${spaceGrotesk.variable} font-sans bg-[#5fad86] text-white antialiased min-h-screen`}>
        <TelegramInit />
        <div className="relative flex min-h-screen flex-col">
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
