
"use client";

import { useState, useEffect } from 'react';
import { NavBar } from '@/components/nav-bar';
import { RecommendationForm } from '@/components/recommendation-form';
import { RecommendationDisplay } from '@/components/recommendation-display';
import { GenerateRecommendationsOutput } from '@/ai/flows/generate-personalized-recommendations';
import { Button } from '@/components/ui/button';
import { RefreshCw, History, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { format, addDays, startOfToday } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function DashboardPage() {
  const [result, setResult] = useState<GenerateRecommendationsOutput | null>(null);
  const [selectedDate, setSelectedDate] = useState(startOfToday());
  const [days, setDays] = useState<Date[]>([]);

  useEffect(() => {
    const today = startOfToday();
    const week = Array.from({ length: 7 }, (_, i) => addDays(today, i - 3));
    setDays(week);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAF9]">
      <NavBar />
      
      {/* Calendar Navigation - Inspired by Screenshot */}
      <div className="bg-white border-b sticky top-16 z-40 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <h2 className="text-xl font-black">Сегодня</h2>
            <Button variant="ghost" size="icon"><CalendarIcon className="h-5 w-5" /></Button>
          </div>
          <div className="flex justify-between items-center gap-2">
            <Button variant="ghost" size="icon" className="hidden lg:flex"><ChevronLeft className="h-5 w-5" /></Button>
            <div className="flex-1 flex justify-between lg:justify-center lg:gap-8 overflow-x-auto no-scrollbar">
              {days.map((day, i) => {
                const isSelected = format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                const isToday = format(day, 'yyyy-MM-dd') === format(startOfToday(), 'yyyy-MM-dd');
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(day)}
                    className={`flex flex-col items-center min-w-[50px] py-2 rounded-2xl transition-all ${
                      isSelected ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'hover:bg-primary/5'
                    }`}
                  >
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? 'text-white/70' : 'text-muted-foreground'}`}>
                      {format(day, 'EEE', { locale: ru })}
                    </span>
                    <span className="text-lg font-black">{format(day, 'd')}</span>
                    {isToday && !isSelected && <div className="w-1 h-1 bg-primary rounded-full mt-1" />}
                  </button>
                );
              })}
            </div>
            <Button variant="ghost" size="icon" className="hidden lg:flex"><ChevronRight className="h-5 w-5" /></Button>
          </div>
        </div>
      </div>

      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="mb-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
              {result ? 'Ваш план на сегодня' : 'Дашборд здоровья'}
            </h1>
            <p className="text-muted-foreground font-medium">
              Персональные рекомендации на основе ваших биоритмов
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="lg" className="rounded-2xl border-2 font-bold gap-2">
              <History className="h-5 w-5" />
            </Button>
            {result ? (
              <Button 
                variant="default" 
                size="lg"
                onClick={() => setResult(null)}
                className="rounded-2xl bg-secondary font-bold gap-2"
              >
                <RefreshCw className="h-5 w-5" /> Обновить
              </Button>
            ) : (
              <Button 
                variant="default" 
                size="lg"
                className="rounded-2xl bg-primary font-bold gap-2 shadow-xl shadow-primary/20"
              >
                <Plus className="h-5 w-5" /> Добавить данные
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Левая панель - Форма */}
          {!result && (
            <div className="lg:col-span-12 max-w-4xl mx-auto w-full">
              <RecommendationForm onResult={setResult} />
            </div>
          )}

          {/* Результат - Виджеты как на скриншоте */}
          {result && (
            <div className="lg:col-span-12 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <RecommendationDisplay data={result} />
            </div>
          )}
        </div>
      </main>
      
      <footer className="mt-20 border-t py-12 bg-white">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground font-medium">PRO Себя — ИИ-платформа для управления здоровьем.</p>
        </div>
      </footer>

      {/* Mobile Floating Action Button */}
      <Button className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-primary shadow-2xl lg:hidden">
        <Plus className="h-8 w-8 text-white" />
      </Button>
    </div>
  );
}
