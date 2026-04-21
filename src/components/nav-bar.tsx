
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
    <nav className="sticky top-0 z-[100] w-full bg-[#1A2F22] border-b border-primary/20 shadow-2xl">
      <div className="container mx-auto flex h-20 items-center justify-between px-6 md:px-12">
        <Link href="/" className="flex items-center gap-4 group transition-all">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform">
            <Activity className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-headline text-2xl font-black tracking-tighter leading-none text-white">
              PRO <span className="text-primary">Себя</span>
            </span>
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40">
              BioTech Intelligence
            </span>
          </div>
        </Link>
        
        <div className="flex items-center gap-4 md:gap-6">
           {isGuest ? (
             <div className="flex items-center gap-2 md:gap-4">
                <Button asChild variant="ghost" className="rounded-xl font-black uppercase tracking-widest text-[10px] h-10 px-4 hidden sm:flex text-white/70 hover:text-white hover:bg-white/10">
                  <Link href="/login" className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" /> Войти
                  </Link>
                </Button>
                <Button asChild className="rounded-xl font-black uppercase tracking-widest text-[10px] h-10 px-6 bg-primary shadow-lg shadow-primary/20 hover:bg-primary/90 text-white border-none">
                  <Link href="/register" className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" /> Регистрация
                  </Link>
                </Button>
             </div>
           ) : (
             <Link href="/dashboard" className="hidden md:flex items-center gap-3 bg-white/5 px-5 py-2.5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                <Zap className="h-4 w-4 text-primary animate-pulse" />
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Дашборд активен</span>
             </Link>
           )}
           
           <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5 text-white/30" />
           </div>
        </div>
      </div>
    </nav>
  );
}
