
import { ArrowRight, Code2, Cpu, Shield, Zap, Network, Database, Lock, Activity } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-grid">
      {/* Hero Section */}
      <section className="container mx-auto px-4 md:px-6 pt-20 md:pt-32 pb-20 max-w-6xl text-center">
        <h1 className="text-3xl md:text-7xl font-black tracking-tighter mb-8 text-white max-w-5xl mx-auto leading-[1.05] uppercase">
          ИНСТИТУЦИОНАЛЬНАЯ <span className="text-blue-500">WEB3 ИНФРАСТРУКТУРА</span> ДЛЯ HFT И MEV.
        </h1>
        
        <p className="max-w-4xl mx-auto text-muted-foreground text-[10px] md:text-xs mb-12 leading-relaxed font-bold uppercase tracking-[0.2em]">
          ПРЯМОЙ ДОСТУП К BARE-METAL УЗЛАМ, СТРИМИНГ МЕМПУЛА С НУЛЕВОЙ ЗАДЕРЖКОЙ И АГРЕГАЦИЯ ТЕЛЕМЕТРИИ ДЛЯ КВАНТОВЫХ ФОНДОВ. 
          ОБРАБОТКА МНОГОПОТОЧНЫХ ШИФРОВАННЫХ БИНАРНЫХ ДАННЫХ 24/7 С ГАРАНТИЕЙ ДОСТУПНОСТИ 99.999%.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-6">
          <Link href="/portal" className="btn-enterprise px-10 py-4 text-[11px]">
            ИНИЦИИРОВАТЬ ТЕНАНТ <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link href="/api-docs" className="btn-outline flex items-center gap-2 px-10 py-4 text-[11px]">
            <Code2 className="w-4 h-4" /> ТЕХНИЧЕСКИЙ СТЕК
          </Link>
        </div>
      </section>

      {/* Core Infrastructure Specifications */}
      <section className="container mx-auto px-4 md:px-6 py-20 border-t border-white/5 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 border border-white/5">
          <div className="bg-background p-10 space-y-4 hover:bg-white/[0.02] transition-colors">
            <h3 className="text-[12px] font-black text-white uppercase tracking-[0.2em]">СТРИМИНГ МЕМПУЛА</h3>
            <p className="text-[10px] text-muted-foreground leading-relaxed font-bold uppercase tracking-widest">
              ПРЯМОЙ ПИРИНГ С БИЛДЕРАМИ БЛОКОВ. ЗАДЕРЖКА МЕНЕЕ 2МС. ПОЛНЫЙ ОБХОД ПУБЛИЧНЫХ P2P СЕТЕЙ ДЛЯ МАКСИМАЛЬНОЙ СКОРОСТИ ИСПОЛНЕНИЯ.
            </p>
          </div>
          <div className="bg-background p-10 space-y-4 hover:bg-white/[0.02] transition-colors">
            <h3 className="text-[12px] font-black text-white uppercase tracking-[0.2em]">MEV ЗАЩИТА И DARK POOL</h3>
            <p className="text-[10px] text-muted-foreground leading-relaxed font-bold uppercase tracking-widest">
              ИНТЕГРАЦИЯ С FLASHBOTS, BLOXROUTE И ПРИВАТНЫМИ РЕЛЕЯМИ. ИЗОЛЯЦИЯ ТРАНЗАКЦИЙ ОТ FRONT-RUNNING И SANDWICH АТАК.
            </p>
          </div>
          <div className="bg-background p-10 space-y-4 hover:bg-white/[0.02] transition-colors">
            <h3 className="text-[12px] font-black text-white uppercase tracking-[0.2em]">HFT ТЕЛЕМЕТРИЯ</h3>
            <p className="text-[10px] text-muted-foreground leading-relaxed font-bold uppercase tracking-widest">
              СБОР ДАННЫХ О СОСТОЯНИИ БОТОВ ЧЕРЕЗ gRPC OVER HTTP/2. ОБРАБОТКА МИЛЛИОНОВ СОБЫТИЙ В СЕКУНДУ С МИНИМАЛЬНОЙ НАГРУЗКОЙ НА CPU.
            </p>
          </div>
        </div>
      </section>

      {/* Supported Integrations & Protocols */}
      <section className="container mx-auto px-4 md:px-6 py-20 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div className="space-y-10">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-6">ТЕХНОЛОГИЧЕСКИЙ СТЕК И ИНТЕГРАЦИИ</h2>
              <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest leading-relaxed">
                НАША ПЛАТФОРМА ОБЕСПЕЧИВАЕТ БЕСШОВНУЮ ИНТЕГРАЦИЮ С ВЕДУЩИМИ ИНСТРУМЕНТАМИ МОНИТОРИНГА И СЕТЕВОЙ БЕЗОПАСНОСТИ. 
                ПОДДЕРЖКА БИНАРНЫХ ПРОТОКОЛОВ ДЛЯ ВЫСОКОНАГРУЖЕННЫХ СИСТЕМ.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <div className="technical-label">ПРОТОКОЛЫ</div>
                <div className="flex flex-wrap gap-2">
                  {['gRPC', 'WSS', 'IPC', 'QUIC'].map(p => (
                    <span key={p} className="text-[9px] font-mono border border-white/10 px-2 py-1 text-blue-400">{p}</span>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <div className="technical-label">МОНИТОРИНГ</div>
                <div className="flex flex-wrap gap-2">
                  {['Prometheus', 'Grafana', 'Datadog'].map(p => (
                    <span key={p} className="text-[9px] font-mono border border-white/10 px-2 py-1 text-white/60">{p}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border border-blue-500/20 bg-blue-500/5 space-y-4">
              <div className="flex items-center gap-2 text-blue-500 font-black text-[10px] uppercase tracking-widest">
                <Network className="w-4 h-4" /> СЕТЕВАЯ ИЗОЛЯЦИЯ
              </div>
              <p className="text-[10px] text-white/70 leading-relaxed font-bold uppercase tracking-wider">
                ПОДДЕРЖКА AWS PRIVATELINK И CLOUDFLARE MAGIC TRANSIT ДЛЯ ОРГАНИЗАЦИИ ВЫДЕЛЕННЫХ КАНАЛОВ СВЯЗИ БЕЗ ВЫХОДА В ПУБЛИЧНЫЙ ИНТЕРНЕТ.
              </p>
            </div>
          </div>

          <div className="bg-black border border-white/10 p-8 font-mono text-[11px] space-y-4 rounded-sm overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <span className="text-white/40 uppercase tracking-widest">System Status</span>
              <span className="text-green-500 font-black animate-pulse uppercase">Operational</span>
            </div>
            <div className="space-y-2">
              <div className="text-blue-500"># Infrastructure Topology</div>
              <div className="text-white/60">Node: eu-west-1-bare-metal-04</div>
              <div className="text-white/60">Transit: AWS PrivateLink Active</div>
              <div className="text-white/60">Latency: 0.82ms (Internal P99)</div>
              <div className="text-white/60">Throughput: 42.4 Gbps Ingress</div>
            </div>
            <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center text-[10px]">
              <div className="flex gap-4">
                <span className="text-white/30 uppercase">Uptime</span>
                <span className="text-white">99.9997%</span>
              </div>
              <div className="flex gap-4">
                <span className="text-white/30 uppercase">Region</span>
                <span className="text-white">EU-CENTRAL-1</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
