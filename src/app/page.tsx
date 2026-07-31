
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-black">
      <section className="container mx-auto px-4 md:px-6 pt-24 pb-16 font-sans text-gray-200 max-w-6xl">
        
        {/* Заголовок */}
        <h1 className="text-4xl md:text-7xl font-bold tracking-tighter text-white mb-8 leading-[1.05]">
          Bare-metal инфраструктура <br className="hidden md:block" />
          для HFT и алгоритмической торговли.
        </h1>

        {/* Техническое описание */}
        <p className="mt-8 text-lg md:text-xl text-gray-400 max-w-3xl leading-relaxed font-medium">
          Выделенные RPC-узлы L1/L2 сетей. Прямой доступ к глобальному мемпулу в обход публичных P2P-сетей. Приватная маршрутизация транзакций для защиты торговых стратегий от MEV-атак.
        </p>

        <div className="mt-12 flex flex-wrap items-center gap-4">
          <Link href="/portal" className="bg-white text-black px-8 py-4 text-[11px] font-black uppercase tracking-widest hover:bg-gray-200 transition-colors">
            Авторизация узла
          </Link>
          <Link href="/api-docs" className="border border-white/10 text-white px-8 py-4 text-[11px] font-black uppercase tracking-widest hover:bg-white/5 transition-colors">
            Документация API
          </Link>
        </div>

        {/* Сетка спецификаций */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10 mt-24 border border-white/10 shadow-2xl">
          
          {/* Блок 01 */}
          <div className="p-10 bg-black hover:bg-white/[0.01] transition-colors">
            <div className="font-mono text-blue-500 text-[10px] font-black mb-6 uppercase tracking-[0.4em]">01 // Mempool Stream</div>
            <h3 className="text-xl font-bold text-white mb-4 tracking-tight">Глобальный стриминг</h3>
            <p className="text-gray-400 text-xs leading-relaxed mb-8 uppercase font-bold tracking-wider">
              Трансляция pending-транзакций по WSS и gRPC. Прямой пиринг с основными блок-билдерами и валидаторами.
            </p>
            <ul className="text-[10px] font-mono text-gray-500 space-y-2 uppercase tracking-widest border-t border-white/5 pt-6">
              <li className="flex justify-between"><span>Latency:</span> <span className="text-white">&lt; 2ms</span></li>
              <li className="flex justify-between"><span>Throughput:</span> <span className="text-white">14.2 GB/s</span></li>
              <li className="flex justify-between"><span>Ports:</span> <span className="text-white">8546, 443</span></li>
            </ul>
          </div>

          {/* Блок 02 */}
          <div className="p-10 bg-black hover:bg-white/[0.01] transition-colors">
            <div className="font-mono text-blue-500 text-[10px] font-black mb-6 uppercase tracking-[0.4em]">02 // Telemetry Ingestion</div>
            <h3 className="text-xl font-bold text-white mb-4 tracking-tight">gRPC Телеметрия</h3>
            <p className="text-gray-400 text-xs leading-relaxed mb-8 uppercase font-bold tracking-wider">
              Мультиплексирование логов HFT-ботов. Закрытые бинарные туннели с Bearer-авторизацией на уровне Edge. 
            </p>
            <ul className="text-[10px] font-mono text-gray-500 space-y-2 uppercase tracking-widest border-t border-white/5 pt-6">
              <li className="flex justify-between"><span>Protocol:</span> <span className="text-white">HTTP/2 gRPC</span></li>
              <li className="flex justify-between"><span>Endpoint:</span> <span className="text-white">/api/v1/collect</span></li>
              <li className="flex justify-between"><span>BGP Ports:</span> <span className="text-white">10001-10007</span></li>
            </ul>
          </div>

          {/* Блок 03 */}
          <div className="p-10 bg-black hover:bg-white/[0.01] transition-colors">
            <div className="font-mono text-blue-500 text-[10px] font-black mb-6 uppercase tracking-[0.4em]">03 // Private Access</div>
            <h3 className="text-xl font-bold text-white mb-4 tracking-tight">Изоляция клиентов</h3>
            <p className="text-gray-400 text-xs leading-relaxed mb-8 uppercase font-bold tracking-wider">
              Доступ к инфраструктуре предоставляется исключительно после ручного прохождения KYC/AML комплаенса.
            </p>
            <ul className="text-[10px] font-mono text-gray-500 space-y-2 uppercase tracking-widest border-t border-white/5 pt-6">
              <li className="flex justify-between"><span>SLA:</span> <span className="text-white">99.999%</span></li>
              <li className="flex justify-between"><span>Isolation:</span> <span className="text-white">Bare-metal</span></li>
              <li className="flex justify-between"><span>Rate Limit:</span> <span className="text-white">Unlimited</span></li>
            </ul>
          </div>

        </div>

        {/* Развернутое техническое описание экосистемы */}
        <div className="mt-32 grid grid-cols-1 lg:grid-cols-2 gap-24 border-t border-white/10 pt-24">
          
          <div className="space-y-12">
            <div>
              <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-6">Сетевая топология</h4>
              <p className="text-[13px] text-gray-400 leading-relaxed font-medium uppercase tracking-wider">
                Web3CyberServices оперирует сетью выделенных узлов в ключевых дата-центрах (Equinix LD4, NY4, TY3). 
                Использование AWS PrivateLink и выделенных BGP-сессий позволяет исключить публичный интернет при передаче транзакций 
                непосредственно к билдерам блоков (Flashbots, bloXroute, Jito). Это гарантирует минимально возможную задержку 
                распространения данных (Ingestion Latency) и исключает риск фронтраннинга на уровне P2P-сети.
              </p>
            </div>
            
            <div>
              <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-6">Безопасность и комплаенс</h4>
              <p className="text-[13px] text-gray-400 leading-relaxed font-medium uppercase tracking-wider">
                Каждый клиентский узел изолирован на аппаратном уровне. Мы используем модули HSM (Hardware Security Modules) 
                для защиты ключей авторизации. Все телеметрические данные передаются через шифрованные бинарные туннели TLS 1.3. 
                В соответствии с корпоративными стандартами, все логи телеметрии хранятся в зашифрованной памяти не более 7 суток, 
                после чего подвергаются криптографическому уничтожению.
              </p>
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-12 space-y-10">
            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Экосистема и интеграции</h4>
            
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-1 h-6 bg-blue-500 shrink-0"></div>
                <div>
                  <div className="text-[11px] font-bold text-white uppercase tracking-widest mb-2">Мониторинг и аналитика</div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest leading-relaxed">
                    Нативный экспорт метрик в Prometheus и Grafana. Поддержка кастомных дашбордов Datadog для отслеживания здоровья ботов.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-1 h-6 bg-blue-500 shrink-0"></div>
                <div>
                  <div className="text-[11px] font-bold text-white uppercase tracking-widest mb-2">Библиотеки разработки</div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest leading-relaxed">
                    Готовые SDK для Rust (Tonic), Go (gRPC-Go) и C++. Прямая поддержка Protocol Buffers для минимальной нагрузки на CPU.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-1 h-6 bg-blue-500 shrink-0"></div>
                <div>
                  <div className="text-[11px] font-bold text-white uppercase tracking-widest mb-2">Облачная связность</div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest leading-relaxed">
                    Прямая интеграция с инфраструктурой Google Cloud Interconnect и Azure ExpressRoute для институциональных клиентов.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-white/5">
              <div className="text-[9px] font-mono text-gray-600 uppercase tracking-[0.3em]">
                Supported protocols: gRPC (HTTP/2), WebSocket Secure (WSS), JSON-RPC over TLS.
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Инфраструктурный футер */}
      <section className="container mx-auto px-4 md:px-6 py-20 max-w-6xl border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="space-y-4">
            <div className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Network Topology</div>
            <p className="text-[11px] text-gray-500 leading-relaxed uppercase font-bold tracking-widest">
              Многоуровневая архитектура с использованием AWS PrivateLink и прямого оптоволоконного соединения с Tier-1 дата-центрами. 
              Все транзакции маршрутизируются через проприетарные релеи для исключения публичного распространения в P2P-сетях до момента включения в блок.
            </p>
          </div>
          <div className="space-y-4">
            <div className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Security Standards</div>
            <p className="text-[11px] text-gray-500 leading-relaxed uppercase font-bold tracking-widest">
              Сквозное шифрование TLS 1.3 с использованием аппаратных модулей безопасности (HSM) для хранения ключей подписи. 
              Система мониторинга в реальном времени анализирует аномалии трафика на уровнях L4-L7.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
