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
  Cpu, 
  Network,
  BarChart3,
  ShieldCheck
} from 'lucide-react';
import { useState, useEffect } from 'react';

type View = 'overview' | 'infrastructure' | 'analytics' | 'security';

export default function DashboardPage() {
  const [activeView, setActiveView] = useState<View>('overview');
  const [logs, setLogs] = useState<{id: string, msg: string, time: string, type: string}[]>([]);
  const [metrics, setMetrics] = useState({ req: 842109, storage: 412.8, latency: 12, errors: 0.02 });

  useEffect(() => {
    const interval = setInterval(() => {
      const timestamp = new Date().toLocaleTimeString('ru-RU', { hour12: false });
      const types = ['INFO', 'DEBUG', 'WARN', 'ERROR'];
      const type = types[Math.floor(Math.random() * types.length)];
      const id = Math.random().toString(36).substring(7).toUpperCase();
      
      const newLog = {
        id,
        time: timestamp,
        type,
        msg: `worker-${Math.floor(Math.random()*10)}: process_data stream_id=${id} status=${type === 'ERROR' ? 'fail' : 'success'} latency=${Math.floor(Math.random()*100)}ms`
      };

      setLogs(prev => [newLog, ...prev].slice(0, 15));
      setMetrics(prev => ({
        req: prev.req + Math.floor(Math.random() * 200 - 100),
        storage: +(prev.storage + 0.0001).toFixed(4),
        latency: Math.floor(Math.random() * 5 + 8),
        errors: +(0.01 + Math.random() * 0.05).toFixed(3)
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const renderOverview = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Запросы/сек', val: `${metrics.req.toLocaleString()}`, trend: '+12%', icon: <Activity className="w-4 h-4 text-blue-400" /> },
          { label: 'Задержка (p95)', val: `${metrics.latency}ms`, trend: '-2ms', icon: <Zap className="w-4 h-4 text-yellow-400" /> },
          { label: 'Ошибки', val: `${metrics.errors}%`, trend: '-0.01%', icon: <Database className="w-4 h-4 text-red-400" /> },
          { label: 'Uptime', val: `99.999%`, trend: 'Stable', icon: <Server className="w-4 h-4 text-green-400" /> },
        ].map((stat, i) => (
          <div key={i} className="ui-card p-5 bg-slate-900/40 border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-slate-800 rounded-md">{stat.icon}</div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stat.trend.startsWith('+') ? 'bg-green-500/10 text-green-400' : stat.trend === 'Stable' ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-400'}`}>
                {stat.trend}
              </span>
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">{stat.val}</div>
            <div className="text-xs text-slate-500 font-medium mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 ui-card bg-slate-900/40 border-slate-800 p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-sm font-bold text-white">Пропускная способность ClickHouse</h3>
              <p className="text-xs text-slate-500">Миллионы строк в секунду по всем кластерам</p>
            </div>
            <button className="text-xs text-blue-400 hover:underline flex items-center gap-1">
              Подробный отчет <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="h-64 flex items-end gap-1.5">
            {Array.from({ length: 40 }).map((_, i) => (
              <div 
                key={i} 
                className="flex-1 bg-blue-600/20 hover:bg-blue-600/40 transition-all rounded-t-sm" 
                style={{ height: `${30 + Math.random() * 70}%` }}
              />
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 ui-card bg-slate-950 border-slate-800 flex flex-col h-[400px]">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-blue-500" /> Живой поток событий
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          </div>
          <div className="flex-1 p-4 font-mono text-[11px] space-y-2 overflow-hidden overflow-y-auto scrollbar-hide">
            {logs.map((log) => (
              <div key={log.id} className="flex gap-3 text-slate-400 border-l border-slate-800 pl-3 py-0.5">
                <span className="text-slate-600 shrink-0">{log.time}</span>
                <span className={log.type === 'ERROR' ? 'text-red-500' : log.type === 'WARN' ? 'text-yellow-500' : 'text-blue-500'}>
                  [{log.type}]
                </span>
                <span className="truncate text-slate-300">{log.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  const renderInfrastructure = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { name: 'Cluster EU-West-1', status: 'Healthy', load: '42%', nodes: 12, icon: <Globe className="w-5 h-5 text-blue-400" /> },
          { name: 'Cluster US-East-2', status: 'Healthy', load: '68%', nodes: 24, icon: <Globe className="w-5 h-5 text-blue-400" /> },
          { name: 'Cluster ASIA-North', status: 'Warning', load: '89%', nodes: 8, icon: <Globe className="w-5 h-5 text-yellow-400" /> },
        ].map((cluster, i) => (
          <div key={i} className="ui-card p-6 bg-slate-900/40 border-slate-800">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-slate-800 rounded-lg">{cluster.icon}</div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cluster.status === 'Healthy' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                {cluster.status}
              </span>
            </div>
            <h4 className="text-white font-bold mb-2">{cluster.name}</h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex justify-between"><span>Нагрузка:</span><span className="text-white">{cluster.load}</span></div>
              <div className="flex justify-between"><span>Узлы:</span><span className="text-white">{cluster.nodes}</span></div>
            </div>
          </div>
        ))}
      </div>
      <div className="ui-card bg-slate-900/40 border-slate-800 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/80 text-slate-500 uppercase tracking-wider font-bold">
            <tr>
              <th className="px-6 py-4">Node ID</th>
              <th className="px-6 py-4">Instance Type</th>
              <th className="px-6 py-4">IP Address</th>
              <th className="px-6 py-4">CPU Use</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {[1,2,3,4,5].map(i => (
              <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4 font-mono text-blue-400 uppercase">node-{i}f{i}a</td>
                <td className="px-6 py-4 text-slate-300">c6g.2xlarge</td>
                <td className="px-6 py-4 text-slate-500">192.168.1.{100 + i}</td>
                <td className="px-6 py-4">
                  <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${20 + i*15}%` }} />
                  </div>
                </td>
                <td className="px-6 py-4"><span className="w-2 h-2 rounded-full bg-green-500 inline-block mr-2" /> Online</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="ui-card p-6 bg-slate-900/40 border-slate-800">
        <h4 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-400" /> Распределение типов трафика
        </h4>
        <div className="space-y-4">
          {[
            { label: 'gRPC Requests', val: '64%', color: 'bg-blue-500' },
            { label: 'HTTP/2 Logs', val: '28%', color: 'bg-indigo-500' },
            { label: 'WebSocket Streams', val: '8%', color: 'bg-slate-600' },
          ].map((item, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-400">{item.label}</span>
                <span className="text-white">{item.val}</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full ${item.color}`} style={{ width: item.val }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="ui-card p-6 bg-slate-900/40 border-slate-800 flex flex-col items-center justify-center text-center">
        <div className="p-4 bg-slate-800 rounded-full mb-4">
          <Database className="w-8 h-8 text-blue-400" />
        </div>
        <h4 className="text-white font-bold mb-2">ClickHouse Storage Optimizer</h4>
        <p className="text-xs text-slate-500 max-w-xs mb-6">
          Автоматическое сжатие данных завершено. Экономия места: 84.2 TB в этом месяце.
        </p>
        <button className="btn-primary w-full max-w-[200px] text-xs py-2">Запустить аудит</button>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="ui-card p-6 bg-slate-900/40 border-red-900/20 border">
          <div className="flex items-center gap-3 mb-4 text-red-400">
            <ShieldAlert className="w-5 h-5" />
            <h4 className="text-sm font-bold uppercase tracking-wider">Угрозы безопасности</h4>
          </div>
          <div className="text-3xl font-bold text-white mb-2">0</div>
          <p className="text-xs text-slate-500">Критичеких уязвимостей не обнаружено за последние 24 часа.</p>
        </div>
        <div className="ui-card p-6 bg-slate-900/40 border-blue-900/20 border">
          <div className="flex items-center gap-3 mb-4 text-blue-400">
            <ShieldCheck className="w-5 h-5" />
            <h4 className="text-sm font-bold uppercase tracking-wider">Статус шифрования</h4>
          </div>
          <div className="text-3xl font-bold text-white mb-2">AES-256</div>
          <p className="text-xs text-slate-500">Все входящие gRPC стримы защищены TLS 1.3 с ротацией ключей.</p>
        </div>
      </div>
      <div className="ui-card bg-slate-950 border-slate-800 p-6">
        <h4 className="text-xs font-bold text-white mb-4 uppercase tracking-widest">Последние аудиты доступа</h4>
        <div className="space-y-3 font-mono text-[10px]">
          {[1,2,3].map(i => (
            <div key={i} className="flex justify-between items-center py-2 border-b border-slate-800 text-slate-500">
              <span className="text-green-400">SUCCESS</span>
              <span>IAM_AUTH_KEY: *********{i}2f</span>
              <span>185.22.14.{i*12}</span>
              <span>{new Date().toISOString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm px-6 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 font-semibold text-white cursor-pointer" onClick={() => setActiveView('overview')}>
              <LayoutGrid className="w-5 h-5 text-blue-500" />
              <span>Консоль управления</span>
            </div>
            <nav className="hidden md:flex items-center gap-6 text-sm text-slate-400">
              <button 
                onClick={() => setActiveView('overview')}
                className={`${activeView === 'overview' ? 'text-white border-b-2 border-blue-500' : 'hover:text-white'} transition-all py-1`}
              >
                Обзор
              </button>
              <button 
                onClick={() => setActiveView('infrastructure')}
                className={`${activeView === 'infrastructure' ? 'text-white border-b-2 border-blue-500' : 'hover:text-white'} transition-all py-1`}
              >
                Инфраструктура
              </button>
              <button 
                onClick={() => setActiveView('analytics')}
                className={`${activeView === 'analytics' ? 'text-white border-b-2 border-blue-500' : 'hover:text-white'} transition-all py-1`}
              >
                Аналитика
              </button>
              <button 
                onClick={() => setActiveView('security')}
                className={`${activeView === 'security' ? 'text-white border-b-2 border-blue-500' : 'hover:text-white'} transition-all py-1`}
              >
                Безопасность
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden lg:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Поиск по метрикам..." 
                className="bg-slate-950 border border-slate-800 rounded-md py-1.5 pl-9 pr-4 text-xs w-64 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
            <button className="p-2 text-slate-400 hover:text-white transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-slate-900" />
            </button>
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white cursor-pointer">
              JD
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white tracking-tight capitalize">
            {activeView === 'overview' ? 'Состояние системы' : activeView}
          </h2>
          <div className="text-xs text-slate-500 bg-slate-900 px-3 py-1 rounded-full border border-slate-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Все системы работают нормально
          </div>
        </div>

        {activeView === 'overview' && renderOverview()}
        {activeView === 'infrastructure' && renderInfrastructure()}
        {activeView === 'analytics' && renderAnalytics()}
        {activeView === 'security' && renderSecurity()}
      </main>
    </div>
  );
}
