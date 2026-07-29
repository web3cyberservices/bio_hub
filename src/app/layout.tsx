import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'CyberLog | Корпоративная платформа телеметрии',
  description: 'Высокопроизводительный сбор логов gRPC для критически важной инфраструктуры.',
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
    <html lang="ru" className="dark">
      <body className={`${inter.className} bg-background text-foreground min-h-screen flex flex-col`}>
        <div className="scanline" />
        <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl">
          <div className="container mx-auto px-6 h-20 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-primary rounded-sm flex items-center justify-center font-black text-background transition-transform group-hover:scale-105">CL</div>
              <div className="flex flex-col">
                <span className="font-black text-xl tracking-tighter uppercase text-white leading-none">CyberLog</span>
                <span className="text-[8px] font-bold text-primary tracking-[0.4em] uppercase">Enterprise</span>
              </div>
            </Link>
            <nav className="hidden md:flex items-center gap-10 text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
              <Link href="/api-docs" className="hover:text-primary transition-colors">Документация</Link>
              <Link href="/pricing" className="hover:text-primary transition-colors">Тарифы</Link>
              <Link href="/legal" className="hover:text-primary transition-colors">Правовая база</Link>
            </nav>
            <button className="bg-white text-black px-6 py-2.5 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all hover:text-white">
              Консоль
            </button>
          </div>
        </header>
        <main className="flex-1 relative">
          <div className="absolute inset-0 hero-glow -z-10" />
          {children}
        </main>
        <footer className="border-t border-white/5 py-16 bg-black/60 backdrop-blur-md">
          <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-start gap-10">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-white/10 rounded-sm flex items-center justify-center text-[10px] font-bold">CL</div>
                <span className="text-sm font-bold tracking-tighter uppercase">CyberLog Systems</span>
              </div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-loose max-w-xs">
                Инфраструктура для сбора и анализа данных нового поколения.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Продукт</h4>
                <ul className="space-y-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <li><Link href="/pricing" className="hover:text-primary">Тарифы</Link></li>
                  <li><Link href="/api-docs" className="hover:text-primary">Возможности</Link></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Ресурсы</h4>
                <ul className="space-y-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <li><Link href="/api-docs" className="hover:text-primary">API Доки</Link></li>
                  <li><Link href="/legal" className="hover:text-primary">Статус сети</Link></li>
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
              © 2026 CyberLog Systems Inc. Развернуто в защищенном контуре.
            </div>
            <div className="flex gap-8 text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              <Link href="/legal" className="hover:text-white transition-colors">Конфиденциальность</Link>
              <Link href="/legal" className="hover:text-white transition-colors">Оферта</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}