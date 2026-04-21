"use client";

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { NavBar } from '@/components/nav-bar';
import { RecommendationForm } from '@/components/recommendation-form';
import { RecommendationDisplay } from '@/components/recommendation-display';
import { GenerateRecommendationsOutput } from '@/ai/flows/generate-personalized-recommendations';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Activity, Calendar as CalendarIcon, LayoutDashboard, Utensils, UserCircle, Loader2, Plus, LogOut } from 'lucide-react';
import { format, addDays, startOfToday, isPast, isFuture, isToday as isDateToday } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { AISpecialistChat } from '@/components/ai-specialist-chat';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UnifiedDataEntry } from '@/components/unified-data-entry';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/firebase/provider';

export default function DashboardPage() {
  const { user, loading: userLoading } = useUser();
  const { firestore } = useFirestore();
  const { auth } = useAuth();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setSelectedDate(startOfToday());
  }, []);

  useEffect(() => {
    if (isMounted && !userLoading && (!user || user.uid === 'public-user')) {
      router.push('/login');
    }
  }, [user, userLoading, router, isMounted]);

  const dateKey = useMemo(() => {
    if (!selectedDate) return null;
    return format(selectedDate, 'yyyy-MM-dd');
  }, [selectedDate]);
  
  const recommendationRef = useMemoFirebase(() => {
    if (!firestore || !user || !dateKey || user.uid === 'public-user') return null;
    return doc(firestore, 'users', user.uid, 'recommendations', dateKey);
  }, [firestore, user, dateKey]);

  const { data: recommendationDoc, isLoading: loadingRec } = useDoc<any>(recommendationRef);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/');
    }
  };

  if (!isMounted || !selectedDate || userLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F0F7F2]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto opacity-20" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40 animate-pulse">Инициализация био-хаба...</p>
        </div>
      </div>
    );
  }

  const getStatusLabel = (date: Date) => {
    if (isDateToday(date)) return "СЕГОДНЯ";
    if (isPast(date)) return "ИСТОРИЯ";
    if (isFuture(date)) return "ПРОГНОЗ";
    return "";
  };

  const handleResult = async (result: GenerateRecommendationsOutput) => {
    if (!firestore || !user || !dateKey || user.uid === 'public-user') return;
    
    const docRef = doc(firestore, 'users', user.uid, 'recommendations', dateKey);
    await setDoc(docRef, {
      id: dateKey,
      userId: user.uid,
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
      
      <div className="bg-white/90 backdrop-blur-xl border-b sticky top-16 md:top-20 z-40 py-2 md:py-4 shadow-sm">
        <div className="container mx-auto px-4 flex items-center justify-between gap-2 md:gap-4">
          <div className="flex items-center gap-1 md:gap-2 mx-auto">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-xl h-8 w-8 md:h-10 md:w-10 hover:bg-primary/5" 
              onClick={() => setSelectedDate(prev => prev ? addDays(prev, -1) : null)}
            >
              <ChevronLeft className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            </Button>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="px-2 md:px-4 h-10 md:h-14 rounded-xl md:rounded-2xl flex flex-col items-center justify-center gap-0.5 hover:bg-primary/5 transition-all min-w-[120px] md:min-w-[200px]">
                  <span className="text-[7px] md:text-[9px] font-black uppercase tracking-[0.3em] text-primary/60 leading-none">
                    {getStatusLabel(selectedDate)}
                  </span>
                  <div className="flex items-center gap-1 md:gap-2">
                    <span className="text-xs md:text-xl font-bold tracking-tight">
                      {format(selectedDate, 'd MMMM yyyy', { locale: ru })}
                    </span>
                    <CalendarIcon className="h-3 w-3 md:h-4 md:w-4 text-primary opacity-30" />
                  </div>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[calc(100vw-2rem)] md:w-auto p-0 rounded-2xl md:rounded-[2rem] overflow-hidden shadow-2xl border-none mt-2 md:mt-4" align="center">
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
              className="rounded-xl h-8 w-8 md:h-10 md:w-10 hover:bg-primary/5"
              onClick={() => setSelectedDate(prev => prev ? addDays(prev, 1) : null)}
            >
              <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <UnifiedDataEntry selectedDate={selectedDate}>
              <Button className="rounded-xl md:rounded-2xl h-10 md:h-12 gap-2 bg-primary hover:bg-primary/90 font-black px-4 md:px-6 shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Добавить данные</span>
              </Button>
            </UnifiedDataEntry>
            <Button variant="outline" size="icon" onClick={handleLogout} className="rounded-xl md:rounded-2xl h-10 md:h-12 w-10 md:w-12 border-primary/20 text-primary hover:bg-primary/5">
              <LogOut className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
          </div>
        </div>
      </div>

      <main className="container mx-auto flex-1 px-4 py-6 md:py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6 md:space-y-10">
          <div className="flex justify-center">
            <TabsList className="bg-white/60 backdrop-blur-md p-1 rounded-xl md:rounded-[2rem] h-14 md:h-20 border shadow-md max-w-2xl w-full">
              <TabsTrigger value="dashboard" className="rounded-lg md:rounded-[1.5rem] px-2 md:px-8 font-black uppercase tracking-widest text-[7px] md:text-[10px] gap-1 md:gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all h-full flex-1">
                <LayoutDashboard className="h-3 w-3 md:h-4 md:w-4" /> Дашборд
              </TabsTrigger>
              <TabsTrigger value="meals" className="rounded-lg md:rounded-[1.5rem] px-2 md:px-8 font-black uppercase tracking-widest text-[7px] md:text-[10px] gap-1 md:gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all h-full flex-1">
                <Utensils className="h-3 w-3 md:h-4 md:w-4" /> Питание
              </TabsTrigger>
              <TabsTrigger value="profile" className="rounded-lg md:rounded-[1.5rem] px-2 md:px-8 font-black uppercase tracking-widest text-[7px] md:text-[10px] gap-1 md:gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all h-full flex-1">
                <UserCircle className="h-3 w-3 md:h-4 md:w-4" /> Профиль
              </TabsTrigger>
            </TabsList>
          </div>

          {(loadingRec && user && user.uid !== 'public-user') ? (
            <div className="flex flex-col items-center justify-center py-16 md:py-24 space-y-4">
              <Loader2 className="h-10 w-10 md:h-12 md:w-12 animate-spin text-primary opacity-20" />
              <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground">Загрузка данных...</p>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <TabsContent value="dashboard" className="mt-0 outline-none">
                {currentResult ? (
                  <div className="space-y-6 md:space-y-10">
                    <div className="flex items-center gap-3 md:gap-4">
                       <div className="w-10 h-10 md:w-16 md:h-16 bg-primary/10 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
                          <LayoutDashboard className="h-5 w-5 md:h-8 md:w-8 text-primary" />
                       </div>
                       <div>
                          <h2 className="text-xl md:text-5xl font-black tracking-tighter text-foreground">Обзор здоровья</h2>
                          <p className="text-muted-foreground text-[10px] md:text-base font-medium">Анализ на {format(selectedDate, 'd MMMM', { locale: ru })}</p>
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
                  <div className="space-y-6 md:space-y-10">
                    <div className="flex items-center gap-3 md:gap-4">
                       <div className="w-10 h-10 md:w-16 md:h-16 bg-primary/10 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
                          <Utensils className="h-5 w-5 md:h-8 md:w-8 text-primary" />
                       </div>
                       <div>
                          <h2 className="text-xl md:text-5xl font-black tracking-tighter text-foreground">Гастро-план</h2>
                          <p className="text-muted-foreground text-[10px] md:text-base font-medium">Персонализированное меню оптимизированное ИИ.</p>
                       </div>
                    </div>
                    <RecommendationDisplay data={currentResult} mode="meals" />
                  </div>
                ) : (
                  <NoDataView onResult={handleResult} selectedDate={selectedDate} />
                )}
              </TabsContent>

              <TabsContent value="profile" className="mt-0 outline-none">
                <div className="max-w-4xl mx-auto">
                  <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-10">
                     <div className="w-10 h-10 md:w-16 md:h-16 bg-primary/10 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
                        <UserCircle className="h-5 w-5 md:h-8 md:w-8 text-primary" />
                     </div>
                     <div>
                        <h2 className="text-xl md:text-5xl font-black tracking-tighter text-foreground">Личный кабинет</h2>
                        <p className="text-muted-foreground text-[10px] md:text-base font-medium">Управление биометрическим профилем и целями.</p>
                     </div>
                  </div>
                  <RecommendationForm onResult={handleResult} selectedDate={selectedDate} />
                </div>
              </TabsContent>
            </div>
          )}
        </Tabs>
      </main>

      <AISpecialistChat />
      
      <footer className="mt-10 md:mt-20 border-t py-8 md:py-12 bg-white/50 backdrop-blur-md">
        <div className="container mx-auto px-4 text-center space-y-4 md:space-y-6">
          <div className="flex justify-center items-center gap-2 md:gap-3">
             <div className="w-6 h-6 md:w-8 md:h-8 bg-primary/20 rounded-lg md:rounded-xl flex items-center justify-center">
                <Activity className="h-3 w-3 md:h-4 md:w-4 text-primary" />
             </div>
             <span className="font-headline font-black tracking-tighter text-lg md:text-xl">PRO Себя</span>
          </div>
          <p className="text-muted-foreground/30 text-[6px] md:text-[8px] uppercase tracking-[0.3em] md:tracking-[0.5em]">© 2024 NEXT GEN BIOTECH LABS. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>
    </div>
  );
}

function NoDataView({ onResult, selectedDate }: { onResult: (r: GenerateRecommendationsOutput) => void, selectedDate: Date }) {
  return (
    <div className="max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-12 duration-1000 text-center space-y-8 md:space-y-12 py-6 md:py-10">
      <div className="space-y-3 md:space-y-4">
        <Badge variant="outline" className="px-4 md:px-6 py-1 md:py-2 rounded-lg md:rounded-xl border-primary/20 text-primary font-black uppercase tracking-widest text-[8px] md:text-[10px]">
          Био-анализ не выполнен
        </Badge>
        <h2 className="text-xl md:text-5xl font-black tracking-tight leading-tight md:leading-none">Сформируйте отчет для начала</h2>
        <p className="text-muted-foreground max-w-lg mx-auto font-medium text-xs md:text-lg px-4">Обновите ваши показатели, чтобы ИИ подготовил план и рекомендации на {format(selectedDate, 'd MMMM', { locale: ru })}.</p>
      </div>
      <RecommendationForm onResult={onResult} selectedDate={selectedDate} />
    </div>
  );
}
