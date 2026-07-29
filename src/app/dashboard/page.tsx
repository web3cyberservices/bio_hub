'use client';

import { Activity, Database, Server, Terminal, Zap, Cpu, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [metrics, setMetrics] = useState({ req: 842109, storage: 412.8 });

  useEffect(() => {
    const interval = setInterval(() => {
      const timestamp = new Date().toLocaleTimeString('ru-RU');
      const newLog = `[${timestamp}] gRPC_STREAM:ID_${Math.random().toString(36).substring(7).toUpperCase()} TYPE:BINARY_CHUNK BYTES:2048`;
      setLogs(prev => [newLog, ...prev].slice(0, 15));
      setMetrics(prev => ({
        req: prev.req + Math.floor(Math.random() * 1000 - 500),
        storage: +(prev.storage + 0.001).toFixed(4)
      }));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-20 container mx-auto px-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b border-white/5 pb-16">
        <div>
          <h1 className="text-5xl font-black tracking-tighter mb-4 text-gradient">Ingestion Console</h1>
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Real-time gRPC Stream Monitoring</p>
        </div>
        <div className="flex gap-4">
          <div className="px-6 py-4 glass-card rounded-2xl">
            <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Session Protocol</div>
            <div className="text-sm font-mono font-bold text-primary">HTTP/2 h2c</div>
          </div>
          <div className="px-6 py-4 glass-card rounded-2xl border-green-500/20">
            <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">DPI Bypass Status</div>
            <div className="text-sm font-black text-green-500 tracking-widest">Active / Masked</div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-6">
        <div className="md:col-span-8 space-y-6">
          <div className="glass-card p-10 h-[400px] relative overflow-hidden group rounded-[2rem]">
            <div className="flex justify-between items-start mb-12 relative z-10">
              <div className="space-y-1">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Входящий поток (Multiplexed)</h4>
                <div className="text-3xl font-black text-white tracking-tighter">{metrics.req.toLocaleString()} <span className="text-sm text-primary italic">req/s</span></div>
              </div>
              <Activity className="w-8 h-8 text-primary animate-pulse" />
            </div>
            
            <div className="absolute bottom-0 left-0 w-full h-1/2 flex items-end gap-1 px-10 pb-10">
              {[...Array(30)].map((_, i) => (
                <div 
                  key={i} 
                  className="flex-1 bg-primary/20 hover:bg-primary transition-all duration-300" 
                  style={{ height: `${Math.random() * 80 + 20}%` }}
                />
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-sm">
            {[
              { label: 'Latency', val: '< 12ms', icon: <Zap /> },
              { label: 'Storage', val: `${metrics.storage} TB`, icon: <Database /> },
              { label: 'Cluster Nodes', val: '42 / Online', icon: <Server /> },
            ].map((stat, i) => (
              <div key={i} className="glass-card p-6 space-y-4 rounded-2xl">
                <div className="flex items-center gap-2 text-primary">
                  <span className="w-4 h-4">{stat.icon}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest">{stat.label}</span>
                </div>
                <div className="text-xl font-black text-white">{stat.val}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-4">
          <div className="glass-card p-8 h-full rounded-[2rem] flex flex-col">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white flex items-center gap-3">
                <Terminal className="w-4 h-4 text-primary" /> Live Stream Agent
              </h4>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
            </div>
            <div className="flex-1 space-y-3 font-mono text-[9px] text-muted-foreground uppercase tracking-tight overflow-hidden">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-4 border-l-2 border-primary/20 pl-4 py-1 animate-in fade-in slide-in-from-left-2">
                  <span className="text-white/40">{log}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
