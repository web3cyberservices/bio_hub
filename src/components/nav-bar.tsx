'use client';

import Link from 'next/link';
import { Activity, ShieldCheck, Zap, LogIn, UserPlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/firebase';

export function NavBar() {
  const { user, loading } = useUser();
  
  // Считаем гостем ТОЛЬКО если загрузка завершена и пользователя нет или это public-user.
  const isGuest = !loading && (!user || user.uid === 'public-user');
  const isAuthenticated = !loading && user && user.uid !== 'public-user';

  return (
    <nav className="sticky top-0 z-[100] w-full bg-primary border-b border-white/10 shadow-xl">
      <div className="container mx-auto flex h-16 md:h-20 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 md:gap-3 group transition-all shrink-0">
          <div className="flex h-9 w-9 md:h-11 md:w-11 items-center justify-center rounded-xl bg-white text-primary shadow-lg group-hover:scale-105 transition-transform">
            <Activity className="h-5 w-5 md:h-6 md:w-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-headline text-sm md:text-xl font-black tracking-tighter leading-none text-white">
              PRO <span className="text-white/80">Себя</span>
            </span>
            <span className="text-[5px] md:text-[8px] font-black uppercase tracking-[0.4em] text-white/50">
              BioTech
            </span>
          </div>
        </Link>
        
        <div className="flex items-center gap-1.5 md:gap-4">
           {loading ? (
             <div className="w-10 h-10 flex items-center justify-center opacity-20">
                <Loader2 className="h-4 w-4 animate-spin text-white" />
             </div>
           ) : isGuest ? (
             <div className="flex items-center gap-1.5 md:gap-2">
                <Button asChild variant="ghost" className="rounded-xl font-black uppercase tracking-widest text-[7px] md:text-[10px] h-8 md:h-10 px-2 md:px-4 text-white hover:text-white hover:bg-white/10 border-none">
                  <Link href="/login" className="flex items-center gap-1">
                    <LogIn className="h-3 w-3 md:h-4 md:w-4" /> <span>Войти</span>
                  </Link>
                </Button>
                <Button asChild className="rounded-xl font-black uppercase tracking-widest text-[7px] md:text-[10px] h-8 md:h-10 px-2 md:px-5 bg-white text-primary shadow-lg hover:bg-white/90 border-none">
                  <Link href="/register" className="flex items-center gap-1">
                    <UserPlus className="h-3 w-3 md:h-4 md:w-4" /> <span>Регистрация</span>
                  </Link>
                </Button>
             </div>
           ) : isAuthenticated ? (
             <Link href="/dashboard" className="flex items-center gap-2 bg-white/10 px-3 py-1.5 md:px-5 md:py-2.5 rounded-xl border border-white/20 hover:bg-white/20 transition-colors">
                <Zap className="h-3.5 w-3.5 text-white animate-pulse" />
                <span className="text-[8px] md:text-[10px] font-black text-white uppercase tracking-widest">Дашборд</span>
             </Link>
           ) : null}
           
           <div className="hidden lg:flex w-10 h-10 rounded-full bg-white/10 border border-white/10 items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5 text-white/40" />
           </div>
        </div>
      </div>
    </nav>
  );
}
