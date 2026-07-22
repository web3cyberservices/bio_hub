'use client';

import React, { useState, useEffect } from 'react';
import { 
  Key, 
  Settings, 
  Activity,
  LogOut,
  Globe,
  RefreshCw,
  Zap,
  RotateCcw,
  Copy,
  Terminal,
  Database,
  ArrowRight,
  ShieldCheck,
  Cpu,
  User,
  Trash2,
  Edit3,
  Search
} from 'lucide-react';
import { 
  getVpnMe, 
  vpnLogout, 
  getAllVpnUsers, 
  buySubscription, 
  regenerateVpnKey,
  updateUserByAdmin,
  deleteUserByAdmin
} from '@/actions/vpn-actions';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import Image from 'next/image';

type Tab = 'status' | 'keys' | 'nodes' | 'admin' | 'settings';

const PLANS = [
  { months: 1, price: '490 ₽', label: '1 МЕСЯЦ' },
  { months: 3, price: '1 290 ₽', label: '3 МЕСЯЦА' },
  { months: 6, price: '2 290 ₽', label: '6 МЕСЯЦЕВ' },
  { months: 12, price: '3 990 ₽', label: '12 МЕСЯЦЕВ' },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('status');
  const [vpnData, setVpnData] = useState<any>(null);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  
  // Admin Editing State
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editLimitGb, setEditLimitGb] = useState(100);
  const [editMonths, setEditMonths] = useState(1);

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

  const handleAdminUpdate = async () => {
    if (!editingUser) return;
    setRefreshing(true);
    const result = await updateUserByAdmin(editingUser.username, editMonths, editLimitGb);
    if (result.success) {
      toast({ title: "ОБНОВЛЕНО", description: `Параметры для ${editingUser.username} изменены.` });
      setEditingUser(null);
      await loadData(false);
    } else {
      toast({ title: "ОШИБКА", description: result.error, variant: "destructive" });
    }
    setRefreshing(false);
  };

  const handleAdminDelete = async (username: string) => {
    if (!confirm(`Удалить пользователя ${username}?`)) return;
    setRefreshing(true);
    const result = await deleteUserByAdmin(username);
    if (result.success) {
      toast({ title: "УДАЛЕНО", description: "Пользователь стерт из базы." });
      await loadData(false);
    }
    setRefreshing(false);
  };

  const handleBuy = async (months: number) => {
    setPurchasing(true);
    try {
      const result = await buySubscription(months);
      if (result.success) {
        if (result.url) {
          // Если мы в продакшене, переходим на Lava.top
          window.location.href = result.url;
        } else {
          // Если в разработке, просто уведомляем
          toast({ title: "УСПЕХ", description: result.message || `Подписка на ${months} мес. активна.` });
          setTimeout(() => loadData(false), 1000);
        }
      } else {
        toast({ title: "ОШИБКА", description: result.error, variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "СИСТЕМНАЯ ОШИБКА", description: "Не удалось связаться с сервером оплат", variant: "destructive" });
    } finally {
      setPurchasing(false);
    }
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
      await navigator.clipboard.writeText(link);
      toast({ title: "СКОПИРОВАНО", description: "Ключ в буфере обмена" });
    } catch (e) {
      toast({ title: "ОШИБКА", description: "Используйте современный браузер", variant: "destructive" });
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

  const filteredUsers = adminUsers.filter(u => u.username.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="h-screen bg-[#5fad86] text-white flex flex-col overflow-hidden font-sans">
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
               <Button variant="ghost" size="icon" onClick={() => loadData(false)} disabled={refreshing} className="w-8 h-8 rounded-full bg-white/5 border border-white/5">
                  <RefreshCw className={`w-3.5 h-3.5 text-white/60 ${refreshing ? 'animate-spin' : ''}`} />
               </Button>
               <Avatar className="w-8 h-8 rounded-full border border-white/20 bg-black shadow-lg">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${vpnData?.username}`} />
               </Avatar>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-6 overflow-hidden relative z-10 pt-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {activeTab === 'admin' && isAdmin && (
              <div className="space-y-4 h-full overflow-y-auto pb-24 custom-scrollbar">
                <div className="grid grid-cols-3 gap-3">
                  <div className="glass-panel p-3 rounded-2xl text-center premium-card">
                    <User className="w-3 h-3 mx-auto mb-1 text-[#5fad86]/40" />
                    <p className="text-xs font-black">{adminUsers.length}</p>
                    <p className="text-[6px] text-white/20 uppercase tracking-widest">ЮЗЕРЫ</p>
                  </div>
                  <div className="glass-panel p-3 rounded-2xl text-center premium-card">
                    <ShieldCheck className="w-3 h-3 mx-auto mb-1 text-[#5fad86]/40" />
                    <p className="text-xs font-black">{adminUsers.filter(u => u.hasKey).length}</p>
                    <p className="text-[6px] text-white/20 uppercase tracking-widest">КЛЮЧИ</p>
                  </div>
                  <div className="glass-panel p-3 rounded-2xl text-center premium-card">
                    <Database className="w-3 h-3 mx-auto mb-1 text-[#5fad86]/40" />
                    <p className="text-xs font-black">2026</p>
                    <p className="text-[6px] text-white/20 uppercase tracking-widest">REL</p>
                  </div>
                </div>

                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                  <Input 
                    placeholder="ПОИСК ЮЗЕРА..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-10 pl-10 bg-black/40 border-white/5 rounded-xl text-[10px] uppercase font-black tracking-widest focus:border-[#5fad86]/40"
                  />
                </div>

                <div className="space-y-2">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="glass-panel p-4 rounded-2xl border-white/5 flex items-center justify-between group premium-card">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${user.hasKey ? 'bg-[#5fad86] shadow-[0_0_8px_#5fad86]' : 'bg-white/10'}`} />
                          <div>
                            <p className="font-black text-[10px] uppercase">{user.username}</p>
                            <p className="text-[6px] text-white/40 uppercase tracking-tighter">
                              {user.limitGb} GB • {user.expireDate}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                           <Button 
                             size="icon" 
                             variant="ghost" 
                             onClick={() => {
                               setEditingUser(user);
                               setEditLimitGb(user.limitGb);
                             }}
                             className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#5fad86]/20"
                           >
                             <Edit3 className="w-3 h-3 text-white/40" />
                           </Button>
                           <Button 
                             size="icon" 
                             variant="ghost" 
                             onClick={() => handleAdminDelete(user.username)}
                             className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/30"
                           >
                             <Trash2 className="w-3 h-3 text-red-500/60" />
                           </Button>
                        </div>
                    </div>
                  ))}
                </div>

                {/* Edit Modal / Overlay */}
                <AnimatePresence>
                  {editingUser && (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
                    >
                      <motion.div 
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        className="glass-panel w-full max-w-xs p-6 rounded-[2.5rem] border-[#5fad86]/20 shadow-2xl space-y-6"
                      >
                        <div className="text-center">
                          <h2 className="text-[10px] font-black tracking-[0.3em] uppercase mb-1">РЕДАКТОР: {editingUser.username}</h2>
                          <div className="h-[1px] w-12 bg-[#5fad86]/40 mx-auto" />
                        </div>
                        
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-[7px] font-black text-white/20 uppercase tracking-widest ml-1">Лимит Трафика (GB)</label>
                            <Input 
                              type="number" 
                              value={editLimitGb} 
                              onChange={(e) => setEditLimitGb(parseInt(e.target.value))}
                              className="h-10 bg-black/40 border-white/5 rounded-xl text-center font-black"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[7px] font-black text-white/20 uppercase tracking-widest ml-1">Добавить месяцев</label>
                            <div className="grid grid-cols-4 gap-2">
                              {[1, 3, 6, 12].map(m => (
                                <button 
                                  key={m} 
                                  onClick={() => setEditMonths(m)}
                                  className={`p-2 rounded-lg text-[9px] font-black border transition-all ${editMonths === m ? 'bg-[#5fad86] text-black border-[#5fad86]' : 'bg-white/5 border-white/5 text-white/40'}`}
                                >
                                  {m}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button onClick={() => setEditingUser(null)} variant="ghost" className="flex-1 rounded-xl text-[8px] font-black uppercase tracking-widest">ОТМЕНА</Button>
                          <Button onClick={handleAdminUpdate} className="flex-1 btn-cyber-primary rounded-xl text-[8px]">ПРИМЕНИТЬ</Button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {activeTab === 'status' && !isAdmin && (
              <div className="space-y-6 h-full overflow-y-auto pb-24 custom-scrollbar">
                {isActive ? (
                  <>
                    <Card className="glass-panel border-white/10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group premium-card">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#5fad86]/5 to-transparent" />
                      <CardContent className="p-8 text-center relative z-10">
                        <motion.div 
                          animate={{ scale: [1, 1.03, 1] }}
                          transition={{ duration: 4, repeat: Infinity }}
                          className="w-16 h-16 mx-auto mb-4 neon-glow-green"
                        >
                          <Image src="/fonts/logo512x512.png" alt="Logo" fill className="object-contain" />
                        </motion.div>
                        <h2 className="brand-title text-[10px] mb-2 justify-center tracking-[0.4em]">ТЕРМИНАЛ АКТИВЕН</h2>
                        <div className="text-[#5fad86] text-[7px] font-black uppercase tracking-[0.2em] mb-6 bg-[#5fad86]/10 inline-block px-4 py-1.5 rounded-full border border-[#5fad86]/20">
                          {vpnData?.expiresAt ? `ДО: ${new Date(vpnData.expiresAt).toLocaleDateString('ru-RU')}` : 'БЕССРОЧНО'}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/5">
                          <div className="text-left">
                              <p className="text-[6px] text-white/20 uppercase font-black tracking-widest">Задержка</p>
                              <p className="text-xs font-black">28 MS</p>
                          </div>
                          <div className="text-right">
                              <p className="text-[6px] text-white/20 uppercase font-black tracking-widest">Лимит</p>
                              <p className="text-xs font-black">{vpnData?.limitGb} GB</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="grid grid-cols-2 gap-3">
                        {PLANS.map((plan) => (
                            <button
                                key={plan.months}
                                onClick={() => handleBuy(plan.months)}
                                disabled={purchasing}
                                className="glass-panel p-5 rounded-3xl text-left active:scale-95 transition-all border border-white/5 premium-card group"
                            >
                                <p className="text-[6px] text-white/20 uppercase font-black mb-1">{plan.label}</p>
                                <div className="flex items-center justify-between">
                                  <p className="text-xs font-black">{plan.price}</p>
                                  <ArrowRight className="w-3 h-3 text-[#5fad86] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                </div>
                            </button>
                        ))}
                    </div>
                  </>
                ) : (
                  <div className="py-12 text-center space-y-8">
                    <div className="space-y-4">
                      <div className="w-20 h-20 mx-auto opacity-20 grayscale">
                        <Image src="/fonts/logo512x512.png" alt="Logo" fill className="object-contain" />
                      </div>
                      <h2 className="brand-title text-[10px] justify-center tracking-[0.5em]">ДОСТУП ЗАКРЫТ</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {PLANS.map((plan) => (
                        <button key={plan.months} onClick={() => handleBuy(plan.months)} className="glass-panel p-5 rounded-3xl text-left">
                          <p className="text-[6px] text-white/20 uppercase mb-1">{plan.label}</p>
                          <p className="text-xs font-black">{plan.price}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'keys' && !isAdmin && (
              <div className="space-y-4 h-full overflow-y-auto pb-24 custom-scrollbar">
                {isActive && vpnData?.vpn?.links?.length > 0 ? (
                  <Card className="glass-panel rounded-[2.5rem] shadow-2xl overflow-hidden premium-card">
                    <CardContent className="p-8 text-center space-y-6">
                      <div className="inline-block p-4 bg-white rounded-3xl">
                        <QRCodeSVG value={vpnData?.vpn?.links[0]} size={160} level="H" />
                      </div>
                      <div className="space-y-4">
                        <div className="p-4 bg-black/60 border border-white/5 rounded-2xl break-all font-mono text-[7px] text-[#5fad86]/80 text-left leading-relaxed">
                          {vpnData?.vpn?.links[0]}
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button onClick={() => copyKey(vpnData?.vpn?.links[0])} className="w-full btn-cyber-primary h-12 rounded-2xl text-[9px]">
                            <Copy className="w-3.5 h-3.5 mr-2" /> СКОПИРОВАТЬ КЛЮЧ
                          </Button>
                          <Button onClick={handleRegenerateKey} disabled={regenerating} variant="outline" className="w-full bg-black/40 h-10 rounded-xl text-[8px] font-black uppercase text-white/40 border-white/5 hover:text-[#5fad86]">
                            <RotateCcw className={`w-3 h-3 mr-2 ${regenerating ? 'animate-spin' : ''}`} /> СИНХРОНИЗАЦИЯ
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="py-20 text-center space-y-4">
                    <Key className="w-12 h-12 mx-auto text-white/5" />
                    <Button onClick={() => setActiveTab('status')} className="btn-cyber-primary rounded-xl px-8 h-12 text-[9px]">АКТИВИРОВАТЬ</Button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'nodes' && (
              <div className="space-y-3 h-full overflow-y-auto pb-24 custom-scrollbar">
                {[
                  { id: 'FIN-01', name: 'FINLAND-HQ', ping: '28ms', load: '12%', active: true },
                  { id: 'GER-01', name: 'GERMANY-SEC', ping: '--', load: '0%', active: false },
                  { id: 'NED-04', name: 'NETHERLANDS', ping: '--', load: '0%', active: false }
                ].map((node) => (
                  <div key={node.id} className={`p-4 rounded-[2rem] glass-panel premium-card transition-all ${node.active ? 'border-[#5fad86]/20' : 'opacity-40'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                         <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${node.active ? 'bg-[#5fad86] text-black shadow-[0_0_15px_#5fad86]' : 'bg-white/5'}`}>
                            <Globe className="w-5 h-5" />
                         </div>
                         <div>
                            <p className="font-black text-[10px] uppercase tracking-widest">{node.name}</p>
                            <p className="text-[6px] text-white/40 uppercase font-black">PING: {node.ping} • LOAD: {node.load}</p>
                         </div>
                      </div>
                      {node.active && <div className="w-1.5 h-1.5 rounded-full bg-[#5fad86] animate-pulse" />}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="h-full space-y-4">
                <div className="glass-panel p-6 rounded-[3rem] space-y-8 premium-card">
                  <div className="flex items-center space-x-5 p-4 bg-black/40 rounded-[2rem] border border-white/5">
                    <Avatar className="w-14 h-14 rounded-2xl border border-white/10">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${vpnData?.username}`} />
                    </Avatar>
                    <div className="space-y-1">
                      <p className="text-xs font-black uppercase">{vpnData?.username}</p>
                      <p className="text-[7px] text-[#5fad86] font-black uppercase tracking-[0.3em] bg-[#5fad86]/10 px-3 py-1 rounded-full">
                        {isAdmin ? 'ADMIN ACCESS' : 'PREMIUM USER'}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 bg-white/5 rounded-3xl text-center border border-white/5">
                          <Cpu className="w-3 h-3 mx-auto mb-2 text-white/20" />
                          <p className="text-[6px] text-white/20 uppercase font-black mb-1">Версия</p>
                          <p className="text-[8px] font-black">2.4.0 REL</p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-3xl text-center border border-white/5">
                          <Zap className="w-3 h-3 mx-auto mb-2 text-white/20" />
                          <p className="text-[6px] text-white/20 uppercase font-black mb-1">Лимит</p>
                          <p className="text-[8px] font-black">{vpnData?.limitGb} GB</p>
                      </div>
                  </div>
                  <Button variant="destructive" className="w-full h-12 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 font-black uppercase text-[8px] tracking-[0.3em] hover:bg-red-500 hover:text-white" onClick={async () => { await vpnLogout(); router.push('/vpn'); }}>
                    <LogOut className="w-3.5 h-3.5 mr-2" /> ЗАВЕРШИТЬ СЕАНС
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="flex-none p-6 flex justify-center relative z-20">
        <div className="bg-black/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] flex justify-between items-center px-2 py-2 shadow-2xl w-full max-w-[280px]">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id as Tab)} className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all ${activeTab === item.id ? 'text-[#5fad86] bg-[#5fad86]/10' : 'text-white/20'}`}>
              <item.icon className={`w-4.5 h-4.5 ${activeTab === item.id ? 'scale-110' : ''}`} />
              <span className={`text-[6px] font-black uppercase mt-1.5 tracking-widest ${activeTab === item.id ? 'block' : 'hidden'}`}>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
