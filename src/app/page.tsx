export default function HeroSection() {
  return (
    <div className="min-h-screen bg-grid">
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-16 font-sans text-gray-200">
        
        <header className="mb-20">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-8 leading-[1.1]">
            Инфраструктурные решения для <br className="hidden md:block" />
            высоконагруженных систем
          </h1>

          <div className="space-y-6 max-w-4xl mb-12">
            <p className="text-lg text-gray-400 leading-relaxed font-medium tracking-wide text-[14px]">
              ООО «Веб3 Сайбер Сервисес» — ведущий российский провайдер изолированных вычислительных мощностей и систем 
              анализа данных промышленного уровня. Мы специализируемся на предоставлении отказоустойчивых bare-metal 
              конфигураций, высокоскоростных gRPC-каналов передачи данных и систем глубокого анализа сетевой активности 
              через eBPF-инструментарий.
            </p>
            <p className="text-lg text-gray-400 leading-relaxed font-medium tracking-wide text-[14px]">
              Наша экспертиза охватывает полный цикл обеспечения киберустойчивости: от OSINT-разведки цифровых рисков 
              и мониторинга утечек в Dark Web до внедрения предиктивной телеметрии и проведения комплексных аудитов 
              информационной безопасности по методологиям NIST SP 800-115 и OWASP Top 10. Мы обеспечиваем 
              физическую безопасность ресурсов и гарантированную пропускную способность для финансовых институтов, 
              аналитических агентств и корпоративных HFT-хабов, работая в строгом соответствии с требованиями 
              регуляторов РФ (152-ФЗ «О персональных данных», 115-ФЗ «О противодействии легализации доходов»).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 mb-24">
            <a href="/api-docs" className="btn-outline py-4 px-8 text-[11px]">
              Техническая спецификация (gRPC)
            </a>
          </div>
        </header>

        {/* Core Infrastructure Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10 border border-white/10 mb-32">
          <div className="p-10 bg-black hover:bg-white/[0.01] transition-colors">
            <div className="technical-label mb-6 text-blue-500 text-[10px]">01 // Вычислительные узлы</div>
            <h3 className="text-xl font-black text-white mb-4 tracking-tighter">Bare-metal архитектура</h3>
            <p className="text-gray-400 text-[11px] leading-relaxed mb-8 font-bold tracking-wider">
              Исключение гипервизорного оверхеда через прямой доступ к железу. Использование eBPF-мониторинга на уровне 
              ядра гарантирует прозрачность процессов без деградации производительности. Идеально для высокочастотных 
              вычислений и распределенных реестров.
            </p>
            <div className="text-[9px] font-mono text-white/30 pt-4 border-t border-white/5 tracking-widest">
              Stack: Dual Intel Xeon Gold / 512GB ECC RAM / eBPF
            </div>
          </div>

          <div className="p-10 bg-black hover:bg-white/[0.01] transition-colors">
            <div className="technical-label mb-6 text-blue-500 text-[10px]">02 // Каналы передачи данных</div>
            <h3 className="text-xl font-black text-white mb-4 tracking-tighter">Low-latency связность</h3>
            <p className="text-gray-400 text-[11px] leading-relaxed mb-8 font-bold tracking-wider">
              Магистральная доставка gRPC-потоков через выделенные L1/L2 каналы с FPGA-ускорением на базе SmartNIC. 
              Средняя задержка на внутреннем бэкбоне составляет менее 0.12 мс при пропускной способности до 100 Гбит/с.
            </p>
            <div className="text-[9px] font-mono text-white/30 pt-4 border-t border-white/5 tracking-widest">
              Backbone: 100 Gbps Dark Fiber / FPGA / SmartNIC
            </div>
          </div>

          <div className="p-10 bg-black hover:bg-white/[0.01] transition-colors">
            <div className="technical-label mb-6 text-blue-500 text-[10px]">03 // Информационная безопасность</div>
            <h3 className="text-xl font-black text-white mb-4 tracking-tighter">Сетевая изоляция и аудит</h3>
            <p className="text-gray-400 text-[11px] leading-relaxed mb-8 font-bold tracking-wider">
              Двусторонняя mTLS-авторизация и закрытые VPC. Регулярные пентесты методами Black/Grey Box и автоматизация 
              комплаенса (Compliance as Code) обеспечивают устойчивость к сложным таргетированным угрозам.
            </p>
            <div className="text-[9px] font-mono text-white/30 pt-4 border-t border-white/5 tracking-widest">
              Compliance: 152-FZ / NIST / SOC 2 / mTLS
            </div>
          </div>
        </div>

        {/* Detailed Services Overview */}
        <section className="space-y-16 mb-32">
          <div className="max-w-3xl">
            <h2 className="technical-label mb-8 text-blue-500 text-[10px]">Направления деятельности</h2>
            <h3 className="text-3xl font-black text-white mb-6 tracking-tight">Экосистема технологических сервисов</h3>
            <p className="text-gray-400 text-[12px] leading-relaxed font-bold tracking-widest">
              Мы объединяем передовые разработки в области кибербезопасности, DevSecOps и обработки больших данных для создания 
              безопасной среды исполнения ваших бизнес-алгоритмов.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 border border-white/10 bg-white/[0.01] space-y-4">
              <h4 className="text-white font-black text-lg tracking-tight">Агрегация данных и OSINT</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed font-bold tracking-wider">
                Глубокий мониторинг цифровых рисков, выявление утечек в Dark Web и проверка контрагентов по 115-ФЗ. 
                Анализ скрытых связей и бенефициаров через автоматизированные разведсистемы.
              </p>
              <a href="/services/osint" className="inline-flex items-center gap-2 text-blue-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">
                Подробнее о методологии →
              </a>
            </div>
            
            <div className="p-8 border border-white/10 bg-white/[0.01] space-y-4">
              <h4 className="text-white font-black text-lg tracking-tight">Провайдер потоковых данных</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed font-bold tracking-wider">
                Доставка рыночной телеметрии через gRPC-туннели. Использование бинарного Protobuf минимизирует оверхед, 
                обеспечивая доставку событий мемпула и биржевых стаканов с микросекундной точностью.
              </p>
              <a href="/services/data-streaming" className="inline-flex items-center gap-2 text-blue-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">
                Технический регламент →
              </a>
            </div>

            <div className="p-8 border border-white/10 bg-white/[0.01] space-y-4">
              <h4 className="text-white font-black text-lg tracking-tight">Аудит ИБ (Pentest)</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed font-bold tracking-wider">
                Имитация целенаправленных атак по стандартам NIST и OWASP. Аудит API и микросервисов с предоставлением 
                детального отчета, CVSS-оценки уязвимостей и верификацией исправлений (Re-test).
              </p>
              <a href="/services/pentest" className="inline-flex items-center gap-2 text-blue-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">
                Спецификация аудита →
              </a>
            </div>

            <div className="p-8 border border-white/10 bg-white/[0.01] space-y-4">
              <h4 className="text-white font-black text-lg tracking-tight">B2B Телеметрия и DevSecOps</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed font-bold tracking-wider">
                Внедрение Secure SDLC (SAST/DAST) и предиктивного мониторинга на базе eBPF. Автоматизация комплаенса 
                и контроль рантайма контейнеров в CI/CD пайплайнах.
              </p>
              <div className="flex gap-4">
                <a href="/services/telemetry" className="inline-flex items-center gap-2 text-blue-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">
                  Мониторинг →
                </a>
                <a href="/services/devsecops" className="inline-flex items-center gap-2 text-blue-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">
                  Консалтинг →
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Global Presence & Legal */}
        <section className="mt-32 space-y-12 border-t border-white/10 pt-20">
          <div className="max-w-3xl">
            <h2 className="technical-label mb-8 text-blue-500 text-[10px]">Глобальное присутствие</h2>
            <p className="text-gray-400 text-[12px] leading-relaxed font-bold tracking-widest">
              Инфраструктура компании развернута в дата-центрах уровня Tier III+ в РФ (MSK-IX / NORD) и дружественных 
              юрисдикциях, обеспечивая соблюдение законов о локализации данных и географическую избыточность.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { region: 'RU-CENTRAL', location: 'Moscow / MSK-IX', status: 'Operational' },
              { region: 'ASIA-EAST', location: 'Hong Kong / Equinix', status: 'Operational' },
              { region: 'ME-SOUTH', location: 'Dubai / Datamena', status: 'Operational' },
              { region: 'RU-WEST', location: 'Saint Petersburg', status: 'Operational' }
            ].map((loc) => (
              <div key={loc.region} className="p-6 border border-white/5 bg-white/[0.02]">
                <div className="text-[9px] text-white/40 mb-2 tracking-widest font-black uppercase">{loc.region}</div>
                <div className="text-[11px] text-white font-black mb-4">{loc.location}</div>
                <div className="text-[8px] text-emerald-500 font-mono tracking-[0.2em] uppercase">{loc.status}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Compliance Footer Block */}
        <section className="mt-32 p-12 bg-white/[0.01] border border-white/10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-black tracking-tighter text-white">Соответствие регуляторным нормам</h2>
              <p className="text-[11px] text-muted-foreground tracking-widest max-w-3xl font-bold leading-relaxed">
                Мы придерживаемся строгих протоколов безопасности и юридической чистоты. Все услуги предоставляются 
                в рамках правового поля РФ, включая 152-ФЗ («О персональных данных») и 115-ФЗ. Регулярный внутренний 
                аудит по методологии NIST и сертификация ISO 27001 обеспечивают непрерывность ваших процессов.
              </p>
            </div>
            <div className="flex gap-4 shrink-0">
              <div className="px-4 py-2 border border-white/10 text-[9px] font-black tracking-widest text-white/60 uppercase">ISO 27001 Certified</div>
              <div className="px-4 py-2 border border-white/10 text-[9px] font-black tracking-widest text-white/60 uppercase">NIST Compliant</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
