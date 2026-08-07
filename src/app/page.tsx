
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-black">
      <section className="container mx-auto px-4 md:px-6 pt-24 pb-16 font-sans text-gray-200 max-w-6xl">
        
        {/* Понятный заголовок для B2B */}
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-8 leading-[1.1]">
          Надежные серверы и защищенные каналы <br className="hidden md:block" />
          для алгоритмической торговли
        </h1>

        {/* Расшифровка простыми словами */}
        <p className="mt-8 text-lg md:text-xl text-gray-400 max-w-3xl leading-relaxed font-medium uppercase tracking-wider">
          Мы предоставляем ИТ-инфраструктуру для торговых ботов и финансовых фондов. 
          Ускоряем получение биржевых данных, защищаем ваш трафик от перехвата конкурентами и обеспечиваем бесперебойную связь с блокчейн-сетями.
        </p>

        <div className="mt-12 flex flex-wrap items-center gap-4">
          <Link href="/portal" className="bg-white text-black px-8 py-4 text-[11px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all">
            Личный кабинет
          </Link>
          <Link href="/api-docs" className="border border-white/10 text-white px-8 py-4 text-[11px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">
            Спецификация API
          </Link>
        </div>

        {/* Сетка функций */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10 mt-24 border border-white/10 shadow-2xl">
          
          {/* Функция 1: Ускорение данных */}
          <div className="p-10 bg-black hover:bg-white/[0.01] transition-colors">
            <div className="font-mono text-blue-500 text-[10px] font-black mb-6 uppercase tracking-[0.4em]">01 // Ускорение данных</div>
            <h3 className="text-xl font-bold text-white mb-4 tracking-tight uppercase">Прямое подключение</h3>
            <p className="text-gray-400 text-xs leading-relaxed mb-8 uppercase font-bold tracking-wider">
              Вашим программам больше не нужно ждать в общих очередях. Вы получаете выделенный сервер, который считывает новые транзакции моментально.
            </p>
            <div className="text-[10px] font-mono text-gray-500 pt-6 border-t border-white/5 uppercase tracking-widest flex justify-between">
              <span>Latency:</span> <span className="text-white">&lt; 2ms</span>
            </div>
          </div>

          {/* Функция 2: Защита трафика */}
          <div className="p-10 bg-black hover:bg-white/[0.01] transition-colors">
            <div className="font-mono text-blue-500 text-[10px] font-black mb-6 uppercase tracking-[0.4em]">02 // Защита трафика</div>
            <h3 className="text-xl font-bold text-white mb-4 tracking-tight uppercase">Шифрованные туннели</h3>
            <p className="text-gray-400 text-xs leading-relaxed mb-8 uppercase font-bold tracking-wider">
              Весь обмен данными между вашими ботами и нашими серверами проходит через закрытые защищенные туннели. Никто не увидит ваши сделки.
            </p>
            <div className="text-[10px] font-mono text-gray-500 pt-6 border-t border-white/5 uppercase tracking-widest flex justify-between">
              <span>Порты:</span> <span className="text-white">10001-10007</span>
            </div>
          </div>

          {/* Функция 3: Безопасность */}
          <div className="p-10 bg-black hover:bg-white/[0.01] transition-colors">
            <div className="font-mono text-blue-500 text-[10px] font-black mb-6 uppercase tracking-[0.4em]">03 // Безопасность</div>
            <h3 className="text-xl font-bold text-white mb-4 tracking-tight uppercase">Изоляция среды</h3>
            <p className="text-gray-400 text-xs leading-relaxed mb-8 uppercase font-bold tracking-wider">
              Каждый клиент получает изолированную среду. В целях соблюдения законов РФ (115-ФЗ), доступ предоставляется только после верификации.
            </p>
            <div className="text-[10px] font-mono text-gray-500 pt-6 border-t border-white/5 uppercase tracking-widest flex justify-between">
              <span>SLA:</span> <span className="text-white">99.999%</span>
            </div>
          </div>

        </div>

        {/* Инфраструктурный блок */}
        <div className="mt-32 grid grid-cols-1 lg:grid-cols-2 gap-24 border-t border-white/10 pt-24">
          <div className="space-y-12">
            <div>
              <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-6">Сетевая топология</h4>
              <p className="text-[13px] text-gray-400 leading-relaxed font-medium uppercase tracking-wider">
                Мы используем прямой BGP-пиринг с основными финансовыми хабами. Это исключает задержки публичных сетей и обеспечивает максимальную стабильность потоков.
              </p>
            </div>
            <div>
              <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-6">Комплаенс</h4>
              <p className="text-[13px] text-gray-400 leading-relaxed font-medium uppercase tracking-wider">
                Инфраструктура полностью соответствует стандартам 152-ФЗ и 115-ФЗ. Все данные локализованы на территории РФ в защищенных дата-центрах.
              </p>
            </div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 p-12">
            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.4em] mb-10">Протоколы</h4>
            <div className="space-y-6">
              {[
                "Бинарные протоколы gRPC / Protobuf",
                "Метрики Prometheus / Grafana",
                "Интеграция с AWS PrivateLink",
                "Магистральные каналы Tier-1"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
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
