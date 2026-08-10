'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown, Menu, X, FileText, CreditCard, Shield, Zap, Activity, Globe, Database } from 'lucide-react';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Блокировка скролла при открытом меню
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-black/90 backdrop-blur-xl">
      <div className="container mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <Image 
            src="/512logo.png" 
            alt="Web3CyberServices Logo" 
            width={28} 
            height={28} 
            className="rounded-sm opacity-90 group-hover:opacity-100 transition-opacity"
          />
          <span className="font-bold text-sm tracking-tight text-white">Web3CyberServices</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8 text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase">
          <div className="relative group py-4">
            <button className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
              Услуги <ChevronDown className="w-3 h-3 transition-transform group-hover:rotate-180" />
            </button>
            
            <div className="absolute top-full left-0 w-72 pt-2 invisible opacity-0 translate-y-2 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
              <div className="bg-black border border-white/10 rounded-sm shadow-2xl overflow-hidden">
                <div className="flex flex-col py-2">
                  {[
                    { name: 'Агрегация данных и OSINT', href: '/services/osint' },
                    { name: 'Провайдер потоковых данных', href: '/services/data-streaming' },
                    { name: 'Аудит безопасности (Pentest)', href: '/services/pentest' },
                    { name: 'B2B Телеметрия', href: '/services/telemetry' },
                    { name: 'DevSecOps Консалтинг', href: '/services/devsecops' }
                  ].map((s) => (
                    <Link key={s.href} href={s.href} className="px-5 py-3 hover:bg-white/5 hover:text-white transition-colors border-b border-white/5 last:border-0 text-[9px] tracking-widest">
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

        <div className="flex items-center gap-4">
          <Link href="/portal" className="hidden sm:flex btn-outline py-2 px-5 text-[9px] font-black tracking-widest">
            Вход
          </Link>
          <Link href="/portal" className="hidden xs:flex btn-enterprise py-2 px-5 text-[9px] font-black tracking-widest">
            Регистрация
          </Link>
          
          <button 
            className="lg:hidden p-2 text-white bg-white/5 rounded-sm hover:bg-white/10 transition-colors z-[60]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-black z-50 lg:hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <div className="container mx-auto px-6 py-24 h-full overflow-y-auto space-y-12">
          
          {/* Main Quick Links */}
          <div className="grid grid-cols-1 gap-4">
            <Link 
              href="/api-docs" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-5 p-5 bg-white/[0.03] border border-white/10 rounded-sm"
            >
              <div className="w-10 h-10 rounded-sm bg-blue-500/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-black tracking-widest text-white uppercase">Документация</span>
                <span className="text-[9px] text-muted-foreground uppercase tracking-[0.2em] mt-1">Технические спецификации</span>
              </div>
            </Link>
            <Link 
              href="/pricing" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-5 p-5 bg-white/[0.03] border border-white/10 rounded-sm"
            >
              <div className="w-10 h-10 rounded-sm bg-blue-500/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-black tracking-widest text-white uppercase">Тарифы</span>
                <span className="text-[9px] text-muted-foreground uppercase tracking-[0.2em] mt-1">Планы обслуживания</span>
              </div>
            </Link>
          </div>

          {/* Detailed Services List */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <Zap className="w-4 h-4 text-blue-500" />
              <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">Инфраструктурные услуги</h3>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {[
                { name: 'Агрегация данных и OSINT', href: '/services/osint', icon: <Globe className="w-4 h-4" /> },
                { name: 'Провайдер потоковых данных', href: '/services/data-streaming', icon: <Activity className="w-4 h-4" /> },
                { name: 'Аудит безопасности (Pentest)', href: '/services/pentest', icon: <Shield className="w-4 h-4" /> },
                { name: 'B2B Телеметрия и мониторинг', href: '/services/telemetry', icon: <Database className="w-4 h-4" /> },
                { name: 'DevSecOps Консалтинг', href: '/services/devsecops', icon: <Zap className="w-4 h-4" /> }
              ].map((service) => (
                <Link 
                  key={service.href}
                  href={service.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between p-5 bg-white/[0.01] border border-white/5 text-[10px] font-bold text-white uppercase tracking-widest hover:bg-white/5"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground">{service.icon}</span>
                    {service.name}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile Auth Buttons */}
          <div className="pt-8 border-t border-white/10 grid grid-cols-1 gap-4">
            <Link href="/portal" onClick={() => setIsMobileMenuOpen(false)} className="btn-enterprise py-5 text-[11px] text-center uppercase font-black tracking-[0.3em]">
              Личный кабинет
            </Link>
            <Link href="/portal" onClick={() => setIsMobileMenuOpen(false)} className="btn-outline py-5 text-[11px] text-center uppercase font-black tracking-[0.3em]">
              Регистрация тенанта
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
