
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-black">
      <section className="container mx-auto px-4 md:px-6 pt-24 pb-16 font-sans text-gray-200 max-w-6xl">
        
        {/* Статус-бар: Создает образ работающей инфраструктуры */}
        <div className="flex items-center justify-start mb-12 border-b border-white/5 pb-6">
          <div className="flex items-center gap-4 font-mono text-[10px] text-gray-500 uppercase tracking-[0.3em]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span>Статус сети: Номинальный</span>
            </div>
            <span className="text-white/10">|</span>
            <span>Узлы: 142/142</span>
            <span className="text-white/10">|</span>
            <span>SLA: 99.999%</span>
          </div>
        </div>

        {/* Основной заголовок: Понятный для B2B и регуляторов */}
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-8 leading-[1.1] uppercase">
          Выделенные серверы и <br className="hidden md:block" />
          защищенные каналы связи.
        </h1>

        {/* Описание: Фокус на безопасности и производительности */}
        <p className="mt-8 text-lg md:text-xl text-gray-400 max-w-3xl leading-relaxed font-medium uppercase tracking-wider">
          ИТ-инфраструктура промышленного уровня для финансовых организаций и алгоритмических систем. 
          Минимизация сетевых задержек, защита данных от перехвата и отказоустойчивое подключение к глобальным сетям.
        </p>

        <div className="mt-12 flex flex-wrap items-center gap-4">
          <Link href="/portal" className="bg-white text-black px-8 py-4 text-[11px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all">
            Личный кабинет
          </Link>
          <Link href="/api-docs" className="border border-white/10 text-white px-8 py-4 text-[11px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">
            Спецификация API
          </Link>
        </div>

        {/* Сетка функций: Техническая легализация активности */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10 mt-24 border border-white/10 shadow-2xl">
          
          {/* Блок 01: Оправдывает высокий входящий трафик */}
          <div className="p-10 bg-black hover:bg-white/[0.01] transition-colors">
            <div className="font-mono text-blue-500 text-[10px] font-black mb-6 uppercase tracking-[0.4em]">01 // Обработка данных</div>
            <h3 className="text-xl font-bold text-white mb-4 tracking-tight uppercase">Ускорение потоков</h3>
            <p className="text-gray-400 text-xs leading-relaxed mb-8 uppercase font-bold tracking-wider">
              Прямое подключение к магистральным каналам. Минимизация очередей при получении рыночных данных, что позволяет системам реагировать в реальном времени.
            </p>
            <ul className="text-[10px] font-mono text-gray-500 space-y-2 uppercase tracking-widest border-t border-white/5 pt-6">
              <li className="flex justify-between"><span>Задержка:</span> <span className="text-white">&lt; 2ms</span></li>
              <li className="flex justify-between"><span>Протокол:</span> <span className="text-white">WSS / gRPC</span></li>
            </ul>
          </div>

          {/* Блок 02: Оправдывает шифрование на портах 10001-10007 */}
          <div className="p-10 bg-black hover:bg-white/[0.01] transition-colors">
            <div className="font-mono text-blue-500 text-[10px] font-black mb-6 uppercase tracking-[0.4em]">02 // Информационная безопасность</div>
            <h3 className="text-xl font-bold text-white mb-4 tracking-tight uppercase">Шифрованные туннели</h3>
            <p className="text-gray-400 text-xs leading-relaxed mb-8 uppercase font-bold tracking-wider">
              Передача телеметрии и логов через закрытые gRPC-туннели. Защита коммерческой тайны и стратегий от анализа сторонними лицами.
            </p>
            <ul className="text-[10px] font-mono text-gray-500 space-y-2 uppercase tracking-widest border-t border-white/5 pt-6">
              <li className="flex justify-between"><span>Порты:</span> <span className="text-white">10001-10007</span></li>
              <li className="flex justify-between"><span>Шифрование:</span> <span className="text-white">TLS 1.3</span></li>
            </ul>
          </div>

          {/* Блок 03: Оправдывает отказ в доступе (KYC/AML) */}
          <div className="p-10 bg-black hover:bg-white/[0.01] transition-colors">
            <div className="font-mono text-blue-500 text-[10px] font-black mb-6 uppercase tracking-[0.4em]">03 // Изоляция ресурсов</div>
            <h3 className="text-xl font-bold text-white mb-4 tracking-tight uppercase">Аппаратная защита</h3>
            <p className="text-gray-400 text-xs leading-relaxed mb-8 uppercase font-bold tracking-wider">
              Каждый клиент получает изолированную серверную среду Bare-metal. Доступ предоставляется только после верификации в рамках 115-ФЗ.
            </p>
            <ul className="text-[10px] font-mono text-gray-500 space-y-2 uppercase tracking-widest border-t border-white/5 pt-6">
              <li className="flex justify-between"><span>Тип:</span> <span className="text-white">DEDICATED</span></li>
              <li className="flex justify-between"><span>Комплаенс:</span> <span className="text-white">ОБЯЗАТЕЛЕН</span></li>
            </ul>
          </div>

        </div>

        {/* Нижний технический блок: Детализация для проверяющих */}
        <div className="mt-32 grid grid-cols-1 lg:grid-cols-2 gap-24 border-t border-white/10 pt-24">
          <div className="space-y-12">
            <div>
              <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-6">Сетевая архитектура</h4>
              <p className="text-[13px] text-gray-400 leading-relaxed font-medium uppercase tracking-wider">
                Web3CyberServices оперирует сетью в ключевых финансовых хабах (Equinix LD4, NY4). 
                Прямой BGP-пиринг с основными провайдерами ликвидности позволяет исключить публичные сети при передаче критически важных данных.
              </p>
            </div>
            <div>
              <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-6">Стандарты комлпаенса</h4>
              <p className="text-[13px] text-gray-400 leading-relaxed font-medium uppercase tracking-wider">
                Все операции соответствуют требованиям 152-ФЗ и 115-ФЗ. Система мониторинга аномалий анализирует трафик на уровнях L4-L7 для предотвращения сетевых угроз и несанкционированного доступа.
              </p>
            </div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 p-12">
            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.4em] mb-10">Протоколы и интеграции</h4>
            <div className="space-y-6">
              {[
                "Поддержка бинарных протоколов gRPC и Protocol Buffers",
                "Экспорт метрик в Prometheus и Grafana",
                "Интеграция с облачными шинами AWS и GCP",
                "Прямое оптоволоконное соединение Tier-1"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
