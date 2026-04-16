'use client';

import Link from 'next/link';
import { Activity, ShieldCheck, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function NavBar() {
  return (
    <nav className="sticky top-0 z-[100] w-full bg-white/80 backdrop-blur-md border-b border-muted shadow-sm">
      <div className="container mx-auto flex h-20 items-center justify-between px-6 md:px-12">
        <Link href="/" className="flex items-center gap-4 group transition-all">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform">
            <Activity className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-headline text-2xl font-black tracking-tighter leading-none text-foreground">
              PRO <span className="text-primary">Себя</span>
            </span>
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/60">
              BioTech Intelligence
            </span>
          </div>
        </Link>
        
        <div className="flex items-center gap-4">
           <div className="hidden md:flex items-center gap-3 bg-primary/5 px-5 py-2.5 rounded-2xl border border-primary/10">
              <Zap className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">Система активна</span>
           </div>
           <div className="w-10 h-10 rounded-full bg-muted border flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-muted-foreground" />
           </div>
        </div>
      </div>
    </nav>
  );
}