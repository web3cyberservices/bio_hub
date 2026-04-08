'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Menu, User, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-[100] w-full bg-primary/85 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-8">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-lg group-hover:scale-105 transition-all duration-500">
            <Activity className="h-6 w-6 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="font-headline text-2xl font-black tracking-tighter leading-none text-white">
              PRO <span className="text-white/80">Себя</span>
            </span>
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/60">
              Biometric Intelligence
            </span>
          </div>
        </Link>
        
        <div className="hidden lg:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-white/70">
          <Link href="/" className={cn("hover:text-white transition-colors", pathname === '/' && "text-white font-black")}>Главная</Link>
          <Link href="/dashboard" className={cn("hover:text-white transition-colors", pathname === '/dashboard' && "text-white font-black")}>Дашборд</Link>
          <Link href="#" className="hover:text-white transition-colors">Методология</Link>
          <Link href="#" className="hover:text-white transition-colors">Анализы</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden sm:block">
            <Button variant="ghost" className="font-black text-[10px] uppercase tracking-widest text-white hover:bg-white/10 px-6">Войти</Button>
          </Link>
          <Link href="/register">
            <Button className="rounded-2xl px-8 h-12 font-black uppercase tracking-widest text-[10px] bg-white text-primary shadow-xl hover:bg-white/90 transition-transform active:scale-95">
              Начать путь
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="lg:hidden rounded-xl text-white">
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </nav>
  );
}