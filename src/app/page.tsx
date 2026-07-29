import { Database, Zap, Shield, BarChart3, Layers, Globe, ArrowRight, Cpu, Activity } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-32 pb-40 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1 border border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.4em] mb-8 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Сверхвысокая нагрузка: Статус OK
        </div>
        
        <h1 className="text-5xl md:text-[100px] font-black tracking-tighter leading-[0.9] uppercase mb-10 text-gradient">
          Инфраструктура <br /> <span className="text-primary">Больших Данных</span>
        </h1>
        
        <p className="max-w-3xl mx-auto text-muted-foreground text-sm md:text-base font-bold uppercase tracking-widest leading-loose mb-16">
          CyberLog — это аналитический движок нового поколения для корпораций. Сбор логов, кликстрима и транзакций с пропускной способностью 50+ ТБ/сутки и задержкой менее 200мс.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link href="/dashboard" className="cyber-button bg-primary text-black px-12 py-5 font-black uppercase tracking-widest text-xs flex items-center gap-3">
            Запустить консоль <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/api-docs" className="border border-white/10 bg-white/5 px-12 py-5 font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-colors">
            Документация
          </Link>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-white/5 bg-black/40 backdrop-blur-xl py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { label: 'Ingestion Rate', value: '1.2M req/s' },
              { label: 'Storage Cluster', value: '500+ PB' },
              { label: 'Query Latency', value: '< 50ms' },
              { label: 'Global Nodes', value: '128' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-black text-white mb-1 tracking-tighter">{stat.value}</div>
                <div className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Capabilities */}
      <section className="container mx-auto px-6 py-40">
        <div className="grid md:grid-cols-3 gap-12">
          <div className="glass-card p-10 space-y-6">
            <div className="w-12 h-12 bg-primary/10 flex items-center justify-center text-primary">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight">Хранилище ClickHouse</h3>
            <p className="text-xs text-muted-foreground leading-loose font-medium uppercase tracking-wider">
              Оптимизированное колоночное хранилище для мгновенной аналитики миллиардов событий кликстрима.
            </p>
          </div>
          <div className="glass-card p-10 space-y-6">
            <div className="w-12 h-12 bg-primary/10 flex items-center justify-center text-primary">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight">Транзакционный Лог</h3>
            <p className="text-xs text-muted-foreground leading-loose font-medium uppercase tracking-wider">
              Гарантированная доставка событий (Exactly-once) для финансовых транзакций и аудита доступа.
            </p>
          </div>
          <div className="glass-card p-10 space-y-6">
            <div className="w-12 h-12 bg-primary/10 flex items-center justify-center text-primary">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight">gRPC Ingestion</h3>
            <p className="text-xs text-muted-foreground leading-loose font-medium uppercase tracking-wider">
              Бинарные протоколы обеспечивают минимальный оверхед и максимальную плотность данных в канале.
            </p>
          </div>
        </div>
      </section>

      {/* Enterprise Section */}
      <section className="container mx-auto px-6 pb-40">
        <div className="bg-white/5 border border-white/5 p-16 md:p-32 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
            <Globe className="w-full h-full text-primary scale-150" />
          </div>
          <div className="max-w-2xl relative z-10">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-8 leading-none">Решение для <br /> глобальных систем</h2>
            <p className="text-muted-foreground font-bold uppercase text-xs tracking-widest leading-loose mb-12">
              Мы предоставляем не просто софт, а полноценную инфраструктуру с mTLS шифрованием, аппаратной изоляцией и круглосуточным мониторингом SRE-командой.
            </p>
            <div className="flex gap-12">
              <div className="space-y-2">
                <Shield className="text-primary w-8 h-8" />
                <div className="text-[10px] font-black uppercase tracking-widest text-white">SOC2 & GDPR</div>
              </div>
              <div className="space-y-2">
                <Cpu className="text-primary w-8 h-8" />
                <div className="text-[10px] font-black uppercase tracking-widest text-white">Edge Computing</div>
              </div>
              <div className="space-y-2">
                <Activity className="text-primary w-8 h-8" />
                <div className="text-[10px] font-black uppercase tracking-widest text-white">SLA 99.999%</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}