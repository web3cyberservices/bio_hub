
import { ArrowRight, Code2, Cpu, Shield, Zap, Network, Database, Lock, Activity } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-grid">
      {/* Hero Section */}
      <section className="container mx-auto px-4 md:px-6 pt-24 md:pt-40 pb-24 max-w-6xl text-center">
        <h1 className="text-4xl md:text-7xl font-bold tracking-tight mb-8 text-white max-w-5xl mx-auto leading-[1.1] drop-shadow-2xl">
          Выделенная <span className="text-blue-500">Web3-Инфраструктура</span>
        </h1>
        
        <p className="max-w-3xl mx-auto text-slate-400 text-sm md:text-lg mb-12 leading-relaxed font-medium drop-shadow-md">
          Приватные RPC-узлы, защита от MEV и gRPC-телеметрия для алгоритмического трейдинга.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/portal" className="btn-enterprise px-10 py-4 text-[11px] shadow-lg shadow-blue-500/10">
            Начать работу <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link href="/api-docs" className="btn-outline flex items-center gap-2 px-10 py-4 text-[11px] backdrop-blur-sm">
            <Code2 className="w-4 h-4" /> Технический стек
          </Link>
        </div>
      </section>

      {/* Core Infrastructure Specifications */}
      <section className="container mx-auto px-4 md:px-6 py-20 border-t border-white/5 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 border border-white/5">
          <div className="bg-background p-10 space-y-4 hover:bg-white/[0.02] transition-colors">
            <h3 className="text-[12px] font-black text-white uppercase tracking-[0.2em]">Колоночное хранилище</h3>
            <p className="text-[10px] text-muted-foreground leading-relaxed font-bold uppercase tracking-widest">
              Нативная интеграция с ClickHouse для аналитических запросов за миллисекунды по миллиардам строк.
            </p>
          </div>
          <div className="bg-background p-10 space-y-4 hover:bg-white/[0.02] transition-colors">
            <h3 className="text-[12px] font-black text-white uppercase tracking-[0.2em]">Архитектура Zero-Trust</h3>
            <p className="text-[10px] text-muted-foreground leading-relaxed font-bold uppercase tracking-widest">
              Сквозное шифрование TLS 1.3 с аппаратной изоляцией ключей на уровне HSM узлов.
            </p>
          </div>
          <div className="bg-background p-10 space-y-4 hover:bg-white/[0.02] transition-colors">
            <h3 className="text-[12px] font-black text-white uppercase tracking-[0.2em]">Нативный gRPC</h3>
            <p className="text-[10px] text-muted-foreground leading-relaxed font-bold uppercase tracking-widest">
              Поддержка бинарных протоколов для минимальной нагрузки на CPU и мультиплексирования потоков.
            </p>
          </div>
        </div>
      </section>

      {/* Supported Integrations & Protocols */}
      <section className="container mx-auto px-4 md:px-6 py-20 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div className="space-y-10">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-6">Технологический стек</h2>
              <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest leading-relaxed">
                Наша платформа обеспечивает бесшовную интеграцию с ведущими инструментами мониторинга и сетевой безопасности.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <div className="technical-label">Протоколы</div>
                <div className="flex flex-wrap gap-2">
                  {['gRPC', 'WSS', 'IPC', 'QUIC'].map(p => (
                    <span key={p} className="text-[9px] font-mono border border-white/10 px-2 py-1 text-blue-400">{p}</span>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <div className="technical-label">Мониторинг</div>
                <div className="flex flex-wrap gap-2">
                  {['Prometheus', 'Grafana', 'Datadog'].map(p => (
                    <span key={p} className="text-[9px] font-mono border border-white/10 px-2 py-1 text-white/60">{p}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border border-blue-500/20 bg-blue-500/5 space-y-4">
              <div className="flex items-center gap-2 text-blue-500 font-black text-[10px] uppercase tracking-widest">
                <Network className="w-4 h-4" /> Сетевая изоляция
              </div>
              <p className="text-[10px] text-white/70 leading-relaxed font-bold uppercase tracking-wider">
                Поддержка AWS PrivateLink и Cloudflare Magic Transit для организации выделенных каналов связи.
              </p>
            </div>
          </div>

          <div className="bg-black border border-white/10 p-8 font-mono text-[11px] space-y-4 rounded-sm overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <span className="text-white/40 uppercase tracking-widest">Статус системы</span>
              <span className="text-green-500 font-black animate-pulse uppercase">Работает</span>
            </div>
            <div className="space-y-2">
              <div className="text-blue-500"># Топология инфраструктуры</div>
              <div className="text-white/60">Узел: eu-west-1-bare-metal-04</div>
              <div className="text-white/60">Транзит: AWS PrivateLink Active</div>
              <div className="text-white/60">Задержка: 0.82ms (Internal P99)</div>
              <div className="text-white/60">Пропускная способность: 42.4 Gbps</div>
            </div>
            <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center text-[10px]">
              <div className="flex gap-4">
                <span className="text-white/30 uppercase">Uptime</span>
                <span className="text-white">99.9997%</span>
              </div>
              <div className="flex gap-4">
                <span className="text-white/30 uppercase">Регион</span>
                <span className="text-white">EU-CENTRAL-1</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
