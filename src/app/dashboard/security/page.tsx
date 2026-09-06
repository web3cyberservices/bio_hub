
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
  Trash2,
  ShieldCheck,
  AlertCircle,
  Server,
  Box,
  Fingerprint,
  Cloud,
  Layers,
  Code,
  CheckCircle2,
  AlertTriangle,
  FileJson
} from 'lucide-react';
import { 
  runSecurityAction, 
  getScanHistory, 
  deleteSecurityAction
} from '@/lib/actions/security';
import { clsx } from 'clsx';

type TabType = 'pentest' | 'osint' | 'siem' | 'enterprise' | 'config';
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
    if (scan.status?.toLowerCase() !== 'completed') {
      setScanResultData(null);
      return;
    }

    const tool = scan.method.toLowerCase();
    const target = scan.target;
    const proxyUrl = `/api/worker?endpoint=/api/results/${tool}/${target}`;
    
    try {
      setScanResultData(null);
      const res = await fetch(proxyUrl);
      if (res.ok) {
        const text = await res.text();
        try {
          if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
            const json = JSON.parse(text);
            setScanResultData(JSON.stringify(json, null, 2));
          } else {
            setScanResultData(text);
          }
        } catch (e) {
          try {
            const lines = text.trim().split('\n');
            const objects = lines.map(line => JSON.parse(line));
            setScanResultData(JSON.stringify(objects, null, 2));
          } catch(e2) {
            setScanResultData(text);
          }
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
      fetchReportContent(selectedScan);
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
    if (completedScans.length === 0) return 'NO DATA';
    
    const failed = history.filter(s => s.status?.toLowerCase() === 'failed').length;
    const score = Math.max(0, 100 - (failed * 15));
    return Math.min(100, score);
  };

  async function handleAction(method: string) {
    if (!target && method !== 'report') return;
    setLoading(true);
    try {
      const actualTarget = method === 'report' ? 'all_assets' : target;
      const result = await runSecurityAction(activeTab, method, actualTarget);
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
      { id: 'nikto', label: 'WEB SERVER AUDIT', icon: <Server />, sub: 'Nikto Scanner', color: 'text-orange-400' },
      { id: 'wafw00f', label: 'WAF DETECTION', icon: <ShieldCheck />, sub: 'Fingerprint Firewall', color: 'text-emerald-500' },
      { id: 'testssl', label: 'SSL/TLS CHECK', icon: <Lock />, sub: 'TestSSL.sh Audit', color: 'text-cyan-500' },
      { id: 'zap', label: 'DAST ZAP SCAN', icon: <Activity />, sub: 'OWASP ZAP Core', color: 'text-red-500' },
      { id: 'sqlmap', label: 'SQLMAP INJECTION', icon: <Database />, sub: 'Auto SQLi detection', color: 'text-orange-500' }
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
    enterprise: [
      { id: 'prowler', label: 'PROWLER AUDIT', icon: <Cloud />, sub: 'AWS/GCP Compliance', color: 'text-blue-500' },
      { id: 'grype', label: 'GRYPE SBOM', icon: <Layers />, sub: 'Supply Chain Audit', color: 'text-purple-500' },
      { id: 'semgrep', label: 'SEMGREP SAST', icon: <Code />, sub: 'Static Analysis', color: 'text-green-500' },
      { id: 'netexec', label: 'NETEXEC AUDIT', icon: <Network />, sub: 'AD/Network Pentest', color: 'text-orange-500' },
      { id: 'trivy', label: 'TRIVY SCAN', icon: <Box />, sub: 'Container Security', color: 'text-cyan-500' },
      { id: 'report', label: 'GENERATE PDF', icon: <FileJson />, sub: 'Compliance Report', color: 'text-white', accent: true }
    ],
    config: [
      { id: 'trivy', label: 'CONTAINER SCAN', icon: <Box />, sub: 'Trivy FS Audit', color: 'text-blue-400' },
      { id: 'api-keys', label: 'API KEYS', icon: <Fingerprint />, sub: 'Manage tokens', color: 'text-slate-400' },
      { id: 'engine-url', label: 'ENGINE SETTINGS', icon: <Settings />, sub: 'Worker config', color: 'text-slate-400' }
    ]
  };

  const renderDetailedResult = () => {
    if (!scanResultData) return <div className="text-muted-foreground animate-pulse italic">Synchronizing with remote buffer...</div>;
    
    try {
      const data = JSON.parse(scanResultData);
      const method = selectedScan.method.toLowerCase();

      switch(method) {
        case 'prowler':
          return (
            <div className="space-y-8">
              <div className="flex items-center gap-10 p-6 border border-blue-500/20 bg-blue-500/5">
                <div className="relative w-20 h-20">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path className="text-white/10" strokeDasharray="100, 100" stroke="currentColor" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="text-blue-500" strokeDasharray={`${data.compliance_score}, 100`} stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-sm font-black">{data.compliance_score}%</div>
                </div>
                <div>
                  <div className="technical-label">Cloud Provider</div>
                  <div className="text-xl font-black text-white">{data.provider} Compliance</div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="technical-label">Check Details</div>
                {data.findings?.map((f: any, i: number) => (
                  <div key={i} className="p-3 border border-white/5 bg-white/[0.02] flex justify-between items-center text-[9px]">
                    <div className="flex items-center gap-3">
                      {f.status === 'PASS' ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <AlertTriangle className="w-3 h-3 text-red-500" />}
                      <span className="text-white font-bold">{f.rule}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-white/40 uppercase">{f.region}</span>
                      <span className={clsx(
                        "px-2 py-0.5 font-black uppercase",
                        f.severity === 'CRITICAL' ? 'text-red-500' : 'text-orange-500'
                      )}>{f.severity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );

        case 'grype':
          return (
            <div className="space-y-4">
              <div className="technical-label text-purple-500">SBOM Vulnerabilities</div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[9px] border-collapse">
                  <thead>
                    <tr className="bg-white/5 text-white/40 font-black uppercase">
                      <th className="px-4 py-2">Package</th>
                      <th className="px-4 py-2">Version</th>
                      <th className="px-4 py-2">CVE ID</th>
                      <th className="px-4 py-2 text-right">Severity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {data.vulnerabilities?.map((v: any, i: number) => (
                      <tr key={i} className="hover:bg-white/[0.02]">
                        <td className="px-4 py-3 text-white font-bold">{v.package}</td>
                        <td className="px-4 py-3 text-white/60">{v.version}</td>
                        <td className="px-4 py-3 text-blue-400 font-mono">{v.cve}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={clsx(
                            "px-2 py-0.5 font-black uppercase",
                            v.severity === 'HIGH' ? 'text-red-500' : 'text-orange-500'
                          )}>{v.severity}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );

        case 'semgrep':
          return (
            <div className="space-y-6">
              <div className="p-4 bg-green-500/5 border border-green-500/20 flex justify-between items-center">
                <div className="technical-label text-green-500">Lines Scanned</div>
                <div className="text-xl font-black">{data.lines_scanned.toLocaleString()}</div>
              </div>
              <div className="space-y-3">
                <div className="technical-label">Findings</div>
                {data.findings?.map((f: any, i: number) => (
                  <div key={i} className="p-4 border border-white/5 bg-white/[0.02] space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-black uppercase text-[10px]">{f.rule_id}</span>
                      <span className="px-2 py-0.5 bg-red-500 text-white font-black text-[8px] uppercase">{f.severity}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/40 font-mono text-[8px]">
                      <FileText className="w-3 h-3" /> {f.file} : <span className="text-blue-500">Line {f.line}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );

        case 'netexec':
          return (
            <div className="space-y-8">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 border border-white/10 bg-white/[0.02]">
                  <div className="technical-label mb-1">Protocol</div>
                  <div className="text-lg font-black">{data.protocol}</div>
                </div>
                <div className="p-4 border border-white/10 bg-white/[0.02]">
                  <div className="technical-label mb-1">Scanned</div>
                  <div className="text-lg font-black">{data.hosts_scanned}</div>
                </div>
                <div className="p-4 border border-red-500/20 bg-red-500/5">
                  <div className="technical-label text-red-500 mb-1">Pwned</div>
                  <div className="text-lg font-black text-red-500">{data.pwned_hosts}</div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="technical-label">Host Vulnerabilities</div>
                {data.vulnerabilities?.map((v: string, i: number) => (
                  <div key={i} className="p-3 border border-white/5 flex items-center gap-3 text-white/70">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <span className="font-mono">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          );

        case 'report':
          return (
            <div className="flex flex-col items-center justify-center py-20 space-y-8 animate-in zoom-in-95">
              <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-blue-500" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-black uppercase">Report Generation Complete</h3>
                <p className="technical-label">{data.pages} Pages • Standard Compliance Audit</p>
              </div>
              <button 
                onClick={() => window.open(`http://31.76.34.252:4000${data.download_url}`, '_blank')}
                className="btn-enterprise bg-blue-600 hover:bg-blue-500 py-6 px-12 text-sm shadow-2xl shadow-blue-500/20"
              >
                <Download className="w-5 h-5 mr-3" /> DOWNLOAD PDF REPORT
              </button>
            </div>
          );

        case 'wafw00f':
          return (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 border border-blue-500/20 bg-blue-500/5">
                <ShieldCheck className={clsx("w-8 h-8", data.waf_detected ? "text-green-500" : "text-slate-500")} />
                <div>
                  <div className="text-[10px] uppercase font-black tracking-widest text-white/40">Firewall Protection</div>
                  <div className="text-sm font-black text-white">{data.waf_detected ? data.firewall : "No WAF detected"}</div>
                </div>
              </div>
            </div>
          );
        
        case 'trivy':
          return (
            <div className="space-y-4">
              <div className="text-[10px] font-black uppercase text-blue-500 tracking-widest mb-4">Vulnerability List ({data.vulnerabilities?.length || 0})</div>
              {data.vulnerabilities?.map((v: any, i: number) => (
                <div key={i} className="p-3 border border-white/5 bg-white/[0.02] flex justify-between items-center">
                  <div>
                    <div className="text-[10px] font-bold text-white uppercase">{v.pkgName}</div>
                    <div className="text-[8px] text-white/40">Version: {v.installedVersion} → <span className="text-green-500">{v.fixedVersion}</span></div>
                  </div>
                  <div className={clsx(
                    "px-2 py-0.5 text-[8px] font-black uppercase",
                    v.severity === 'CRITICAL' ? 'bg-red-500 text-white' : 'bg-orange-500/20 text-orange-500 border border-orange-500/20'
                  )}>{v.severity}</div>
                </div>
              ))}
            </div>
          );

        default:
          return (
            <div className="bg-black border border-white/10 p-4 text-white/70 leading-relaxed whitespace-pre-wrap font-mono text-[9px] min-h-[100px] max-h-[400px] overflow-y-auto scrollbar-hide">
              {scanResultData}
            </div>
          );
      }
    } catch (e) {
      return (
        <div className="bg-black border border-white/10 p-4 text-white/70 leading-relaxed whitespace-pre-wrap font-mono text-[9px] min-h-[100px] max-h-[400px] overflow-y-auto scrollbar-hide">
          {scanResultData}
        </div>
      );
    }
  };

  const filteredHistory = history.filter(scan => {
    if (statusFilter === 'all') return true;
    const st = scan.status?.toLowerCase();
    if (statusFilter === 'in_progress') return st === 'in_progress' || st === 'running' || st === 'scan started';
    return st === statusFilter;
  });

  const healthScore = calculateHealthScore();

  const copyToClipboard = () => {
    if (scanResultData) {
      navigator.clipboard.writeText(scanResultData);
      setCopying(true);
      setTimeout(() => setCopying(false), 2000);
    }
  };

  const downloadReport = () => {
    if (scanResultData && selectedScan) {
      const blob = new Blob([scanResultData], { type: 'application/json' });
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
            <p className="technical-label">ENGINE API v2.8.0 • Enterprise Active</p>
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
            { id: 'enterprise', label: 'ENTERPRISE & CODE SECURITY', icon: <ShieldCheck className="w-4 h-4 text-blue-500" /> },
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
                      disabled={loading || (!target && tool.id !== 'report')}
                      className={clsx(
                        "p-6 border transition-all text-left relative group disabled:opacity-30",
                        tool.accent ? "bg-blue-600 border-blue-500 hover:bg-blue-500" : "border-white/10 bg-black hover:bg-white/[0.03]"
                      )}
                    >
                      <div className={clsx("w-6 h-6 mb-4", !tool.accent && tool.color, tool.accent && "text-white")}>{tool.icon}</div>
                      <div className={clsx("text-[11px] font-black uppercase tracking-widest", tool.accent ? "text-white" : "text-white")}>{tool.label}</div>
                      <div className={clsx("text-[8px] mt-1 uppercase", tool.accent ? "text-white/60" : "text-muted-foreground")}>{tool.sub}</div>
                      
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

            {/* Task Queue Table */}
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
                    healthScore === 'NO DATA' ? 'text-blue-500/40 text-4xl' : 'text-white'
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
                      <div className="text-blue-500 font-black uppercase tracking-widest text-[9px]">Result Visualization</div>
                      {renderDetailedResult()}
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
