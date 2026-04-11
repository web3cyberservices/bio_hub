'use client';

import Link from 'next/link';
import { Activity, LogIn, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/firebase';

export function NavBar() {
  const { user, loading } = useUser();

  return (
    <nav className="sticky top-0 z-[100] w-full bg-primary/95 backdrop-blur-xl border-b border-white/10 shadow-lg">
      <div className="container mx-auto flex h-16 md:h-20 items-center justify-between px-4 md:px-8">
        
        {/* Логотип */}
        <Link 
          href="/" 
          className="flex items-center gap-2 md:gap-3 group transition-all shrink-0"
        >
          <div className="flex h-9 w-9 md:h-12 md:w-12 items-center justify-center rounded-xl bg-white shadow-md group-hover:scale-105 transition-all duration-300">
            <Activity className="h-5 w-5 md:h-6 md:w-6 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="font-headline text-base md:text-2xl font-black tracking-tighter leading-none text-white">
              PRO <span className="text-white/80">Себя</span>
            </span>
            <span className="hidden xs:block text-[7px] md:text-[8px] font-black uppercase tracking-[0.3em] text-white/50">
              Biometric Hub
            </span>
          </div>
        </Link>
        
        {/* Кнопки */}
        <div className="flex items-center gap-2 md:gap-4 ml-auto">
          {loading ? (
            <div className="h-10 md:h-12 w-24 bg-white/10 animate-pulse rounded-xl md:rounded-2xl" />
          ) : user ? (
            <Link href="/dashboard">
              <Button className="rounded-xl md:rounded-2xl px-4 md:px-8 h-10 md:h-12 font-black uppercase tracking-widest text-[9px] md:text-[10px] bg-white text-primary shadow-xl hover:bg-white/90 transition-all active:scale-95 flex gap-2">
                <Sparkles className="h-4 w-4 hidden sm:block" /> 
                <span>Био-Хаб</span>
              </Button>
            </Link>
          ) : (
            <div className="flex items-center gap-1.5 md:gap-3">
              <Link href="/login">
                <Button variant="ghost" className="h-10 md:h-12 font-black text-[9px] md:text-[10px] uppercase tracking-widest text-white hover:bg-white/10 px-3 md:px-6 flex gap-1 items-center">
                  <LogIn className="h-3.5 w-3.5" /> 
                  <span>Войти</span>
                </Button>
              </Link>
              <Link href="/register">
                <Button className="rounded-xl md:rounded-2xl px-3 md:px-5 h-10 md:h-12 font-black uppercase tracking-widest text-[8px] md:text-[10px] bg-white text-primary shadow-xl hover:bg-white/90 transition-all active:scale-95">
                  <span>Регистрация</span>
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
