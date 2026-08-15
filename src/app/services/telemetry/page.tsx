'use client';

import { Activity } from 'lucide-react';
import Link from 'next/link';
import { SERVICES } from '@/lib/registry';

export default function TelemetryPage() {
  const service = SERVICES.find(s => s.id === 'telemetry')!;

  return (
    <div className="min-h-screen bg-grid py-20 md:py-32">
      <div className="container mx-auto px-4 max-w-6xl">
        
        <div className="mb-24 border-b border-white/10 pb-16">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 leading-[1.05]">
            {service.name}
          </h1>
          <p className="text-[13px] md:text-[15px] text-muted-foreground font-medium tracking-wide max-w-3xl leading-relaxed mb-10">
            {service.desc}
          </p>
          
          <div className="flex flex-wrap gap-4">
            <a href="#b2b-form" className="btn-enterprise py-4 px-8 text-[11px]">
              Подключить мониторинг (B2B)
            </a>
            <Link href="/api-docs" className="btn-outline py-4 px-8 text-[11px]">
              API Specification
            </Link>
          </div>
        </div>

        {/* Чистый текстовый список возможностей */}
        <div className="space-y-16 mb-32 max-w-4xl">
          <h2 className="technical-label text-blue-500">Система индустриального мониторинга</h2>
          <div className="space-y-12">
            {service.capabilities.map((item, i) => (
              <div key={i} className="group">
                <div className="flex items-start gap-6 border-l border-white/10 pl-8 group-hover:border-blue-500 transition-colors">
                  <div className="pt-1 text-blue-500 font-mono text-[10px] font-black">{String(i + 1).padStart(2, '0')}</div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-black text-white tracking-tighter uppercase">{item.title}</h3>
                    <p className="text-[12px] text-muted-foreground leading-relaxed font-bold tracking-wider">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* B2B Form */}
        <section id="b2b-form" className="max-w-3xl mx-auto border border-white/10 bg-white/[0.02] p-10 md:p-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-black tracking-tighter text-white mb-4">Заявка на подключение телеметрии</h2>
            <p className="text-[10px] text-muted-foreground font-black tracking-widest uppercase">Ответ технического инженера в течение 1 часа</p>
          </div>
          
          <form className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Компания / ИНН</label>
                <input type="text" className="w-full bg-white/5 border border-white/10 p-4 text-[11px] text-white focus:border-blue-500 outline-none transition-all" placeholder="ООО Инфра-Хаб / 7730..." required />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Рабочий E-mail</label>
                <input type="email" className="w-full bg-white/5 border border-white/10 p-4 text-[11px] text-white focus:border-blue-500 outline-none transition-all" placeholder="ops@corp.ru" required />
              </div>
            </div>
            
            <button type="submit" className="w-full btn-enterprise py-5 text-[11px]">
              Запросить демо-доступ
            </button>
          </form>
        </section>

      </div>
    </div>
  );
}
