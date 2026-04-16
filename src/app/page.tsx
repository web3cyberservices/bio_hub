"use client";

import { useState, useMemo, useEffect } from 'react';
import { NavBar } from '@/components/nav-bar';
import { RecommendationForm } from '@/components/recommendation-form';
import { RecommendationDisplay } from '@/components/recommendation-display';
import { GenerateRecommendationsOutput } from '@/ai/flows/generate-personalized-recommendations';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Activity, Calendar as CalendarIcon, LayoutDashboard, Utensils, UserCircle, Loader2, Plus, Sparkles } from 'lucide-react';
import { format, addDays, startOfToday } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { AISpecialistChat } from '@/components/ai-specialist-chat';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UnifiedDataEntry } from '@/components/unified-data-entry';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function LandingDashboardPage() {
  const { user, loading: userLoading } = useUser();
  const { firestore } = useFirestore();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [localResult, setLocalResult] = useState<GenerateRecommendationsOutput | null>(null);

  useEffect(() => {
    setSelectedDate(startOfToday());
  }, []);

  const dateKey = useMemo(() => selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null, [selectedDate]);
  
  const recommendationRef = useMemo(() => {
    if (!firestore || !user || !dateKey) return null;
    return doc(firestore, 'users', user.uid, 'recommendations', dateKey);
  }, [firestore, user, dateKey]);

  const { data: recommendationDoc, loading: loadingRec } = useDoc<any>(recommendationRef);

  if (!selectedDate || userLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F0F7F2]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto opacity-20" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">Инициализация био-хаба...</p>
        </div>
      </div>
    );
  }

  const handleResult = (result: GenerateRecommendationsOutput) => {
    setLocalResult(result);
    if (firestore && user && dateKey) {
      const docRef = doc(firestore, 'users', user.uid, 'recommendations', dateKey);
      setDoc(docRef, {
        date: dateKey,
        data: result,
        createdAt: new Date().toISOString()
      }, { merge: true });
    }
    setActiveTab("dashboard");
  };

  const currentResult = localResult || (recommendationDoc?.data as GenerateRecommendationsOutput | undefined);

  return (
    <div className="flex min-h-screen flex-col bg-[#F0F7F2]">
      <NavBar />
      
      <div className="bg-white/90 backdrop-blur-xl border-b sticky top-16 md:top-20 z-40 py-3 md:py-4 shadow-sm">
        <div className="container mx-auto px-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1 md:gap-2 mx-auto">
            <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setSelectedDate(prev => prev ? addDays(prev, -1) : null)}>
              <ChevronLeft className="h-5 w-5 text-primary" />
            </Button>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="px-4 h-12 md:h-14 rounded-2xl flex flex-col items-center justify-center gap-0.5 hover:bg-primary/5 min-w-[150px] md:min-w-[200px]">
                  <span className="text-[8px] font-black uppercase tracking-[0.3em] text-primary/60">БИО-РИТМ</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm md:text-xl font-bold tracking-tight">
                      {format(selectedDate, 'd MMMM yyyy', { locale: ru })}
                    </span>
                    <CalendarIcon className="h-4 w-4 text-primary opacity-30" />
                  </div>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-[2rem] overflow-hidden" align="center">
                <Calendar mode="single" selected={selectedDate} onSelect={(date) => date && setSelectedDate(date)} locale={ru} />
              </PopoverContent>
            </Popover>

            <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setSelectedDate(prev => prev ? addDays(prev, 1) : null)}>
              <ChevronRight className="h-5 w-5 text-primary" />
            </Button>
          </div>
          
          <div className="hidden lg:flex items-center gap-4">
            <UnifiedDataEntry selectedDate={selectedDate}>
              <Button className="rounded-2xl h-12 gap-2 bg-primary font-black px-6">
                <Plus className="h-4 w-4" /> Добавить данные
              </Button>
            </UnifiedDataEntry>
          </div>
        </div>
      </div>

      <main className="container mx-auto flex-1 px-4 py-8 md:py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-10">
          <div className="flex justify-center">
            <TabsList className="bg-white/60 backdrop-blur-md p-1.5 rounded-[2rem] h-16 md:h-20 border shadow-md max-w-2xl w-full">
              <TabsTrigger value="dashboard" className="rounded-[1.5rem] px-4 md:px-8 font-black uppercase tracking-widest text-[8px] md:text-[10px] gap-2 data-[state=active]:bg-primary data-[state=active]:text-white h-full flex-1">
                <LayoutDashboard className="h-4 w-4" /> Обзор
              </TabsTrigger>
              <TabsTrigger value="meals" className="rounded-[1.5rem] px-4 md:px-8 font-black uppercase tracking-widest text-[8px] md:text-[10px] gap-2 data-[state=active]:bg-primary data-[state=active]:text-white h-full flex-1">
                <Utensils className="h-4 w-4" /> Еда
              </TabsTrigger>
              <TabsTrigger value="wizard" className="rounded-[1.5rem] px-4 md:px-8 font-black uppercase tracking-widest text-[8px] md:text-[10px] gap-2 data-[state=active]:bg-primary data-[state=active]:text-white h-full flex-1">
                <Sparkles className="h-4 w-4" /> Анализ
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <TabsContent value="dashboard" className="mt-0 outline-none">
              {currentResult ? (
                <div className="space-y-10">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                        <LayoutDashboard className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                     </div>
                     <div>
                        <h2 className="text-2xl md:text-5xl font-black tracking-tighter">Здоровье сегодня</h2>
                        <p className="text-muted-foreground text-xs md:text-base font-medium">Биометрический анализ на {format(selectedDate, 'd MMMM', { locale: ru })}</p>
                     </div>
                  </div>
                  <RecommendationDisplay data={currentResult} mode="dashboard" />
                </div>
              ) : (
                <div className="text-center py-20">
                  <Badge variant="outline" className="mb-4">Данные не загружены</Badge>
                  <h2 className="text-4xl font-black mb-4">Начните био-анализ</h2>
                  <p className="text-muted-foreground mb-8">Перейдите во вкладку «Анализ», чтобы ИИ подготовил рекомендации.</p>
                  <Button onClick={() => setActiveTab("wizard")} className="rounded-2xl h-16 px-10 text-xl font-black gap-2">
                    Создать отчет <Sparkles className="h-6 w-6" />
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="meals" className="mt-0 outline-none">
              {currentResult ? (
                <div className="space-y-10">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                        <Utensils className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                     </div>
                     <div>
                        <h2 className="text-2xl md:text-5xl font-black tracking-tighter">Меню Bio-Tech</h2>
                        <p className="text-muted-foreground text-xs md:text-base font-medium">Рацион, оптимизированный под ваш метаболизм.</p>
                     </div>
                  </div>
                  <RecommendationDisplay data={currentResult} mode="meals" />
                </div>
              ) : (
                <div className="text-center py-20">
                  <h2 className="text-3xl font-black">План питания не сформирован</h2>
                  <Button onClick={() => setActiveTab("wizard")} className="mt-6 rounded-2xl h-14 px-8 font-black">Настроить сейчас</Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="wizard" className="mt-0 outline-none">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-10">
                   <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                      <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                   </div>
                   <div>
                      <h2 className="text-2xl md:text-5xl font-black tracking-tighter">Мастер Рекомендаций</h2>
                      <p className="text-muted-foreground text-xs md:text-base font-medium">Введите данные для мгновенного анализа.</p>
                   </div>
                </div>
                <RecommendationForm onResult={handleResult} selectedDate={selectedDate} />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </main>

      <AISpecialistChat />
      
      <footer className="mt-20 border-t py-12 bg-white/50 backdrop-blur-md">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground/30 text-[8px] uppercase tracking-[0.5em]">© 2024 PRO СЕБЯ. ВСЕ БИОМЕТРИЧЕСКИЕ ДАННЫЕ ЗАЩИЩЕНЫ.</p>
        </div>
      </footer>
    </div>
  );
}
