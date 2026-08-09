export default function HeroSection() {
  return (
    <div className="min-h-screen bg-grid">
      <div className="max-w-6xl mx-auto px-4 pt-8 md:pt-12 pb-8 font-sans text-gray-200">
        
        <header className="mb-8 md:mb-12">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-black tracking-tight text-white mb-4 leading-[1.1]">
            Инфраструктурные решения для <br className="hidden md:block" />
            высоконагруженных систем
          </h1>

          <div className="space-y-3 max-w-4xl mb-6">
            <p className="text-[12px] md:text-sm text-gray-400 leading-relaxed font-medium tracking-wide">
              ООО «Веб3 Сайбер Сервисес» — ведущий российский провайдер изолированных вычислительных мощностей и систем 
              анализа данных промышленного уровня. Мы специализируемся на предоставлении отказоустойчивых bare-metal 
              конфигураций и высокоскоростных gRPC-каналов передачи данных.
            </p>
            <p className="text-[12px] md:text-sm text-gray-400 leading-relaxed font-medium tracking-wide">
              Наша экспертиза охватывает полный цикл обеспечения киберустойчивости: от OSINT-разведки цифровых рисков 
              до внедрения предиктивной телеметрии и проведения комплексных аудитов безопасности в строгом соответствии 
              с требованиями регуляторов РФ (152-ФЗ, 115-ФЗ).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a href="/api-docs" className="btn-outline py-2.5 px-5 text-[10px]">
              Техническая спецификация
            </a>
            <a href="/pricing" className="btn-enterprise py-2.5 px-5 text-[10px]">
              Тарифные планы
            </a>
          </div>
        </header>

        {/* Core Infrastructure Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10 border border-white/10 mb-12 md:mb-16">
          <div className="p-6 bg-black hover:bg-white/[0.01] transition-colors">
            <div className="technical-label mb-3 text-blue-500 text-[9px]">01 // Вычислительные узлы</div>
            <h3 className="text-base font-black text-white mb-2 tracking-tighter">Bare-metal архитектура</h3>
            <p className="text-gray-400 text-[9px] leading-relaxed mb-4 font-bold tracking-wider">
              Прямой доступ к железу без гипервизорного оверхеда. eBPF-мониторинг гарантирует прозрачность без потери скорости.
            </p>
            <div className="text-[8px] font-mono text-white/30 pt-3 border-t border-white/5 tracking-widest uppercase">
              Xeon Gold / 512GB RAM / eBPF
            </div>
          </div>

          <div className="p-6 bg-black hover:bg-white/[0.01] transition-colors">
            <div className="technical-label mb-3 text-blue-500 text-[9px]">02 // Каналы данных</div>
            <h3 className="text-base font-black text-white mb-2 tracking-tighter">Low-latency связность</h3>
            <p className="text-gray-400 text-[9px] leading-relaxed mb-4 font-bold tracking-wider">
              Доставка gRPC-потоков через выделенные L1/L2 каналы с FPGA-ускорением. Задержка на бэкбоне менее 0.12 мс.
            </p>
            <div className="text-[8px] font-mono text-white/30 pt-3 border-t border-white/5 tracking-widest uppercase">
              100 Gbps / FPGA / SmartNIC
            </div>
          </div>

          <div className="p-6 bg-black hover:bg-white/[0.01] transition-colors">
            <div className="technical-label mb-3 text-blue-500 text-[9px]">03 // Безопасность</div>
            <h3 className="text-base font-black text-white mb-2 tracking-tighter">Сетевая изоляция</h3>
            <p className="text-gray-400 text-[9px] leading-relaxed mb-4 font-bold tracking-wider">
              Двусторонняя mTLS-авторизация и закрытые VPC. Регулярные пентесты и полная автоматизация комплаенса.
            </p>
            <div className="text-[8px] font-mono text-white/30 pt-3 border-t border-white/5 tracking-widest uppercase">
              152-FZ / NIST / SOC 2
            </div>
          </div>
        </div>

        {/* Simplified Services Section */}
        <section className="space-y-8 mb-16">
          <div className="max-w-3xl">
            <h2 className="technical-label mb-3 text-blue-500 text-[9px]">Сервисы</h2>
            <h3 className="text-xl font-black text-white mb-3 tracking-tight">Экосистема технологических решений</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 border border-white/10 bg-white/[0.01] space-y-2">
              <h4 className="text-white font-black text-sm tracking-tight">Агрегация данных и OSINT</h4>
              <p className="text-[9px] text-muted-foreground leading-relaxed font-bold tracking-wider">
                Мониторинг цифровых рисков, выявление утечек в Dark Web и проверка контрагентов.
              </p>
              <a href="/services/osint" className="inline-flex items-center gap-2 text-blue-500 text-[8px] font-black uppercase tracking-widest hover:text-white transition-colors">
                Подробнее →
              </a>
            </div>
            
            <div className="p-5 border border-white/10 bg-white/[0.01] space-y-2">
              <h4 className="text-white font-black text-sm tracking-tight">Потоковые данные</h4>
              <p className="text-[9px] text-muted-foreground leading-relaxed font-bold tracking-wider">
                Доставка рыночной телеметрии через gRPC-туннели с микросекундной точностью.
              </p>
              <a href="/services/data-streaming" className="inline-flex items-center gap-2 text-blue-500 text-[8px] font-black uppercase tracking-widest hover:text-white transition-colors">
                Регламент →
              </a>
            </div>
          </div>
        </section>

        <section className="p-6 bg-white/[0.01] border border-white/10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-lg font-black tracking-tighter text-white">Комплаенс</h2>
              <p className="text-[9px] text-muted-foreground tracking-widest max-w-2xl font-bold leading-relaxed">
                Все услуги предоставляются в рамках правового поля РФ (152-ФЗ, 115-ФЗ). 
                Аудит по методологии NIST и сертификация ISO 27001.
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <div className="px-2 py-1 border border-white/10 text-[7px] font-black tracking-widest text-white/60 uppercase">ISO 27001</div>
              <div className="px-2 py-1 border border-white/10 text-[7px] font-black tracking-widest text-white/60 uppercase">NIST</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
