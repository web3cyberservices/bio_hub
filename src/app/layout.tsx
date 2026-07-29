import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import Link from 'next/link';

const inter = Inter({ 
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-inter',
});

const mono = JetBrains_Mono({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'CyberLog Enterprise | Платформа аналитики больших данных',
  description: 'Высокопроизводительный сбор логов, транзакций и кликстрима для корпоративных клиентов.',
};

export const viewport: Viewport = {
  themeColor: '#050505',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={`${inter.variable} ${mono.variable} dark`}>
      <body className="bg-background text-foreground min-h-screen flex flex-col font-sans antialiased">
        <div className="scanline" />
        
        {/* Floating Glass Header */}
        <div className="fixed top-0 left-0 w-full z-50 px-6 pt-6 pointer-events-none">
          <header className="container mx-auto max-w-7xl pointer-events-auto">
            <div className="glass-card rounded-2xl border border-primary/20 shadow-[0_0_30px_-10px_rgba(14,165,233,0.3)] px-6 md:px-10 h-20 flex items-center justify-between relative overflow-hidden group">
              {/* Subtle inner glow animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <Link href="/" className="flex items-center gap-3 group/logo relative z-10">
                <div className="w-10 h-10 bg-primary flex items-center justify-center font-black text-black text-sm rounded-lg transition-transform group-hover/logo:scale-105">CL</div>
                <div className="flex flex-col">
                  <span className="font-black text-xl tracking-tighter uppercase text-white leading-none">CyberLog</span>
                  <span className="text-[8px] font-bold text-primary tracking-[0.4em] uppercase">Enterprise</span>
                </div>
              </Link>

              <nav className="hidden md:flex items-center gap-10 text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground relative z-10">
                <Link href="/dashboard" className="hover:text-primary transition-colors">Консоль</Link>
                <Link href="/api-docs" className="hover:text-primary transition-colors">Протоколы</Link>
                <Link href="/pricing" className="hover:text-primary transition-colors">Тарифы</Link>
              </nav>

              <div className="relative z-10">
                <Link href="/dashboard" className="bg-white text-black px-6 py-2.5 text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all hover:text-white rounded-md shadow-lg shadow-black/20">
                  Вход
                </Link>
              </div>
            </div>
          </header>
        </div>

        <main className="flex-1 relative pt-24">
          {children}
        </main>

        <footer className="border-t border-white/5 py-16 bg-black">
          <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-start gap-10">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-white/10 flex items-center justify-center text-[10px] font-bold text-white rounded-sm">CL</div>
                <span className="text-sm font-bold tracking-tighter uppercase text-white">CyberLog Systems Inc.</span>
              </div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-loose max-w-xs">
                Платформа анализа данных критической важности. Развернуто в изолированном облаке.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Продукт</h4>
                <ul className="space-y-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <li><Link href="/pricing" className="hover:text-primary">Тарифы</Link></li>
                  <li><Link href="/dashboard" className="hover:text-primary">Консоль</Link></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Ресурсы</h4>
                <ul className="space-y-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <li><Link href="/api-docs" className="hover:text-primary">API Доки</Link></li>
                  <li><Link href="/legal" className="hover:text-primary">SLA</Link></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Компания</h4>
                <ul className="space-y-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <li><Link href="/legal" className="hover:text-primary">О нас</Link></li>
                  <li><Link href="/legal" className="hover:text-primary">Контакты</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="container mx-auto px-6 mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between gap-4">
            <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.3em]">
              © 2026 CyberLog Systems. Все права защищены.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
