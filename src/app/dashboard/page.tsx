"use client";

import { useState } from 'react';
import { NavBar } from '@/components/nav-bar';
import { RecommendationForm } from '@/components/recommendation-form';
import { RecommendationDisplay } from '@/components/recommendation-display';
import { GenerateRecommendationsOutput } from '@/ai/flows/generate-personalized-recommendations';
import { Button } from '@/components/ui/button';
import { RefreshCw, History, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Activity, Sparkles } from 'lucide-react';
import { format, addDays, startOfToday, isPast, isFuture, isToday as isDateToday } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  const [result, setResult] = useState<GenerateRecommendationsOutput | null>(null);
  const [selectedDate, setSelectedDate] = useState(startOfToday());

  const getStatusLabel = (date: Date) => {
    if (isDateToday(date)) return "Сегодня";
    if (isPast(date)) return "История";
    if (isFuture(date)) return "Прогноз";
    return "";
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAF9]">
      <NavBar />
      
      {/* Fixed Classic Navigation Bar */}
      <div className="bg-white/80 backdrop-blur-xl border-b sticky top-20 z-40 py-6 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-2xl h-12 w-12 hover:bg-primary/5 transition-all" 
                onClick={() => setSelectedDate(prev => addDays(prev, -1))}
              >
                <ChevronLeft className="h-6 w-6 text-primary" />
              </Button>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" className="px-6 h-14 rounded-3xl flex flex-col items-start gap-0.5 hover:bg-primary/5 transition-all">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 leading-none">
                      {getStatusLabel(selectedDate)}
                    </span>
                    <span className="text-2xl font-black tracking-tighter flex items-center gap-2">
                      {format(selectedDate, 'd MMMM yyyy', { locale: ru })}
                      <CalendarIcon className="h-4 w-4 text-primary opacity-40" />
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-[2.5rem] overflow-hidden shadow-2xl border-none mt-4" align="center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                    locale={ru}
                  />
                </PopoverContent>
              </Popover>

              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-2xl h-12 w-12 hover:bg-primary/5 transition-all"
                onClick={() => setSelectedDate(prev => addDays(prev, 1))}
              >
                <ChevronRight className="h-6 w-6 text-primary" />
              </Button>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
             <Badge className="bg-secondary/10 text-secondary border-none px-6 py-2 rounded-2xl font-black uppercase tracking-widest text-[9px]">
               Биометрический статус: Активен
             </Badge>
          </div>
        </div>
      </div>

      <main className="container mx-auto flex-1 px-4 py-16">
        <div className="mb-16 flex flex-col lg:flex-row lg:items-end justify-between gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
               <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center shadow-inner">
                  <Sparkles className="h-8 w-8 text-primary" />
               </div>
               <div>
                  <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-foreground">
                    Кабинет Здоровья
                  </h1>
                  <p className="text-muted-foreground text-xl font-medium max-w-xl leading-snug">
                    {isFuture(selectedDate) 
                      ? 'Ваша стратегия долголетия и прогноз состояния.' 
                      : 'Аналитический отчет и рекомендации на основе ваших данных.'}
                  </p>
               </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="lg" className="rounded-3xl border-2 h-20 w-20 p-0 hover:bg-primary/5 transition-all shadow-sm">
              <History className="h-8 w-8 text-muted-foreground" />
            </Button>
            {result && (
              <Button 
                variant="default" 
                size="lg"
                onClick={() => setResult(null)}
                className="rounded-3xl h-20 px-10 bg-secondary font-black uppercase tracking-widest text-xs gap-4 shadow-2xl shadow-secondary/20 hover:scale-105 active:scale-95 transition-all"
              >
                <RefreshCw className="h-6 w-6" /> Обновить данные
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-16">
          {!result && (
            <div className="max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-bottom-12 duration-1000">
              <RecommendationForm onResult={setResult} selectedDate={selectedDate} />
            </div>
          )}

          {result && (
            <div className="space-y-16 animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-out">
              <RecommendationDisplay data={result} />
            </div>
          )}
        </div>
      </main>
      
      <footer className="mt-40 border-t py-20 bg-white/50 backdrop-blur-md">
        <div className="container mx-auto px-4 text-center space-y-6">
          <div className="flex justify-center items-center gap-3">
             <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                <Activity className="h-5 w-5 text-primary" />
             </div>
             <span className="font-headline font-black tracking-tighter text-2xl">PRO Себя</span>
          </div>
          <div className="max-w-lg mx-auto">
             <p className="text-muted-foreground font-black uppercase tracking-[0.3em] text-[10px] mb-2">Интеллектуальная биометрическая платформа.</p>
             <p className="text-muted-foreground/40 text-[9px] leading-relaxed">Система использует передовые алгоритмы машинного обучения для корреляции ваших клинических показателей, образа жизни и нутритивного статуса. Данные не являются медицинским диагнозом.</p>
          </div>
          <p className="text-muted-foreground/30 text-[8px] uppercase tracking-[0.5em] pt-8">© 2024 NEXT GEN BIOTECH LABS. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>
    </div>
  );
}
