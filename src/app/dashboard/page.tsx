
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  Zap, 
  ShieldCheck, 
  Terminal, 
  Activity, 
  Search,
  LogOut,
  ChevronRight,
  Database,
  LayoutDashboard,
  Cpu,
  Globe,
  Key,
  CreditCard,
  Settings,
  Plus,
  AlertCircle,
  ShieldAlert
} from 'lucide-react';
import { handleSignOut } from '@/lib/actions/auth';
import { SERVICES } from '@/lib/registry';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/portal');
  }

  const user = session.user as any;

  // Имитация активных услуг для демонстрации
  const activeServiceIds = ['streaming', 'telemetry'];
  const activeServices = SERVICES.filter(s => activeServiceIds.includes(s.id));
  const availableServices = SERVICES.filter(s => !activeServiceIds.includes(s.id));

  return (
    <div className="min-h-screen bg-black text-white font-mono selection:bg-blue-500/30 flex overflow-hidden">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-white/10 hidden lg:flex flex-col bg-[#050505] shrink-0">
        <div className="p-8 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-blue-600 rounded-sm flex items-center justify-center">
              <Database className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-black tracking-[0.2em] uppercase">Console v1.8</span>
          </div>
        </div>
        
        <nav className="flex-1 p-6 space-y-2">
          <div className="technical-label px-4 py-3 mb-2">Управление</div>
          <Link href="/dashboard" className="flex items-center gap-4 px-4 py-3.5 bg-white/5 text-blue-500 text-xs font-black uppercase tracking-widest border border-blue-500/20 rounded-sm">
            <LayoutDashboard className="w-4 h-4" /> Обзор узла
          </Link>
          <Link href="/dashboard/security" className="flex items-center gap-4 px-4 py-3.5 text-muted-foreground hover:text-blue-500 hover:bg-white/5 text-xs font-black uppercase tracking-widest transition-all">
            <ShieldAlert className="w-4 h-4" /> Security Hub
          </Link>
          <a href="#" className="flex items-center gap-4 px-4 py-3.5 text-muted-foreground hover:text-white hover:bg-white/5 text-xs font-black uppercase tracking-widest transition-all">
            <Key className="w-4 h-4" /> API Ключи
          </a>
          <a href="#" className="flex items-center gap-4 px-4 py-3.5 text-muted-foreground hover:text-white hover:bg-white/5 text-xs font-black uppercase tracking-widest transition-all">
            <Globe className="w-4 h-4" /> Сетевой маппинг
          </a>
          
          <div className="technical-label px-4 py-3 mt-8 mb-2">Финансы</div>
          <Link href="/pricing" className="flex items-center gap-4 px-4 py-3.5 text-muted-foreground hover:text-white hover:bg-white/5 text-xs font-black uppercase tracking-widest transition-all">
            <CreditCard className="w-4 h-4" /> Биллинг
          </Link>
          
          <div className="technical-label px-4 py-3 mt-8 mb-2">Система</div>
          <a href="#" className="flex items-center gap-4 px-4 py-3.5 text-muted-foreground hover:text-white hover:bg-white/5 text-xs font-black uppercase tracking-widest transition-all">
            <Settings className="w-4 h-4" /> Конфигурация
          </a>
        </nav>

        <div className="p-6 border-t border-white/10">
          <form action={handleSignOut}>
            <button className="w-full flex items-center gap-4 px-4 py-4 text-red-500 hover:bg-red-500/10 text-xs font-black uppercase tracking-widest transition-all rounded-sm group">
              <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Выход
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-grid relative">
        
        {/* Top Header */}
        <header className="h-20 border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-40 px-10 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-black text-green-500 uppercase tracking-[0.2em]">Node: Online</span>
            </div>
            <div className="h-5 w-px bg-white/10 hidden sm:block" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] hidden sm:block font-bold">Tenant: {user.email}</span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-sm">
              <Cpu className="w-4 h-4 text-blue-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Quota: {(user.grpcQuota / 1000).toFixed(0)}k RPS</span>
            </div>
          </div>
        </header>

        <div className="p-10 max-w-7xl mx-auto space-y-16 pb-32">
          
          {/* Welcome & Stats */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
            <div className="space-y-3">
              <h1 className="text-4xl font-black tracking-tighter uppercase">Infrastructure Overview</h1>
              <p className="technical-label">Centralized Command Console for Distributed High-Load Systems</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full md:w-auto">
              {[
                { label: 'Security Score', val: '84/100', color: 'text-blue-500' },
                { label: 'Active Tunnels', val: activeServices.length.toString(), color: 'text-white' },
                { label: 'Latency', val: '0.12ms', color: 'text-green-500' },
                { label: 'Ingress', val: '2.4 Gbps', color: 'text-white' }
              ].map(stat => (
                <div key={stat.label} className="p-6 border border-white/10 bg-white/[0.02] min-w-[140px]">
                  <div className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mb-2">{stat.label}</div>
                  <div className={`text-xl font-black tracking-tighter ${stat.color}`}>{stat.val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* CyberSecurity Hub Quick Link */}
          <Link href="/dashboard/security" className="block group">
            <div className="p-10 border border-blue-500/30 bg-blue-500/[0.03] group-hover:bg-blue-500/[0.06] transition-all relative overflow-hidden rounded-sm">
              <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 blur-[100px] -mr-40 -mt-40" />
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-8">
                  <div className="p-5 bg-blue-500/10 rounded-sm border border-blue-500/20">
                    <ShieldAlert className="w-10 h-10 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight mb-3">Security Operations Center</h3>
                    <p className="text-xs text-muted-foreground font-bold tracking-widest uppercase leading-relaxed max-w-xl">
                      Real-time threat monitoring, offensive operations, and industrial compliance audits.
                    </p>
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-3 text-blue-500 text-xs font-black uppercase tracking-[0.2em] group-hover:gap-5 transition-all">
                  Open Security Hub <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          </Link>

          {/* Active Services Section */}
          <section className="space-y-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-6">
              <h2 className="text-xs font-black uppercase tracking-[0.4em] flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-green-500" /> Active Nodes
              </h2>
              <span className="text-[10px] text-muted-foreground font-mono tracking-widest uppercase">Total nodes provisioned: {activeServices.length}</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {activeServices.map(service => (
                <div key={service.id} className="border border-white/10 bg-white/[0.01] hover:border-blue-500/30 p-8 relative group overflow-hidden transition-all rounded-sm">
                  <div className="flex justify-between items-start mb-8">
                    <div className="p-3 bg-white/5 rounded-sm border border-white/10">
                      {service.id === 'streaming' ? <Zap className="w-6 h-6 text-blue-500" /> : <Activity className="w-6 h-6 text-blue-500" />}
                    </div>
                    <div className="px-3 py-1 border border-green-500/30 bg-green-500/10 text-[9px] font-black text-green-500 tracking-widest uppercase">
                      Operational
                    </div>
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-tight mb-3">{service.name}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-8 font-medium tracking-wide">
                    {service.desc.substring(0, 120)}...
                  </p>
                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <Link href={service.href} className="text-[10px] font-black text-blue-500 hover:text-blue-400 uppercase tracking-[0.2em] flex items-center gap-2 transition-colors">
                      Manage Endpoint <ChevronRight className="w-4 h-4" />
                    </Link>
                    <span className="text-[9px] text-white/20 font-mono tracking-widest uppercase">ID: {service.id}-TX-25</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Service Catalog */}
          <section id="catalog" className="space-y-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-6">
              <h2 className="text-xs font-black uppercase tracking-[0.4em] flex items-center gap-3">
                <Plus className="w-5 h-5 text-blue-500" /> Infrastructure Marketplace
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {availableServices.map(service => (
                <div key={service.id} className="border border-white/10 bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/30 transition-all p-10 flex flex-col justify-between group rounded-sm">
                  <div>
                    <div className="mb-8 opacity-40 group-hover:opacity-100 transition-opacity">
                      {service.id === 'osint' && <Search className="w-6 h-6 text-purple-500" />}
                      {service.id === 'pentest' && <ShieldCheck className="w-6 h-6 text-red-500" />}
                      {service.id === 'devsecops' && <Terminal className="w-6 h-6 text-green-500" />}
                    </div>
                    <h3 className="text-sm font-black tracking-widest text-white mb-4 uppercase group-hover:text-blue-500 transition-colors">{service.name}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium tracking-wide mb-10">
                      {service.desc.substring(0, 100)}...
                    </p>
                  </div>
                  
                  <Link 
                    href={service.href}
                    className="w-full py-4 bg-white/5 border border-white/10 text-xs font-black uppercase tracking-[0.2em] text-center hover:bg-white hover:text-black transition-all rounded-sm"
                  >
                    Provision Node
                  </Link>
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
