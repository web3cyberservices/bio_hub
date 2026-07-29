
import { Shield, Zap, ArrowRight, Lock, Globe } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="py-20 md:py-32">
      <section className="container mx-auto px-4 text-center mb-32">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-widest mb-8">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Network Status: Optimal
        </div>
        <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 uppercase leading-[0.9] text-white">
          Enterprise-Grade <br /> <span className="text-primary">Log Ingestion</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
          CyberLog — это фундамент вашей observability. Принимайте миллионы событий в секунду через высокопроизводительный gRPC пайплайн.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/api-docs" className="w-full sm:w-auto bg-primary text-primary-foreground px-8 py-4 rounded-sm font-bold uppercase tracking-widest text-[10px] hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
            Explore Documentation <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/pricing" className="w-full sm:w-auto border border-white/10 bg-white/5 px-8 py-4 rounded-sm font-bold uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all text-center">
            View Pricing
          </Link>
        </div>
      </section>

      <section className="border-y border-white/5 bg-black/20 py-16 mb-32">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Ingestion Latency', value: '< 15ms' },
            { label: 'Max Throughput', value: '10M+ EPS' },
            { label: 'Uptime SLA', value: '99.999%' },
            { label: 'Global Nodes', value: '42' },
          ].map((stat) => (
            <div key={stat.label} className="text-center group">
              <div className="text-3xl md:text-4xl font-black text-white mb-2 group-hover:text-primary transition-colors">{stat.value}</div>
              <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-bold">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 pb-32">
        <div className="grid md:grid-cols-3 gap-8 text-white">
          <div className="p-10 bg-white/5 border border-white/5 rounded-sm space-y-6 hover:bg-white/[0.07] transition-colors">
            <Zap className="w-10 h-10 text-primary" />
            <h3 className="text-lg font-bold uppercase tracking-tight">Ultra-Low Latency</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Оптимизировано для высокочастотных систем. Мы гарантируем минимальную задержку от поступления пакета до индексации.
            </p>
          </div>
          <div className="p-10 bg-white/5 border border-white/5 rounded-sm space-y-6 hover:bg-white/[0.07] transition-colors">
            <Lock className="w-10 h-10 text-primary" />
            <h3 className="text-lg font-bold uppercase tracking-tight">End-to-End Encryption</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ваши данные — только ваши. Мы поддерживаем mTLS и шифрование на стороне клиента для полной приватности.
            </p>
          </div>
          <div className="p-10 bg-white/5 border border-white/5 rounded-sm space-y-6 hover:bg-white/[0.07] transition-colors">
            <Globe className="w-10 h-10 text-primary" />
            <h3 className="text-lg font-bold uppercase tracking-tight">gRPC Native</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Прямая поддержка Protocol Buffers и HTTP/2 стриминга. Минимальный оверхед по сравнению с традиционным JSON.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
