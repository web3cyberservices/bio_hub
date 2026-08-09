
import { Zap, Activity, ArrowRightLeft, Server, Database, Globe, ShieldCheck, Cpu } from 'lucide-react';
import Link from 'next/link';

export default function DataStreamingPage() {
  return (
    <div className="min-h-screen bg-grid py-20 md:py-32">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Hero Section */}
        <div className="mb-24 border-b border-white/10 pb-16">
          <div className="flex flex-wrap gap-3 mb-8">
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-black uppercase tracking-widest rounded-full">
              Uptime 99.999% Guaranteed
            </span>
            <span className="px-3 py-1 bg-white/5 border border-white/10 text-white/60 text-[9px] font-black uppercase tracking-widest rounded-full">
              Throughput 100 Gbps Dark Fiber
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 leading-[1.05]">
            Магистральные каналы доставки <br className="hidden lg:block" /> рыночных данных (L1/L2)
          </h1>
          <p className="text-[13px] md:text-[15px] text-muted-foreground font-medium tracking-wide max-w-3xl leading-relaxed mb-10">
            Обеспечение минимальных задержек (low-latency) для финансовых институтов и торговых алгоритмов. 
            Прямой доступ к мемпулам и биржевым агрегаторам через изолированные gRPC-потоки и оптимизированный сетевой стек.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <a href="#b2b-form" className="btn-enterprise py-4 px-8 text-[11px]">
              Подключить узел (B2B)
            </a>
            <Link href="/api-docs" className="btn-outline py-4 px-8 text-[11px]">
              gRPC Specification
            </Link>
          </div>
        </div>

        {/* Technical Capabilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
          {[
            {
              icon: <Zap className="w-6 h-6 text-blue-500" />,
              title: "Native gRPC / Protobuf",
              desc: "Бинарный протокол передачи данных, минимизирующий оверхед на сериализацию по сравнению с JSON-RPC."
            },
            {
              icon: <Cpu className="w-6 h-6 text-blue-500" />,
              title: "SmartNIC Acceleration",
              desc: "Обработка пакетов на уровне сетевых карт FPGA, исключающая прерывания ядра ОС и системные задержки."
            },
            {
              icon: <ArrowRightLeft className="w-6 h-6 text-blue-500" />,
              title: "Zero-Latency WSS",
              desc: "Сырые WebSocket потоки для моментальной доставки событий мемпула и обновлений биржевых стаканов."
            },
            {
              icon: <Database className="w-6 h-6 text-blue-500" />,
              title: "Dedicated Mempool Feed",
              desc: "Выделенный поток необработанных транзакций с защитой от фронтраннинга и фильтрацией спама."
            },
            {
              icon: <Globe className="w-6 h-6 text-blue-500" />,
              title: "Cross-Region Peering",
              desc: "Прямые стыки во Франкфурте (Equinix), Лондоне и Сингапуре для глобального покрытия торговых площадок."
            },
            {
              icon: <ShieldCheck className="w-6 h-6 text-blue-500" />,
              title: "mTLS Authentication",
              desc: "Двусторонняя криптографическая проверка сертификатов для защиты канала от перехвата данных."
            }
          ].map((item, i) => (
            <div key={i} className="p-10 border border-white/10 bg-black/40 backdrop-blur-sm space-y-6 hover:border-blue-500/30 transition-colors">
              {item.icon}
              <h3 className="text-lg font-black text-white tracking-tighter">{item.title}</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed font-bold tracking-wider">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Performance Metrics */}
        <div className="mt-20 p-12 border border-white/10 bg-white/[0.01] mb-32">
          <h4 className="technical-label mb-10 text-center">Лабораторные показатели каналов связи</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 font-mono">
            <div className="text-center">
              <div className="text-[9px] text-white/40 mb-3 tracking-widest">Mean Latency</div>
              <div className="text-white font-black text-2xl tracking-tighter">0.12ms</div>
              <div className="text-[8px] text-blue-500 mt-2">Internal Backbone</div>
            </div>
            <div className="text-center">
              <div className="text-[9px] text-white/40 mb-3 tracking-widest">Jitter (std dev)</div>
              <div className="text-white font-black text-2xl tracking-tighter">~8μs</div>
              <div className="text-[8px] text-blue-500 mt-2">Ultra-Stable</div>
            </div>
            <div className="text-center">
              <div className="text-[9px] text-white/40 mb-3 tracking-widest">Throughput</div>
              <div className="text-white font-black text-2xl tracking-tighter">100G</div>
              <div className="text-[8px] text-blue-500 mt-2">Aggregate Capacity</div>
            </div>
            <div className="text-center">
              <div className="text-[9px] text-white/40 mb-3 tracking-widest">Packet Loss</div>
              <div className="text-white font-black text-2xl tracking-tighter">0.00%</div>
              <div className="text-[8px] text-blue-500 mt-2">Redundant Links</div>
            </div>
          </div>
        </div>

        {/* B2B Provisioning Form */}
        <section id="b2b-form" className="max-w-3xl mx-auto border border-white/10 bg-white/[0.02] p-10 md:p-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-black tracking-tighter text-white mb-4">Заявка на подключение к потоку</h2>
            <p className="text-[10px] text-muted-foreground font-black tracking-widest uppercase">Требуется верификация юридического лица</p>
          </div>
          
          <form className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Компания / ИНН</label>
                <input type="text" className="w-full bg-white/5 border border-white/10 p-4 text-[11px] text-white focus:border-blue-500 outline-none transition-all" placeholder="Quant Hedge Fund / 7725..." required />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Рабочий E-mail</label>
                <input type="email" className="w-full bg-white/5 border border-white/10 p-4 text-[11px] text-white focus:border-blue-500 outline-none transition-all" placeholder="trading@fund.com" required />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Требуемые регионы / Тип данных</label>
              <input type="text" className="w-full bg-white/5 border border-white/10 p-4 text-[11px] text-white focus:border-blue-500 outline-none transition-all" placeholder="Frankfurt FR2 / Ethereum Mempool Stream" required />
            </div>
            
            <div className="space-y-2">
              <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Технические требования (PPS / BW)</label>
              <textarea className="w-full bg-white/5 border border-white/10 p-4 text-[11px] text-white focus:border-blue-500 outline-none transition-all h-32 resize-none" placeholder="Укажите ожидаемую нагрузку в PPS или требуемую полосу пропускания..."></textarea>
            </div>

            <div className="flex items-start gap-3">
              <input type="checkbox" id="compliance" className="mt-1" required />
              <label htmlFor="compliance" className="text-[9px] text-muted-foreground font-bold leading-relaxed tracking-wider">
                Я подтверждаю, что использование данных будет осуществляться в рамках действующего финансового законодательства и согласен с условиями KYB-верификации.
              </label>
            </div>

            <button type="submit" className="w-full btn-enterprise py-5 text-[11px]">
              Запросить выделенный канал
            </button>
          </form>
        </section>

      </div>
    </div>
  );
}
