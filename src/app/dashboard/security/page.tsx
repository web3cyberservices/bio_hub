
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
  Info
} from 'lucide-react';
import { 
  runSecurityAction, 
  getScanHistory, 
  getEngineStatus,
  stopSecurityAction,
  deleteSecurityAction
} from '@/lib/actions/security';
import { clsx } from 'clsx';

type ScanStatus = 'all' | 'in_progress' | 'completed' | 'failed';

export default function SecurityDashboard() {
  const [activeTab, setActiveTab] = useState<'pentest' | 'osint' | 'siem' | 'config'>('pentest');
  const [target, setTarget] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [engineStatus, setEngineStatus] = useState<any>({ online: false, latency: 'N/A' });
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // UX State
  const [statusFilter, setStatusFilter] = useState<ScanStatus>('all');
  const [selectedScan, setSelectedScan] = useState<any>(null);
  const [showConfig, setShowConfig] = useState<string | null>(null);

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
      console.error('Failed to load dashboard data', err);
    }
  }

  // Динамический расчет оценки безопасности
  const calculateHealthScore = () => {
    if (history.length === 0) return 'N/A';
    const completed = history.filter(s => s.status === 'completed').length;
    const failed = history.filter(s => s.status === 'failed').length;
    if (completed === 0 && failed === 0) return 'WAITING';
    
    // Базовая логика: 100 - (10 за каждый провал), минимум 40 если есть успешные
    const score = Math.max(40, 100 - (failed * 15));
    return score > 100 ? 100 : score;
  };

  async function handleAction(type: 'pentest' | 'osint', method: string) {
    if (!target) return;
    setLoading(true);
    const result = await runSecurityAction(type, method, target);
    setLoading(false);
    setShowConfig(null);
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
    if (!confirm('Удалить запись о сканировании?')) return;
    setActionLoading(id);
    await deleteSecurityAction(id);
    await loadData();
    setActionLoading(null);
    if (selectedScan?.id === id) setSelectedScan(null);
  }

  const filteredHistory = history.filter(scan => 
    statusFilter === 'all' ? true : scan.status === statusFilter
  );

  const healthScore = calculateHealthScore();

  return (
    <div className="min-h-screen bg-black text-white font-mono selection:bg-blue-500/30">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
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

        {/* Tab Navigation */}
        <div className="flex border-b border-white/5 gap-8 overflow-x-auto scrollbar-hide">
          {[
            { id: 'pentest', label: 'ПЕНТЕСТ & УЯЗВИМОСТИ', icon: <Terminal className="w-4 h-4" /> },
            { id: 'osint', label: 'OSINT & РАЗВЕДКА', icon: <Search className="w-4 h-4" /> },
            { id: 'siem', label: 'МОНИТОРИНГ & SIEM', icon: <Activity className="w-4 h-4" /> },
            { id: 'config', label: 'КОНФИГУРАЦИЯ ЯДРА', icon: <Settings className="w-4 h-4" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
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
          
          {/* Main Console Area */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Tool Launch Selection */}
            <div className="p-8 border border-white/10 bg-white/[0.02] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <ShieldAlert className="w-32 h-32" />
              </div>

              <div className="relative z-10 space-y-8">
                <div className="space-y-4">
                  <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block">Объект анализа (Domain / IP)</label>
                  <div className="flex gap-4">
                    <input 
                      value={target}
                      onChange={(e) => setTarget(e.target.value)}
                      placeholder="example.com"
                      className="flex-1 bg-black border border-white/10 p-4 text-[12px] outline-none focus:border-blue-500 transition-all font-mono text-white placeholder:text-white/10"
                    />
                    <button className="btn-outline px-6" onClick={() => setTarget('')}>CLEAR</button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { id: 'nuclei', label: 'NUCLEI AUDIT', icon: <Zap />, sub: 'Template-based vulnerability scan', color: 'text-blue-500' },
                    { id: 'full-recon', label: 'DEEP RECON', icon: <Globe />, sub: 'Subfinder + Naabu + Httpx', color: 'text-emerald-500' },
                    { id: 'fuzzing', label: 'SQLI / FUZZ', icon: <Cpu />, sub: 'Advanced payload injection', color: 'text-amber-500' }
                  ].map(tool => (
                    <button 
                      key={tool.id}
                      onClick={() => setShowConfig(tool.id)}
                      disabled={loading || !target}
                      className="p-6 border border-white/10 bg-black hover:bg-white/[0.03] transition-all text-left relative group/tool disabled:opacity-30"
                    >
                      <div className={clsx("w-6 h-6 mb-4 transition-transform group-hover/tool:-translate-y-1", tool.color)}>
                        {tool.icon}
                      </div>
                      <div className="text-[11px] font-black uppercase tracking-widest text-white">{tool.label}</div>
                      <div className="text-[8px] text-muted-foreground mt-1 uppercase tracking-tight">{tool.sub}</div>
                      
                      {showConfig === tool.id && (
                        <div className="absolute inset-0 bg-blue-600 flex flex-col items-center justify-center p-4 z-20 text-center animate-in fade-in zoom-in-95">
                          <span className="text-[9px] font-black text-white uppercase mb-4 tracking-widest leading-tight">Подтвердить запуск {tool.label}?</span>
                          <div className="flex gap-2 w-full">
                            <button 
                              className="flex-1 bg-white text-black text-[9px] font-black py-2 tracking-widest"
                              onClick={(e) => { e.stopPropagation(); handleAction('pentest', tool.id); }}
                            >RUN</button>
                            <button 
                              className="flex-1 bg-black/20 text-white text-[9px] font-black py-2 tracking-widest border border-white/20"
                              onClick={(e) => { e.stopPropagation(); setShowConfig(null); }}
                            >CANCEL</button>
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Task Management Queue */}
            <div className="border border-white/10 bg-black">
              <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                <div className="flex items-center gap-6">
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
                <button 
                  onClick={loadData}
                  className="p-2 hover:bg-white/5 transition-colors group"
                >
                  <RefreshCw className={clsx("w-3.5 h-3.5 text-blue-500", loading && "animate-spin")} />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[9px] font-mono border-collapse">
                  <thead>
                    <tr className="bg-white/[0.01] text-muted-foreground">
                      <th className="px-6 py-4 font-black uppercase border-b border-white/5">Task / ID</th>
                      <th className="px-6 py-4 font-black uppercase border-b border-white/5">Target</th>
                      <th className="px-6 py-4 font-black uppercase border-b border-white/5">Status</th>
                      <th className="px-6 py-4 font-black uppercase border-b border-white/5">Report</th>
                      <th className="px-6 py-4 font-black uppercase border-b border-white/5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredHistory.length > 0 ? filteredHistory.map((scan: any) => (
                      <tr 
                        key={scan.id} 
                        onClick={() => setSelectedScan(scan)}
                        className={clsx(
                          "group hover:bg-white/[0.02] cursor-pointer transition-colors",
                          selectedScan?.id === scan.id && "bg-blue-500/[0.03] border-l-2 border-l-blue-500"
                        )}
                      >
                        <td className="px-6 py-5">
                          <span className="text-blue-500 uppercase font-black">{scan.method}</span>
                          <div className="text-[7px] text-white/20 mt-1">{scan.id.slice(0, 8)}</div>
                        </td>
                        <td className="px-6 py-5 text-white/60">{scan.target}</td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            {scan.status === 'in_progress' ? (
                              <div className="flex items-center gap-1.5 text-orange-500 font-black">
                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" /> RUNNING
                              </div>
                            ) : scan.status === 'completed' ? (
                              <div className="flex items-center gap-1.5 text-green-500 font-black">
                                <CheckCircle2 className="w-3 h-3" /> COMPLETED
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-red-500 font-black">
                                <AlertCircle className="w-3.5 h-3.5" /> FAILED
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          {scan.status === 'completed' ? (
                            <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                              <a 
                                href={`http://31.76.34.252:4000/reports/${scan.id}.json`} 
                                target="_blank"
                                className="flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 text-white/60 hover:text-blue-500 hover:border-blue-500/30 transition-all rounded-sm"
                              >
                                <FileJson className="w-3 h-3" /> JSON
                              </a>
                              <a 
                                href={`http://31.76.34.252:4000/reports/${scan.id}.txt`} 
                                target="_blank"
                                className="flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 text-white/60 hover:text-emerald-500 hover:border-emerald-500/30 transition-all rounded-sm"
                              >
                                <FileText className="w-3 h-3" /> TXT
                              </a>
                            </div>
                          ) : (
                            <span className="text-white/10 italic text-[8px]">Available on completion</span>
                          )}
                        </td>
                        <td className="px-6 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-3 opacity-20 group-hover:opacity-100 transition-opacity">
                            {scan.status === 'in_progress' && (
                              <button 
                                onClick={() => handleStop(scan.id)}
                                disabled={actionLoading === scan.id}
                                className="p-2 border border-orange-500/20 hover:bg-orange-500/10 text-orange-500 transition-colors rounded-sm"
                              >
                                {actionLoading === scan.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Square className="w-3 h-3 fill-current" />}
                              </button>
                            )}
                            <button 
                              onClick={() => handleDelete(scan.id)}
                              disabled={actionLoading === scan.id}
                              className="p-2 border border-red-500/20 hover:bg-red-500/10 text-red-500 transition-colors rounded-sm"
                            >
                              {actionLoading === scan.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-20 text-center">
                          <div className="flex flex-col items-center gap-4 opacity-20">
                            <Database className="w-10 h-10" />
                            <div className="text-[10px] font-black uppercase tracking-[0.3em]">История пуста</div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar Analytics & Live Logs */}
          <aside className="lg:col-span-4 space-y-8">
            {/* Health Score */}
            <div className="bg-[#0A0C14] border border-white/10 p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-full h-full bg-blue-500/[0.02] -skew-x-12 translate-x-1/2" />
              <div className="relative z-10 space-y-8">
                <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-500" /> INFRASTRUCTURE HEALTH
                </h4>
                <div className="flex items-end gap-4">
                  <span className="text-7xl font-black text-white leading-none tracking-tighter">{healthScore}</span>
                  <div className="flex flex-col mb-1">
                    <span className={clsx("text-[10px] font-black", typeof healthScore === 'number' && healthScore > 70 ? "text-blue-500" : "text-amber-500")}>
                      {typeof healthScore === 'number' ? (healthScore > 70 ? 'NORMAL' : 'RISKY') : 'N/A'}
                    </span>
                    <span className="text-muted-foreground text-xl font-black">/ 100</span>
                  </div>
                </div>
                <div className="pt-6 border-t border-white/10 space-y-4">
                  <div className="flex justify-between text-[9px] font-black">
                    <span className="text-white/40 uppercase tracking-widest">Active Alerts</span>
                    <span className="text-amber-500">
                      {history.filter(s => s.status === 'failed').length} ALERT(S)
                    </span>
                  </div>
                  <div className="w-full bg-white/5 h-1">
                    <div 
                      className="bg-blue-500 h-full transition-all duration-1000" 
                      style={{ width: `${typeof healthScore === 'number' ? healthScore : 0}%` }} 
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Dynamic Findings / Logs */}
            <div className="p-8 border border-white/10 bg-black flex flex-col h-[500px]">
              <div className="flex items-center justify-between mb-8">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">
                  {selectedScan ? 'TASK FINDINGS' : 'LIVE LOGS FLOW'}
                </h4>
                {selectedScan && (
                  <button 
                    onClick={() => setSelectedScan(null)}
                    className="text-[8px] font-black text-blue-500 hover:underline uppercase"
                  >
                    Clear selection
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto space-y-6 scrollbar-hide font-mono">
                {selectedScan ? (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
                    <div className="p-4 bg-white/[0.02] border border-white/5 space-y-3">
                      <div className="text-[9px] text-blue-500 font-black uppercase">Execution Details</div>
                      <div className="text-[10px] space-y-2">
                        <div className="flex justify-between"><span className="text-white/40">Method:</span> <span className="text-white">{selectedScan.method}</span></div>
                        <div className="flex justify-between"><span className="text-white/40">Target:</span> <span className="text-white truncate max-w-[150px]">{selectedScan.target}</span></div>
                        <div className="flex justify-between"><span className="text-white/40">Started:</span> <span className="text-white">{new Date(selectedScan.timestamp).toLocaleTimeString()}</span></div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="text-[9px] text-blue-500 font-black uppercase">Result Summary</div>
                      <div className="bg-black border border-white/5 p-4 text-[10px] leading-relaxed text-white/70 italic max-h-[200px] overflow-y-auto">
                        {selectedScan.resultSummary || 'Загрузка результатов...'}
                      </div>
                    </div>

                    <a 
                      href={`http://31.76.34.252:4000/reports/${selectedScan.id}.json`}
                      target="_blank"
                      className="w-full btn-enterprise py-3 flex items-center justify-center gap-2"
                    >
                      <Download className="w-3.5 h-3.5" /> DOWNLOAD FULL REPORT
                    </a>
                  </div>
                ) : (
                  history.slice(0, 10).map((scan, i) => (
                    <div key={i} className="flex flex-col gap-1 border-l border-blue-500/30 pl-6 py-1 relative">
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-[8px] text-blue-500 font-black">{new Date(scan.timestamp).toLocaleTimeString()}</span>
                      <span className="text-[10px] text-white/80 font-black uppercase tracking-tight">{scan.method} EXECUTION {scan.status}</span>
                      <span className="text-[7px] text-white/20 uppercase tracking-widest truncate">{scan.target}</span>
                    </div>
                  ))
                )}
                {!selectedScan && history.length === 0 && (
                  <div className="text-center py-20 text-white/10 uppercase text-[9px] tracking-widest font-black">
                    No active processes
                  </div>
                )}
              </div>
            </div>

            {/* Support / Quick Help */}
            <div className="p-6 border border-blue-500/20 bg-blue-500/[0.03] flex items-start gap-4">
              <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Security Tip</span>
                <p className="text-[9px] text-muted-foreground leading-relaxed font-bold tracking-wide uppercase">
                  Используйте "Deep Recon" для обнаружения Shadow IT активов перед запуском Nuclei аудита.
                </p>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
