import Link from 'next/link';
import Image from 'next/image';
import { NavBar } from '@/components/nav-bar';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, FlaskConical, Utensils, HeartPulse } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-healthy-food');

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-white py-20 lg:py-32">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center gap-12 lg:flex-row">
              <div className="flex-1 space-y-8 text-center lg:text-left">
                <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                  Ваш путь к <span className="text-primary italic">совершенному</span> здоровью с ИИ
                </h1>
                <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">
                  NutriPath AI анализирует ваши показатели, образ жизни и анализы, чтобы составить персональный план питания и добавок.
                </p>
                <div className="flex flex-wrap justify-center gap-4 lg:justify-start">
                  <Link href="/register">
                    <Button size="lg" className="h-14 px-8 text-lg font-semibold bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20">
                      Начать бесплатно <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/about">
                    <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-semibold border-secondary text-secondary hover:bg-secondary/5">
                      Узнать больше
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative flex-1">
                <div className="relative h-[300px] w-full overflow-hidden rounded-3xl shadow-2xl sm:h-[400px] lg:h-[500px]">
                  {heroImage && (
                    <Image
                      src={heroImage.imageUrl}
                      alt={heroImage.description}
                      fill
                      className="object-cover"
                      data-ai-hint={heroImage.imageHint}
                    />
                  )}
                </div>
                <div className="absolute -bottom-6 -left-6 rounded-2xl bg-white p-6 shadow-xl ring-1 ring-border sm:p-8">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-accent/20 p-3">
                      <HeartPulse className="h-6 w-6 text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Персональный подход</p>
                      <p className="text-xl font-bold">100% Уникальность</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-muted/30 py-24">
          <div className="container mx-auto px-4">
            <div className="mb-16 text-center space-y-4">
              <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">Как это работает?</h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                Простая и эффективная система анализа вашего организма
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: 'Анализ данных',
                  desc: 'Вводите рост, вес, возраст и уровень активности.',
                  icon: FlaskConical,
                  color: 'bg-primary'
                },
                {
                  title: 'Питание и анализы',
                  desc: 'Добавьте список продуктов и результаты ваших медицинских тестов.',
                  icon: Utensils,
                  color: 'bg-secondary'
                },
                {
                  title: 'AI Рекомендации',
                  desc: 'Получите детальный план образа жизни, диеты и подбор БАДов.',
                  icon: CheckCircle2,
                  color: 'bg-accent'
                }
              ].map((item, i) => (
                <div key={i} className="group relative rounded-2xl bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
                  <div className={`${item.color}/10 mb-6 inline-flex rounded-2xl p-4 transition-colors group-hover:scale-110`}>
                    <item.icon className={`h-8 w-8 ${item.color.replace('bg-', 'text-')}`} />
                  </div>
                  <h3 className="mb-3 text-xl font-bold">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2024 NutriPath AI. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
}
