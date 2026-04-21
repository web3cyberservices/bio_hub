
'use client';

import Link from 'next/link';
import { Activity, ShieldCheck, Zap, LogIn, UserPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUser } from '@/firebase';

export function NavBar() {
  const { user } = useUser();
  const isGuest = !user || user.uid === 'public-user';

  return (
    <nav className="sticky top-0 z-[100] w-full bg-primary border-b border-white/10 shadow-xl">
      <div className="container mx-auto flex h-16 md:h-20 items-center justify-between px-4 md:px-12">
        <Link href="/" className="flex items-center gap-2 md:gap-4 group transition-all">
          <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl md:rounded-2xl bg-white text-primary shadow-lg group-hover:scale-105 transition-transform">
            <Activity className="h-5 w-5 md:h-6 md:w-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-headline text-lg md:text-2xl font-black tracking-tighter leading-none text-white">
              PRO <span className="text-white/80">Себя</span>
            </span>
            <span className="text-[7px] md:text-[9px] font-black uppercase tracking-[0.4em] text-white/50">
              BioTech Intelligence
            </span>
          </div>
        </Link>
        
        <div className="flex items-center gap-2 md:gap-6">
           {isGuest ? (
             <div className="flex items-center gap-1 md:gap-4">
                <Button asChild variant="ghost" className="rounded-xl font-black uppercase tracking-widest text-[8px] md:text-[10px] h-9 md:h-10 px-3 md:px-4 text-white hover:text-white hover:bg-white/10">
                  <Link href="/login" className="flex items-center gap-1.5 md:gap-2">
                    <LogIn className="h-3.5 w-3.5 md:h-4 md:w-4" /> Войти
                  </Link>
                </Button>
                <Button asChild className="rounded-xl font-black uppercase tracking-widest text-[8px] md:text-[10px] h-9 md:h-10 px-4 md:px-6 bg-white text-primary shadow-lg hover:bg-white/90 border-none">
                  <Link href="/register" className="flex items-center gap-1.5 md:gap-2">
                    <UserPlus className="h-3.5 w-3.5 md:h-4 md:w-4" /> Регистрация
                  </Link>
                </Button>
             </div>
           ) : (
             <Link href="/dashboard" className="flex items-center gap-2 md:gap-3 bg-white/10 px-3 md:px-5 py-1.5 md:py-2.5 rounded-xl md:rounded-2xl border border-white/20 hover:bg-white/20 transition-colors">
                <Zap className="h-3.5 w-3.5 md:h-4 md:w-4 text-white animate-pulse" />
                <span className="text-[8px] md:text-[10px] font-black text-white uppercase tracking-widest">Дашборд активен</span>
             </Link>
           )}
           
           <div className="hidden sm:flex w-10 h-10 rounded-full bg-white/10 border border-white/10 items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5 text-white/40" />
           </div>
        </div>
      </div>
    </nav>
  );
}
