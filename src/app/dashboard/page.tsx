
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Key, 
  HelpCircle, 
  Settings, 
  Activity,
  LogOut,
  ChevronRight,
  Copy,
  Zap,
  MessageSquare,
  RefreshCw,
  Globe,
  Bell,
  Navigation,
  Info
} from 'lucide-react';
import { getVpnMe, vpnLogout } from '@/actions/vpn-actions';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { QRCodeSVG } from 'qrcode.react';

type Tab = 'status' | 'keys' | 'nodes' | 'speed' | 'support' | 'info' | 'settings';

export default function VpnDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('status');
  const [vpnData, setVpnData] = useState<any>(null);
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
    toast({ title: "Скопировано", description: "Ключ VLESS скопирован в буфер обмена" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 flex flex-col space-y-4">
        <Skeleton className="h-12 w-full bg-slate-900 rounded-xl" />
        <Skeleton className="h-48 w-full bg-slate-900 rounded-2xl" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-24 bg-slate-900 rounded-2xl" />
          <Skeleton className="h-24 bg-slate-900 rounded-2xl" />
        </div>
      </div>
    );
  }

  const vpnLink = vpnData?.vpn?.links?.[0] || "";

  const NAV_ITEMS = [
    { id: 'status', icon: Activity, label: 'Статус' },
    { id: 'keys', icon: Key, label: 'Ключи' },
    { id: 'nodes', icon: Globe, label: 'Локации' },
    { id: 'speed', icon: Zap, label: 'Скорость' },
    { id: 'support', icon: MessageSquare, label: 'Чат' },
    { id: 'info', icon: Info, label: 'Справка' },
    { id: 'settings', icon: Settings, label: 'Опции' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 pb-28 text-slate-100 flex flex-col">
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-900 px-6 py-4 flex justify-between items-center shadow-xl">
        <div className="flex items-center space-x-2">
          <Shield className="w-6 h-6 text-cyan-500 fill-cyan-500/10" />
          <h1 className="text-xl font-black tracking-tighter uppercase italic">
            VPN <span className="text-cyan-500">PRO</span>
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={loadData} className="text-slate-500 hover:text-cyan-400 transition-colors p-1">
            <RefreshCw className="w-4 h-4" />
          </button>
          <div className="text-[10px] text-slate-500 font-mono bg-slate-900 px-2 py-1 rounded border border-slate-800">
            {vpnData?.username}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-4 py-6">
        {activeTab === 'status' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-slate-800 shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Globe className="w-32 h-32" />
              </div>
              <CardContent className="p-10 text-center relative z-10">
                <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center border-4 ${vpnData?.vpn?.status === 'active' ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
                  <Activity className={`w-10 h-10 ${vpnData?.vpn?.status === 'active' ? 'text-emerald-500 animate-pulse' : 'text-red-500'}`} />
                </div>
                <h2 className="text-2xl font-black mb-2">{vpnData?.vpn?.status === 'active' ? 'ПОДКЛЮЧЕНО' : 'ОЖИДАЕТ ОПЛАТЫ'}</h2>
                <div className="flex items-center justify-center space-x-2 text-slate-400 text-sm">
                  <RefreshCw className="w-3 h-3" />
                  <span>Обновлено: {new Date().toLocaleTimeString()}</span>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 shadow-lg group hover:border-cyan-500/30 transition-all">
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Сервер</p>
                <p className="text-lg font-bold text-white flex items-center">
                  DE <span className="ml-2 text-xs font-normal text-slate-500">Frankfurt</span>
                </p>
              </div>
              <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 shadow-lg group hover:border-cyan-500/30 transition-all">
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Пинг</p>
                <p className="text-lg font-bold text-emerald-400">42 ms</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'keys' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="bg-slate-900 border-slate-800 shadow-2xl rounded-3xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Личный ключ VLESS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {vpnLink ? (
                  <div className="space-y-8">
                    <div className="flex justify-center p-6 bg-white rounded-3xl shadow-2xl mx-auto max-w-[240px]">
                      <QRCodeSVG value={vpnLink} size={190} />
                    </div>
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl break-all font-mono text-[10px] text-slate-500 select-all">
                      {vpnLink}
                    </div>
                    <Button onClick={() => copyKey(vpnLink)} className="w-full bg-cyan-600 hover:bg-cyan-700 h-14 rounded-2xl text-white font-black text-sm transition-all shadow-lg shadow-cyan-500/20">
                      <Copy className="w-4 h-4 mr-2" /> КОПИРОВАТЬ КЛЮЧ
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-16 space-y-6">
                    <div className="w-16 h-16 bg-slate-950 rounded-full flex items-center justify-center mx-auto border border-slate-800">
                      <Zap className="w-8 h-8 text-slate-800" />
                    </div>
                    <p className="text-slate-500 font-medium px-8 leading-relaxed">Ключи не найдены. Обратитесь к администратору для активации.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'nodes' && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest px-2">Доступные серверы</h3>
            {[
              { id: 'de', name: 'Германия, Франкфурт', ping: '42ms', flag: '🇩🇪', active: true },
              { id: 'nl', name: 'Нидерланды, Амстердам', ping: '38ms', flag: '🇳🇱', active: false },
              { id: 'tr', name: 'Турция, Стамбул', ping: '65ms', flag: '🇹🇷', active: false }
            ].map((node) => (
              <div key={node.id} className={`flex items-center justify-between p-5 rounded-3xl border transition-all ${node.active ? 'bg-slate-900 border-cyan-500/50 shadow-lg shadow-cyan-500/5' : 'bg-slate-900/50 border-slate-800 opacity-60'}`}>
                <div className="flex items-center space-x-4">
                  <span className="text-2xl">{node.flag}</span>
                  <div>
                    <p className="font-bold text-sm">{node.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">{node.ping}</p>
                  </div>
                </div>
                {node.active ? (
                  <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-700" />
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'speed' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 py-10 text-center">
            <div className="w-32 h-32 rounded-full border-8 border-slate-900 border-t-cyan-500 mx-auto flex items-center justify-center animate-spin duration-[3000ms]">
              <Zap className="w-10 h-10 text-cyan-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black">ТЕСТ СКОРОСТИ</h2>
              <p className="text-slate-500 text-sm mt-2">Функция будет доступна в следующем обновлении</p>
            </div>
          </div>
        )}

        {activeTab === 'support' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center py-10">
            <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-10 h-10 text-cyan-500" />
            </div>
            <h2 className="text-2xl font-black italic">SUPPORT CENTER</h2>
            <p className="text-slate-400 px-8 text-sm leading-relaxed">Нужна помощь с настройкой или оплатой? Наши операторы онлайн 24/7.</p>
            <Button className="bg-cyan-600 hover:bg-cyan-700 w-full max-w-xs mx-auto mt-6 rounded-2xl h-14 text-white font-black shadow-lg shadow-cyan-500/20">
              НАПИСАТЬ В TELEGRAM
            </Button>
          </div>
        )}

        {activeTab === 'info' && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-black mb-4 px-2">КАК ПОДКЛЮЧИТЬСЯ?</h2>
            {[
              { t: 'iOS / macOS', d: 'Скачайте v2rayTun или FoXray', app: 'v2rayTun' },
              { t: 'Android', d: 'Используйте v2rayNG (рекомендуется)', app: 'v2rayNG' },
              { t: 'Windows', d: 'Используйте клиент v2rayN', app: 'v2rayN' }
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-5 bg-slate-900 rounded-3xl border border-slate-800 hover:border-cyan-500/50 transition-colors">
                <div>
                  <p className="font-bold text-sm">{item.t}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">{item.d}</p>
                </div>
                <Button variant="ghost" size="sm" className="text-cyan-500 font-black text-[10px]">КЛИЕНТ</Button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-8 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-slate-950 rounded-2xl flex items-center justify-center border border-slate-800">
                    <Bell className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Уведомления</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Об окончании подписки</p>
                  </div>
                </div>
                <div className="w-12 h-6 bg-cyan-600 rounded-full relative cursor-pointer shadow-inner">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-md"></div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <Button 
                  variant="destructive" 
                  className="w-full h-14 rounded-2xl font-black uppercase tracking-tighter shadow-lg"
                  onClick={async () => {
                    await vpnLogout();
                    router.push('/vpn');
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" /> ВЫЙТИ ИЗ СИСТЕМЫ
                </Button>
              </div>
            </div>
            <p className="text-center text-[8px] text-slate-700 font-black uppercase tracking-widest">
              VPN PRO v4.2.0 • 2026 Edition
            </p>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-8 pt-4 pointer-events-none">
        <div className="max-w-md mx-auto bg-slate-900/95 backdrop-blur-2xl border border-slate-800 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] rounded-[2.5rem] flex justify-around items-center px-3 py-3 pointer-events-auto">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`flex flex-col items-center justify-center p-3 transition-all duration-300 relative rounded-2xl ${
                activeTab === item.id 
                  ? 'text-cyan-400 bg-cyan-500/5' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'fill-cyan-500/10' : ''}`} />
              <span className="text-[8px] mt-1 font-black uppercase tracking-tighter">{item.label}</span>
              {activeTab === item.id && (
                <span className="absolute -bottom-1 w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_12px_rgba(34,211,238,1)]" />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
