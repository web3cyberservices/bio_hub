export default function HeroSection() {
  return (
    <div className="max-w-6xl mx-auto px-4 pt-24 pb-16 font-sans text-gray-200">
      
      {/* Приветственный блок */}
      <div className="flex items-center justify-start mb-8 border-b border-gray-800 pb-4">
        <div className="flex items-center gap-3 font-mono text-xs text-gray-500 uppercase tracking-widest">
          <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
          <span>Система управления узлами: Активна</span>
        </div>
      </div>

      <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
        Надежные серверы и защищенные каналы <br className="hidden md:block" />
        для алгоритмической торговли
      </h1>

      <p className="mt-6 text-lg text-gray-400 max-w-3xl leading-relaxed">
        Мы предоставляем ИТ-инфраструктуру для торговых ботов и финансовых фондов. 
        Ускоряем получение биржевых данных, защищаем ваш трафик от перехвата конкурентами и обеспечиваем бесперебойную связь с блокчейн-сетями.
      </p>

      <div className="mt-10 flex items-center gap-4">
        <a href="/portal" className="bg-gray-100 text-gray-900 px-6 py-3 font-medium hover:bg-white transition-colors">
          Личный кабинет
        </a>
        <a href="/api-docs" className="border border-gray-700 text-gray-300 px-6 py-3 font-medium hover:bg-gray-800 transition-colors">
          Спецификация API
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-800 mt-20 border border-gray-800">
        
        <div className="p-8 bg-gray-950">
          <div className="font-mono text-cyan-500 text-sm mb-4">01 // Ускорение данных</div>
          <h3 className="text-lg font-semibold text-white mb-3">Прямое подключение</h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            Вашим программам больше не нужно ждать в общих очередях. Вы получаете выделенный сервер, который считывает новые транзакции моментально.
          </p>
          <div className="text-xs font-mono text-gray-500 pt-4 border-t border-gray-900">
            Задержка передачи: &lt; 2ms
          </div>
        </div>

        <div className="p-8 bg-gray-950">
          <div className="font-mono text-cyan-500 text-sm mb-4">02 // Защита трафика</div>
          <h3 className="text-lg font-semibold text-white mb-3">Шифрованные туннели</h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            Торговые стратегии уязвимы для перехвата. Весь обмен данными между ботами и серверами проходит через закрытые зашифрованные каналы.
          </p>
          <div className="text-xs font-mono text-gray-500 pt-4 border-t border-gray-900">
            Порты: 10001-10007 (TLS 1.3)
          </div>
        </div>

        <div className="p-8 bg-gray-950">
          <div className="font-mono text-cyan-500 text-sm mb-4">03 // Безопасность</div>
          <h3 className="text-lg font-semibold text-white mb-3">Изоляция среды</h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            Каждый клиент получает изолированную среду. В целях соблюдения законов РФ (115-ФЗ), доступ предоставляется после верификации.
          </p>
          <div className="text-xs font-mono text-gray-500 pt-4 border-t border-gray-900">
            SLA: 99.999%
          </div>
        </div>

      </div>
    </div>
  );
}
