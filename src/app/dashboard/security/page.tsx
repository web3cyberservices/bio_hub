
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
  Loader2,
  FileText,
  ChevronRight,
  Filter,
  Eye,
  Download,
  Info,
  Network,
  Lock,
  History
} from 'lucide-react';
import { 
  runSecurityAction, 
  getScanHistory, 
  getEngineStatus,
  stopSecurityAction,
  deleteSecurityAction
} from '@/lib/actions/security';
import { clsx } from 'clsx';

type TabType = 'pentest' | 'osint' | 'siem' | 'config';
type ScanStatus = 'all' | 'in_progress' | 'completed' | 'failed';

interface ToolDef {
  id: string;
  label: string;
  icon: React.ReactNode;
  sub: string;
  color: string;
}

export default function SecurityDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('pentest');
  const [target, setTarget] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [engineStatus, setEngineStatus] = useState<any>({ online: false, latency: 'N/A' });
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  const [statusFilter, setStatusFilter] = useState<ScanStatus>('all');
  const [selectedScan, setSelectedScan] = useState<any>(null);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    try {
      const [h, s] = await Promise.all([getScanHistory(), getEngineStatus()]);
      setHistory(h || []);
      setEngineStatus(s);
    } catch (err) {
      console.error('Dashboard refresh failed', err);
    }
  }

  const calculateHealthScore = () => {
    if (history.length === 0) return 'WAITING';
    const failed = history.filter(s => s.status === 'failed').length;
    const score = Math.max(40, 100 - (failed * 15));
    return score > 100 ? 100 : score;
  };

  async function handleAction(method: string) {
    if (!target) return;
    setLoading(true);
    const result = await runSecurityAction(activeTab, method, target);
    setLoading(false);
    setShowConfirm(null);
    if (result.success) loadData();
  }

  const tabTools: Record<TabType, ToolDef[]> = {
    pentest: [
      { id: 'nuclei', label: 'NUCLEI AUDIT', icon: <Zap />, sub: 'Vulnerability scanner', color: 'text-blue-500' },
      { id: 'full-recon', label: 'DEEP RECON', icon: <Globe />, sub: 'Subdomains & Ports', color: 'text-emerald-500' },
      { id: 'fuzzing', label: 'SQLI / FUZZ', icon: <Cpu />, sub: 'Payload injection', color: 'text-amber-500' }
    ],
    osint: [
      { id: 'spiderfoot', label: 'SPIDERFOOT', icon: <Search />, sub: 'Digital footprinting', color: 'text-purple-500' },
      { id: 'sherlock', label: 'SHERLOCK', icon: <Eye />, sub: 'Social media discovery', color: 'text-pink-500' },
      { id: 'harvester', label: 'HARVESTER', icon: <Globe />, sub: 'E-mail & Domain OSINT', color: 'text-indigo-500' }
    ],
    siem: [
      { id: 'wazuh', label: 'WAZUH AGENTS', icon: <ShieldAlert />, sub: 'HIDS Status Check', color: 'text-red-500' },
      { id: 'defectdojo', label: 'DEFECTDOJO', icon: <FileText />, sub: 'Vuln Management Sync', color: 'text-orange-500' },
      { id: 'netmon', label: 'NET MONITOR', icon: <Network />, sub: 'Live traffic analysis', color: 'text-cyan-500' }
    ],
    config: [
      { id: 'api-keys', label: 'API KEYS', icon: <Lock />, sub: 'Manage access tokens', color: 'text-slate-400' },
      { id: 'engine-url', label: 'ENGINE SETTINGS', icon: <Settings />, sub: 'Connection parameters', color: 'text-slate-400' },
      { id: 'logs-rot', label: 'LOG ROTATION', icon: <History />, sub: 'Storage & Purge rules', color: 'text-slate-400' }
    ]
  };

  const filteredHistory = history.filter(scan => 
    statusFilter === 'all' ? true : scan.status === statusFilter
  );

  const healthScore = calculateHealthScore();

  return (
    <div className="min-h-screen bg-black text-white font-mono selection:bg-blue-500/30">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/10 pb-8">
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tighter uppercase flex items-center gap-3 text-white">
              <ShieldAlert className="text-blue-500" /> Security Operations Center
            </h1>
            <p className="technical-label">Интерфейс управления ядром ИБ v2.4.0-stable</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={clsx(
              "flex items-center gap-2 px-3 py-1.5 border rounded-sm transition-all",
              engineStatus.online ? "border-green-500/20 bg-green-500/5" : "border-red-500/20 bg-red-500/5"
            )}>
              <div className={clsx(
                "w-2 h-2 rounded-full",
                engineStatus.online ? "bg-green-500 animate-pulse" : "bg-red-500"
              )} />
              <span className={clsx(
                "text-[9px] font-black uppercase tracking-widest",
                engineStatus.online ? "text-green-500" : "text-red-500"
              )}>
                ENGINE API: {engineStatus.online ? 'ONLINE' : 'OFFLINE'} ({engineStatus.latency || 'N/A'})
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex border-b border-white/5 gap-8 overflow-x-auto scrollbar-hide">
          {[
            { id: 'pentest', label: 'ПЕНТЕСТ & УЯЗВИМОСТИ', icon: <Terminal className="w-4 h-4" /> },
            { id: 'osint', label: 'OSINT & РАЗВЕДКА', icon: <Search className="w-4 h-4" /> },
            { id: 'siem', label: 'МОНИТОРИНГ & SIEM', icon: <Activity className="w-4 h-4" /> },
            { id: 'config', label: 'КОНФИГУРАЦИЯ ЯДРА', icon: <Settings className="w-4 h-4" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as TabType); setShowConfirm(null); }}
              className={clsx(
                "pb-4 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all relative whitespace-nowrap",
                activeTab === tab.id ? 'text-blue-500' : 'text-muted-foreground hover:text-white'
              )}
            >
              {tab.icon} {tab.label}
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500" />}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-8 space-y-8">
            
            {/* Dynamic Tools Grid */}
            <div className="p-8 border border-white/10 bg-white/[0.02] relative overflow-hidden">
              <div className="relative z-10 space-y-8">
                <div className="space-y-4">
                  <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block">Объект анализа (Domain / IP / Handle)</label>
                  <div className="flex gap-4">
                    <input 
                      value={target}
                      onChange={(e) => setTarget(e.target.value)}
                      placeholder={activeTab === 'osint' ? "username or domain" : "example.com"}
                      className="flex-1 bg-black border border-white/10 p-4 text-[12px] outline-none focus:border-blue-500 transition-all font-mono text-white"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {tabTools[activeTab].map(tool => (
                    <button 
                      key={tool.id}
                      onClick={() => setShowConfirm(tool.id)}
                      disabled={loading || (!target && activeTab !== 'config')}
                      className="p-6 border border-white/10 bg-black hover:bg-white/[0.03] transition-all text-left relative group/tool disabled:opacity-30"
                    >
                      <div className={clsx("w-6 h-6 mb-4", tool.color)}>
                        {tool.icon}
                      </div>
                      <div className="text-[11px] font-black uppercase tracking-widest text-white">{tool.label}</div>
                      <div className="text-[8px] text-muted-foreground mt-1 uppercase tracking-tight">{tool.sub}</div>
                      
                      {showConfirm === tool.id && (
                        <div className="absolute inset-0 bg-blue-600 flex flex-col items-center justify-center p-4 z-20 text-center animate-in fade-in zoom-in-95">
                          <span className="text-[9px] font-black text-white uppercase mb-4 tracking-widest">Запустить {tool.label}?</span>
                          <div className="flex gap-2 w-full">
                            <button 
                              className="flex-1 bg-white text-black text-[9px] font-black py-2 tracking-widest"
                              onClick={(e) => { e.stopPropagation(); handleAction(tool.id); }}
                            >RUN</button>
                            <button 
                              className="flex-1 bg-black/20 text-white text-[9px] font-black py-2 tracking-widest border border-white/20"
                              onClick={(e) => { e.stopPropagation(); setShowConfirm(null); }}
                            >X</button>
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Queue */}
            <div className="border border-white/10 bg-black overflow-hidden">
              <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Queue & History</h3>
                <div className="flex gap-2">
                  {['all', 'in_progress', 'completed', 'failed'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s as any)}
                      className={clsx(
                        "px-2 py-0.5 text-[8px] font-black uppercase tracking-widest border transition-all",
                        statusFilter === s ? "bg-white text-black border-white" : "text-muted-foreground border-white/10 hover:border-white/30"
                      )}
                    >
                      {s.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[9px] font-mono border-collapse">
                  <thead>
                    <tr className="bg-white/[0.01] text-muted-foreground uppercase">
                      <th className="px-6 py-4 border-b border-white/5">Task</th>
                      <th className="px-6 py-4 border-b border-white/5">Target</th>
                      <th className="px-6 py-4 border-b border-white/5">Status</th>
                      <th className="px-6 py-4 border-b border-white/5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredHistory.length > 0 ? filteredHistory.map((scan: any) => (
                      <tr key={scan.id} onClick={() => setSelectedScan(scan)} className="group hover:bg-white/[0.02] cursor-pointer">
                        <td className="px-6 py-5">
                          <span className="text-blue-500 uppercase font-black">{scan.method}</span>
                        </td>
                        <td className="px-6 py-5 text-white/60">{scan.target}</td>
                        <td className="px-6 py-5">
                          <div className={clsx(
                            "flex items-center gap-1.5 font-black uppercase",
                            scan.status === 'in_progress' ? "text-orange-500" : scan.status === 'completed' ? "text-green-500" : "text-red-500"
                          )}>
                            {scan.status === 'in_progress' && <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />}
                            {scan.status}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {scan.status === 'in_progress' && (
                              <button onClick={() => stopSecurityAction(scan.id)} className="p-2 border border-orange-500/20 text-orange-500 hover:bg-orange-500/10">
                                <Square className="w-3 h-3 fill-current" />
                              </button>
                            )}
                            <button onClick={() => deleteSecurityAction(scan.id)} className="p-2 border border-red-500/20 text-red-500 hover:bg-red-500/10">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={4} className="px-6 py-20 text-center text-white/10 uppercase tracking-widest">No history recorded</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-8">
            {/* Health Score */}
            <div className="bg-[#0A0C14] border border-white/10 p-10 relative overflow-hidden">
              <div className="relative z-10 space-y-8">
                <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-500" /> INFRASTRUCTURE HEALTH
                </h4>
                <div className="flex items-end gap-4">
                  <span className="text-7xl font-black text-white tracking-tighter">{healthScore}</span>
                  <div className="flex flex-col mb-1">
                    <span className="text-muted-foreground text-xl font-black">/ 100</span>
                  </div>
                </div>
                <div className="w-full bg-white/5 h-1">
                  <div 
                    className="bg-blue-500 h-full transition-all duration-1000" 
                    style={{ width: `${typeof healthScore === 'number' ? healthScore : 0}%` }} 
                  />
                </div>
              </div>
            </div>
            
            {/* Logs / Findings */}
            <div className="p-8 border border-white/10 bg-black flex flex-col h-[500px]">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white mb-8">
                {selectedScan ? 'TASK DETAILS' : 'LIVE LOGS'}
              </h4>
              <div className="flex-1 overflow-y-auto space-y-6 scrollbar-hide text-[10px]">
                {selectedScan ? (
                  <div className="space-y-6 animate-in fade-in">
                    <div className="bg-white/5 p-4 border border-white/5 space-y-2">
                      <div className="flex justify-between"><span className="text-white/40">ID:</span> <span>{selectedScan.id.slice(0, 8)}</span></div>
                      <div className="flex justify-between"><span className="text-white/40">Method:</span> <span className="text-blue-500">{selectedScan.method}</span></div>
                      <div className="flex justify-between"><span className="text-white/40">Time:</span> <span>{new Date(selectedScan.timestamp).toLocaleTimeString()}</span></div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-blue-500 font-black uppercase">Results</div>
                      <div className="bg-black border border-white/10 p-4 text-white/70 italic leading-relaxed">
                        {selectedScan.resultSummary || 'Running execution...'}
                      </div>
                    </div>
                  </div>
                ) : (
                  history.slice(0, 15).map((scan, i) => (
                    <div key={i} className="flex flex-col gap-1 border-l border-blue-500/30 pl-4 py-1">
                      <span className="text-[8px] text-blue-500">{new Date(scan.timestamp).toLocaleTimeString()}</span>
                      <span className="text-white/80 uppercase font-black">{scan.method} initiated for {scan.target}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
