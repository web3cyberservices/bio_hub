'use client';

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Key, 
  Settings, 
  Activity,
  LogOut,
  Globe,
  Lock,
  Calendar,
  RefreshCw,
  Zap,
  Navigation,
  UserX,
  Users,
  RotateCcw,
  Copy,
  Terminal,
  Database
} from 'lucide-react';
import { getVpnMe, vpnLogout, getAllVpnUsers, buySubscription, regenerateVpnKey } from '@/actions/vpn-actions';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

type Tab = 'status' | 'keys' | 'nodes' | 'admin' | 'settings';

const PLANS = [
  { months: 1, price: '490 ₽', label: '1 месяц', popular: false },
  { months: 3, price: '1 290 ₽', label: '3 месяца', popular: true },
  { months: 6, price: '2 290 ₽', label: '6 месяцев', popular: false },
  { months: 12, price: '3 990 ₽', label: '12 месяцев', popular: false },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('status');
  const [vpnData, setVpnData] = useState<any>(null);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const loadData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    else setRefreshing(true);
    
    try {
      const data = await getVpnMe();
      if (!data) {
        router.push('/vpn');
        return;
      }
      
      setVpnData(data);
      
      if (data.role === 'admin') {
        const users = await getAllVpnUsers();
        setAdminUsers(Array.isArray(users) ? users : []);
        if (activeTab === 'status') setActiveTab('admin');
      }
    } catch (e) {
      console.error('[DASHBOARD] Error loading data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const isAdmin = vpnData?.role === 'admin';
  const isActive = vpnData?.isActive;

  const handleBuy = async (months: number) => {
    setPurchasing(true);
    const result = await buySubscription(months);
    if (result.success) {
      toast({ title: "Успех", description: `Подписка на ${months} мес. активна.` });
      setTimeout(() => loadData(false), 1500);
    } else {
      toast({ title: "Ошибка", description: result.error, variant: "destructive" });
    }
    setPurchasing(false);
  };

  const handleRegenerateKey = async () => {
    setRegenerating(true);
    const result = await regenerateVpnKey();
    if (result.success) {
      toast({ title: "Успех", description: "VLESS ключ успешно получен" });
      await loadData(false);
    } else {
      toast({ title: "Ошибка API", description: result.error, variant: "destructive" });
    }
    setRegenerating(false);
  };

  const copyKey = async (link: string) => {
    if (!link) {
      toast({ title: "Ошибка", description: "Ключ отсутствует", variant: "destructive" });
      return;
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(link);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = link;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      toast({ title: "Успех", description: "Ключ скопирован" });
    } catch (err) {
      toast({ title: "Ошибка", description: "Используйте долгое нажатие для копирования", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#5fad86] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        <p className="mt-6 text-[10px] font-black text-white/50 uppercase tracking-[0.5em] animate-pulse">Cyber Armor Syncing...</p>
      </div>
    );
  }
  
  const navItems = isAdmin ? [
    { id: 'admin', icon: Terminal, label: 'SYSTEM' },
    { id: 'nodes', icon: Globe, label: 'NODES' },
    { id: 'settings', icon: Settings, label: 'PROFILE' }
  ] : [
    { id: 'status', icon: Activity, label: 'STATUS' },
    { id: 'keys', icon: Key, label: 'KEYS' },
    { id: 'nodes', icon: Globe, label: 'NODES' },
    { id: 'settings', icon: Settings, label: 'PROFILE' }
  ];

  return (
    <div className="min-h-screen bg-[#5fad86] text-white selection:bg-cyan-500/30 pb-32">
      <header className="sticky top-0 z-50 bg-[#5fad86]/80 backdrop-blur-2xl border-b border-black/10 px-6 py-6">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-5">
            <div className="w-12 h-12 rounded-2xl bg-black/30 flex items-center justify-center shadow-lg border border-white/10">
              <Shield className="w-7 h-7 text-cyan-400" />
            </div>
            <div>
              <h1 className="brand-title text-2xl">
                CYBER<span className="text-cyan-400">ARMOR</span>
              </h1>
              <p className="text-[9px] text-white/40 font-black uppercase tracking-[0.5em] mt-1">
                {isAdmin ? 'Root Authority' : 'Private Access'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
             <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-2xl hover:bg-black/20 h-11 w-11"
                onClick={() => loadData(false)}
                disabled={refreshing}
             >
                <RefreshCw className={`w-5 h-5 text-white/60 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
             </Button>
             <Avatar className="w-12 h-12 rounded-2xl border border-white/20 shadow-xl">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${vpnData?.username}`} />
                <AvatarFallback className="bg-black/40">{vpnData?.username?.substring(0,2).toUpperCase()}</AvatarFallback>
             </Avatar>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6 space-y-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'admin' && isAdmin && (
              <div className="space-y-8">
                <div className="grid grid-cols-3 gap-5">
                  <div className="glass-panel p-6 rounded-[2rem]">
                    <Users className="w-5 h-5 text-cyan-400 mb-3" />
                    <p className="text-3xl font-black">{adminUsers.length}</p>
                    <p className="text-[9px] text-white/40 uppercase font-black tracking-widest">Clients</p>
                  </div>
                  <div className="glass-panel p-6 rounded-[2rem]">
                    <Activity className="w-5 h-5 text-emerald-400 mb-3" />
                    <p className="text-3xl font-black">{adminUsers.filter(u => u.hasKey).length}</p>
                    <p className="text-[9px] text-white/40 uppercase font-black tracking-widest">Active</p>
                  </div>
                  <div className="glass-panel p-6 rounded-[2rem]">
                    <Database className="w-5 h-5 text-purple-400 mb-3" />
                    <p className="text-3xl font-black">1.4T</p>
                    <p className="text-[9px] text-white/40 uppercase font-black tracking-widest">Traffic</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] px-3">Network Identities</h3>
                  {adminUsers.length > 0 ? adminUsers.map((user) => (
                    <Card key={user.id} className="glass-panel border-white/5 rounded-[2.5rem] overflow-hidden bg-transparent">
                      <CardContent className="p-8">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center space-x-4">
                            <div className={`w-3 h-3 rounded-full ${user.hasKey ? 'bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.6)]' : 'bg-red-400 shadow-[0_0_15px_rgba(248,113,113,0.4)]'}`} />
                            <p className="font-black text-white tracking-wide">{user.username}</p>
                          </div>
                          <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">{user.protocol}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-6 text-sm mb-6">
                          <div>
                            <p className="text-[9px] text-white/30 uppercase font-black tracking-tighter mb-1">Expiration</p>
                            <p className="font-bold text-white/90">{user.expireDate}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] text-white/30 uppercase font-black tracking-tighter mb-1">Load</p>
                            <p className="font-bold text-cyan-400">{user.traffic}</p>
                          </div>
                        </div>
                        <Progress value={user.usagePercent} className="h-2 bg-white/5" />
                      </CardContent>
                    </Card>
                  )) : (
                    <div className="py-24 text-center glass-panel rounded-[3rem] border-dashed border-white/10">
                      <UserX className="w-16 h-16 text-white/10 mx-auto mb-6" />
                      <p className="text-white/20 text-[11px] font-black uppercase tracking-[0.5em]">No Entities Found</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'status' && !isAdmin && (
              <div className="space-y-8">
                {isActive ? (
                  <div className="space-y-8">
                    <Card className="glass-panel border-white/5 rounded-[3.5rem] overflow-hidden bg-transparent">
                      <CardContent className="p-12 text-center">
                        <div className="mb-10 relative inline-block">
                          <div className="w-48 h-48 rounded-[3rem] border-2 border-white/10 bg-black/20 flex items-center justify-center shadow-2xl">
                            <Shield className="w-20 h-20 text-white shadow-cyan-500/50" />
                          </div>
                          <div className="absolute -top-3 -right-3 w-10 h-10 bg-cyan-400 rounded-2xl animate-pulse border-8 border-[#5fad86] flex items-center justify-center shadow-lg">
                            <Zap className="w-4 h-4 text-black" />
                          </div>
                        </div>
                        <h2 className="brand-title text-4xl mb-3 justify-center text-white">PROTECTED</h2>
                        <p className="text-white/40 text-[11px] font-black uppercase tracking-[0.5em] mb-10">Active Neural Encryption</p>
                        
                        <div className="flex flex-col space-y-3 mb-12">
                            <div className="inline-flex items-center justify-center space-x-3 text-[11px] font-black text-white/70 uppercase tracking-[0.2em] bg-white/5 py-3 px-6 rounded-2xl mx-auto">
                                <Calendar className="w-4 h-4 text-cyan-400" />
                                <span>Until {vpnData.expiresAt ? new Date(vpnData.expiresAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Indefinite'}</span>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-10 pt-12 border-t border-white/5">
                          <div className="text-left flex items-start space-x-4">
                              <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                                <Zap className="w-5 h-5 text-cyan-400" />
                              </div>
                              <div>
                                <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1">Latency</p>
                                <p className="text-lg font-black text-cyan-400">34ms</p>
                              </div>
                          </div>
                          <div className="text-right flex items-start justify-end space-x-4">
                              <div>
                                <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1">Gateway</p>
                                <p className="text-lg font-black text-white">Germany</p>
                              </div>
                              <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                                <Globe className="w-5 h-5 text-white/50" />
                              </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="space-y-5">
                        <h3 className="text-[11px] font-black text-white/40 uppercase tracking-[0.4em] px-3">Upgrade Subscription</h3>
                        <div className="grid grid-cols-2 gap-5">
                            {PLANS.map((plan) => (
                                <button
                                    key={plan.months}
                                    onClick={() => handleBuy(plan.months)}
                                    disabled={purchasing}
                                    className="glass-panel p-7 rounded-[2.5rem] hover:bg-white/5 transition-all text-left group border border-white/5 active:scale-95"
                                >
                                    <p className="text-[10px] text-white/30 uppercase font-black tracking-tighter mb-2">{plan.label}</p>
                                    <p className="text-2xl font-black text-white group-hover:text-cyan-400 transition-colors">{plan.price}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-10 text-center py-16">
                    <div className="space-y-6">
                      <div className="w-24 h-24 bg-black/20 rounded-[2.5rem] flex items-center justify-center mx-auto border-2 border-white/5 shadow-2xl">
                        <Lock className="w-12 h-12 text-white/20" />
                      </div>
                      <div className="space-y-2">
                        <h2 className="brand-title text-3xl justify-center text-white">RESTRICTED</h2>
                        <p className="text-white/30 text-[11px] font-black uppercase tracking-[0.4em] max-w-[280px] mx-auto leading-loose">Initialize encrypted tunnel to bypass global filters</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      {PLANS.map((plan) => (
                        <button
                          key={plan.months}
                          onClick={() => handleBuy(plan.months)}
                          disabled={purchasing}
                          className={`relative p-8 rounded-[2.5rem] border transition-all text-left group active:scale-95 ${plan.popular ? 'bg-white/10 border-white/20 shadow-2xl' : 'glass-panel border-white/5'}`}
                        >
                          {plan.popular && <span className="absolute -top-3 left-8 bg-cyan-400 text-black text-[9px] font-black uppercase px-3 py-1 rounded-full shadow-lg">Optimal</span>}
                          <p className="text-white/30 text-[10px] font-black uppercase tracking-tighter mb-2">{plan.label}</p>
                          <p className="text-2xl font-black text-white group-hover:text-cyan-400 transition-colors">{plan.price}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'keys' && !isAdmin && (
              <div className="space-y-8">
                {(isActive && vpnData?.vpn?.links?.length > 0) ? (
                  <Card className="glass-panel rounded-[3.5rem] overflow-hidden bg-transparent">
                    <CardContent className="p-12 text-center space-y-10">
                      <div className="inline-block p-8 bg-white rounded-[3rem] shadow-[0_0_60px_rgba(0,0,0,0.5)]">
                        <QRCodeSVG value={vpnData?.vpn?.links[0]} size={220} />
                      </div>
                      <div className="space-y-6">
                        <p className="text-[11px] text-white/40 font-black uppercase tracking-[0.4em]">Personal Node Config</p>
                        <div className="p-6 bg-black/40 border border-white/5 rounded-3xl break-all font-mono text-[11px] text-white/60 text-left leading-relaxed shadow-inner">
                          {vpnData?.vpn?.links[0]}
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          <Button 
                            onClick={() => copyKey(vpnData?.vpn?.links[0])} 
                            className="w-full bg-white text-black hover:bg-white/90 h-18 rounded-3xl font-black shadow-2xl text-base tracking-widest uppercase transition-all active:scale-95"
                          >
                            <Copy className="w-6 h-6 mr-3" /> Copy Access Key
                          </Button>
                          <Button 
                            onClick={handleRegenerateKey}
                            disabled={regenerating}
                            variant="outline"
                            className="w-full border-white/10 bg-black/20 h-16 rounded-3xl text-white font-black tracking-widest uppercase active:scale-95"
                          >
                            {regenerating ? <RefreshCw className="w-5 h-5 mr-3 animate-spin text-cyan-400" /> : <RotateCcw className="w-5 h-5 mr-3" />}
                            Reset Identity
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="py-24 text-center space-y-8">
                    <div className="w-24 h-24 bg-black/20 rounded-[2.5rem] flex items-center justify-center mx-auto border-2 border-white/5">
                      <Key className="w-12 h-12 text-white/10" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-white/30 text-xs font-black uppercase tracking-[0.4em] max-w-[240px] mx-auto leading-loose">
                        {!isActive 
                          ? "Credentials available after sub initialization" 
                          : "Identity sync failure. Retry authorization."}
                      </p>
                    </div>
                    {!isActive ? (
                      <Button onClick={() => setActiveTab('status')} className="bg-white text-black rounded-2xl px-12 h-16 font-black uppercase tracking-widest active:scale-95">Initialize Sub</Button>
                    ) : (
                      <Button 
                        onClick={handleRegenerateKey} 
                        disabled={regenerating}
                        className="bg-white text-black rounded-2xl px-12 h-16 font-black uppercase tracking-widest active:scale-95"
                      >
                        <RefreshCw className={`w-5 h-5 mr-3 ${regenerating ? 'animate-spin' : ''}`} /> 
                        Retry Sync
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'nodes' && (
              <div className="space-y-6">
                <h3 className="text-[11px] font-black text-white/40 uppercase tracking-[0.4em] px-3 mb-6">Available Gateways</h3>
                {[
                  { name: 'FRK-01 Germany', ping: '38ms', load: '12%', active: true },
                  { name: 'AMS-04 Netherlands', ping: '42ms', load: '24%', active: false },
                  { name: 'IST-02 Turkey', ping: '61ms', load: '45%', active: false }
                ].map((node) => (
                  <div key={node.name} className={`p-7 rounded-[2.5rem] border transition-all active:scale-[0.98] ${node.active ? 'bg-white/10 border-white/20 shadow-xl' : 'glass-panel border-white/5 opacity-80'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-5">
                         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${node.active ? 'bg-white text-black border-white' : 'bg-white/5 text-white/30 border-white/5'}`}>
                            <Globe className="w-7 h-7" />
                         </div>
                         <div>
                            <p className="font-black text-base text-white tracking-wide">{node.name}</p>
                            <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Ping: {node.ping} • Load: {node.load}</p>
                         </div>
                      </div>
                      {node.active && <div className="w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.8)]" />}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-8">
                <div className="glass-panel p-10 rounded-[3rem] space-y-10">
                  <div className="flex items-center space-x-6 p-6 bg-white/5 rounded-3xl border border-white/5">
                    <Avatar className="w-20 h-20 rounded-[1.5rem] border-2 border-white/20 shadow-2xl">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${vpnData?.username}`} />
                    </Avatar>
                    <div>
                      <p className="text-xl font-black text-white tracking-tight">{vpnData?.username}</p>
                      <p className="text-[10px] text-cyan-400 font-black uppercase tracking-[0.3em] mt-1">
                        {isAdmin ? 'SYSTEM AUTHORITY' : isActive ? 'PREMIUM ACCESS' : 'BASE IDENTITY'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div className="p-6 bg-black/20 rounded-3xl border border-white/5">
                      <p className="text-[10px] text-white/20 uppercase font-black mb-2 tracking-widest">Version</p>
                      <p className="text-sm font-black text-white">2.9.0-FORCE</p>
                    </div>
                    <div className="p-6 bg-black/20 rounded-3xl border border-white/5">
                      <p className="text-[10px] text-white/20 uppercase font-black mb-2 tracking-widest">Protocol</p>
                      <p className="text-sm font-black text-cyan-400">REALITY v2</p>
                    </div>
                  </div>
                  
                  <Button 
                    variant="destructive" 
                    className="w-full h-18 rounded-3xl bg-red-500/10 text-red-100 border border-red-500/20 hover:bg-red-500/20 font-black uppercase tracking-[0.3em] active:scale-95"
                    onClick={async () => { await vpnLogout(); router.push('/vpn'); }}
                  >
                    <LogOut className="w-5 h-5 mr-3" /> Terminate Session
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 p-6 flex justify-center">
        <div className="bg-black/80 backdrop-blur-3xl border border-white/10 rounded-[2.8rem] flex justify-between items-center px-6 py-3 shadow-[0_30px_60px_rgba(0,0,0,0.5)] w-full max-w-md">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`flex flex-col items-center justify-center p-4 rounded-[1.8rem] transition-all relative ${activeTab === item.id ? 'text-cyan-400 bg-white/5' : 'text-white/30 hover:text-white/60'}`}
            >
              <item.icon className={`w-6 h-6 transition-transform ${activeTab === item.id ? 'scale-110' : ''}`} />
              <span className={`text-[9px] font-black uppercase tracking-tighter mt-1.5 ${activeTab === item.id ? 'block' : 'hidden'}`}>{item.label}</span>
              {activeTab === item.id && <motion.div layoutId="nav-active" className="absolute -bottom-1 w-1 h-1 bg-cyan-400 rounded-full" />}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
