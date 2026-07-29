import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { Shield } from 'lucide-react';

const inter = Inter({ 
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Web3CyberServices | Enterprise Telemetry Platform',
  description: 'Высокопроизводительный сбор логов и телеметрии для бизнеса.',
  icons: {
    icon: 'https://picsum.photos/seed/web3-logo/32/32',
    apple: 'https://picsum.photos/seed/web3-logo/180/180',
  }
};

export const viewport: Viewport = {
  themeColor: '#2563eb',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={`${inter.variable} dark`}>
      <body className="bg-background text-foreground min-h-screen flex flex-col font-sans">
        <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-md">
          <div className="container mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Shield className="w-5 h-5 text-white fill-white/10" />
              </div>
              <span className="font-black text-xl tracking-tighter text-white">Web3CyberServices</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-neutral-400">
              <Link href="/dashboard" className="hover:text-white transition-colors">Консоль</Link>
              <Link href="/api-docs" className="hover:text-white transition-colors">Документация</Link>
              <Link href="/pricing" className="hover:text-white transition-colors">Тарифы</Link>
            </nav>

            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-[11px] font-bold uppercase tracking-wider hover:text-white transition-colors">
                Войти
              </Link>
              <Link href="/dashboard" className="bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-black uppercase tracking-widest py-2 px-5 rounded-lg transition-all shadow-lg shadow-blue-600/20">
                Доступ
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1">
          {children}
        </main>

        <footer className="border-t border-white/5 py-12 mt-20">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="col-span-2 md:col-span-1 space-y-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-black tracking-tight uppercase">Web3CyberServices</span>
                </div>
                <p className="text-[11px] text-neutral-500 leading-relaxed max-w-xs font-medium">
                  Платформа промышленного уровня для мониторинга инфраструктуры и анализа больших данных в реальном времени.
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Продукт</h4>
                <ul className="space-y-2 text-[11px] text-neutral-500 font-bold">
                  <li><Link href="/dashboard" className="hover:text-white transition-colors">Консоль</Link></li>
                  <li><Link href="/pricing" className="hover:text-white transition-colors">Тарифы</Link></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Ресурсы</h4>
                <ul className="space-y-2 text-[11px] text-neutral-500 font-bold">
                  <li><Link href="/api-docs" className="hover:text-white transition-colors">Документация</Link></li>
                  <li><Link href="/legal" className="hover:text-white transition-colors">Правовая информация</Link></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Компания</h4>
                <ul className="space-y-2 text-[11px] text-neutral-500 font-bold">
                  <li><Link href="#" className="hover:text-white transition-colors">О нас</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">Контакты</Link></li>
                </ul>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-neutral-500 font-bold uppercase tracking-widest">
              <div>© 2026 Web3CyberServices. All Rights Reserved.</div>
              <div className="flex gap-6">
                <Link href="/legal" className="hover:text-white">SLA</Link>
                <Link href="/legal" className="hover:text-white">Privacy</Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}