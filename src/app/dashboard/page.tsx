"use client";

import { useState } from 'react';
import { NavBar } from '@/components/nav-bar';
import { RecommendationForm } from '@/components/recommendation-form';
import { RecommendationDisplay } from '@/components/recommendation-display';
import { GenerateRecommendationsOutput } from '@/ai/flows/generate-personalized-recommendations';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Activity, Sparkles, Calendar as CalendarIcon } from 'lucide-react';
import { format, addDays, startOfToday, isPast, isFuture, isToday as isDateToday } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

export default function DashboardPage() {
  const [result, setResult] = useState<GenerateRecommendationsOutput | null>(null);
  const [selectedDate, setSelectedDate] = useState(startOfToday());

  const getStatusLabel = (date: Date) => {
    if (isDateToday(date)) return "СЕГОДНЯ";
    if (isPast(date)) return "ИСТОРИЯ";
    if (isFuture(date)) return "ПРОГНОЗ";
    return "";
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F0F7F2]">
      <NavBar />
      
      {/* Sticky Navigation Bar */}
      <div className="bg-white/90 backdrop-blur-xl border-b sticky top-20 z-40 py-2 md:py-4 shadow-sm">
        <div className="container mx-auto px-4 flex items-center justify-center gap-4">
          <div className="flex items-center gap-1 md:gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-xl h-9 w-9 md:h-10 md:w-10 hover:bg-primary/5 transition-all" 
              onClick={() => setSelectedDate(prev => addDays(prev, -1))}
            >
              <ChevronLeft className="h-5 w-5 text-primary" />
            </Button>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="px-2 md:px-4 h-12 md:h-14 rounded-2xl flex flex-col items-center justify-center gap-0.5 hover:bg-primary/5 transition-all min-w-[140px] md:min-w-[180px]">
                  <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 leading-none">
                    {getStatusLabel(selectedDate)}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm md:text-xl font-bold tracking-tight">
                      {format(selectedDate, 'd MMMM yyyy', { locale: ru })}
                    </span>
                    <CalendarIcon className="h-3 w-3 md:h-4 md:w-4 text-primary opacity-30" />
                  </div>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[calc(100vw-2rem)] md:w-auto p-0 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.15)] border-none mt-2 md:mt-4" align="center">
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
              className="rounded-xl h-9 w-9 md:h-10 md:w-10 hover:bg-primary/5 transition-all"
              onClick={() => setSelectedDate(prev => addDays(prev, 1))}
            >
              <ChevronRight className="h-5 w-5 text-primary" />
            </Button>
          </div>
        </div>
      </div>

      <main className="container mx-auto flex-1 px-4 py-8 md:py-16">
        <div className="mb-10 md:mb-16 flex flex-col lg:flex-row lg:items-end justify-between gap-8 md:gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-inner shrink-0">
                  <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-primary" />
               </div>
               <div>
                  <h1 className="text-3xl sm:text-4xl md:text-7xl font-black tracking-tighter text-foreground leading-none">
                    Кабинет Здоровья
                  </h1>
                  <p className="text-muted-foreground text-base md:text-xl font-medium max-w-xl leading-snug mt-2">
                    {isFuture(selectedDate) 
                      ? 'Ваша стратегия долголетия и прогноз состояния.' 
                      : 'Аналитический отчет и рекомендации на основе ваших данных.'}
                  </p>
               </div>
            </div>
          </div>
        </div>

        <div className="grid gap-10 md:gap-16">
          {!result && (
            <div className="max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-bottom-12 duration-1000">
              <RecommendationForm onResult={setResult} selectedDate={selectedDate} />
            </div>
          )}

          {result && (
            <div className="space-y-10 md:space-y-16 animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-out">
              <RecommendationDisplay data={result} />
            </div>
          )}
        </div>
      </main>
      
      <footer className="mt-20 md:mt-40 border-t py-12 md:py-20 bg-white/50 backdrop-blur-md">
        <div className="container mx-auto px-4 text-center space-y-6">
          <div className="flex justify-center items-center gap-3">
             <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                <Activity className="h-4 w-4 md:h-5 md:w-5 text-primary" />
             </div>
             <span className="font-headline font-black tracking-tighter text-xl md:text-2xl">PRO Себя</span>
          </div>
          <div className="max-w-lg mx-auto">
             <p className="text-muted-foreground font-black uppercase tracking-[0.3em] text-[8px] md:text-[10px] mb-2">Интеллектуальная биометрическая платформа.</p>
             <p className="text-muted-foreground/40 text-[8px] md:text-[9px] leading-relaxed">Система использует передовые алгоритмы машинного обучения для корреляции ваших клинических показателей. Не является медицинским диагнозом.</p>
          </div>
          <p className="text-muted-foreground/30 text-[7px] md:text-[8px] uppercase tracking-[0.5em] pt-4 md:pt-8">© 2024 NEXT GEN BIOTECH LABS. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>
    </div>
  );
}
