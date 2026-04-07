import Link from 'next/link';
import { Leaf, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NavBar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
            <Leaf className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="font-headline text-xl font-bold tracking-tight text-foreground">
            NutriPath <span className="text-primary text-2xl">AI</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" className="font-medium">Дашборд</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/5">Войти</Button>
          </Link>
          <Link href="/register">
            <Button className="bg-secondary hover:bg-secondary/90 shadow-lg shadow-secondary/20">Регистрация</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
