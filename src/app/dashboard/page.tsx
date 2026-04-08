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
      <div className="bg-white border-b sticky top-16 z-40 py-4 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <h2 className="text-xl font-black">{getStatusLabel(selectedDate)}</h2>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon"><CalendarIcon className="h-5 w-5" /></Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-3xl overflow-hidden shadow-2xl border-none" align="end">
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
              className="hidden lg:flex" 
              onClick={() => setSelectedDate(prev => addDays(prev, -1))}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1 flex justify-between lg:justify-center lg:gap-8 overflow-x-auto no-scrollbar">
              {days.map((day, i) => {
                const isSelected = isSameDay(day, selectedDate);
                const isToday = isDateToday(day);
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(day)}
                    className={`flex flex-col items-center min-w-[50px] py-2 px-1 rounded-2xl transition-all ${
                      isSelected ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'hover:bg-primary/5'
                    }`}
                  >
                    <span className={`text-[9px] font-black uppercase tracking-widest ${isSelected ? 'text-white/70' : 'text-muted-foreground'}`}>
                      {format(day, 'EEE', { locale: ru })}
                    </span>
                    <span className="text-lg font-black">{format(day, 'd')}</span>
                    {isToday && !isSelected && <div className="w-1 h-1 bg-primary rounded-full mt-1" />}
                  </button>
                );
              })}
            </div>
            
            <div className="hidden lg:flex items-center gap-2">
               <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-xl border-2"><CalendarIcon className="h-4 w-4" /></Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-3xl overflow-hidden shadow-2xl border-none" align="end">
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
                onClick={() => setSelectedDate(prev => addDays(prev, 1))}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="mb-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
                {format(selectedDate, 'd MMMM', { locale: ru })}
              </h1>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-none px-3 font-bold">
                {getStatusLabel(selectedDate)}
              </Badge>
            </div>
            <p className="text-muted-foreground font-medium">
              {isFuture(selectedDate) ? 'Планирование рациона на будущую дату' : 'Анализ вашего состояния за этот день'}
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
                <RefreshCw className="h-5 w-5" /> Обновить план
              </Button>
            ) : (
              <UnifiedDataEntry selectedDate={selectedDate}>
                <Button 
                  variant="default" 
                  size="lg"
                  className="rounded-2xl bg-primary font-bold gap-2 shadow-xl shadow-primary/20"
                >
                  <Plus className="h-5 w-5" /> {isPast(selectedDate) && !isDateToday(selectedDate) ? 'Добавить из прошлого' : 'Добавить данные'}
                </Button>
              </UnifiedDataEntry>
            )}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {!result && (
            <div className="lg:col-span-12 max-w-4xl mx-auto w-full">
              <RecommendationForm onResult={setResult} selectedDate={selectedDate} />
            </div>
          )}

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

      <UnifiedDataEntry selectedDate={selectedDate}>
        <Button className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-primary shadow-2xl lg:hidden flex items-center justify-center">
          <Plus className="h-8 w-8 text-white" />
        </Button>
      </UnifiedDataEntry>
    </div>
  );
}
