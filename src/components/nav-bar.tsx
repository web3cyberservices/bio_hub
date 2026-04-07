'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full bg-primary shadow-lg shadow-primary/10">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-md group-hover:scale-110 transition-all duration-500">
            <Activity className="h-6 w-6 text-primary" />
          </div>
          <span className="font-headline text-2xl font-bold tracking-tighter text-white">
            PRO Себя
          </span>
        </Link>
        
        <div className="hidden md:flex items-center gap-10 text-sm font-bold text-white/80 uppercase tracking-wider">
          <Link href="/" className="hover:text-white transition-colors">Главная</Link>
          <Link href="/dashboard" className="hover:text-white transition-colors">Дашборд</Link>
          <Link href="#" className="hover:text-white transition-colors">О нас</Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden sm:block">
            <Button variant="ghost" className="h-11 px-6 rounded-xl font-bold text-white hover:bg-white/10 transition-all">Войти</Button>
          </Link>
          <Link href="/register">
            <Button className="h-11 px-7 rounded-xl font-bold bg-white text-primary shadow-xl hover:bg-white/90 transition-all">Начать</Button>
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden rounded-xl text-white hover:bg-white/10">
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
