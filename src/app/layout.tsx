
import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';

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
              <span className="font-bold text-sm tracking-tight text-white">Web3CyberServices</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-8 text-[10px] font-bold tracking-widest text-muted-foreground">
              {/* Dropdown Services */}
              <div className="relative group py-4">
                <button className="flex items-center gap-1.5 hover:text-white transition-colors uppercase">
                  Услуги <ChevronDown className="w-3 h-3 transition-transform group-hover:rotate-180" />
                </button>
                
                <div className="absolute top-full left-0 w-64 pt-2 invisible opacity-0 translate-y-2 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 ease-out">
                  <div className="bg-black border border-white/[0.08] rounded-sm shadow-2xl overflow-hidden backdrop-blur-xl">
                    <div className="flex flex-col py-2">
                      <Link href="/services/osint" className="px-4 py-3 hover:bg-white/5 hover:text-white transition-colors border-b border-white/5 last:border-0">
                        Агрегация данных и OSINT
                      </Link>
                      <Link href="/services/data-streaming" className="px-4 py-3 hover:bg-white/5 hover:text-white transition-colors border-b border-white/5 last:border-0">
                        Провайдер потоковых данных
                      </Link>
                      <Link href="/services/pentest" className="px-4 py-3 hover:bg-white/5 hover:text-white transition-colors border-b border-white/5 last:border-0">
                        Аудит информационной безопасности
                      </Link>
                      <Link href="/services/telemetry" className="px-4 py-3 hover:bg-white/5 hover:text-white transition-colors border-b border-white/5 last:border-0">
                        B2B Телеметрия и мониторинг
                      </Link>
                      <Link href="/services/devsecops" className="px-4 py-3 hover:bg-white/5 hover:text-white transition-colors border-b border-white/5 last:border-0">
                        DevSecOps Консалтинг
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <Link href="/api-docs" className="hover:text-white transition-colors uppercase">Документация</Link>
              <Link href="/pricing" className="hover:text-white transition-colors uppercase">Тарифы</Link>
            </nav>

            <div className="flex items-center gap-3">
              <Link href="/portal" className="btn-outline py-1.5 px-4 text-[10px] tracking-widest shrink-0 uppercase">
                Вход
              </Link>
              <Link href="/portal" className="btn-enterprise py-1.5 px-4 text-[10px] tracking-widest shrink-0 uppercase">
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
