
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
  ThumbsUp, Share2, Info, Briefcase, Zap, ShoppingBasket, ClipboardList, PenTool
} from 'lucide-react';
import { format, addDays, startOfToday, isToday as isDateToday } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { AISpecialistChat } from '@/components/ai-specialist-chat';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UnifiedDataEntry } from '@/components/unified-data-entry';
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, setDoc, collection, query, orderBy, arrayUnion, arrayRemove, updateDoc } from 'firebase/firestore';
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

export default function DashboardPage() {
  const { user, loading: userLoading } = useUser();
  const { firestore } = useFirestore();
  const { auth } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState("feed");
  const [isMounted, setIsMounted] = useState(false);
  const [viewingSpecialistId, setViewingSpecialistId] = useState<string | null>(null);

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
    return doc(firestore, 'users', user.uid, 'recommendations', dateKey);
  }, [firestore, user?.uid, dateKey]);

  const dailyLogRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid || !dateKey) return null;
    return doc(firestore, 'users', user.uid, 'dailyLogs', dateKey);
  }, [firestore, user?.uid, dateKey]);

  const postsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'posts'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: userData, isLoading: profileLoading } = useDoc<any>(userDocRef);
  const { data: recommendationDoc, isLoading: loadingRec } = useDoc<any>(recommendationRef);
  const { data: dailyLogDoc, isLoading: loadingLogs } = useDoc<any>(dailyLogRef);
  const { data: posts } = useCollection<any>(postsQuery);

  const profileType = userData?.profileType === 'specialist' ? 'specialist' : 'user';

  useEffect(() => {
    if (profileLoading) return;
    const userTabs = ["feed", "dashboard", "meals", "chats", "profile"];
    const specialistTabs = ["feed", "my-feed", "appointments", "chats", "profile"];
    if (profileType === 'user' && !userTabs.includes(activeTab)) setActiveTab("feed");
    else if (profileType === 'specialist' && !specialistTabs.includes(activeTab)) setActiveTab("feed");
  }, [profileType, activeTab, profileLoading]);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.replace('/');
    }
  };

  const handleResult = (result: GenerateRecommendationsOutput) => {
    if (!firestore || !user?.uid || !dateKey) return;
    const docRef = doc(firestore, 'users', user.uid, 'recommendations', dateKey);
    const data = { id: dateKey, userId: user.uid, date: dateKey, data: result, createdAt: new Date().toISOString() };
    setDoc(docRef, data, { merge: true });
    toast({ title: 'Анализ готов', description: 'Ваш био-отчет успешно сформирован.' });
    setActiveTab("dashboard");
  };

  const handleLike = (postId: string, likedBy: string[]) => {
    if (!firestore || !user?.uid) return;
    const isLiked = likedBy?.includes(user.uid);
    const postRef = doc(firestore, 'posts', postId);
    updateDoc(postRef, {
      likedBy: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid),
      likes: isLiked ? Math.max(0, (likedBy?.length || 1) - 1) : ((likedBy?.length || 0) + 1)
    });
  };

  const handleStartChat = (targetId: string, name: string, photo: string) => {
    if (!firestore || !user?.uid) {
      toast({ title: 'Ошибка', description: 'Не удалось инициализировать чат.' });
      return;
    }
    const chatId = [user.uid, targetId].sort().join('_');
    const chatRef = doc(firestore, 'chats', chatId);
    setDoc(chatRef, {
      id: chatId, participants: [user.uid, targetId],
      participantDetails: { [user.uid]: { name: userData?.firstName || 'Пользователь', photo: userData?.photoUrl || '' }, [targetId]: { name: name, photo: photo || '' } },
      updatedAt: new Date().toISOString()
    }, { merge: true });
    setViewingSpecialistId(null);
    setActiveTab('chats');
  };

  if (!isMounted || userLoading || !user) {
    return <div className="flex min-h-screen items-center justify-center bg-[#F0F7F2]"><Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" /></div>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F0F7F2]">
      <NavBar />
      <div className="bg-white/90 backdrop-blur-xl border-b sticky top-16 md:top-20 z-40 py-2 md:py-4 shadow-sm">
        <div className="container mx-auto px-4 flex items-center justify-between gap-2 md:gap-4">
          <div className="flex items-center gap-1 md:gap-2 mx-auto">
            <Button variant="ghost" size="icon" className="rounded-xl h-8 w-8 md:h-10 md:w-10 hover:bg-primary/5" onClick={() => setSelectedDate(prev => prev ? addDays(prev, -1) : null)}><ChevronLeft className="h-4 w-4 md:h-5 md:w-5 text-primary" /></Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="px-2 md:px-4 h-10 md:h-14 rounded-xl md:rounded-2xl flex flex-col items-center justify-center gap-0.5 hover:bg-primary/5 min-w-[120px] md:min-w-[200px]">
                  <span className="text-[7px] md:text-[9px] font-black uppercase tracking-[0.3em] text-primary/60 leading-none">{selectedDate ? (isDateToday(selectedDate) ? "СЕГОДНЯ" : format(selectedDate, 'EEEE', { locale: ru }).toUpperCase()) : ''}</span>
                  <div className="flex items-center gap-1 md:gap-2"><span className="text-xs md:text-xl font-bold tracking-tight">{selectedDate ? format(selectedDate, 'd MMMM yyyy', { locale: ru }) : ''}</span><CalendarIcon className="h-3 w-3 md:h-4 md:w-4 text-primary opacity-30" /></div>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[calc(100vw-2rem)] md:w-auto p-0 rounded-2xl md:rounded-[2rem] overflow-hidden shadow-2xl border-none mt-2" align="center"><Calendar mode="single" selected={selectedDate || undefined} onSelect={(date) => date && setSelectedDate(date)} locale={ru} /></PopoverContent>
            </Popover>
            <Button variant="ghost" size="icon" className="rounded-xl h-8 w-8 md:h-10 md:w-10 hover:bg-primary/5" onClick={() => setSelectedDate(prev => prev ? addDays(prev, 1) : null)}><ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-primary" /></Button>
          </div>
          <div className="flex items-center gap-2 md:gap-4">{selectedDate && <UnifiedDataEntry selectedDate={selectedDate}><Button className="rounded-xl md:rounded-2xl h-10 md:h-12 gap-2 bg-primary hover:bg-primary/90 font-black px-4 md:px-6 shadow-lg shadow-primary/20"><Plus className="h-4 w-4" /> <span className="hidden sm:inline">Данные</span></Button></UnifiedDataEntry>}{user?.uid !== 'public-user' && <Button variant="outline" size="icon" onClick={handleLogout} className="rounded-xl md:rounded-2xl h-10 md:h-12 w-10 md:w-12 border-primary/20 text-primary hover:bg-primary/5"><LogOut className="h-4 w-4 md:h-5 md:w-5" /></Button>}</div>
        </div>
      </div>

      <main className="container mx-auto flex-1 px-4 py-6 md:py-12">
        {viewingSpecialistId ? <SpecialistPublicProfile specialistId={viewingSpecialistId} onBack={() => setViewingSpecialistId(null)} onStartChat={handleStartChat} /> : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6 md:space-y-10">
            {!profileLoading && (
              <div className="flex justify-center">
                <TabsList className="bg-white/60 backdrop-blur-md p-1 rounded-xl md:rounded-[2rem] h-14 md:h-20 border shadow-md max-w-6xl w-full overflow-x-auto no-scrollbar">
                  <TabsTrigger value="feed" className="rounded-lg md:rounded-[1.5rem] px-2 md:px-8 font-black uppercase tracking-widest text-[7px] md:text-[10px] gap-1 md:gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all h-full flex-1 min-w-max"><BookOpen className="h-3 w-3 md:h-4 md:w-4" /> Bio-Лента</TabsTrigger>
                  {profileType === 'user' ? (<><TabsTrigger value="dashboard" className="rounded-lg md:rounded-[1.5rem] px-2 md:px-8 font-black uppercase tracking-widest text-[7px] md:text-[10px] gap-1 md:gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all h-full flex-1 min-w-max"><LayoutDashboard className="h-3 w-3 md:h-4 md:w-4" /> Дашборд</TabsTrigger><TabsTrigger value="meals" className="rounded-lg md:rounded-[1.5rem] px-2 md:px-8 font-black uppercase tracking-widest text-[7px] md:text-[10px] gap-1 md:gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all h-full flex-1 min-w-max"><Utensils className="h-3 w-3 md:h-4 md:w-4" /> Питание</TabsTrigger></>) : (<><TabsTrigger value="my-feed" className="rounded-lg md:rounded-[1.5rem] px-2 md:px-8 font-black uppercase tracking-widest text-[7px] md:text-[10px] gap-1 md:gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all h-full flex-1 min-w-max"><Briefcase className="h-3 w-3 md:h-4 md:w-4" /> Мои посты</TabsTrigger><TabsTrigger value="appointments" className="rounded-lg md:rounded-[1.5rem] px-2 md:px-8 font-black uppercase tracking-widest text-[7px] md:text-[10px] gap-1 md:gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all h-full flex-1 min-w-max"><CalendarCheck className="h-3 w-3 md:h-4 md:w-4" /> Приемы</TabsTrigger></>)}
                  <TabsTrigger value="chats" className="rounded-lg md:rounded-[1.5rem] px-2 md:px-8 font-black uppercase tracking-widest text-[7px] md:text-[10px] gap-1 md:gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all h-full flex-1 min-w-max"><Users className="h-3 w-3 md:h-4 md:w-4" /> Чаты</TabsTrigger>
                  <TabsTrigger value="profile" className="rounded-lg md:rounded-[1.5rem] px-2 md:px-8 font-black uppercase tracking-widest text-[7px] md:text-[10px] gap-1 md:gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all h-full flex-1 min-w-max"><UserCircle className="h-3 w-3 md:h-4 md:w-4" /> Профиль</TabsTrigger>
                </TabsList>
              </div>
            )}
            {(loadingRec || loadingLogs || profileLoading) ? <div className="flex flex-col items-center justify-center py-24 space-y-4"><Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" /><p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Био-синхронизация...</p></div> : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <TabsContent value="feed" className="mt-0 outline-none"><div className="space-y-12"><div className="flex items-center justify-between gap-4"><div className="flex items-center gap-4"><div className="w-10 h-10 md:w-16 md:h-16 bg-primary/10 rounded-xl md:rounded-2xl flex items-center justify-center"><Sparkles className="h-5 w-5 md:h-8 md:w-8 text-primary" /></div><div><h2 className="text-xl md:text-5xl font-black tracking-tighter">Bio-Лента</h2><p className="text-muted-foreground text-[10px] md:text-base">Знания экспертов и ИИ-аналитика в одном месте.</p></div></div>{profileType === 'specialist' && <CreatePostDialog />}</div><Tabs defaultValue="knowledge" className="w-full"><TabsList className="bg-transparent border-b rounded-none h-auto p-0 gap-8 mb-8"><TabsTrigger value="knowledge" className="data-[state=active]:border-primary border-b-2 border-transparent rounded-none bg-transparent px-0 pb-4 font-black uppercase tracking-widest text-[10px]">Лента знаний</TabsTrigger>{profileType === 'user' && <TabsTrigger value="ai" className="data-[state=active]:border-primary border-b-2 border-transparent rounded-none bg-transparent px-0 pb-4 font-black uppercase tracking-widest text-[10px]">ИИ Консилиум</TabsTrigger>}</TabsList><TabsContent value="ai" className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">{[{ name: 'Др. Ария', role: 'Нутрициолог', icon: Utensils, bg: 'bg-orange-50', color: 'text-orange-500' }, { name: 'Др. Кай', role: 'Биохакер', icon: Brain, bg: 'bg-emerald-50', color: 'text-emerald-500' }, { name: 'Др. Сола', role: 'Сомнолог', icon: HeartPulse, bg: 'bg-indigo-50', color: 'text-indigo-500' }].map((spec, i) => (<Card key={i} className="premium-card overflow-hidden"><CardContent className="p-8 space-y-6"><div className="flex items-center gap-4"><div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner", spec.bg)}><spec.icon className={cn("h-7 w-7", spec.color)} /></div><div><h4 className="font-black text-lg">{spec.name}</h4><Badge variant="outline" className="text-[8px] uppercase tracking-widest border-primary/20 text-primary/60">{spec.role}</Badge></div></div><p className="text-sm italic text-muted-foreground">"На основе ваших данных, я рекомендую увеличить потребление магния."</p><Button variant="ghost" className="w-full rounded-xl bg-primary/5 text-primary text-[9px] font-black uppercase tracking-widest">Подробнее</Button></CardContent></Card>))}</TabsContent><TabsContent value="knowledge" className="max-w-3xl mx-auto space-y-8 pt-4">{posts?.map((post) => (<Card key={post.id} className="premium-card overflow-hidden border-none shadow-xl"><div className="p-6 md:p-8 space-y-6"><div className="flex items-center justify-between"><button className="flex items-center gap-4 text-left hover:opacity-80 transition-opacity" onClick={() => setViewingSpecialistId(post.authorId)}><div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/10">{post.authorPhoto ? (<Image src={post.authorPhoto} alt={post.authorName} width={48} height={48} className="object-cover w-full h-full" />) : (<User className="h-6 w-6 text-primary" />)}</div><div><h4 className="font-black text-base">{post.authorName}</h4><p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{post.authorRole}</p></div></button><div className="text-right"><p className="text-[9px] font-bold text-muted-foreground/40">{format(new Date(post.createdAt), 'd MMM HH:mm', { locale: ru })}</p><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setViewingSpecialistId(post.authorId)}><Info className="h-3 w-3 text-primary/40" /></Button></div></div><div className="space-y-4"><p className="text-sm md:text-base font-medium leading-relaxed whitespace-pre-wrap">{post.content}</p>{post.imageUrl && (<div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl"><Image src={post.imageUrl} alt="Post" fill className="object-cover" /></div>)}</div><div className="flex items-center gap-6 pt-4 border-t"><Button variant="ghost" className={cn("rounded-full px-6 gap-2 transition-all", post.likedBy?.includes(user.uid) ? "text-primary bg-primary/10" : "text-muted-foreground")} onClick={() => handleLike(post.id, post.likedBy || [])}><ThumbsUp className={cn("h-4 w-4", post.likedBy?.includes(user.uid) && "fill-primary")} /> <span className="font-black text-xs">{post.likes || 0}</span></Button><Button variant="ghost" className="rounded-full px-6 gap-2 text-muted-foreground"><Share2 className="h-4 w-4" /></Button></div></div></Card>))}{(!posts || posts.length === 0) && (<Card className="premium-card p-20 text-center border-dashed border-2"><p className="text-muted-foreground font-black uppercase tracking-widest text-xs">Лента пока пуста</p></Card>)}</TabsContent></Tabs></div></TabsContent>
                <TabsContent value="dashboard" className="mt-0 outline-none">{recommendationDoc?.data ? <RecommendationDisplay data={recommendationDoc.data} mode="dashboard" deviceData={dailyLogDoc} /> : (<div className="text-center py-20 flex flex-col items-center gap-8"><div className="space-y-2"><h2 className="text-3xl md:text-5xl font-black tracking-tighter">Ваш Bio-Score пуст</h2><p className="text-muted-foreground max-w-lg mx-auto font-medium text-xs md:text-lg px-4">Обновите ваши показатели в профиле, чтобы ИИ подготовил план на {selectedDate ? format(selectedDate, 'd MMMM', { locale: ru }) : ''}.</p></div><RecommendationForm onResult={handleResult} selectedDate={selectedDate || startOfToday()} /></div>)}</TabsContent>
                <TabsContent value="meals" className="mt-0 outline-none">
                  <div className="space-y-12">
                    <div className="flex justify-center">
                       <Tabs defaultValue="personal" className="w-full">
                          <TabsList className="bg-white/40 border p-1 rounded-2xl h-14 md:h-18 max-w-2xl mx-auto grid grid-cols-3 shadow-inner">
                             <TabsTrigger value="personal" className="rounded-xl font-black uppercase tracking-widest text-[9px] md:text-[10px] gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                                <PenTool className="h-4 w-4" /> Свой план
                             </TabsTrigger>
                             <TabsTrigger value="plan" className="rounded-xl font-black uppercase tracking-widest text-[9px] md:text-[10px] gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                                <ClipboardList className="h-4 w-4" /> План ИИ
                             </TabsTrigger>
                             <TabsTrigger value="inventory" className="rounded-xl font-black uppercase tracking-widest text-[9px] md:text-[10px] gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                                <ShoppingBasket className="h-4 w-4" /> Из продуктов
                             </TabsTrigger>
                          </TabsList>

                          <TabsContent value="personal" className="mt-10">
                             <PersonalMealPlan selectedDate={selectedDate || startOfToday()} />
                          </TabsContent>
                          
                          <TabsContent value="plan" className="mt-10">
                             {recommendationDoc?.data ? (
                               <RecommendationDisplay data={recommendationDoc.data} mode="meals" />
                             ) : (
                               <div className="max-w-4xl mx-auto py-20 space-y-12">
                                 <div className="text-center space-y-4">
                                   <h2 className="text-3xl md:text-5xl font-black tracking-tighter">План питания не составлен</h2>
                                   <p className="text-muted-foreground max-w-lg mx-auto font-medium text-sm md:text-lg">Убедитесь, что данные заполнены в вашем <button onClick={() => setActiveTab('profile')} className="text-primary underline font-black">Профиле</button>, затем создайте отчет в Дашборде.</p>
                                 </div>
                                 <div className="flex justify-center">
                                    <Button onClick={() => setActiveTab('dashboard')} className="h-16 px-10 rounded-2xl bg-primary font-black uppercase tracking-widest text-xs shadow-xl">Сгенерировать в Дашборде</Button>
                                 </div>
                               </div>
                             )}
                          </TabsContent>
                          
                          <TabsContent value="inventory" className="mt-10">
                             <ProductsMenuGenerator />
                          </TabsContent>
                       </Tabs>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="my-feed" className="mt-0 outline-none"><div className="max-w-4xl mx-auto space-y-10"><div className="flex items-center justify-between"><h2 className="text-3xl font-black tracking-tighter">Мои публикации</h2><CreatePostDialog /></div><div className="space-y-6">{posts?.filter(p => p.authorId === user.uid).map(post => (<Card key={post.id} className="premium-card overflow-hidden"><div className="p-8 space-y-6"><div className="flex justify-between items-start"><p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{format(new Date(post.createdAt), 'd MMMM yyyy, HH:mm', { locale: ru })}</p><Badge variant="outline" className="text-[9px] border-primary/20 text-primary">{post.likes || 0} Лайков</Badge></div><p className="text-lg font-medium leading-relaxed">{post.content}</p>{post.imageUrl && <div className="relative aspect-video rounded-2xl overflow-hidden"><Image src={post.imageUrl} alt="Post image" fill className="object-cover" /></div>}</div></Card>))}{(!posts || posts.filter(p => p.authorId === user.uid).length === 0) && (<Card className="premium-card p-20 text-center text-muted-foreground border-dashed border-2">Начните делиться знаниями!</Card>)}</div></div></TabsContent>
                <TabsContent value="appointments" className="mt-0 outline-none"><div className="max-w-4xl mx-auto space-y-10"><h2 className="text-3xl font-black tracking-tighter">Записи на прием</h2><div className="grid grid-cols-1 gap-4">{[1,2].map(i => (<Card key={i} className="premium-card p-6 flex items-center justify-between"><div className="flex items-center gap-4"><div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-black">П</div><div><p className="font-black">Пациент #{i}</p><p className="text-xs text-muted-foreground">Сегодня, 14:00</p></div></div><Button variant="outline" className="rounded-xl">Подтвердить</Button></Card>))}</div></div></TabsContent>
                <TabsContent value="chats" className="mt-0 outline-none"><ChatInterface /></TabsContent>
                <TabsContent value="profile" className="mt-0 outline-none"><ProfileCabinet /></TabsContent>
              </div>
            )}
          </Tabs>
        )}
      </main>
      <AISpecialistChat />
      <footer className="mt-10 md:mt-20 border-t py-8 md:py-12 bg-white/50 backdrop-blur-md"><div className="container mx-auto px-4 text-center space-y-4"><div className="flex justify-center items-center gap-2"><Activity className="h-5 w-5 text-primary" /><span className="font-headline font-black text-lg">PRO Себя</span></div><p className="text-muted-foreground/30 text-[8px] uppercase tracking-[0.5em]">© 2024 NEXT GEN BIOTECH LABS.</p></div></footer>
    </div>
  );
}
