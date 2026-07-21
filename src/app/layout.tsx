import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

// Используем Montserrat как надежную альтернативу TT Fors, пока файл не загружен
const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  variable: "--font-tt-fors", // Сохраняем переменную для совместимости с CSS
  display: 'swap',
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#02040a",
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
            background-color: #02040a !important; 
            color: #f1f5f9 !important; 
            margin: 0; 
            padding: 0; 
          }
        `}} />
      </head>
      <body className={`${montserrat.variable} font-sans bg-[#02040a] text-slate-50 antialiased min-h-screen`}>
        <div className="relative flex min-h-screen flex-col">
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
