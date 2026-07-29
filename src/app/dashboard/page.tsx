
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
  Layout
} from 'lucide-react';
import { useState, useEffect } from 'react';

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
    }, 1000);

    return () => clearInterval(logInterval);
  }, []);

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 border border-white/5">
        {[
          { label: 'Events/sec', val: `${metrics.req.toLocaleString()}`, icon: <Activity className="w-3 h-3" /> },
          { label: 'Latency p99', val: `${metrics.latency}ms`, icon: <Zap className="w-3 h-3" /> },
          { label: 'Error Rate', val: `${metrics.errors}%`, icon: <Shield className="w-3 h-3" /> },
          { label: 'Storage', val: `${metrics.storage.toFixed(1)} TB`, icon: <Database className="w-3 h-3" /> },
        ].map((stat, i) => (
          <div key={i} className="bg-background p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-muted-foreground">{stat.icon}</span>
              <span className="technical-label">{stat.label}</span>
            </div>
            <div className="text-2xl font-mono font-bold">{stat.val}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="ui-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-bold uppercase tracking-tight flex items-center gap-2">
                <Network className="w-4 h-4 text-blue-500" /> Ingestion Throughput
              </h3>
              <div className="technical-label">Live View</div>
            </div>
            <div className="h-48 flex items-end gap-1">
              {Array.from({length: 40}).map((_, i) => (
                <div 
                  key={i} 
                  className="flex-1 bg-blue-500/20 border-t border-blue-500/40" 
                  style={{ height: `${Math.random() * 60 + 20}%` }}
                />
              ))}
            </div>
          </div>
          
          <div className="ui-card overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-tight">Active Nodes</div>
              <span className="technical-label">12 Online</span>
            </div>
            <table className="w-full text-left text-[11px]">
              <thead className="bg-white/5 text-muted-foreground uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-3">Node ID</th>
                  <th className="px-6 py-3">Region</th>
                  <th className="px-6 py-3">CPU</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {['cl-node-prd-01', 'cl-node-prd-02', 'cl-node-prd-03'].map((node) => (
                  <tr key={node} className="hover:bg-white/[0.02]">
                    <td className="px-6 py-3 text-white">{node}</td>
                    <td className="px-6 py-3">EU-West-1</td>
                    <td className="px-6 py-3">{(Math.random() * 40 + 10).toFixed(1)}%</td>
                    <td className="px-6 py-3"><span className="text-green-500">● HEALTHY</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-4 ui-card flex flex-col max-h-[600px]">
          <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
            <div className="text-xs font-bold uppercase tracking-tight flex items-center gap-2">
              <Terminal className="w-4 h-4 text-blue-500" /> Stream Console
            </div>
          </div>
          <div className="flex-1 p-4 font-mono text-[10px] space-y-1.5 overflow-y-auto bg-black/40">
            {logs.map((log) => (
              <div key={log.id} className="flex gap-2 text-muted-foreground border-l border-white/10 pl-2">
                <span className="text-white/20">{log.time}</span>
                <span className={log.type === 'ERROR' ? 'text-red-500' : 'text-blue-500'}>[{log.type}]</span>
                <span className="text-white/80">{log.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* Sidebar Navigation - Профессиональный вид */}
      <header className="border-b border-white/5 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
                <Shield className="w-3.5 h-3.5 text-black" />
              </div>
              <span className="font-bold tracking-tighter text-sm uppercase">Web3CyberServices</span>
            </Link>
            
            <nav className="hidden lg:flex items-center gap-6">
              {(['overview', 'infrastructure', 'analytics', 'security'] as View[]).map((v) => (
                <button 
                  key={v}
                  onClick={() => setActiveView(v)}
                  className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${activeView === v ? 'text-blue-500' : 'text-muted-foreground hover:text-white'}`}
                >
                  {v}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-sm">
              <Search className="w-3 h-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground font-mono">CMD + K</span>
            </div>
            <div className="w-8 h-8 rounded-sm bg-neutral-800 border border-white/10 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <button className="lg:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-muted-foreground">
            <span>Root</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">{activeView}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="technical-label text-green-500">System Nominal</span>
          </div>
        </div>

        {activeView === 'overview' && renderOverview()}
        {activeView !== 'overview' && (
          <div className="h-96 ui-card flex items-center justify-center bg-grid">
            <div className="text-center space-y-2">
              <Layout className="w-8 h-8 text-white/10 mx-auto" />
              <p className="technical-label">View Loaded: {activeView}</p>
              <p className="text-[10px] text-muted-foreground font-mono">Awaiting gRPC data stream...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
