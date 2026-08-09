
import { Zap, Activity, ArrowRightLeft, Server } from 'lucide-react';

export default function DataStreamingPage() {
  return (
    <div className="min-h-screen bg-grid py-20 md:py-32">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-16 border-b border-white/10 pb-12">
          <div className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Инфраструктурный департамент</div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-6">Провайдер потоковых данных</h1>
          <p className="text-[11px] text-muted-foreground font-bold tracking-[0.2em] max-w-2xl leading-relaxed">
            Высокоскоростная передача рыночных данных и телеметрии через изолированные каналы связи для HFT-алгоритмов.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Zap className="w-6 h-6 text-blue-500" />,
              title: "gRPC Streams",
              desc: "Двунаправленные потоки данных с минимальными задержками для обработки транзакций в реальном времени."
            },
            {
              icon: <ArrowRightLeft className="w-6 h-6 text-blue-500" />,
              title: "Low-Latency WSS",
              desc: "Оптимизированные WebSocket соединения для моментального получения обновлений мемпула и биржевых стаканов."
            },
            {
              icon: <Server className="w-6 h-6 text-blue-500" />,
              title: "Dedicated Nodes",
              desc: "Выделенные узлы исполнения, исключающие конкуренцию за ресурсы с другими клиентами."
            }
          ].map((item, i) => (
            <div key={i} className="p-8 border border-white/10 bg-black space-y-6">
              {item.icon}
              <h3 className="text-lg font-black text-white">{item.title}</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed font-bold tracking-wider">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-20 p-8 border border-white/10 bg-white/[0.01]">
          <h4 className="technical-label mb-6">Технические характеристики каналов</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 font-mono">
            <div>
              <div className="text-[9px] text-white/40 mb-2">Throughput</div>
              <div className="text-white font-black text-[14px]">100 Gbps</div>
            </div>
            <div>
              <div className="text-[9px] text-white/40 mb-2">Latency p99</div>
              <div className="text-white font-black text-[14px]">&lt; 0.5ms</div>
            </div>
            <div>
              <div className="text-[9px] text-white/40 mb-2">Jitter</div>
              <div className="text-white font-black text-[14px]">~12μs</div>
            </div>
            <div>
              <div className="text-[9px] text-white/40 mb-2">Uptime</div>
              <div className="text-white font-black text-[14px]">99.999%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
