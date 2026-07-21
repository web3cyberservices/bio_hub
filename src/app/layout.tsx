import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from "@/firebase/client-provider";

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
  description: "Secure High-End VLESS VPN Tunnel.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning className="dark">
      <body className={`${inter.variable} font-sans bg-[#02040a] text-slate-50 antialiased min-h-screen selection:bg-cyan-500/30`} suppressHydrationWarning>
        <FirebaseClientProvider>
          <div className="relative flex min-h-screen flex-col overflow-x-hidden">
            {children}
          </div>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
