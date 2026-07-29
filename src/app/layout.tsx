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
        
        <div className="fixed top-0 left-0 w-full z-50 px-6 pt-6 pointer-events-none">
          <header className="container mx-auto max-w-7xl pointer-events-auto">
            <div className="glass-card rounded-[2rem] border border-primary/30 shadow-[0_0_40px_-10px_rgba(14,165,233,0.3)] px-6 md:px-10 h-20 flex items-center justify-between relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 opacity-30" />
              
              <Link href="/" className="flex items-center gap-4 group/logo relative z-10">
                <div className="relative">
                  <div className="w-10 h-10 bg-primary/20 rounded-xl border border-primary/40 flex items-center justify-center font-black text-primary text-sm shadow-[0_0_15px_rgba(14,165,233,0.3)] group-hover/logo:scale-110 transition-transform duration-500">
                    <div className="absolute -inset-1 bg-primary/20 blur-md opacity-0 group-hover/logo:opacity-100 transition-opacity" />
                    CL
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-xl tracking-tighter text-white leading-none">CyberLog</span>
                  <span className="text-[8px] font-black text-primary tracking-[0.4em] uppercase">Enterprise</span>
                </div>
              </Link>

              <nav className="hidden md:flex items-center gap-10 text-[11px] font-bold text-muted-foreground relative z-10">
                <Link href="/dashboard" className="hover:text-primary transition-colors">Консоль</Link>
                <Link href="/api-docs" className="hover:text-primary transition-colors">Протоколы</Link>
                <Link href="/pricing" className="hover:text-primary transition-colors">Тарифы</Link>
              </nav>

              <div className="relative z-10">
                <Link href="/dashboard" className="glass-button rounded-full px-8 py-2.5 text-[11px] font-black text-primary border-primary/30 hover:border-primary">
                  Вход
                </Link>
              </div>
            </div>
          </header>
        </div>

        <main className="flex-1 relative pt-24">
          {children}
        </main>

        <footer className="border-t border-white/5 py-16 bg-black/50 backdrop-blur-md">
          <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-start gap-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-primary rounded-lg">CL</div>
                <span className="text-sm font-bold tracking-tighter text-white">CyberLog Systems Inc.</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed max-w-xs">
                Платформа анализа данных критической важности. Развернуто в изолированном облаке.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Продукт</h4>
                <ul className="space-y-2 text-[11px] font-bold text-muted-foreground">
                  <li><Link href="/pricing" className="hover:text-primary">Тарифы</Link></li>
                  <li><Link href="/dashboard" className="hover:text-primary">Консоль</Link></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Ресурсы</h4>
                <ul className="space-y-2 text-[11px] font-bold text-muted-foreground">
                  <li><Link href="/api-docs" className="hover:text-primary">API Доки</Link></li>
                  <li><Link href="/legal" className="hover:text-primary">SLA</Link></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Компания</h4>
                <ul className="space-y-2 text-[11px] font-bold text-muted-foreground">
                  <li><Link href="/legal" className="hover:text-primary">О нас</Link></li>
                  <li><Link href="/legal" className="hover:text-primary">Контакты</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="container mx-auto px-6 mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between gap-4">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
              © 2026 CyberLog Systems. Все права защищены.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
