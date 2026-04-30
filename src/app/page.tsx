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
  LogIn,
  User,
  Database,
  Fingerprint
} from 'lucide-react';
import { useUser } from '@/firebase';
import { Badge } from '@/components/ui/badge';

export default function LandingPage() {
  const { user, loading: userLoading } = useUser();
  
  const isGuest = !userLoading && (!user || user.uid === 'public-user');
  const isAuthenticated = !userLoading && user && user.uid !== 'public-user';

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground overflow-x-hidden">
      <NavBar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-24 md:pt-48 md:pb-48 overflow-hidden min-h-[90vh] flex items-center">
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-6xl mx-auto text-center space-y-8 md:space-y-12">
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Badge variant="outline" className="px-6 py-2 rounded-2xl border-primary/30 text-primary font-black uppercase tracking-[0.4em] text-[9px] md:text-[12px] bg-primary/5 backdrop-blur-md mb-8 border-2">
                  <Fingerprint className="h-4 w-4 mr-2" /> Neural Health Intelligence
                </Badge>
                <h1 className="text-5xl md:text-8xl lg:text-[10rem] font-black tracking-tighter text-white leading-[0.85] mb-6">
                  CONTROL YOUR <br />
                  <span className="text-primary neo-glow-strong">POTENTIAL</span>
                </h1>
                <p className="text-sm md:text-2xl text-white/50 max-w-3xl mx-auto font-medium leading-relaxed px-4">
                  PRO Себя — это футуристичный био-хаб. Управляй своим организмом через ИИ, глубокую аналитику и персональный био-хакинг.
                </p>
              </div>

              <div className="flex flex-col items-center justify-center gap-8 pt-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                {userLoading ? (
                  <div className="h-24 flex items-center justify-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary opacity-50" />
                  </div>
                ) : isGuest ? (
                  <div className="flex flex-col items-center justify-center gap-8 w-full max-w-5xl">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full">
                      <Button asChild className="w-full sm:w-auto rounded-[2rem] h-20 md:h-24 px-12 md:px-16 text-xl md:text-2xl font-black bg-primary text-slate-950 shadow-[0_0_50px_rgba(14,165,233,0.5)] transition-all hover:scale-105 active:scale-95 gap-4">
                        <Link href="/register">
                          НАЧАТЬ <ArrowRight className="h-7 w-7" />
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full sm:w-auto rounded-[2rem] h-20 md:h-24 px-12 md:px-16 text-xl md:text-2xl font-black border-2 border-primary/20 hover:bg-primary/10 transition-all bg-white/5 backdrop-blur-md gap-4 text-white">
                        <Link href="/login">
                          ВОЙТИ <LogIn className="h-7 w-7" />
                        </Link>
                      </Button>
                    </div>
                    
                    <Button asChild variant="ghost" className="h-14 rounded-2xl text-primary font-black uppercase tracking-widest text-[11px] gap-3 hover:bg-primary/5 transition-all">
                      <Link href="/dashboard">
                        <User className="h-5 w-5" /> РЕЖИМ ГОСТЯ (DEMO V4.0)
                      </Link>
                    </Button>
                  </div>
                ) : isAuthenticated ? (
                  <Button asChild className="w-full sm:w-auto rounded-[3rem] h-24 md:h-28 px-16 md:px-24 text-2xl md:text-3xl font-black bg-primary text-slate-950 shadow-[0_0_60px_rgba(14,165,233,0.6)] transition-all hover:scale-105 gap-6">
                    <Link href="/dashboard">
                      ВХОД В ХАБ <Activity className="h-10 w-10" />
                    </Link>
                  </Button>
                ) : null}
              </div>
            </div>
          </div>

          {/* Background Decor */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-primary/10 rounded-full blur-[150px] -z-10 animate-pulse" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
          <Zap className="absolute top-20 -left-20 h-48 w-48 md:h-96 md:w-48 text-primary/10 -rotate-45 animate-float opacity-30" />
          <Activity className="absolute bottom-20 -right-20 h-64 w-64 md:h-[500px] md:w-64 text-primary/10 rotate-45 animate-float opacity-30" style={{ animationDelay: '2s' }} />
        </section>

        {/* Tech Specs Grid */}
        <section className="py-32 md:py-48 relative">
          <div className="absolute inset-0 bg-white/2 backdrop-blur-3xl -z-10 border-y border-white/5" />
          <div className="container mx-auto px-6">
            <div className="text-center mb-24 md:mb-32 space-y-6">
              <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 font-black px-4 py-1 uppercase text-[10px] tracking-widest">System Protocols</Badge>
              <h2 className="text-4xl md:text-7xl font-black tracking-tighter text-white">Технологии <span className="text-primary">будущего</span></h2>
              <p className="text-white/40 text-sm md:text-xl font-medium max-w-2xl mx-auto uppercase tracking-widest">Биометрия, нейросети и облачная синхронизация в одной экосистеме.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16">
              {[
                {
                  title: "Bio-Score 4.0",
                  desc: "Голографический индекс здоровья, рассчитываемый нейросетью в реальном времени.",
                  icon: LineChart,
                  color: "bg-blue-600 shadow-blue-500/40"
                },
                {
                  title: "Нейро-сканер еды",
                  desc: "Мгновенное распознавание молекулярного состава блюда по фото с точностью до 98%.",
                  icon: Utensils,
                  color: "bg-cyan-600 shadow-cyan-500/40"
                },
                {
                  title: "Smart Sync 2.0",
                  desc: "Бесшовное слияние с Apple Health, Google Fit и носимыми биометрическими сенсорами.",
                  icon: Smartphone,
                  color: "bg-indigo-600 shadow-indigo-500/40"
                }
              ].map((f, i) => (
                <div key={i} className="cyber-card p-10 md:p-16 border-none space-y-10 group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className={f.color + " w-20 h-20 md:w-24 md:h-24 rounded-3xl flex items-center justify-center shadow-[0_0_40px_-5px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-500 relative z-10"}>
                    <f.icon className="h-10 w-10 md:h-12 md:w-12 text-white" />
                  </div>
                  <div className="space-y-4 relative z-10">
                    <h3 className="text-2xl md:text-3xl font-black tracking-tight text-white">{f.title}</h3>
                    <p className="text-white/50 text-base md:text-lg font-medium leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Security / Neural Protection */}
        <section className="py-32 md:py-64">
          <div className="container mx-auto px-6">
            <div className="glass-panel p-12 md:p-32 flex flex-col lg:flex-row items-center gap-16 md:gap-32 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,rgba(14,165,233,0.1),transparent_70%)]" />
              <div className="flex-1 space-y-8 md:space-y-16 relative z-10 text-center lg:text-left">
                <Badge className="bg-primary/20 text-primary border-primary/40 font-black px-6 py-2 uppercase tracking-widest text-xs">Security Protocol: Active</Badge>
                <h2 className="text-4xl md:text-8xl font-black tracking-tighter leading-[0.85] text-white">ТВОИ ДАННЫЕ — <br /><span className="text-primary">ТВОЯ КРЕПОСТЬ</span></h2>
                <div className="space-y-6 md:space-y-8">
                  {[
                    "Нейронное шифрование AES-512",
                    "Полная децентрализация био-архива",
                    "ИИ-верификация медицинских данных"
                  ].map((text, i) => (
                    <div key={i} className="flex items-center gap-6 text-base md:text-2xl font-black text-white/80 justify-center lg:justify-start">
                      <CheckCircle2 className="h-6 w-6 md:h-10 md:w-10 text-primary shrink-0 neo-glow" />
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-8">
                  <Button asChild variant="secondary" className="w-full sm:w-auto rounded-2xl h-20 md:h-24 px-12 text-lg md:text-2xl font-black bg-primary text-slate-950 shadow-primary/20 hover:scale-105 transition-all">
                     <Link href="/register">СОЗДАТЬ ID В ХАБЕ</Link>
                  </Button>
                </div>
              </div>
              <div className="flex-1 flex justify-center relative z-10">
                <div className="relative w-64 h-64 md:w-[500px] md:h-[500px]">
                   <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping duration-[4000ms] opacity-30" />
                   <div className="relative w-full h-full bg-slate-900 rounded-[5rem] shadow-[0_0_100px_rgba(14,165,233,0.3)] flex items-center justify-center border-4 border-primary/20 backdrop-blur-3xl overflow-hidden">
                      <div className="scan-line" />
                      <ShieldCheck className="h-32 w-32 md:h-64 md:w-64 text-primary neo-glow-strong" />
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 py-24 md:py-48 bg-slate-950/40 backdrop-blur-xl relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="container mx-auto px-6 text-center space-y-16">
          <div className="flex justify-center items-center gap-4">
            <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(14,165,233,0.5)]">
              <Activity className="h-8 w-8 text-slate-950" />
            </div>
            <span className="font-headline font-black tracking-tighter text-3xl md:text-5xl text-white uppercase">PRO <span className="text-primary">Себя</span></span>
          </div>
          <div className="flex flex-wrap justify-center gap-12 text-[10px] md:text-[13px] font-black uppercase tracking-[0.4em] text-white/30">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Protocol</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-primary transition-colors">Neural Support</Link>
          </div>
          <div className="space-y-4">
             <p className="text-white/10 text-[9px] md:text-[12px] uppercase tracking-[0.8em] font-black italic">Holographic Biometric Interface v4.0.2</p>
             <p className="text-white/5 text-[8px] md:text-[10px] uppercase tracking-[0.5em] font-black">© 2024 NEXT GEN BIOTECH LABS. ALL RIGHTS RESERVED.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
