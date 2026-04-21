
"use client";

import Link from 'next/link';
import { NavBar } from '@/components/nav-bar';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Utensils, 
  Smartphone, 
  LineChart,
  CheckCircle2,
  Loader2,
  LogIn
} from 'lucide-react';
import { useUser } from '@/firebase';
import { Badge } from '@/components/ui/badge';
import { AISpecialistChat } from '@/components/ai-specialist-chat';
import { QuickTestButton } from '@/components/quick-test-button';

export default function LandingPage() {
  const { user, loading: userLoading } = useUser();
  // Анонимные (тестовые) пользователи НЕ считаются гостями
  const isGuest = !user || user.uid === 'public-user';

  return (
    <div className="flex min-h-screen flex-col bg-[#F0F7F2] overflow-x-hidden">
      <NavBar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-12 pb-16 md:pt-20 md:pb-32 overflow-hidden min-h-[80vh] flex items-center">
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-5xl mx-auto text-center space-y-6 md:space-y-10">
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Badge variant="outline" className="px-5 py-1.5 rounded-2xl border-primary/20 text-primary font-black uppercase tracking-[0.3em] text-[8px] md:text-[11px] bg-white/50 backdrop-blur-md mb-6">
                  Next Gen Biohacking Hub
                </Badge>
                <h1 className="text-4xl md:text-8xl lg:text-9xl font-black tracking-tighter text-foreground leading-[0.95] mb-4">
                  Управляй своим <br />
                  <span className="text-primary">потенциалом</span>
                </h1>
                <p className="text-xs md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed px-4 opacity-80">
                  PRO Себя — это персональный ИИ био-хаб для глубокого управления здоровьем, питанием и энергией на основе ваших данных.
                </p>
              </div>

              <div className="flex flex-col items-center justify-center gap-6 pt-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                {userLoading ? (
                  <div className="h-20 flex items-center justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
                  </div>
                ) : isGuest ? (
                  <div className="flex flex-col w-full max-w-2xl gap-6">
                    {/* Primary Actions Row */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
                      <Button asChild className="w-full sm:w-auto rounded-2xl h-16 md:h-20 px-10 md:px-12 text-lg md:text-xl font-black bg-primary shadow-2xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 gap-3">
                        <Link href="/register">
                          Начать бесплатно <ArrowRight className="h-6 w-6" />
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full sm:w-auto rounded-2xl h-16 md:h-20 px-10 md:px-12 text-lg md:text-xl font-black border-2 border-primary/10 hover:bg-primary/5 transition-all bg-white/50 backdrop-blur-sm gap-3">
                        <Link href="/login">
                          Войти <LogIn className="h-6 w-6" />
                        </Link>
                      </Button>
                    </div>
                    
                    {/* Quick Test Option */}
                    <div className="relative py-4">
                      <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-primary/10" /></div>
                      <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                        <span className="bg-[#F0F7F2] px-6 text-muted-foreground/40">Или мгновенный тест</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-center">
                      <QuickTestButton />
                    </div>
                  </div>
                ) : (
                  <Button asChild className="w-full sm:w-auto rounded-[2.5rem] h-20 md:h-24 px-12 md:px-20 text-xl md:text-2xl font-black bg-primary shadow-2xl transition-all hover:scale-105 gap-4">
                    <Link href="/dashboard">
                      Перейти в Bio-Хаб <Activity className="h-8 w-8" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Background Elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -z-10 animate-pulse" />
          <Zap className="absolute top-10 -left-10 h-32 w-32 md:h-64 md:w-64 text-primary/10 -rotate-12 animate-float opacity-20 md:opacity-40" />
          <Activity className="absolute bottom-10 -right-10 h-40 w-40 md:h-80 md:w-80 text-primary/10 rotate-12 animate-float opacity-20 md:opacity-40" style={{ animationDelay: '2s' }} />
        </section>

        {/* Features Grid */}
        <section className="py-20 md:py-32 bg-white/50 backdrop-blur-md border-y">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16 md:mb-24 space-y-3">
              <h2 className="text-3xl md:text-6xl font-black tracking-tighter">Технологии здоровья</h2>
              <p className="text-muted-foreground text-xs md:text-lg font-medium opacity-60 uppercase tracking-widest">Мы объединили науку и ИИ для вашего благополучия.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              {[
                {
                  title: "Bio-Score 4.0",
                  desc: "Единый индекс здоровья, рассчитываемый ИИ на основе ваших показателей в реальном времени.",
                  icon: LineChart,
                  color: "bg-blue-500"
                },
                {
                  title: "Нейро-сканер еды",
                  desc: "Мгновенное распознавание КБЖУ блюда по одной фотографии с точностью до грамма.",
                  icon: Utensils,
                  color: "bg-orange-500"
                },
                {
                  title: "Смарт-трекинг",
                  desc: "Бесшовная синхронизация с носимыми устройствами для мониторинга активности и сна.",
                  icon: Smartphone,
                  color: "bg-emerald-600"
                }
              ].map((f, i) => (
                <div key={i} className="premium-card p-8 md:p-12 border-none space-y-8 group transition-all">
                  <div className={f.color + " w-16 h-16 md:w-20 md:h-20 rounded-[1.75rem] flex items-center justify-center shadow-2xl shadow-black/10 group-hover:scale-110 transition-transform"}>
                    <f.icon className="h-8 w-8 md:h-10 md:w-10 text-white" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl md:text-2xl font-black tracking-tight">{f.title}</h3>
                    <p className="text-muted-foreground text-sm md:text-base font-medium leading-relaxed opacity-70">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-20 md:py-40">
          <div className="container mx-auto px-6">
            <div className="glass-panel p-10 md:p-24 flex flex-col md:flex-row items-center gap-12 md:gap-20 relative overflow-hidden">
              <div className="flex-1 space-y-6 md:space-y-10 relative z-10">
                <Badge className="bg-primary/10 text-primary border-none font-black px-5 py-1.5 uppercase tracking-widest">БЕЗОПАСНОСТЬ</Badge>
                <h2 className="text-3xl md:text-7xl font-black tracking-tighter leading-[0.95]">Ваши био-данные <br /> под защитой</h2>
                <div className="space-y-4 md:space-y-6">
                  {[
                    "Шифрование данных военного уровня (AES-256)",
                    "Полная анонимность сессий и тестов",
                    "Доказательная база ИИ на основе EBM"
                  ].map((text, i) => (
                    <div key={i} className="flex items-center gap-4 text-xs md:text-xl font-bold">
                      <CheckCircle2 className="h-5 w-5 md:h-7 md:w-7 text-primary shrink-0" />
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-4">
                  <Button asChild variant="secondary" className="w-full sm:w-auto rounded-2xl h-16 md:h-20 px-10 text-base md:text-xl font-black">
                     <Link href="/register">Создать защищенный профиль</Link>
                  </Button>
                </div>
              </div>
              <div className="flex-1 flex justify-center relative z-10">
                <div className="relative w-48 h-48 md:w-[400px] md:h-[400px]">
                   <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping duration-[3s]" />
                   <div className="relative w-full h-full bg-white rounded-[4rem] shadow-3xl flex items-center justify-center border-4 border-primary/5">
                      <ShieldCheck className="h-20 w-20 md:h-48 md:w-48 text-primary drop-shadow-2xl" />
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-16 md:py-24 bg-white/50 backdrop-blur-md">
        <div className="container mx-auto px-6 text-center space-y-10">
          <div className="flex justify-center items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-xl">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <span className="font-headline font-black tracking-tighter text-2xl md:text-3xl text-primary uppercase">PRO Себя</span>
          </div>
          <div className="flex flex-wrap justify-center gap-8 text-[9px] md:text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
            <Link href="#" className="hover:text-primary transition-colors">Политика конфиденциальности</Link>
            <Link href="#" className="hover:text-primary transition-colors">Условия использования</Link>
            <Link href="#" className="hover:text-primary transition-colors">Центр поддержки</Link>
          </div>
          <p className="text-muted-foreground/20 text-[8px] md:text-[10px] uppercase tracking-[0.6em] font-black">© 2024 NEXT GEN BIOTECH LABS. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>

      <AISpecialistChat />
    </div>
  );
}
