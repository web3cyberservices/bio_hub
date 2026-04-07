import Link from 'next/link';
import { NavBar } from '@/components/nav-bar';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, FlaskConical, Utensils, HeartPulse, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <NavBar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 lg:py-40">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center text-center space-y-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                <Sparkles className="h-4 w-4" />
                <span>ИИ Нутрициолог будущего</span>
              </div>
              <div className="space-y-6 max-w-4xl">
                <h1 className="text-5xl font-bold tracking-tight sm:text-7xl lg:text-8xl font-headline leading-[1.1]">
                  Ваш путь к <span className="text-primary">совершенному</span> здоровью с <span className="italic">PRO Себя</span>
                </h1>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-2xl leading-relaxed">
                  Мы анализируем ваши показатели, образ жизни и анализы, чтобы составить по-настоящему персональный план питания и долголетия.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-6 pt-4">
                <Link href="/register">
                  <Button size="lg" className="h-16 px-10 text-xl font-bold rounded-full bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/20 transition-transform hover:scale-105">
                    Начать бесплатно <ArrowRight className="ml-2 h-6 w-6" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button size="lg" variant="outline" className="h-16 px-10 text-xl font-bold rounded-full border-2 border-primary text-primary hover:bg-primary/5 transition-transform hover:scale-105">
                    Узнать больше
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -z-10 top-1/2 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -z-10 bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[120px] pointer-events-none" />
        </section>

        {/* Features Section */}
        <section className="bg-white/50 backdrop-blur-sm py-32 border-y border-primary/10">
          <div className="container mx-auto px-4">
            <div className="mb-20 text-center space-y-4">
              <h2 className="text-4xl font-bold sm:text-5xl lg:text-6xl font-headline">Как это работает?</h2>
              <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
                Три простых шага к вашему новому качеству жизни
              </p>
            </div>
            <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: 'Анализ данных',
                  desc: 'Вводите рост, вес, возраст и уровень активности. Наша система мгновенно строит ваш профиль метаболизма.',
                  icon: FlaskConical,
                  color: 'bg-primary'
                },
                {
                  title: 'Питание и анализы',
                  desc: 'Добавьте список продуктов и результаты анализов. Мы найдем дефициты и скорректируем рацион.',
                  icon: Utensils,
                  color: 'bg-secondary'
                },
                {
                  title: 'AI Рекомендации',
                  desc: 'Получите детальный план образа жизни, диеты и подбор БАДов, созданный специально под вашу генетику.',
                  icon: CheckCircle2,
                  color: 'bg-accent'
                }
              ].map((item, i) => (
                <div key={i} className="group relative rounded-[2.5rem] bg-white p-10 shadow-sm border border-border/50 transition-all hover:-translate-y-2 hover:shadow-2xl">
                  <div className={`${item.color}/10 mb-8 inline-flex rounded-3xl p-5 transition-transform group-hover:rotate-12`}>
                    <item.icon className={`h-10 w-10 ${item.color.replace('bg-', 'text-')}`} />
                  </div>
                  <h3 className="mb-4 text-2xl font-bold font-headline">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-lg">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Stats/Trust Section */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { label: 'Точность ИИ', value: '99%' },
                { label: 'Пользователей', value: '10k+' },
                { label: 'Рекомендаций', value: '50k+' },
                { label: 'Параметров', value: '200+' }
              ].map((stat, i) => (
                <div key={i} className="text-center space-y-2">
                  <p className="text-4xl sm:text-5xl font-black text-primary font-headline">{stat.value}</p>
                  <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-16 bg-white/80">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
              <HeartPulse className="h-7 w-7 text-white" />
            </div>
          </div>
          <p className="text-muted-foreground font-medium italic">PRO Себя — ваша лучшая версия начинается здесь.</p>
          <p className="mt-4 text-sm text-muted-foreground/60">© 2024 PRO Себя. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
}
