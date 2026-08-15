
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
  Database
} from 'lucide-react';
import { handleSignOut } from '@/lib/actions/auth';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/portal');
  }

  const user = session.user as any;

  const cards = [
    {
      title: 'gRPC Data Streaming',
      desc: 'Магистральные каналы доставки рыночных данных с ультра-низкой задержкой.',
      href: '/services/data-streaming',
      icon: <Zap className="w-5 h-5 text-blue-500" />,
      color: 'blue'
    },
    {
      title: 'DevSecOps Automation',
      desc: 'Трансформация цикла разработки в безопасную экосистему через автоматизацию.',
      href: '/services/devsecops',
      icon: <Terminal className="w-5 h-5 text-green-500" />,
      color: 'green'
    },
    {
      title: 'OSINT & Intelligence',
      desc: 'Профессиональная разведка на основе открытых и специализированных источников.',
      href: '/services/osint',
      icon: <Search className="w-5 h-5 text-purple-500" />,
      color: 'purple'
    },
    {
      title: 'Pentest & Audit',
      desc: 'Комплексный аудит безопасности и имитация APT атак для выявления уязвимостей.',
      href: '/services/pentest',
      icon: <ShieldCheck className="w-5 h-5 text-red-500" />,
      color: 'red'
    },
    {
      title: 'Infrastructure Telemetry',
      desc: 'Предиктивный мониторинг на базе eBPF для обеспечения максимальной видимости.',
      href: '/services/telemetry',
      icon: <Activity className="w-5 h-5 text-orange-500" />,
      color: 'orange'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white font-mono selection:bg-blue-500/30">
      {/* Header Bar */}
      <div className="border-b border-white/10 bg-white/[0.02] px-6 py-4 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 text-[10px] text-blue-500 font-black tracking-widest uppercase">
            <Database className="w-4 h-4" /> Node: Active
          </div>
          <div className="h-4 w-px bg-white/10 hidden sm:block" />
          <div className="hidden sm:block text-[9px] text-muted-foreground tracking-widest uppercase">
            Tenant: {user.email}
          </div>
        </div>
        
        <form action={handleSignOut}>
          <button className="flex items-center gap-2 text-[10px] font-black text-red-500 hover:text-white transition-colors uppercase tracking-widest group">
            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Отключить узел
          </button>
        </form>
      </div>

      <main className="container mx-auto max-w-7xl px-6 py-16">
        <div className="mb-16">
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-4">Панель управления узлом</h1>
          <p className="text-[11px] text-muted-foreground font-black tracking-[0.3em] uppercase">Конфигурация активных gRPC-туннелей и систем телеметрии</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <Link 
              key={card.href} 
              href={card.href}
              className="group border border-white/10 p-8 bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/20 transition-all flex flex-col justify-between min-h-[240px]"
            >
              <div>
                <div className="mb-6">{card.icon}</div>
                <h3 className="text-lg font-black tracking-tight text-white mb-3 group-hover:text-blue-500 transition-colors uppercase">{card.title}</h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed font-bold tracking-wider">
                  {card.desc}
                </p>
              </div>
              
              <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-6">
                <span className="text-[9px] font-black tracking-[0.3em] text-white/40 uppercase group-hover:text-white transition-colors">Перейти к сервису</span>
                <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}

          {/* User Stats Card */}
          <div className="border border-blue-500/20 p-8 bg-blue-500/5 flex flex-col justify-between min-h-[240px]">
            <div>
              <h4 className="text-[10px] font-black text-blue-500 tracking-[0.3em] uppercase mb-6">Статус аккаунта</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Уровень:</span>
                  <span className="text-[10px] text-white font-black uppercase tracking-widest">{user.role}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Квота RPS:</span>
                  <span className="text-[10px] text-green-500 font-black uppercase tracking-widest">{user.grpcQuota?.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white/5 border border-white/5 text-[9px] text-white/60 leading-relaxed font-bold tracking-wider">
              Выделенная bare-metal инфраструктура MSK-IX / ЦОД NORD.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
