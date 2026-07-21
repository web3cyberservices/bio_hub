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
  ChevronRight
} from 'lucide-react';
import { getVpnMe, vpnLogout } from '@/actions/vpn-actions';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';

type Tab = 'status' | 'keys' | 'nodes' | 'settings';

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
    toast({ title: "Успех", description: "VLESS ключ скопирован" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#02040a] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  const vpnLink = vpnData?.vpn?.links?.[0] || "";

  return (
    <div className="min-h-screen bg-[#02040a] text-slate-100 selection:bg-cyan-500/30 font-sans">
      <header className="sticky top-0 z-50 bg-[#02040a]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-black tracking-tight italic">VPN <span className="text-cyan-400">PRO</span></h1>
        </div>
        <button onClick={loadData} className="p-2 hover:bg-white/5 rounded-full transition-colors">
          <RefreshCw className="w-4 h-4 text-slate-400" />
        </button>
      </header>

      <main className="max-w-md mx-auto p-6 pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'status' && (
              <div className="space-y-6">
                <Card className="glass-card rounded-3xl overflow-hidden border-white/5">
                  <CardContent className="p-8 text-center">
                    <div className="mb-6 relative inline-block">
                      <div className={`w-32 h-32 rounded-full border-2 flex items-center justify-center transition-colors duration-500 ${vpnData?.vpn?.status === 'active' ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                        <Lock className={`w-10 h-10 ${vpnData?.vpn?.status === 'active' ? 'text-emerald-500' : 'text-red-500'}`} />
                      </div>
                      {vpnData?.vpn?.status === 'active' && (
                        <div className="absolute top-2 right-2 w-4 h-4 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)]" />
                      )}
                    </div>
                    <h2 className="text-2xl font-black mb-1 uppercase tracking-tighter">
                      {vpnData?.vpn?.status === 'active' ? 'Protected' : 'Disconnected'}
                    </h2>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Reality V2 Protocol</p>
                    
                    <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 gap-4 text-left">
                       <div>
                          <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Expires</p>
                          <p className="text-sm font-bold">
                            {vpnData?.vpn?.expire ? new Date(vpnData.vpn.expire * 1000).toLocaleDateString() : 'Never'}
                          </p>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Traffic</p>
                          <p className="text-sm font-bold text-cyan-400">Unlimited</p>
                       </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-card p-5 rounded-2xl">
                    <Download className="w-4 h-4 text-emerald-500 mb-2" />
                    <p className="text-xl font-black">42.8 <span className="text-[10px] font-normal text-slate-500">Mb/s</span></p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Download</p>
                  </div>
                  <div className="glass-card p-5 rounded-2xl">
                    <Upload className="w-4 h-4 text-blue-500 mb-2" />
                    <p className="text-xl font-black">18.4 <span className="text-[10px] font-normal text-slate-500">Mb/s</span></p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Upload</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'keys' && (
              <div className="space-y-6">
                <Card className="glass-card rounded-3xl overflow-hidden border-white/5">
                  <CardContent className="p-8 text-center space-y-6">
                    {vpnLink ? (
                      <>
                        <div className="inline-block p-4 bg-white rounded-2xl">
                          <QRCodeSVG value={vpnLink} size={180} />
                        </div>
                        <div className="p-3 bg-black/40 border border-white/5 rounded-xl break-all font-mono text-[9px] text-slate-400 text-left">
                          {vpnLink}
                        </div>
                        <Button 
                          onClick={() => copyKey(vpnLink)} 
                          className="w-full bg-cyan-600 hover:bg-cyan-500 h-14 rounded-xl text-white font-bold"
                        >
                          <Copy className="w-4 h-4 mr-2" /> Copy VLESS Link
                        </Button>
                      </>
                    ) : (
                      <div className="py-20 text-slate-600">No active keys found.</div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'nodes' && (
              <div className="space-y-4">
                {[
                  { name: 'Germany', city: 'Frankfurt', ping: '42ms', flag: '🇩🇪', active: true },
                  { name: 'Netherlands', city: 'Amsterdam', ping: '38ms', flag: '🇳🇱', active: false },
                  { name: 'Turkey', city: 'Istanbul', ping: '65ms', flag: '🇹🇷', active: false }
                ].map((node) => (
                  <div key={node.name} className={`p-5 rounded-2xl border transition-all ${node.active ? 'bg-cyan-500/5 border-cyan-500/30' : 'bg-slate-900/40 border-white/5 opacity-50'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-2xl">{node.flag}</span>
                        <div>
                          <p className="font-bold text-white">{node.name}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase">{node.city}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-black ${node.active ? 'text-emerald-400' : 'text-slate-500'}`}>{node.ping}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-4">
                <div className="glass-card p-6 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between p-2">
                    <span className="text-sm font-bold">Smart Notifications</span>
                    <div className="w-10 h-5 bg-cyan-600 rounded-full relative"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" /></div>
                  </div>
                  <div className="flex items-center justify-between p-2">
                    <span className="text-sm font-bold">Auto Kill Switch</span>
                    <div className="w-10 h-5 bg-slate-800 rounded-full relative"><div className="absolute left-1 top-1 w-3 h-3 bg-slate-600 rounded-full" /></div>
                  </div>
                  <Button 
                    variant="destructive" 
                    className="w-full h-12 rounded-xl mt-4 bg-red-500/10 text-red-500 border-0 hover:bg-red-500/20"
                    onClick={async () => {
                      await vpnLogout();
                      router.push('/vpn');
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 p-6 flex justify-center pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/5 rounded-3xl flex justify-around items-center px-4 py-3 pointer-events-auto shadow-2xl w-full max-w-sm">
          {[
            { id: 'status', icon: Activity },
            { id: 'keys', icon: Key },
            { id: 'nodes', icon: Globe },
            { id: 'settings', icon: Settings }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`p-3 rounded-2xl transition-all ${activeTab === item.id ? 'text-cyan-400 bg-cyan-400/5' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <item.icon className="w-5 h-5" />
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}