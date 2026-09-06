
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown, Menu, X, FileText, CreditCard, Shield, Zap, LogIn } from 'lucide-react';
import { SERVICES } from '@/lib/registry';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-[100] w-full border-b border-white/[0.08] bg-black/95 backdrop-blur-xl">
      <div className="container mx-auto max-w-7xl px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-4 group shrink-0" onClick={closeMenu}>
          <Image 
            src="/512logo.png" 
            alt="Web3CyberServices Logo" 
            width={32} 
            height={32} 
            className="rounded-sm opacity-90 group-hover:opacity-100 transition-opacity"
          />
          <span className="font-black text-base tracking-tight text-white uppercase">Web3CyberServices</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-12 text-xs font-black tracking-[0.25em] text-muted-foreground uppercase">
          <div className="relative group py-6">
            <button className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer uppercase">
              Услуги <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
            </button>
            
            <div className="absolute top-full left-0 w-80 pt-2 invisible opacity-0 translate-y-2 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
              <div className="bg-[#050505] border border-white/10 rounded-sm shadow-2xl overflow-hidden">
                <div className="flex flex-col py-3">
                  {SERVICES.map((s) => (
                    <Link key={s.href} href={s.href} className="px-6 py-4 hover:bg-white/5 hover:text-white transition-colors border-b border-white/5 last:border-0 text-[10px] tracking-[0.2em] uppercase font-bold">
                      {s.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Link href="/api-docs" className="hover:text-white transition-colors uppercase">Документация</Link>
          <Link href="/pricing" className="hover:text-white transition-colors uppercase">Тарифы</Link>
        </nav>

        <div className="flex items-center gap-6">
          <Link href="/portal" className="hidden sm:flex bg-white text-black py-3 px-10 text-xs font-black tracking-[0.2em] hover:bg-neutral-200 transition-all uppercase rounded-sm shadow-xl shadow-white/5">
            Консоль
          </Link>
          
          <button 
            className="lg:hidden p-3 text-white bg-white/10 rounded-sm hover:bg-white/20 transition-colors z-[210] relative"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
      </div>

      {/* Fullscreen Mobile Menu */}
      <div className={`fixed inset-0 bg-black z-[200] lg:hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'opacity-100 visible pointer-events-auto' : 'opacity-0 invisible pointer-events-none'}`}>
        <div className="flex flex-col h-full container mx-auto px-8 py-28 overflow-y-auto space-y-16">
          
          <div className="grid grid-cols-1 gap-6">
            <Link href="/api-docs" onClick={closeMenu} className="flex items-center gap-6 p-8 bg-white/[0.05] border border-white/10 rounded-sm">
              <FileText className="w-8 h-8 text-blue-500" />
              <div className="flex flex-col">
                <span className="text-sm font-black tracking-widest text-white uppercase">ТЕХНИЧЕСКАЯ СПЕЦИФИКАЦИЯ</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mt-2 font-bold">API & gRPC Manuals</span>
              </div>
            </Link>
            <Link href="/pricing" onClick={closeMenu} className="flex items-center gap-6 p-8 bg-white/[0.05] border border-white/10 rounded-sm">
              <CreditCard className="w-8 h-8 text-blue-500" />
              <div className="flex flex-col">
                <span className="text-sm font-black tracking-widest text-white uppercase">ТАРИФНЫЕ ПЛАНЫ</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mt-2 font-bold">Pricing & SLA Node Details</span>
              </div>
            </Link>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 px-2">
              <Zap className="w-5 h-5 text-blue-500" />
              <h3 className="text-xs font-black text-blue-500 uppercase tracking-[0.4em]">Infrastructure Services</h3>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {SERVICES.map((service) => (
                <Link key={service.href} href={service.href} onClick={closeMenu} className="flex items-center gap-5 p-6 bg-white/[0.02] border border-white/5 text-xs font-bold text-white uppercase tracking-widest hover:bg-white/5 transition-colors rounded-sm">
                  <span className="w-2 h-2 rounded-full bg-blue-500/50" />
                  {service.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-10 border-t border-white/10 pb-10">
            <Link href="/portal" onClick={closeMenu} className="btn-enterprise py-6 text-sm text-center uppercase font-black tracking-[0.3em] flex items-center justify-center gap-4 w-full">
              <LogIn className="w-5 h-5" /> Авторизация в консоли
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
