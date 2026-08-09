
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown, Menu, X } from 'lucide-react';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-background/80 backdrop-blur-md">
      <div className="container mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <Image 
            src="/512logo.png" 
            alt="Web3CyberServices Logo" 
            width={24} 
            height={24} 
            className="rounded-sm"
          />
          <span className="font-bold text-sm tracking-tight text-white">Web3CyberServices</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8 text-[10px] font-bold tracking-widest text-muted-foreground">
          <div className="relative group py-4">
            <button className="flex items-center gap-1.5 hover:text-white transition-colors">
              Услуги <ChevronDown className="w-3 h-3 transition-transform group-hover:rotate-180" />
            </button>
            
            <div className="absolute top-full left-0 w-64 pt-2 invisible opacity-0 translate-y-2 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 ease-out">
              <div className="bg-black border border-white/[0.08] rounded-sm shadow-2xl overflow-hidden backdrop-blur-xl">
                <div className="flex flex-col py-2">
                  <Link href="/services/osint" className="px-4 py-3 hover:bg-white/5 hover:text-white transition-colors border-b border-white/5 last:border-0">
                    Агрегация данных и OSINT
                  </Link>
                  <Link href="/services/data-streaming" className="px-4 py-3 hover:bg-white/5 hover:text-white transition-colors border-b border-white/5 last:border-0">
                    Провайдер потоковых данных
                  </Link>
                  <Link href="/services/pentest" className="px-4 py-3 hover:bg-white/5 hover:text-white transition-colors border-b border-white/5 last:border-0">
                    Аудит информационной безопасности
                  </Link>
                  <Link href="/services/telemetry" className="px-4 py-3 hover:bg-white/5 hover:text-white transition-colors border-b border-white/5 last:border-0">
                    B2B Телеметрия и мониторинг
                  </Link>
                  <Link href="/services/devsecops" className="px-4 py-3 hover:bg-white/5 hover:text-white transition-colors border-b border-white/5 last:border-0">
                    DevSecOps Консалтинг
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <Link href="/api-docs" className="hover:text-white transition-colors">Документация</Link>
          <Link href="/pricing" className="hover:text-white transition-colors">Тарифы</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/portal" className="hidden sm:flex btn-outline py-1.5 px-4 text-[10px] tracking-widest shrink-0">
            Вход
          </Link>
          <Link href="/portal" className="btn-enterprise py-1.5 px-4 text-[10px] tracking-widest shrink-0">
            Регистрация
          </Link>
          
          <button 
            className="lg:hidden p-2 text-muted-foreground hover:text-white transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden bg-black border-t border-white/[0.08] px-4 py-6 space-y-6 animate-in slide-in-from-top duration-200">
          <div className="space-y-4">
            <div className="text-[10px] font-black text-blue-500 tracking-[0.2em] uppercase mb-4">Наши услуги</div>
            <div className="grid grid-cols-1 gap-3">
              <Link href="/services/osint" onClick={() => setIsMobileMenuOpen(false)} className="text-xs text-muted-foreground hover:text-white transition-colors">Агрегация данных и OSINT</Link>
              <Link href="/services/data-streaming" onClick={() => setIsMobileMenuOpen(false)} className="text-xs text-muted-foreground hover:text-white transition-colors">Провайдер потоковых данных</Link>
              <Link href="/services/pentest" onClick={() => setIsMobileMenuOpen(false)} className="text-xs text-muted-foreground hover:text-white transition-colors">Аудит безопасности</Link>
              <Link href="/services/telemetry" onClick={() => setIsMobileMenuOpen(false)} className="text-xs text-muted-foreground hover:text-white transition-colors">B2B Телеметрия</Link>
              <Link href="/services/devsecops" onClick={() => setIsMobileMenuOpen(false)} className="text-xs text-muted-foreground hover:text-white transition-colors">DevSecOps Консалтинг</Link>
            </div>
          </div>
          <div className="h-px bg-white/5" />
          <div className="flex flex-col gap-4">
            <Link href="/api-docs" onClick={() => setIsMobileMenuOpen(false)} className="text-xs font-bold tracking-widest text-muted-foreground hover:text-white uppercase">Документация</Link>
            <Link href="/pricing" onClick={() => setIsMobileMenuOpen(false)} className="text-xs font-bold tracking-widest text-muted-foreground hover:text-white uppercase">Тарифы</Link>
            <Link href="/portal" onClick={() => setIsMobileMenuOpen(false)} className="sm:hidden text-xs font-bold tracking-widest text-muted-foreground hover:text-white uppercase">Вход</Link>
          </div>
        </div>
      )}
    </header>
  );
}
