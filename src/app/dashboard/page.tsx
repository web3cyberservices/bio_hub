"use client";

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { NavBar } from '@/components/nav-bar';
import { RecommendationForm } from '@/components/recommendation-form';
import { RecommendationDisplay } from '@/components/recommendation-display';
import { GenerateRecommendationsOutput } from '@/ai/flows/generate-personalized-recommendations';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, ChevronRight, Activity, Calendar as CalendarIcon, LayoutDashboard, 
  Utensils, UserCircle, Loader2, Plus, LogOut, Sparkles, MessageSquare, Brain, 
  HeartPulse, Stethoscope, Heart, ArrowLeft, Star, User, BookOpen, Users, CalendarCheck,
  ThumbsUp, Share2, Info, Briefcase, Zap, ShoppingBasket, ClipboardList, PenTool,
  RefreshCw, ShieldCheck, Mic
} from 'lucide-react';
import { format, addDays, startOfToday } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { AISpecialistChat } from '@/components/ai-specialist-chat';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UnifiedDataEntry } from '@/components/unified-data-entry';
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, setDoc, collection, query, orderBy, arrayUnion, arrayRemove, updateDoc, where } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/firebase/provider';
import { ProfileCabinet } from '@/components/profile-cabinet';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { CreatePostDialog } from '@/components/create-post-dialog';
import { ChatInterface } from '@/components/chat-interface';
import { SpecialistPublicProfile } from '@/components/specialist-public-profile';
import { ProductsMenuGenerator } from '@/components/products-menu-generator';
import { PersonalMealPlan } from '@/components/personal-meal-plan';
import { useHealthAggregator } from '@/hooks/use-health-aggregator';

