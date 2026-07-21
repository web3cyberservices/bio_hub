'use client';

import React, { useState, useEffect } from 'react';
import { 
  Key, 
  Settings, 
  Activity,
  LogOut,
  Globe,
  Lock,
  RefreshCw,
  Zap,
  RotateCcw,
  Copy,
  Terminal,
  Database,
  ArrowRight,
  ShieldCheck,
  Cpu,
  User
} from 'lucide-react';
import { getVpnMe, vpnLogout, getAllVpnUsers, buySubscription, regenerateVpnKey } from '@/actions/vpn-actions';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';

type Tab = 'status' | 'keys' | 'nodes' | 'admin' | 'settings';

const PLANS = [
  { months: 1, price: '490 ₽', label: '1 МЕСЯЦ', popular: false },
  { months: 3, price: '1 290 ₽', label: '3 МЕСЯЦА', popular: true },
  { months: 6, price: '2 290 ₽', label: '6 МЕСЯЦЕВ', popular: false },
  { months: 12, price: '3 990 ₽', label: '12 МЕСЯЦЕВ', popular: false },
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
      console.error('[DASHBOARD] Load error:', e);
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
      toast({ title: "УСПЕХ", description: `Подписка на ${months} мес. активна.` });
      setTimeout(() => loadData(false), 1000);
    } else {
      toast({ title: "ОШИБКА", description: result.error, variant: "destructive" });
    }
    setPurchasing(false);
  };

  const handleRegenerateKey = async () => {
    setRegenerating(true);
    const result = await regenerateVpnKey();
    if (result.success) {
      toast({ title: "ОБНОВЛЕНО", description: "VLESS ключ успешно получен" });
      await loadData(false);
    } else {
      toast({ title: "ОШИБКА API", description: result.error, variant: "destructive" });
    }
    setRegenerating(false);
  };

  const copyKey = async (link: string) => {
    if (!link) return;
    try {
      if (navigator.clipboard) await navigator.clipboard.writeText(link);
      else {
        const el = document.createElement('textarea');
        el.value = link;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
      toast({ title: "СКОПИРОВАНО", description: "Ключ в буфере обмена" });
    } catch (e) {
      toast({ title: "ОШИБКА", description: "Не удалось скопировать", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#5fad86] flex flex-col items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-4 border-black/10 border-t-black rounded-full"
        />
      </div>
    );
  }
  
  const navItems = isAdmin ? [
    { id: 'admin', icon: Terminal, label: 'СИСТЕМА' },
    { id: 'nodes', icon: Globe, label: 'УЗЛЫ' },
    { id: 'settings', icon: Settings, label: 'ПРОФИЛЬ' }
  ] : [
    { id: 'status', icon: Activity, label: 'СТАТУС' },
    { id: 'keys', icon: Key, label: 'КЛЮЧИ' },
    { id: 'nodes', icon: Globe, label: 'УЗЛЫ' },
    { id: 'settings', icon: Settings, label: 'ПРОФИЛЬ' }
  ];

  const getSubDates = () => {
    if (!vpnData?.expiresAt) return null;
    const end = new Date(vpnData.expiresAt);
    const start = vpnData.lastPurchaseAt ? new Date(vpnData.lastPurchaseAt) : new Date(new Date().setMonth(end.getMonth() - 1));
    return {
      start: start.toLocaleDateString('ru-RU'),
      end: end.toLocaleDateString('ru-RU')
    };
  };

  const dates = getSubDates();

  return (
    <div className="h-screen bg-[#5fad86] text-white flex flex-col overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-black/5 blur-[120px] rounded-full" />
      </div>

      <header className="flex-none px-6 py-4 relative z-20">
        <div className="max-w-md mx-auto">
          <div className="glass-panel px-5 py-3 rounded-full flex justify-between items-center shadow-2xl border-white/10">
            <div className="flex items-center space-x-3">
              <div className="relative w-7 h-7 neon-glow-green">
                <Image src="/fonts/logo512x512.png" alt="Logo" fill className="object-contain" />
              </div>
              <h1 className="brand-title text-[9px] tracking-[0.4em]">CYBER<span className="text-[#5fad86]">ARMOR</span></h1>
            </div>
            <div className="flex items-center space-x-3">
               <Button variant="ghost" size="icon" onClick={() => loadData(false)} disabled={refreshing} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/5">
                  <RefreshCw className={`w-3.5 h-3.5 text-white/60 ${refreshing ? 'animate-spin' : ''}`} />
               </Button>
               <Avatar className="w-8 h-8 rounded-full border border-white/20 bg-black shadow-lg">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${vpnData?.username}`} />
                  <AvatarFallback className="text-[8px]">{vpnData?.username?.substring(0,2).toUpperCase()}</AvatarFallback>
               </Avatar>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-6 overflow-hidden relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
            className="h-full"
          >
            {activeTab === 'admin' && isAdmin && (
              <div className="space-y-4 h-full overflow-y-auto pb-24 custom-scrollbar">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { val: adminUsers.length, label: 'ЮЗЕРЫ', icon: User },
                    { val: adminUsers.filter(u => u.hasKey).length, label: 'КЛЮЧИ', icon: ShieldCheck },
                    { val: '1.4T', label: 'ТРАФИК', icon: Database }
                  ].map((stat: any, i) => (
                    <div key={i} className="glass-panel p-3 rounded-2xl text-center premium-card">
                      <stat.icon className="w-3 h-3 mx-auto mb-1 text-[#5fad86]/40" />
                      <p className="text-xs font-black text-white">{stat.val}</p>
                      <p className="text-[6px] text-white/20 uppercase font-black tracking-widest">{stat.label}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {adminUsers.map((user) => (
                    <div key={user.id} className="glass-panel p-4 rounded-2xl border-white/5 flex items-center justify-between group">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${user.hasKey ? 'bg-[#5fad86] shadow-[0_0_8px_#5fad86]' : 'bg-white/10'}`} />
                          <div>
                            <p className="font-black text-[10px] text-white uppercase">{user.username}</p>
                            <p className="text-[6px] text-white/20 font-black uppercase tracking-widest">{user.protocol}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[7px] text-white/40 font-black">{user.expireDate}</p>
                        </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'status' && !isAdmin && (
              <div className="space-y-6 h-full overflow-y-auto pb-24 custom-scrollbar pt-2">
                {isActive ? (
                  <>
                    <Card className="glass-panel border-white/10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group premium-card">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#5fad86]/10 to-transparent opacity-30" />
                      <CardContent className="p-8 text-center relative z-10">
                        <div className="mb-6 relative inline-block">
                          <motion.div 
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="w-20 h-20 flex items-center justify-center neon-glow-green"
                          >
                            <div className="relative w-16 h-16">
                              <Image src="/fonts/logo512x512.png" alt="Logo" fill className="object-contain" />
                            </div>
                          </motion.div>
                        </div>
                        <h2 className="brand-title text-[10px] mb-2 justify-center text-white tracking-[0.4em]">ПОДПИСКА АКТИВИРОВАНА</h2>
                        <p className="text-[#5fad86] text-[8px] font-black uppercase tracking-[0.2em] mb-6 bg-[#5fad86]/10 inline-block px-3 py-1 rounded-full border border-[#5fad86]/20">
                          {dates ? `период: ${dates.start} — ${dates.end}` : 'ТЕРМИНАЛ АКТИВЕН'}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/5">
                          <div className="text-left space-y-1">
                              <p className="text-[7px] text-white/20 uppercase font-black tracking-widest">Задержка</p>
                              <div className="flex items-center gap-2">
                                <Zap className="w-3 h-3 text-[#5fad86]" />
                                <p className="text-xs font-black text-white">28 MS</p>
                              </div>
                          </div>
                          <div className="text-right space-y-1">
                              <p className="text-[7px] text-white/20 uppercase font-black tracking-widest">Шлюз</p>
                              <div className="flex items-center justify-end gap-2">
                                <p className="text-xs font-black text-white">FINLAND</p>
                                <Globe className="w-3 h-3 text-[#5fad86]/40" />
                              </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="space-y-4">
                        <h3 className="text-[9px] font-black text-[#1a3327] uppercase tracking-[0.5em] text-center">ПРОДЛИТЬ ПОДПИСКУ</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {PLANS.map((plan) => (
                                <button
                                    key={plan.months}
                                    onClick={() => handleBuy(plan.months)}
                                    disabled={purchasing}
                                    className="glass-panel p-5 rounded-3xl hover:bg-white/5 transition-all text-left group active:scale-95 border border-white/5 premium-card"
                                >
                                    <p className="text-[7px] text-white/20 uppercase font-black mb-1">{plan.label}</p>
                                    <div className="flex items-center justify-between">
                                      <p className="text-xs font-black text-white">{plan.price}</p>
                                      <ArrowRight className="w-3 h-3 text-[#5fad86] opacity-0 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-8 text-center py-8">
                    <div className="space-y-6">
                      <div className="w-24 h-24 flex items-center justify-center mx-auto grayscale opacity-40">
                         <Image src="/fonts/logo512x512.png" alt="Logo" fill className="object-contain" />
                      </div>
                      <div className="space-y-2">
                        <h2 className="brand-title text-xs justify-center text-white tracking-[0.5em]">ДОСТУП ОГРАНИЧЕН</h2>
                        <p className="text-white/20 text-[7px] font-black uppercase tracking-[0.4em]">ТРЕБУЕТСЯ АКТИВАЦИЯ ПОДПИСКИ</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {PLANS.map((plan) => (
                        <button
                          key={plan.months}
                          onClick={() => handleBuy(plan.months)}
                          disabled={purchasing}
                          className={`relative p-5 rounded-3xl border transition-all text-left group active:scale-95 ${plan.popular ? 'bg-white/10 border-[#5fad86]/20' : 'glass-panel border-white/5'}`}
                        >
                          <p className="text-white/20 text-[7px] font-black uppercase mb-1">{plan.label}</p>
                          <p className="text-xs font-black text-white">{plan.price}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'keys' && !isAdmin && (
              <div className="space-y-4 h-full overflow-y-auto pb-24 custom-scrollbar pt-2">
                {(isActive && vpnData?.vpn?.links?.length > 0) ? (
                  <Card className="glass-panel rounded-[2.5rem] shadow-2xl overflow-hidden premium-card">
                    <CardContent className="p-8 text-center space-y-6">
                      <div className="inline-block p-5 bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(255,255,255,0.1)] relative">
                        <QRCodeSVG value={vpnData?.vpn?.links[0]} size={160} level="H" />
                      </div>
                      <div className="space-y-4">
                        <p className="text-[7px] text-white/30 font-black uppercase tracking-[0.5em]">VLESS SECURITY TOKEN</p>
                        <div className="p-4 bg-black/60 border border-white/5 rounded-2xl break-all font-mono text-[7px] text-[#5fad86]/80 text-left leading-relaxed shadow-inner">
                          {vpnData?.vpn?.links[0]}
                        </div>
                        <div className="flex flex-col gap-3 pt-2">
                          <Button onClick={() => copyKey(vpnData?.vpn?.links[0])} className="w-full btn-cyber-primary h-12 rounded-2xl text-[9px]">
                            <Copy className="w-3.5 h-3.5 mr-2" /> Копировать ключ
                          </Button>
                          <Button onClick={handleRegenerateKey} disabled={regenerating} variant="outline" className="w-full border-white/10 bg-black/40 h-12 rounded-2xl text-white/30 font-black text-[8px] uppercase tracking-[0.1em] hover:text-[#5fad86] hover:bg-black/60 transition-all">
                            {regenerating ? <RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5 mr-2" />}
                            Синхронизировать
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="py-20 text-center space-y-6">
                    <div className="w-20 h-20 glass-panel rounded-3xl flex items-center justify-center mx-auto border border-white/5 shadow-inner">
                       <Key className="w-8 h-8 text-white/10" />
                    </div>
                    <Button onClick={() => setActiveTab('status')} className="btn-cyber-primary rounded-2xl px-10 h-12 text-[9px]">АКТИВИРОВАТЬ</Button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'nodes' && (
              <div className="space-y-3 h-full overflow-y-auto pb-24 custom-scrollbar pt-2">
                {[
                  { id: 'FIN-01', name: 'FINLAND-HQ', ping: '28ms', load: '12%', active: true, soon: false },
                  { id: 'GER-01', name: 'GERMANY-SEC', ping: '--', load: '0%', active: false, soon: true },
                  { id: 'NED-04', name: 'NETHERLANDS', ping: '--', load: '0%', active: false, soon: true },
                  { id: 'TUR-02', name: 'TURKEY-PRX', ping: '--', load: '0%', active: false, soon: true }
                ].map((node) => (
                  <div key={node.id} className={`p-4 rounded-[2rem] transition-all glass-panel premium-card ${node.active ? 'border-white/20' : 'opacity-40 border-white/5'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                         <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-all ${node.active ? 'bg-[#5fad86] text-black shadow-[0_0_15px_#5fad86]' : 'bg-white/5 text-white/20 border-white/5'}`}>
                            <Globe className="w-5 h-5" />
                         </div>
                         <div>
                            <p className="font-black text-[10px] text-white uppercase tracking-widest">{node.name}</p>
                            <div className="flex items-center gap-3 mt-0.5">
                              {node.soon ? (
                                <span className="text-[7px] text-[#5fad86]/40 font-black uppercase tracking-widest">СКОРО В СЕТИ</span>
                              ) : (
                                <>
                                  <span className="text-[7px] text-white/40 font-black uppercase">PING: {node.ping}</span>
                                  <span className="w-1 h-1 bg-white/10 rounded-full" />
                                  <span className="text-[7px] text-white/40 font-black uppercase">LOAD: {node.load}</span>
                                </>
                              )}
                            </div>
                         </div>
                      </div>
                      {node.active && <div className="w-2 h-2 rounded-full bg-[#5fad86] animate-pulse shadow-[0_0_10px_#5fad86]" />}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="h-full space-y-4 pt-2">
                <div className="glass-panel p-6 rounded-[3rem] space-y-8 premium-card">
                  <div className="flex items-center space-x-5 p-4 bg-black/60 rounded-[2rem] border border-white/5 shadow-inner">
                    <Avatar className="w-14 h-14 rounded-2xl border border-white/10">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${vpnData?.username}`} />
                    </Avatar>
                    <div className="space-y-1">
                      <p className="text-xs font-black text-white uppercase tracking-[0.2em]">{vpnData?.username}</p>
                      <p className="text-[7px] text-[#5fad86] font-black uppercase tracking-[0.3em] bg-[#5fad86]/10 px-2 py-0.5 rounded-full inline-block">
                        {isAdmin ? 'SYSTEM ADMIN' : 'PREMIUM USER'}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 bg-white/5 rounded-3xl border border-white/5 text-center">
                          <Cpu className="w-3 h-3 mx-auto mb-2 text-white/20" />
                          <p className="text-[6px] text-white/20 uppercase font-black tracking-widest mb-1">Версия</p>
                          <p className="text-[8px] font-black text-white uppercase">2.4.0 REL</p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-3xl border border-white/5 text-center">
                          <Zap className="w-3 h-3 mx-auto mb-2 text-white/20" />
                          <p className="text-[6px] text-white/20 uppercase font-black tracking-widest mb-1">Лимит</p>
                          <p className="text-[8px] font-black text-white uppercase">100 GB / 0.0</p>
                      </div>
                  </div>
                  <Button variant="destructive" className="w-full h-12 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 font-black uppercase text-[8px] tracking-[0.3em] hover:bg-red-500 hover:text-white transition-all" onClick={async () => { await vpnLogout(); router.push('/vpn'); }}>
                    <LogOut className="w-3.5 h-3.5 mr-2" /> Завершить сеанс
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="flex-none p-6 flex justify-center relative z-20">
        <div className="bg-black/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] flex justify-between items-center px-2 py-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-full max-w-[280px]">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id as Tab)} className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all relative ${activeTab === item.id ? 'text-[#5fad86] bg-[#5fad86]/10' : 'text-white/20 hover:text-white/40'}`}>
              <item.icon className={`w-4.5 h-4.5 transition-transform duration-500 ${activeTab === item.id ? 'scale-110' : 'scale-100'}`} />
              <span className={`text-[6px] font-black uppercase mt-1.5 tracking-widest ${activeTab === item.id ? 'block' : 'hidden'}`}>{item.label}</span>
              {activeTab === item.id && (
                <motion.div layoutId="nav-glow" className="absolute inset-0 bg-[#5fad86]/5 rounded-2xl blur-md" />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
