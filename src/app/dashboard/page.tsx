'use client';

import { Activity, Database, Server, Terminal, Zap, Cpu, Globe, Shield, BarChart2, Search } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const [logs, setLogs] = useState<{id: string, msg: string, time: string, type: string}[]>([]);
  const [metrics, setMetrics] = useState({ req: 842109, storage: 412.8, latency: 12, errors: 0.02 });
  const [bars, setBars] = useState<number[]>(Array(40).fill(20));

  useEffect(() => {
    const interval = setInterval(() => {
      const timestamp = new Date().toLocaleTimeString('ru-RU', { hour12: false });
      const types = ['gRPC_PAYLOAD', 'BINARY_CHUNK', 'METRIC_SYNC', 'HEARTBEAT', 'TRANSACTION_LOG', 'CLICKSTREAM_UNIT'];
      const type = types[Math.floor(Math.random() * types.length)];
      const id = Math.random().toString(36).substring(7).toUpperCase();
      
      const newLog = {
        id,
        time: timestamp,
        type,
        msg: `${type}: ID_${id} | ADDR: 10.0.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)} | SZ: ${Math.floor(Math.random()*4096)}B | ACK: TRUE`
      };

      setLogs(prev => [newLog, ...prev].slice(0, 20));
      setMetrics(prev => ({
        req: prev.req + Math.floor(Math.random() * 2000 - 800),
        storage: +(prev.storage + 0.0001).toFixed(4),
        latency: Math.floor(Math.random() * 5 + 8),
        errors: +(0.01 + Math.random() * 0.05).toFixed(3)
      }));

      setBars(prev => {
        const next = [...prev.slice(1), Math.random() * 80 + 20];
        return next;
      });
    }, 400);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-20 container mx-auto px-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 border-b border-white/5 pb-10">
        <div>
          <h1 className="text-4xl font-black tracking-tighter mb-2 text-gradient">Консоль CyberLog V2</h1>
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Активный поток телеметрии: gRPC/HTTP2</p>
        </div>
        <div className="flex gap-4">
          <div className="px-6 py-3 glass-card rounded-2xl border-primary/20 flex items-center gap-4">
            <div className="text-right">
              <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Статус системы</div>
              <div className="text-xs font-black text-green-500">Nodes: 128 Online</div>
            </div>
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-6">
        <div className="md:col-span-8 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Throughput', val: `${metrics.req.toLocaleString()} RPS`, icon: <Activity /> },
              { label: 'Latency', val: `${metrics.latency}ms`, icon: <Zap /> },
              { label: 'Error Rate', val: `${metrics.errors}%`, icon: <Shield /> },
              { label: 'Storage', val: `${metrics.storage} PB`, icon: <Database /> },
            ].map((stat, i) => (
              <div key={i} className="glass-card p-6 rounded-2xl border-white/5 group hover:border-primary/30 transition-all">
                <div className="flex items-center gap-2 text-primary mb-3">
                  <span className="w-3 h-3">{stat.icon}</span>
                  <span className="text-[8px] font-black uppercase tracking-widest">{stat.label}</span>
                </div>
                <div className="text-xl font-black text-white">{stat.val}</div>
              </div>
            ))}
          </div>

          <div className="glass-card p-10 h-[400px] relative overflow-hidden rounded-[2.5rem]">
            <div className="flex justify-between items-start mb-12 relative z-10">
              <div className="space-y-1">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Глобальный поток событий (Events/Sec)</h4>
                <div className="text-3xl font-black text-white tracking-tighter">Live ClickHouse Stream</div>
              </div>
              <BarChart2 className="w-6 h-6 text-primary" />
            </div>
            
            <div className="absolute bottom-10 left-10 right-10 h-48 flex items-end gap-1.5">
              {bars.map((height, i) => (
                <div 
                  key={i} 
                  className="flex-1 bg-primary/20 border-t border-primary/40 transition-all duration-300 rounded-t-sm" 
                  style={{ height: `${height}%`, opacity: (i + 1) / bars.length }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="md:col-span-4">
          <div className="glass-card p-8 h-full rounded-[2.5rem] flex flex-col border-white/5 bg-black/40">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white flex items-center gap-3">
                <Terminal className="w-4 h-4 text-primary" /> Живой поток логов
              </h4>
              <Search className="w-4 h-4 text-white/20" />
            </div>
            <div className="flex-1 space-y-3 font-mono text-[9px] leading-relaxed overflow-hidden">
              {logs.map((log) => (
                <div key={log.id} className="flex flex-col gap-1 border-l border-primary/20 pl-4 animate-in fade-in slide-in-from-right-2">
                  <div className="flex justify-between text-white/30 text-[8px]">
                    <span className="text-primary/70">{log.type}</span>
                    <span>{log.time}</span>
                  </div>
                  <div className="text-white/60 break-all">{log.msg}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-white/5">
              <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-2 text-center">Конфигурация инжеста: Active gRPC</div>
              <div className="flex justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <div className="w-2 h-2 rounded-full bg-primary/40" />
                <div className="w-2 h-2 rounded-full bg-primary/40" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
