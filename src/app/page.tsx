import { BarChart3, Shield, Zap, Database, Cpu, Globe } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <section className="container mx-auto px-6 py-20 md:py-28 text-center max-w-5xl">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-balance mx-auto">
          Аналитические инструменты для вашего бизнеса
        </h1>
        
        <p className="max-w-2xl mx-auto text-neutral-400 text-base md:text-lg mb-10 text-balance leading-relaxed">
          Индустриальный стандарт сбора телеметрии. Обработка миллионов событий в секунду для глобальной инфраструктуры корпоративного уровня.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/dashboard" className="btn-primary w-full sm:w-auto px-10">
            Начать работу
          </Link>
          <Link href="/api-docs" className="btn-secondary w-full sm:w-auto px-10">
            Документация
          </Link>
        </div>
      </section>

      <section className="border-y border-white/5 bg-neutral-900/20 py-16">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Пропускная способность', value: '1.2M req/s' },
              { label: 'Объем хранилища', value: '500+ PB' },
              { label: 'Задержка', value: '< 50ms' },
              { label: 'Edge-узлы', value: '128' },
            ].map((stat) => (
              <div key={stat.label} className="space-y-1">
                <div className="text-3xl font-bold text-white tracking-tight">{stat.value}</div>
                <div className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-32 max-w-7xl">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Database className="w-6 h-6" />,
              title: "ClickHouse Engine",
              desc: "Высокопроизводительное хранилище для мгновенной аналитики миллиардов записей в реальном времени."
            },
            {
              icon: <Shield className="w-6 h-6" />,
              title: "Безопасность данных",
              desc: "Соответствие стандартам SOC2 и GDPR. Шифрование на уровне приложения и аппаратная изоляция."
            },
            {
              icon: <Zap className="w-6 h-6" />,
              title: "gRPC Инжекция",
              desc: "Минимальный оверхед благодаря бинарным протоколам. Гарантированная доставка событий Exactly-once."
            }
          ].map((feature, i) => (
            <div key={i} className="ui-card p-8 space-y-6">
              <div className="w-12 h-12 bg-neutral-900 rounded-lg flex items-center justify-center text-blue-500 border border-neutral-800">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold">{feature.title}</h3>
              <p className="text-sm text-neutral-500 leading-relaxed font-medium">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-6 pb-32 max-w-7xl">
        <div className="bg-neutral-900/30 border border-white/5 rounded-2xl p-12 md:p-20 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Масштаб мирового уровня</h2>
            <p className="text-neutral-400 font-medium text-sm md:text-base leading-relaxed mb-10">
              Мы обеспечиваем фундамент для цифровой трансформации крупнейших компаний, предоставляя инструменты мониторинга, которые работают безотказно.
            </p>
            <div className="flex flex-wrap gap-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                  <Cpu className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-300">Edge Computing</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                  <Globe className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-300">Global Nodes</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-300">SLA 99.999%</span>
              </div>
            </div>
          </div>
          <div className="absolute top-1/2 right-0 -translate-y-1/2 opacity-10 pointer-events-none hidden lg:block">
            <Globe className="w-96 h-96" />
          </div>
        </div>
      </section>
    </div>
  );
}