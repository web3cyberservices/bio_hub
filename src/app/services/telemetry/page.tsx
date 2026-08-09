
import { Cpu, LineChart, BarChart, Settings } from 'lucide-react';

export default function TelemetryPage() {
  return (
    <div className="min-h-screen bg-grid py-20 md:py-32">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-16 border-b border-white/10 pb-12">
          <div className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Системы мониторинга</div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-6">B2B Телеметрия и мониторинг</h1>
          <p className="text-[11px] text-muted-foreground font-bold tracking-[0.2em] max-w-2xl leading-relaxed">
            Прозрачный контроль за состоянием ваших вычислительных ресурсов и сетевых потоков в режиме реального времени.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { icon: <Cpu className="w-5 h-5" />, label: "Node Health", val: "99.9%" },
            { icon: <LineChart className="w-5 h-5" />, label: "Throughput", val: "4.2 TB/d" },
            { icon: <BarChart className="w-5 h-5" />, label: "Error Rate", val: "0.001%" },
            { icon: <Settings className="w-5 h-5" />, label: "Resources", val: "Optimized" }
          ].map((stat, i) => (
            <div key={i} className="p-6 border border-white/10 bg-black flex flex-col items-center text-center">
              <div className="text-blue-500 mb-4">{stat.icon}</div>
              <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2">{stat.label}</div>
              <div className="text-xl font-black text-white">{stat.val}</div>
            </div>
          ))}
        </div>

        <div className="mt-20 space-y-12">
          <div className="max-w-3xl">
            <h3 className="text-xl font-black text-white mb-6">Аналитический дашборд</h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed font-bold tracking-widest">
              Все пользователи получают доступ к специализированной консоли мониторинга, где отображается состояние выделенных серверов, 
              загрузка процессоров, температура ASIC-ускорителей и статистика gRPC-запросов.
            </p>
          </div>
          <div className="h-64 border border-white/10 bg-white/[0.02] flex items-center justify-center font-mono text-[9px] text-white/20 uppercase tracking-[0.5em]">
            [ Визуализация потоков данных ]
          </div>
        </div>
      </div>
    </div>
  );
}
