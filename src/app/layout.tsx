import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#02040a",
};

export const metadata: Metadata = {
  title: "VPN PRO Premium",
  description: "Защищенный высокоскоростной VLESS туннель для доступа к сети.",
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
            font-family: sans-serif; 
          }
        `}} />
      </head>
      <body className={`${inter.variable} font-sans bg-[#02040a] text-slate-50 antialiased min-h-screen`}>
        <div className="relative flex min-h-screen flex-col">
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
