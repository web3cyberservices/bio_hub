'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Leaf, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NavBar() {
  const pathname = usePathname();
  const isDashboard = pathname === '/dashboard';

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-xl border-b border-primary/5">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3 group transition-all">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
            <Leaf className="h-7 w-7 text-white" />
          </div>
          <span className="font-headline text-3xl font-bold tracking-tighter text-foreground">
            PRO Себя
          </span>
        </Link>
        <div className="flex items-center gap-3">
          {isDashboard ? (
            <div className="hidden md:flex gap-6 mr-6 text-sm font-bold text-muted-foreground uppercase tracking-widest">
              <Link href="#" className="hover:text-primary transition-colors">Обзор</Link>
              <Link href="#" className="hover:text-primary transition-colors">Прогресс</Link>
              <Link href="#" className="hover:text-primary transition-colors">Сообщество</Link>
            </div>
          ) : (
            <Link href="/dashboard">
              <Button variant="ghost" className="font-bold text-muted-foreground hover:text-primary">Функции</Button>
            </Link>
          )}
          <Link href="/login">
            <Button variant="outline" className="h-11 px-6 rounded-xl border-2 font-bold hover:bg-primary/5">Войти</Button>
          </Link>
          <Link href="/register">
            <Button className="h-11 px-6 rounded-xl font-bold shadow-lg shadow-primary/10">Регистрация</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}