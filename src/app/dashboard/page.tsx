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
import Image from 'next/image';

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
      toast({ title: "Ошибка", description: "Не удалось скопировать", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#5fad86] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/10 border-t-black rounded-full animate-spin" />
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
    <div className="h-screen bg-[#5fad86] text-white selection:bg-cyan-500/40 overflow-hidden flex flex-col">
      <header className="flex-none px-4 py-2">
        <div className="max-w-xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="relative w-5 h-5">
              <Image src="/fonts/logo.png" alt="CyberArmor" fill className="object-contain opacity-80" />
            </div>
            <h1 className="brand-title text-[10px] tracking-[0.5em] font-black">CYBER<span className="text-black/30">ARMOR</span></h1>
          </div>
          <div className="flex items-center space-x-2">
             <Button variant="ghost" size="icon" onClick={() => loadData(false)} disabled={refreshing} className="w-7 h-7 rounded-lg">
                <RefreshCw className={`w-3 h-3 text-black/40 ${refreshing ? 'animate-spin' : ''}`} />
             </Button>
             <Avatar className="w-7 h-7 rounded-lg border border-white/10 bg-black/40">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${vpnData?.username}`} />
                <AvatarFallback className="text-[6px]">{vpnData?.username?.substring(0,2).toUpperCase()}</AvatarFallback>
             </Avatar>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-xl mx-auto w-full px-4 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeTab === 'admin' && isAdmin && (
              <div className="space-y-3 h-full overflow-y-auto pb-24 custom-scrollbar">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: Activity, val: adminUsers.length, label: 'ЮЗЕРЫ', color: 'text-[#5fad86]' },
                    { val: adminUsers.filter(u => u.hasKey).length, label: 'ОНЛАЙН', color: 'text-emerald-400' },
                    { icon: Database, val: '1.4T', label: 'ТРАФИК', color: 'text-cyan-400' }
                  ].map((stat: any, i) => (
                    <div key={i} className="glass-panel p-2 rounded-xl text-center">
                      <p className="text-sm font-black text-white">{stat.val}</p>
                      <p className="text-[6px] text-white/30 uppercase font-black tracking-widest">{stat.label}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {adminUsers.map((user) => (
                    <div key={user.id} className="glass-panel p-3 rounded-xl border-white/5">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${user.hasKey ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-red-400/30'}`} />
                            <p className="font-black text-xs text-white">{user.username}</p>
                          </div>
                          <span className="text-[6px] text-white/20 font-black uppercase">{user.protocol}</span>
                        </div>
                        <Progress value={user.usagePercent || 5} className="h-0.5 bg-black/40 rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'status' && !isAdmin && (
              <div className="space-y-4 h-full overflow-y-auto pb-24 custom-scrollbar">
                {isActive ? (
                  <>
                    <Card className="glass-panel border-white/10 rounded-[3rem] bg-transparent shadow-2xl relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-50" />
                      <CardContent className="p-6 text-center relative z-10">
                        <div className="mb-4 relative inline-block">
                          <div className="w-16 h-16 rounded-2xl border border-white/10 bg-black/40 flex items-center justify-center neon-glow">
                            <div className="relative w-10 h-10">
                              <Image src="/fonts/logo.png" alt="Logo" fill className="object-contain" />
                            </div>
                          </div>
                        </div>
                        <h2 className="brand-title text-xs mb-1 justify-center text-white tracking-[0.4em] font-black">ПОДПИСКА АКТИВИРОВАНА</h2>
                        <p className="text-[#5fad86]/80 text-[8px] font-black uppercase tracking-[0.2em] mb-4">
                          {dates ? `с ${dates.start} по ${dates.end}` : 'Туннель активен'}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                          <div className="text-left flex items-start space-x-2">
                              <Zap className="w-3.5 h-3.5 text-[#5fad86] mt-1" />
                              <div>
                                <p className="text-[7px] text-white/20 uppercase font-black">Задержка</p>
                                <p className="text-xs font-black text-white">28ms</p>
                              </div>
                          </div>
                          <div className="text-right flex items-start justify-end space-x-2">
                              <div>
                                <p className="text-[7px] text-white/20 uppercase font-black">Шлюз</p>
                                <p className="text-xs font-black text-white">Финляндия</p>
                              </div>
                              <Globe className="w-3.5 h-3.5 text-white/30 mt-1" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="space-y-3">
                        <h3 className="text-[9px] font-black text-[#2d5440] uppercase tracking-[0.4em] text-center w-full">ПРОДЛИТЬ ПОДПИСКУ</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {PLANS.map((plan) => (
                                <button
                                    key={plan.months}
                                    onClick={() => handleBuy(plan.months)}
                                    disabled={purchasing}
                                    className="glass-panel p-4 rounded-2xl hover:bg-white/5 transition-all text-left group active:scale-95 border border-white/5"
                                >
                                    <p className="text-[7px] text-white/20 uppercase font-black mb-1">{plan.label}</p>
                                    <div className="flex items-center justify-between">
                                      <p className="text-xs font-black text-white">{plan.price}</p>
                                      <ArrowRight className="w-3 h-3 text-[#5fad86] opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-6 text-center py-4">
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-black/40 rounded-2xl flex items-center justify-center mx-auto border border-white/5 shadow-2xl">
                        <div className="relative w-10 h-10 opacity-20">
                           <Image src="/fonts/logo.png" alt="Logo" fill className="object-contain" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h2 className="brand-title text-xs justify-center text-white tracking-[0.4em] font-black uppercase">ДОСТУП ОГРАНИЧЕН</h2>
                        <p className="text-white/20 text-[7px] font-black uppercase tracking-[0.3em]">Требуется активация терминала</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {PLANS.map((plan) => (
                        <button
                          key={plan.months}
                          onClick={() => handleBuy(plan.months)}
                          disabled={purchasing}
                          className={`relative p-4 rounded-2xl border transition-all text-left group active:scale-95 ${plan.popular ? 'bg-white/10 border-white/20' : 'glass-panel border-white/5'}`}
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
              <div className="space-y-4 h-full overflow-y-auto pb-24 custom-scrollbar">
                {(isActive && vpnData?.vpn?.links?.length > 0) ? (
                  <Card className="glass-panel rounded-[3rem] bg-transparent shadow-2xl overflow-hidden">
                    <CardContent className="p-6 text-center space-y-4">
                      <div className="inline-block p-4 bg-white rounded-3xl shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                        <QRCodeSVG value={vpnData?.vpn?.links[0]} size={140} level="H" />
                      </div>
                      <div className="space-y-3">
                        <p className="text-[7px] text-white/30 font-black uppercase tracking-[0.4em]">Токен доступа VLESS</p>
                        <div className="p-3 bg-black/60 border border-white/5 rounded-2xl break-all font-mono text-[7px] text-[#5fad86]/60 text-left leading-relaxed">
                          {vpnData?.vpn?.links[0]}
                        </div>
                        <div className="flex flex-col gap-2 pt-2">
                          <Button onClick={() => copyKey(vpnData?.vpn?.links[0])} className="w-full bg-[#5fad86] text-black hover:bg-[#5fad86]/90 h-12 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_8px_20px_rgba(95,173,134,0.3)]">
                            <Copy className="w-4 h-4 mr-2" /> Копировать
                          </Button>
                          <Button onClick={handleRegenerateKey} disabled={regenerating} variant="outline" className="w-full border-white/10 bg-black/20 h-12 rounded-2xl text-white/30 font-black text-[9px] uppercase tracking-[0.1em]">
                            {regenerating ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <RotateCcw className="w-4 h-4 mr-2" />}
                            Синхронизировать данные
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="py-12 text-center space-y-6">
                    <div className="w-16 h-16 bg-black/40 rounded-2xl flex items-center justify-center mx-auto border border-white/5">
                       <Key className="w-8 h-8 text-white/10" />
                    </div>
                    <Button onClick={() => setActiveTab('status')} className="bg-white text-black rounded-2xl px-8 h-12 font-black uppercase text-[10px] tracking-[0.2em]">Инициализировать</Button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'nodes' && (
              <div className="space-y-2 h-full overflow-y-auto pb-24 custom-scrollbar">
                {[
                  { id: 'FIN-01', name: 'FIN-01 Финляндия', ping: '28ms', load: '8%', active: true, soon: false },
                  { id: 'GER-01', name: 'GER-01 Германия', ping: '--', load: '0%', active: false, soon: true },
                  { id: 'NED-04', name: 'NED-04 Нидерланды', ping: '--', load: '0%', active: false, soon: true },
                  { id: 'TUR-02', name: 'TUR-02 Турция', ping: '--', load: '0%', active: false, soon: true }
                ].map((node) => (
                  <div key={node.id} className={`p-3 rounded-2xl border transition-all ${node.active ? 'bg-white/10 border-white/20' : 'glass-panel border-white/5 opacity-50'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                         <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${node.active ? 'bg-[#5fad86] text-black' : 'bg-white/5 text-white/20'}`}>
                            <Globe className="w-4 h-4" />
                         </div>
                         <div>
                            <p className="font-black text-xs text-white uppercase tracking-wider">{node.name}</p>
                            <p className="text-[6px] text-white/30 font-black uppercase flex items-center gap-2">
                              {node.soon ? (
                                <span className="text-[#5fad86]/40">СКОРО ПОЯВЯТСЯ</span>
                              ) : (
                                <>
                                  <span>ПИНГ: {node.ping}</span>
                                  <span className="w-0.5 h-0.5 bg-white/10 rounded-full" />
                                  <span>НАГРУЗКА: {node.load}</span>
                                </>
                              )}
                            </p>
                         </div>
                      </div>
                      {node.active && <div className="w-1.5 h-1.5 rounded-full bg-[#5fad86] animate-pulse shadow-[0_0_8px_rgba(95,173,134,0.6)]" />}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="h-full space-y-3">
                <div className="glass-panel p-5 rounded-[2.5rem] space-y-6">
                  <div className="flex items-center space-x-4 p-3 bg-black/40 rounded-2xl border border-white/5">
                    <Avatar className="w-12 h-12 rounded-2xl">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${vpnData?.username}`} />
                    </Avatar>
                    <div className="space-y-0.5">
                      <p className="text-sm font-black text-white uppercase tracking-widest">{vpnData?.username}</p>
                      <p className="text-[7px] text-[#5fad86] font-black uppercase tracking-[0.3em]">{isAdmin ? 'Администратор' : 'Премиум доступ'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                      <div className="p-3 bg-white/5 rounded-2xl border border-white/5 text-center">
                          <p className="text-[6px] text-white/20 uppercase font-black mb-1">Версия</p>
                          <p className="text-[8px] font-black text-white">2.4.0-PREMIUM</p>
                      </div>
                      <div className="p-3 bg-white/5 rounded-2xl border border-white/5 text-center">
                          <p className="text-[6px] text-white/20 uppercase font-black mb-1">Лимит</p>
                          <p className="text-[8px] font-black text-white">100 GB / МЕС</p>
                      </div>
                  </div>
                  <Button variant="destructive" className="w-full h-12 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 font-black uppercase text-[9px] tracking-[0.2em]" onClick={async () => { await vpnLogout(); router.push('/vpn'); }}>
                    <LogOut className="w-3.5 h-3.5 mr-2" /> Завершить сессию
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="flex-none p-4 flex justify-center">
        <div className="bg-black/95 backdrop-blur-2xl border border-white/5 rounded-[2rem] flex justify-between items-center px-1 py-1 shadow-2xl w-full max-w-[280px]">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id as Tab)} className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all relative ${activeTab === item.id ? 'text-[#5fad86] bg-white/5' : 'text-white/10'}`}>
              <item.icon className={`w-4 h-4 ${activeTab === item.id ? 'scale-110' : ''}`} />
              <span className={`text-[6px] font-black uppercase mt-1 ${activeTab === item.id ? 'block' : 'hidden'}`}>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
