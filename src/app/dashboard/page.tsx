
import { auth, signOut } from '@/auth';
import { redirect } from 'next/navigation';
import { 
  Server, 
  Activity, 
  Shield, 
  Cpu, 
  Network, 
  LogOut,
  Terminal,
  Database,
  Lock
} from 'lucide-react';

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/portal');
  }

  const user = session.user as any;

  return (
    <div className="min-h-screen bg-black text-white font-mono selection:bg-blue-500/30">
      {/* Sub-Header */}
      <div className="border-b border-white/5 bg-white/[0.02] px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[10px] text-blue-500 font-black uppercase tracking-widest">
            <Activity className="w-3 h-3" /> СИСТЕМА: ONLINE
          </div>
          <div className="h-3 w-px bg-white/10" />
          <div className="text-[9px] text-muted-foreground uppercase tracking-widest">
            NODE_ID: {user.id.split('-')[0]}
          </div>
        </div>
        
        <form action={async () => {
          'use server';
          await signOut();
        }}>
          <button className="flex items-center gap-2 text-[9px] font-black uppercase text-red-500 hover:text-white transition-colors">
            <LogOut className="w-3 h-3" /> ЗАВЕРШИТЬ СЕССИЮ
          </button>
        </form>
      </div>

      <main className="container mx-auto max-w-7xl px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Tenant Status */}
          <div className="lg:col-span-4 space-y-8">
            <div className="border border-white/10 p-6 space-y-6">
              <div className="flex items-center gap-2 text-white/40 text-[9px] font-black uppercase tracking-widest">
                <Shield className="w-3.5 h-3.5" /> КОНФИГУРАЦИЯ ТЕНАНТА
              </div>
              
              <div className="space-y-4 text-[10px]">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-muted-foreground uppercase">EMAIL:</span>
                  <span className="text-white">{user.email}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-muted-foreground uppercase">ROLE_LEVEL:</span>
                  <span className="text-blue-500 font-bold uppercase">{user.role}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-muted-foreground uppercase">gRPC_QUOTA:</span>
                  <span className="text-green-500 font-bold">{user.grpcQuota.toLocaleString()} REQ/MO</span>
                </div>
              </div>

              <div className="bg-blue-500/5 border border-blue-500/10 p-4">
                <div className="text-[9px] font-black text-blue-500 uppercase mb-2 flex items-center gap-2">
                  <Lock className="w-3 h-3" /> ТИП ДОСТУПА
                </div>
                <p className="text-[10px] text-white/60 leading-relaxed uppercase">
                  ENTERPRISE_BARE_METAL_NODE
                </p>
              </div>
            </div>

            <div className="border border-white/10 p-6 space-y-4">
               <div className="flex items-center gap-2 text-white/40 text-[9px] font-black uppercase tracking-widest">
                <Network className="w-3.5 h-3.5" /> СТАТУС ЭНДПОИНТОВ
              </div>
              <div className="space-y-2 text-[9px]">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">eu-telemetry.xyz</span>
                  <span className="text-green-500 font-bold">200 OK</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">eth-rpc.xyz</span>
                  <span className="text-green-500 font-bold">200 OK</span>
                </div>
              </div>
            </div>
          </div>

          {/* Infrastructure Overview */}
          <div className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'LATENCY_P99', val: '0.82ms', icon: <Cpu className="w-3.5 h-3.5 text-blue-500" /> },
                { label: 'THROUGHPUT', val: '14.2 GB/s', icon: <Database className="w-3.5 h-3.5 text-blue-500" /> },
                { label: 'NODE_UPTIME', val: '99.999%', icon: <Activity className="w-3.5 h-3.5 text-blue-500" /> },
              ].map((item, i) => (
                <div key={i} className="border border-white/10 p-5 bg-white/[0.01]">
                  <div className="flex items-center gap-2 mb-3">
                    {item.icon}
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{item.label}</span>
                  </div>
                  <div className="text-xl font-bold tracking-tight text-white">{item.val}</div>
                </div>
              ))}
            </div>

            <div className="border border-white/10 p-8 min-h-[350px] flex flex-col items-center justify-center text-center bg-grid">
              <Terminal className="w-10 h-10 text-white/5 mb-6" />
              <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">
                ОЖИДАНИЕ ВХОДЯЩИХ ТЕЛЕМЕТРИЧЕСКИХ ДАННЫХ
              </div>
              <div className="mt-4 p-2 bg-white/5 border border-white/10">
                <code className="text-[9px] text-blue-400">
                  gRPC_STREAM_READY: LISTEN 0.0.0.0:443
                </code>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
