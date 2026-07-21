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
  MessageSquare,
  RefreshCw,
  Globe,
  Bell,
  Info,
  ChevronRight,
  Wifi,
  Lock,
  Download,
  Upload,
  Clock
} from 'lucide-react';
import { getVpnMe, vpnLogout } from '@/actions/vpn-actions';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';

type Tab = 'status' | 'keys' | 'nodes' | 'speed' | 'support' | 'info' | 'settings';

export default function VpnDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('status');
  const [vpnData, setVpnData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');
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
      setLastUpdate(new Date().toLocaleTimeString());
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
      <div className="min-h-screen bg-[#02040a] p-6 space-y-6 flex flex-col justify-center items-center">
        <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
        <p className="text-cyan-500 font-bold animate-pulse">Инициализация защиты...</p>
      </div>
    );
  }

  const vpnLink = vpnData?.vpn?.links?.[0] || "";

  const NAV_ITEMS = [
    { id: 'status', icon: Activity, label: 'Статус' },
    { id: 'keys', icon: Key, label: 'Ключи' },
    { id: 'nodes', icon: Globe, label: 'Серверы' },
    { id: 'speed', icon: Zap, label: 'Сеть' },
    { id: 'support', icon: MessageSquare, label: 'Помощь' },
    { id: 'settings', icon: Settings, label: 'Опции' },
  ];

  return (
    <div className="min-h-screen bg-[#02040a] pb-28 text-slate-100 selection:bg-cyan-500/30">
      {/* Background decoration */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <header className="sticky top-0 z-50 bg-[#02040a]/80 backdrop-blur-xl border-b border-white/5 px-6 py-5 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight leading-tight">
              VPN <span className="text-cyan-400">PRO</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Premium Edition</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
           <button onClick={loadData} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
            <RefreshCw className="w-4 h-4 text-slate-400" />
          </button>
          <div className="h-8 px-3 rounded-xl bg-slate-900 border border-white/5 flex items-center">
            <span className="text-xs font-mono text-cyan-400">{vpnData?.username}</span>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'status' && (
              <div className="space-y-6">
                <Card className="glass-card overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Wifi size={120} />
                  </div>
                  <CardContent className="p-8 text-center relative">
                    <div className="relative inline-block mb-6">
                      <div className={`w-32 h-32 rounded-full flex items-center justify-center border-4 ${vpnData?.vpn?.status === 'active' ? 'border-emerald-500/30' : 'border-red-500/30'}`}>
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center ${vpnData?.vpn?.status === 'active' ? 'bg-emerald-500/10 shadow-[0_0_40px_rgba(16,185,129,0.2)]' : 'bg-red-500/10'}`}>
                          <Lock className={`w-10 h-10 ${vpnData?.vpn?.status === 'active' ? 'text-emerald-500' : 'text-red-500'}`} />
                        </div>
                      </div>
                      {vpnData?.vpn?.status === 'active' && (
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-[#02040a] animate-pulse" />
                      )}
                    </div>
                    <h2 className="text-3xl font-black mb-1 neon-text tracking-tighter">
                      {vpnData?.vpn?.status === 'active' ? 'ЗАЩИЩЕНО' : 'ОТКЛЮЧЕНО'}
                    </h2>
                    <p className="text-slate-400 text-sm font-medium">Безопасный туннель активен</p>
                    
                    <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 gap-4">
                       <div className="text-left">
                          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Истекает</p>
                          <p className="text-sm font-bold text-white">
                            {vpnData?.vpn?.expire ? new Date(vpnData.vpn.expire * 1000).toLocaleDateString() : 'Never'}
                          </p>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Трафик</p>
                          <p className="text-sm font-bold text-cyan-400">Unlimited</p>
                       </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-card p-5 rounded-3xl">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <Download className="w-4 h-4 text-emerald-500" />
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Входящий</span>
                    </div>
                    <p className="text-xl font-black tracking-tight">42.8 <span className="text-xs font-normal text-slate-500">Mb/s</span></p>
                  </div>
                  <div className="glass-card p-5 rounded-3xl">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Upload className="w-4 h-4 text-blue-500" />
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Исходящий</span>
                    </div>
                    <p className="text-xl font-black tracking-tight">18.4 <span className="text-xs font-normal text-slate-500">Mb/s</span></p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'keys' && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-black tracking-tighter">КЛЮЧ ДОСТУПА</h3>
                  <p className="text-slate-500 text-sm">VLESS REALITY PROTOCOL</p>
                </div>

                <Card className="glass-card rounded-[2.5rem] overflow-hidden">
                  <CardContent className="p-8 space-y-8">
                    {vpnLink ? (
                      <div className="space-y-8 text-center">
                        <div className="inline-block p-6 bg-white rounded-[2rem] shadow-2xl">
                          <QRCodeSVG value={vpnLink} size={200} />
                        </div>
                        <div className="p-4 bg-black/40 border border-white/5 rounded-2xl break-all font-mono text-[10px] text-slate-400 text-left relative group">
                          {vpnLink}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => copyKey(vpnLink)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        <Button 
                          onClick={() => copyKey(vpnLink)} 
                          className="w-full bg-cyan-600 hover:bg-cyan-500 h-16 rounded-2xl text-white font-black shadow-xl shadow-cyan-500/20 transition-all active:scale-95"
                        >
                          <Copy className="w-4 h-4 mr-2" /> КОПИРОВАТЬ VLESS
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-20">
                        <Lock className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                        <p className="text-slate-500 font-bold">Ключи не активированы</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'nodes' && (
              <div className="space-y-4">
                <div className="flex justify-between items-end mb-2 px-2">
                  <h3 className="text-xl font-black tracking-tighter">ЛОКАЦИИ</h3>
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">3 Доступно</span>
                </div>
                {[
                  { id: 'de', name: 'Germany', city: 'Frankfurt', ping: '42ms', flag: '🇩🇪', active: true },
                  { id: 'nl', name: 'Netherlands', city: 'Amsterdam', ping: '38ms', flag: '🇳🇱', active: false },
                  { id: 'tr', name: 'Turkey', city: 'Istanbul', ping: '65ms', flag: '🇹🇷', active: false }
                ].map((node) => (
                  <div key={node.id} className={`group relative p-5 rounded-3xl border transition-all duration-300 ${node.active ? 'bg-cyan-500/5 border-cyan-500/30' : 'bg-slate-900/40 border-white/5 opacity-60'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-3xl filter saturate-150">{node.flag}</span>
                        <div>
                          <p className="font-black text-white text-lg leading-none mb-1">{node.name}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{node.city}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-black ${node.active ? 'text-emerald-400' : 'text-slate-500'}`}>{node.ping}</p>
                        {node.active && <div className="mt-1 flex justify-end"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" /></div>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'speed' && (
              <div className="space-y-8 py-10">
                <div className="relative w-48 h-48 mx-auto">
                   <div className="absolute inset-0 border-8 border-white/5 rounded-full" />
                   <div className="absolute inset-0 border-8 border-transparent border-t-cyan-500 rounded-full animate-spin duration-[2s]" />
                   <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <Zap className="w-10 h-10 text-cyan-500 mb-2" />
                      <span className="text-4xl font-black tracking-tighter">0.00</span>
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Mb/s</span>
                   </div>
                </div>
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-black tracking-tighter">АНАЛИЗ СЕТИ</h2>
                  <p className="text-slate-500 text-sm max-w-[200px] mx-auto">Тестирование пропускной способности канала...</p>
                </div>
                <Button className="w-full h-16 rounded-2xl bg-white text-black font-black hover:bg-slate-200">
                  ЗАПУСТИТЬ ТЕСТ
                </Button>
              </div>
            )}

            {activeTab === 'support' && (
              <div className="space-y-6 text-center py-10 px-4">
                <div className="w-20 h-20 rounded-3xl bg-cyan-500/10 flex items-center justify-center mx-auto mb-6 rotate-12">
                  <MessageSquare className="w-10 h-10 text-cyan-500 -rotate-12" />
                </div>
                <h2 className="text-3xl font-black tracking-tighter">PREMIUM HELPDESK</h2>
                <p className="text-slate-400 text-sm leading-relaxed">Наши эксперты помогут с настройкой на любом устройстве 24/7.</p>
                <div className="grid gap-3 pt-6">
                  <Button className="h-16 rounded-2xl bg-[#0088cc] hover:bg-[#0077bb] font-black text-white shadow-lg shadow-blue-500/20">
                    ЧАТ В TELEGRAM
                  </Button>
                  <Button variant="outline" className="h-16 rounded-2xl border-white/5 bg-white/5 font-black hover:bg-white/10">
                    БАЗА ЗНАНИЙ
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-4">
                <h3 className="text-xl font-black tracking-tighter px-2 mb-2">НАСТРОЙКИ</h3>
                
                <div className="glass-card p-6 rounded-3xl space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-purple-500/10 rounded-xl">
                        <Bell className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Уведомления</p>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Smart Alerts</p>
                      </div>
                    </div>
                    <div className="w-12 h-6 bg-cyan-600 rounded-full relative p-1">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-lg" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-orange-500/10 rounded-xl">
                        <Shield className="w-5 h-5 text-orange-400" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Kill Switch</p>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Auto Disconnect</p>
                      </div>
                    </div>
                    <div className="w-12 h-6 bg-slate-800 rounded-full relative p-1">
                      <div className="absolute left-1 top-1 w-4 h-4 bg-slate-600 rounded-full" />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    <Button 
                      variant="destructive" 
                      className="w-full h-14 rounded-2xl font-black text-xs tracking-widest bg-red-500/10 text-red-500 hover:bg-red-500/20 border-0"
                      onClick={async () => {
                        await vpnLogout();
                        router.push('/vpn');
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-2" /> ЗАВЕРШИТЬ СЕССИЮ
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-10 pt-4 pointer-events-none">
        <div className="max-w-md mx-auto bg-slate-900/80 backdrop-blur-2xl border border-white/5 shadow-2xl rounded-[2.5rem] flex justify-around items-center px-4 py-3 pointer-events-auto">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 relative ${
                activeTab === item.id 
                  ? 'text-cyan-400 scale-110' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <item.icon className={`w-5 h-5 mb-1 ${activeTab === item.id ? 'neon-text' : ''}`} />
              <span className="text-[8px] font-black uppercase tracking-tighter">{item.label}</span>
              {activeTab === item.id && (
                <motion.div 
                  layoutId="nav-glow"
                  className="absolute -bottom-1 w-4 h-0.5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}