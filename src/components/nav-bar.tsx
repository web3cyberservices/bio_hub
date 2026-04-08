'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Menu, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-border shadow-sm">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20 group-hover:scale-105 transition-all duration-300">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <span className="font-headline text-2xl font-black tracking-tighter text-foreground">
            PRO <span className="text-primary">Себя</span>
          </span>
        </Link>
        
        <div className="hidden md:flex items-center gap-10 text-xs font-black uppercase tracking-widest text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">Главная</Link>
          <Link href="/dashboard" className="hover:text-primary transition-colors">Дашборд</Link>
          <Link href="#" className="hover:text-primary transition-colors">Методология</Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden sm:block">
            <Button variant="ghost" className="font-bold text-sm hover:text-primary">Войти</Button>
          </Link>
          <Link href="/register">
            <Button className="rounded-2xl px-8 h-12 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 border-none transition-transform hover:scale-105 active:scale-95">Регистрация</Button>
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
