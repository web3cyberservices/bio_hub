
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
  Database
} from 'lucide-react';
import { runSecurityAction, getScanHistory, getEngineStatus } from '@/lib/actions/security';

export default function SecurityDashboard() {
  const [activeTab, setActiveTab] = useState<'pentest' | 'osint' | 'siem' | 'config'>('pentest');
  const [target, setTarget] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [engineStatus, setEngineStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    const [h, s] = await Promise.all([getScanHistory(), getEngineStatus()]);
    setHistory(h);
    setEngineStatus(s);
  }

  async function handleAction(type: any, method: string) {
    if (!target) return;
    setLoading(true);
    const result = await runSecurityAction(type, method, target);
    setLoading(false);
    if (result.success) {
      loadData();
    }
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
            { id: 'pentest', label: 'Пентест & Уязвимости', icon: <Terminal className="w-4 h-4" /> },
            { id: 'osint', label: 'OSINT & Разведка', icon: <Search className="w-4 h-4" /> },
            { id: 'siem', label: 'Мониторинг & SIEM', icon: <Activity className="w-4 h-4" /> },
            { id: 'config', label: 'Конфигурация Ядра', icon: <Settings className="w-4 h-4" /> }
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
                <div className="p-6 border border-white/10 bg-white/[0.02]">
                  <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-4 block">Цель сканирования (Domain / IP)</label>
                  <div className="flex gap-4">
                    <input 
                      value={target}
                      onChange={(e) => setTarget(e.target.value)}
                      placeholder="example.com"
                      className="flex-1 bg-white/5 border border-white/10 p-4 text-[11px] outline-none focus:border-blue-500 transition-all font-mono"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                    <button 
                      onClick={() => handleAction('pentest', 'nuclei')}
                      disabled={loading || !target}
                      className="p-4 border border-white/10 bg-white/[0.03] hover:bg-blue-600 hover:text-white transition-all text-left group"
                    >
                      <Zap className="w-5 h-5 text-blue-500 group-hover:text-white mb-3" />
                      <div className="text-[10px] font-black uppercase tracking-widest">Nuclei Audit</div>
                      <div className="text-[8px] text-muted-foreground group-hover:text-white/60 mt-1 uppercase">Быстрый аудит шаблонов</div>
                    </button>
                    <button 
                      onClick={() => handleAction('pentest', 'full-recon')}
                      disabled={loading || !target}
                      className="p-4 border border-white/10 bg-white/[0.03] hover:bg-blue-600 hover:text-white transition-all text-left group"
                    >
                      <Globe className="w-5 h-5 text-blue-500 group-hover:text-white mb-3" />
                      <div className="text-[10px] font-black uppercase tracking-widest">Deep Recon</div>
                      <div className="text-[8px] text-muted-foreground group-hover:text-white/60 mt-1 uppercase">Subfinder + Naabu + Httpx</div>
                    </button>
                    <button 
                      onClick={() => handleAction('pentest', 'fuzzing')}
                      disabled={loading || !target}
                      className="p-4 border border-white/10 bg-white/[0.03] hover:bg-blue-600 hover:text-white transition-all text-left group"
                    >
                      <Cpu className="w-5 h-5 text-blue-500 group-hover:text-white mb-3" />
                      <div className="text-[10px] font-black uppercase tracking-widest">SQLi / Fuzz</div>
                      <div className="text-[8px] text-muted-foreground group-hover:text-white/60 mt-1 uppercase">SQLMap + Ffuf payload</div>
                    </button>
                  </div>
                </div>

                <div className="border border-white/10 bg-white/[0.01]">
                  <div className="p-4 border-b border-white/10 flex justify-between items-center">
                    <h3 className="text-[10px] font-black uppercase tracking-widest">Статус последних задач</h3>
                    <RefreshCw className={`w-3.5 h-3.5 text-blue-500 cursor-pointer ${loading ? 'animate-spin' : ''}`} onClick={loadData} />
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[9px] font-mono border-collapse">
                      <thead>
                        <tr className="bg-white/5 text-muted-foreground">
                          <th className="px-6 py-4 font-black uppercase">ID / Метод</th>
                          <th className="px-6 py-4 font-black uppercase">Target</th>
                          <th className="px-6 py-4 font-black uppercase">Status</th>
                          <th className="px-6 py-4 font-black uppercase">Report</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {history.filter(h => h.type === 'pentest').map(scan => (
                          <tr key={scan.id} className="hover:bg-white/[0.02]">
                            <td className="px-6 py-4">
                              <span className="text-blue-500">{scan.method.toUpperCase()}</span>
                              <div className="text-[7px] text-white/20 mt-1">{scan.id.slice(0, 8)}</div>
                            </td>
                            <td className="px-6 py-4 text-white/60">{scan.target}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
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
                                    <AlertCircle className="w-3 h-3" /> Failed
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {scan.status === 'completed' ? (
                                <button className="flex items-center gap-1.5 text-blue-500 hover:underline">
                                  <FileJson className="w-3 h-3" /> JSON
                                </button>
                              ) : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'osint' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="p-6 border border-white/10 bg-white/[0.02]">
                  <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-4 block">Объект разведки (User / Brand / Domain)</label>
                  <input 
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="company_name"
                    className="w-full bg-white/5 border border-white/10 p-4 text-[11px] outline-none focus:border-blue-500 transition-all font-mono"
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                    <button 
                      onClick={() => handleAction('osint', 'spiderfoot')}
                      className="btn-outline p-6 flex flex-col items-center gap-3 text-center"
                    >
                      <Database className="w-5 h-5 text-blue-500" />
                      <span className="text-[10px]">SpiderFoot Trail</span>
                    </button>
                    <button 
                      onClick={() => handleAction('osint', 'sherlock')}
                      className="btn-outline p-6 flex flex-col items-center gap-3 text-center"
                    >
                      <Search className="w-5 h-5 text-purple-500" />
                      <span className="text-[10px]">Sherlock Search</span>
                    </button>
                    <button 
                      onClick={() => handleAction('osint', 'harvester')}
                      className="btn-outline p-6 flex flex-col items-center gap-3 text-center"
                    >
                      <Globe className="w-5 h-5 text-green-500" />
                      <span className="text-[10px]">E-mail Discovery</span>
                    </button>
                  </div>
                </div>
                
                <div className="bg-red-500/5 border border-red-500/10 p-6 flex items-start gap-4">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest">Критические утечки</h4>
                    <p className="text-[9px] text-red-400 font-bold leading-relaxed">
                      Обнаружено 3 совпадения в дампах DarkWeb для текущего домена. Требуется немедленная ротация паролей.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'siem' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Critical', val: '2', color: 'text-red-500' },
                    { label: 'High', val: '14', color: 'text-orange-500' },
                    { label: 'Medium', val: '45', color: 'text-blue-500' },
                    { label: 'Low', val: '128', color: 'text-white/40' }
                  ].map(stat => (
                    <div key={stat.label} className="p-4 border border-white/10 bg-white/[0.02]">
                      <div className="text-[8px] font-black uppercase text-muted-foreground mb-1">{stat.label}</div>
                      <div className={`text-xl font-black ${stat.color}`}>{stat.val}</div>
                    </div>
                  ))}
                </div>
                
                <div className="p-8 border border-white/10 bg-white/[0.01] space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Статус агентов Wazuh</h3>
                    <span className="text-[9px] text-green-500 font-black">128 Online / 2 Offline</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-[98%]" />
                  </div>
                </div>

                <div className="p-8 border border-white/10 bg-white/[0.01]">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6">Интеграция DefectDojo</h3>
                  <div className="space-y-4">
                    {[
                      { id: 'DD-205', title: 'Outdated OpenSSL Version', severity: 'High', status: 'Active' },
                      { id: 'DD-208', title: 'S3 Bucket Public Access', severity: 'Critical', status: 'Verifying' }
                    ].map(ticket => (
                      <div key={ticket.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-sm hover:border-blue-500/30 transition-all">
                        <div className="flex flex-col gap-1">
                          <span className="text-[8px] text-blue-500 font-black">{ticket.id}</span>
                          <span className="text-[10px] font-bold">{ticket.title}</span>
                        </div>
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-sm border ${ticket.severity === 'Critical' ? 'border-red-500/50 text-red-500' : 'border-orange-500/50 text-orange-500'}`}>
                          {ticket.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'config' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                <div className="p-8 border border-white/10 bg-white/[0.02] space-y-6">
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-blue-500">Engine API Configuration</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Core Engine URL</label>
                      <input 
                        readOnly
                        value="http://31.76.34.252:4000"
                        className="w-full bg-white/5 border border-white/10 p-3 text-[10px] text-white/40 font-mono"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">API Access Token</label>
                      <input 
                        type="password"
                        value="••••••••••••••••••••••••••••••"
                        className="w-full bg-white/5 border border-white/10 p-3 text-[10px] text-white/40 font-mono"
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <button className="btn-enterprise w-full py-4 text-[10px]">Обновить конфигурацию</button>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Sidebar / Insights */}
          <aside className="lg:col-span-4 space-y-8">
            <div className="bg-blue-600/5 border border-blue-600/10 p-8 space-y-6">
              <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Security Health Score</h4>
              <div className="flex items-end gap-4">
                <span className="text-6xl font-black text-white">84</span>
                <span className="text-muted-foreground text-sm font-black mb-2">/ 100</span>
              </div>
              <p className="text-[9px] text-muted-foreground font-bold tracking-widest leading-relaxed">
                Состояние безопасности оценивается как "Stable". Обнаружены некритичные аномалии в сетевом потоке gRPC.
              </p>
            </div>
            
            <div className="p-8 border border-white/10 bg-white/[0.01] space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest">Live Events Flow</h4>
              <div className="space-y-4 font-mono">
                {[
                  { time: '14:22:01', event: 'Nuclei engine started', target: 'api.node-01' },
                  { time: '14:15:33', event: 'Port scan detected', target: 'tunnel-tx-25' },
                  { time: '14:02:12', event: 'User root logged in', target: 'console-v1.8' }
                ].map((ev, i) => (
                  <div key={i} className="flex flex-col gap-1 border-l-2 border-white/10 pl-4 py-1">
                    <span className="text-[7px] text-blue-500 font-black">{ev.time}</span>
                    <span className="text-[9px] text-white/60 uppercase">{ev.event}</span>
                    <span className="text-[7px] text-white/20 uppercase">Src: {ev.target}</span>
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
