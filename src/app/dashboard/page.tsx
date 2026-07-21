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
  Menu,
  MoreVertical,
  HelpCircle,
  MessageSquare
} from 'lucide-react';
import { getVpnMe, vpnLogout } from '@/actions/vpn-actions';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';

type Tab = 'status' | 'keys' | 'nodes' | 'speed' | 'chat' | 'help' | 'settings';

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
    toast({ title: "Success", description: "VLESS link copied to clipboard" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#02040a] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  const vpnLink = vpnData?.vpn?.links?.[0] || "";

  const navItems = [
    { id: 'status', icon: Activity, label: 'Status' },
    { id: 'keys', icon: Key, label: 'Keys' },
    { id: 'nodes', icon: Globe, label: 'Nodes' },
    { id: 'speed', icon: Zap, label: 'Speed' },
    { id: 'chat', icon: MessageSquare, label: 'Chat' },
    { id: 'help', icon: HelpCircle, label: 'Help' },
    { id: 'settings', icon: Settings, label: 'More' }
  ];

  return (
    <div className="min-h-screen bg-[#02040a] text-slate-100 font-sans selection:bg-cyan-500/20 pb-32">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 bg-[#02040a]/70 backdrop-blur-2xl border-b border-white/5 px-6 py-5">
        <div className="max-w-xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/10">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black italic leading-none">VPN <span className="text-cyan-400">PRO</span></h1>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Enterprise Tunnel v2.5</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
             <button onClick={loadData} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
               <RefreshCw className="w-4 h-4 text-cyan-400" />
             </button>
             <button className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
               <MoreVertical className="w-4 h-4 text-slate-400" />
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto p-6 space-y-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'status' && (
              <div className="space-y-6">
                <Card className="glass-panel rounded-[2.5rem] border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full -mr-16 -mt-16" />
                  <CardContent className="p-10 text-center relative z-10">
                    <div className="mb-8 relative inline-block">
                      <div className={`w-40 h-40 rounded-full border-4 flex items-center justify-center transition-all duration-700 ${vpnData?.vpn?.status === 'active' ? 'border-cyan-500/20 bg-cyan-500/5 shadow-[0_0_40px_rgba(6,182,212,0.1)]' : 'border-red-500/20 bg-red-500/5'}`}>
                        <Lock className={`w-14 h-14 ${vpnData?.vpn?.status === 'active' ? 'text-cyan-400' : 'text-red-500'}`} />
                      </div>
                      {vpnData?.vpn?.status === 'active' && (
                        <div className="absolute top-4 right-4 w-6 h-6 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,211,238,0.8)] border-4 border-[#02040a]" />
                      )}
                    </div>
                    <h2 className="text-3xl font-black mb-2 uppercase italic tracking-tighter">
                      {vpnData?.vpn?.status === 'active' ? 'System Secured' : 'Unprotected'}
                    </h2>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em] mb-10">Reality-V2 Protocol • Encrypted</p>
                    
                    <div className="grid grid-cols-2 gap-8 pt-10 border-t border-white/5">
                       <div className="text-left">
                          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2">Service Period</p>
                          <p className="text-base font-bold text-white">
                            {vpnData?.vpn?.expire ? new Date(vpnData.vpn.expire * 1000).toLocaleDateString() : 'Unlimited'}
                          </p>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2">Traffic Balance</p>
                          <p className="text-base font-bold text-cyan-400">Unlimited GB</p>
                       </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-panel p-6 rounded-3xl group hover:border-cyan-500/20 transition-all">
                    <Download className="w-5 h-5 text-emerald-400 mb-4" />
                    <p className="text-2xl font-black">128.4 <span className="text-[10px] font-normal text-slate-500">Mbps</span></p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Real-time Down</p>
                  </div>
                  <div className="glass-panel p-6 rounded-3xl group hover:border-blue-500/20 transition-all">
                    <Upload className="w-5 h-5 text-blue-400 mb-4" />
                    <p className="text-2xl font-black">45.2 <span className="text-[10px] font-normal text-slate-500">Mbps</span></p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Real-time Up</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'keys' && (
              <div className="space-y-6">
                <Card className="glass-panel rounded-[2.5rem] border-white/5 overflow-hidden">
                  <CardContent className="p-10 text-center space-y-8">
                    {vpnLink ? (
                      <>
                        <div className="inline-block p-6 bg-white rounded-[2rem] shadow-2xl">
                          <QRCodeSVG value={vpnLink} size={200} />
                        </div>
                        <div className="space-y-3">
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Your Private VLESS Key</p>
                          <div className="p-4 bg-black/60 border border-white/10 rounded-2xl break-all font-mono text-[10px] text-slate-400 leading-relaxed text-left relative group">
                            {vpnLink}
                            <button 
                              onClick={() => copyKey(vpnLink)}
                              className="absolute top-2 right-2 p-2 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <Button 
                          onClick={() => copyKey(vpnLink)} 
                          className="w-full bg-cyan-600 hover:bg-cyan-500 h-16 rounded-2xl text-white font-bold text-lg cyber-button shadow-xl shadow-cyan-950"
                        >
                          <Copy className="w-5 h-5 mr-3" /> Copy VLESS Configuration
                        </Button>
                      </>
                    ) : (
                      <div className="py-24 text-slate-600 italic font-medium">Infrastructure initializing... No keys found.</div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'nodes' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] px-2 mb-4">Premium Nodes</h3>
                {[
                  { name: 'Germany Core', city: 'Frankfurt', ping: '38ms', flag: '🇩🇪', load: '12%', active: true },
                  { name: 'Netherlands Main', city: 'Amsterdam', ping: '42ms', flag: '🇳🇱', load: '24%', active: false },
                  { name: 'Turkey Edge', city: 'Istanbul', ping: '61ms', flag: '🇹🇷', load: '45%', active: false },
                  { name: 'USA West', city: 'San Francisco', ping: '142ms', flag: '🇺🇸', load: '8%', active: false }
                ].map((node) => (
                  <div key={node.name} className={`p-6 rounded-3xl border transition-all cursor-pointer ${node.active ? 'bg-cyan-500/5 border-cyan-500/40 shadow-lg shadow-cyan-950/20' : 'bg-slate-900/40 border-white/5 hover:border-white/10'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-5">
                        <span className="text-3xl filter saturate-[0.8]">{node.flag}</span>
                        <div>
                          <p className="font-bold text-lg text-white">{node.name}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{node.city} • LOAD: {node.load}</p>
                        </div>
                      </div>
                      <div className="text-right flex items-center space-x-3">
                        <div className={`w-1.5 h-1.5 rounded-full ${node.active ? 'bg-cyan-400' : 'bg-slate-700'}`} />
                        <p className={`text-sm font-black tracking-tighter ${node.active ? 'text-cyan-400' : 'text-slate-500'}`}>{node.ping}</p>
                        <ChevronRight className="w-4 h-4 text-slate-700" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="glass-panel p-8 rounded-[2rem] space-y-6">
                  <div className="space-y-4">
                     <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Account Control</h3>
                     <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                        <div className="flex items-center space-x-4">
                           <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400">
                              <User className="w-5 h-5" />
                           </div>
                           <div>
                              <p className="text-sm font-bold">{vpnData?.username}</p>
                              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">{vpnData?.role} Level Account</p>
                           </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-cyan-400 hover:bg-cyan-500/10">Edit</Button>
                     </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">System Config</h3>
                    {[
                      { label: 'Smart Notifications', icon: RefreshCw, active: true },
                      { label: 'Auto Kill Switch', icon: Shield, active: false },
                      { label: 'UDP Acceleration', icon: Zap, active: true }
                    ].map((opt) => (
                      <div key={opt.label} className="flex items-center justify-between p-4 bg-white/20 rounded-2xl border border-white/5">
                        <div className="flex items-center space-x-4">
                          <opt.icon className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-bold">{opt.label}</span>
                        </div>
                        <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${opt.active ? 'bg-cyan-600' : 'bg-slate-800'}`}>
                          <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${opt.active ? 'right-1' : 'left-1'}`} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button 
                    variant="destructive" 
                    className="w-full h-14 rounded-2xl mt-4 bg-red-500/10 text-red-500 border-0 hover:bg-red-500/20 font-bold"
                    onClick={async () => {
                      await vpnLogout();
                      router.push('/vpn');
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Terminate Session
                  </Button>
                </div>
              </div>
            )}
            
            {/* Speed, Chat, Help Tabs can be added here with similar glass-panel styles */}
            {['speed', 'chat', 'help'].includes(activeTab) && (
              <div className="glass-panel p-20 rounded-[2.5rem] text-center italic text-slate-600">
                Module under synchronization...
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Futuristic Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 p-6 flex justify-center">
        <div className="bg-[#0f172a]/80 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] flex justify-between items-center px-4 py-3 shadow-2xl w-full max-w-md">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all relative ${activeTab === item.id ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <item.icon className={`w-5 h-5 transition-transform ${activeTab === item.id ? 'scale-110' : ''}`} />
              <span className={`text-[8px] font-black uppercase tracking-tighter mt-1.5 ${activeTab === item.id ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>{item.label}</span>
              {activeTab === item.id && (
                <motion.div layoutId="nav-active" className="absolute -bottom-1 w-1 h-1 bg-cyan-400 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}