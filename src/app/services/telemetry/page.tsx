
import { Cpu, LineChart, BarChart, Settings, Activity, ShieldCheck, Zap, Database, Server, Layers } from 'lucide-react';
import Link from 'next/link';

export default function TelemetryPage() {
  return (
    <div className="min-h-screen bg-grid py-20 md:py-32">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Hero Section */}
        <div className="mb-24 border-b border-white/10 pb-16">
          <div className="flex flex-wrap gap-3 mb-8">
            <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[9px] font-black uppercase tracking-widest rounded-full">
              Real-time Monitoring
            </span>
            <span className="px-3 py-1 bg-white/5 border border-white/10 text-white/60 text-[9px] font-black uppercase tracking-widest rounded-full">
              SLA 99.99% Availability
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 leading-[1.05]">
            B2B Телеметрия и предиктивный <br className="hidden lg:block" /> мониторинг инфраструктуры
          </h1>
          <p className="text-[13px] md:text-[15px] text-muted-foreground font-medium tracking-wide max-w-3xl leading-relaxed mb-10">
            Прозрачный контроль за состоянием ваших вычислительных ресурсов в режиме реального времени. 
            Мы используем eBPF-агенты для сбора глубоких метрик ядра без нагрузки на процессор, 
            обеспечивая полную видимость сетевых потоков и производительности узлов.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <a href="#b2b-form" className="btn-enterprise py-4 px-8 text-[11px]">
              Подключить мониторинг (B2B)
            </a>
            <Link href="/api-docs" className="btn-outline py-4 px-8 text-[11px]">
              API Specification
            </Link>
          </div>
        </div>

        {/* Dashboard Stats Preview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-white/10 border border-white/10 mb-32">
          {[
            { icon: <Cpu className="w-5 h-5" />, label: "Node Health", val: "99.9%" },
            { icon: <LineChart className="w-5 h-5" />, label: "Throughput", val: "4.2 TB/d" },
            { icon: <Activity className="w-5 h-5" />, label: "Mean Latency", val: "0.12ms" },
            { icon: <Database className="w-5 h-5" />, label: "Storage I/O", val: "Optimized" }
          ].map((stat, i) => (
            <div key={i} className="p-10 bg-black flex flex-col items-center text-center">
              <div className="text-blue-500 mb-6">{stat.icon}</div>
              <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2">{stat.label}</div>
              <div className="text-2xl font-black text-white">{stat.val}</div>
            </div>
          ))}
        </div>

        {/* Technical Capabilities */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
          {[
            {
              icon: <Layers className="w-6 h-6 text-blue-500" />,
              title: "eBPF-based Observability",
              desc: "Сбор метрик на уровне ядра ОС с нулевым влиянием на производительность бизнес-приложений."
            },
            {
              icon: <Zap className="w-6 h-6 text-blue-500" />,
              title: "High-Frequency Sampling",
              desc: "Сбор данных с частотой до 1мс для обнаружения микро-всплесков (micro-bursts) трафика и латентности."
            },
            {
              icon: <ShieldCheck className="w-6 h-6 text-blue-500" />,
              title: "Anomaly Detection",
              desc: "Машинное обучение для выявления отклонений от нормального поведения системы в режиме реального времени."
            },
            {
              icon: <Server className="w-6 h-6 text-blue-500" />,
              title: "Hardware Telemetry",
              desc: "Мониторинг температуры ASIC, вольтажа SmartNIC и состояния памяти выделенных узлов."
            },
            {
              icon: <Activity className="w-6 h-6 text-blue-500" />,
              title: "Network Flow Analysis",
              desc: "Детальная визуализация L2-L7 трафика с идентификацией протоколов и анализом задержек на каждом узле."
            },
            {
              icon: <Settings className="w-6 h-6 text-blue-500" />,
              title: "Auto-Scaling Alerts",
              desc: "Интеграция с системами оркестрации для автоматического масштабирования ресурсов при росте нагрузки."
            }
          ].map((item, i) => (
            <div key={i} className="p-10 border border-white/10 bg-black/40 backdrop-blur-sm space-y-6 hover:border-blue-500/30 transition-colors">
              {item.icon}
              <h3 className="text-lg font-black text-white tracking-tighter">{item.title}</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed font-bold tracking-wider">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Workflow */}
        <div className="mb-32">
          <h2 className="technical-label mb-16 text-blue-500 text-center">Этапы внедрения системы</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-white/10 border border-white/10">
            {[
              { step: "01", title: "Infrastructure Audit", desc: "Анализ текущей архитектуры и определение критических точек сбора данных." },
              { step: "02", title: "Agent Deployment", desc: "Установка легковесных eBPF-агентов на целевые узлы инфраструктуры." },
              { step: "03", title: "Dashboard Config", desc: "Настройка визуализации, порогов срабатывания алертов и аналитических отчетов." },
              { step: "04", title: "24/7 Monitoring", desc: "Непрерывный сбор данных и предоставление доступа к порталу телеметрии." }
            ].map((item, i) => (
              <div key={i} className="p-8 bg-black space-y-6">
                <div className="text-2xl font-black text-white/10">{item.step}</div>
                <h4 className="text-[12px] font-black text-white uppercase tracking-widest">{item.title}</h4>
                <p className="text-[10px] text-muted-foreground leading-relaxed font-bold">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* B2B Form */}
        <section id="b2b-form" className="max-w-3xl mx-auto border border-white/10 bg-white/[0.02] p-10 md:p-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-black tracking-tighter text-white mb-4">Заявка на подключение телеметрии</h2>
            <p className="text-[10px] text-muted-foreground font-black tracking-widest uppercase">Ответ технического инженера в течение 1 часа</p>
          </div>
          
          <form className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Компания / ИНН</label>
                <input type="text" className="w-full bg-white/5 border border-white/10 p-4 text-[11px] text-white focus:border-blue-500 outline-none transition-all" placeholder="ООО Инфра-Хаб / 7730..." required />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Рабочий E-mail</label>
                <input type="email" className="w-full bg-white/5 border border-white/10 p-4 text-[11px] text-white focus:border-blue-500 outline-none transition-all" placeholder="ops@corp.ru" required />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Количество узлов / ОС</label>
              <input type="text" className="w-full bg-white/5 border border-white/10 p-4 text-[11px] text-white focus:border-blue-500 outline-none transition-all" placeholder="50+ Nodes / Ubuntu 22.04 LTS" required />
            </div>
            
            <div className="space-y-2">
              <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Технические требования</label>
              <textarea className="w-full bg-white/5 border border-white/10 p-4 text-[11px] text-white focus:border-blue-500 outline-none transition-all h-32 resize-none" placeholder="Укажите специфику: мониторинг Kubernetes, bare-metal серверов или сетевых каналов..."></textarea>
            </div>

            <div className="flex items-start gap-3">
              <input type="checkbox" id="compliance" className="mt-1" required />
              <label htmlFor="compliance" className="text-[9px] text-muted-foreground font-bold leading-relaxed tracking-wider">
                Я подтверждаю полномочия на заказ услуг мониторинга и согласен с условиями обработки данных.
              </label>
            </div>

            <button type="submit" className="w-full btn-enterprise py-5 text-[11px]">
              Запросить демо-доступ
            </button>
          </form>
        </section>

      </div>
    </div>
  );
}
