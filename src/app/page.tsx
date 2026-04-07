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
        <section className="relative container mx-auto px-4 pt-20 pb-32 text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full -z-10 opacity-40">
            <div className="absolute top-10 left-10 w-72 h-72 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-[120px] animate-pulse delay-700" />
          </div>

          <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-6xl md:text-8xl font-black font-headline tracking-tighter leading-[0.95] animate-in fade-in slide-in-from-bottom-8 duration-1000">
              Ваше тело заслуживает <br />
              <span className="text-gradient italic">персонального</span> подхода
            </h1>
            
            <p className="max-w-2xl mx-auto text-xl md:text-2xl text-muted-foreground font-medium leading-relaxed animate-in fade-in duration-1000 delay-300">
              PRO Себя — это персональный ИИ-нутрициолог, который анализирует ваши данные и анализы для создания идеального плана здоровья.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-8 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
              <Link href="/register">
                <Button size="lg" className="h-16 px-10 text-xl font-bold rounded-full bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/30 transition-all hover:scale-105">
                  Начать бесплатно <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="ghost" className="h-16 px-10 text-xl font-bold rounded-full hover:bg-primary/5 transition-colors">
                  Узнать больше
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-24 border-t border-primary/5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
            {[
              { 
                icon: Zap, 
                title: "Мгновенный анализ", 
                text: "Получите детальный план питания и тренировок за 30 секунд. Наш ИИ обрабатывает сотни параметров." 
              },
              { 
                icon: ShieldCheck, 
                title: "Конфиденциальность", 
                text: "Ваши медицинские данные под надежной защитой. Мы не передаем информацию третьим лицам." 
              },
              { 
                icon: Activity, 
                title: "Научный подход", 
                text: "Используем актуальные рекомендации ВОЗ и передовые модели Gemini AI для максимальной точности." 
              }
            ].map((feature, i) => (
              <div key={i} className="glass-card p-10 rounded-[2.5rem] group hover:border-primary/20 transition-all duration-500 hover:-translate-y-2">
                <div className="bg-primary/10 w-16 h-16 rounded-[1.25rem] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">{feature.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-24 bg-primary/5">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-12">Почему нам доверяют</h2>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16">
              {["100% Персонализация", "AI Анализ анализов", "Поддержка 24/7", "Доказательная медицина"].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-lg font-bold text-primary/80">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-16 border-t bg-white">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="font-headline text-2xl font-bold tracking-tighter">PRO Себя</span>
          </div>
          <p className="text-muted-foreground font-medium order-3 md:order-2">© 2024 PRO Себя. Сделано с заботой.</p>
          <div className="flex gap-10 text-sm font-bold text-primary order-2 md:order-3">
            <Link href="#" className="hover:opacity-70 transition-opacity">Помощь</Link>
            <Link href="#" className="hover:opacity-70 transition-opacity">Конфиденциальность</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}