import Link from 'next/link';
import { NavBar } from '@/components/nav-bar';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, ShieldCheck, Zap, Activity } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background hero-gradient">
      <NavBar />
      <main className="flex-1 flex flex-col items-center justify-center">
        <section className="container mx-auto px-4 py-12 md:py-20 text-center">
          <h1 className="text-5xl md:text-7xl font-bold font-headline mb-8 leading-[1.1] animate-in fade-in slide-in-from-bottom-4 duration-700">
            Ваше тело заслуживает <br />
            <span className="text-primary italic">персонального</span> подхода
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-10 animate-in fade-in duration-1000">
            PRO Себя — это не просто калькулятор калорий. Это ваш личный ИИ-нутрициолог, который понимает ваш организм на основе данных и анализов.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <Link href="/register">
              <Button size="lg" className="h-16 px-10 text-xl font-bold rounded-full bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/20 transition-all hover:scale-105">
                Начать сейчас <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="ghost" className="h-16 px-10 text-xl font-bold rounded-full hover:bg-primary/5">
                Уже есть аккаунт?
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { icon: Zap, title: "Мгновенный анализ", text: "Получите рекомендации за 30 секунд" },
              { icon: ShieldCheck, title: "Безопасность", text: "Ваши данные зашифрованы и анонимны" },
              { icon: Activity, title: "Точность", text: "Используем научные формулы и Gemini AI" }
            ].map((feature, i) => (
              <div key={i} className="glass-card p-8 rounded-[2rem] text-left hover:border-primary/30 transition-all">
                <div className="bg-primary/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <footer className="py-10 border-t bg-white/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm font-medium text-muted-foreground">© 2024 PRO Себя. С заботой о вашем здоровье.</p>
          <div className="flex gap-8 text-sm font-bold text-primary">
            <Link href="#" className="hover:underline">Политика конфиденциальности</Link>
            <Link href="#" className="hover:underline">Поддержка</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
