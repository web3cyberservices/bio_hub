
import { auth, signOut } from '@/auth';
import { redirect } from 'next/navigation';
import { 
  Activity, 
  Database, 
  Terminal, 
  Zap, 
  ShieldCheck,
  Server,
  Network,
  LogOut,
  User as UserIcon,
  Cpu
} from 'lucide-react';

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/portal');
  }

  const user = session.user as any;

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <header className="border-b border-white/5 bg-black/50 backdrop-blur-sm sticky top-14 z-40">
        <div className="container mx-auto px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-500 border-b-2 border-blue-500 py-3.5">
              ОБЗОР СИСТЕМЫ
            </div>
            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              ИНФРАСТРУКТУРА
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
              <UserIcon className="w-3 h-3" />
              {user.email}
            </div>
            <form action={async () => {
              'use server';
              await signOut();
            }}>
              <button className="flex items-center gap-1 text-[9px] font-black uppercase text-red-500 hover:text-red-400 transition-colors">
                <LogOut className="w-3 h-3" /> ВЫХОД
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* User Status Card */}
          <div className="lg:col-span-4 ui-card p-6 space-y-6">
             <div className="technical-label">СТАТУС ТЕНАНТА</div>
             <div className="space-y-4 font-mono text-[10px]">
                <div className="flex justify-between border-b border-white/5 pb-2">
                   <span className="text-muted-foreground">ID_КЛИЕНТА:</span>
                   <span className="text-white">{user.id.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                   <span className="text-muted-foreground">РОЛЬ:</span>
                   <span className="text-blue-500">{user.role.toUpperCase()}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                   <span className="text-muted-foreground">gRPC_КВОТА:</span>
                   <span className="text-green-500">{user.grpcQuota.toLocaleString()} REQ/MO</span>
                </div>
             </div>
             <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-sm">
                <div className="text-[9px] font-black text-blue-500 uppercase mb-2">АКТИВНЫЙ ПЛАН</div>
                <p className="text-[10px] text-white/80 font-bold uppercase leading-relaxed">
                   ENTERPRISE BARE-METAL ACCESS
                </p>
             </div>
          </div>

          {/* Infrastructure Metrics */}
          <div className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: 'Latency p99', val: '1.2ms', icon: <Zap className="w-3.5 h-3.5" /> },
                { label: 'Active Streams', val: '42', icon: <Activity className="w-3.5 h-3.5" /> },
                { label: 'Uptime', val: '99.999%', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
              ].map((stat, i) => (
                <div key={i} className="ui-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-white/40">{stat.icon}</span>
                    <span className="technical-label">{stat.label}</span>
                  </div>
                  <div className="text-xl font-mono font-bold">{stat.val}</div>
                </div>
              ))}
            </div>

            <div className="ui-card p-6 h-[300px] flex flex-col justify-center items-center text-center bg-grid">
               <Cpu className="w-8 h-8 text-white/10 mb-4" />
               <div className="technical-label text-white/40">ОЖИДАНИЕ ДАННЫХ ТЕЛЕМЕТРИИ...</div>
               <div className="text-[9px] font-mono text-muted-foreground mt-2">ПОДКЛЮЧИТЕСЬ К eu-telemetry.web3cyberservices.xyz:443</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
