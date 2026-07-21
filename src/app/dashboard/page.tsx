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
      // Небольшая задержка перед обновлением, чтобы Marzban успел применить изменения
      setTimeout(() => loadData(false), 500);
    } else {
      toast({ title: "Ошибка", description: result.error, variant: "destructive" });
    }
    setPurchasing(false);
  };

  const handleRegenerateKey = async () => {
    setRegenerating(true);
    const result = await regenerateVpnKey();
    if (result.success) {
      toast({ title: "Успех", description: "VLESS ключ успешно обновлен" });
      await loadData(false);
    } else {
      toast({ title: "Ошибка", description: result.error, variant: "destructive" });
    }
    setRegenerating(false);
  };

  const copyKey = (link: string) => {
    if (!link) return;
    navigator.clipboard.writeText(link);
    toast({ title: "Успех", description: "Ключ скопирован" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#02040a] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
        <p className="mt-4 text-[10px] font-black text-slate-500 uppercase tracking-widest animate-pulse">Cyber Armor Engine...</p>
      </div>
    );
  }
  
  const navItems = isAdmin ? [
    { id: 'admin', icon: Terminal, label: 'Панель' },
    { id: 'nodes', icon: Globe, label: 'Узлы' },
    { id: 'settings', icon: Settings, label: 'Профиль' }
  ] : [
    { id: 'status', icon: Activity, label: 'Статус' },
    { id: 'keys', icon: Key, label: 'Ключи' },
    { id: 'nodes', icon: Globe, label: 'Узлы' },
    { id: 'settings', icon: Settings, label: 'Профиль' }
  ];

  return (
    <div className="min-h-screen bg-[#02040a] text-slate-100 selection:bg-cyan-500/20 pb-32">
      <header className="sticky top-0 z-50 bg-[#02040a]/80 backdrop-blur-2xl border-b border-white/5 px-6 py-5">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black italic leading-none">Cyber<span className="text-cyan-400">Armor</span></h1>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                {isAdmin ? 'System Intelligence' : 'Private Dashboard'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
             <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full hover:bg-white/5"
                onClick={() => loadData(false)}
                disabled={refreshing}
             >
                <RefreshCw className={`w-4 h-4 text-slate-400 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
             </Button>
             <Avatar className="w-10 h-10 rounded-xl border border-white/10">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${vpnData?.username}`} />
                <AvatarFallback>{vpnData?.username?.substring(0,2).toUpperCase()}</AvatarFallback>
             </Avatar>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6 space-y-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {activeTab === 'admin' && isAdmin && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="glass-panel p-5 rounded-3xl border-white/5">
                    <Users className="w-4 h-4 text-cyan-400 mb-2" />
                    <p className="text-2xl font-black">{adminUsers.length}</p>
                    <p className="text-[8px] text-slate-500 uppercase font-black">Клиенты</p>
                  </div>
                  <div className="glass-panel p-5 rounded-3xl border-white/5">
                    <Activity className="w-4 h-4 text-emerald-400 mb-2" />
                    <p className="text-2xl font-black">{adminUsers.filter(u => u.hasKey).length}</p>
                    <p className="text-[8px] text-slate-500 uppercase font-black">Активны</p>
                  </div>
                  <div className="glass-panel p-5 rounded-3xl border-white/5">
                    <Database className="w-4 h-4 text-purple-400 mb-2" />
                    <p className="text-2xl font-black">1.2 TB</p>
                    <p className="text-[8px] text-slate-500 uppercase font-black">Трафик</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Список пользователей</h3>
                  {adminUsers.length > 0 ? adminUsers.map((user) => (
                    <Card key={user.id} className="glass-panel border-white/5 rounded-3xl overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-2 h-2 rounded-full ${user.hasKey ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            <p className="font-bold text-white">{user.username}</p>
                          </div>
                          <span className="text-[9px] text-slate-500 font-bold uppercase">{user.protocol}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                          <div>
                            <p className="text-[8px] text-slate-500 uppercase font-black">Истекает</p>
                            <p className="font-bold">{user.expireDate}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[8px] text-slate-500 uppercase font-black">Трафик</p>
                            <p className="font-bold text-cyan-400">{user.traffic}</p>
                          </div>
                        </div>
                        <Progress value={user.usagePercent} className="h-1 bg-white/5" />
                      </CardContent>
                    </Card>
                  )) : (
                    <div className="py-20 text-center glass-panel rounded-3xl border-dashed border-white/10">
                      <UserX className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                      <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Клиентов нет</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'status' && !isAdmin && (
              <div className="space-y-8">
                {isActive ? (
                  <div className="space-y-6">
                    <Card className="glass-panel border-white/5 rounded-[2.5rem] overflow-hidden">
                      <CardContent className="p-10 text-center">
                        <div className="mb-8 relative inline-block">
                          <div className="w-40 h-40 rounded-full border-4 border-cyan-500/20 bg-cyan-500/5 flex items-center justify-center">
                            <Shield className="w-14 h-14 text-cyan-400" />
                          </div>
                          <div className="absolute top-4 right-4 w-6 h-6 bg-cyan-400 rounded-full animate-pulse border-4 border-[#02040a]" />
                        </div>
                        <h2 className="text-3xl font-black mb-2 uppercase italic text-white">Защищено</h2>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mb-8">Cyber Armor Active</p>
                        
                        <div className="flex flex-col space-y-2 mb-10">
                            <div className="flex items-center justify-center space-x-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <Calendar className="w-3 h-3" />
                                <span>До {vpnData.expiresAt ? new Date(vpnData.expiresAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Бессрочно'}</span>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-8 pt-10 border-t border-white/5">
                          <div className="text-left flex items-start space-x-3">
                              <div className="p-2 bg-cyan-500/10 rounded-xl">
                                <Zap className="w-4 h-4 text-cyan-400" />
                              </div>
                              <div>
                                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Пинг</p>
                                <p className="text-sm font-bold text-cyan-400">34 ms</p>
                              </div>
                          </div>
                          <div className="text-right flex items-start justify-end space-x-3">
                              <div>
                                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Локация</p>
                                <p className="text-sm font-bold text-white">Германия</p>
                              </div>
                              <div className="p-2 bg-white/5 rounded-xl">
                                <Navigation className="w-4 h-4 text-slate-400" />
                              </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Продлить доступ</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {PLANS.map((plan) => (
                                <button
                                    key={plan.months}
                                    onClick={() => handleBuy(plan.months)}
                                    disabled={purchasing}
                                    className="glass-panel p-5 rounded-3xl border-white/5 hover:border-white/10 transition-all text-left group"
                                >
                                    <p className="text-[8px] text-slate-500 uppercase font-black mb-1">{plan.label}</p>
                                    <p className="text-lg font-black text-white group-hover:text-cyan-400 transition-colors">{plan.price}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8 text-center py-10">
                    <div className="space-y-4">
                      <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                        <Lock className="w-10 h-10 text-red-500" />
                      </div>
                      <h2 className="text-2xl font-black uppercase italic">Доступ ограничен</h2>
                      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest max-w-xs mx-auto leading-relaxed">Выберите тариф для активации VLESS туннеля</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {PLANS.map((plan) => (
                        <button
                          key={plan.months}
                          onClick={() => handleBuy(plan.months)}
                          disabled={purchasing}
                          className={`relative p-6 rounded-3xl border transition-all text-left group ${plan.popular ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
                        >
                          {plan.popular && <span className="absolute -top-3 left-6 bg-cyan-500 text-white text-[8px] font-black uppercase px-2 py-1 rounded-full">Популярно</span>}
                          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-tighter mb-1">{plan.label}</p>
                          <p className="text-xl font-black text-white group-hover:text-cyan-400 transition-colors">{plan.price}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'keys' && !isAdmin && (
              <div className="space-y-6">
                {(isActive && vpnData?.vpn?.links?.length > 0) ? (
                  <Card className="glass-panel rounded-[2.5rem] border-white/5 overflow-hidden">
                    <CardContent className="p-10 text-center space-y-8">
                      <div className="inline-block p-6 bg-white rounded-[2rem] shadow-2xl">
                        <QRCodeSVG value={vpnData?.vpn?.links[0]} size={200} />
                      </div>
                      <div className="space-y-4">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Ваш персональный конфиг</p>
                        <div className="p-4 bg-black/40 border border-white/5 rounded-2xl break-all font-mono text-[10px] text-slate-400 text-left">
                          {vpnData?.vpn?.links[0]}
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          <Button 
                            onClick={() => copyKey(vpnData?.vpn?.links[0])} 
                            className="w-full bg-cyan-600 hover:bg-cyan-500 h-16 rounded-2xl text-white font-bold shadow-lg shadow-cyan-900/20"
                          >
                            <Copy className="w-5 h-5 mr-3" /> Копировать ключ
                          </Button>
                          <Button 
                            onClick={handleRegenerateKey}
                            disabled={regenerating}
                            variant="outline"
                            className="w-full border-white/10 bg-white/5 h-14 rounded-2xl text-slate-300 font-bold"
                          >
                            {regenerating ? <RefreshCw className="w-4 h-4 mr-2 animate-spin text-cyan-400" /> : <RotateCcw className="w-4 h-4 mr-2" />}
                            Перегенерировать ключ
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="py-20 text-center space-y-6">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/5">
                      <Key className="w-10 h-10 text-slate-700" />
                    </div>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-widest max-w-[200px] mx-auto">
                      {!isActive ? "Ключи появятся после активации подписки" : "Генерация ключа... Нажмите обновить"}
                    </p>
                    {!isActive && <Button onClick={() => setActiveTab('status')} className="bg-cyan-600 rounded-xl px-8">Купить подписку</Button>}
                    {isActive && <Button onClick={() => loadData(false)} variant="outline" className="rounded-xl border-white/10"><RefreshCw className="w-4 h-4 mr-2" /> Обновить</Button>}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'nodes' && (
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 mb-4">Доступные локации</h3>
                {[
                  { name: 'Германия (Франкфурт)', ping: '38ms', load: '12%', active: true },
                  { name: 'Нидерланды (Амстердам)', ping: '42ms', load: '24%', active: false },
                  { name: 'Турция (Стамбул)', ping: '61ms', load: '45%', active: false }
                ].map((node) => (
                  <div key={node.name} className={`p-5 rounded-3xl border transition-all ${node.active ? 'bg-cyan-500/5 border-cyan-500/20' : 'bg-slate-900/40 border-white/5'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${node.active ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-500'}`}>
                            <Globe className="w-6 h-6" />
                         </div>
                         <div>
                            <p className="font-bold text-sm text-white">{node.name}</p>
                            <p className="text-[9px] text-slate-500 font-bold uppercase">Пинг: {node.ping} • Нагрузка: {node.load}</p>
                         </div>
                      </div>
                      {node.active && <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]" />}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="glass-panel p-8 rounded-[2rem] space-y-6">
                  <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-2xl">
                    <Avatar className="w-14 h-14 rounded-2xl border border-white/5">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${vpnData?.username}`} />
                    </Avatar>
                    <div>
                      <p className="text-base font-bold text-white">{vpnData?.username}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        {isAdmin ? 'Администратор системы' : isActive ? 'Премиум доступ' : 'Базовый тариф'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-[8px] text-slate-500 uppercase font-black mb-1">Версия ПО</p>
                      <p className="text-xs font-bold text-white">2.6.0 (Stable)</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-[8px] text-slate-500 uppercase font-black mb-1">Защита</p>
                      <p className="text-xs font-bold text-emerald-500">REALITY ON</p>
                    </div>
                  </div>
                  
                  <Button 
                    variant="destructive" 
                    className="w-full h-14 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20"
                    onClick={async () => { await vpnLogout(); router.push('/vpn'); }}
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Завершить сеанс
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 p-6 flex justify-center">
        <div className="bg-[#0f172a]/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] flex justify-between items-center px-4 py-2 shadow-2xl w-full max-w-md">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all ${activeTab === item.id ? 'text-cyan-400 bg-cyan-400/5' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <item.icon className="w-5 h-5" />
              <span className={`text-[8px] font-black uppercase tracking-tighter mt-1 ${activeTab === item.id ? 'block' : 'hidden'}`}>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
