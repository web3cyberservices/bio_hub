
"use client";

import { useState, useMemo, useEffect } from 'react';
import { NavBar } from '@/components/nav-bar';
import { RecommendationForm } from '@/components/recommendation-form';
import { RecommendationDisplay } from '@/components/recommendation-display';
import { GenerateRecommendationsOutput } from '@/ai/flows/generate-personalized-recommendations';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Activity, Calendar as CalendarIcon, LayoutDashboard, Utensils, UserCircle, Loader2, Plus, Sparkles, Trash2 } from 'lucide-react';
import { format, addDays, startOfToday } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { AISpecialistChat } from '@/components/ai-specialist-chat';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UnifiedDataEntry } from '@/components/unified-data-entry';
import { ProfileCabinet } from '@/components/profile-cabinet';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, setDoc, query, collection, where, deleteDoc } from 'firebase/firestore';
import { Card } from '@/components/ui/card';

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
  
  const recommendationRef = useMemoFirebase(() => {
    if (!firestore || !user || !dateKey || user.uid === 'public-user') return null;
    return doc(firestore, 'users', user.uid, 'recommendations', dateKey);
  }, [firestore, user, dateKey]);

  const { data: recommendationDoc } = useDoc<any>(recommendationRef);

  const dietaryLogsQuery = useMemoFirebase(() => {
    if (!firestore || !user || user.uid === 'public-user') return null;
    return query(
      collection(firestore, 'users', user.uid, 'dietaryLogs'),
      where('userId', '==', user.uid)
    );
  }, [firestore, user]);

  const { data: logs } = useCollection<any>(dietaryLogsQuery);

  const dailyLogsRef = useMemoFirebase(() => {
    if (!firestore || !user || !dateKey || user.uid === 'public-user') return null;
    return doc(firestore, 'users', user.uid, 'dailyLogs', dateKey);
  }, [firestore, user, dateKey]);

  const { data: dailyLogDoc } = useDoc<any>(dailyLogsRef);

  const todayLogs = useMemo(() => {
    if (!logs || !dateKey) return [];
    return logs.filter(log => log.logDate && log.logDate.startsWith(dateKey));
  }, [logs, dateKey]);

  const aggregatedActual = useMemo(() => {
    return todayLogs.reduce((acc, log) => ({
      calories: acc.calories + (log.calories || 0),
      protein: acc.protein + (log.protein || 0),
      fat: acc.fat + (log.fat || 0),
      carbs: acc.carbs + (log.carbs || 0),
    }), { calories: 0, protein: 0, fat: 0, carbs: 0 });
  }, [todayLogs]);

  const handleDeleteLog = async (id: string) => {
    if (!firestore || !user || user.uid === 'public-user') return;
    await deleteDoc(doc(firestore, 'users', user.uid, 'dietaryLogs', id));
  };

  if (!selectedDate || userLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F0F7F2]">
        <div className="text-center space-y-6">
          <div className="relative mx-auto w-20 h-20">
             <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
             <div className="relative w-full h-full bg-white rounded-2xl shadow-2xl flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
             </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 animate-pulse">Синхронизация био-хаба...</p>
        </div>
      </div>
    );
  }

  const handleResult = (result: GenerateRecommendationsOutput) => {
    setLocalResult(result);
    if (firestore && user && dateKey && user.uid !== 'public-user') {
      const docRef = doc(firestore, 'users', user.uid, 'recommendations', dateKey);
      setDoc(docRef, {
        id: dateKey,
        userId: user.uid,
        date: dateKey,
        data: result,
        createdAt: new Date().toISOString()
      }, { merge: true });
    }
    setActiveTab("dashboard");
  };

  const currentResult = localResult || (recommendationDoc?.data as GenerateRecommendationsOutput | undefined);

  return (
    <div className="flex min-h-screen flex-col bg-[#F0F7F2] overflow-x-hidden">
      <NavBar />
      
      <div className="bg-white/80 backdrop-blur-2xl border-b sticky top-16 md:top-20 z-40 py-4 shadow-sm">
        <div className="container mx-auto px-4 md:px-8 flex items-center justify-between gap-6">
          <div className="flex items-center gap-2 md:gap-4 mx-auto">
            <Button variant="ghost" size="icon" className="rounded-2xl w-12 h-12 hover:bg-primary/5" onClick={() => setSelectedDate(prev => prev ? addDays(prev, -1) : null)}>
              <ChevronLeft className="h-6 w-6 text-primary" />
            </Button>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="px-8 h-14 md:h-16 rounded-[2rem] flex flex-col items-center justify-center gap-0.5 hover:bg-primary/5 transition-all min-w-[180px] md:min-w-[240px]">
                  <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary/50">БИО-РИТМ</span>
                  <div className="flex items-center gap-3">
                    <span className="text-lg md:text-2xl font-black tracking-tight text-foreground">
                      {format(selectedDate, 'd MMMM yyyy', { locale: ru })}
                    </span>
                    <CalendarIcon className="h-5 w-5 text-primary opacity-40" />
                  </div>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[340px] p-0 rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] border-none mt-4" align="center">
                <Calendar mode="single" selected={selectedDate} onSelect={(date) => date && setSelectedDate(date)} locale={ru} className="p-10" />
              </PopoverContent>
            </Popover>

            <Button variant="ghost" size="icon" className="rounded-2xl w-12 h-12 hover:bg-primary/5" onClick={() => setSelectedDate(prev => prev ? addDays(prev, 1) : null)}>
              <ChevronRight className="h-6 w-6 text-primary" />
            </Button>
          </div>
          
          <div className="hidden lg:flex items-center gap-6">
            <UnifiedDataEntry selectedDate={selectedDate}>
              <Button className="rounded-[1.75rem] h-16 gap-3 bg-primary hover:bg-primary/90 text-white font-black px-8 shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95">
                <Plus className="h-6 w-6" /> Добавить данные
              </Button>
            </UnifiedDataEntry>
          </div>
        </div>
      </div>

      <main className="container mx-auto flex-1 px-4 md:px-8 py-10 md:py-16">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-16">
          <div className="fixed bottom-10 left-0 right-0 z-[100] flex justify-center px-4 md:static md:bottom-auto">
            <TabsList className="dock-blur p-2 rounded-[2.5rem] h-20 md:h-24 border max-w-4xl w-full flex items-stretch">
              <TabsTrigger value="dashboard" className="rounded-[2rem] px-4 md:px-10 font-black uppercase tracking-widest text-[9px] md:text-[11px] gap-3 data-[state=active]:bg-primary data-[state=active]:text-white h-full flex-1 transition-all">
                <LayoutDashboard className="h-5 w-5" /> Обзор
              </TabsTrigger>
              <TabsTrigger value="meals" className="rounded-[2rem] px-4 md:px-10 font-black uppercase tracking-widest text-[9px] md:text-[11px] gap-3 data-[state=active]:bg-primary data-[state=active]:text-white h-full flex-1 transition-all">
                <Utensils className="h-5 w-5" /> Еда
              </TabsTrigger>
              <TabsTrigger value="wizard" className="rounded-[2rem] px-4 md:px-10 font-black uppercase tracking-widest text-[9px] md:text-[11px] gap-3 data-[state=active]:bg-primary data-[state=active]:text-white h-full flex-1 transition-all">
                <Sparkles className="h-5 w-5" /> Анализ
              </TabsTrigger>
              <TabsTrigger value="profile" className="rounded-[2rem] px-4 md:px-10 font-black uppercase tracking-widest text-[9px] md:text-[11px] gap-3 data-[state=active]:bg-primary data-[state=active]:text-white h-full flex-1 transition-all">
                <UserCircle className="h-5 w-5" /> Профиль
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <TabsContent value="dashboard" className="mt-0 outline-none">
              {currentResult ? (
                <div className="space-y-16">
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                     <div className="w-16 h-16 md:w-24 md:h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center shrink-0 shadow-inner">
                        <LayoutDashboard className="h-8 w-8 md:h-12 md:w-12 text-primary" />
                     </div>
                     <div className="space-y-1">
                        <h2 className="text-4xl md:text-7xl font-black tracking-tighter text-foreground leading-none">Здоровье сегодня</h2>
                        <p className="text-muted-foreground text-sm md:text-xl font-medium px-1">Биометрический анализ на {format(selectedDate, 'd MMMM', { locale: ru })}</p>
                     </div>
                  </div>
                  <RecommendationDisplay 
                    data={currentResult} 
                    actualMacros={aggregatedActual}
                    deviceData={dailyLogDoc}
                    mode="dashboard" 
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 md:py-32 text-center space-y-10">
                  <div className="w-32 h-32 md:w-48 md:h-48 bg-primary/5 rounded-[4rem] flex items-center justify-center animate-pulse">
                     <Sparkles className="h-16 w-16 md:h-24 md:w-24 text-primary opacity-20" />
                  </div>
                  <div className="space-y-4">
                    <Badge variant="outline" className="px-6 py-2 rounded-2xl border-primary/20 text-primary font-black uppercase tracking-widest text-[10px]">Анализ не выполнен</Badge>
                    <h2 className="text-4xl md:text-7xl font-black tracking-tighter leading-none max-w-3xl mx-auto">Ваш путь к био-балансу начинается здесь</h2>
                    <p className="text-muted-foreground max-w-xl mx-auto font-medium text-lg md:text-2xl px-4">Перейдите во вкладку «Анализ», чтобы ИИ подготовил ваши персональные рекомендации.</p>
                  </div>
                  <Button onClick={() => setActiveTab("wizard")} className="rounded-[2.5rem] h-20 md:h-24 px-12 md:px-20 text-xl md:text-3xl font-black gap-4 bg-primary shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95">
                    Создать отчет <Sparkles className="h-8 w-8 md:h-10 md:w-10 text-accent" />
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="meals" className="mt-0 outline-none">
              <div className="space-y-16">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 md:w-24 md:h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center shrink-0">
                      <Utensils className="h-8 w-8 md:h-12 md:w-12 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h2 className="text-4xl md:text-7xl font-black tracking-tighter text-foreground leading-none">Дневник Еды</h2>
                      <p className="text-muted-foreground text-sm md:text-xl font-medium px-1">Отслеживание и планирование питания.</p>
                    </div>
                  </div>
                  
                  <UnifiedDataEntry selectedDate={selectedDate}>
                    <Button className="rounded-[2rem] h-20 px-10 text-xl font-black bg-primary gap-4 shadow-xl">
                      <Plus className="h-8 w-8" /> Записать прием пищи
                    </Button>
                  </UnifiedDataEntry>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  <div className="lg:col-span-8 space-y-10">
                    <div className="flex items-center justify-between px-4">
                      <h3 className="text-3xl font-black uppercase tracking-tight">Записи за сегодня</h3>
                      <Badge variant="outline" className="font-black">{todayLogs.length} блюд</Badge>
                    </div>

                    {todayLogs.length === 0 ? (
                      <Card className="p-20 text-center rounded-[3rem] border-dashed border-4 border-muted/20 bg-muted/5">
                        <p className="text-muted-foreground text-xl font-medium">Вы еще не добавили ни одной записи за сегодня.</p>
                      </Card>
                    ) : (
                      <div className="grid gap-6">
                        {todayLogs.map((log) => (
                          <Card key={log.id} className="p-8 rounded-[2.5rem] premium-card flex items-center justify-between border-none shadow-xl">
                            <div className="flex items-center gap-6">
                              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                                <Utensils className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                <h4 className="text-2xl font-black">{log.mealName}</h4>
                                <div className="flex gap-3 mt-1">
                                  <Badge className="bg-primary/10 text-primary border-none text-[9px]">{log.calories} ккал</Badge>
                                  <Badge className="bg-secondary/10 text-secondary border-none text-[9px]">Б: {log.protein}г</Badge>
                                  <Badge className="bg-accent/10 text-accent-foreground border-none text-[9px]">Ж: {log.fat}г</Badge>
                                  <Badge className="bg-muted text-muted-foreground border-none text-[9px]">У: {log.carbs}г</Badge>
                                </div>
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteLog(log.id)} className="text-destructive hover:bg-destructive/10 rounded-full h-12 w-12">
                              <Trash2 className="h-6 w-6" />
                            </Button>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-4 space-y-10">
                    <h3 className="text-3xl font-black uppercase tracking-tight px-4">ИИ-Рекомендации</h3>
                    {currentResult ? (
                      <RecommendationDisplay data={currentResult} mode="meals" />
                    ) : (
                      <Card className="p-10 rounded-[3rem] text-center space-y-6">
                        <Sparkles className="h-12 w-12 text-primary/20 mx-auto" />
                        <p className="text-muted-foreground font-medium">Сформируйте план в разделе «Анализ»</p>
                      </Card>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="wizard" className="mt-0 outline-none">
              <div className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center gap-6 mb-16">
                   <div className="w-16 h-16 md:w-24 md:h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center shrink-0">
                      <Sparkles className="h-8 w-8 md:h-12 md:w-12 text-primary" />
                   </div>
                   <div className="space-y-1">
                      <h2 className="text-4xl md:text-7xl font-black tracking-tighter text-foreground leading-none">Bio-Мастер</h2>
                      <p className="text-muted-foreground text-sm md:text-xl font-medium px-1">Введите данные для мгновенного AI-анализа.</p>
                   </div>
                </div>
                <RecommendationForm onResult={handleResult} selectedDate={selectedDate} />
              </div>
            </TabsContent>

            <TabsContent value="profile" className="mt-0 outline-none">
              <ProfileCabinet />
            </TabsContent>
          </div>
        </Tabs>
      </main>

      <AISpecialistChat />
      
      <footer className="mt-32 border-t py-16 bg-white/50 backdrop-blur-md">
        <div className="container mx-auto px-4 text-center space-y-8">
           <div className="flex justify-center items-center gap-4">
             <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <Activity className="h-6 w-6 text-white" />
             </div>
             <span className="font-headline font-black tracking-tighter text-2xl">PRO Себя</span>
           </div>
          <p className="text-muted-foreground/30 text-[9px] uppercase tracking-[0.6em] font-black">© 2024 NEXT GEN BIOTECH LABS. ALL BIOMETRICS ENCRYPTED.</p>
        </div>
      </footer>
    </div>
  );
}
