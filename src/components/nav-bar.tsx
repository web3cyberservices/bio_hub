'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NavBar() {
  const pathname = usePathname();
  const isDashboard = pathname === '/dashboard';

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/60 backdrop-blur-2xl border-b border-primary/5">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20 group-hover:scale-110 transition-all duration-500">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <span className="font-headline text-2xl font-bold tracking-tighter text-foreground">
            PRO Себя
          </span>
        </Link>
        
        <div className="hidden md:flex items-center gap-10 text-sm font-bold text-muted-foreground uppercase tracking-wider">
          <Link href="/" className="hover:text-primary transition-colors">Главная</Link>
          <Link href="/dashboard" className="hover:text-primary transition-colors">Дашборд</Link>
          <Link href="#" className="hover:text-primary transition-colors">О нас</Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden sm:block">
            <Button variant="ghost" className="h-11 px-6 rounded-xl font-bold text-muted-foreground hover:text-primary transition-all">Войти</Button>
          </Link>
          <Link href="/register">
            <Button className="h-11 px-7 rounded-xl font-bold bg-primary shadow-xl shadow-primary/10 hover:shadow-primary/20 transition-all">Начать</Button>
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden rounded-xl">
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </nav>
  );
}