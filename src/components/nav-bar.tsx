import Link from 'next/link';
import { Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NavBar() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-primary text-primary-foreground shadow-md border-b border-primary/20">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-lg">
            <Leaf className="h-6 w-6 text-primary" />
          </div>
          <span className="font-headline text-xl font-bold tracking-tight text-white">
            NutriPath <span className="text-secondary-foreground text-2xl">AI</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" className="font-medium text-white hover:bg-white/10 hover:text-white">Дашборд</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" className="border-white text-white hover:bg-white/10">Войти</Button>
          </Link>
          <Link href="/register">
            <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-lg shadow-secondary/20">Регистрация</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}