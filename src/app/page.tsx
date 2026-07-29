import { Database, Zap, Shield, BarChart3, Layers, Globe, ArrowRight, Cpu, Activity } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-16 md:pt-24 pb-20 text-center relative z-10 min-h-[80vh] flex flex-col justify-center items-center">
        <div className="inline-flex items-center gap-2 px-4 py-1 border border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.5em] mb-8 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Мониторинг кластера: Активен
        </div>
        
        <h1 className="text-5xl md:text-[100px] font-black tracking-tighter leading-[0.9] uppercase mb-8 text-gradient">
          Аналитика <br /> <span className="text-primary">Гипер-Масштаба</span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-muted-foreground text-[12px] md:text-sm font-medium uppercase tracking-[0.2em] leading-relaxed mb-12 px-4">
          CyberLog — индустриальный стандарт сбора телеметрии. Обработка логов, транзакций и кликстрима с задержкой менее 200 мс в масштабах глобальной инфраструктуры.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-xl mx-auto px-6">
          <Link href="/dashboard" className="cyber-button bg-primary text-black w-full sm:w-auto px-10 py-5 font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3">
            Запустить консоль <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/api-docs" className="border border-white/10 bg-white/5 w-full sm:w-auto px-10 py-5 font-black uppercase tracking-[0.2em] text-[10px] hover:bg-white/10 transition-colors text-white flex items-center justify-center">
            Документация
          </Link>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-white/5 bg-black/40 backdrop-blur-xl py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { label: 'Скорость приема', value: '1.2M req/s' },
              { label: 'Хранилище', value: '500+ PB' },
              { label: 'Задержка', value: '< 50ms' },
              { label: 'Глобальные узлы', value: '128' },
            ].map((stat) => (
              <div key={stat.label} className="text-center group">
                <div className="text-2xl md:text-4xl font-black text-white mb-1 tracking-tighter group-hover:text-primary transition-colors">{stat.value}</div>
                <div className="text-[8px] md:text-[9px] font-black text-primary/60 uppercase tracking-[0.4em]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Capabilities */}
      <section className="container mx-auto px-6 py-24 md:py-32">
        <div className="grid md:grid-cols-3 gap-px bg-white/5 border border-white/5 overflow-hidden">
          <div className="bg-background p-10 md:p-16 space-y-6 md:space-y-8 hover:bg-white/[0.02] transition-colors">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-primary/10 flex items-center justify-center text-primary">
              <Database className="w-6 h-6 md:w-7 md:h-7" />
            </div>
            <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-white">Движок ClickHouse</h3>
            <p className="text-[10px] md:text-[11px] text-muted-foreground leading-loose font-medium uppercase tracking-widest">
              Оптимизированное хранилище для мгновенной аналитики миллиардов событий кликстрима в реальном времени.
            </p>
          </div>
          <div className="bg-background p-10 md:p-16 space-y-6 md:space-y-8 hover:bg-white/[0.02] transition-colors">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-primary/10 flex items-center justify-center text-primary">
              <Layers className="w-6 h-6 md:w-7 md:h-7" />
            </div>
            <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-white">Транзакционный Лог</h3>
            <p className="text-[10px] md:text-[11px] text-muted-foreground leading-loose font-medium uppercase tracking-widest">
              Гарантированная доставка событий Exactly-once для финансовых транзакций и аудита безопасности.
            </p>
          </div>
          <div className="bg-background p-10 md:p-16 space-y-6 md:space-y-8 hover:bg-white/[0.02] transition-colors">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-primary/10 flex items-center justify-center text-primary">
              <Zap className="w-6 h-6 md:w-7 md:h-7" />
            </div>
            <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-white">gRPC Инжекция</h3>
            <p className="text-[10px] md:text-[11px] text-muted-foreground leading-loose font-medium uppercase tracking-widest">
              Бинарные протоколы обеспечивают минимальный оверхед и максимальную плотность данных в вашем канале.
            </p>
          </div>
        </div>
      </section>

      {/* Enterprise Section */}
      <section className="container mx-auto px-6 pb-24 md:pb-32">
        <div className="bg-white/5 border border-white/5 p-12 md:p-32 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none transition-transform duration-1000 group-hover:scale-110">
            <Globe className="w-full h-full text-primary scale-125" />
          </div>
          <div className="max-w-2xl relative z-10">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-8 md:mb-12 leading-none text-white">Масштаб <br /> мирового класса</h2>
            <p className="text-muted-foreground font-bold uppercase text-[10px] md:text-[11px] tracking-[0.25em] leading-loose mb-12 md:mb-16">
              Мы предоставляем не просто инструменты, а фундамент цифровой трансформации с аппаратной изоляцией данных и экспертной поддержкой 24/7.
            </p>
            <div className="grid grid-cols-3 gap-6 md:gap-12">
              <div className="space-y-3">
                <Shield className="text-primary w-8 h-8 md:w-10 md:h-10" />
                <div className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-white">SOC2 & GDPR</div>
              </div>
              <div className="space-y-3">
                <Cpu className="text-primary w-8 h-8 md:w-10 md:h-10" />
                <div className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-white">Edge Computing</div>
              </div>
              <div className="space-y-3">
                <Activity className="text-primary w-8 h-8 md:w-10 md:h-10" />
                <div className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-white">SLA 99.999%</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
