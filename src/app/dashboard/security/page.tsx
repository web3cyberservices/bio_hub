
'use client';

import { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Activity, 
  Settings, 
  Terminal, 
  Globe, 
  Zap, 
  AlertCircle, 
  CheckCircle2, 
  FileJson,
  Cpu,
  RefreshCw,
  Database,
  Square,
  Trash2,
  Loader2
} from 'lucide-react';
import { 
  runSecurityAction, 
  getScanHistory, 
  getEngineStatus,
  stopSecurityAction,
  deleteSecurityAction
} from '@/lib/actions/security';

export default function SecurityDashboard() {
  const [activeTab, setActiveTab] = useState<'pentest' | 'osint' | 'siem' | 'config'>('pentest');
  const [target, setTarget] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [engineStatus, setEngineStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    const [h, s] = await Promise.all([getScanHistory(), getEngineStatus()]);
    setHistory(h);
    setEngineStatus(s);
  }

  async function handleAction(type: 'pentest' | 'osint', method: string) {
    if (!target) return;
    setLoading(true);
    const result = await runSecurityAction(type, method, target);
    setLoading(false);
    if (result.success) {
      loadData();
    }
  }

  async function handleStop(id: string) {
    setActionLoading(id);
    await stopSecurityAction(id);
    await loadData();
    setActionLoading(null);
  }

  async function handleDelete(id: string) {
    setActionLoading(id);
    await deleteSecurityAction(id);
    await loadData();
    setActionLoading(null);
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono selection:bg-blue-500/30">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/10 pb-8">
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tighter uppercase flex items-center gap-3">
              <ShieldAlert className="text-blue-500" /> Security Operations Center
            </h1>
            <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">Интерфейс управления ядром ИБ v2.4</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1.5 border ${engineStatus?.online ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'} rounded-sm`}>
              <div className={`w-2 h-2 rounded-full ${engineStatus?.online ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className={`text-[9px] font-black uppercase tracking-widest ${engineStatus?.online ? 'text-green-500' : 'text-red-500'}`}>
                Engine: {engineStatus?.online ? 'Online' : 'Offline'} ({engineStatus?.latency || 'N/A'})
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/5 gap-8 overflow-x-auto">
          {[
            { id: 'pentest', label: 'ПЕНТЕСТ & УЯЗВИМОСТИ', icon: <Terminal className="w-4 h-4" /> },
            { id: 'osint', label: 'OSINT & РАЗВЕДКА', icon: <Search className="w-4 h-4" /> },
            { id: 'siem', label: 'МОНИТОРИНГ & SIEM', icon: <Activity className="w-4 h-4" /> },
            { id: 'config', label: 'КОНФИГУРАЦИЯ ЯДРА', icon: <Settings className="w-4 h-4" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-4 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all relative ${
                activeTab === tab.id ? 'text-blue-500' : 'text-muted-foreground hover:text-white'
              }`}
            >
              {tab.icon} {tab.label}
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500" />}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Console Area */}
          <div className="lg:col-span-8 space-y-8">
            
            {activeTab === 'pentest' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="p-8 border border-white/10 bg-white/[0.02]">
                  <div className="bg-black border border-white/10 p-4 mb-8 text-[11px] text-white/80 font-mono">
                    {target || 'Target domain not specified'}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button 
                      onClick={() => handleAction('pentest', 'nuclei')}
                      disabled={loading || !target}
                      className="p-6 border border-white/10 bg-[#050505] hover:bg-white/5 transition-all text-left group disabled:opacity-50"
                    >
                      <Zap className="w-6 h-6 text-blue-500 mb-4" />
                      <div className="text-[11px] font-black uppercase tracking-widest text-white">NUCLEI AUDIT</div>
                      <div className="text-[8px] text-muted-foreground mt-1 uppercase">Быстрый аудит шаблонов</div>
                    </button>
                    <button 
                      onClick={() => handleAction('pentest', 'full-recon')}
                      disabled={loading || !target}
                      className="p-6 border border-white/10 bg-[#050505] hover:bg-white/5 transition-all text-left group disabled:opacity-50"
                    >
                      <Globe className="w-6 h-6 text-blue-500 mb-4" />
                      <div className="text-[11px] font-black uppercase tracking-widest text-white">DEEP RECON</div>
                      <div className="text-[8px] text-muted-foreground mt-1 uppercase">Subfinder + Naabu + Httpx</div>
                    </button>
                    <button 
                      onClick={() => handleAction('pentest', 'fuzzing')}
                      disabled={loading || !target}
                      className="p-6 border border-white/10 bg-[#050505] hover:bg-white/5 transition-all text-left group disabled:opacity-50"
                    >
                      <Cpu className="w-6 h-6 text-blue-500 mb-4" />
                      <div className="text-[11px] font-black uppercase tracking-widest text-white">SQLi / FUZZ</div>
                      <div className="text-[8px] text-muted-foreground mt-1 uppercase">SQLMap + Ffuf payload</div>
                    </button>
                  </div>

                  <div className="mt-8 space-y-2">
                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Цель сканирования</label>
                    <input 
                      value={target}
                      onChange={(e) => setTarget(e.target.value)}
                      placeholder="example.com"
                      className="w-full bg-white/5 border border-white/10 p-4 text-[11px] outline-none focus:border-blue-500 transition-all font-mono text-white"
                    />
                  </div>
                </div>

                <div className="border border-white/10 bg-[#050505]">
                  <div className="p-4 border-b border-white/10 flex justify-between items-center">
                    <h3 className="text-[10px] font-black uppercase tracking-widest">СТАТУС ЗАДАЧ</h3>
                    <RefreshCw className={`w-3.5 h-3.5 text-blue-500 cursor-pointer ${loading ? 'animate-spin' : ''}`} onClick={loadData} />
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[9px] font-mono border-collapse">
                      <thead>
                        <tr className="bg-white/[0.02] text-muted-foreground">
                          <th className="px-6 py-4 font-black uppercase border-b border-white/5">МЕТОД / ID</th>
                          <th className="px-6 py-4 font-black uppercase border-b border-white/5">TARGET</th>
                          <th className="px-6 py-4 font-black uppercase border-b border-white/5 text-center">STATUS</th>
                          <th className="px-6 py-4 font-black uppercase border-b border-white/5 text-right">УПРАВЛЕНИЕ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {history.map((scan: any) => (
                          <tr key={scan.id} className="hover:bg-white/[0.01]">
                            <td className="px-6 py-5">
                              <span className="text-blue-500 uppercase font-black">{scan.method}</span>
                              <div className="text-[7px] text-white/20 mt-1">{scan.id.slice(0, 8)}</div>
                            </td>
                            <td className="px-6 py-5 text-white/40">{scan.target}</td>
                            <td className="px-6 py-5">
                              <div className="flex items-center justify-center gap-2">
                                {scan.status === 'in_progress' ? (
                                  <div className="flex items-center gap-1.5 text-orange-500">
                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" /> Running
                                  </div>
                                ) : scan.status === 'completed' ? (
                                  <div className="flex items-center gap-1.5 text-green-500">
                                    <CheckCircle2 className="w-3 h-3" /> Done
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5 text-red-500">
                                    <AlertCircle className="w-3.5 h-3.5" /> FAILED
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-5 text-right">
                              <div className="flex items-center justify-end gap-3">
                                {scan.status === 'in_progress' && (
                                  <button 
                                    onClick={() => handleStop(scan.id)}
                                    disabled={actionLoading === scan.id}
                                    className="p-2 border border-orange-500/20 hover:bg-orange-500/10 text-orange-500 transition-colors rounded-sm"
                                    title="Stop Scan"
                                  >
                                    {actionLoading === scan.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Square className="w-3 h-3 fill-current" />}
                                  </button>
                                )}
                                <button 
                                  onClick={() => handleDelete(scan.id)}
                                  disabled={actionLoading === scan.id}
                                  className="p-2 border border-red-500/20 hover:bg-red-500/10 text-red-500 transition-colors rounded-sm"
                                  title="Delete Record"
                                >
                                  {actionLoading === scan.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                </button>
                                {scan.status === 'completed' && (
                                  <button className="p-2 border border-blue-500/20 hover:bg-blue-500/10 text-blue-500 transition-colors rounded-sm">
                                    <FileJson className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {history.length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-6 py-10 text-center text-white/20 uppercase tracking-widest text-[8px]">
                              История сканирований пуста
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Other tabs components... */}
            {activeTab === 'osint' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="p-8 border border-white/10 bg-white/[0.02]">
                  <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-4 block">Объект разведки</label>
                  <input 
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="company_name / domain"
                    className="w-full bg-white/5 border border-white/10 p-4 text-[11px] outline-none focus:border-blue-500 transition-all font-mono text-white"
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                    <button onClick={() => handleAction('osint', 'spiderfoot')} className="p-6 border border-white/10 bg-[#050505] hover:bg-white/5 transition-all text-left group">
                      <Database className="w-6 h-6 text-blue-500 mb-4" />
                      <div className="text-[11px] font-black uppercase tracking-widest text-white">SPIDERFOOT</div>
                    </button>
                    <button onClick={() => handleAction('osint', 'sherlock')} className="p-6 border border-white/10 bg-[#050505] hover:bg-white/5 transition-all text-left group">
                      <Search className="w-6 h-6 text-purple-500 mb-4" />
                      <div className="text-[11px] font-black uppercase tracking-widest text-white">SHERLOCK</div>
                    </button>
                    <button onClick={() => handleAction('osint', 'harvester')} className="p-6 border border-white/10 bg-[#050505] hover:bg-white/5 transition-all text-left group">
                      <Globe className="w-6 h-6 text-green-500 mb-4" />
                      <div className="text-[11px] font-black uppercase tracking-widest text-white">HARVESTER</div>
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Sidebar / Insights */}
          <aside className="lg:col-span-4 space-y-8">
            <div className="bg-[#0A0C14] border border-white/10 p-10 space-y-8">
              <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">SECURITY HEALTH SCORE</h4>
              <div className="flex items-end gap-4">
                <span className="text-7xl font-black text-white leading-none">84</span>
                <span className="text-muted-foreground text-xl font-black mb-1">/ 100</span>
              </div>
              <p className="text-[10px] text-muted-foreground font-bold tracking-widest leading-relaxed border-t border-white/10 pt-6">
                Система стабильна. Обнаружены некритичные аномалии. Рекомендуется плановый аудит Nuclei.
              </p>
            </div>
            
            <div className="p-8 border border-white/10 bg-[#050505] space-y-8">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-white">LIVE LOGS FLOW</h4>
              <div className="space-y-6 font-mono">
                {history.slice(0, 3).map((scan, i) => (
                  <div key={i} className="flex flex-col gap-1 border-l-2 border-blue-500/20 pl-6 py-1">
                    <span className="text-[8px] text-blue-500 font-black">{new Date(scan.timestamp).toLocaleTimeString()}</span>
                    <span className="text-[10px] text-white/80 font-black uppercase">{scan.method} TASK {scan.status}</span>
                    <span className="text-[7px] text-white/20 uppercase tracking-widest">Target: {scan.target}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
