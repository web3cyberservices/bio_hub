'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown, Menu, X, Globe, FileText, CreditCard, Shield } from 'lucide-react';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-black/80 backdrop-blur-md">
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
            <button className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
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
            className="lg:hidden p-2 text-muted-foreground hover:text-white transition-colors z-50"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-14 bg-black z-40 lg:hidden overflow-y-auto border-t border-white/10">
          <div className="container mx-auto px-4 py-8 space-y-10">
            {/* Main Links */}
            <div className="grid grid-cols-1 gap-4">
              <Link 
                href="/api-docs" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-sm group active:bg-white/10"
              >
                <FileText className="w-5 h-5 text-blue-500" />
                <div className="flex flex-col">
                  <span className="text-[11px] font-black tracking-widest text-white uppercase">Документация</span>
                  <span className="text-[9px] text-muted-foreground uppercase tracking-widest">API & Техспецификации</span>
                </div>
              </Link>
              <Link 
                href="/pricing" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-sm group active:bg-white/10"
              >
                <CreditCard className="w-5 h-5 text-blue-500" />
                <div className="flex flex-col">
                  <span className="text-[11px] font-black tracking-widest text-white uppercase">Тарифы</span>
                  <span className="text-[9px] text-muted-foreground uppercase tracking-widest">Планы и квоты</span>
                </div>
              </Link>
            </div>

            {/* Services Section */}
            <div className="space-y-4">
              <div className="technical-label text-blue-500 px-2">Инфраструктурные услуги</div>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { name: 'Агрегация данных и OSINT', href: '/services/osint' },
                  { name: 'Провайдер потоковых данных', href: '/services/data-streaming' },
                  { name: 'Аудит безопасности (Pentest)', href: '/services/pentest' },
                  { name: 'B2B Телеметрия', href: '/services/telemetry' },
                  { name: 'DevSecOps Консалтинг', href: '/services/devsecops' }
                ].map((service) => (
                  <Link 
                    key={service.href}
                    href={service.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-b border-white/5 text-[10px] font-bold text-muted-foreground hover:text-white uppercase tracking-widest"
                  >
                    {service.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Auth Links (Mobile only) */}
            <div className="pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
              <Link href="/portal" onClick={() => setIsMobileMenuOpen(false)} className="btn-outline py-4 text-[10px]">
                Войти
              </Link>
              <Link href="/portal" onClick={() => setIsMobileMenuOpen(false)} className="btn-enterprise py-4 text-[10px]">
                Регистрация
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}