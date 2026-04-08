"use client";

import { useState, useEffect } from 'react';
import { NavBar } from '@/components/nav-bar';
import { RecommendationForm } from '@/components/recommendation-form';
import { RecommendationDisplay } from '@/components/recommendation-display';
import { GenerateRecommendationsOutput } from '@/ai/flows/generate-personalized-recommendations';
import { Button } from '@/components/ui/button';
import { RefreshCw, History, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Info } from 'lucide-react';
import { format, addDays, startOfToday, isSameDay, isToday as isDateToday, isPast, isFuture } from 'date-fns';
import { ru } from 'date-fns/locale';
import { UnifiedDataEntry } from '@/components/unified-data-entry';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  const [result, setResult] = useState<GenerateRecommendationsOutput | null>(null);
  const [selectedDate, setSelectedDate] = useState(startOfToday());
  const [days, setDays] = useState<Date[]>([]);

  useEffect(() => {
    // Generate a week range centered around selectedDate
    const range = Array.from({ length: 7 }, (_, i) => addDays(selectedDate, i - 3));
    setDays(range);
  }, [selectedDate]);

  const getStatusLabel = (date: Date) => {
    if (isDateToday(date)) return "Сегодня";
    if (isPast(date)) return "Прошлое";
    if (isFuture(date)) return "План";
    return "";
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAF9]">
      <NavBar />
      
      {/* Calendar Navigation */}
      <div className="bg-white/60 backdrop-blur-md border-b sticky top-20 z-40 py-4 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <h2 className="text-xl font-black">{getStatusLabel(selectedDate)}</h2>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon"><CalendarIcon className="h-5 w-5" /></Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-[2.5rem] overflow-hidden shadow-2xl border-none" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                  locale={ru}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex justify-between items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="hidden lg:flex rounded-xl" 
              onClick={() => setSelectedDate(prev => addDays(prev, -1))}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1 flex justify-around lg:justify-center lg:gap-8 overflow-x-auto no-scrollbar">
              {days.map((day, i) => {
                const isSelected = isSameDay(day, selectedDate);
                const isToday = isDateToday(day);
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(day)}
                    className={`flex flex-col items-center min-w-[70px] py-3 px-2 rounded-2xl transition-all duration-300 ${
                      isSelected ? 'bg-primary text-white shadow-xl shadow-primary/30 scale-105' : 'hover:bg-primary/5'
                    }`}
                  >
                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 ${isSelected ? 'text-white/70' : 'text-muted-foreground'}`}>
                      {format(day, 'EEE', { locale: ru })}
                    </span>
                    <span className="text-2xl font-black">{format(day, 'd')}</span>
                    {isToday && !isSelected && <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5" />}
                  </button>
                );
              })}
            </div>
            
            <div className="hidden lg:flex items-center gap-2">
               <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-xl border-2 hover:bg-primary/5 h-12 w-12"><CalendarIcon className="h-5 w-5" /></Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-[2.5rem] overflow-hidden shadow-2xl border-none" align="end">
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
                className="rounded-xl h-12 w-12"
                onClick={() => setSelectedDate(prev => addDays(prev, 1))}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto flex-1 px-4 py-12">
        <div className="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-foreground">
                {format(selectedDate, 'd MMMM', { locale: ru })}
              </h1>
              <Badge className="bg-primary/10 text-primary border-none px-4 py-1.5 font-black uppercase tracking-widest text-[10px]">
                {getStatusLabel(selectedDate)}
              </Badge>
            </div>
            <p className="text-muted-foreground text-lg font-medium max-w-xl leading-snug">
              {isFuture(selectedDate) 
                ? 'Формируем вашу стратегию здоровья на будущий период.' 
                : 'Детальный анализ вашего состояния и рекомендации на сегодня.'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="lg" className="rounded-2xl border-2 h-16 w-16 p-0 hover:bg-primary/5">
              <History className="h-6 w-6" />
            </Button>
            {result ? (
              <Button 
                variant="default" 
                size="lg"
                onClick={() => setResult(null)}
                className="rounded-2xl h-16 px-8 bg-secondary font-black uppercase tracking-widest text-xs gap-3 shadow-xl shadow-secondary/20"
              >
                <RefreshCw className="h-5 w-5" /> Обновить анализ
              </Button>
            ) : (
              <UnifiedDataEntry selectedDate={selectedDate}>
                <Button 
                  variant="default" 
                  size="lg"
                  className="rounded-2xl h-16 px-8 bg-primary font-black uppercase tracking-widest text-xs gap-3 shadow-2xl shadow-primary/30 transition-transform hover:scale-105 active:scale-95"
                >
                  <Plus className="h-5 w-5" /> Добавить лог
                </Button>
              </UnifiedDataEntry>
            )}
          </div>
        </div>

        <div className="grid gap-12 lg:grid-cols-12">
          {!result && (
            <div className="lg:col-span-12 max-w-5xl mx-auto w-full">
              <RecommendationForm onResult={setResult} selectedDate={selectedDate} />
            </div>
          )}

          {result && (
            <div className="lg:col-span-12 space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-out">
              <RecommendationDisplay data={result} />
            </div>
          )}
        </div>
      </main>
      
      <footer className="mt-32 border-t py-16 bg-white">
        <div className="container mx-auto px-4 text-center space-y-4">
          <div className="flex justify-center items-center gap-2 mb-4">
             <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                <Plus className="h-4 w-4 text-primary" />
             </div>
             <span className="font-headline font-black tracking-tighter text-xl">PRO Себя</span>
          </div>
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Интеллектуальная биометрическая платформа управления здоровьем.</p>
          <p className="text-muted-foreground/50 text-[9px] uppercase tracking-[0.3em]">© 2024 NEXT GEN BIOTECH LABS.</p>
        </div>
      </footer>

      <UnifiedDataEntry selectedDate={selectedDate}>
        <Button className="fixed bottom-10 right-10 w-20 h-20 rounded-[2rem] bg-primary shadow-[0_20px_60px_rgba(76,175,80,0.4)] lg:hidden flex items-center justify-center transition-transform active:scale-90 z-50">
          <Plus className="h-10 w-10 text-white" />
        </Button>
      </UnifiedDataEntry>
    </div>
  );
}
