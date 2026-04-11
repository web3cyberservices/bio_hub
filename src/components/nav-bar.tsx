'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, UserCircle, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';

export function NavBar() {
  const pathname = usePathname();
  const { user, loading } = useUser();

  return (
    <nav className="sticky top-0 z-[100] w-full bg-primary/90 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-8">
        
        {/* Логотип и Название: Теперь всегда видны слева */}
        <Link 
          href="/" 
          className="flex items-center gap-2 md:gap-3 group transition-all"
        >
          <div className="flex h-9 w-9 md:h-12 md:w-12 items-center justify-center rounded-xl md:rounded-2xl bg-white shadow-lg group-hover:scale-105 transition-all duration-500">
            <Activity className="h-5 w-5 md:h-6 md:w-6 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="font-headline text-base md:text-2xl font-black tracking-tighter leading-none text-white">
              PRO <span className="text-white/80">Себя</span>
            </span>
            <span className="text-[6px] md:text-[8px] font-black uppercase tracking-[0.3em] text-white/60">
              Biometric Intelligence
            </span>
          </div>
        </Link>
        
        {/* Правая часть: Кнопки всегда справа */}
        <div className="flex items-center gap-2 md:gap-4">
          {!loading && (
            <>
              {user ? (
                /* Если вход выполнен */
                <Link href="/dashboard">
                  <Button className="rounded-xl md:rounded-2xl px-3 md:px-8 h-9 md:h-12 font-black uppercase tracking-widest text-[8px] md:text-[10px] bg-white text-primary shadow-xl hover:bg-white/90 transition-transform active:scale-95 flex gap-2">
                    <UserCircle className="h-4 w-4 hidden md:block" /> 
                    <span>Био-Хаб</span>
                  </Button>
                </Link>
              ) : (
                /* Если вход НЕ выполнен: Кнопки войти и регистрации справа */
                <div className="flex items-center gap-1 md:gap-3">
                  <Link href="/login">
                    <Button variant="ghost" className="h-9 md:h-12 font-black text-[8px] md:text-[10px] uppercase tracking-widest text-white hover:bg-white/10 px-2 md:px-6 flex gap-1 md:gap-2">
                      <LogIn className="h-3 w-3 md:h-4 md:w-4" /> 
                      <span className="hidden xs:inline">Войти</span>
                      <span className="xs:hidden">Вход</span>
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="rounded-xl md:rounded-2xl px-3 md:px-8 h-9 md:h-12 font-black uppercase tracking-widest text-[8px] md:text-[10px] bg-white text-primary shadow-xl hover:bg-white/90 transition-transform active:scale-95">
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
