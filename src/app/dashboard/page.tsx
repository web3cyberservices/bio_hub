
'use client';

import { 
  Activity, 
  Database, 
  Server, 
  Terminal, 
  Zap, 
  ShieldCheck,
  Cpu,
  Network,
  ChevronRight,
  User,
  Shield,
  Menu,
  X,
  Search,
  Layout,
  Lock,
  Globe,
  BarChart3
} from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

type View = 'overview' | 'infrastructure' | 'analytics' | 'security';

export default function DashboardPage() {
  const [activeView, setActiveView] = useState<View>('overview');
  const [logs, setLogs] = useState<{id: string, msg: string, time: string, type: string}[]>([]);
  const [metrics, setMetrics] = useState({ req: 842109, storage: 412.8, latency: 12, errors: 0.02 });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        msg: `worker-${Math.floor(Math.random()*10)}: process_stream sid=${id} proto=gRPC sz=${Math.floor(Math.random()*1024)}KB`
      };

      setLogs(prev => [newLog, ...prev].slice(0, 20));
    }, 1200);

    return () => clearInterval(logInterval);
  }, []);

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 border border-white/5">
        {[
          { label: 'Событий/сек', val: `${metrics.req.toLocaleString()}`, icon: <Activity className="w-3.5 h-3.5" /> },
          { label: 'Задержка p99', val: `${metrics.latency}ms`, icon: <Zap className="w-3.5 h-3.5" /> },
          { label: 'Ошибки (%)', val: `${metrics.errors}%`, icon: <Shield className="w-3.5 h-3.5" /> },
          { label: 'Хранилище', val: `${metrics.storage.toFixed(1)} TB`, icon: <Database className="w-3.5 h-3.5" /> },
        ].map((stat, i) => (
          <div key={i} className="bg-background p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-white/40">{stat.icon}</span>
              <span className="technical-label">{stat.label}</span>
            </div>
            <div className="text-2xl font-mono font-bold tracking-tight">{stat.val}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="ui-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-500" /> Пропускная способность (Live)
              </h3>
              <div className="technical-label">Поток gRPC</div>
            </div>
            <div className="h-40 flex items-end gap-1 px-1">
              {Array.from({length: 60}).map((_, i) => (
                <div 
                  key={i} 
                  className="flex-1 bg-blue-500/20 border-t border-blue-500/40" 
                  style={{ height: `${Math.random() * 60 + 20}%` }}
                />
              ))}
            </div>
          </div>
          
          <div className="ui-card overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="text-[10px] font-black uppercase tracking-widest">Активные узлы</div>
              <span className="technical-label text-green-500">12 Онлайн</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[10px]">
                <thead className="bg-white/5 text-muted-foreground uppercase font-bold tracking-[0.15em]">
                  <tr>
                    <th className="px-6 py-3">ID Узла</th>
                    <th className="px-6 py-3">Регион</th>
                    <th className="px-6 py-3">Нагрузка</th>
                    <th className="px-6 py-3">Статус</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {['cl-node-prd-01', 'cl-node-prd-02', 'cl-node-prd-03'].map((node) => (
                    <tr key={node} className="hover:bg-white/[0.02]">
                      <td className="px-6 py-3 text-white">{node}</td>
                      <td className="px-6 py-3">EU-Central-1</td>
                      <td className="px-6 py-3">{(Math.random() * 40 + 10).toFixed(1)}%</td>
                      <td className="px-6 py-3"><span className="text-green-500 font-bold">● HEALTHY</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 ui-card flex flex-col h-[500px]">
          <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
            <div className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <Terminal className="w-4 h-4 text-blue-500" /> Стрим событий
            </div>
          </div>
          <div className="flex-1 p-4 font-mono text-[9px] space-y-1 overflow-y-auto bg-black/40">
            {logs.map((log) => (
              <div key={log.id} className="flex gap-2 text-muted-foreground border-l border-white/10 pl-2 py-0.5">
                <span className="text-white/20 shrink-0">{log.time}</span>
                <span className={log.type === 'ERROR' ? 'text-red-500' : 'text-blue-500'}>[{log.type}]</span>
                <span className="text-white/80 break-all">{log.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <header className="border-b border-white/5 bg-black/50 backdrop-blur-sm sticky top-14 z-40">
        <div className="container mx-auto px-4 h-12 flex items-center justify-between">
          <nav className="flex items-center gap-8 overflow-x-auto no-scrollbar">
            {(['overview', 'infrastructure', 'analytics', 'security'] as View[]).map((v) => (
              <button 
                key={v}
                onClick={() => setActiveView(v)}
                className={`text-[9px] font-black uppercase tracking-[0.2em] transition-colors whitespace-nowrap ${activeView === v ? 'text-blue-500 border-b-2 border-blue-500 py-3.5 mt-0.5' : 'text-muted-foreground hover:text-white py-4'}`}
              >
                {v === 'overview' ? 'Обзор' : v === 'infrastructure' ? 'Инфраструктура' : v === 'analytics' ? 'Аналитика' : 'Безопасность'}
              </button>
            ))}
          </nav>
          
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-sm">
              <Search className="w-3 h-3 text-muted-foreground" />
              <span className="text-[9px] text-muted-foreground font-mono">CMD + K</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 text-[9px] font-mono uppercase text-muted-foreground">
            <span>Консоль</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">
              {activeView === 'overview' ? 'Обзор системы' : activeView === 'infrastructure' ? 'Узлы сети' : activeView === 'analytics' ? 'Метрики потока' : 'Протоколы защиты'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="technical-label text-green-500 font-bold">Система в норме</span>
          </div>
        </div>

        {activeView === 'overview' && renderOverview()}
        
        {activeView === 'infrastructure' && (
           <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['EU-Central', 'US-East', 'Asia-South'].map(region => (
                  <div key={region} className="ui-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="technical-label">{region}</h4>
                      <Globe className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold font-mono">4 Активных узла</div>
                    <p className="text-[9px] text-muted-foreground mt-2 uppercase tracking-widest font-bold">Средняя задержка: 14мс</p>
                  </div>
                ))}
             </div>
             <div className="ui-card p-8 flex flex-col items-center justify-center text-center bg-grid min-h-[300px]">
                <Server className="w-8 h-8 text-white/10 mb-4" />
                <p className="technical-label">Полный список узлов загружен</p>
                <p className="text-[9px] text-muted-foreground font-mono mt-1">Ожидание данных телеметрии по gRPC...</p>
             </div>
           </div>
        )}

        {activeView === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="ui-card p-6">
                <h4 className="technical-label mb-4">Распределение протоколов</h4>
                <div className="space-y-4">
                  {[
                    { label: 'gRPC (Binary)', val: '84%', color: 'bg-blue-500' },
                    { label: 'HTTP/2 (JSON)', val: '12%', color: 'bg-blue-400' },
                    { label: 'Other', val: '4%', color: 'bg-white/10' }
                  ].map(p => (
                    <div key={p.label}>
                      <div className="flex justify-between text-[10px] font-bold uppercase mb-1">
                        <span>{p.label}</span>
                        <span>{p.val}</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full ${p.color}`} style={{ width: p.val }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="ui-card p-6 bg-grid">
                <h4 className="technical-label mb-4">Оптимизация ClickHouse</h4>
                <div className="flex items-center justify-center h-32">
                   <div className="text-center">
                      <div className="text-3xl font-mono font-bold">99.2%</div>
                      <div className="text-[9px] font-black uppercase text-blue-400 tracking-widest">Индекс сжатия</div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'security' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               <div className="ui-card p-6">
                  <div className="flex items-center gap-3 text-green-500 mb-4">
                    <Lock className="w-4 h-4" />
                    <h4 className="technical-label font-bold text-green-500">Шифрование AES-256</h4>
                  </div>
                  <p className="text-[10px] text-muted-foreground uppercase leading-relaxed font-bold">Весь входящий трафик шифруется на уровне L4 перед записью в хранилище.</p>
               </div>
               <div className="ui-card p-6 border-blue-500/30">
                  <div className="flex items-center gap-3 text-blue-500 mb-4">
                    <ShieldCheck className="w-4 h-4" />
                    <h4 className="technical-label font-bold text-blue-500">HSM Изоляция</h4>
                  </div>
                  <p className="text-[10px] text-muted-foreground uppercase leading-relaxed font-bold">Ключи TLS хранятся в защищенных аппаратных модулях узлов приема.</p>
               </div>
               <div className="ui-card p-6">
                  <div className="flex items-center gap-3 text-white/60 mb-4">
                    <Activity className="w-4 h-4" />
                    <h4 className="technical-label font-bold">Аудит доступа</h4>
                  </div>
                  <div className="space-y-2 font-mono text-[9px]">
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span>ROOT_AUTH</span>
                      <span className="text-green-500">SUCCESS</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span>API_KEY_ROT</span>
                      <span className="text-white/40">24H AGO</span>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
