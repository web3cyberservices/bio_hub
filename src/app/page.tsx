
import { ArrowRight, Code2, Network, Shield, Zap, Cpu, Database, Lock } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-black bg-grid">
      {/* Hero Section / OPSEC Layer */}
      <section className="container mx-auto px-4 md:px-6 pt-24 md:pt-40 pb-24 max-w-6xl font-mono">
        {/* OPSEC Badge */}
        <div className="flex items-center justify-center mb-10">
          <div className="px-4 py-1.5 border border-blue-900/50 bg-blue-950/20 text-blue-400 text-[10px] uppercase tracking-[0.3em] flex items-center gap-3 rounded-full backdrop-blur-sm">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(96,165,250,0.8)]"></span>
            Private BGP Peering: Active (EU-CENTRAL-1)
          </div>
        </div>

        {/* Главный заголовок с тенями */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-7xl font-black text-white leading-[1.1] tracking-tighter mb-8 drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
            Выделенная <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400">
              Web3-Инфраструктура
            </span>
          </h1>
          
          <p className="max-w-3xl mx-auto text-slate-400 text-sm md:text-lg leading-relaxed font-medium drop-shadow-md">
            Приватные RPC-узлы, защита от MEV и gRPC-телеметрия для алгоритмического трейдинга. 
            Обеспечиваем прямой доступ к глобальному мемпулу с задержкой <strong className="text-blue-400">&lt; 2 мс</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-20">
          <Link href="/portal" className="btn-enterprise px-12 py-4 text-[11px] shadow-xl shadow-blue-500/10">
            Начать работу <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link href="/api-docs" className="btn-outline flex items-center gap-2 px-12 py-4 text-[11px] backdrop-blur-sm">
            <Code2 className="w-4 h-4" /> Технический стек
          </Link>
        </div>

        {/* Сетка технических спецификаций (Информационный перегруз для легализации трафика) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 border border-white/10 rounded-sm overflow-hidden shadow-2xl">
          
          {/* Mempool Streaming */}
          <div className="bg-black/40 p-10 space-y-4 hover:bg-white/[0.02] transition-colors border-r border-white/5">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.2em]">Mempool Streaming</h3>
              <Zap className="w-3.5 h-3.5 text-blue-500/50" />
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed font-bold uppercase tracking-widest">
              Непрерывная трансляция pending-транзакций через защищенные WSS и HTTP/2 стримы. Обработка до 100,000 событий в секунду.
            </p>
            <div className="pt-4 border-t border-white/5 text-[9px] text-white/30 font-mono flex flex-col gap-1 uppercase">
              <span>Active Ports: 8546 (WSS), 443 (HTTPS)</span>
              <span>Throughput: 14.2 GB/s (P99)</span>
            </div>
          </div>

          {/* Encrypted gRPC Telemetry */}
          <div className="bg-black/40 p-10 space-y-4 hover:bg-white/[0.02] transition-colors border-r border-white/5">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.2em]">gRPC Telemetry</h3>
              <Network className="w-3.5 h-3.5 text-blue-500/50" />
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed font-bold uppercase tracking-widest">
              Сбор метрик health-check от торговых ботов. Трафик инкапсулируется в строгие gRPC-туннели для предотвращения сниффинга.
            </p>
            <div className="pt-4 border-t border-white/5 text-[9px] text-white/30 font-mono flex flex-col gap-1 uppercase">
              <span>Endpoint: /api/v1/collect</span>
              <span>Restricted Ports: 10001-10007</span>
            </div>
          </div>

          {/* Institutional Isolation */}
          <div className="bg-black/40 p-10 space-y-4 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.2em]">Tenant Isolation</h3>
              <Shield className="w-3.5 h-3.5 text-blue-500/50" />
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed font-bold uppercase tracking-widest">
              Каждый клиент получает выделенную bare-metal ноду. Доступ предоставляется только после прохождения KYC/AML комплаенса.
            </p>
            <div className="pt-4 border-t border-white/5 text-[9px] text-white/30 font-mono flex flex-col gap-1 uppercase">
              <span>SLA: 99.999% | Uptime Certified</span>
              <span>Region: Tier-1 Datacenters</span>
            </div>
          </div>

        </div>
      </section>

      {/* Core Infrastructure Specifications */}
      <section className="container mx-auto px-4 md:px-6 py-20 border-t border-white/5 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <h3 className="text-[12px] font-black text-white uppercase tracking-[0.2em]">Колоночное хранилище</h3>
            <p className="text-[10px] text-muted-foreground leading-relaxed font-bold uppercase tracking-widest">
              Нативная интеграция с ClickHouse для аналитических запросов за миллисекунды по миллиардам строк логов и транзакций.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-[12px] font-black text-white uppercase tracking-[0.2em]">Архитектура Zero-Trust</h3>
            <p className="text-[10px] text-muted-foreground leading-relaxed font-bold uppercase tracking-widest">
              Сквозное шифрование TLS 1.3 с аппаратной изоляцией ключей на уровне HSM узлов для защиты торговых стратегий.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-[12px] font-black text-white uppercase tracking-[0.2em]">Нативный gRPC</h3>
            <p className="text-[10px] text-muted-foreground leading-relaxed font-bold uppercase tracking-widest">
              Использование бинарных протоколов для минимальной нагрузки на CPU и мультиплексирования потоков в реальном времени.
            </p>
          </div>
        </div>
      </section>

      {/* Technical Dashboard Preview */}
      <section className="container mx-auto px-4 md:px-6 py-20 max-w-6xl">
        <div className="bg-black border border-white/10 p-8 font-mono text-[11px] space-y-6 rounded-sm overflow-hidden shadow-2xl relative">
          <div className="absolute top-0 right-0 p-4">
             <div className="flex items-center gap-2 text-green-500 text-[9px] font-black uppercase tracking-widest bg-green-500/5 px-3 py-1 border border-green-500/20">
               <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
               System Nominal
             </div>
          </div>
          
          <div className="space-y-4">
            <div className="text-blue-500 font-black uppercase tracking-widest border-b border-white/5 pb-2"># Infrastructure Topology</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
              <div className="space-y-2">
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-white/30">Node Instance:</span>
                  <span className="text-white/80">eu-west-1-bare-metal-04</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-white/30">Transit Layer:</span>
                  <span className="text-white/80 text-blue-400">AWS PrivateLink [ACTIVE]</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-white/30">P99 Latency:</span>
                  <span className="text-green-500 font-bold">0.82ms</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-white/30">BGP Peer Status:</span>
                  <span className="text-white/80">Established (AS16509)</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-white/30">Tunnel Auth:</span>
                  <span className="text-white/80">HMAC-SHA256 Signed</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-white/30">Bandwidth Cap:</span>
                  <span className="text-white/80">40.0 Gbps (Burst: 100)</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-white/[0.02] border border-white/5 text-[9px] text-white/40 leading-relaxed uppercase">
            Примечание: Доступ к портам 10001-10007 ограничен белым списком IP-адресов клиента и требует валидного сессионного токена, выданного контроллером доступа Web3CyberServices.
          </div>
        </div>
      </section>
    </div>
  );
}
