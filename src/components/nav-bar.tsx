'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, LayoutDashboard, LogIn, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';

export function NavBar() {
  const pathname = usePathname();
  const { user, loading } = useUser();

  return (
    <nav className="sticky top-0 z-[100] w-full bg-primary/90 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-8">
        
        {/* Логотип и Название: Всегда видны на десктопе. На мобильном видны, если выполнен вход. */}
        <Link 
          href="/" 
          className={cn(
            "flex items-center gap-3 group transition-all",
            !user && "hidden md:flex" 
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
        
        {/* Навигационные ссылки (только для десктопа) */}
        <div className="hidden lg:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-white/70">
          <Link href="/" className={cn("hover:text-white transition-colors", pathname === '/' && "text-white font-black")}>Главная</Link>
          {user && (
            <Link href="/dashboard" className={cn("hover:text-white transition-colors", pathname === '/dashboard' && "text-white font-black")}>Дашборд</Link>
          )}
          <Link href="#" className="hover:text-white transition-colors">Методология</Link>
        </div>

        {/* Правая часть: Управление аккаунтом */}
        <div className="flex items-center gap-4">
          {!loading && (
            <>
              {user ? (
                /* Если вход выполнен: Показываем только переход в кабинет */
                <Link href="/dashboard">
                  <Button className="rounded-2xl px-4 md:px-8 h-10 md:h-12 font-black uppercase tracking-widest text-[8px] md:text-[10px] bg-white text-primary shadow-xl hover:bg-white/90 transition-transform active:scale-95 flex gap-2">
                    <UserCircle className="h-4 w-4" /> 
                    <span className="hidden sm:inline">Личный кабинет</span>
                    <span className="sm:hidden">Кабинет</span>
                  </Button>
                </Link>
              ) : (
                /* Если вход НЕ выполнен: Кнопки Войти и Регистрация */
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
