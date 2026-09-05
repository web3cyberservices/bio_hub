
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
  Cpu,
  Database,
  Square,
  Trash2,
  FileText,
  ChevronRight,
  Eye,
  Network,
  Lock,
  History,
  Scan,
  Loader2
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

export default function SecurityDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('pentest');
  const [target, setTarget] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [engineStatus, setEngineStatus] = useState({ online: false, latency: 'N/A' });
  const [loading, setLoading] = useState(false);
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
    } catch (err) {}
  }

  const calculateHealthScore = () => {
    if (!history || history.length === 0) return 'WAITING';
    
    const completed = history.filter(s => s.status === 'completed');
    if (completed.length === 0 && history.some(s => s.status === 'failed')) return 0;
    if (completed.length === 0) return 'NO DATA';

    const failed = history.filter(s => s.status === 'failed').length;
    const score = Math.max(0, 100 - (failed * 15));
    return Math.min(100, score);
  };

  async function handleAction(method: string) {
    if (!target) return;
    setLoading(true);
    const result = await runSecurityAction(activeTab, method, target);
    setLoading(false);
    setShowConfirm(null);
    if (result.success) loadData();
  }

  const tabTools: Record<TabType, any[]> = {
    pentest: [
      { id: 'nuclei', label: 'NUCLEI AUDIT', icon: <Zap />, sub: 'Vuln scanner', color: 'text-blue-500' },
      { id: 'full-recon', label: 'DEEP RECON', icon: <Globe />, sub: 'Subfinder + Naabu', color: 'text-emerald-500' },
      { id: 'fuzzing', label: 'SQLI / FUZZ', icon: <Cpu />, sub: 'Ffuf payload test', color: 'text-amber-500' },
      { id: 'sqlmap', label: 'SQLMAP INJECTION', icon: <Database />, sub: 'Auto SQLi detection', color: 'text-orange-500' },
      { id: 'nmap', label: 'PORT SCAN (Nmap)', icon: <Scan />, sub: 'Full service audit', color: 'text-cyan-500' }
    ],
    osint: [
      { id: 'spiderfoot', label: 'SPIDERFOOT', icon: <Search />, sub: 'Digital footprinting', color: 'text-purple-500' },
      { id: 'sherlock', label: 'SHERLOCK', icon: <Eye />, sub: 'Social discovery', color: 'text-pink-500' },
      { id: 'harvester', label: 'HARVESTER', icon: <Globe />, sub: 'Email & Domain OSINT', color: 'text-indigo-500' }
    ],
    siem: [
      { id: 'wazuh', label: 'WAZUH AGENTS', icon: <ShieldAlert />, sub: 'HIDS Status Check', color: 'text-red-500' },
      { id: 'defectdojo', label: 'DEFECTDOJO', icon: <FileText />, sub: 'Vuln Management', color: 'text-orange-500' },
      { id: 'netmon', label: 'NET MONITOR', icon: <Network />, sub: 'Traffic analysis', color: 'text-cyan-500' }
    ],
    config: [
      { id: 'api-keys', label: 'API KEYS', icon: <Lock />, sub: 'Manage tokens', color: 'text-slate-400' },
      { id: 'engine-url', label: 'ENGINE SETTINGS', icon: <Settings />, sub: 'Worker config', color: 'text-slate-400' }
    ]
  };

  const filteredHistory = history.filter(scan => 
    statusFilter === 'all' ? true : scan.status === statusFilter
  );

  const healthScore = calculateHealthScore();

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/10 pb-8">
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tighter uppercase flex items-center gap-3 text-white">
              <ShieldAlert className="text-blue-500" /> Security Operations Center
            </h1>
            <p className="technical-label">ENGINE API v2.4.0 • Infrastructure Defense</p>
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
                ENGINE API: {engineStatus.online ? 'ONLINE' : 'OFFLINE'} ({engineStatus.latency})
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
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
            {/* Input & Dynamic Tools */}
            <div className="p-8 border border-white/10 bg-white/[0.02]">
              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                    {activeTab === 'osint' ? 'Target Identifier (Username/Domain)' : 'Network Target (IP/Domain)'}
                  </label>
                  <input 
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder={activeTab === 'osint' ? "e.g. administrator" : "example.com"}
                    className="w-full bg-black border border-white/10 p-4 text-[12px] focus:border-blue-500 outline-none font-mono text-white transition-all"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tabTools[activeTab].map(tool => (
                    <button 
                      key={tool.id}
                      onClick={() => setShowConfirm(tool.id)}
                      disabled={loading || !target}
                      className="p-6 border border-white/10 bg-black hover:bg-white/[0.03] transition-all text-left relative group disabled:opacity-30"
                    >
                      <div className={clsx("w-6 h-6 mb-4", tool.color)}>{tool.icon}</div>
                      <div className="text-[11px] font-black uppercase tracking-widest text-white">{tool.label}</div>
                      <div className="text-[8px] text-muted-foreground mt-1 uppercase">{tool.sub}</div>
                      
                      {showConfirm === tool.id && (
                        <div className="absolute inset-0 bg-blue-600 flex flex-col items-center justify-center p-4 z-20 animate-in fade-in zoom-in-95">
                          <span className="text-[9px] font-black text-white uppercase mb-4 tracking-widest">Confirm {tool.id}?</span>
                          <div className="flex gap-2 w-full">
                            <button className="flex-1 bg-white text-black text-[9px] font-black py-2" onClick={(e) => { e.stopPropagation(); handleAction(tool.id); }}>EXECUTE</button>
                            <button className="flex-1 bg-black/20 text-white text-[9px] font-black py-2 border border-white/20" onClick={(e) => { e.stopPropagation(); setShowConfirm(null); }}>CANCEL</button>
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Queue & History Table */}
            <div className="border border-white/10 bg-black">
              <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Live Queue & History</h3>
                <div className="flex gap-2">
                  {['all', 'in_progress', 'completed', 'failed'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s as any)}
                      className={clsx(
                        "px-2 py-0.5 text-[8px] font-black uppercase tracking-widest border",
                        statusFilter === s ? "bg-white text-black border-white" : "text-muted-foreground border-white/10"
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
                      <th className="px-6 py-4 border-b border-white/5">Sequence</th>
                      <th className="px-6 py-4 border-b border-white/5">Target</th>
                      <th className="px-6 py-4 border-b border-white/5">Status</th>
                      <th className="px-6 py-4 border-b border-white/5 text-right">Artifacts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredHistory.map((scan: any) => (
                      <tr 
                        key={scan.id} 
                        onClick={() => setSelectedScan(scan)} 
                        className={clsx(
                          "group hover:bg-white/[0.02] cursor-pointer transition-colors",
                          selectedScan?.id === scan.id && "bg-blue-500/[0.03]"
                        )}
                      >
                        <td className="px-6 py-5">
                          <span className="text-blue-500 uppercase font-black">{scan.method}</span>
                        </td>
                        <td className="px-6 py-5 text-white/60">{scan.target}</td>
                        <td className="px-6 py-5">
                          <div className={clsx(
                            "flex items-center gap-1.5 font-black uppercase",
                            scan.status === 'in_progress' ? "text-orange-500" : scan.status === 'completed' ? "text-green-500" : "text-red-500"
                          )}>
                            {scan.status === 'in_progress' && <Loader2 className="w-3 h-3 animate-spin" />}
                            {scan.status}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-3">
                            {scan.status === 'completed' && (
                              <a href={`/reports/${scan.id}.json`} className="text-blue-500 hover:text-white transition-colors font-black flex items-center gap-1">
                                JSON <ChevronRight className="w-3 h-3" />
                              </a>
                            )}
                            {scan.status === 'in_progress' && (
                              <button onClick={() => stopSecurityAction(scan.id)} className="text-orange-500 hover:text-red-500 p-1">
                                <Square className="w-3 h-3" />
                              </button>
                            )}
                            <button onClick={() => deleteSecurityAction(scan.id)} className="text-white/10 hover:text-red-500 p-1">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredHistory.length === 0 && (
                      <tr><td colSpan={4} className="px-6 py-20 text-center text-white/10 uppercase tracking-widest">History Buffer Empty</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-8">
            {/* Dynamic Infrastructure Health Score */}
            <div className="bg-[#0A0C14] border border-white/10 p-10">
              <div className="space-y-8">
                <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-500" /> INFRASTRUCTURE HEALTH
                </h4>
                <div className="flex items-end gap-4">
                  <span className={clsx(
                    "text-6xl font-black tracking-tighter",
                    typeof healthScore === 'number' ? 'text-white' : 'text-blue-500/40 text-4xl'
                  )}>
                    {healthScore}
                  </span>
                  {typeof healthScore === 'number' && <span className="text-muted-foreground text-xl font-black mb-1">/ 100</span>}
                </div>
                <div className="w-full bg-white/5 h-1">
                  <div 
                    className="bg-blue-500 h-full transition-all duration-1000" 
                    style={{ width: `${typeof healthScore === 'number' ? healthScore : 0}%` }} 
                  />
                </div>
                <p className="text-[8px] text-muted-foreground font-black uppercase tracking-widest leading-relaxed">
                  {typeof healthScore === 'number' 
                    ? `Based on ${history.length} recent audit sequences. Failed tests reduce score by 15pts.` 
                    : 'Awaiting primary infrastructure audit sequence...'}
                </p>
              </div>
            </div>
            
            {/* Contextual Logs Window */}
            <div className="p-8 border border-white/10 bg-black flex flex-col h-[500px]">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white mb-8">
                {selectedScan ? 'ANALYSIS DETAILS' : 'GLOBAL TELEMETRY'}
              </h4>
              <div className="flex-1 overflow-y-auto space-y-6 scrollbar-hide text-[10px]">
                {selectedScan ? (
                  <div className="space-y-6 animate-in fade-in">
                    <div className="bg-white/5 p-4 border border-white/5 space-y-2">
                      <div className="flex justify-between"><span className="text-white/40">Task ID:</span> <span>{selectedScan.id.slice(0, 12)}...</span></div>
                      <div className="flex justify-between"><span className="text-white/40">Engine:</span> <span className="text-blue-500 font-black">{selectedScan.method.toUpperCase()}</span></div>
                      <div className="flex justify-between"><span className="text-white/40">Timestamp:</span> <span>{new Date(selectedScan.timestamp).toLocaleString()}</span></div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-blue-500 font-black uppercase tracking-widest">Execution Stream</div>
                      <div className="bg-black border border-white/10 p-4 text-white/70 italic leading-relaxed whitespace-pre-wrap font-mono text-[9px]">
                        {selectedScan.resultSummary || 'Waiting for stdout buffer... Initializing scanner environment.'}
                      </div>
                    </div>
                  </div>
                ) : (
                  history.slice(0, 15).map((scan, i) => (
                    <div key={i} className="flex flex-col gap-1 border-l border-blue-500/30 pl-4 py-1">
                      <span className="text-[8px] text-blue-500">{new Date(scan.timestamp).toLocaleTimeString()}</span>
                      <span className="text-white/80 uppercase font-black">{scan.method} initiated for {scan.target}</span>
                      <span className={clsx(
                        "text-[7px] uppercase",
                        scan.status === 'completed' ? 'text-green-500' : scan.status === 'failed' ? 'text-red-500' : 'text-orange-500'
                      )}>
                        {scan.status}
                      </span>
                    </div>
                  ))
                )}
                {history.length === 0 && !selectedScan && (
                  <div className="text-white/10 uppercase tracking-widest text-center pt-20">No telemetry found</div>
                )}
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}

