
'use client';

import { ShieldCheck, Lock, Globe, FileText, ChevronRight } from 'lucide-react';

export default function LegalPage() {
  return (
    <div className="py-24 container mx-auto px-6 max-w-4xl">
      <div className="mb-16">
        <h1 className="text-4xl font-black tracking-tighter mb-4">Legal & Compliance</h1>
        <p className="text-muted-foreground font-medium">Юридическая информация и соответствие стандартам безопасности.</p>
      </div>
      
      <div className="grid gap-12">
        <section className="bg-slate-900/50 border border-white/5 p-8 rounded-2xl">
          <div className="flex items-center gap-3 text-primary mb-6">
            <ShieldCheck className="w-6 h-6" />
            <h2 className="text-xl font-bold tracking-tight">Data Sovereignty & Security</h2>
          </div>
          <div className="text-sm text-slate-400 leading-relaxed space-y-4 font-medium">
            <p>
              CyberLog Enterprise соответствует стандартам <strong>GDPR, SOC2 Type II и HIPAA</strong>. Все данные телеметрии шифруются при передаче с использованием протокола TLS 1.3 и в состоянии покоя с использованием AES-256-GCM.
            </p>
            <p>
              Наша инфраструктура размещена в дата-центрах уровня Tier III в Германии (Франкфурт) и Финляндии (Хельсинки), что гарантирует соблюдение законов ЕС о защите данных.
            </p>
          </div>
          <div className="mt-8 pt-8 border-t border-white/5 flex flex-wrap gap-4">
            {['SOC2 Certified', 'GDPR Ready', 'ISO 27001', 'HIPAA Compliant'].map((badge) => (
              <span key={badge} className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 border border-white/5">
                {badge}
              </span>
            ))}
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-500" /> Privacy Policy
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Мы придерживаемся политики минимизации данных. CyberLog не собирает PII (персонально идентифицируемую информацию), если это не настроено в ваших правилах обфускации на стороне агента.
            </p>
            <button className="text-[10px] font-black uppercase text-blue-500 hover:text-white transition-colors flex items-center gap-1">
              Read Policy <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-500" /> Service Level Agreement
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Мы гарантируем 99.99% доступности для Enterprise-планов. Задержка приема данных (ingestion latency) не превышает 50мс для 99-го перцентиля (p99).
            </p>
            <button className="text-[10px] font-black uppercase text-blue-500 hover:text-white transition-colors flex items-center gap-1">
              Read SLA <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </section>

        <section className="bg-white/5 border border-white/5 p-8 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-5 h-5 text-slate-400" />
            <h3 className="text-sm font-bold uppercase tracking-widest">DPA (Data Processing Agreement)</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed font-medium mb-6">
            Корпоративные клиенты могут запросить подписанное соглашение об обработке данных (DPA) для соблюдения нормативных требований вашей юрисдикции.
          </p>
          <button className="btn-secondary py-2 px-6 text-xs font-bold">Запросить DPA</button>
        </section>
      </div>
    </div>
  );
}
