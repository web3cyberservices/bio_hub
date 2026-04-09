'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, LayoutDashboard, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';

export function NavBar() {
  const pathname = usePathname();
  const { user, loading } = useUser();

  return (
    <nav className="sticky top-0 z-[100] w-full bg-primary/90 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-8">
        {/* Logo and App Name: Always visible if logged in, otherwise visible only on desktop */}
        <Link 
          href="/" 
          className={cn(
            "flex items-center gap-3 group",
            !user && "hidden md:flex" // Hide on mobile if NOT logged in
          )}
        >
          <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-2xl bg-white shadow-lg group-hover:scale-105 transition-all duration-500">
            <Activity className="h-5 w-5 md:h-6 md:w-6 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="font-headline text-lg md:text-2xl font-black tracking-tighter leading-none text-white">
              PRO <span className="text-white/80">Себя</span>
            </span>
            <span className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.3em] text-white/60">
              Biometric Intelligence
            </span>
          </div>
        </Link>
        
        {/* Navigation links: hidden on mobile */}
        <div className="hidden lg:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-white/70">
          <Link href="/" className={cn("hover:text-white transition-colors", pathname === '/' && "text-white font-black")}>Главная</Link>
          <Link href="/dashboard" className={cn("hover:text-white transition-colors", pathname === '/dashboard' && "text-white font-black")}>Дашборд</Link>
          <Link href="#" className="hover:text-white transition-colors">Методология</Link>
          <Link href="#" className="hover:text-white transition-colors">Анализы</Link>
        </div>

        {/* Auth status or buttons */}
        <div className="flex items-center gap-4">
          {!loading && (
            <>
              {user ? (
                /* When logged in: show only "In Cabinet" button or profile link on desktop, 
                   on mobile the logo is already shown on the left */
                <Link href="/dashboard">
                  <Button className="rounded-2xl px-4 md:px-8 h-10 md:h-12 font-black uppercase tracking-widest text-[8px] md:text-[10px] bg-white text-primary shadow-xl hover:bg-white/90 transition-transform active:scale-95 flex gap-2">
                    <LayoutDashboard className="h-3 w-3 md:h-4 md:w-4" /> 
                    <span className="hidden sm:inline">В кабинет</span>
                    <span className="sm:hidden">Кабинет</span>
                  </Button>
                </Link>
              ) : (
                /* When NOT logged in: centered buttons on mobile (container is justify-between but brand is hidden) */
                <div className="flex items-center gap-3 w-full justify-center md:w-auto">
                  <Link href="/login">
                    <Button variant="ghost" className="h-10 md:h-12 font-black text-[9px] md:text-[10px] uppercase tracking-widest text-white hover:bg-white/10 px-3 md:px-6 flex gap-2">
                      <LogIn className="h-4 w-4" /> Войти
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="rounded-2xl px-4 md:px-8 h-10 md:h-12 font-black uppercase tracking-widest text-[9px] md:text-[10px] bg-white text-primary shadow-xl hover:bg-white/90 transition-transform active:scale-95">
                      Регистрация
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
