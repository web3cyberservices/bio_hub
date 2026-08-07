
export default function HeroSection() {
  return (
    <div className="min-h-screen bg-grid">
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-16 font-sans text-gray-200">
        
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-8 leading-[1.1]">
          Инфраструктурные решения для <br className="hidden md:block" />
          высоконагруженных систем
        </h1>

        <p className="text-lg text-gray-400 max-w-3xl leading-relaxed mb-12 font-medium tracking-wide text-[13px]">
          ООО «Веб3 Сайбер Сервисес» предоставляет выделенные вычислительные мощности и каналы передачи данных для финансовых институтов, 
          аналитических агентств и разработчиков алгоритмических систем. Мы обеспечиваем физическую изоляцию ресурсов и гарантированную 
          пропускную способность в глобальных сетях.
        </p>

        <div className="flex items-center gap-4 mb-24">
          <a href="/portal" className="btn-enterprise py-4 px-8 text-[11px]">
            Личный кабинет
          </a>
          <a href="/api-docs" className="btn-outline py-4 px-8 text-[11px]">
            Техническая спецификация
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10 border border-white/10">
          <div className="p-10 bg-black">
            <div className="technical-label mb-6 text-blue-500">01 // Вычислительные узлы</div>
            <h3 className="text-lg font-black text-white mb-4 tracking-tighter">Bare-Metal Infrastructure</h3>
            <p className="text-gray-400 text-[11px] leading-relaxed mb-8 font-bold tracking-wider">
              Предоставление выделенных серверов без уровня виртуализации. Это исключает влияние «соседних» процессов на производительность 
              и обеспечивает стабильное время отклика в микросекундном диапазоне.
            </p>
            <div className="text-[9px] font-mono text-white/30 pt-4 border-t border-white/5 tracking-widest">
              Configuration: Dual Intel Xeon Gold / 256GB RAM
            </div>
          </div>

          <div className="p-10 bg-black">
            <div className="technical-label mb-6 text-blue-500">02 // Передача данных</div>
            <h3 className="text-lg font-black text-white mb-4 tracking-tighter">Low-Latency Connectivity</h3>
            <p className="text-gray-400 text-[11px] leading-relaxed mb-8 font-bold tracking-wider">
              Прямое подключение к ключевым точкам обмена трафиком через выделенные оптоволоконные каналы. Минимизация маршрутов и 
              отсутствие буферизации на промежуточных узлах.
            </p>
            <div className="text-[9px] font-mono text-white/30 pt-4 border-t border-white/5 tracking-widest">
              Backbone: 100 Gbps Dark Fiber Links
            </div>
          </div>

          <div className="p-10 bg-black">
            <div className="technical-label mb-6 text-blue-500">03 // Безопасность</div>
            <h3 className="text-lg font-black text-white mb-4 tracking-tighter">Network Isolation</h3>
            <p className="text-gray-400 text-[11px] leading-relaxed mb-8 font-bold tracking-wider">
              Организация закрытых виртуальных сетей (VPC) и аппаратное шифрование трафика. Доступ к инфраструктуре регламентирован 
              в соответствии с требованиями комплаенса и информационной безопасности.
            </p>
            <div className="text-[9px] font-mono text-white/30 pt-4 border-t border-white/5 tracking-widest">
              Encryption: Hardware-level AES-256-GCM
            </div>
          </div>
        </div>

        <section className="mt-32 space-y-12 border-t border-white/10 pt-20">
          <div className="max-w-3xl">
            <h2 className="technical-label mb-8 text-blue-500">Глобальное присутствие</h2>
            <p className="text-gray-400 text-[11px] leading-relaxed font-bold tracking-widest">
              Инфраструктура ООО «Веб3 Сайбер Сервисес» развернута в стратегически важных дата-центрах Tier III+, обеспечивая 
              географическую избыточность и отказоустойчивость. Наши узлы расположены в точках с минимальной дистанцией до 
              крупнейших клиринговых и торговых систем мира.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { region: 'EU-WEST', location: 'Frankfurt / London', status: 'Operational' },
              { region: 'US-EAST', location: 'New York / Ashburn', status: 'Operational' },
              { region: 'ASIA-PACIFIC', location: 'Tokyo / Singapore', status: 'Operational' },
              { region: 'RU-CENTRAL', location: 'Moscow / MSK-IX', status: 'Operational' }
            ].map((loc) => (
              <div key={loc.region} className="p-6 border border-white/5 bg-white/[0.02]">
                <div className="text-[9px] text-white/40 mb-2 tracking-widest font-black">{loc.region}</div>
                <div className="text-[10px] text-white font-black mb-4">{loc.location}</div>
                <div className="text-[8px] text-emerald-500 font-mono tracking-[0.2em]">{loc.status}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-32 p-12 bg-white/[0.01] border border-white/10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="space-y-4">
              <h2 className="text-xl font-black tracking-tighter text-white">Соответствие стандартам</h2>
              <p className="text-[10px] text-muted-foreground tracking-widest max-w-2xl font-bold leading-relaxed">
                Мы придерживаемся строгих протоколов безопасности и юридической чистоты. Все услуги предоставляются в рамках 
                действующего законодательства РФ, включая 152-ФЗ и 115-ФЗ. Регулярный аудит систем обеспечивает 
                непрерывность бизнес-процессов наших клиентов.
              </p>
            </div>
            <div className="flex gap-4 shrink-0">
              <div className="px-4 py-2 border border-white/10 text-[8px] font-black tracking-widest text-white/60">ISO 27001 compliant</div>
              <div className="px-4 py-2 border border-white/10 text-[8px] font-black tracking-widest text-white/60">SOC 2 Type II</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
