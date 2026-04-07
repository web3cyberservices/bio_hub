'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NavBar() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <nav className="sticky top-0 z-50 w-full bg-primary text-primary-foreground shadow-md border-b border-primary/20">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-lg">
            <Leaf className="h-6 w-6 text-primary" />
          </div>
          <span className="font-headline text-2xl font-bold tracking-tight text-white">
            PRO Себя
          </span>
        </Link>
        <div className="flex items-center gap-4">
          {!isHomePage && (
            <Link href="/dashboard">
              <Button variant="ghost" className="font-medium text-white hover:bg-white/10 hover:text-white">Дашборд</Button>
            </Link>
          )}
          <Link href="/login">
            <Button variant="outline" className="border-white/30 text-white bg-white/10 hover:bg-white/20 transition-colors">Войти</Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" className="border-white/30 text-white bg-white/10 hover:bg-white/20 transition-colors">Регистрация</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
