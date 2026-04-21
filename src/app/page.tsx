
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
  CheckCircle2
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
        <section className="relative pt-20 pb-32 md:pt-32 md:pb-48 overflow-hidden">
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-10">
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Badge variant="outline" className="px-6 py-2 rounded-2xl border-primary/20 text-primary font-black uppercase tracking-[0.3em] text-[10px] bg-white/50 backdrop-blur-md mb-8">
                  Future of Biohacking is here
                </Badge>
                <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-foreground leading-[0.9] mb-8">
                  Управляй своим <br />
                  <span className="text-primary">потенциалом</span>
                </h1>
                <p className="text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
                  PRO Себя — это персональный ИИ био-хаб для управления здоровьем, питанием и энергией на основе ваших биометрических данных.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                {isGuest ? (
                  <>
                    <Button asChild className="rounded-[2rem] h-20 px-12 text-xl font-black bg-primary shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95 gap-3">
                      <Link href="/register">
                        Начать бесплатно <ArrowRight className="h-6 w-6" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="rounded-[2rem] h-20 px-12 text-xl font-black border-2 border-primary/20 hover:bg-primary/5 transition-all gap-3">
                      <Link href="/login">
                        У меня есть аккаунт
                      </Link>
                    </Button>
                  </>
                ) : (
                  <Button asChild className="rounded-[2rem] h-20 px-12 text-xl font-black bg-primary shadow-2xl transition-all hover:scale-105 gap-3">
                    <Link href="/dashboard">
                      Перейти в Bio-Хаб <Activity className="h-6 w-6" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Background Elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary/5 rounded-full blur-[120px] -z-10 animate-pulse" />
          <Zap className="absolute top-40 -left-20 h-64 w-64 text-primary/10 -rotate-12 animate-float" />
          <Activity className="absolute bottom-20 -right-20 h-80 w-80 text-primary/10 rotate-12 animate-float" style={{ animationDelay: '2s' }} />
        </section>

        {/* Features Grid */}
        <section className="py-32 bg-white/50 backdrop-blur-md border-y">
          <div className="container mx-auto px-6">
            <div className="text-center mb-24 space-y-4">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter">Технологии здоровья</h2>
              <p className="text-muted-foreground text-lg font-medium">Мы объединили науку и ИИ, чтобы вы чувствовали себя на 100%.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                {
                  title: "Bio-Score 4.0",
                  desc: "Единый индекс здоровья, рассчитываемый ИИ на основе сна, активности и питания.",
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
                  desc: "Полная синхронизация с вашими устройствами для мониторинга пульса и шагов.",
                  icon: Smartphone,
                  color: "bg-emerald-600"
                }
              ].map((f, i) => (
                <div key={i} className="premium-card p-12 border-none space-y-8 group transition-all">
                  <div className={f.color + " w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg shadow-black/5"}>
                    <f.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-black tracking-tight">{f.title}</h3>
                    <p className="text-muted-foreground font-medium leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-32">
          <div className="container mx-auto px-6">
            <div className="glass-panel p-16 md:p-24 flex flex-col md:flex-row items-center gap-16 relative overflow-hidden">
              <div className="flex-1 space-y-10 relative z-10">
                <Badge className="bg-primary/10 text-primary border-none font-black px-4 py-1">БЕЗОПАСНОСТЬ</Badge>
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">Ваши био-данные <br /> под надежной защитой</h2>
                <div className="space-y-6">
                  {[
                    "Шифрование данных военного уровня",
                    "Полная анонимность по запросу",
                    "Доказательная медицина в основе ИИ"
                  ].map((text, i) => (
                    <div key={i} className="flex items-center gap-4 text-lg font-bold">
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
                <Button asChild variant="secondary" className="rounded-2xl h-16 px-10 text-lg font-black mt-8">
                   <Link href="/register">Создать защищенный профиль</Link>
                </Button>
              </div>
              <div className="flex-1 flex justify-center relative z-10">
                <div className="relative w-64 h-64 md:w-96 md:h-96">
                   <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                   <div className="relative w-full h-full bg-white rounded-[3rem] shadow-2xl flex items-center justify-center">
                      <ShieldCheck className="h-32 w-32 md:h-48 md:w-48 text-primary" />
                   </div>
                </div>
              </div>
              <Activity className="absolute -top-20 -right-20 h-96 w-96 text-primary/5" />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-20 bg-white/50 backdrop-blur-md">
        <div className="container mx-auto px-6 text-center space-y-10">
          <div className="flex justify-center items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <span className="font-headline font-black tracking-tighter text-3xl">PRO Себя</span>
          </div>
          <p className="text-muted-foreground max-w-md mx-auto font-medium">
            Next Gen Biotech Labs. Мы верим, что будущее здоровья принадлежит тем, кто понимает свои цифры.
          </p>
          <div className="flex justify-center gap-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
            <Link href="#" className="hover:text-primary transition-colors">Политика</Link>
            <Link href="#" className="hover:text-primary transition-colors">Условия</Link>
            <Link href="#" className="hover:text-primary transition-colors">Поддержка</Link>
          </div>
          <p className="text-muted-foreground/20 text-[9px] uppercase tracking-[0.5em] font-black">© 2024 ALL RIGHTS RESERVED.</p>
        </div>
      </footer>

      <AISpecialistChat />
    </div>
  );
}