export default function DashboardPage() {
  const { user, loading: userLoading } = useUser();
  const { firestore } = useFirestore();
  const { auth } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMounted, setIsMounted] = useState(false);
  const [viewingSpecialistId, setViewingSpecialistId] = useState<string | null>(null);
  const [viewingPatientId, setViewingPatientId] = useState<string | null>(null);

  const { isSyncing: aggregatorSyncing } = useHealthAggregator();

  useEffect(() => {
    setIsMounted(true);
    setSelectedDate(startOfToday());
  }, []);

  const dateKey = useMemo(() => {
    if (!selectedDate) return null;
    return format(selectedDate, 'yyyy-MM-dd');
  }, [selectedDate]);
  
  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const recommendationRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid || !dateKey) return null;
    const targetUid = viewingPatientId || user.uid;
    return doc(firestore, 'users', targetUid, 'recommendations', dateKey);
  }, [firestore, user?.uid, dateKey, viewingPatientId]);

  const dailyLogRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid || !dateKey) return null;
    const targetUid = viewingPatientId || user.uid;
    return doc(firestore, 'users', targetUid, 'dailyLogs', dateKey);
  }, [firestore, user?.uid, dateKey, viewingPatientId]);

  const patientsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'users'), where('sharedWith', 'array-contains', user.uid));
  }, [firestore, user?.uid]);

  const postsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'posts'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: userData, isLoading: profileLoading } = useDoc<any>(userDocRef);
  const { data: recommendationDoc, isLoading: loadingRec } = useDoc<any>(recommendationRef);
  const { data: dailyLogDoc, isLoading: loadingLogs } = useDoc<any>(dailyLogRef);
  const { data: posts } = useCollection<any>(postsQuery);
  const { data: patients } = useCollection<any>(patientsQuery);

  const profileType = userData?.profileType === 'specialist' ? 'specialist' : 'user';

  // Автоматическое переключение вкладок при смене роли
  useEffect(() => {
    if (profileType === 'specialist') {
      // Если специалист зашел на пользовательские вкладки, перекидываем его на пациентов или ленту
      if (activeTab === 'dashboard' || activeTab === 'meals') {
        setActiveTab('patients');
      }
    } else {
      // Если пользователь оказался на вкладке пациентов, возвращаем на дашборд
      if (activeTab === 'patients') {
        setActiveTab('dashboard');
      }
    }
  }, [profileType]);

  const handleLogout = async () => {
    if (auth) { await signOut(auth); router.replace('/'); }
  };

  const handleResult = (result: GenerateRecommendationsOutput) => {
    if (!firestore || !user?.uid || !dateKey) return;
    const docRef = doc(firestore, 'users', user.uid, 'recommendations', dateKey);
    setDoc(docRef, { id: dateKey, userId: user.uid, date: dateKey, data: result, createdAt: new Date().toISOString() }, { merge: true });
    toast({ title: 'Цифровая копия обновлена' });
  };

  if (!isMounted || userLoading || !user) return <div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="h-12 w-12 animate-spin text-primary opacity-50" /></div>;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/20">
      <NavBar />
      
      <main className="container mx-auto flex-1 px-4 py-6 md:py-10 max-w-6xl pb-32">
        {viewingSpecialistId ? <SpecialistPublicProfile specialistId={viewingSpecialistId} onBack={() => setViewingSpecialistId(null)} onStartChat={() => setActiveTab('chats')} /> : (
          <Tabs key={profileType} value={activeTab} onValueChange={setActiveTab} className="w-full space-y-8">
            
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <TabsContent value="feed" className="mt-0 space-y-8">
                 <div className="flex items-center justify-between px-2">
                    <h2 className="text-xl font-black tracking-widest text-primary neo-glow uppercase">Bio-Лента</h2>
                    {profileType === 'specialist' && <CreatePostDialog />}
                 </div>
                 <div className="grid grid-cols-1 gap-6 max-w-2xl mx-auto">
                    {posts?.map((post) => (
                      <Card key={post.id} className="cyber-card p-6 space-y-6">
                        <button className="flex items-center gap-3 text-left" onClick={() => setViewingSpecialistId(post.authorId)}>
                           <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/20">
                              {post.authorPhoto ? <Image src={post.authorPhoto} alt="Author" width={40} height={40} className="object-cover" /> : <User className="h-5 w-5 text-primary" />}
                           </div>
                           <div>
                              <h4 className="font-black text-sm tracking-tight text-white">{post.authorName}</h4>
                              <p className="text-[8px] text-primary/60 uppercase font-bold">{post.authorRole}</p>
                           </div>
                        </button>
                        <p className="text-xs md:text-sm font-medium leading-relaxed text-white/80">{post.content}</p>
                        {post.imageUrl && <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/5"><Image src={post.imageUrl} alt="Post" fill className="object-cover" /></div>}
                      </Card>
                    ))}
                 </div>
              </TabsContent>

              <TabsContent value="dashboard" className="mt-0">
                {recommendationDoc?.data ? (
                  <RecommendationDisplay data={recommendationDoc.data} mode="dashboard" deviceData={dailyLogDoc} />
                ) : (
                  <div className="text-center py-20 flex flex-col items-center gap-8 animate-in zoom-in-95 duration-500">
                    <div className="relative">
                       <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                       <Brain className="h-24 w-24 text-primary neo-glow-strong" />
                    </div>
                    <div className="space-y-2">
                       <h2 className="text-3xl font-black tracking-tighter text-white uppercase">Инициализация двойника</h2>
                       <p className="text-primary/60 font-bold uppercase tracking-widest text-[10px]">Нужны данные для формирования цифровой копии</p>
                    </div>
                    {!viewingPatientId && <RecommendationForm onResult={handleResult} selectedDate={selectedDate || startOfToday()} />}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="meals" className="mt-0">
                 <div className="max-w-4xl mx-auto space-y-8">
                    <Tabs defaultValue="personal" className="w-full">
                       <TabsList className="bg-white/5 border border-white/10 p-1 rounded-2xl h-14 max-w-md mx-auto grid grid-cols-3 mb-10">
                          <TabsTrigger value="personal" className="rounded-xl font-black uppercase text-[9px] data-[state=active]:bg-primary">Свой план</TabsTrigger>
                          <TabsTrigger value="plan" className="rounded-xl font-black uppercase text-[9px] data-[state=active]:bg-primary">План ИИ</TabsTrigger>
                          <TabsTrigger value="inventory" className="rounded-xl font-black uppercase text-[9px] data-[state=active]:bg-primary">Из продуктов</TabsTrigger>
                       </TabsList>
                       <TabsContent value="personal"><PersonalMealPlan selectedDate={selectedDate || startOfToday()} /></TabsContent>
                       <TabsContent value="plan">
                          {recommendationDoc?.data ? <RecommendationDisplay data={recommendationDoc.data} mode="meals" /> : <div className="text-center py-20"><Button onClick={() => setActiveTab('dashboard')} className="bg-primary font-black px-10 rounded-xl">Сгенерировать</Button></div>}
                       </TabsContent>
                       <TabsContent value="inventory"><ProductsMenuGenerator /></TabsContent>
                    </Tabs>
                 </div>
              </TabsContent>

              <TabsContent value="patients" className="mt-0"><div className="max-w-4xl mx-auto space-y-8"><h2 className="text-xl font-black text-primary uppercase tracking-widest px-2">Список пациентов</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{patients?.map(p => (<Card key={p.id} className="cyber-card p-6 flex items-center justify-between"><div className="flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">{p.photoUrl ? <Image src={p.photoUrl} alt="Patient" width={48} height={48} className="rounded-lg object-cover" /> : <User className="h-6 w-6 text-primary" />}</div><div><h4 className="font-black text-sm text-white">{p.firstName} {p.lastName}</h4><Badge variant="outline" className="text-[7px] uppercase tracking-widest border-primary/20 text-primary/60">Доступ разрешен</Badge></div></div><div className="flex gap-2"><Button size="sm" className="rounded-lg h-9 px-3 bg-primary font-black uppercase text-[8px]" onClick={() => { setViewingPatientId(p.id); setActiveTab('dashboard'); }}>Аналитика</Button></div></Card>))}{(!patients || patients.length === 0) && <div className="py-20 text-center opacity-30"><ShieldCheck className="h-12 w-12 mx-auto text-primary mb-4" /><p className="font-black uppercase tracking-widest text-[10px]">Пациенты пока не открыли доступ</p></div>}</div></div></TabsContent>
              <TabsContent value="chats" className="mt-0"><ChatInterface /></TabsContent>
              <TabsContent value="profile" className="mt-0"><ProfileCabinet /></TabsContent>
            </div>

            {/* Bottom Futuristic Navigation Bar */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95vw] max-w-lg">
               <div className="bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] h-20 px-2 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                  <button onClick={() => setActiveTab('feed')} className={cn("flex flex-col items-center justify-center flex-1 h-full rounded-2xl gap-1 transition-all", activeTab === 'feed' ? "text-primary" : "text-white/40")}>
                    <BookOpen className={cn("h-5 w-5", activeTab === 'feed' && "neo-glow")} />
                    <span className="text-[7px] font-black uppercase tracking-widest">Лента</span>
                  </button>
                  
                  {profileType === 'user' ? (
                    <>
                      <button onClick={() => setActiveTab('dashboard')} className={cn("flex flex-col items-center justify-center flex-1 h-full rounded-2xl gap-1 transition-all", activeTab === 'dashboard' ? "text-primary" : "text-white/40")}>
                        <Activity className={cn("h-5 w-5", activeTab === 'dashboard' && "neo-glow")} />
                        <span className="text-[7px] font-black uppercase tracking-widest">Двойник</span>
                      </button>
                      <button onClick={() => setActiveTab('meals')} className={cn("flex flex-col items-center justify-center flex-1 h-full rounded-2xl gap-1 transition-all", activeTab === 'meals' ? "text-primary" : "text-white/40")}>
                        <Utensils className={cn("h-5 w-5", activeTab === 'meals' && "neo-glow")} />
                        <span className="text-[7px] font-black uppercase tracking-widest">Питание</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setActiveTab('patients')} className={cn("flex flex-col items-center justify-center flex-1 h-full rounded-2xl gap-1 transition-all", activeTab === 'patients' ? "text-primary" : "text-white/40")}>
                        <Users className={cn("h-5 w-5", activeTab === 'patients' && "neo-glow")} />
                        <span className="text-[7px] font-black uppercase tracking-widest">Пациенты</span>
                      </button>
                    </>
                  )}

                  <div className="relative flex items-center justify-center px-2">
                     <UnifiedDataEntry selectedDate={selectedDate || startOfToday()}>
                        <button className="h-14 w-14 bg-primary rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(14,165,233,0.5)] hover:scale-110 active:scale-95 transition-all">
                           <Plus className="h-6 w-6 text-black" />
                        </button>
                     </UnifiedDataEntry>
                  </div>

                  <button onClick={() => setActiveTab('chats')} className={cn("flex flex-col items-center justify-center flex-1 h-full rounded-2xl gap-1 transition-all", activeTab === 'chats' ? "text-primary" : "text-white/40")}>
                    <MessageSquare className={cn("h-5 w-5", activeTab === 'chats' && "neo-glow")} />
                    <span className="text-[7px] font-black uppercase tracking-widest">Чаты</span>
                  </button>
                  <button onClick={() => setActiveTab('profile')} className={cn("flex flex-col items-center justify-center flex-1 h-full rounded-2xl gap-1 transition-all", activeTab === 'profile' ? "text-primary" : "text-white/40")}>
                    <UserCircle className={cn("h-5 w-5", activeTab === 'profile' && "neo-glow")} />
                    <span className="text-[7px] font-black uppercase tracking-widest">Профиль</span>
                  </button>
               </div>
            </div>

          </Tabs>
        )}
      </main>
      
      <AISpecialistChat />
      <footer className="py-10 text-center opacity-10">
         <p className="text-[6px] font-black uppercase tracking-[1em]">Bio-Tech Interface Protocol</p>
      </footer>
    </div>
  );
}
