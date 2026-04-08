'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Menu, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20 group-hover:scale-105 transition-all duration-300">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <span className="font-headline text-2xl font-bold tracking-tight text-foreground">
            PRO <span className="text-primary">Себя</span>
          </span>
        </Link>
        
        <div className="hidden md:flex items-center gap-10 text-sm font-medium text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">Главная</Link>
          <Link href="/dashboard" className="hover:text-primary transition-colors">Дашборд</Link>
          <Link href="#" className="hover:text-primary transition-colors">О нас</Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden sm:block">
            <Button variant="ghost" className="font-semibold text-foreground hover:text-primary">Войти</Button>
          </Link>
          <Link href="/register">
            <Button className="rounded-full px-6 font-bold shadow-md shadow-primary/20">Регистрация</Button>
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
