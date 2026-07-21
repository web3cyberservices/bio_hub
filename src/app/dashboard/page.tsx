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
  LayoutGrid,
  MessageSquare
} from 'lucide-react';
import { useUser } from '@/firebase';
import { getVpnMe, vpnLogout } from '@/actions/vpn-actions';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { QRCodeSVG } from 'qrcode.react';

type Tab = 'status' | 'keys' | 'help' | 'settings' | 'chats';

export default function VpnDashboard() {
  const { user, loading: authLoading } = useUser();
  const [activeTab, setActiveTab] = useState<Tab>('status');
  const [vpnData, setVpnData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    async function loadData() {
      const data = await getVpnMe();
      if (!data) {
        router.push('/vpn');
        return;
      }
      setVpnData(data);
      setLoading(false);
    }
    if (!authLoading) {
      loadData();
    }
  }, [authLoading, router]);

  const copyKey = (link: string) => {
    if (!link) return;
    navigator.clipboard.writeText(link);
    toast({ title: "Скопировано", description: "Ключ доступа скопирован в буфер обмена" });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 space-y-4">
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
    { id: 'chats', icon: MessageSquare, label: 'Поддержка' },
    { id: 'help', icon: HelpCircle, label: 'Инфо' },
    { id: 'settings', icon: Settings, label: 'Опции' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 pb-24 text-slate-100">
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Shield className="w-6 h-6 text-cyan-500" />
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            VPN PRO
          </h1>
        </div>
        <div className="text-xs text-slate-500 font-mono">{vpnData.username}</div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {activeTab === 'status' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800 shadow-2xl overflow-hidden">
              <CardContent className="p-8 text-center">
                <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${vpnData.vpn?.status === 'active' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                  <Activity className={`w-10 h-10 ${vpnData.vpn?.status === 'active' ? 'text-emerald-500' : 'text-red-500'}`} />
                </div>
                <h2 className="text-2xl font-bold">{vpnData.vpn?.status === 'active' ? 'Соединение активно' : 'Требуется продление'}</h2>
                <p className="text-slate-400 text-sm mt-2">
                  Истекает: {vpnData.vpn?.expire ? new Date(vpnData.vpn.expire * 1000).toLocaleDateString() : 'Бессрочно'}
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
                <p className="text-xs text-slate-500 uppercase font-bold">Сервер</p>
                <p className="text-lg font-bold text-cyan-400">Германия</p>
              </div>
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
                <p className="text-xs text-slate-500 uppercase font-bold">Протокол</p>
                <p className="text-lg font-bold text-purple-400">VLESS</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'keys' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-lg">Ваш ключ доступа</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {vpnLink ? (
                  <div className="space-y-6">
                    <div className="flex justify-center p-4 bg-white rounded-2xl">
                      <QRCodeSVG value={vpnLink} size={180} />
                    </div>
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl break-all font-mono text-[10px] text-slate-400">
                      {vpnLink}
                    </div>
                    <Button onClick={() => copyKey(vpnLink)} className="w-full bg-cyan-600 hover:bg-cyan-700 h-12 rounded-xl">
                      <Copy className="w-4 h-4 mr-2" /> Копировать ключ
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-10 space-y-4">
                    <Zap className="w-12 h-12 text-slate-700 mx-auto" />
                    <p className="text-slate-500">Ключи пока не созданы</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'chats' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center py-10">
            <MessageSquare className="w-16 h-16 text-cyan-500/20 mx-auto mb-4" />
            <h2 className="text-xl font-bold">Поддержка пользователей</h2>
            <p className="text-slate-400">Если у вас возникли проблемы с подключением, напишите нашему боту.</p>
            <Button className="bg-cyan-600 hover:bg-cyan-700 w-full max-w-xs mx-auto">
              Открыть Telegram чат
            </Button>
          </div>
        )}

        {activeTab === 'help' && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold mb-4">Инструкция по установке</h2>
            {[
              { t: 'iOS / macOS', d: 'Используйте v2rayTun или FoXray' },
              { t: 'Android', d: 'Используйте v2rayNG' },
              { t: 'Windows', d: 'Используйте v2rayN' }
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl border border-slate-800">
                <div>
                  <p className="font-bold">{item.t}</p>
                  <p className="text-xs text-slate-500">{item.d}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold">Уведомления</p>
                  <p className="text-xs text-slate-500">О сроке подписки в Telegram</p>
                </div>
                <div className="w-10 h-6 bg-cyan-600 rounded-full relative">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
              <Button 
                variant="destructive" 
                className="w-full h-12 rounded-xl"
                onClick={async () => {
                  await vpnLogout();
                  router.push('/vpn');
                }}
              >
                <LogOut className="w-4 h-4 mr-2" /> Выйти из аккаунта
              </Button>
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2 pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto bg-slate-900/90 backdrop-blur-xl border border-slate-800 shadow-2xl rounded-3xl flex justify-around items-center px-2 py-2">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`flex flex-col items-center justify-center p-3 transition-all duration-300 relative ${
                activeTab === item.id 
                  ? 'text-cyan-400 scale-110' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
              {activeTab === item.id && (
                <span className="absolute -bottom-1 w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
