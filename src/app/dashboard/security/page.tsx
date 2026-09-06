'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Activity, 
  Settings, 
  Terminal, 
  Globe, 
  Zap, 
  Cpu,
  Database,
  Scan,
  Loader2,
  Download,
  Eye,
  Network,
  Lock,
  FileText,
  Copy,
  Check,
  Trash2
} from 'lucide-react';
import { 
  runSecurityAction, 
  getScanHistory, 
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
  const [scanResultData, setScanResultData] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  const [copying, setCopying] = useState(false);
  
  const pollingIntervals = useRef<Record<string, NodeJS.Timeout>>({});

  const checkHealth = useCallback(async () => {
    try {
      const start = Date.now();
      const res = await fetch('/api/worker?endpoint=/health');
      if (res.ok) {
        setEngineStatus({ online: true, latency: `${Date.now() - start}ms` });
      } else {
        setEngineStatus({ online: false, latency: 'N/A' });
      }
    } catch (err) {
      setEngineStatus({ online: false, latency: 'N/A' });
    }
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const h = await getScanHistory();
      setHistory(h || []);
      
      h?.forEach((scan: any) => {
        const status = scan.status?.toLowerCase();
        if (status === 'in_progress' || status === 'running' || status === 'scan started') {
          if (!pollingIntervals.current[scan.id]) {
            startPolling(scan.id);
          }
        }
      });
    } catch (err) {
      console.error('Failed to load history');
    }
  }, []);

  const fetchReportContent = async (scan: any) => {
    // Используем путь отчета из объекта сканирования
    const reportPath = scan.reportPath || scan.report_path;
    
    if (!reportPath) {
      setScanResultData(null);
      return;
    }
    
    try {
      setScanResultData(null);
      // Запрашиваем содержимое файла через наш универсальный прокси
      const res = await fetch(`/api/worker?endpoint=${encodeURIComponent(reportPath)}`);
      if (res.ok) {
        const text = await res.text();
        try {
          // Пытаемся распарсить NDJSON (Nuclei) или обычный JSON
          if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
            const lines = text.trim().split('\n');
            if (lines.length > 1) {
              const objects = lines.map(line => JSON.parse(line));
              setScanResultData(JSON.stringify(objects, null, 2));
            } else {
              const json = JSON.parse(text);
              setScanResultData(JSON.stringify(json, null, 2));
            }
          } else {
            setScanResultData(text);
          }
        } catch (e) {
          setScanResultData(text);
        }
      } else {
        setScanResultData('Report data not yet available on worker storage.');
      }
    } catch (e) {
      setScanResultData('Critical error fetching report content.');
    }
  };

  useEffect(() => {
    if (selectedScan) {
      if (selectedScan.status?.toLowerCase() === 'completed') {
        fetchReportContent(selectedScan);
      } else {
        setScanResultData(null);
      }
    }
  }, [selectedScan]);

  const startPolling = (scanId: string) => {
    if (pollingIntervals.current[scanId]) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/worker?endpoint=/api/status/${scanId}`);
        if (res.ok) {
          const data = await res.json();
          const currentStatus = data.status?.toLowerCase();
          
          if (currentStatus === 'completed' || currentStatus === 'failed') {
            clearInterval(interval);
            delete pollingIntervals.current[scanId];
            loadHistory();
            if (selectedScan?.id === scanId) {
              setSelectedScan((prev: any) => ({ ...prev, ...data }));
            }
          }
        }
      } catch (e) {
        console.error(`Polling error for ${scanId}:`, e);
      }
    }, 5000);

    pollingIntervals.current[scanId] = interval;
  };

  useEffect(() => {
    checkHealth();
    loadHistory();
    const hInterval = setInterval(checkHealth, 10000);
    return () => {
      clearInterval(hInterval);
      Object.values(pollingIntervals.current).forEach(clearInterval);
    };
  }, [checkHealth, loadHistory]);

  const calculateHealthScore = () => {
    const completedScans = history.filter(s => {
      const st = s.status?.toLowerCase();
      return st === 'completed' || st === 'failed';
    });
    if (completedScans.length === 0) return 'WAITING';
    
    const failed = history.filter(s => s.status?.toLowerCase() === 'failed').length;
    const score = Math.max(0, 100 - (failed * 15));
    return Math.min(100, score);
  };

  async function handleAction(method: string) {
    if (!target) return;
    setLoading(true);
    try {
      const result = await runSecurityAction(activeTab, method, target);
      if (result.success && result.scanId) {
        await loadHistory();
        startPolling(result.scanId);
      }
    } catch (e) {
      console.error('Action failed', e);
    }
    setLoading(false);
    setShowConfirm(null);
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

  const filteredHistory = history.filter(scan => {
    if (statusFilter === 'all') return true;
    const st = scan.status?.toLowerCase();
    if (statusFilter === 'in_progress') return st === 'in_progress' || st === 'running' || st === 'scan started';
    return st === statusFilter;
  });

  const healthScore = calculateHealthScore();

  const copyToClipboard = () => {
    const textToCopy = scanResultData || selectedScan?.resultSummary || selectedScan?.result_summary || '';
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopying(true);
      setTimeout(() => setCopying(false), 2000);
    }
  };

  const downloadReport = () => {
    const textToSave = scanResultData || selectedScan?.resultSummary || selectedScan?.result_summary || '';
    if (textToSave && selectedScan) {
      const blob = new Blob([textToSave], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const fileName = `report_${selectedScan.method}_${selectedScan.target.replace(/[^a-z0-9]/gi, '_')}.json`;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/10 pb-8">
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tighter uppercase flex items-center gap-3 text-white">
              <ShieldAlert className="text-blue-500" /> Security Operations Center
            </h1>
            <p className="technical-label">ENGINE API v2.5.1 • Proxy Secure Bridge</p>
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
            <div className="p-8 border border-white/10 bg-white/[0.02]">
              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                    {activeTab === 'osint' ? 'Target Username / Domain' : 'Network Target (IP/FQDN)'}
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
                          <span className="text-[9px] font-black text-white uppercase mb-4 tracking-widest">Confirm Execution?</span>
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

            <div className="border border-white/10 bg-black">
              <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Live Task Queue</h3>
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
                      <th className="px-6 py-4 border-b border-white/5">Tool</th>
                      <th className="px-6 py-4 border-b border-white/5">Target</th>
                      <th className="px-6 py-4 border-b border-white/5">Status</th>
                      <th className="px-6 py-4 border-b border-white/5 text-right">Delete</th>
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
                            (scan.status?.toLowerCase() === 'in_progress' || scan.status?.toLowerCase() === 'running' || scan.status?.toLowerCase() === 'scan started') ? "text-orange-500" : scan.status?.toLowerCase() === 'completed' ? "text-green-500" : "text-red-500"
                          )}>
                            {(scan.status?.toLowerCase() === 'in_progress' || scan.status?.toLowerCase() === 'running' || scan.status?.toLowerCase() === 'scan started') && <Loader2 className="w-3 h-3 animate-spin" />}
                            {scan.status}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right" onClick={e => e.stopPropagation()}>
                          <button onClick={() => deleteSecurityAction(scan.id)} className="text-white/10 hover:text-red-500 p-1">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-8">
            <div className="bg-[#0A0C14] border border-white/10 p-10">
              <div className="space-y-8">
                <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-500" /> SYSTEM HEALTH
                </h4>
                <div className="flex items-end gap-4">
                  <span className={clsx(
                    "text-6xl font-black tracking-tighter",
                    healthScore === 'WAITING' ? 'text-blue-500/40 text-4xl' : 'text-white'
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
                <p className="text-[8px] text-muted-foreground font-black uppercase tracking-widest">
                  {typeof healthScore === 'number' ? 'DYNAMIC INFRASTRUCTURE SCORE' : 'PENDING TELEMETRY DATA'}
                </p>
              </div>
            </div>
            
            <div className="p-8 border border-white/10 bg-black flex flex-col h-[600px]">
              <div className="flex justify-between items-center mb-8">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">
                  {selectedScan ? 'DATA ANALYSIS' : 'ENGINE LOGS'}
                </h4>
                {selectedScan && (selectedScan.status?.toLowerCase() === 'completed') && (
                  <div className="flex gap-2">
                    <button 
                      onClick={copyToClipboard}
                      className="p-1.5 bg-white/5 border border-white/10 hover:bg-blue-500/20 rounded-sm"
                      title="Copy"
                    >
                      {copying ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-blue-500" />}
                    </button>
                    <button 
                      onClick={downloadReport}
                      className="p-1.5 bg-white/5 border border-white/10 hover:bg-green-500/20 rounded-sm"
                      title="Download"
                    >
                      <Download className="w-3 h-3 text-green-500" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto space-y-6 scrollbar-hide text-[10px]">
                {selectedScan ? (
                  <div className="space-y-6 animate-in fade-in">
                    <div className="bg-white/5 p-4 border border-white/5 space-y-2">
                      <div className="flex justify-between"><span className="text-white/40 uppercase">Task ID:</span> <span>{selectedScan.id}</span></div>
                      <div className="flex justify-between"><span className="text-white/40 uppercase">Tool:</span> <span className="text-blue-500 font-black">{selectedScan.method?.toUpperCase()}</span></div>
                      <div className="flex justify-between"><span className="text-white/40 uppercase">Status:</span> <span className="uppercase font-black text-green-500">{selectedScan.status}</span></div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-blue-500 font-black uppercase tracking-widest text-[9px]">Raw Payload Data</div>
                      <div className="bg-black border border-white/10 p-4 text-white/70 leading-relaxed whitespace-pre-wrap font-mono text-[9px] min-h-[100px] max-h-[400px] overflow-y-auto scrollbar-hide">
                        {scanResultData || selectedScan.resultSummary || selectedScan.result_summary || 'Synchronizing with remote buffer...'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground italic text-center py-20 uppercase tracking-widest opacity-20">
                    Select a task to view telemetry
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
