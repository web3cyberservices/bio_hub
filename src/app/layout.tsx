import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { TelegramInit } from "@/components/telegram-init";

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
  themeColor: "#090b11",
};

export const metadata: Metadata = {
  title: "Cyber Armor VPN | 2026 Premium Edition",
  description: "Ультраскоростной VLESS туннель нового поколения. Защита военного уровня. Версия 2026.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning className="dark">
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          body { 
            background-color: #090b11 !important; 
            color: #f1f5f9 !important; 
            margin: 0; 
            padding: 0; 
          }
        `}} />
      </head>
      <body className={`${spaceGrotesk.variable} font-sans bg-[#090b11] text-slate-50 antialiased min-h-screen`}>
        <TelegramInit />
        <div className="relative flex min-h-screen flex-col">
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}