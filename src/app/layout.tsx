import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';

const inter = Inter({ 
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'CyberLog Enterprise | Платформа анализа данных',
  description: 'Высокопроизводительный сбор логов и телеметрии для бизнеса.',
};

export const viewport: Viewport = {
  themeColor: '#000000',
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
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center font-bold text-white text-xs">
                CL
              </div>
              <span className="font-bold text-lg tracking-tight">CyberLog</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-400">
              <Link href="/dashboard" className="hover:text-white transition-colors">Консоль</Link>
              <Link href="/api-docs" className="hover:text-white transition-colors">Документация</Link>
              <Link href="/pricing" className="hover:text-white transition-colors">Тарифы</Link>
            </nav>

            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-sm font-medium hover:text-white transition-colors">
                Войти
              </Link>
              <Link href="/dashboard" className="btn-primary py-1.5 px-4 text-xs">
                Попробовать
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
                  <div className="w-6 h-6 bg-neutral-800 rounded flex items-center justify-center text-[10px] font-bold text-white">CL</div>
                  <span className="text-sm font-bold tracking-tight">CyberLog</span>
                </div>
                <p className="text-xs text-neutral-500 leading-relaxed max-w-xs">
                  Платформа для мониторинга инфраструктуры и анализа больших данных в реальном времени.
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Продукт</h4>
                <ul className="space-y-2 text-xs text-neutral-500">
                  <li><Link href="/dashboard" className="hover:text-white transition-colors">Консоль</Link></li>
                  <li><Link href="/pricing" className="hover:text-white transition-colors">Тарифы</Link></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Ресурсы</h4>
                <ul className="space-y-2 text-xs text-neutral-500">
                  <li><Link href="/api-docs" className="hover:text-white transition-colors">Документация</Link></li>
                  <li><Link href="/legal" className="hover:text-white transition-colors">Правовая информация</Link></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Компания</h4>
                <ul className="space-y-2 text-xs text-neutral-500">
                  <li><Link href="#" className="hover:text-white transition-colors">О нас</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">Контакты</Link></li>
                </ul>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-neutral-500 font-medium">
              <div>© 2026 CyberLog Systems Inc. Все права защищены.</div>
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