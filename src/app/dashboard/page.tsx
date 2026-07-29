
'use client';

import { 
  Activity, 
  Database, 
  Server, 
  Terminal, 
  Zap, 
  Search, 
  Bell, 
  LayoutGrid, 
  ArrowUpRight, 
  ShieldAlert, 
  Globe, 
  BarChart3,
  ShieldCheck,
  Cpu,
  Network
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

type View = 'overview' | 'infrastructure' | 'analytics' | 'security';

export default function DashboardPage() {
  const [activeView, setActiveView] = useState<View>('overview');
  const [logs, setLogs] = useState<{id: string, msg: string, time: string, type: string}[]>([]);
  const [metrics, setMetrics] = useState({ req: 842109, storage: 412.8, latency: 12, errors: 0.02 });
  const [throughput, setThroughput] = useState<number[]>(Array(40).fill(0));

  // Имитация высокопроизводительного стриминга логов
  useEffect(() => {
    const logInterval = setInterval(() => {
      const timestamp = new Date().toLocaleTimeString('ru-RU', { hour12: false });
      const types = ['INFO', 'DEBUG', 'WARN', 'ERROR'];
      const type = types[Math.floor(Math.random() * types.length)];
      const id = Math.random().toString(36).substring(7).toUpperCase();
      
      const newLog = {
        id,
        time: timestamp,
        type,
        msg: `worker-${Math.floor(Math.random()*10)}: process_stream stream_id=${id} protocol=${Math.random() > 0.5 ? 'gRPC' : 'HTTP2'} status=200 size=${Math.floor(Math.random()*1024)}KB`
      };

      setLogs(prev => [newLog, ...prev].slice(0, 15));
    }, 400);

    const metricsInterval = setInterval(() => {
      setMetrics(prev => ({
        req: prev.req + Math.floor(Math.random() * 500),
        storage: +(prev.storage + 0.0001).toFixed(4),
        latency: Math.floor(Math.random() * 4 + 10),
        errors: +(0.01 + Math.random() * 0.02).toFixed(3)
      }));
      setThroughput(prev => [...prev.slice(1), Math.floor(Math.random() * 80 + 20)]);
    }, 1000);

    return () => {
      clearInterval(logInterval);
      clearInterval(metricsInterval);
    };
  }, []);

  const renderOverview = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Событий/сек (gRPC)', val: `${metrics.req.toLocaleString()}`, trend: '+14%', icon: <Activity className="w-4 h-4 text-blue-400" /> },
          { label: 'Задержка p99', val: `${metrics.latency}ms`, trend: '-1ms', icon: <Zap className="w-4 h-4 text-yellow-400" /> },
          { label: 'Ошибка приема', val: `${metrics.errors}%`, trend: '0.00%', icon: <ShieldAlert className="w-4 h-4 text-red-400" /> },
          { label: 'Хранилище ClickHouse', val: `${metrics.storage.toFixed(1)} TB`, trend: '+0.4%', icon: <Database className="w-4 h-4 text-indigo-400" /> },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900/40 border border-white/5 p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-slate-800/50 rounded-lg border border-white/5">{stat.icon}</div>
              <span className="text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">{stat.trend}</span>
            </div>
            <div className="text-2xl font-black text-white tracking-tighter">{stat.val}</div>
            <div className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-slate-900/40 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Network className="w-4 h-4 text-blue-500" /> Пропускная способность Ingestion-слоя
              </h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">Миллионы событий / HTTP2 мультиплексирование</p>
            </div>
          </div>
          <div className="h-64 flex items-end gap-1 px-2">
            {throughput.map((v, i) => (
              <div 
                key={i} 
                className="flex-1 bg-blue-600/20 hover:bg-blue-600/40 transition-all rounded-t-sm" 
                style={{ height: `${v}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-4 px-2 text-[10px] font-bold text-slate-600 uppercase">
            <span>T-60 min</span>
            <span>T-30 min</span>
            <span>Real-time</span>
          </div>
        </div>

        <div className="lg:col-span-4 bg-black/40 border border-white/5 rounded-2xl flex flex-col h-[400px]">
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
            <div className="text-[10px] font-bold text-white flex items-center gap-2 uppercase tracking-widest">
              <Terminal className="w-4 h-4 text-blue-500" /> Live Ingestion Stream
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-500">GRPC</span>
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            </div>
          </div>
          <div className="flex-1 p-4 font-mono text-[11px] space-y-2 overflow-hidden overflow-y-auto scrollbar-hide bg-black/20">
            {logs.map((log) => (
              <div key={log.id} className="flex gap-3 text-slate-400 border-l-2 border-slate-800 pl-3 py-1 hover:bg-white/5 transition-colors">
                <span className="text-slate-600 shrink-0">{log.time}</span>
                <span className={log.type === 'ERROR' ? 'text-red-500' : log.type === 'WARN' ? 'text-yellow-500' : 'text-blue-500'}>
                  {log.type}
                </span>
                <span className="truncate text-slate-300">{log.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200">
      <header className="border-b border-white/5 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50 px-6 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-2 font-bold text-white cursor-pointer" onClick={() => setActiveView('overview')}>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-xs">CL</div>
              <span className="tracking-tight">Console</span>
            </div>
            <nav className="hidden md:flex items-center gap-8 text-[11px] font-black uppercase tracking-widest text-slate-500">
              {['overview', 'infrastructure', 'analytics', 'security'].map((v) => (
                <button 
                  key={v}
                  onClick={() => setActiveView(v as View)}
                  className={`${activeView === v ? 'text-blue-400' : 'hover:text-white'} transition-all`}
                >
                  {v}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden lg:block">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Поиск по метрикам..." 
                className="bg-black/50 border border-white/10 rounded-full py-1.5 pl-9 pr-4 text-[11px] w-64 focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
            <button className="p-2 text-slate-400 hover:text-white transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-500 rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-[10px] font-black text-white cursor-pointer">
              JD
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight uppercase">
              {activeView === 'overview' ? 'System Health' : activeView}
            </h2>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Region: EU-West-1</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Cluster: CL-PRD-01</span>
            </div>
          </div>
          <div className="text-[10px] font-bold text-green-400 bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20 flex items-center gap-2 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Operational
          </div>
        </div>

        {activeView === 'overview' && renderOverview()}
        {activeView !== 'overview' && (
          <div className="flex items-center justify-center h-64 border border-dashed border-white/10 rounded-2xl bg-white/5">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Загрузка данных {activeView}...</p>
          </div>
        )}
      </main>
    </div>
  );
}
