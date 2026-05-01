'use client';

import { NavBar } from '@/components/nav-bar';
import { Button } from '@/components/ui/button';
import { FileText, ArrowLeft, Scale, AlertTriangle, UserCheck } from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
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
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic">Условия <span className="text-primary">Использования</span></h1>
            <p className="text-white/40 font-black uppercase tracking-[0.3em] text-xs">User Agreement v1.0.26-BY</p>
          </div>

          <div className="grid gap-8">
            <section className="p-8 rounded-[2rem] bg-white/5 border border-white/10 space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <Scale className="h-5 w-5" />
                <h2 className="text-xl font-black uppercase">1. Интеллектуальная собственность</h2>
              </div>
              <p className="text-white/70 leading-relaxed font-medium">
                Данное ПО, включая уникальные алгоритмы «био-скоринга» и концепцию «цифрового двойника», является объектом авторского права. Лицензия предоставляется пользователю исключительно для личного некоммерческого использования в целях мониторинга здоровья.
              </p>
            </section>

            <section className="p-8 rounded-[2rem] bg-amber-500/5 border border-amber-500/20 space-y-4">
              <div className="flex items-center gap-3 text-amber-500">
                <AlertTriangle className="h-5 w-5" />
                <h2 className="text-xl font-black uppercase">2. Медицинская оговорка</h2>
              </div>
              <p className="text-white/70 leading-relaxed font-medium">
                Сервис <strong>Bio Hub Pro</strong> использует искусственный интеллект для анализа данных. ИИ-рекомендации не являются постановкой диагноза, не являются врачебным назначением и не заменяют очную консультацию квалифицированного специалиста.
              </p>
            </section>

            <section className="p-8 rounded-[2rem] bg-white/5 border border-white/10 space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <UserCheck className="h-5 w-5" />
                <h2 className="text-xl font-black uppercase">3. Ответственность</h2>
              </div>
              <p className="text-white/70 leading-relaxed font-medium">
                Пользователь несет полную ответственность за достоверность вводимых данных. Предоставляя доступ специалисту (врачу/нутрициологу), вы добровольно открываете ему доступ к своему биометрическому профилю и архиву анализов.
              </p>
            </section>
          </div>

          <footer className="pt-8 border-t border-white/5 text-center">
            <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">
              © 2024 NEXT GEN BIOTECH LABS. <br />
              All rights reserved.
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
