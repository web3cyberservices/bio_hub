
import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
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
  icons: {
    icon: '/128favicon.jpg',
  }
};

export const viewport: Viewport = {
  themeColor: '#09090b',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={`${inter.variable} dark`}>
      <body className="bg-background text-foreground min-h-screen flex flex-col font-sans selection:bg-blue-500/30 overflow-x-hidden antialiased">
        <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-background/80 backdrop-blur-md">
          <div className="container mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <Image 
                src="/512logo.png" 
                alt="Web3CyberServices Logo" 
                width={24} 
                height={24} 
                className="rounded-sm"
              />
              <span className="font-bold text-sm tracking-tight text-white uppercase">Web3CyberServices</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-8 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <Link href="/dashboard" className="hover:text-white transition-colors">Консоль</Link>
              <Link href="/api-docs" className="hover:text-white transition-colors">Документация</Link>
              <Link href="/pricing" className="hover:text-white transition-colors">Тарифы</Link>
            </nav>

            <div className="flex items-center gap-3">
              <Link href="/portal" className="btn-outline py-1.5 px-4 text-[10px] uppercase tracking-widest shrink-0">
                Вход
              </Link>
              <Link href="/portal" className="btn-enterprise py-1.5 px-4 text-[10px] uppercase tracking-widest shrink-0">
                Регистрация
              </Link>
            </div>
          </div>
        </header>

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
                  <span className="text-xs font-bold tracking-tight uppercase text-white">Web3CyberServices</span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed max-w-xs font-medium uppercase tracking-wider">
                  Индустриальная платформа для сбора телеметрии в высоконагруженных глобальных средах.
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="technical-label">Платформа</h4>
                <ul className="space-y-2 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                  <li><Link href="/dashboard" className="hover:text-white">Консоль</Link></li>
                  <li><Link href="/pricing" className="hover:text-white">Тарифы</Link></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="technical-label">Правовая информация</h4>
                <ul className="space-y-2 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                  <li><Link href="/legal" className="hover:text-white">Конфиденциальность</Link></li>
                  <li><Link href="/legal" className="hover:text-white">Условия</Link></li>
                </ul>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
              <div>© 2026 Web3CyberServices. ВСЕ ПРАВА ЗАЩИЩЕНЫ.</div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
