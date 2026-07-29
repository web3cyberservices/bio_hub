import { Activity, ArrowUpRight, BarChart3, Database, Server, Terminal, Zap } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="min-h-screen pt-24 pb-20 container mx-auto px-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b border-white/5 pb-16">
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter mb-4 text-gradient">Data Console</h1>
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Real-time Cluster Monitoring V3.0</p>
        </div>
        <div className="flex gap-4">
          <div className="px-6 py-4 glass-card">
            <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Системное время</div>
            <div className="text-sm font-mono font-bold text-white">2026-07-29 06:45:12</div>
          </div>
          <div className="px-6 py-4 glass-card border-green-500/20">
            <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Статус сети</div>
            <div className="text-sm font-black text-green-500 uppercase tracking-widest">Connected</div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-6">
        {/* Main Chart Simulation */}
        <div className="md:col-span-8 space-y-6">
          <div className="glass-card p-10 h-[400px] relative overflow-hidden group">
            <div className="flex justify-between items-start mb-12">
              <div className="space-y-1">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Входящий поток (Ingestion)</h4>
                <div className="text-3xl font-black text-white tracking-tighter">842,109 <span className="text-sm text-primary">req/s</span></div>
              </div>
              <Activity className="w-8 h-8 text-primary animate-pulse" />
            </div>
            
            {/* Mock Graph Layout */}
            <div className="absolute bottom-0 left-0 w-full h-1/2 flex items-end gap-1 px-10 pb-10">
              {[...Array(20)].map((_, i) => (
                <div 
                  key={i} 
                  className="flex-1 bg-primary/20 hover:bg-primary transition-all duration-500 group-hover:bg-primary/40" 
                  style={{ height: `${Math.random() * 80 + 20}%` }}
                />
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-card p-8 space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <Database className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase tracking-widest">Хранилище</span>
              </div>
              <div className="flex justify-between items-end">
                <div className="text-2xl font-black text-white">412.8 TB</div>
                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1 text-right">82% Capacity</div>
              </div>
              <div className="w-full bg-white/5 h-1">
                <div className="bg-primary w-[82%] h-full" />
              </div>
            </div>
            <div className="glass-card p-8 space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <Server className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase tracking-widest">Узлы</span>
              </div>
              <div className="flex justify-between items-end">
                <div className="text-2xl font-black text-white">42 Active</div>
                <div className="text-[9px] font-bold text-green-500 uppercase tracking-widest mb-1 text-right">Healthy</div>
              </div>
              <div className="w-full bg-white/5 h-1">
                <div className="bg-green-500 w-full h-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Stream */}
        <div className="md:col-span-4 space-y-6">
          <div className="glass-card p-8 h-full">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white flex items-center gap-3">
                <Terminal className="w-4 h-4 text-primary" /> Live Log Stream
              </h4>
              <Zap className="w-3 h-3 text-primary" />
            </div>
            <div className="space-y-4 font-mono text-[9px] text-muted-foreground uppercase tracking-wider overflow-hidden">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="flex gap-4 border-l border-white/10 pl-4 py-1 hover:border-primary transition-colors cursor-pointer group">
                  <span className="text-primary/40 shrink-0">06:45:{i + 12}</span>
                  <span className="truncate group-hover:text-white transition-colors">TYPE:CLICKSTREAM SOURCE:APP_IOS_V4 UID:{Math.random().toString(36).substring(7)}</span>
                </div>
              ))}
              <div className="pt-4 flex justify-center">
                <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}