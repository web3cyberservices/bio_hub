
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
  AlertCircle
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
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-sm flex items-center justify-center">
              <Database className="w-5 h-5 text-white" />
            </div>
            <span className="text-[10px] font-black tracking-widest uppercase">Console v1.8</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <div className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] px-4 py-3">Управление</div>
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 bg-white/5 text-blue-500 text-[10px] font-black uppercase tracking-widest border border-blue-500/20 rounded-sm">
            <LayoutDashboard className="w-4 h-4" /> Обзор узла
          </Link>
          <a href="#" className="flex items-center gap-3 px-4 py-2.5 text-muted-foreground hover:text-white hover:bg-white/5 text-[10px] font-black uppercase tracking-widest transition-all">
            <Key className="w-4 h-4" /> API Ключи
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-2.5 text-muted-foreground hover:text-white hover:bg-white/5 text-[10px] font-black uppercase tracking-widest transition-all">
            <Globe className="w-4 h-4" /> Сетевой маппинг
          </a>
          
          <div className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] px-4 py-3 mt-6">Финансы</div>
          <Link href="/pricing" className="flex items-center gap-3 px-4 py-2.5 text-muted-foreground hover:text-white hover:bg-white/5 text-[10px] font-black uppercase tracking-widest transition-all">
            <CreditCard className="w-4 h-4" /> Биллинг
          </Link>
          
          <div className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] px-4 py-3 mt-6">Система</div>
          <a href="#" className="flex items-center gap-3 px-4 py-2.5 text-muted-foreground hover:text-white hover:bg-white/5 text-[10px] font-black uppercase tracking-widest transition-all">
            <Settings className="w-4 h-4" /> Конфигурация
          </a>
        </nav>

        <div className="p-4 border-t border-white/10">
          <form action={handleSignOut}>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 text-[10px] font-black uppercase tracking-widest transition-all rounded-sm group">
              <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Завершить сессию
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-grid relative">
        
        {/* Top Header */}
        <header className="h-16 border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">Node Status: Online</span>
            </div>
            <div className="h-4 w-px bg-white/10 hidden sm:block" />
            <span className="text-[9px] text-muted-foreground uppercase tracking-widest hidden sm:block">Tenant: {user.email}</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-sm">
              <Cpu className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-[9px] font-black uppercase tracking-widest">Quota: {(user.grpcQuota / 1000).toFixed(0)}k RPS</span>
            </div>
            <button className="p-2 border border-white/10 hover:bg-white/5 transition-colors lg:hidden">
              <LogOut className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-12 pb-32">
          
          {/* Welcome & Stats */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-black tracking-tighter uppercase">Панель управления</h1>
              <p className="text-[10px] text-muted-foreground font-bold tracking-[0.2em] uppercase">Консоль администрирования инфраструктуры и gRPC туннелей</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto">
              {[
                { label: 'Uptime', val: '99.99%', color: 'text-green-500' },
                { label: 'Latency', val: '0.12ms', color: 'text-blue-500' },
                { label: 'Ingress', val: '2.4 Gbps', color: 'text-white' },
                { label: 'Active Tunnels', val: activeServices.length.toString(), color: 'text-white' }
              ].map(stat => (
                <div key={stat.label} className="p-4 border border-white/10 bg-white/[0.02]">
                  <div className="text-[8px] text-muted-foreground font-black uppercase tracking-widest mb-1">{stat.label}</div>
                  <div className={`text-sm font-black tracking-tighter ${stat.color}`}>{stat.val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Services Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-green-500" /> Мои активные услуги
              </h2>
              <span className="text-[9px] text-muted-foreground font-mono tracking-widest">Active nodes: {activeServices.length}</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeServices.map(service => (
                <div key={service.id} className="border border-blue-500/30 bg-blue-500/[0.03] p-6 relative group overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-colors" />
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-2 bg-blue-500/10 rounded-sm">
                      {service.id === 'streaming' ? <Zap className="w-5 h-5 text-blue-500" /> : <Activity className="w-5 h-5 text-blue-500" />}
                    </div>
                    <div className="px-2 py-0.5 border border-green-500/20 bg-green-500/5 text-[8px] font-black text-green-500 tracking-widest uppercase">
                      Connected
                    </div>
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-tight mb-2">{service.name}</h3>
                  <p className="text-[10px] text-muted-foreground leading-relaxed mb-6 font-bold tracking-wide">
                    {service.desc.substring(0, 100)}...
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <Link href={service.href} className="text-[9px] font-black text-blue-500 hover:text-blue-400 uppercase tracking-widest flex items-center gap-1 transition-colors">
                      Управление <ChevronRight className="w-3 h-3" />
                    </Link>
                    <span className="text-[8px] text-white/20 font-mono">ID: {service.id.toUpperCase()}-TX-25</span>
                  </div>
                </div>
              ))}

              {activeServices.length === 0 && (
                <div className="col-span-full py-12 border border-dashed border-white/10 flex flex-col items-center justify-center text-center">
                  <AlertCircle className="w-8 h-8 text-white/10 mb-4" />
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Нет активных туннелей</p>
                  <a href="#catalog" className="mt-4 text-[9px] text-blue-500 font-black uppercase tracking-widest hover:underline">Просмотреть каталог</a>
                </div>
              )}
            </div>
          </section>

          {/* Service Catalog (Connect New) */}
          <section id="catalog" className="space-y-6 pt-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-500" /> Подключить новые мощности
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {availableServices.map(service => (
                <div key={service.id} className="border border-white/10 bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/20 transition-all p-8 flex flex-col justify-between group">
                  <div>
                    <div className="mb-6 opacity-40 group-hover:opacity-100 transition-opacity">
                      {service.id === 'osint' && <Search className="w-5 h-5 text-purple-500" />}
                      {service.id === 'pentest' && <ShieldCheck className="w-5 h-5 text-red-500" />}
                      {service.id === 'devsecops' && <Terminal className="w-5 h-5 text-green-500" />}
                      {!['osint', 'pentest', 'devsecops'].includes(service.id) && <Activity className="w-5 h-5 text-orange-500" />}
                    </div>
                    <h3 className="text-[12px] font-black tracking-tight text-white mb-3 uppercase group-hover:text-blue-500 transition-colors">{service.name}</h3>
                    <p className="text-[9px] text-muted-foreground leading-relaxed font-bold tracking-wider mb-8">
                      {service.desc.substring(0, 80)}...
                    </p>
                  </div>
                  
                  <Link 
                    href={service.href}
                    className="w-full py-3 bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-center hover:bg-white text-black transition-all"
                  >
                    Активировать узел
                  </Link>
                </div>
              ))}
            </div>
          </section>

          {/* Quick Support & Documentation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-12">
            <div className="p-8 border border-white/5 bg-gradient-to-br from-blue-500/5 to-transparent flex flex-col justify-between min-h-[160px]">
              <div>
                <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4">Техническая поддержка</h4>
                <p className="text-[9px] text-muted-foreground font-bold tracking-widest leading-relaxed">
                  Персональный инженер доступен 24/7 для настройки gRPC-маршрутизации и оптимизации задержек.
                </p>
              </div>
              <a href="#" className="text-[9px] font-black text-white hover:text-blue-500 transition-colors uppercase tracking-widest mt-6 flex items-center gap-2">
                Открыть тикет <ChevronRight className="w-3 h-3" />
              </a>
            </div>
            
            <div className="p-8 border border-white/5 bg-white/[0.01] flex flex-col justify-between min-h-[160px]">
              <div>
                <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">База знаний</h4>
                <p className="text-[9px] text-muted-foreground font-bold tracking-widest leading-relaxed">
                  Изучите спецификации Protobuf и методы интеграции наших систем в ваш технологический стек.
                </p>
              </div>
              <Link href="/api-docs" className="text-[9px] font-black text-white hover:text-blue-500 transition-colors uppercase tracking-widest mt-6 flex items-center gap-2">
                Документация API <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
