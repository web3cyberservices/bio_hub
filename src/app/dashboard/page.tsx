
"use client";

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { NavBar } from '@/components/nav-bar';
import { RecommendationForm } from '@/components/recommendation-form';
import { RecommendationDisplay } from '@/components/recommendation-display';
import { GenerateRecommendationsOutput } from '@/ai/flows/generate-personalized-recommendations';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Activity, Calendar as CalendarIcon, LayoutDashboard, Utensils, UserCircle, Loader2, Plus, LogOut, Sparkles, MessageSquare, Brain, HeartPulse, Stethoscope, Heart, ArrowLeft, Star, User } from 'lucide-react';
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
import { ProfileCabinet } from '@/components/profile-cabinet';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export default function DashboardPage() {
  const { user, loading: userLoading } = useUser();
  const { firestore } = useFirestore();
  const { auth } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMounted, setIsMounted] = useState(false);
  const [selectedSpecialist, setSelectedSpecialist] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
    setSelectedDate(startOfToday());
  }, []);

  useEffect(() => {
    if (isMounted && !userLoading && (!user || user.uid === 'public-user')) {
      router.replace('/login');
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

  const dailyLogRef = useMemoFirebase(() => {
    if (!firestore || !user || !dateKey || user.uid === 'public-user') return null;
    return doc(firestore, 'users', user.uid, 'dailyLogs', dateKey);
  }, [firestore, user, dateKey]);

  const { data: recommendationDoc, isLoading: loadingRec } = useDoc<any>(recommendationRef);
  const { data: dailyLogDoc, isLoading: loadingLogs } = useDoc<any>(dailyLogRef);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.replace('/');
    }
  };

  const handleResult = async (result: GenerateRecommendationsOutput) => {
    if (!firestore || !user || !dateKey || user.uid === 'public-user') return;
    
    try {
      const docRef = doc(firestore, 'users', user.uid, 'recommendations', dateKey);
      await setDoc(docRef, {
        id: dateKey,
        userId: user.uid,
        date: dateKey,
        data: result,
        createdAt: new Date().toISOString()
      }, { merge: true });
      
      toast({ title: 'Анализ готов', description: 'Ваш био-отчет успешно сформирован.' });
      setActiveTab("dashboard");
    } catch (error) {
      toast({ variant: 'destructive', title: 'Ошибка сохранения', description: 'Не удалось записать отчет в базу.' });
    }
  };

  if (!isMounted || userLoading || !user || user.uid === 'public-user') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F0F7F2]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto opacity-20" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40 animate-pulse">Био-синхронизация...</p>
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

  const currentResult = recommendationDoc?.data as GenerateRecommendationsOutput | undefined;

  const posts = [
    {
      id: '1',
      author: 'Др. Ария',
      role: 'Нутрициолог',
      content: 'Почему омега-3 так важна для работы мозга? В новом исследовании доказано, что регулярное потребление жирной рыбы снижает риск деменции на 20%...',
      imageUrl: 'https://picsum.photos/seed/fish/600/300',
      likes: 124,
      date: '2 часа назад'
    },
    {
      id: '2',
      author: 'Др. Кай',
      role: 'Биохакер',
      content: 'Утренний солнечный свет в глаза в первые 30 минут после пробуждения — лучший способ настроить ваш циркадный ритм. Это бесплатно и невероятно эффективно!',
      likes: 89,
      date: '5 часов назад'
    }
  ];

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
                    {selectedDate ? getStatusLabel(selectedDate) : ''}
                  </span>
                  <div className="flex items-center gap-1 md:gap-2">
                    <span className="text-xs md:text-xl font-bold tracking-tight">
                      {selectedDate ? format(selectedDate, 'd MMMM yyyy', { locale: ru }) : ''}
                    </span>
                    <CalendarIcon className="h-3 w-3 md:h-4 md:w-4 text-primary opacity-30" />
                  </div>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[calc(100vw-2rem)] md:w-auto p-0 rounded-2xl md:rounded-[2rem] overflow-hidden shadow-2xl border-none mt-2 md:mt-4" align="center">
                <Calendar
                  mode="single"
                  selected={selectedDate || undefined}
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
            {selectedDate && (
              <UnifiedDataEntry selectedDate={selectedDate}>
                <Button className="rounded-xl md:rounded-2xl h-10 md:h-12 gap-2 bg-primary hover:bg-primary/90 font-black px-4 md:px-6 shadow-lg shadow-primary/20">
                  <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Записать данные</span>
                </Button>
              </UnifiedDataEntry>
            )}
            <Button variant="outline" size="icon" onClick={handleLogout} className="rounded-xl md:rounded-2xl h-10 md:h-12 w-10 md:w-12 border-primary/20 text-primary hover:bg-primary/5">
              <LogOut className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
          </div>
        </div>
      </div>

      <main className="container mx-auto flex-1 px-4 py-6 md:py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6 md:space-y-10">
          <div className="flex justify-center">
            <TabsList className="bg-white/60 backdrop-blur-md p-1 rounded-xl md:rounded-[2rem] h-14 md:h-20 border shadow-md max-w-4xl w-full">
              <TabsTrigger value="specialists" className="rounded-lg md:rounded-[1.5rem] px-2 md:px-8 font-black uppercase tracking-widest text-[7px] md:text-[10px] gap-1 md:gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all h-full flex-1">
                <Stethoscope className="h-3 w-3 md:h-4 md:w-4" /> Советы
              </TabsTrigger>
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

          {(loadingRec || loadingLogs) ? (
            <div className="flex flex-col items-center justify-center py-16 md:py-24 space-y-4">
              <Loader2 className="h-10 w-10 md:h-12 md:w-12 animate-spin text-primary opacity-20" />
              <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground">Загрузка биометрии...</p>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <TabsContent value="specialists" className="mt-0 outline-none">
                {selectedSpecialist ? (
                  <div className="space-y-8 max-w-4xl mx-auto">
                    <Button variant="ghost" onClick={() => setSelectedSpecialist(null)} className="rounded-xl gap-2 text-primary font-black uppercase tracking-widest text-[10px]">
                      <ArrowLeft className="h-4 w-4" /> Назад к ленте
                    </Button>
                    
                    <Card className="premium-card overflow-hidden border-none shadow-2xl">
                      <CardContent className="p-0">
                        <div className="h-48 bg-primary/20 relative">
                           <div className="absolute -bottom-16 left-10">
                              <div className="w-32 h-32 rounded-[2.5rem] bg-white p-2 shadow-2xl">
                                 <div className="w-full h-full bg-primary/10 rounded-[2rem] flex items-center justify-center">
                                    <User className="h-16 w-16 text-primary" />
                                 </div>
                              </div>
                           </div>
                        </div>
                        <div className="pt-20 p-10 space-y-6">
                           <div className="flex justify-between items-start">
                              <div>
                                 <h2 className="text-4xl font-black tracking-tighter">{selectedSpecialist.name}</h2>
                                 <p className="text-primary font-bold uppercase tracking-widest text-xs">{selectedSpecialist.role}</p>
                              </div>
                              <div className="flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-2xl">
                                 <Star className="h-5 w-5 text-accent fill-accent" />
                                 <span className="font-black text-xl">4.9</span>
                              </div>
                           </div>
                           <div className="space-y-4">
                              <h4 className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">О специалисте</h4>
                              <p className="text-lg leading-relaxed text-foreground/80">Эксперт с более чем 10-летним стажем в области интегративной медицины. Специализируется на коррекции образа жизни и управлении энергией через питание.</p>
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="bg-muted/30 p-6 rounded-3xl">
                                 <p className="text-2xl font-black">1.2k</p>
                                 <p className="text-[10px] font-bold text-muted-foreground uppercase">Пациентов</p>
                              </div>
                              <div className="bg-muted/30 p-6 rounded-3xl">
                                 <p className="text-2xl font-black">450</p>
                                 <p className="text-[10px] font-bold text-muted-foreground uppercase">Отзывов</p>
                              </div>
                           </div>
                           <Button className="w-full h-16 rounded-2xl bg-primary font-black shadow-xl">Записаться на консультацию</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="space-y-12">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-16 md:h-16 bg-primary/10 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
                          <Sparkles className="h-5 w-5 md:h-8 md:w-8 text-primary" />
                        </div>
                        <div>
                          <h2 className="text-xl md:text-5xl font-black tracking-tighter text-foreground">Советы ИИ-специалистов</h2>
                          <p className="text-muted-foreground text-[10px] md:text-base font-medium">Ваш персональный консилиум по биохакингу.</p>
                        </div>
                    </div>

                    <Tabs defaultValue="ai" className="w-full">
                      <div className="flex justify-center mb-8">
                        <TabsList className="rounded-2xl bg-muted/50 p-1">
                          <TabsTrigger value="ai" className="rounded-xl px-8 font-black uppercase text-[9px] tracking-widest h-10 data-[state=active]:bg-white">Консилиум</TabsTrigger>
                          <TabsTrigger value="feed" className="rounded-xl px-8 font-black uppercase text-[9px] tracking-widest h-10 data-[state=active]:bg-white">Лента знаний</TabsTrigger>
                        </TabsList>
                      </div>

                      <TabsContent value="ai" className="space-y-8 outline-none">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                              { 
                                name: 'Др. Ария', 
                                role: 'Нутрициолог', 
                                icon: Utensils, 
                                color: 'text-orange-500', 
                                bg: 'bg-orange-50',
                                advice: currentResult?.recommendations.diet || 'Для получения советов по питанию необходимо выполнить био-анализ.'
                              },
                              { 
                                name: 'Др. Кай', 
                                role: 'Эксперт по образу жизни', 
                                icon: Brain, 
                                color: 'text-indigo-600', 
                                bg: 'bg-indigo-50',
                                advice: currentResult?.recommendations.lifestyle || 'Рекомендации по режиму дня появятся здесь после обработки ваших данных.'
                              },
                              { 
                                name: 'Др. Сола', 
                                role: 'Биохимик', 
                                icon: HeartPulse, 
                                color: 'text-rose-600', 
                                bg: 'bg-rose-50',
                                advice: currentResult?.recommendations.supplements || 'Анализ необходимых нутрицевтиков будет доступен в этом разделе.'
                              }
                            ].map((spec, i) => (
                              <Card key={i} className="premium-card border-none shadow-xl overflow-hidden group hover:scale-[1.02] transition-all">
                                <CardContent className="p-8 space-y-6">
                                    <div className="flex items-center gap-4">
                                      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner", spec.bg)}>
                                          <spec.icon className={cn("h-7 w-7", spec.color)} />
                                      </div>
                                      <div>
                                          <h4 className="font-black text-lg leading-none">{spec.name}</h4>
                                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{spec.role}</p>
                                      </div>
                                    </div>
                                    <div className="bg-[#E8F5EE] p-5 rounded-2xl shadow-inner min-h-[120px]">
                                      <p className="text-sm font-medium text-foreground/80 leading-relaxed italic">
                                          "{spec.advice}"
                                      </p>
                                    </div>
                                    <Button onClick={() => setSelectedSpecialist(spec)} variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 gap-2">
                                      <MessageSquare className="h-3 w-3" /> Обсудить в чате
                                    </Button>
                                </CardContent>
                              </Card>
                            ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="feed" className="space-y-6 outline-none">
                        <div className="max-w-3xl mx-auto space-y-8">
                          {posts.map(post => (
                            <Card key={post.id} className="premium-card border-none shadow-xl overflow-hidden group">
                              <CardContent className="p-0">
                                {post.imageUrl && (
                                  <div className="relative h-64 overflow-hidden">
                                    <Image src={post.imageUrl} alt="post" fill className="object-cover group-hover:scale-105 transition-transform duration-700" unoptimized />
                                  </div>
                                )}
                                <div className="p-8 space-y-6">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => setSelectedSpecialist({ name: post.author, role: post.role })}>
                                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-primary">
                                        {post.author[0]}
                                      </div>
                                      <div>
                                        <h4 className="font-black">{post.author}</h4>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{post.role}</p>
                                      </div>
                                    </div>
                                    <span className="text-[9px] font-bold text-muted-foreground uppercase">{post.date}</span>
                                  </div>
                                  <p className="text-lg leading-relaxed text-foreground/80">{post.content}</p>
                                  <div className="flex items-center gap-4 pt-2">
                                    <Button variant="ghost" className="rounded-xl gap-2 font-black text-xs text-muted-foreground hover:text-red-500">
                                      <Heart className="h-4 w-4" /> {post.likes}
                                    </Button>
                                    <Button variant="ghost" className="rounded-xl gap-2 font-black text-xs text-muted-foreground">
                                      <MessageSquare className="h-4 w-4" /> 12
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>

                    {!currentResult && selectedDate && (
                        <div className="text-center py-10">
                          <Button 
                            onClick={() => setActiveTab("dashboard")}
                            className="rounded-2xl h-16 px-10 bg-primary font-black shadow-xl hover:scale-105 transition-all gap-3"
                          >
                            <Sparkles className="h-5 w-5 text-accent" /> Сформировать советы на сегодня
                          </Button>
                        </div>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="dashboard" className="mt-0 outline-none">
                {currentResult ? (
                  <div className="space-y-6 md:space-y-10">
                    <div className="flex items-center gap-3 md:gap-4">
                       <div className="w-10 h-10 md:w-16 md:h-16 bg-primary/10 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
                          <LayoutDashboard className="h-5 w-5 md:h-8 md:w-8 text-primary" />
                       </div>
                       <div>
                          <h2 className="text-xl md:text-5xl font-black tracking-tighter text-foreground">Обзор здоровья</h2>
                          <p className="text-muted-foreground text-[10px] md:text-base font-medium">Анализ на {selectedDate ? format(selectedDate, 'd MMMM', { locale: ru }) : ''}</p>
                       </div>
                    </div>
                    <RecommendationDisplay 
                      data={currentResult} 
                      mode="dashboard" 
                      deviceData={dailyLogDoc}
                    />
                  </div>
                ) : (
                  selectedDate && <NoDataView onResult={handleResult} selectedDate={selectedDate} />
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
                          <p className="text-muted-foreground text-[10px] md:text-base font-medium">Персонализированное меню от ИИ.</p>
                       </div>
                    </div>
                    <RecommendationDisplay 
                      data={currentResult} 
                      mode="meals" 
                    />
                  </div>
                ) : (
                  selectedDate && <NoDataView onResult={handleResult} selectedDate={selectedDate} />
                )}
              </TabsContent>

              <TabsContent value="profile" className="mt-0 outline-none">
                <ProfileCabinet />
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
          Анализ не выполнен
        </Badge>
        <h2 className="text-xl md:text-5xl font-black tracking-tight leading-tight md:leading-none">Данные для анализа отсутствуют</h2>
        <p className="text-muted-foreground max-w-lg mx-auto font-medium text-xs md:text-lg px-4">Обновите ваши показатели, чтобы ИИ подготовил план на {format(selectedDate, 'd MMMM', { locale: ru })}.</p>
      </div>
      <RecommendationForm onResult={onResult} selectedDate={selectedDate} />
    </div>
  );
}
