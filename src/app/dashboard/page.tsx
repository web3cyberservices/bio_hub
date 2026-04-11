
"use client";

import { useState, useMemo, useEffect } from 'react';
import { NavBar } from '@/components/nav-bar';
import { RecommendationForm } from '@/components/recommendation-form';
import { RecommendationDisplay } from '@/components/recommendation-display';
import { GenerateRecommendationsOutput } from '@/ai/flows/generate-personalized-recommendations';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Activity, Calendar as CalendarIcon, LayoutDashboard, Utensils, UserCircle, Loader2, Plus } from 'lucide-react';
import { format, addDays, startOfToday, isPast, isFuture, isToday as isDateToday } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { AISpecialistChat } from '@/components/ai-specialist-chat';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UnifiedDataEntry } from '@/components/unified-data-entry';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function DashboardPage() {
  const { user } = useUser();
  const { firestore } = useFirestore();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Избегаем ошибок гидратации, устанавливая дату после монтирования
  useEffect(() => {
    setSelectedDate(startOfToday());
  }, []);

  const dateKey = useMemo(() => selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null, [selectedDate]);
  
  const recommendationRef = useMemo(() => {
    if (!firestore || !user || !dateKey) return null;
    return doc(firestore, 'users', user.uid, 'recommendations', dateKey);
  }, [firestore, user, dateKey]);

  const { data: recommendationDoc, loading: loadingRec } = useDoc<any>(recommendationRef);

  if (!selectedDate) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F0F7F2]">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  const getStatusLabel = (date: Date) => {
    if (isDateToday(date)) return "СЕГОДНЯ";
    if (isPast(date)) return "ИСТОРИЯ";
    if (isFuture(date)) return "ПРОГНОЗ";
    return "";
  };

  const handleResult = (result: GenerateRecommendationsOutput) => {
    if (!firestore || !user || !dateKey) return;
    
    const docRef = doc(firestore, 'users', user.uid, 'recommendations', dateKey);
    setDoc(docRef, {
      date: dateKey,
      data: result,
      createdAt: new Date().toISOString()
    }, { merge: true });
    
    setActiveTab("dashboard");
  };

  const currentResult = recommendationDoc?.data as GenerateRecommendationsOutput | undefined;

  return (
    <div className="flex min-h-screen flex-col bg-[#F0F7F2]">
      <NavBar />
      
      <div className="bg-white/90 backdrop-blur-xl border-b sticky top-20 z-40 py-2 md:py-4 shadow-sm">
        <div className="container mx-auto px-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1 md:gap-2 mx-auto">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-xl h-9 w-9 md:h-10 md:w-10 hover:bg-primary/5 transition-all" 
              onClick={() => setSelectedDate(prev => prev ? addDays(prev, -1) : null)}
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
              onClick={() => setSelectedDate(prev => prev ? addDays(prev, 1) : null)}
            >
              <ChevronRight className="h-5 w-5 text-primary" />
            </Button>
          </div>
          
          <div className="hidden md:block">
            <UnifiedDataEntry selectedDate={selectedDate}>
              <Button className="rounded-2xl h-12 gap-2 bg-primary hover:bg-primary/90 font-bold px-6 shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4" /> Добавить данные
              </Button>
            </UnifiedDataEntry>
          </div>
        </div>
      </div>

      <main className="container mx-auto flex-1 px-4 py-8 md:py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-10">
          <div className="flex justify-center">
            <TabsList className="bg-white/50 backdrop-blur-md p-1.5 rounded-[2rem] h-16 md:h-20 border shadow-sm max-w-2xl w-full">
              <TabsTrigger value="dashboard" className="rounded-[1.5rem] px-4 md:px-8 font-black uppercase tracking-widest text-[8px] md:text-[10px] gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all h-full flex-1">
                <LayoutDashboard className="h-4 w-4" /> Дашборд
              </TabsTrigger>
              <TabsTrigger value="meals" className="rounded-[1.5rem] px-4 md:px-8 font-black uppercase tracking-widest text-[8px] md:text-[10px] gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all h-full flex-1">
                <Utensils className="h-4 w-4" /> План питания
              </TabsTrigger>
              <TabsTrigger value="profile" className="rounded-[1.5rem] px-4 md:px-8 font-black uppercase tracking-widest text-[8px] md:text-[10px] gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all h-full flex-1">
                <UserCircle className="h-4 w-4" /> Профиль
              </TabsTrigger>
            </TabsList>
          </div>

          {loadingRec ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
            </div>
          ) : (
            <>
              <TabsContent value="dashboard" className="mt-0 outline-none">
                {currentResult ? (
                  <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex items-center gap-4 mb-6">
                       <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                          <LayoutDashboard className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                       </div>
                       <div>
                          <h2 className="text-2xl md:text-5xl font-black tracking-tighter text-foreground">Обзор дня</h2>
                          <p className="text-muted-foreground text-xs md:text-base font-medium">Ключевые показатели и биометрическая аналитика.</p>
                       </div>
                    </div>
                    <RecommendationDisplay data={currentResult} mode="dashboard" />
                  </div>
                ) : (
                  <NoDataView onResult={handleResult} selectedDate={selectedDate} />
                )}
              </TabsContent>

              <TabsContent value="meals" className="mt-0 outline-none">
                {currentResult ? (
                  <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex items-center gap-4 mb-6">
                       <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                          <Utensils className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                       </div>
                       <div>
                          <h2 className="text-2xl md:text-5xl font-black tracking-tighter text-foreground">Гастро-план</h2>
                          <p className="text-muted-foreground text-xs md:text-base font-medium">Персонализированное меню, оптимизированное ИИ.</p>
                       </div>
                    </div>
                    <RecommendationDisplay data={currentResult} mode="meals" />
                  </div>
                ) : (
                  <NoDataView onResult={handleResult} selectedDate={selectedDate} />
                )}
              </TabsContent>

              <TabsContent value="profile" className="mt-0 outline-none">
                <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="flex items-center gap-4 mb-10">
                     <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                        <UserCircle className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                     </div>
                     <div>
                        <h2 className="text-2xl md:text-5xl font-black tracking-tighter text-foreground">Личный кабинет</h2>
                        <p className="text-muted-foreground text-xs md:text-base font-medium">Ваши биометрические данные и цели здоровья.</p>
                     </div>
                  </div>
                  <RecommendationForm onResult={handleResult} selectedDate={selectedDate} />
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </main>

      <AISpecialistChat />
      
      <footer className="mt-20 border-t py-12 bg-white/50 backdrop-blur-md">
        <div className="container mx-auto px-4 text-center space-y-6">
          <div className="flex justify-center items-center gap-3">
             <div className="w-8 h-8 bg-primary/20 rounded-xl flex items-center justify-center">
                <Activity className="h-4 w-4 text-primary" />
             </div>
             <span className="font-headline font-black tracking-tighter text-xl">PRO Себя</span>
          </div>
          <p className="text-muted-foreground/30 text-[7px] md:text-[8px] uppercase tracking-[0.5em]">© 2024 NEXT GEN BIOTECH LABS. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>
    </div>
  );
}

function NoDataView({ onResult, selectedDate }: { onResult: (r: GenerateRecommendationsOutput) => void, selectedDate: Date }) {
  return (
    <div className="max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-12 duration-1000 text-center space-y-12 py-10">
      <div className="space-y-4">
        <Badge variant="outline" className="px-6 py-2 rounded-xl border-primary/20 text-primary font-black uppercase tracking-widest text-[10px]">
          Данные отсутствуют
        </Badge>
        <h2 className="text-2xl md:text-5xl font-black tracking-tight leading-none">Заполните анкету для анализа</h2>
        <p className="text-muted-foreground max-w-lg mx-auto font-medium text-sm md:text-lg">Чтобы ИИ подготовил отчет и план питания на {format(selectedDate, 'd MMMM', { locale: ru })}, нам нужны ваши актуальные показатели.</p>
      </div>
      <RecommendationForm onResult={onResult} selectedDate={selectedDate} />
    </div>
  );
}
