
'use client';

import { ShieldCheck, Lock, Globe, FileText, ChevronRight, AlertTriangle } from 'lucide-react';

export default function LegalPage() {
  return (
    <div className="py-20 md:py-32 container mx-auto px-4 max-w-4xl bg-grid">
      <div className="mb-16">
        <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-4 uppercase">Юридический комплаенс</h1>
        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">СТАНДАРТЫ БЕЗОПАСНОСТИ И УСЛОВИЯ ОБСЛУЖИВАНИЯ INSTITUTIONAL-КЛАССА.</p>
      </div>
      
      <div className="grid gap-12">
        {/* KYC/AML */}
        <section className="bg-white/[0.02] border border-white/10 p-8 rounded-sm">
          <div className="flex items-center gap-3 text-blue-500 mb-6">
            <ShieldCheck className="w-5 h-5" />
            <h2 className="text-xs font-black tracking-widest uppercase">Политика KYC / AML и соответствия</h2>
          </div>
          <div className="text-[10px] text-slate-400 leading-relaxed space-y-4 font-bold uppercase tracking-wide">
            <p>
              WEB3CYBERSERVICES ПРИДЕРЖИВАЕТСЯ СТРОГИХ ПРОТОКОЛОВ ЗНАЙ СВОЕГО КЛИЕНТА (KYC) И ПРОТИВОДЕЙСТВИЯ ОТМЫВАНИЮ ДОХОДОВ (AML). 
              ДОСТУП К ВЫДЕЛЕННЫМ GRPC-ТЕЛЕМЕТРИЧЕСКИМ ЭНДПОИНТАМ ПРЕДОСТАВЛЯЕТСЯ ТОЛЬКО ПОСЛЕ РУЧНОЙ ВЕРИФИКАЦИИ КОРПОРАТИВНЫХ ДОКУМЕНТОВ.
            </p>
            <div className="bg-blue-500/5 border border-blue-500/20 p-4 flex items-start gap-4">
              <AlertTriangle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-[9px] text-blue-400/80">
                ЛЮБЫЕ ПОПЫТКИ НЕПОДТВЕРЖДЕННОЙ РЕГИСТРАЦИИ ДЛЯ ИСПОЛЬЗОВАНИЯ ПРОТОКОЛОВ НИЗКОЙ ЗАДЕРЖКИ БУДУТ АВТОМАТИЧЕСКИ ОТКЛОНЕНЫ СИСТЕМОЙ МОНИТОРИНГА.
              </p>
            </div>
          </div>
        </section>

        {/* SLA */}
        <section className="grid md:grid-cols-2 gap-8">
          <div className="ui-card p-8 space-y-4 border border-white/10">
            <h3 className="text-[11px] font-black flex items-center gap-2 uppercase tracking-widest text-white">
              <Globe className="w-4 h-4 text-blue-500" /> СОГЛАШЕНИЕ ОБ УРОВНЕ СЕРВИСА (SLA)
            </h3>
            <p className="text-[9px] text-slate-500 leading-relaxed font-bold uppercase tracking-wider">
              ГАРАНТИРОВАННАЯ ДОСТУПНОСТЬ UPTIME СОСТАВЛЯЕТ 99.999% ДЛЯ ТАРИФОВ CUSTOM BACKBONE. 
              ЗАДЕРЖКА (INGESTION LATENCY) ДО ОСНОВНЫХ БИРЖЕВЫХ АГРЕГАТОРОВ НЕ ПРЕВЫШАЕТ 5 МИЛЛИСЕКУНД.
            </p>
          </div>
          
          {/* Data Retention */}
          <div className="ui-card p-8 space-y-4 border border-white/10">
            <h3 className="text-[11px] font-black flex items-center gap-2 uppercase tracking-widest text-white">
              <Lock className="w-4 h-4 text-blue-500" /> ХРАНЕНИЕ И УНИЧТОЖЕНИЕ ДАННЫХ
            </h3>
            <p className="text-[9px] text-slate-500 leading-relaxed font-bold uppercase tracking-wider">
              ЛОГИ ТРАНЗАКЦИЙ И ТЕЛЕМЕТРИЯ УЗЛОВ ХРАНЯТСЯ В ОПЕРАТИВНОЙ ПАМЯТИ В ТЕЧЕНИЕ 7 СУТОК. 
              ПО ИСТЕЧЕНИИ СРОКА ДАННЫЕ ПОДВЕРГАЮТСЯ КРИПТОГРАФИЧЕСКОМУ УНИЧТОЖЕНИЮ (SHREDDING) БЕЗ ВОЗМОЖНОСТИ ВОССТАНОВЛЕНИЯ.
            </p>
          </div>
        </section>

        <section className="bg-white/[0.02] border border-white/5 p-8 rounded-sm">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-5 h-5 text-slate-400" />
            <h3 className="text-[10px] font-black uppercase tracking-widest">ЮРИДИЧЕСКАЯ ЮРИСДИКЦИЯ</h3>
          </div>
          <p className="text-[9px] text-slate-500 leading-relaxed font-bold uppercase tracking-wider mb-8">
            WEB3CYBERSERVICES XYZ ЗАРЕГИСТРИРОВАНА И ФУНКЦИОНИРУЕТ В СООТВЕТСТВИИ С ЗАКОНОДАТЕЛЬСТВОМ ЕВРОПЕЙСКОЙ ЭКОНОМИЧЕСКОЙ ЗОНЫ. 
            ВСЕ СПОРЫ РАЗРЕШАЮТСЯ В ПОРЯДКЕ АРБИТРАЖНОГО СУДОПРОИЗВОДСТВА.
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="btn-enterprise py-3 px-8 text-[9px]">ЗАПРОСИТЬ DPA</button>
            <button className="btn-outline py-3 px-8 text-[9px]">COMPLIANCE REPORT</button>
          </div>
        </section>
      </div>
    </div>
  );
}
