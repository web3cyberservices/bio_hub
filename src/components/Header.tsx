'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown, Menu, X, FileText, CreditCard, Shield, Zap, LogIn, LayoutDashboard } from 'lucide-react';
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
          <span className="font-black text-sm md:text-base tracking-tight text-white uppercase">Web3CyberServices</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-10 text-xs font-black tracking-[0.2em] text-muted-foreground uppercase">
          <div className="relative group py-6">
            <button className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer uppercase">
              Услуги <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
            </button>
            
            <div className="absolute top-full left-0 w-80 pt-2 invisible opacity-0 translate-y-2 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
              <div className="bg-[#050505] border border-white/10 rounded-sm shadow-2xl overflow-hidden">
                <div className="flex flex-col py-2">
                  {SERVICES.map((s) => (
                    <Link key={s.href} href={s.href} className="px-6 py-4 hover:bg-white/5 hover:text-white transition-colors border-b border-white/5 last:border-0 text-[10px] tracking-[0.15em] uppercase font-bold">
                      {s.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Link href="/api-docs" className="hover:text-white transition-colors">Документация</Link>
          <Link href="/pricing" className="hover:text-white transition-colors">Тарифы</Link>
        </nav>

        <div className="flex items-center gap-6">
          <Link href="/portal" className="hidden sm:flex bg-white text-black py-2.5 px-8 text-xs font-black tracking-[0.15em] hover:bg-neutral-200 transition-all uppercase rounded-sm">
            Консоль
          </Link>
          
          <button 
            className="lg:hidden p-2 text-white bg-white/5 border border-white/10 rounded-sm hover:bg-white/10 transition-colors z-[210] relative"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Fullscreen Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 bg-black z-[200] lg:hidden transition-all duration-500 ease-in-out ${
          isMobileMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-full'
        }`}
      >
        <div className="flex flex-col h-full container mx-auto px-6 py-24 overflow-y-auto">
          <div className="space-y-4 mb-10">
            <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] px-2">Системные разделы</h3>
            <div className="grid grid-cols-1 gap-4">
              <Link href="/dashboard" onClick={closeMenu} className="flex items-center gap-5 p-6 bg-white/[0.03] border border-white/10 rounded-sm group active:bg-blue-500/10 transition-all">
                <LayoutDashboard className="w-6 h-6 text-blue-500" />
                <div className="flex flex-col">
                  <span className="text-sm font-black tracking-widest text-white uppercase">Личный кабинет</span>
                  <span className="text-[9px] text-muted-foreground uppercase tracking-[0.15em] mt-1 font-bold">Управление узлами</span>
                </div>
              </Link>
              <Link href="/api-docs" onClick={closeMenu} className="flex items-center gap-5 p-6 bg-white/[0.03] border border-white/10 rounded-sm group active:bg-blue-500/10 transition-all">
                <FileText className="w-6 h-6 text-blue-500" />
                <div className="flex flex-col">
                  <span className="text-sm font-black tracking-widest text-white uppercase">Спецификация</span>
                  <span className="text-[9px] text-muted-foreground uppercase tracking-[0.15em] mt-1 font-bold">gRPC & API Docs</span>
                </div>
              </Link>
              <Link href="/pricing" onClick={closeMenu} className="flex items-center gap-5 p-6 bg-white/[0.03] border border-white/10 rounded-sm group active:bg-blue-500/10 transition-all">
                <CreditCard className="w-6 h-6 text-blue-500" />
                <div className="flex flex-col">
                  <span className="text-sm font-black tracking-widest text-white uppercase">Биллинг</span>
                  <span className="text-[9px] text-muted-foreground uppercase tracking-[0.15em] mt-1 font-bold">Тарифные планы</span>
                </div>
              </Link>
            </div>
          </div>

          <div className="space-y-4 mb-12">
            <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] px-2">Инфраструктура</h3>
            <div className="grid grid-cols-1 gap-3">
              {SERVICES.map((service) => (
                <Link 
                  key={service.href} 
                  href={service.href} 
                  onClick={closeMenu} 
                  className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 text-xs font-bold text-white uppercase tracking-widest hover:bg-white/5 active:border-blue-500/50 transition-all rounded-sm"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    {service.name}
                  </div>
                  <Zap className="w-4 h-4 text-blue-500/30" />
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-auto pb-10">
            <Link href="/portal" onClick={closeMenu} className="btn-enterprise py-5 text-xs text-center uppercase font-black tracking-[0.2em] flex items-center justify-center gap-3 w-full shadow-2xl shadow-blue-500/20">
              <LogIn className="w-5 h-5" /> Вход в консоль
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
