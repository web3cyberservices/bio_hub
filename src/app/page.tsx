import Link from 'next/link';
import { NavBar } from '@/components/nav-bar';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, ShieldCheck, Zap, Activity, CheckCircle2, TrendingUp, Users } from 'lucide-react';

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
        <section className="container mx-auto px-4 py-8 md:py-16 text-center max-w-6xl">
          <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* AI Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-black text-[10px] uppercase tracking-[0.2em] shadow-sm">
              <Sparkles className="h-3.5 w-3.5 fill-primary" />
              <span>Personal AI Health Intelligence</span>
            </div>
            
            {/* Главный заголовок */}
            <div className="space-y-2">
              <h1 className="text-5xl md:text-8xl font-black font-headline tracking-tighter leading-[0.9] text-foreground">
                Твое тело — <br />
                <span className="text-gradient italic">твои правила.</span>
              </h1>
              <p className="max-w-2xl mx-auto text-lg md:text-2xl text-muted-foreground font-medium leading-tight">
                PRO Себя — ИИ-платформа нового поколения для управления здоровьем через анализы, биоритмы и умное питание.
              </p>
            </div>
            
            {/* CTA Buttons - Hidden on mobile, visible from sm breakpoint */}
            <div className="hidden sm:flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link href="/register">
                <Button size="lg" className="h-16 px-10 text-xl font-black rounded-3xl bg-primary hover:bg-primary/90 shadow-[0_20px_50px_rgba(20,184,166,0.3)] transition-all hover:scale-105 active:scale-95 group">
                  Регистрация <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="ghost" className="h-16 px-10 text-xl font-black rounded-3xl hover:bg-primary/5 border-2 border-transparent hover:border-primary/20 transition-all">
                  Демо-версия
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

        {/* Floating Features Row (Visible on scroll or larger screens) */}
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
             <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
             <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
             <Link href="#" className="hover:text-primary transition-colors">Contact</Link>
          </div>
          <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">© 2024 NEXT GEN HEALTH.</p>
        </div>
      </footer>
    </div>
  );
}
