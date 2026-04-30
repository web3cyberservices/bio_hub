'use client';

import { NavBar } from '@/components/nav-bar';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ArrowLeft, Lock, Database, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/30 selection:text-primary">
      <NavBar />
      <main className="container mx-auto pt-32 pb-20 px-6 max-w-4xl">
        <Link href="/">
          <Button variant="ghost" className="mb-8 gap-2 text-white/40 hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> На главную
          </Button>
        </Link>

        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic">Политика <span className="text-primary">Конфиденциальности</span></h1>
            <p className="text-white/40 font-black uppercase tracking-[0.3em] text-xs">Security Protocol v4.0.26-BY</p>
          </div>

          <div className="grid gap-8">
            <section className="p-8 rounded-[2rem] bg-white/5 border border-white/10 space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <Lock className="h-5 w-5" />
                <h2 className="text-xl font-black uppercase">1. Шифрование и защита</h2>
              </div>
              <p className="text-white/70 leading-relaxed font-medium">
                Все персональные данные, включая биометрические показатели и результаты анализов, защищены по стандарту <strong>AES-256</strong>. Данные в пути шифруются с использованием протокола <strong>TLS 1.3</strong>. Чувствительная информация (лекарства, диагнозы) подвергается клиентскому шифрованию перед отправкой в облако.
              </p>
            </section>

            <section className="p-8 rounded-[2rem] bg-white/5 border border-white/10 space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <Database className="h-5 w-5" />
                <h2 className="text-xl font-black uppercase">2. Сбор и использование</h2>
              </div>
              <p className="text-white/70 leading-relaxed font-medium">
                Мы собираем данные Google Fit (шаги, пульс, сон) исключительно для работы ИИ-алгоритмов Bio-Score и формирования персональных рекомендаций. Мы никогда не передаем ваши данные третьим лицам для рекламных целей.
              </p>
            </section>

            <section className="p-8 rounded-[2rem] bg-white/5 border border-white/10 space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <EyeOff className="h-5 w-5" />
                <h2 className="text-xl font-black uppercase">3. Удаление данных</h2>
              </div>
              <p className="text-white/70 leading-relaxed font-medium">
                Пользователь имеет право в любой момент запросить полное удаление своего аккаунта и всех связанных с ним биометрических архивов через настройки профиля или обратившись в поддержку.
              </p>
            </section>
          </div>

          <footer className="pt-8 border-t border-white/5 text-center">
            <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">
              Последнее обновление: 20 мая 2024 г. <br />
              NEXT GEN BIOTECH LABS
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
