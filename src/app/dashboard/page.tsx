'use client';

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Key, 
  Settings, 
  Activity,
  LogOut,
  Copy,
  Globe,
  Lock,
  Terminal,
  CreditCard,
  AlertCircle,
  Users,
  Database,
  Calendar,
  RefreshCw,
  Clock
} from 'lucide-react';
import { getVpnMe, vpnLogout, getAllVpnUsers, buySubscription } from '@/actions/vpn-actions';
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
        if (Array.isArray(users)) {
          setAdminUsers(users);
        }
      }
    } catch (e) {
      console.error(e);
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

  useEffect(() => {
    if (isAdmin && activeTab === 'status') {
      setActiveTab('admin');
    }
  }, [isAdmin, activeTab]);

  const handleBuy = async (months: number) => {
    setPurchasing(true);
    const result = await buySubscription(months);
    if (result.success) {
      toast({ title: "Успех", description: `Подписка на ${months} мес. активирована` });
      await loadData(false);
    } else {
      toast({ title: "Ошибка", description: result.error, variant: "destructive" });
    }
    setPurchasing(false);
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
        <p className="mt-4 text-[10px] font-black text-slate-500 uppercase tracking-widest animate-pulse">Инициализация...</p>
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
              <h1 className="text-xl font-black italic leading-none">VPN <span className="text-cyan-400">PRO</span></h1>
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
            {/* АДМИН ПАНЕЛЬ */}
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
                    <p className="text-2xl font-black">{adminUsers.filter(u => u.status === 'online').length}</p>
                    <p className="text-[8px] text-slate-500 uppercase font-black">Подписки</p>
                  </div>
                  <div className="glass-panel p-5 rounded-3xl border-white/5">
                    <Database className="w-4 h-4 text-purple-400 mb-2" />
                    <p className="text-2xl font-black">1.2 TB</p>
                    <p className="text-[8px] text-slate-500 uppercase font-black">Трафик</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center px-2">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Список пользователей</h3>
                    <span className="text-[9px] text-slate-600 font-bold uppercase">Всего: {adminUsers.length}</span>
                  </div>
                  
                  {adminUsers.map((user) => (
                    <Card key={user.id} className="glass-panel border-white/5 rounded-3xl overflow-hidden hover:border-white/10 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center space-x-3">
                            <div className={`w-2.5 h-2.5 rounded-full ${user.hasKey ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-red-500/50'}`} />
                            <div>
                              <p className="font-bold text-base text-white">{user.username}</p>
                              <div className="flex items-center space-x-2 mt-0.5">
                                <span className="text-[9px] text-slate-500 font-bold uppercase">{user.protocol}</span>
                                <span className="w-1 h-1 bg-slate-700 rounded-full" />
                                <span className="text-[9px] text-slate-500 font-bold uppercase flex items-center">
                                  <Clock className="w-2.5 h-2.5 mr-1" /> c {user.createdDate}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                             <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full ${user.hasKey ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                               {user.hasKey ? <Key className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                               <span className="text-[8px] font-black uppercase">
                                 {user.hasKey ? 'Ключ выдан' : 'Без ключа'}
                               </span>
                             </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-4">
                          <div className="space-y-1">
                            <div className="flex items-center text-[10px] text-slate-500 uppercase font-bold tracking-tighter">
                              <Calendar className="w-3 h-3 mr-1" /> Истекает
                            </div>
                            <p className={`text-sm font-bold ${user.hasKey ? 'text-slate-200' : 'text-slate-500'}`}>{user.expireDate}</p>
                          </div>
                          <div className="space-y-1 text-right">
                            <div className="flex items-center justify-end text-[10px] text-slate-500 uppercase font-bold tracking-tighter">
                              <Database className="w-3 h-3 mr-1" /> Потребление
                            </div>
                            <p className="text-sm font-bold text-cyan-400">{user.traffic}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[8px] uppercase font-black text-slate-600">
                            <span>Нагрузка порта</span>
                            <span>{user.usagePercent}%</span>
                          </div>
                          <Progress value={user.usagePercent} className="h-1.5 bg-white/5" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* СТАТУС ПОЛЬЗОВАТЕЛЯ */}
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
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mb-10">Подписка активна до {new Date(vpnData.expiresAt).toLocaleDateString()}</p>
                        
                        <div className="grid grid-cols-2 gap-8 pt-10 border-t border-white/5">
                          <div className="text-left">
                              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Пинг</p>
                              <p className="text-sm font-bold text-cyan-400">34 ms</p>
                          </div>
                          <div className="text-right">
                              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Локация</p>
                              <p className="text-sm font-bold text-white">Германия</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="space-y-8 text-center">
                    <div className="space-y-2">
                      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                      <h2 className="text-2xl font-black uppercase italic">Доступ ограничен</h2>
                      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Выберите тариф для получения ключей доступа</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {PLANS.map((plan) => (
                        <button
                          key={plan.months}
                          onClick={() => handleBuy(plan.months)}
                          disabled={purchasing}
                          className={`relative p-6 rounded-3xl border transition-all text-left group ${plan.popular ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
                        >
                          {plan.popular && <span className="absolute -top-3 left-6 bg-cyan-500 text-white text-[8px] font-black uppercase px-2 py-1 rounded-full">Хит</span>}
                          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-tighter mb-1">{plan.label}</p>
                          <p className="text-xl font-black text-white">{plan.price}</p>
                          <div className="mt-4 flex items-center text-[10px] font-bold text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            <CreditCard className="w-3 h-3 mr-2" /> Купить сейчас
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* КЛЮЧИ ПОЛЬЗОВАТЕЛЯ */}
            {activeTab === 'keys' && !isAdmin && (
              <div className="space-y-6">
                {isActive ? (
                  <Card className="glass-panel rounded-[2.5rem] border-white/5 overflow-hidden">
                    <CardContent className="p-10 text-center space-y-8">
                      <div className="inline-block p-6 bg-white rounded-[2rem]">
                        <QRCodeSVG value={vpnData?.vpn?.links[0] || ""} size={200} />
                      </div>
                      <div className="space-y-4">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Персональный VLESS ключ</p>
                        <div className="p-4 bg-black/40 border border-white/5 rounded-2xl break-all font-mono text-[10px] text-slate-400 text-left">
                          {vpnData?.vpn?.links[0]}
                        </div>
                        <Button 
                          onClick={() => copyKey(vpnData?.vpn?.links[0])} 
                          className="w-full bg-cyan-600 hover:bg-cyan-500 h-16 rounded-2xl text-white font-bold transition-transform active:scale-95"
                        >
                          <Copy className="w-5 h-5 mr-3" /> Копировать ключ
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="py-20 text-center space-y-6">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/5">
                      <Lock className="w-10 h-10 text-slate-700" />
                    </div>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-widest max-w-[200px] mx-auto">Ключи появятся после покупки подписки</p>
                    <Button 
                      onClick={() => setActiveTab('status')}
                      variant="outline" 
                      className="border-cyan-500/20 bg-cyan-500/5 rounded-xl text-[10px] uppercase font-black text-cyan-400 px-8"
                    >
                      К тарифам
                    </Button>
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
                  { name: 'Турция (Стамбул)', ping: '61ms', load: '45%', active: false },
                  { name: 'Финляндия (Хельсинки)', ping: '28ms', load: '8%', active: false }
                ].map((node) => (
                  <div key={node.name} className={`p-5 rounded-3xl border transition-all ${node.active ? 'bg-cyan-500/5 border-cyan-500/20' : 'bg-slate-900/40 border-white/5'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${node.active ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-500'}`}>
                            <Globe className="w-6 h-6" />
                         </div>
                         <div>
                            <p className="font-bold text-sm text-white">{node.name}</p>
                            <p className="text-[9px] text-slate-500 font-bold uppercase">Пинг: {node.ping} • Загрузка: {node.load}</p>
                         </div>
                      </div>
                      {node.active ? (
                        <div className="flex items-center space-x-2">
                           <span className="text-[8px] font-black text-cyan-400 uppercase">Оптимально</span>
                           <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                        </div>
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-slate-700" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="glass-panel p-8 rounded-[2rem] space-y-6">
                  <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-2xl">
                    <Avatar className="w-14 h-14 rounded-2xl">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${vpnData?.username}`} />
                    </Avatar>
                    <div>
                      <p className="text-base font-bold text-white">{vpnData?.username}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        {vpnData?.role === 'admin' ? 'Администратор системы' : isActive ? 'Статус: Премиум' : 'Статус: Базовый'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-[8px] text-slate-500 uppercase font-black mb-1">Версия ПО</p>
                      <p className="text-xs font-bold text-white">2.4.0 (Stable)</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-[8px] text-slate-500 uppercase font-black mb-1">Безопасность</p>
                      <p className="text-xs font-bold text-emerald-500">AES-256-GCM</p>
                    </div>
                  </div>
                  
                  <Button 
                    variant="destructive" 
                    className="w-full h-14 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-all"
                    onClick={async () => { await vpnLogout(); router.push('/vpn'); }}
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Завершить сеанс
                  </Button>
                </div>

                <div className="text-center">
                  <p className="text-[8px] text-slate-600 font-black uppercase tracking-[0.4em]">VPN PRO • 2026 EDITION</p>
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
