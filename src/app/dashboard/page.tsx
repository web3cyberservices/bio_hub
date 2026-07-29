'use client';

import { Activity, Database, Server, Terminal, Zap, Cpu, Globe, Shield } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export default function DashboardPage() {
  const [logs, setLogs] = useState<{id: string, msg: string, time: string}[]>([]);
  const [metrics, setMetrics] = useState({ req: 842109, storage: 412.8, latency: 12 });
  const [bars, setBars] = useState<number[]>(Array(40).fill(20));

  // Имитация стрима данных без внешних библиотек
  useEffect(() => {
    const interval = setInterval(() => {
      const timestamp = new Date().toLocaleTimeString('ru-RU', { hour12: false });
      const types = ['gRPC_PAYLOAD', 'BINARY_CHUNK', 'METRIC_SYNC', 'HEARTBEAT'];
      const type = types[Math.floor(Math.random() * types.length)];
      const id = Math.random().toString(36).substring(7).toUpperCase();
      
      const newLog = {
        id,
        time: timestamp,
        msg: `${type}: ID_${id} | ADDR: 10.0.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)} | SZ: ${Math.floor(Math.random()*4096)}B`
      };

      setLogs(prev => [newLog, ...prev].slice(0, 18));
      setMetrics(prev => ({
        req: prev.req + Math.floor(Math.random() * 2000 - 800),
        storage: +(prev.storage + 0.0001).toFixed(4),
        latency: Math.floor(Math.random() * 5 + 8)
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b border-white/5 pb-16">
        <div>
          <h1 className="text-5xl font-black tracking-tighter mb-4 text-gradient">Ingestion Console</h1>
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Real-time Telemetry Processing (Active)</p>
        </div>
        <div className="flex gap-4">
          <div className="px-6 py-4 glass-card rounded-2xl border-primary/20">
            <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Status</div>
            <div className="text-sm font-black text-green-500 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Nodes: 128 Online
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-6">
        <div className="md:col-span-8 space-y-6">
          <div className="glass-card p-10 h-[450px] relative overflow-hidden rounded-[2.5rem]">
            <div className="flex justify-between items-start mb-12 relative z-10">
              <div className="space-y-1">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Global Throughput</h4>
                <div className="text-4xl font-black text-white tracking-tighter">{metrics.req.toLocaleString()} <span className="text-sm text-primary font-bold italic">RPS</span></div>
              </div>
              <Activity className="w-8 h-8 text-primary animate-pulse" />
            </div>
            
            {/* Легковесная визуализация через SVG/Div */}
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

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { label: 'Avg Latency', val: `${metrics.latency}ms`, icon: <Zap /> },
              { label: 'Ingested', val: `${metrics.storage} PB`, icon: <Database /> },
              { label: 'CPU Load', val: '14.2%', icon: <Cpu /> },
            ].map((stat, i) => (
              <div key={i} className="glass-card p-8 rounded-2xl border-white/5 group hover:border-primary/30 transition-all">
                <div className="flex items-center gap-2 text-primary mb-4">
                  <span className="w-4 h-4">{stat.icon}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest">{stat.label}</span>
                </div>
                <div className="text-2xl font-black text-white">{stat.val}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-4">
          <div className="glass-card p-8 h-full rounded-[2.5rem] flex flex-col border-white/5 bg-black/40">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white flex items-center gap-3">
                <Terminal className="w-4 h-4 text-primary" /> Live Log Stream
              </h4>
              <Shield className="w-4 h-4 text-green-500/50" />
            </div>
            <div className="flex-1 space-y-4 font-mono text-[9px] leading-relaxed overflow-hidden">
              {logs.map((log) => (
                <div key={log.id} className="flex flex-col gap-1 border-l border-primary/20 pl-4 animate-in fade-in slide-in-from-right-2">
                  <div className="flex justify-between text-white/30 text-[8px]">
                    <span>{log.time}</span>
                    <span className="text-primary/50">#TLS_1.3</span>
                  </div>
                  <div className="text-white/60 break-all">{log.msg}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
