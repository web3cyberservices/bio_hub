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
        <section className="relative container mx-auto px-4 pt-16 pb-24 text-center">
          {/* Animated Background Blobs */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[600px] -z-10 overflow-hidden opacity-60">
            <div className="absolute top-[10%] left-[5%] w-80 h-80 bg-primary/10 rounded-full blur-[120px] animate-pulse duration-[8s]" />
            <div className="absolute bottom-[20%] right-[10%] w-[450px] h-[450px] bg-secondary/10 rounded-full blur-[140px] animate-pulse delay-1000 duration-[10s]" />
            <div className="absolute top-[40%] left-[30%] w-64 h-64 bg-accent/20 rounded-full blur-[100px] animate-pulse delay-2000" />
          </div>

          <div className="space-y-8 max-w-5xl mx-auto relative">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary font-bold text-sm mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Sparkles className="h-4 w-4" />
              <span>Будущее персонализированной медицины</span>
            </div>
            
            <h1 className="text-5xl md:text-8xl font-black font-headline tracking-tighter leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-1000">
              Ваше тело заслуживает <br />
              <span className="text-gradient italic">персонального</span> подхода
            </h1>
            
            <p className="max-w-2xl mx-auto text-lg md:text-2xl text-muted-foreground font-medium leading-relaxed animate-in fade-in duration-1000 delay-300">
              PRO Себя — это персональный ИИ-нутрициолог, который анализирует ваши данные и анализы для создания идеального плана здоровья.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
              <Link href="/register">
                <Button size="lg" className="h-16 px-10 text-xl font-bold rounded-full bg-primary hover:bg-primary/90 shadow-[0_20px_50px_rgba(20,184,166,0.3)] transition-all hover:scale-105 active:scale-95">
                  Начать бесплатно <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="ghost" className="h-16 px-10 text-xl font-bold rounded-full hover:bg-primary/5 transition-colors border-2 border-transparent hover:border-primary/10">
                  Узнать больше
                </Button>
              </Link>
            </div>

            {/* Micro Stats */}
            <div className="flex items-center justify-center gap-8 pt-12 animate-in fade-in duration-1000 delay-700">
              <div className="text-center">
                <p className="text-3xl font-black text-foreground">98%</p>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Точность</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <p className="text-3xl font-black text-foreground">24/7</p>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Поддержка</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <p className="text-3xl font-black text-foreground">100%</p>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Приватность</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-3xl md:text-5xl font-black font-headline tracking-tight text-foreground">Умные технологии для жизни</h2>
            <p className="text-lg text-muted-foreground font-medium">Почему PRO Себя — лучший выбор для вашего здоровья</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { 
                icon: Zap, 
                title: "Мгновенный анализ", 
                text: "Получите детальный план питания и тренировок за 30 секунд. Наш ИИ обрабатывает сотни параметров вашего организма." 
              },
              { 
                icon: ShieldCheck, 
                title: "Конфиденциальность", 
                text: "Ваши медицинские данные под надежной защитой. Мы используем шифрование банковского уровня и не передаем данные." 
              },
              { 
                icon: Activity, 
                title: "Научный подход", 
                text: "Используем актуальные рекомендации ВОЗ и передовые модели Gemini AI для достижения максимальной точности советов." 
              }
            ].map((feature, i) => (
              <div key={i} className="glass-card p-10 rounded-[3rem] group hover:border-primary/30 transition-all duration-500 hover:-translate-y-3 flex flex-col items-center text-center">
                <div className="bg-primary/10 w-20 h-20 rounded-[2rem] flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-500">
                  <feature.icon className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-black mb-4 tracking-tight">{feature.title}</h3>
                <p className="text-lg text-muted-foreground leading-relaxed font-medium">{feature.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-20 bg-primary/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-30">
            <div className="absolute top-[-50%] left-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px]" />
          </div>
          
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-black mb-12 tracking-tight">Безопасность и Экспертность</h2>
            <div className="flex flex-wrap justify-center gap-6 md:gap-12">
              {[
                "100% Персонализация", 
                "AI Анализ анализов", 
                "Поддержка 24/7", 
                "Доказательная медицина"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 px-6 py-4 bg-white rounded-3xl shadow-sm border border-primary/10 text-lg font-bold text-primary transition-transform hover:scale-105">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="container mx-auto px-4 py-24 text-center">
          <div className="max-w-4xl mx-auto glass-card p-12 md:p-20 rounded-[4rem] bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/10">
            <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tighter">Готовы изменить свою <br /><span className="text-primary italic">жизнь</span>?</h2>
            <p className="text-xl text-muted-foreground mb-10 font-medium max-w-xl mx-auto">Присоединяйтесь к тысячам пользователей, которые уже доверили свое здоровье PRO Себя.</p>
            <Link href="/register">
              <Button size="lg" className="h-16 px-12 text-xl font-bold rounded-full bg-primary hover:bg-primary/90 shadow-xl transition-all">
                Создать профиль сейчас
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="py-16 border-t bg-white">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <span className="font-headline text-3xl font-black tracking-tighter">PRO Себя</span>
            </div>
            <p className="text-muted-foreground font-medium text-center md:text-left max-w-xs leading-relaxed">
              Ваш персональный гид в мире здоровья и биохакинга на базе искусственного интеллекта.
            </p>
          </div>
          
          <div className="flex flex-col items-center md:items-end gap-6">
            <div className="flex gap-10 text-sm font-black text-primary uppercase tracking-widest">
              <Link href="#" className="hover:opacity-70 transition-opacity">Помощь</Link>
              <Link href="#" className="hover:opacity-70 transition-opacity">Конфиденциальность</Link>
              <Link href="#" className="hover:opacity-70 transition-opacity">Контакты</Link>
            </div>
            <p className="text-muted-foreground font-medium">© 2024 PRO Себя. Сделано с заботой о вас.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
