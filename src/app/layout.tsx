
import './globals.css';
import type { Viewport, Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Header } from '@/components/Header';
import Link from 'next/link';
import Image from 'next/image';

const inter = Inter({ 
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Web3CyberServices | Платформа приема и анализа телеметрии',
  description: 'Прием телеметрии промышленного уровня для глобальной инфраструктуры.',
};

export const viewport: Viewport = {
  themeColor: '#09090b',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={`${inter.variable} dark`}>
      <body className="bg-background text-foreground min-h-screen flex flex-col font-sans selection:bg-blue-500/30 overflow-x-hidden antialiased">
        <Header />
        <main className="flex-1 w-full max-w-full overflow-x-hidden">
          {children}
        </main>
        <footer className="border-t border-white/[0.08] py-12 mt-20 bg-black/20">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
              <div className="col-span-2 space-y-4">
                <div className="flex items-center gap-3">
                  <Image 
                    src="/512logo.png" 
                    alt="Logo" 
                    width={20} 
                    height={20} 
                    className="opacity-80"
                  />
                  <span className="text-xs font-bold tracking-tight text-white">Web3CyberServices</span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed max-w-xs font-medium tracking-wider">
                  Индустриальная платформа для сбора телеметрии в высоконагруженных глобальных средах.
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="technical-label">Платформа</h4>
                <ul className="space-y-2 text-[10px] text-muted-foreground font-bold tracking-wider">
                  <li><Link href="/portal" className="hover:text-white">Консоль</Link></li>
                  <li><Link href="/pricing" className="hover:text-white">Тарифы</Link></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="technical-label">Правовая информация</h4>
                <ul className="space-y-2 text-[10px] text-muted-foreground font-bold tracking-wider">
                  <li><Link href="/legal" className="hover:text-white">Конфиденциальность</Link></li>
                  <li><Link href="/legal" className="hover:text-white">Условия</Link></li>
                </ul>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-muted-foreground font-mono tracking-widest">
              <div>© 2026 Web3CyberServices. Все права защищены.</div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
