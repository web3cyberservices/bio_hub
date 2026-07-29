
import { Terminal, Shield, Zap, Database, ArrowRight, Code2, Server, Activity, Network } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-grid">
      {/* Hero Section */}
      <section className="container mx-auto px-4 md:px-6 pt-16 md:pt-24 pb-16 max-w-6xl text-center">
        <h1 className="text-3xl md:text-6xl font-black tracking-tighter mb-6 text-white max-w-5xl mx-auto leading-[1.1] uppercase">
          ВЫСОКОПРОИЗВОДИТЕЛЬНАЯ <span className="text-blue-500">WEB3 ИНФРАСТРУКТУРА</span> ДЛЯ АЛГОРИТМИЧЕСКОЙ ТОРГОВЛИ.
        </h1>
        
        <p className="max-w-3xl mx-auto text-muted-foreground text-[10px] md:text-xs mb-10 leading-relaxed font-bold uppercase tracking-widest">
          ВЫДЕЛЕННЫЕ BARE-METAL RPC УЗЛЫ, СТРИМИННГ МЕМПУЛА С МИНИМАЛЬНОЙ ЗАДЕРЖКОЙ И ТЕЛЕМЕТРИЯ ДЛЯ HFT-ОПЕРАТОРОВ. 
          ОБРАБОТКА МАССИВНЫХ ПОТОКОВ ШИФРОВАННЫХ БИНАРНЫХ ДАННЫХ 24/7.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/dashboard" className="btn-enterprise">
            КОНСОЛЬ УПРАВЛЕНИЯ <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
          <Link href="/api-docs" className="btn-outline flex items-center gap-2">
            <Code2 className="w-3.5 h-3.5" /> ТЕХНИЧЕСКИЕ СПЕЦИФИКАЦИИ
          </Link>
        </div>
      </section>

      {/* Core Infrastructure Specifications */}
      <section className="container mx-auto px-4 md:px-6 py-10 border-t border-white/5 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 border border-white/5">
          {[
            {
              title: "КОЛОНОЧНОЕ ХРАНИЛИЩЕ",
              desc: "НАТИВНАЯ ИНТЕГРАЦИЯ С CLICKHOUSE ДЛЯ АНАЛИТИЧЕСКИХ ЗАПРОСОВ ЗА МИЛЛИСЕКУНДЫ ПО МИЛЛИАРДАМ СТРОК."
            },
            {
              title: "АРХИТЕКТУРА ZERO-TRUST",
              desc: "СКВОЗНОЕ ШИФРОВАНИЕ TLS 1.3 С АППАРАТНОЙ ИЗОЛЯЦИЕЙ КЛЮЧЕЙ НА УРОВНЕ HSM УЗЛОВ."
            },
            {
              title: "НАТИВНЫЙ gRPC",
              desc: "ПОДДЕРЖКА БИНАРНЫХ ПРОТОКОЛОВ ДЛЯ МИНИМАЛЬНОЙ НАГРУЗКИ НА CPU И МУЛЬТИПЛЕКСИРОВАНИЯ ПОТОКОВ."
            }
          ].map((feature, i) => (
            <div key={i} className="bg-background p-8 space-y-4 transition-colors hover:bg-white/[0.02]">
              <h3 className="text-[11px] font-black text-white uppercase tracking-widest">{feature.title}</h3>
              <p className="text-[10px] text-muted-foreground leading-relaxed font-bold uppercase tracking-wider">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Network Architecture Summary */}
      <section className="container mx-auto px-4 md:px-6 py-20 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-xl font-black uppercase tracking-tight text-white">МАРШРУТИЗАЦИЯ И ТЕНАНТ-ИЗОЛЯЦИЯ</h2>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-relaxed">
              ИСПОЛЬЗОВАНИЕ ГЕО-СПЕЦИФИЧНЫХ ПОДДОМЕНОВ ДЛЯ ИЗОЛЯЦИИ ТРАФИКА МЕЖДУ БЛОКЧЕЙНАМИ И ПРЕМИУМ-КЛИЕНТАМИ. 
              ПРЯМОЙ ДОСТУП К BARE-METAL ЧЕРЕЗ ВЫДЕЛЕННЫЕ TCP-СОКЕТЫ ДЛЯ МИНИМИЗАЦИИ ДРОЖАНИЯ (JITTER).
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-white/5 bg-white/[0.02]">
                <div className="technical-label">L4 LATENCY</div>
                <div className="data-value mt-1 text-lg">&lt; 1.2ms</div>
              </div>
              <div className="p-4 border border-white/5 bg-white/[0.02]">
                <div className="technical-label">UPTIME SLA</div>
                <div className="data-value mt-1 text-lg">99.999%</div>
              </div>
            </div>
          </div>
          <div className="bg-black/40 border border-white/10 p-6 font-mono text-[10px] space-y-2 rounded-sm overflow-hidden">
            <div className="text-blue-500">// Изолированные эндпоинты маршрутизации</div>
            <div className="text-white/60">eu-telemetry.web3cyberservices.xyz:443</div>
            <div className="text-white/60">eth-rpc.web3cyberservices.xyz:8545</div>
            <div className="text-white/60">mempool-b2b.web3cyberservices.xyz:10001</div>
            <div className="mt-4 pt-4 border-t border-white/5 flex justify-between">
              <span className="text-green-500">STATUS: ACTIVE</span>
              <span className="text-white/20">GEO: EU-WEST-1</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
