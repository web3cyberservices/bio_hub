import Link from 'next/link';
import { NavBar } from '@/components/nav-bar';
import { Button } from '@/components/ui/button';
import { QuickTestButton } from '@/components/quick-test-button';
import { ArrowRight, Activity, ShieldCheck, Zap, CheckCircle2, TrendingUp, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/20 overflow-x-hidden">
      <NavBar />
      
      <main className="flex-1 flex flex-col justify-center relative overflow-hidden">
        {/* Анимированный био-фон */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-[10%] left-[10%] w-[40rem] h-[40rem] bg-primary/10 rounded-full blur-[120px] animate-pulse duration-[8s]" />
          <div className="absolute bottom-[10%] right-[5%] w-[30rem] h-[30rem] bg-secondary/10 rounded-full blur-[100px] animate-pulse delay-1000 duration-[10s]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        </div>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-12 md:py-24 text-center max-w-6xl">
          <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            
            {/* Logo Emphasis */}
            <div className="flex flex-col items-center justify-center gap-6">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-[2.5rem] shadow-2xl shadow-primary/20 flex items-center justify-center border-4 border-primary/10 animate-in zoom-in duration-700">
                <Activity className="h-12 w-12 md:h-16 md:w-16 text-primary" />
              </div>
              
              <div className="space-y-4">
                <h1 className="text-6xl md:text-9xl font-black font-headline tracking-tighter leading-none text-foreground">
                  PRO <span className="text-primary/80">Себя</span>
                </h1>
                <div className="h-1.5 w-24 md:w-40 bg-primary mx-auto rounded-full" />
              </div>
            </div>
            
            {/* Concise Description */}
            <div className="max-w-2xl mx-auto space-y-4">
              <p className="text-xl md:text-3xl text-foreground font-black tracking-tight leading-tight">
                Интеллектуальный хаб вашего здоровья.
              </p>
              <p className="text-base md:text-xl text-muted-foreground font-medium leading-relaxed">
                Персональная ИИ-платформа для управления питанием и биоритмами на основе клинических данных и показателей ваших носимых устройств.
              </p>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <QuickTestButton />
              <Link href="/register">
                <Button size="lg" variant="ghost" className="h-16 px-10 text-xl font-black rounded-3xl hover:bg-primary/5 border-2 border-transparent hover:border-primary/20 transition-all gap-2">
                  Регистрация <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>

            {/* Trust Badges / Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 pt-10 max-w-4xl mx-auto">
              {[
                { icon: TrendingUp, label: "Точность", value: "98.4%", color: "text-primary" },
                { icon: ShieldCheck, label: "Приватность", value: "AES-256", color: "text-secondary" },
                { icon: Activity, label: "Анализ", value: "Real-time", color: "text-accent-foreground" },
                { icon: Users, label: "Комьюнити", value: "50k+", color: "text-primary" }
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center p-4 rounded-3xl glass-card border-none bg-white/40 group hover:bg-white/60 transition-colors">
                  <stat.icon className={`h-6 w-6 mb-2 ${stat.color}`} />
                  <span className="text-xl font-black leading-none">{stat.value}</span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Floating Features Row */}
        <section className="container mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: "Умное сканирование", desc: "Фотографируйте еду — ИИ сам посчитает КБЖУ." },
                { title: "Анализ лаб. тестов", desc: "Загружайте анализы для поиска дефицитов." },
                { title: "Синхронизация", desc: "Ваши Apple Watch и Oura Ring теперь в деле." }
              ].map((f, i) => (
                <div key={i} className="p-6 rounded-[2.5rem] glass-card border-white/50 flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm tracking-tight">{f.title}</h4>
                    <p className="text-xs text-muted-foreground font-medium">{f.desc}</p>
                  </div>
                </div>
              ))}
           </div>
        </section>
      </main>

      <footer className="py-8 border-t bg-white/50 backdrop-blur-md">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-lg">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="font-headline text-xl font-black tracking-tighter">PRO Себя</span>
          </div>
          <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
             <Link href="#" className="hover:text-primary transition-colors">Методология</Link>
             <Link href="#" className="hover:text-primary transition-colors">Приватность</Link>
             <Link href="#" className="hover:text-primary transition-colors">Контакты</Link>
          </div>
          <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">© 2024 NEXT GEN HEALTH.</p>
        </div>
      </footer>
    </div>
  );
}
