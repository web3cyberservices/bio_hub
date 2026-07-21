
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Key, 
  Settings, 
  Activity,
  LogOut,
  Copy,
  Zap,
  Globe,
  RefreshCw,
  Lock,
  Download,
  Upload,
  ChevronRight,
  User,
  Users,
  Database,
  Terminal,
  Clock,
  ExternalLink
} from 'lucide-react';
import { getVpnMe, vpnLogout, getAllVpnUsers } from '@/actions/vpn-actions';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type Tab = 'status' | 'keys' | 'nodes' | 'admin' | 'settings';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('status');
  const [vpnData, setVpnData] = useState<any>(null);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const loadData = async () => {
    setLoading(true);
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
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const copyKey = (link: string) => {
    if (!link) return;
    navigator.clipboard.writeText(link);
    toast({ title: "Успех", description: "Ключ скопирован" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#02040a] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
        <p className="mt-4 text-[10px] font-black text-slate-500 uppercase tracking-widest animate-pulse">Загрузка системы...</p>
      </div>
    );
  }

  const isAdmin = vpnData?.role === 'admin';
  const navItems = [
    { id: 'status', icon: Activity, label: 'Статус' },
    { id: 'keys', icon: Key, label: 'Ключи' },
    { id: 'nodes', icon: Globe, label: 'Узлы' },
    ...(isAdmin ? [{ id: 'admin', icon: Terminal, label: 'Админ' }] : []),
    { id: 'settings', icon: Settings, label: 'Опции' }
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
                {isAdmin ? 'Режим Администратора' : 'Премиальный доступ'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
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
            {activeTab === 'status' && (
              <div className="space-y-6">
                <Card className="glass-panel border-white/5 rounded-[2.5rem] overflow-hidden">
                  <CardContent className="p-10 text-center">
                    <div className="mb-8 relative inline-block">
                      <div className="w-40 h-40 rounded-full border-4 border-cyan-500/20 bg-cyan-500/5 flex items-center justify-center">
                        <Lock className="w-14 h-14 text-cyan-400" />
                      </div>
                      <div className="absolute top-4 right-4 w-6 h-6 bg-cyan-400 rounded-full animate-pulse border-4 border-[#02040a]" />
                    </div>
                    <h2 className="text-3xl font-black mb-2 uppercase italic text-white">Защищено</h2>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mb-10">Туннель активен • Reality V2</p>
                    
                    <div className="grid grid-cols-2 gap-8 pt-10 border-t border-white/5">
                       <div className="text-left">
                          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Ваш IP</p>
                          <p className="text-sm font-bold text-cyan-400">77.110.108.149</p>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Локация</p>
                          <p className="text-sm font-bold text-white">Германия</p>
                       </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-panel p-6 rounded-3xl border-white/5">
                    <Download className="w-5 h-5 text-emerald-400 mb-4" />
                    <p className="text-2xl font-black">128.4 <span className="text-[10px] font-normal text-slate-500 uppercase">Mb/s</span></p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Входящий</p>
                  </div>
                  <div className="glass-panel p-6 rounded-3xl border-white/5">
                    <Upload className="w-5 h-5 text-blue-400 mb-4" />
                    <p className="text-2xl font-black">45.2 <span className="text-[10px] font-normal text-slate-500 uppercase">Mb/s</span></p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Исходящий</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'keys' && (
              <div className="space-y-6">
                <Card className="glass-panel rounded-[2.5rem] border-white/5 overflow-hidden">
                  <CardContent className="p-10 text-center space-y-8">
                    <div className="inline-block p-6 bg-white rounded-[2rem]">
                      <QRCodeSVG value={vpnData?.vpn?.links[0] || ""} size={200} />
                    </div>
                    <div className="space-y-4">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Конфигурация VLESS</p>
                      <div className="p-4 bg-black/40 border border-white/5 rounded-2xl break-all font-mono text-[10px] text-slate-400 text-left">
                        {vpnData?.vpn?.links[0]}
                      </div>
                      <Button 
                        onClick={() => copyKey(vpnData?.vpn?.links[0])} 
                        className="w-full bg-cyan-600 hover:bg-cyan-500 h-16 rounded-2xl text-white font-bold"
                      >
                        <Copy className="w-5 h-5 mr-3" /> Копировать ключ
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'admin' && isAdmin && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="glass-panel p-4 rounded-2xl border-white/5">
                    <Users className="w-4 h-4 text-cyan-400 mb-2" />
                    <p className="text-xl font-black">{adminUsers.length}</p>
                    <p className="text-[8px] text-slate-500 uppercase font-black">Всего юзеров</p>
                  </div>
                  <div className="glass-panel p-4 rounded-2xl border-white/5">
                    <Activity className="w-4 h-4 text-emerald-400 mb-2" />
                    <p className="text-xl font-black">{adminUsers.filter(u => u.status === 'online').length}</p>
                    <p className="text-[8px] text-slate-500 uppercase font-black">В сети</p>
                  </div>
                  <div className="glass-panel p-4 rounded-2xl border-white/5">
                    <Database className="w-4 h-4 text-purple-400 mb-2" />
                    <p className="text-xl font-black">1.2 TB</p>
                    <p className="text-[8px] text-slate-500 uppercase font-black">Трафик (24ч)</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Управление пользователями</h3>
                  {adminUsers.map((user) => (
                    <div key={user.id} className="glass-panel p-4 rounded-2xl border-white/5 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-2 h-2 rounded-full ${user.status === 'online' ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                        <div>
                          <p className="font-bold text-sm text-white">{user.username}</p>
                          <p className="text-[9px] text-slate-500 font-bold uppercase">{user.protocol} • {user.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-cyan-400">{user.traffic}</p>
                        <p className="text-[8px] text-slate-500 font-bold uppercase">До: {user.expire}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'nodes' && (
              <div className="space-y-4">
                {[
                  { name: 'Германия Core', ping: '38ms', load: '12%', active: true },
                  { name: 'Нидерланды Main', ping: '42ms', load: '24%', active: false },
                  { name: 'Турция Edge', ping: '61ms', load: '45%', active: false }
                ].map((node) => (
                  <div key={node.name} className={`p-5 rounded-2xl border ${node.active ? 'bg-cyan-500/5 border-cyan-500/20' : 'bg-slate-900/40 border-white/5'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${node.active ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-500'}`}>
                            <Globe className="w-5 h-5" />
                         </div>
                         <div>
                            <p className="font-bold text-sm text-white">{node.name}</p>
                            <p className="text-[9px] text-slate-500 font-bold uppercase">Нагрузка: {node.load}</p>
                         </div>
                      </div>
                      <p className={`text-xs font-black ${node.active ? 'text-cyan-400' : 'text-slate-500'}`}>{node.ping}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="glass-panel p-8 rounded-[2rem] space-y-6">
                <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-2xl">
                  <User className="w-5 h-5 text-cyan-400" />
                  <div>
                    <p className="text-sm font-bold text-white">{vpnData?.username}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">{vpnData?.role === 'admin' ? 'Администратор' : 'Пользователь'}</p>
                  </div>
                </div>
                <Button 
                  variant="destructive" 
                  className="w-full h-14 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20"
                  onClick={async () => { await vpnLogout(); router.push('/vpn'); }}
                >
                  <LogOut className="w-4 h-4 mr-2" /> Выйти
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 p-6 flex justify-center">
        <div className="bg-[#0f172a]/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] flex justify-between items-center px-4 py-2 shadow-2xl w-full max-w-md">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all ${activeTab === item.id ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
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
