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
  UserX,
  Users,
  RotateCcw,
  Copy,
  Terminal,
  Database,
  ArrowRight
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
        <div className="relative">
          <div className="w-16 h-16 border-4 border-white/10 border-t-cyan-400 rounded-full animate-spin shadow-[0_0_20px_rgba(34,211,238,0.3)]" />
        </div>
        <p className="mt-8 text-[11px] font-black text-white/40 uppercase tracking-[0.6em] animate-pulse">Initializing Identity...</p>
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
    <div className="min-h-screen bg-[#5fad86] text-white selection:bg-cyan-500/40 pb-36">
      <header className="sticky top-0 z-50 bg-[#5fad86]/90 backdrop-blur-3xl border-b border-black/10 px-6 py-8">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <div className="w-14 h-14 rounded-[1.8rem] bg-black/40 flex items-center justify-center shadow-xl border border-white/10 relative">
              <div className="absolute inset-0 bg-cyan-400/10 blur-xl rounded-full" />
              <Shield className="w-8 h-8 text-cyan-400 relative z-10" />
            </div>
            <div>
              <h1 className="brand-title text-2xl tracking-[0.3em]">
                CYBER<span className="text-cyan-400">ARMOR</span>
              </h1>
              <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.5em] mt-1.5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.6)] animate-pulse" />
                {isAdmin ? 'System Root' : 'Secure Identity'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
             <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-2xl hover:bg-black/20 h-12 w-12 group transition-all"
                onClick={() => loadData(false)}
                disabled={refreshing}
             >
                <RefreshCw className={`w-5 h-5 text-white/40 group-hover:text-cyan-400 transition-colors ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
             </Button>
             <Avatar className="w-14 h-14 rounded-2xl border-2 border-white/10 shadow-2xl overflow-hidden bg-black/40">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${vpnData?.username}`} />
                <AvatarFallback className="bg-black/60 font-black text-cyan-400">{vpnData?.username?.substring(0,2).toUpperCase()}</AvatarFallback>
             </Avatar>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6 space-y-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.4, ease: "circOut" }}
          >
            {activeTab === 'admin' && isAdmin && (
              <div className="space-y-10">
                <div className="grid grid-cols-3 gap-6">
                  {[
                    { icon: Users, val: adminUsers.length, label: 'IDENTITY', color: 'text-cyan-400' },
                    { icon: Activity, val: adminUsers.filter(u => u.hasKey).length, label: 'ACTIVE', color: 'text-emerald-400' },
                    { icon: Database, val: '1.4T', label: 'TRAFFIC', color: 'text-purple-400' }
                  ].map((stat, i) => (
                    <div key={i} className="glass-panel p-8 rounded-[2.5rem] relative group overflow-hidden">
                      <div className={`absolute -right-4 -top-4 w-16 h-16 bg-white/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-colors`} />
                      <stat.icon className={`w-6 h-6 ${stat.color} mb-4`} />
                      <p className="text-3xl font-black mb-1">{stat.val}</p>
                      <p className="text-[10px] text-white/30 uppercase font-black tracking-widest">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-6">
                  <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.5em] px-4">Registry Entries</h3>
                  {adminUsers.length > 0 ? adminUsers.map((user) => (
                    <Card key={user.id} className="glass-panel border-white/5 rounded-[3rem] overflow-hidden bg-transparent group hover:border-white/20 transition-all shadow-[0_15px_50px_-10px_rgba(0,0,0,0.5)]">
                      <CardContent className="p-10">
                        <div className="flex items-center justify-between mb-8">
                          <div className="flex items-center space-x-5">
                            <div className={`w-4 h-4 rounded-full ${user.hasKey ? 'bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)] animate-pulse' : 'bg-red-400/50 shadow-[0_0_15px_rgba(248,113,113,0.2)]'}`} />
                            <p className="font-black text-xl text-white tracking-tight">{user.username}</p>
                          </div>
                          <span className="text-[10px] text-white/20 font-black uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/5">{user.protocol}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-10 text-sm mb-8">
                          <div>
                            <p className="text-[10px] text-white/20 uppercase font-black tracking-widest mb-2">Expiry Registry</p>
                            <p className="font-bold text-white/90 text-base">{user.expireDate}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-white/20 uppercase font-black tracking-widest mb-2">Network Load</p>
                            <p className="font-bold text-cyan-400 text-base">{user.traffic}</p>
                          </div>
                        </div>
                        <Progress value={user.usagePercent} className="h-2.5 bg-black/40 rounded-full overflow-hidden shadow-inner" />
                      </CardContent>
                    </Card>
                  )) : (
                    <div className="py-28 text-center glass-panel rounded-[4rem] border-dashed border-white/10">
                      <UserX className="w-20 h-20 text-white/10 mx-auto mb-8" />
                      <p className="text-white/20 text-xs font-black uppercase tracking-[0.6em]">Void: No Identities</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'status' && !isAdmin && (
              <div className="space-y-10">
                {isActive ? (
                  <div className="space-y-12">
                    <Card className="glass-panel border-white/10 rounded-[4rem] overflow-hidden bg-transparent shadow-[0_50px_120px_-30px_rgba(0,0,0,0.9)]">
                      <CardContent className="p-16 text-center">
                        <div className="mb-12 relative inline-block">
                          <div className="absolute inset-0 bg-cyan-400/20 blur-[60px] rounded-full scale-150" />
                          <div className="w-56 h-56 rounded-[4rem] border-2 border-white/10 bg-black/40 flex items-center justify-center relative z-10 neon-glow shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]">
                            <Shield className="w-24 h-24 text-white drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]" />
                          </div>
                          <div className="absolute -top-4 -right-4 w-14 h-14 bg-cyan-400 rounded-3xl animate-bounce border-8 border-[#0d1612] flex items-center justify-center shadow-[0_10px_30px_rgba(34,211,238,0.4)]">
                            <Zap className="w-6 h-6 text-black" />
                          </div>
                        </div>
                        <h2 className="brand-title text-4xl mb-4 justify-center text-white tracking-[0.4em]">PROTECTED</h2>
                        <p className="text-white/30 text-[12px] font-black uppercase tracking-[0.6em] mb-12">Encrypted Neural Tunnel Active</p>
                        
                        <div className="inline-flex items-center justify-center space-x-4 text-[12px] font-black text-white/80 uppercase tracking-[0.3em] bg-white/5 py-4 px-8 rounded-3xl mx-auto border border-white/5 shadow-inner mb-16">
                            <Calendar className="w-5 h-5 text-cyan-400" />
                            <span>Expires: {vpnData.expiresAt ? new Date(vpnData.expiresAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Indefinite'}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-12 pt-16 border-t border-white/5">
                          <div className="text-left flex items-start space-x-5">
                              <div className="p-4 bg-white/5 rounded-[1.5rem] border border-white/5 shadow-xl">
                                <Zap className="w-6 h-6 text-cyan-400" />
                              </div>
                              <div>
                                <p className="text-[11px] text-white/20 uppercase font-black tracking-widest mb-1.5">Latency</p>
                                <p className="text-xl font-black text-cyan-400">34ms</p>
                              </div>
                          </div>
                          <div className="text-right flex items-start justify-end space-x-5">
                              <div>
                                <p className="text-[11px] text-white/20 uppercase font-black tracking-widest mb-1.5">Gateway</p>
                                <p className="text-xl font-black text-white">Frankfurt</p>
                              </div>
                              <div className="p-4 bg-white/5 rounded-[1.5rem] border border-white/5 shadow-xl">
                                <Globe className="w-6 h-6 text-white/30" />
                              </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.5em] px-4">Access Expansion</h3>
                        <div className="grid grid-cols-2 gap-6">
                            {PLANS.map((plan) => (
                                <button
                                    key={plan.months}
                                    onClick={() => handleBuy(plan.months)}
                                    disabled={purchasing}
                                    className="glass-panel p-9 rounded-[3rem] hover:bg-white/5 transition-all text-left group border border-white/5 active:scale-95 shadow-xl"
                                >
                                    <p className="text-[11px] text-white/20 uppercase font-black tracking-widest mb-3">{plan.label}</p>
                                    <div className="flex items-center justify-between">
                                      <p className="text-2xl font-black text-white group-hover:text-cyan-400 transition-colors">{plan.price}</p>
                                      <ArrowRight className="w-5 h-5 text-white/0 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-12 text-center py-20">
                    <div className="space-y-8 relative">
                      <div className="absolute inset-0 bg-white/5 blur-[80px] rounded-full scale-150" />
                      <div className="w-32 h-32 bg-black/40 rounded-[3.5rem] flex items-center justify-center mx-auto border-2 border-white/5 shadow-2xl relative z-10">
                        <Lock className="w-16 h-16 text-white/10" />
                      </div>
                      <div className="space-y-4">
                        <h2 className="brand-title text-4xl justify-center text-white tracking-[0.4em]">RESTRICTED</h2>
                        <p className="text-white/30 text-[12px] font-black uppercase tracking-[0.5em] max-w-[320px] mx-auto leading-loose">Initialization Required: Establish encrypted connection protocol</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      {PLANS.map((plan) => (
                        <button
                          key={plan.months}
                          onClick={() => handleBuy(plan.months)}
                          disabled={purchasing}
                          className={`relative p-10 rounded-[3rem] border transition-all text-left group active:scale-95 shadow-2xl ${plan.popular ? 'bg-white/10 border-white/20 shadow-cyan-400/5' : 'glass-panel border-white/5'}`}
                        >
                          {plan.popular && <span className="absolute -top-4 left-10 bg-cyan-400 text-black text-[10px] font-black uppercase px-5 py-1.5 rounded-full shadow-[0_10px_20px_rgba(34,211,238,0.3)] border-4 border-[#0d1612]">Optimal</span>}
                          <p className="text-white/20 text-[11px] font-black uppercase tracking-widest mb-3">{plan.label}</p>
                          <p className="text-3xl font-black text-white group-hover:text-cyan-400 transition-colors">{plan.price}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'keys' && !isAdmin && (
              <div className="space-y-10">
                {(isActive && vpnData?.vpn?.links?.length > 0) ? (
                  <Card className="glass-panel rounded-[4rem] overflow-hidden bg-transparent shadow-[0_50px_120px_-30px_rgba(0,0,0,0.9)]">
                    <CardContent className="p-16 text-center space-y-12">
                      <div className="inline-block p-10 bg-white rounded-[3.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] relative group">
                        <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full scale-125 group-hover:scale-150 transition-transform" />
                        <div className="relative z-10">
                          <QRCodeSVG value={vpnData?.vpn?.links[0]} size={240} level="H" includeMargin={false} />
                        </div>
                      </div>
                      <div className="space-y-8">
                        <p className="text-[12px] text-white/30 font-black uppercase tracking-[0.6em]">Neural Access Token</p>
                        <div className="p-8 bg-black/60 border border-white/5 rounded-[2rem] break-all font-mono text-[12px] text-white/40 text-left leading-relaxed shadow-inner group relative hover:border-white/10 transition-colors">
                          {vpnData?.vpn?.links[0]}
                          <div className="absolute inset-0 bg-cyan-400/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem]" />
                        </div>
                        <div className="grid grid-cols-1 gap-6 pt-4">
                          <Button 
                            onClick={() => copyKey(vpnData?.vpn?.links[0])} 
                            className="w-full bg-white text-black hover:bg-white/90 h-20 rounded-[2rem] font-black shadow-[0_20px_50px_rgba(255,255,255,0.15)] text-lg tracking-[0.2em] uppercase transition-all active:scale-95 cyber-button"
                          >
                            <Copy className="w-7 h-7 mr-4" /> Copy Protocol
                          </Button>
                          <Button 
                            onClick={handleRegenerateKey}
                            disabled={regenerating}
                            variant="outline"
                            className="w-full border-white/10 bg-black/40 h-18 rounded-[2rem] text-white/60 font-black tracking-[0.3em] uppercase active:scale-95 hover:bg-black/60 hover:text-white"
                          >
                            {regenerating ? <RefreshCw className="w-6 h-6 mr-4 animate-spin text-cyan-400" /> : <RotateCcw className="w-6 h-6 mr-4" />}
                            Sync Identity
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="py-28 text-center space-y-10">
                    <div className="w-32 h-32 bg-black/40 rounded-[3.5rem] flex items-center justify-center mx-auto border-2 border-white/5 shadow-2xl relative">
                       <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full" />
                       <Key className="w-16 h-16 text-white/10 relative z-10" />
                    </div>
                    <div className="space-y-4">
                      <p className="text-white/20 text-sm font-black uppercase tracking-[0.6em] max-w-[280px] mx-auto leading-loose">
                        {!isActive 
                          ? "Registry Empty: Activate subscription for keys" 
                          : "Handshake Failed: Identity sync required"}
                      </p>
                    </div>
                    {!isActive ? (
                      <Button onClick={() => setActiveTab('status')} className="bg-white text-black rounded-[2rem] px-16 h-20 font-black uppercase tracking-[0.3em] active:scale-95 shadow-2xl cyber-button">Initialize Protocol</Button>
                    ) : (
                      <Button 
                        onClick={handleRegenerateKey} 
                        disabled={regenerating}
                        className="bg-white text-black rounded-[2rem] px-16 h-20 font-black uppercase tracking-[0.3em] active:scale-95 shadow-2xl cyber-button"
                      >
                        <RefreshCw className={`w-6 h-6 mr-4 ${regenerating ? 'animate-spin' : ''}`} /> 
                        Manual Override
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'nodes' && (
              <div className="space-y-8">
                <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.5em] px-4 mb-4">Neural Gateways</h3>
                {[
                  { name: 'FRK-01 Germany', ping: '38ms', load: '12%', active: true },
                  { name: 'AMS-04 Netherlands', ping: '42ms', load: '24%', active: false },
                  { name: 'IST-02 Turkey', ping: '61ms', load: '45%', active: false }
                ].map((node) => (
                  <div key={node.name} className={`p-10 rounded-[3rem] border transition-all active:scale-[0.98] shadow-2xl ${node.active ? 'bg-white/10 border-white/20 shadow-cyan-400/5' : 'glass-panel border-white/5 opacity-80'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-7">
                         <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center border shadow-xl ${node.active ? 'bg-white text-black border-white' : 'bg-white/5 text-white/20 border-white/5'}`}>
                            <Globe className="w-8 h-8" />
                         </div>
                         <div>
                            <p className="font-black text-xl text-white tracking-tight mb-1">{node.name}</p>
                            <p className="text-[11px] text-white/30 font-black uppercase tracking-widest flex items-center gap-3">
                              <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> {node.ping}</span>
                              <span className="w-1 h-1 bg-white/10 rounded-full" />
                              <span>{node.load} Load</span>
                            </p>
                         </div>
                      </div>
                      {node.active && <div className="w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.8)] animate-pulse" />}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-10">
                <div className="glass-panel p-12 rounded-[4rem] space-y-12 shadow-[0_50px_120px_-30px_rgba(0,0,0,0.9)]">
                  <div className="flex items-center space-x-8 p-8 bg-black/40 rounded-[2.5rem] border border-white/10 shadow-inner">
                    <Avatar className="w-24 h-24 rounded-[2rem] border-2 border-white/20 shadow-2xl relative">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${vpnData?.username}`} />
                    </Avatar>
                    <div className="space-y-2">
                      <p className="text-2xl font-black text-white tracking-tight">{vpnData?.username}</p>
                      <p className="text-[11px] text-cyan-400 font-black uppercase tracking-[0.4em] flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                        {isAdmin ? 'System Override' : isActive ? 'Premium Identity' : 'Basic Registry'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-8 bg-black/40 rounded-[2rem] border border-white/5 shadow-inner">
                      <p className="text-[11px] text-white/20 uppercase font-black mb-3 tracking-widest">Protocol</p>
                      <p className="text-base font-black text-white">XRAY REALITY v2</p>
                    </div>
                    <div className="p-8 bg-black/40 rounded-[2rem] border border-white/5 shadow-inner">
                      <p className="text-[11px] text-white/20 uppercase font-black mb-3 tracking-widest">Build</p>
                      <p className="text-base font-black text-cyan-400">2026.4-FORCE</p>
                    </div>
                  </div>
                  
                  <Button 
                    variant="destructive" 
                    className="w-full h-20 rounded-[2rem] bg-red-500/5 text-red-100 border border-red-500/20 hover:bg-red-500/10 font-black uppercase tracking-[0.4em] active:scale-95 transition-all shadow-xl"
                    onClick={async () => { await vpnLogout(); router.push('/vpn'); }}
                  >
                    <LogOut className="w-6 h-6 mr-4" /> Terminate Session
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 p-8 flex justify-center">
        <div className="bg-black/90 backdrop-blur-[40px] border border-white/10 rounded-[3.5rem] flex justify-between items-center px-8 py-4 shadow-[0_40px_100px_rgba(0,0,0,0.8)] w-full max-w-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-white/5 opacity-10 pointer-events-none" />
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`flex flex-col items-center justify-center p-5 rounded-[2.5rem] transition-all relative group ${activeTab === item.id ? 'text-cyan-400 bg-white/5 shadow-inner' : 'text-white/20 hover:text-white/50'}`}
            >
              <item.icon className={`w-7 h-7 transition-all ${activeTab === item.id ? 'scale-110 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]' : 'group-hover:scale-105'}`} />
              <span className={`text-[10px] font-black uppercase tracking-tighter mt-2 ${activeTab === item.id ? 'block' : 'hidden'}`}>{item.label}</span>
              {activeTab === item.id && <motion.div layoutId="nav-active" className="absolute -bottom-1 w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]" />}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
