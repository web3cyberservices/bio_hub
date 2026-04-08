'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Menu, User, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-[100] w-full bg-white/70 backdrop-blur-2xl border-b border-white/20 shadow-[0_1px_10px_rgba(0,0,0,0.02)]">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-8">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-[0_10px_20px_rgba(76,175,80,0.25)] group-hover:scale-105 transition-all duration-500">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-headline text-2xl font-black tracking-tighter leading-none text-foreground">
              PRO <span className="text-primary">Себя</span>
            </span>
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-60">
              Biometric Intelligence
            </span>
          </div>
        </Link>
        
        <div className="hidden lg:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
          <Link href="/" className={cn("hover:text-primary transition-colors", pathname === '/' && "text-primary")}>Главная</Link>
          <Link href="/dashboard" className={cn("hover:text-primary transition-colors", pathname === '/dashboard' && "text-primary")}>Дашборд</Link>
          <Link href="#" className="hover:text-primary transition-colors">Методология</Link>
          <Link href="#" className="hover:text-primary transition-colors">Анализы</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden sm:block">
            <Button variant="ghost" className="font-black text-[10px] uppercase tracking-widest hover:bg-primary/5 px-6">Войти</Button>
          </Link>
          <Link href="/register">
            <Button className="rounded-2xl px-8 h-12 font-black uppercase tracking-widest text-[10px] bg-foreground text-white shadow-xl hover:bg-foreground/90 transition-transform active:scale-95">
              Начать путь
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="lg:hidden rounded-xl">
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </nav>
  );
}