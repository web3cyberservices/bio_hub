import { Database, Zap, Shield, BarChart3, Layers, Globe, ArrowRight, Cpu, Activity } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      <section className="container mx-auto px-6 pt-12 md:pt-16 pb-16 text-center relative z-10 min-h-[75vh] flex flex-col justify-center items-center">
        <div className="inline-flex items-center gap-2 px-6 py-2 border border-primary/20 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.5em] mb-8 rounded-full backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(14,165,233,1)]" />
          Мониторинг кластера: Активен
        </div>
        
        <h1 className="text-5xl md:text-[72px] font-black tracking-tighter leading-[1.1] mb-8 text-gradient max-w-5xl px-4">
          Аналитические инструменты <br /> <span className="text-primary drop-shadow-[0_0_30px_rgba(14,165,233,0.3)]">для вашего бизнеса</span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-muted-foreground text-[13px] md:text-base font-medium leading-relaxed mb-12 px-4">
          Индустриальный стандарт сбора телеметрии. Обработка логов, транзакций и кликстрима в масштабах глобальной инфраструктуры корпоративного уровня. Аналог Datadog на стеке ClickHouse.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full max-w-xl mx-auto px-6">
          <Link href="/dashboard" className="glass-button-primary rounded-full w-full sm:w-auto px-10 py-5 font-black text-[13px] flex items-center justify-center gap-3">
            Запустить консоль <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/api-docs" className="glass-button rounded-full w-full sm:w-auto px-10 py-5 font-black text-[13px] text-white flex items-center justify-center">
            Документация
          </Link>
        </div>
      </section>

      <section className="border-y border-white/5 bg-black/40 backdrop-blur-2xl py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { label: 'Скорость приема', value: '1.2M req/s' },
              { label: 'Хранилище', value: '500+ PB' },
              { label: 'Задержка', value: '< 50ms' },
              { label: 'Глобальные узлы', value: '128' },
            ].map((stat) => (
              <div key={stat.label} className="text-center group">
                <div className="text-2xl md:text-3xl font-black text-white mb-1 tracking-tighter group-hover:text-primary transition-colors">{stat.value}</div>
                <div className="text-[9px] font-black text-primary/60 uppercase tracking-[0.4em]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-20 md:py-24">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Database className="w-7 h-7" />,
              title: "Движок ClickHouse",
              desc: "Оптимизированное хранилище для мгновенной аналитики миллиардов событий кликстрима в реальном времени."
            },
            {
              icon: <Layers className="w-7 h-7" />,
              title: "Транзакционный лог",
              desc: "Гарантированная доставка событий Exactly-once для финансовых транзакций и аудита безопасности."
            },
            {
              icon: <Zap className="w-7 h-7" />,
              title: "gRPC инжекция",
              desc: "Бинарные протоколы обеспечивают минимальный оверхед и максимальную плотность данных в вашем канале."
            }
          ].map((cap, i) => (
            <div key={i} className="glass-card p-10 space-y-8 rounded-[2rem] hover:border-primary/40 transition-all duration-500 hover:shadow-[0_0_40px_rgba(14,165,233,0.1)]">
              <div className="w-16 h-16 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary rounded-2xl shadow-[inset_0_0_20px_rgba(14,165,233,0.1)]">
                {cap.icon}
              </div>
              <h3 className="text-xl md:text-2xl font-black tracking-tighter text-white">{cap.title}</h3>
              <p className="text-[12px] md:text-[14px] text-muted-foreground leading-relaxed font-medium">
                {cap.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-6 pb-24 md:pb-32">
        <div className="glass-card p-12 md:p-24 relative overflow-hidden group rounded-[3rem] border-primary/20">
          <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none transition-transform duration-1000 group-hover:scale-110">
            <Globe className="w-full h-full text-primary scale-125" />
          </div>
          <div className="max-w-2xl relative z-10">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 md:mb-12 leading-none text-white">Масштаб мирового класса</h2>
            <p className="text-muted-foreground font-bold text-[13px] md:text-[15px] leading-relaxed mb-12 md:mb-16">
              Мы предоставляем не просто инструменты, а фундамент цифровой трансформации с аппаратной изоляцией данных и экспертной поддержкой 24/7.
            </p>
            <div className="grid grid-cols-3 gap-6 md:gap-12">
              <div className="space-y-4">
                <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 w-fit">
                  <Shield className="text-primary w-8 h-8 md:w-10 md:h-10" />
                </div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white">SOC2 & GDPR</div>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 w-fit">
                  <Cpu className="text-primary w-8 h-8 md:w-10 md:h-10" />
                </div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Edge Computing</div>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 w-fit">
                  <Activity className="text-primary w-8 h-8 md:w-10 md:h-10" />
                </div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white">SLA 99.999%</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
