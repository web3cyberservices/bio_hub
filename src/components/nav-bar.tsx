'use client';

import Link from 'next/link';
import { Activity, LayoutDashboard } from 'lucide-react';

export function NavBar() {
  return (
    <nav className="sticky top-0 z-[100] w-full bg-primary/95 backdrop-blur-xl border-b border-white/10 shadow-lg">
      <div className="container mx-auto flex h-16 md:h-20 items-center justify-between px-4 md:px-8">
        <Link href="/" className="flex items-center gap-2 md:gap-3 group transition-all">
          <div className="flex h-9 w-9 md:h-12 md:w-12 items-center justify-center rounded-xl bg-white shadow-md">
            <Activity className="h-5 w-5 md:h-6 md:w-6 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="font-headline text-base md:text-2xl font-black tracking-tighter leading-none text-white">
              PRO <span className="text-white/80">Себя</span>
            </span>
            <span className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.3em] text-white/50">
              Open Bio-Hub
            </span>
          </div>
        </Link>
        
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-2xl border border-white/10 backdrop-blur-md">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Live Bio-Feed</span>
           </div>
        </div>
      </div>
    </nav>
  );
}
