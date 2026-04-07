import Link from 'next/link';
import { NavBar } from '@/components/nav-bar';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, ShieldCheck, Zap, Activity, CheckCircle2 } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/20">
      <NavBar />
      <main className="flex-1 overflow-hidden">
        {/* Hero Section */}
        <section className="relative container mx-auto px-4 pt-8 pb-12 text-center min-h-[calc(100vh-64px)] flex flex-col justify-center">
          {/* Animated Background Blobs */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full -z-10 overflow-hidden opacity-40">
            <div className="absolute top-[10%] left-[5%] w-64 h-64 bg-primary/10 rounded-full blur-[100px] animate-pulse duration-[8s]" />
            <div className="absolute bottom-[20%] right-[10%] w-[350px] h-[350px] bg-secondary/10 rounded-full blur-[120px] animate-pulse delay-1000 duration-[10s]" />
          </div>

          <div className="space-y-4 max-w-5xl mx-auto relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary font-bold text-[10px] uppercase tracking-widest animate-in fade-in slide-in-from-bottom-2 duration-700">
              <Sparkles className="h-3 w-3" />
              <span>Будущее персонализированной медицины</span>
            </div>
            
            <h1 className="text-4xl md:text-7xl font-black font-headline tracking-tighter leading-[0.95] animate-in fade-in slide-in-from-bottom-4 duration-1000">
              Ваше тело заслуживает <br />
              <span className="text-gradient italic">персонального</span> подхода
            </h1>
            
            <p className="max-w-2xl mx-auto text-base md:text-xl text-muted-foreground font-medium leading-snug animate-in fade-in duration-1000 delay-300">
              PRO Себя — это персональный ИИ-нутрициолог, который анализирует ваши данные и анализы для создания идеального плана здоровья.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
              <Link href="/register">
                <Button size="lg" className="h-14 px-8 text-lg font-bold rounded-2xl bg-primary hover:bg-primary/90 shadow-[0_15px_40px_rgba(20,184,166,0.25)] transition-all hover:scale-105 active:scale-95">
                  Начать бесплатно <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="ghost" className="h-14 px-8 text-lg font-bold rounded-2xl hover:bg-primary/5 transition-colors border-2 border-transparent hover:border-primary/10">
                  Узнать больше
                </Button>
              </Link>
            </div>

            {/* Micro Stats */}
            <div className="flex items-center justify-center gap-6 pt-8 animate-in fade-in duration-1000 delay-700">
              <div className="text-center">
                <p className="text-2xl font-black text-foreground">98%</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Точность</p>
              </div>
              <div className="h-6 w-px bg-border" />
              <div className="text-center">
                <p className="text-2xl font-black text-foreground">24/7</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Поддержка</p>
              </div>
              <div className="h-6 w-px bg-border" />
              <div className="text-center">
                <p className="text-2xl font-black text-foreground">100%</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Приватность</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-16 bg-white/50 border-t">
          <div className="text-center mb-12 space-y-2">
            <h2 className="text-2xl md:text-4xl font-black font-headline tracking-tight text-foreground">Умные технологии для жизни</h2>
            <p className="text-base text-muted-foreground font-medium">Почему PRO Себя — лучший выбор для вашего здоровья</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              { 
                icon: Zap, 
                title: "Мгновенный анализ", 
                text: "Получите детальный план питания и тренировок за 30 секунд. Наш ИИ обрабатывает сотни параметров." 
              },
              { 
                icon: ShieldCheck, 
                title: "Конфиденциальность", 
                text: "Ваши медицинские данные под надежной защитой. Мы используем шифрование банковского уровня." 
              },
              { 
                icon: Activity, 
                title: "Научный подход", 
                text: "Используем актуальные рекомендации ВОЗ и передовые модели Gemini AI для достижения точности." 
              }
            ].map((feature, i) => (
              <div key={i} className="glass-card p-8 rounded-[2.5rem] group hover:border-primary/30 transition-all duration-500 hover:-translate-y-2 flex flex-col items-center text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-500">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-black mb-3 tracking-tight">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">{feature.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="py-8 border-t bg-white">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-md">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="font-headline text-xl font-black tracking-tighter">PRO Себя</span>
          </div>
          <p className="text-muted-foreground text-xs font-medium">© 2024 PRO Себя. Сделано с заботой о вас.</p>
        </div>
      </footer>
    </div>
  );
}
