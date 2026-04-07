'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full bg-primary shadow-lg shadow-primary/10">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-md group-hover:scale-110 transition-all duration-500">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <span className="font-headline text-xl font-bold tracking-tighter text-white">
            PRO Себя
          </span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8 text-[11px] font-bold text-white/80 uppercase tracking-widest">
          <Link href="/" className="hover:text-white transition-colors">Главная</Link>
          <Link href="/dashboard" className="hover:text-white transition-colors">Дашборд</Link>
          <Link href="#" className="hover:text-white transition-colors">О нас</Link>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/login" className="hidden sm:block">
            <Button variant="ghost" className="h-9 px-4 rounded-lg font-bold text-white hover:bg-white/10 transition-all text-xs">Войти</Button>
          </Link>
          <Link href="/register">
            <Button className="h-9 px-5 rounded-lg font-bold bg-white text-primary shadow-lg hover:bg-white/90 transition-all text-xs">Начать</Button>
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden h-9 w-9 rounded-lg text-white hover:bg-white/10">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
