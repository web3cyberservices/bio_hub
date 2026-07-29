
'use client';

import { ShieldCheck, Lock, Globe, FileText, ChevronRight } from 'lucide-react';

export default function LegalPage() {
  return (
    <div className="py-20 md:py-32 container mx-auto px-4 max-w-4xl">
      <div className="mb-16 text-center md:text-left">
        <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-4 uppercase">Юридическая информация</h1>
        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Комплаенс и стандарты безопасности инфраструктуры.</p>
      </div>
      
      <div className="grid gap-8">
        <section className="bg-slate-900/40 border border-white/5 p-8 rounded-sm">
          <div className="flex items-center gap-3 text-primary mb-6">
            <ShieldCheck className="w-5 h-5" />
            <h2 className="text-sm font-black tracking-widest uppercase">Суверенитет данных и безопасность</h2>
          </div>
          <div className="text-[10px] text-slate-400 leading-relaxed space-y-4 font-bold uppercase tracking-wide">
            <p>
              Web3CyberServices соответствует стандартам <strong>GDPR, SOC2 Type II и HIPAA</strong>. Все данные телеметрии шифруются при передаче (TLS 1.3) и в хранилище (AES-256-GCM).
            </p>
            <p>
              Инфраструктура размещена в дата-центрах уровня Tier III (EU-Central, Asia-South), что гарантирует соблюдение региональных законов о защите данных.
            </p>
          </div>
          <div className="mt-8 pt-8 border-t border-white/5 flex flex-wrap gap-4">
            {['SOC2 Certified', 'GDPR Ready', 'ISO 27001', 'HIPAA Compliant'].map((badge) => (
              <span key={badge} className="px-3 py-1 bg-white/5 rounded-sm text-[9px] font-black uppercase tracking-widest text-slate-500 border border-white/5">
                {badge}
              </span>
            ))}
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-8">
          <div className="ui-card p-6 space-y-4">
            <h3 className="text-[11px] font-black flex items-center gap-2 uppercase tracking-widest">
              <Lock className="w-4 h-4 text-blue-500" /> Политика конфиденциальности
            </h3>
            <p className="text-[9px] text-slate-500 leading-relaxed font-bold uppercase tracking-wider">
              Мы придерживаемся политики минимизации данных. Web3CyberServices не собирает PII без явной настройки правил обфускации на стороне агента.
            </p>
            <button className="text-[9px] font-black uppercase text-blue-500 hover:text-white transition-colors flex items-center gap-1">
              Прочитать политику <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="ui-card p-6 space-y-4">
            <h3 className="text-[11px] font-black flex items-center gap-2 uppercase tracking-widest">
              <Globe className="w-4 h-4 text-blue-500" /> Соглашение об уровне сервиса (SLA)
            </h3>
            <p className="text-[9px] text-slate-500 leading-relaxed font-bold uppercase tracking-wider">
              Гарантированная доступность 99.99% для Enterprise-планов. Задержка приема данных (ingestion latency) не превышает 50мс для 99-го перцентиля.
            </p>
            <button className="text-[9px] font-black uppercase text-blue-500 hover:text-white transition-colors flex items-center gap-1">
              Прочитать SLA <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </section>

        <section className="bg-white/[0.02] border border-white/5 p-8 rounded-sm">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-5 h-5 text-slate-400" />
            <h3 className="text-[10px] font-black uppercase tracking-widest">DPA (Соглашение об обработке данных)</h3>
          </div>
          <p className="text-[9px] text-slate-500 leading-relaxed font-bold uppercase tracking-wider mb-6">
            Корпоративные клиенты могут запросить подписанное соглашение DPA для соблюдения регуляторных требований вашей юрисдикции.
          </p>
          <button className="btn-outline py-2 px-6 text-[9px] font-black uppercase tracking-widest">Запросить DPA</button>
        </section>
      </div>
    </div>
  );
}
