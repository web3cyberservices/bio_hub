export default function HeroSection() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col bg-grid px-4">
      {/* Hero Section - Fits entirely in viewport */}
      <div className="flex-1 flex flex-col justify-center max-w-6xl mx-auto w-full py-8">
        <header className="mb-6">
          <h1 className="text-3xl md:text-5xl lg:text-7xl font-black tracking-tight text-white mb-6 leading-[1.05]">
            Инфраструктурные решения для <br className="hidden md:block" />
            высоконагруженных систем
          </h1>

          <div className="space-y-4 max-w-3xl mb-8">
            <p className="text-[13px] md:text-base text-gray-400 leading-relaxed font-medium tracking-wide">
              ООО «Веб3 Сайбер Сервисес» — ведущий российский провайдер изолированных вычислительных мощностей и систем 
              анализа данных промышленного уровня. Мы специализируемся на предоставлении отказоустойчивых bare-metal 
              конфигураций и высокоскоростных gRPC-каналов передачи данных.
            </p>
            <p className="text-[13px] md:text-base text-gray-400 leading-relaxed font-medium tracking-wide">
              Наша экспертиза охватывает полный цикл обеспечения киберустойчивости: от OSINT-разведки цифровых рисков 
              до внедрения предиктивной телеметрии и проведения комплексных аудитов безопасности (152-ФЗ, 115-ФЗ).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <a href="/api-docs" className="btn-outline py-4 px-8 text-[11px]">
              Техническая спецификация
            </a>
            <a href="/pricing" className="btn-enterprise py-4 px-8 text-[11px]">
              Тарифные планы
            </a>
          </div>
        </header>
      </div>

      {/* Meta/Compliance strip at the bottom of the fold */}
      <div className="max-w-6xl mx-auto w-full py-6 border-t border-white/10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-[10px] font-black tracking-tighter text-white uppercase">Комплаенс-статус</h2>
            <p className="text-[9px] text-muted-foreground tracking-widest font-bold">
              Все услуги предоставляются в рамках правового поля РФ (152-ФЗ, 115-ФЗ).
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <div className="px-2 py-1 border border-white/10 text-[7px] font-black tracking-widest text-white/60 uppercase">ISO 27001</div>
            <div className="px-2 py-1 border border-white/10 text-[7px] font-black tracking-widest text-white/60 uppercase">NIST</div>
          </div>
        </div>
      </div>

      {/* Secondary content starts below the fold */}
      <div className="max-w-6xl mx-auto w-full py-20 space-y-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10 border border-white/10">
          <div className="p-8 bg-black hover:bg-white/[0.01] transition-colors">
            <div className="technical-label mb-3 text-blue-500 text-[9px]">01 // Вычислительные узлы</div>
            <h3 className="text-base font-black text-white mb-2 tracking-tighter">Bare-metal архитектура</h3>
            <p className="text-gray-400 text-[10px] leading-relaxed mb-4 font-bold tracking-wider">
              Прямой доступ к железу без гипервизорного оверхеда. eBPF-мониторинг гарантирует прозрачность.
            </p>
          </div>
          <div className="p-8 bg-black hover:bg-white/[0.01] transition-colors">
            <div className="technical-label mb-3 text-blue-500 text-[9px]">02 // Каналы данных</div>
            <h3 className="text-base font-black text-white mb-2 tracking-tighter">Low-latency связность</h3>
            <p className="text-gray-400 text-[10px] leading-relaxed mb-4 font-bold tracking-wider">
              Доставка gRPC-потоков через выделенные L1/L2 каналы с FPGA-ускорением.
            </p>
          </div>
          <div className="p-8 bg-black hover:bg-white/[0.01] transition-colors">
            <div className="technical-label mb-3 text-blue-500 text-[9px]">03 // Безопасность</div>
            <h3 className="text-base font-black text-white mb-2 tracking-tighter">Сетевая изоляция</h3>
            <p className="text-gray-400 text-[10px] leading-relaxed mb-4 font-bold tracking-wider">
              Двусторонняя mTLS-авторизация и закрытые VPC. Полная автоматизация комплаенса.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}