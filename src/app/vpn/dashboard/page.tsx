
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getVpnMe, vpnLogout } from '@/actions/vpn-actions';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Key, 
  Calendar, 
  Activity, 
  Copy, 
  LogOut, 
  RefreshCw,
  Shield,
  User,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function VpnDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const me = await getVpnMe();
    if (!me) {
      router.push('/vpn');
      return;
    }
    setData(me);
    setLoading(false);
  }

  const copyKey = (link: string) => {
    navigator.clipboard.writeText(link);
    toast({ title: "Скопировано", description: "VLESS ключ скопирован в буфер обмена" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 space-y-6">
        <Skeleton className="h-12 w-48 bg-slate-900" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-40 bg-slate-900" />
          <Skeleton className="h-40 bg-slate-900" />
          <Skeleton className="h-40 bg-slate-900" />
        </div>
      </div>
    );
  }

  const vpnLink = data.vpn?.links?.[0] || "";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <Shield className="w-8 h-8 text-cyan-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">VPN Dashboard</h1>
              <p className="text-slate-400 text-sm flex items-center">
                <User className="w-3 h-3 mr-1" /> {data.username} ({data.role})
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={loadData} className="bg-slate-900 border-slate-800">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="destructive" size="sm" onClick={async () => { await vpnLogout(); router.push('/vpn'); }}>
              <LogOut className="w-4 h-4 mr-2" /> Выйти
            </Button>
          </div>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardContent className="pt-6 flex items-center space-x-4">
              <div className="p-3 bg-emerald-500/10 rounded-full">
                <Activity className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Статус</p>
                <h3 className="text-xl font-bold">{data.vpn?.status === 'active' ? 'Активен' : 'Отключен'}</h3>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardContent className="pt-6 flex items-center space-x-4">
              <div className="p-3 bg-cyan-500/10 rounded-full">
                <Calendar className="w-6 h-6 text-cyan-500" />
              </div>
              <div>
                <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Истекает</p>
                <h3 className="text-xl font-bold">
                  {data.vpn?.expire ? new Date(data.vpn.expire * 1000).toLocaleDateString() : 'Бессрочно'}
                </h3>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardContent className="pt-6 flex items-center space-x-4">
              <div className="p-3 bg-purple-500/10 rounded-full">
                <Key className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Ключи</p>
                <h3 className="text-xl font-bold">{data.vpn?.links?.length || 0} шт.</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 bg-slate-900 border-slate-800 text-white shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <ExternalLink className="w-5 h-5 mr-2 text-cyan-500" /> Ваши ключи доступа
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {vpnLink ? (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg break-all font-mono text-xs text-slate-300 relative group">
                    {vpnLink}
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900"
                      onClick={() => copyKey(vpnLink)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex justify-center p-6 bg-white rounded-xl">
                    <QRCodeSVG value={vpnLink} size={200} />
                  </div>
                  <div className="text-center">
                    <Button onClick={() => copyKey(vpnLink)} className="bg-cyan-600 hover:bg-cyan-700">
                      <Copy className="w-4 h-4 mr-2" /> Копировать VLESS ключ
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-slate-500">
                  У вас пока нет активных ключей. Обратитесь к администратору.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 text-white shadow-xl h-fit">
            <CardHeader>
              <CardTitle className="text-lg">Инструкция</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-400 space-y-4">
              <p>1. Скачайте приложение <b>V2Ray</b> или <b>v2rayNG</b> для вашего устройства.</p>
              <p>2. Нажмите кнопку "Копировать VLESS ключ" выше.</p>
              <p>3. В приложении выберите "Импорт из буфера обмена".</p>
              <p>4. Нажмите кнопку подключения.</p>
              <div className="pt-4 p-3 bg-cyan-500/5 rounded-lg border border-cyan-500/10">
                <p className="text-cyan-500 font-semibold">Нужна помощь?</p>
                <p className="text-xs mt-1">Свяжитесь с поддержкой в Telegram: @biohub_support</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
