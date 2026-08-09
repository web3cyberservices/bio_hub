export default function HeroSection() {
  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-grid px-4 overflow-hidden">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col justify-center max-w-6xl mx-auto w-full">
        <header className="space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
            Инфраструктурные решения для <br className="hidden md:block" />
            высоконагруженных систем
          </h1>

          <div className="max-w-2xl">
            <p className="text-[12px] md:text-[14px] text-gray-400 leading-relaxed font-medium tracking-wide">
              ООО «Веб3 Сайбер Сервисес» — ведущий российский провайдер изолированных вычислительных мощностей и систем 
              анализа данных промышленного уровня. Мы специализируемся на предоставлении отказоустойчивых bare-metal 
              конфигураций и высокоскоростных gRPC-каналов передачи данных.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <a href="/api-docs" className="btn-outline py-4 px-8 text-[11px]">
              Техническая спецификация
            </a>
            <a href="/pricing" className="btn-enterprise py-4 px-8 text-[11px]">
              Тарифные планы
            </a>
          </div>
        </header>
      </div>

      {/* Compliance strip - Always at the bottom */}
      <div className="max-w-6xl mx-auto w-full py-4 border-t border-white/10 shrink-0">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-0.5">
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
    </div>
  );
}
