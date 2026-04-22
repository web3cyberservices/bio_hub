'use client';

import Link from 'next/link';
import { Activity, ShieldCheck, Zap, LogIn, UserPlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/firebase';
import { cn } from '@/lib/utils';

export function NavBar() {
  const { user, loading } = useUser();
  
  const isGuest = !loading && (!user || user.uid === 'public-user');
  const isAuthenticated = !loading && user && user.uid !== 'public-user';

  return (
    <div className="fixed top-0 left-0 right-0 z-[200] px-4 py-2">
      <nav className={cn(
        "container mx-auto h-16 md:h-22 bg-slate-950/80 backdrop-blur-xl border-b-2 border-primary/30 rounded-b-[2.5rem] md:rounded-b-[3.5rem] header-glow flex items-center justify-between px-6 md:px-12 transition-all duration-700",
        "relative after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-1/2 after:h-px after:bg-gradient-to-r after:from-transparent after:via-primary after:to-transparent"
      )}>
        <Link href="/" className="flex items-center gap-2 md:gap-4 group transition-all shrink-0">
          <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-2xl bg-primary shadow-[0_0_20px_rgba(14,165,233,0.5)] group-hover:scale-110 transition-transform">
            <Activity className="h-6 w-6 md:h-7 md:w-7 text-slate-950" />
          </div>
          <div className="flex flex-col">
            <span className="font-headline text-lg md:text-2xl font-black tracking-tighter leading-none text-white">
              PRO <span className="text-primary neo-glow">Себя</span>
            </span>
            <span className="text-[6px] md:text-[9px] font-black uppercase tracking-[0.5em] text-primary/40">
              BIO-TECH HUB
            </span>
          </div>
        </Link>
        
        <div className="flex items-center gap-2 md:gap-6">
           {loading ? (
             <div className="w-10 h-10 flex items-center justify-center opacity-40">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
             </div>
           ) : isGuest ? (
             <div className="flex items-center gap-2 md:gap-4">
                <Button asChild variant="ghost" className="rounded-2xl font-black uppercase tracking-widest text-[8px] md:text-[11px] h-10 md:h-12 px-4 md:px-6 text-white/60 hover:text-primary hover:bg-primary/5 border-none transition-all">
                  <Link href="/login" className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" /> <span>Войти</span>
                  </Link>
                </Button>
                <Button asChild className="rounded-2xl font-black uppercase tracking-widest text-[8px] md:text-[11px] h-10 md:h-12 px-5 md:px-8 bg-primary text-slate-950 shadow-[0_0_30px_rgba(14,165,233,0.4)] hover:shadow-primary/60 transition-all border-none">
                  <Link href="/register" className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" /> <span>Регистрация</span>
                  </Link>
                </Button>
             </div>
           ) : isAuthenticated ? (
             <Link href="/dashboard" className="flex items-center gap-3 bg-primary/10 px-4 py-2 md:px-8 md:py-3 rounded-2xl border border-primary/20 hover:bg-primary/20 transition-all group">
                <Zap className="h-4 w-4 text-primary animate-pulse group-hover:scale-110" />
                <span className="text-[9px] md:text-[12px] font-black text-white uppercase tracking-widest">Bio-Дашборд</span>
             </Link>
           ) : null}
           
           <div className="hidden xl:flex w-12 h-12 rounded-full bg-white/5 border border-white/10 items-center justify-center shrink-0 hover:border-primary/40 transition-colors">
              <ShieldCheck className="h-6 w-6 text-primary/40" />
           </div>
        </div>
      </nav>
    </div>
  );
}
