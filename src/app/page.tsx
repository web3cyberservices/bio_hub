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
  Loader2
} from 'lucide-react';
import { useUser } from '@/firebase';
import { Badge } from '@/components/ui/badge';
import { AISpecialistChat } from '@/components/ai-specialist-chat';

export default function LandingPage() {
  const { user, loading: userLoading } = useUser();
  const isGuest = !user || user.uid === 'public-user';

  return (
    <div className="flex min-h-screen flex-col bg-[#F0F7F2] overflow-x-hidden">
      <NavBar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden min-h-[70vh] flex items-center">
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-6 md:space-y-8">
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Badge variant="outline" className="px-4 py-1 rounded-2xl border-primary/20 text-primary font-black uppercase tracking-[0.3em] text-[8px] md:text-[10px] bg-white/50 backdrop-blur-md mb-4">
                  Future of Biohacking
                </Badge>
                <h1 className="text-4xl md:text-7xl lg:text-8xl font-black tracking-tighter text-foreground leading-[1.1] mb-4">
                  Управляй своим <br />
                  <span className="text-primary">потенциалом</span>
                </h1>
                <p className="text-sm md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed px-4">
                  PRO Себя — это персональный ИИ био-хаб для управления здоровьем, питанием и энергией на основе ваших данных.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                {userLoading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
                ) : isGuest ? (
                  <>
                    <Button asChild className="w-full sm:w-auto rounded-2xl h-14 md:h-16 px-8 md:px-10 text-base md:text-lg font-black bg-primary shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 gap-3">
                      <Link href="/register">
                        Начать бесплатно <ArrowRight className="h-5 w-5" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full sm:w-auto rounded-2xl h-14 md:h-16 px-8 md:px-10 text-base md:text-lg font-black border-2 border-primary/10 hover:bg-primary/5 transition-all">
                      <Link href="/login">Войти</Link>
                    </Button>
                  </>
                ) : (
                  <Button asChild className="w-full sm:w-auto rounded-2xl h-14 md:h-16 px-8 md:px-12 text-base md:text-lg font-black bg-primary shadow-xl transition-all hover:scale-105 gap-3">
                    <Link href="/dashboard">
                      Перейти в Bio-Хаб <Activity className="h-5 w-5" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Background Elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] -z-10 animate-pulse" />
          <Zap className="absolute top-10 -left-10 h-24 w-24 md:h-48 md:w-48 text-primary/10 -rotate-12 animate-float opacity-20 md:opacity-40" />
          <Activity className="absolute bottom-10 -right-10 h-32 w-32 md:h-64 md:w-64 text-primary/10 rotate-12 animate-float opacity-20 md:opacity-40" style={{ animationDelay: '2s' }} />
        </section>

        {/* Features Grid */}
        <section className="py-16 md:py-24 bg-white/50 backdrop-blur-md border-y">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12 md:mb-16 space-y-3">
              <h2 className="text-2xl md:text-5xl font-black tracking-tighter">Технологии здоровья</h2>
              <p className="text-muted-foreground text-xs md:text-base font-medium">Мы объединили науку и ИИ для вашего здоровья.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {[
                {
                  title: "Bio-Score 4.0",
                  desc: "Единый индекс здоровья, рассчитываемый ИИ на основе ваших показателей.",
                  icon: LineChart,
                  color: "bg-blue-500"
                },
                {
                  title: "Нейро-сканер еды",
                  desc: "Распознавание КБЖУ блюда по фото с точностью до грамма.",
                  icon: Utensils,
                  color: "bg-orange-500"
                },
                {
                  title: "Смарт-трекинг",
                  desc: "Синхронизация с устройствами для мониторинга активности.",
                  icon: Smartphone,
                  color: "bg-emerald-600"
                }
              ].map((f, i) => (
                <div key={i} className="premium-card p-6 md:p-10 border-none space-y-6 group transition-all">
                  <div className={f.color + " w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-black/5"}>
                    <f.icon className="h-6 w-6 md:h-7 md:w-7 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg md:text-xl font-black tracking-tight">{f.title}</h3>
                    <p className="text-muted-foreground text-xs md:text-sm font-medium leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-6">
            <div className="glass-panel p-8 md:p-16 flex flex-col md:flex-row items-center gap-10 md:gap-12 relative overflow-hidden">
              <div className="flex-1 space-y-6 md:space-y-8 relative z-10">
                <Badge className="bg-primary/10 text-primary border-none font-black px-4 py-1">БЕЗОПАСНОСТЬ</Badge>
                <h2 className="text-2xl md:text-5xl font-black tracking-tighter leading-tight">Ваши био-данные <br /> защищены</h2>
                <div className="space-y-3 md:space-y-4">
                  {[
                    "Шифрование данных военного уровня",
                    "Полная анонимность сессий",
                    "Доказательная база ИИ"
                  ].map((text, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs md:text-base font-bold">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
                <Button asChild variant="secondary" className="w-full sm:w-auto rounded-xl h-12 md:h-14 px-8 text-sm md:text-base font-black">
                   <Link href="/register">Создать профиль</Link>
                </Button>
              </div>
              <div className="flex-1 flex justify-center relative z-10">
                <div className="relative w-40 h-40 md:w-64 md:h-64">
                   <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                   <div className="relative w-full h-full bg-white rounded-3xl shadow-2xl flex items-center justify-center">
                      <ShieldCheck className="h-16 w-16 md:h-24 md:w-24 text-primary" />
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-10 bg-white/50 backdrop-blur-md">
        <div className="container mx-auto px-6 text-center space-y-6">
          <div className="flex justify-center items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-lg">
              <Activity className="h-4 w-4 text-white" />
            </div>
            <span className="font-headline font-black tracking-tighter text-xl text-primary">PRO Себя</span>
          </div>
          <div className="flex justify-center gap-4 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
            <Link href="#" className="hover:text-primary">Политика</Link>
            <Link href="#" className="hover:text-primary">Условия</Link>
            <Link href="#" className="hover:text-primary">Поддержка</Link>
          </div>
          <p className="text-muted-foreground/20 text-[7px] md:text-[8px] uppercase tracking-[0.5em] font-black">© 2024 NEXT GEN BIOTECH LABS.</p>
        </div>
      </footer>

      <AISpecialistChat />
    </div>
  );
}
