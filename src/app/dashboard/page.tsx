
import { auth, signOut } from '@/auth';
import { redirect } from 'next/navigation';
import { 
  Activity, 
  Shield, 
  Cpu, 
  Network, 
  LogOut,
  Terminal,
  Database,
  Lock,
  ArrowUpRight,
  Clock
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/portal');
  }

  const user = session.user as any;

  // Данные телеметрии для визуализации
  const recentPings = [
    { ts: new Date().toISOString(), latency: '0.42ms', protocol: 'gRPC', status: 'OK', origin: 'EU-WEST-1' },
    { ts: new Date(Date.now() - 1000).toISOString(), latency: '0.38ms', protocol: 'gRPC', status: 'OK', origin: 'EU-WEST-1' },
    { ts: new Date(Date.now() - 5000).toISOString(), latency: '1.12ms', protocol: 'JSON-RPC', status: 'OK', origin: 'ASIA-SOUTH' },
    { ts: new Date(Date.now() - 10000).toISOString(), latency: '0.45ms', protocol: 'gRPC', status: 'OK', origin: 'EU-WEST-1' },
    { ts: new Date(Date.now() - 15000).toISOString(), latency: '0.41ms', protocol: 'gRPC', status: 'OK', origin: 'EU-WEST-1' },
  ];

  return (
    <div className="min-h-screen bg-black text-white font-mono selection:bg-blue-500/30">
      {/* Техническая панель управления */}
      <div className="border-b border-white/10 bg-white/[0.02] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-[9px] text-blue-500 font-black uppercase tracking-widest">
            <Activity className="w-3.5 h-3.5" /> СИСТЕМА: АКТИВНА
          </div>
          <div className="h-4 w-px bg-white/10" />
          <div className="text-[9px] text-muted-foreground uppercase tracking-widest">
            NODE_INSTANCE: {user.id ? user.id.split('-')[0] : 'UNKNOWN'}
          </div>
        </div>
        
        <form action={async () => {
          'use server';
          await signOut();
        }}>
          <button className="flex items-center gap-2 text-[9px] font-black uppercase text-red-500 hover:text-white transition-colors">
            <LogOut className="w-3.5 h-3.5" /> ОТКЛЮЧИТЬ УЗЕЛ
          </button>
        </form>
      </div>

      <main className="container mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Конфигурация клиента */}
          <div className="lg:col-span-4 space-y-8">
            <div className="border border-white/10 p-8 space-y-8 bg-white/[0.01]">
              <div className="flex items-center gap-2 text-white/40 text-[9px] font-black uppercase tracking-[0.3em]">
                <Shield className="w-4 h-4" /> КОНФИГУРАЦИЯ ТЕНАНТА
              </div>
              
              <div className="space-y-6 text-[10px]">
                <div className="flex justify-between border-b border-white/5 pb-3">
                  <span className="text-muted-foreground uppercase tracking-widest">EMAIL:</span>
                  <span className="text-white">{user.email}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-3">
                  <span className="text-muted-foreground uppercase tracking-widest">ROLE_LEVEL:</span>
                  <span className="text-blue-500 font-bold uppercase">{user.role}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-3">
                  <span className="text-muted-foreground uppercase tracking-widest">gRPC_QUOTA:</span>
                  <span className="text-green-500 font-bold">{user.grpcQuota?.toLocaleString()} REQ/MO</span>
                </div>
              </div>

              <div className="bg-blue-500/5 border border-blue-500/10 p-5 rounded-sm">
                <div className="text-[9px] font-black text-blue-500 uppercase mb-3 flex items-center gap-2 tracking-widest">
                  <Lock className="w-3.5 h-3.5" /> ТИП ДОСТУПА
                </div>
                <p className="text-[10px] text-white/60 leading-relaxed uppercase font-bold">
                  DEDICATED_BARE_METAL_INFRASTRUCTURE
                </p>
              </div>
            </div>

            <div className="border border-white/10 p-8 space-y-6 bg-white/[0.01]">
               <div className="flex items-center gap-2 text-white/40 text-[9px] font-black uppercase tracking-[0.3em]">
                <Network className="w-4 h-4" /> АКТИВНЫЕ ЭНДПОИНТЫ
              </div>
              <div className="space-y-3 text-[10px]">
                {[
                  { name: 'eu-telemetry.xyz', status: 'ACTIVE' },
                  { name: 'eth-rpc.xyz', status: 'ACTIVE' },
                  { name: 'mempool-b2b.xyz', status: 'ACTIVE' }
                ].map((ep) => (
                  <div key={ep.name} className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-muted-foreground">{ep.name}</span>
                    <span className="text-green-500 font-bold text-[9px]">[{ep.status}]</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Метрики инфраструктуры */}
          <div className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'LATENCY_P99', val: '0.82ms', icon: <Cpu className="w-4 h-4 text-blue-500" /> },
                { label: 'THROUGHPUT', val: '14.2 GB/s', icon: <Database className="w-4 h-4 text-blue-500" /> },
                { label: 'UPTIME_SLA', val: '99.999%', icon: <Activity className="w-4 h-4 text-blue-500" /> },
              ].map((item, i) => (
                <div key={i} className="border border-white/10 p-6 bg-white/[0.02]">
                  <div className="flex items-center gap-2 mb-4">
                    {item.icon}
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">{item.label}</span>
                  </div>
                  <div className="text-2xl font-black tracking-tighter text-white">{item.val}</div>
                </div>
              ))}
            </div>

            {/* Таблица телеметрии */}
            <div className="border border-white/10 bg-white/[0.01] overflow-hidden rounded-sm">
              <div className="bg-white/5 px-8 py-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-white">
                  <Clock className="w-3.5 h-3.5 text-blue-500" /> LIVE_TELEMETRY_STREAM
                </div>
                <div className="text-[9px] text-green-500 font-black animate-pulse uppercase">LISTENING...</div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[9px] border-collapse">
                  <thead>
                    <tr className="text-muted-foreground border-b border-white/10">
                      <th className="px-8 py-4 font-black uppercase tracking-widest">TIMESTAMP</th>
                      <th className="px-8 py-4 font-black uppercase tracking-widest">LATENCY</th>
                      <th className="px-8 py-4 font-black uppercase tracking-widest">PROTOCOL</th>
                      <th className="px-8 py-4 font-black uppercase tracking-widest">STATUS</th>
                      <th className="px-8 py-4 font-black uppercase tracking-widest">ORIGIN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {recentPings.map((ping, i) => (
                      <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-8 py-4 text-white/60">{ping.ts}</td>
                        <td className="px-8 py-4 text-blue-400 font-bold">{ping.latency}</td>
                        <td className="px-8 py-4 text-white/80">{ping.protocol}</td>
                        <td className="px-8 py-4 text-green-500">
                          <span className="flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-green-500" /> {ping.status}
                          </span>
                        </td>
                        <td className="px-8 py-4 text-white/40">{ping.origin}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-8 border-t border-white/10 flex justify-center">
                <button className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-500 hover:text-white transition-colors flex items-center gap-2">
                  ПОСМОТРЕТЬ ВСЕ ЛОГИ <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
