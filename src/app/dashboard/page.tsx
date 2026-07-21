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
        <div className="relative scale-75">
          <div className="w-10 h-10 border-4 border-white/10 border-t-cyan-400 rounded-full animate-spin shadow-[0_0_15px_rgba(34,211,238,0.3)]" />
        </div>
        <p className="mt-4 text-[8px] font-black text-white/40 uppercase tracking-[0.4em] animate-pulse">Initializing Identity...</p>
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

  return (
    <div className="h-screen bg-[#5fad86] text-white selection:bg-cyan-500/40 overflow-hidden flex flex-col">
      <header className="flex-none bg-[#5fad86]/90 backdrop-blur-xl border-b border-black/5 px-4 py-4">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-2xl bg-black/40 flex items-center justify-center shadow-lg border border-white/5 relative">
              <Shield className="w-5 h-5 text-cyan-400 relative z-10" />
            </div>
            <div>
              <h1 className="brand-title text-lg tracking-[0.3em]">
                CYBER<span className="text-cyan-400">ARMOR</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-3">
             <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-xl hover:bg-black/10 h-10 w-10 group"
                onClick={() => loadData(false)}
                disabled={refreshing}
             >
                <RefreshCw className={`w-4 h-4 text-white/30 group-hover:text-cyan-400 transition-colors ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
             </Button>
             <Avatar className="w-10 h-10 rounded-xl border border-white/10 shadow-xl bg-black/40">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${vpnData?.username}`} />
                <AvatarFallback className="bg-black/60 font-black text-[10px] text-cyan-400">{vpnData?.username?.substring(0,2).toUpperCase()}</AvatarFallback>
             </Avatar>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full p-6 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeTab === 'admin' && isAdmin && (
              <div className="space-y-6 h-full overflow-y-auto pb-24 custom-scrollbar">
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { icon: Users, val: adminUsers.length, label: 'ID', color: 'text-cyan-400' },
                    { icon: Activity, val: adminUsers.filter(u => u.hasKey).length, label: 'ON', color: 'text-emerald-400' },
                    { icon: Database, val: '1.4T', label: 'NET', color: 'text-purple-400' }
                  ].map((stat, i) => (
                    <div key={i} className="glass-panel p-4 rounded-3xl relative group overflow-hidden">
                      <stat.icon className={`w-4 h-4 ${stat.color} mb-1`} />
                      <p className="text-xl font-black">{stat.val}</p>
                      <p className="text-[8px] text-white/30 uppercase font-black tracking-widest">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <h3 className="text-[9px] font-black text-white/30 uppercase tracking-[0.5em] px-2">Реестр</h3>
                  {adminUsers.length > 0 ? adminUsers.map((user) => (
                    <Card key={user.id} className="glass-panel border-white/5 rounded-3xl overflow-hidden bg-transparent group hover:border-white/10 transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className={`w-2.5 h-2.5 rounded-full ${user.hasKey ? 'bg-emerald-400' : 'bg-red-400/30'}`} />
                            <p className="font-black text-base text-white">{user.username}</p>
                          </div>
                          <span className="text-[8px] text-white/30 font-black uppercase px-2 py-1 rounded-full bg-white/5 border border-white/5">{user.protocol}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-[11px] mb-3">
                          <div>
                            <p className="text-[8px] text-white/20 uppercase font-black">Истекает</p>
                            <p className="font-bold text-white/80">{user.expireDate}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[8px] text-white/20 uppercase font-black">Трафик</p>
                            <p className="font-bold text-cyan-400">{user.traffic}</p>
                          </div>
                        </div>
                        <Progress value={user.usagePercent} className="h-1.5 bg-black/40 rounded-full" />
                      </CardContent>
                    </Card>
                  )) : (
                    <div className="py-12 text-center glass-panel rounded-3xl border-dashed border-white/10">
                      <UserX className="w-10 h-10 text-white/10 mx-auto mb-3" />
                      <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.5em]">Нет данных</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'status' && !isAdmin && (
              <div className="space-y-6 h-full overflow-y-auto pb-24 custom-scrollbar">
                {isActive ? (
                  <>
                    <Card className="glass-panel border-white/10 rounded-[3rem] overflow-hidden bg-transparent shadow-xl">
                      <CardContent className="p-8 text-center">
                        <div className="mb-6 relative inline-block">
                          <div className="absolute inset-0 bg-cyan-400/10 blur-[40px] rounded-full scale-125" />
                          <div className="w-24 h-24 rounded-[2rem] border border-white/10 bg-black/40 flex items-center justify-center relative z-10 neon-glow shadow-lg">
                            <Shield className="w-12 h-12 text-white drop-shadow-[0_0_8px_rgba(34,211,238,0.3)]" />
                          </div>
                          <div className="absolute -top-1 -right-1 w-8 h-8 bg-cyan-400 rounded-xl border-2 border-[#0d1612] flex items-center justify-center shadow-md">
                            <Zap className="w-4 h-4 text-black" />
                          </div>
                        </div>
                        <h2 className="brand-title text-2xl mb-2 justify-center text-white tracking-[0.4em]">ЗАЩИЩЕНО</h2>
                        <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.5em] mb-6">Туннель активен</p>
                        
                        <div className="inline-flex items-center justify-center space-x-3 text-[10px] font-black text-white/70 uppercase tracking-[0.2em] bg-white/5 py-2 px-6 rounded-2xl mx-auto border border-white/5 mb-8">
                            <Calendar className="w-4 h-4 text-cyan-400" />
                            <span>{vpnData.expiresAt ? new Date(vpnData.expiresAt).toLocaleDateString('ru-RU') : 'Бессрочно'}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/5">
                          <div className="text-left flex items-start space-x-3">
                              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                <Zap className="w-4 h-4 text-cyan-400" />
                              </div>
                              <div>
                                <p className="text-[8px] text-white/20 uppercase font-black">Пинг</p>
                                <p className="text-sm font-black text-cyan-400">34ms</p>
                              </div>
                          </div>
                          <div className="text-right flex items-start justify-end space-x-3">
                              <div>
                                <p className="text-[8px] text-white/20 uppercase font-black">Шлюз</p>
                                <p className="text-sm font-black text-white">Германия</p>
                              </div>
                              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                <Globe className="w-4 h-4 text-white/30" />
                              </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="space-y-3">
                        <h3 className="text-[9px] font-black text-white/30 uppercase tracking-[0.5em] px-2">Пакеты доступа</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {PLANS.map((plan) => (
                                <button
                                    key={plan.months}
                                    onClick={() => handleBuy(plan.months)}
                                    disabled={purchasing}
                                    className="glass-panel p-5 rounded-3xl hover:bg-white/5 transition-all text-left group border border-white/5 active:scale-95"
                                >
                                    <p className="text-[9px] text-white/20 uppercase font-black mb-1">{plan.label}</p>
                                    <div className="flex items-center justify-between">
                                      <p className="text-base font-black text-white group-hover:text-cyan-400">{plan.price}</p>
                                      <ArrowRight className="w-4 h-4 text-cyan-400 opacity-0 group-hover:opacity-100 transition-all" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-10 text-center py-8">
                    <div className="space-y-5">
                      <div className="w-20 h-20 bg-black/40 rounded-[2rem] flex items-center justify-center mx-auto border border-white/5 shadow-xl">
                        <Lock className="w-10 h-10 text-white/10" />
                      </div>
                      <div className="space-y-2">
                        <h2 className="brand-title text-2xl justify-center text-white tracking-[0.4em]">ДОСТУП ОГРАНИЧЕН</h2>
                        <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.5em] max-w-[240px] mx-auto">Требуется активация зашифрованного соединения</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {PLANS.map((plan) => (
                        <button
                          key={plan.months}
                          onClick={() => handleBuy(plan.months)}
                          disabled={purchasing}
                          className={`relative p-5 rounded-[2rem] border transition-all text-left group active:scale-95 ${plan.popular ? 'bg-white/10 border-white/20 shadow-lg' : 'glass-panel border-white/5'}`}
                        >
                          {plan.popular && <span className="absolute -top-2 left-6 bg-cyan-400 text-black text-[8px] font-black uppercase px-3 py-1 rounded-full border-2 border-[#0d1612]">ЛУЧШИЙ</span>}
                          <p className="text-white/20 text-[9px] font-black uppercase mb-1">{plan.label}</p>
                          <p className="text-lg font-black text-white group-hover:text-cyan-400">{plan.price}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'keys' && !isAdmin && (
              <div className="space-y-6 h-full overflow-y-auto pb-24 custom-scrollbar">
                {(isActive && vpnData?.vpn?.links?.length > 0) ? (
                  <Card className="glass-panel rounded-[3rem] overflow-hidden bg-transparent shadow-xl">
                    <CardContent className="p-8 text-center space-y-6">
                      <div className="inline-block p-6 bg-white rounded-3xl shadow-lg group">
                        <div className="relative z-10">
                          <QRCodeSVG value={vpnData?.vpn?.links[0]} size={180} level="H" includeMargin={false} />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.5em]">Токен доступа</p>
                        <div className="p-4 bg-black/60 border border-white/5 rounded-2xl break-all font-mono text-[10px] text-white/20 text-left leading-tight shadow-inner">
                          {vpnData?.vpn?.links[0]}
                        </div>
                        <div className="grid grid-cols-1 gap-3 pt-4">
                          <Button 
                            onClick={() => copyKey(vpnData?.vpn?.links[0])} 
                            className="w-full bg-white text-black hover:bg-white/90 h-14 rounded-2xl font-black text-[12px] uppercase transition-all cyber-button"
                          >
                            <Copy className="w-5 h-5 mr-3" /> Копировать ключ
                          </Button>
                          <Button 
                            onClick={handleRegenerateKey}
                            disabled={regenerating}
                            variant="outline"
                            className="w-full border-white/10 bg-black/40 h-14 rounded-2xl text-white/40 font-black text-[12px] uppercase active:scale-95"
                          >
                            {regenerating ? <RefreshCw className="w-5 h-5 mr-3 animate-spin text-cyan-400" /> : <RotateCcw className="w-5 h-5 mr-3" />}
                            Синхронизировать
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="py-16 text-center space-y-8">
                    <div className="w-20 h-20 bg-black/40 rounded-[2rem] flex items-center justify-center mx-auto border border-white/5 shadow-xl">
                       <Key className="w-10 h-10 text-white/10" />
                    </div>
                    <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.5em] max-w-[240px] mx-auto">
                      {!isActive 
                        ? "Реестр пуст" 
                        : "Требуется синхронизация"}
                    </p>
                    <Button onClick={() => setActiveTab('status')} className="bg-white text-black rounded-2xl px-10 h-14 font-black uppercase text-[12px] tracking-[0.3em] shadow-xl cyber-button">Инициализировать</Button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'nodes' && (
              <div className="space-y-4 h-full overflow-y-auto pb-24 custom-scrollbar">
                <h3 className="text-[9px] font-black text-white/30 uppercase tracking-[0.5em] px-2 mb-2">Активные шлюзы</h3>
                {[
                  { name: 'FRK-01 Германия', ping: '38ms', load: '12%', active: true },
                  { name: 'AMS-04 Нидерланды', ping: '42ms', load: '24%', active: false },
                  { name: 'IST-02 Турция', ping: '61ms', load: '45%', active: false }
                ].map((node) => (
                  <div key={node.name} className={`p-5 rounded-[2rem] border transition-all active:scale-[0.98] ${node.active ? 'bg-white/10 border-white/20 shadow-lg' : 'glass-panel border-white/5 opacity-50'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-md ${node.active ? 'bg-white text-black border-white' : 'bg-white/5 text-white/20 border-white/5'}`}>
                            <Globe className="w-6 h-6" />
                         </div>
                         <div>
                            <p className="font-black text-base text-white">{node.name}</p>
                            <p className="text-[10px] text-white/30 font-black uppercase tracking-tighter flex items-center gap-3">
                              <span className="flex items-center gap-1.5"><Zap className="w-3 h-3" /> {node.ping}</span>
                              <span className="w-1 h-1 bg-white/10 rounded-full" />
                              <span>Загрузка {node.load}</span>
                            </p>
                         </div>
                      </div>
                      {node.active && <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.6)] animate-pulse" />}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="h-full flex flex-col justify-start">
                <div className="glass-panel p-8 rounded-[3rem] space-y-8 shadow-xl">
                  <div className="flex items-center space-x-5 p-4 bg-black/40 rounded-2xl border border-white/5">
                    <Avatar className="w-16 h-16 rounded-2xl border border-white/10">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${vpnData?.username}`} />
                    </Avatar>
                    <div className="space-y-1">
                      <p className="text-xl font-black text-white leading-none">{vpnData?.username}</p>
                      <p className="text-[10px] text-cyan-400 font-black uppercase tracking-[0.3em] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                        {isAdmin ? 'Root Доступ' : isActive ? 'Premium Аккаунт' : 'Базовый'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                      <p className="text-[9px] text-white/20 uppercase font-black mb-1">Протокол</p>
                      <p className="text-[11px] font-black text-white">XRAY REALITY</p>
                    </div>
                    <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                      <p className="text-[9px] text-white/20 uppercase font-black mb-1">Сборка</p>
                      <p className="text-[11px] font-black text-cyan-400">2026.4.F</p>
                    </div>
                  </div>
                  
                  <Button 
                    variant="destructive" 
                    className="w-full h-14 rounded-2xl bg-red-500/5 text-red-300 border border-red-500/10 hover:bg-red-500/10 font-black uppercase text-[11px] active:scale-95 transition-all"
                    onClick={async () => { await vpnLogout(); router.push('/vpn'); }}
                  >
                    <LogOut className="w-4 h-4 mr-3" /> Завершить сессию
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="flex-none p-6 flex justify-center pointer-events-none">
        <div className="bg-black/90 backdrop-blur-[20px] border border-white/5 rounded-[2rem] flex justify-between items-center px-4 py-2 shadow-2xl w-full max-w-[320px] pointer-events-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all relative group ${activeTab === item.id ? 'text-cyan-400' : 'text-white/20 hover:text-white/40'}`}
            >
              <item.icon className={`w-6 h-6 transition-all ${activeTab === item.id ? 'scale-110' : ''}`} />
              <span className={`text-[8px] font-black uppercase mt-1 ${activeTab === item.id ? 'block' : 'hidden'}`}>{item.label}</span>
              {activeTab === item.id && <motion.div layoutId="nav-active" className="absolute -bottom-1 w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]" />}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
