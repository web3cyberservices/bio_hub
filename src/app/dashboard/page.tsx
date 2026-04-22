
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
  RefreshCw, ShieldCheck
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
  const [activeTab, setActiveTab] = useState("feed");
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

  const handleLogout = async () => {
    if (auth) { await signOut(auth); router.replace('/'); }
  };

  const handleResult = (result: GenerateRecommendationsOutput) => {
    if (!firestore || !user?.uid || !dateKey) return;
    const docRef = doc(firestore, 'users', user.uid, 'recommendations', dateKey);
    setDoc(docRef, { id: dateKey, userId: user.uid, date: dateKey, data: result, createdAt: new Date().toISOString() }, { merge: true });
    toast({ title: 'Анализ готов' });
    setActiveTab("dashboard");
  };

  const handleLike = (postId: string, likedBy: string[]) => {
    if (!firestore || !user?.uid) return;
    const isLiked = likedBy?.includes(user.uid);
    updateDoc(doc(firestore, 'posts', postId), {
      likedBy: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid),
      likes: isLiked ? Math.max(0, likedBy.length - 1) : likedBy.length + 1
    });
  };

  const handleStartChat = (targetId: string, name: string, photo: string) => {
    if (!firestore || !user?.uid) return;
    const chatId = [user.uid, targetId].sort().join('_');
    setDoc(doc(firestore, 'chats', chatId), {
      id: chatId, participants: [user.uid, targetId],
      participantDetails: { [user.uid]: { name: userData?.firstName || 'Пользователь', photo: userData?.photoUrl || '' }, [targetId]: { name, photo: photo || '' } },
      updatedAt: new Date().toISOString()
    }, { merge: true });
    setViewingSpecialistId(null);
    setActiveTab('chats');
  };

  if (!isMounted || userLoading || !user) return <div className="flex min-h-screen items-center justify-center bg-[#F0F7F2]"><Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" /></div>;

  return (
    <div className="flex min-h-screen flex-col bg-[#F0F7F2]">
      <NavBar />
      <div className="bg-white/90 backdrop-blur-xl border-b sticky top-16 md:top-20 z-40 py-2 md:py-4 shadow-sm">
        <div className="container mx-auto px-4 flex items-center justify-between gap-2 md:gap-4">
          <div className="flex items-center gap-1 md:gap-2 mx-auto">
            <Button variant="ghost" size="icon" className="rounded-xl h-8 w-8" onClick={() => setSelectedDate(prev => prev ? addDays(prev, -1) : null)}><ChevronLeft className="h-4 w-4" /></Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="px-2 md:px-4 h-10 md:h-14 rounded-xl flex flex-col items-center justify-center min-w-[120px] md:min-w-[200px]">
                  <span className="text-[7px] md:text-[9px] font-black uppercase tracking-[0.3em] text-primary/60">{selectedDate ? format(selectedDate, 'EEEE', { locale: ru }).toUpperCase() : ''}</span>
                  <div className="flex items-center gap-1"><span className="text-xs md:text-xl font-bold">{selectedDate ? format(selectedDate, 'd MMMM yyyy', { locale: ru }) : ''}</span><CalendarIcon className="h-3 w-3 text-primary opacity-30" /></div>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 rounded-2xl shadow-2xl border-none mt-2" align="center"><Calendar mode="single" selected={selectedDate || undefined} onSelect={(date) => date && setSelectedDate(date)} locale={ru} /></PopoverContent>
            </Popover>
            <Button variant="ghost" size="icon" className="rounded-xl h-8 w-8" onClick={() => setSelectedDate(prev => prev ? addDays(prev, 1) : null)}><ChevronRight className="h-4 w-4" /></Button>
          </div>
          <div className="flex items-center gap-2">
            {viewingPatientId && <Button variant="ghost" onClick={() => setViewingPatientId(null)} className="text-[10px] font-black uppercase text-primary bg-primary/5 rounded-xl gap-2"><ArrowLeft className="h-4 w-4" /> Свой профиль</Button>}
            {selectedDate && !viewingPatientId && <UnifiedDataEntry selectedDate={selectedDate}><Button className="rounded-xl h-10 md:h-12 gap-2 bg-primary font-black px-4"><Plus className="h-4 w-4" /> <span className="hidden sm:inline">Данные</span></Button></UnifiedDataEntry>}
            {user?.uid !== 'public-user' && <Button variant="outline" size="icon" onClick={handleLogout} className="rounded-xl h-10 w-10 border-primary/20"><LogOut className="h-4 w-4" /></Button>}
          </div>
        </div>
      </div>

      <main className="container mx-auto flex-1 px-4 py-6 md:py-12">
        {viewingSpecialistId ? <SpecialistPublicProfile specialistId={viewingSpecialistId} onBack={() => setViewingSpecialistId(null)} onStartChat={handleStartChat} /> : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6 md:space-y-10">
            <div className="flex justify-center">
              <TabsList className="bg-white/60 backdrop-blur-md p-1 rounded-xl h-14 md:h-20 border shadow-md max-w-6xl w-full overflow-x-auto no-scrollbar">
                <TabsTrigger value="feed" className="rounded-lg px-4 font-black uppercase tracking-widest text-[7px] md:text-[10px] gap-2 data-[state=active]:bg-primary h-full flex-1"><BookOpen className="h-4 w-4" /> Лента</TabsTrigger>
                {profileType === 'user' ? (<><TabsTrigger value="dashboard" className="rounded-lg px-4 font-black uppercase tracking-widest text-[7px] md:text-[10px] gap-2 data-[state=active]:bg-primary h-full flex-1"><LayoutDashboard className="h-4 w-4" /> Дашборд</TabsTrigger><TabsTrigger value="meals" className="rounded-lg px-4 font-black uppercase tracking-widest text-[7px] md:text-[10px] gap-2 data-[state=active]:bg-primary h-full flex-1"><Utensils className="h-4 w-4" /> Питание</TabsTrigger></>) : (<><TabsTrigger value="patients" className="rounded-lg px-4 font-black uppercase tracking-widest text-[7px] md:text-[10px] gap-2 data-[state=active]:bg-primary h-full flex-1"><Users className="h-4 w-4" /> Пациенты</TabsTrigger><TabsTrigger value="my-feed" className="rounded-lg px-4 font-black uppercase tracking-widest text-[7px] md:text-[10px] gap-2 data-[state=active]:bg-primary h-full flex-1"><Briefcase className="h-4 w-4" /> Посты</TabsTrigger></>)}
                <TabsTrigger value="chats" className="rounded-lg px-4 font-black uppercase tracking-widest text-[7px] md:text-[10px] gap-2 data-[state=active]:bg-primary h-full flex-1"><MessageSquare className="h-4 w-4" /> Чаты</TabsTrigger>
                <TabsTrigger value="profile" className="rounded-lg px-4 font-black uppercase tracking-widest text-[7px] md:text-[10px] gap-2 data-[state=active]:bg-primary h-full flex-1"><UserCircle className="h-4 w-4" /> Профиль</TabsTrigger>
              </TabsList>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <TabsContent value="feed" className="mt-0"><div className="space-y-12"><div className="flex items-center justify-between"><div className="flex items-center gap-4"><div className="w-10 h-10 md:w-16 bg-primary/10 rounded-xl flex items-center justify-center"><Sparkles className="h-5 w-5 text-primary" /></div><div><h2 className="text-xl md:text-5xl font-black tracking-tighter">Bio-Лента</h2></div></div>{profileType === 'specialist' && <CreatePostDialog />}</div><div className="max-w-3xl mx-auto space-y-8">{posts?.map((post) => (<Card key={post.id} className="premium-card p-6 md:p-8 space-y-6"><button className="flex items-center gap-4 text-left" onClick={() => setViewingSpecialistId(post.authorId)}><div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden">{post.authorPhoto ? <Image src={post.authorPhoto} alt="Author" width={48} height={48} className="object-cover" /> : <User className="h-6 w-6 text-primary" />}</div><div><h4 className="font-black text-base">{post.authorName}</h4><p className="text-[10px] text-muted-foreground uppercase font-bold">{post.authorRole}</p></div></button><div className="space-y-4"><p className="text-sm md:text-base font-medium whitespace-pre-wrap">{post.content}</p>{post.imageUrl && <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl"><Image src={post.imageUrl} alt="Post" fill className="object-cover" /></div>}</div><div className="flex items-center gap-6 pt-4 border-t"><Button variant="ghost" className={cn("rounded-full px-6 gap-2", post.likedBy?.includes(user.uid) ? "text-primary bg-primary/10" : "text-muted-foreground")} onClick={() => handleLike(post.id, post.likedBy || [])}><ThumbsUp className="h-4 w-4" /> <span className="font-black text-xs">{post.likes || 0}</span></Button></div></Card>))}</div></div></TabsContent>
              <TabsContent value="dashboard" className="mt-0">{recommendationDoc?.data ? <RecommendationDisplay data={recommendationDoc.data} mode="dashboard" deviceData={dailyLogDoc} /> : <div className="text-center py-20 flex flex-col items-center gap-8"><h2 className="text-3xl md:text-5xl font-black tracking-tighter">Нет данных на {format(selectedDate || new Date(), 'd MMMM', { locale: ru })}</h2>{!viewingPatientId && <RecommendationForm onResult={handleResult} selectedDate={selectedDate || startOfToday()} />}</div>}</TabsContent>
              <TabsContent value="patients" className="mt-0"><div className="max-w-4xl mx-auto space-y-8"><h2 className="text-3xl font-black tracking-tighter">Мои Пациенты</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-6">{patients?.map(p => (<Card key={p.id} className="premium-card p-8 flex items-center justify-between"><div className="flex items-center gap-6"><div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center">{p.photoUrl ? <Image src={p.photoUrl} alt="Patient" width={64} height={64} className="rounded-2xl object-cover" /> : <User className="h-8 w-8 text-primary" />}</div><div><h4 className="font-black text-lg">{p.firstName} {p.lastName}</h4><div className="flex gap-2 mt-1"><Badge variant="outline" className="text-[8px] uppercase tracking-widest border-primary/20">Доступ разрешен</Badge></div></div></div><div className="flex gap-2"><Button size="sm" className="rounded-xl h-10 px-4 bg-primary font-black uppercase text-[9px]" onClick={() => { setViewingPatientId(p.id); setActiveTab('dashboard'); }}>Аналитика</Button><Button variant="outline" size="icon" className="h-10 w-10 rounded-xl" onClick={() => handleStartChat(p.id, p.firstName, p.photoUrl)}><MessageSquare className="h-4 w-4" /></Button></div></Card>))}{(!patients || patients.length === 0) && <div className="py-20 text-center space-y-4 opacity-30"><ShieldCheck className="h-16 w-16 mx-auto text-primary" /><p className="font-black uppercase tracking-widest">Пациенты пока не открыли доступ</p></div>}</div></div></TabsContent>
              <TabsContent value="meals" className="mt-0"><Tabs defaultValue="personal" className="w-full"><TabsList className="bg-white/40 border p-1 rounded-2xl h-14 max-w-2xl mx-auto grid grid-cols-3"><TabsTrigger value="personal" className="rounded-xl font-black uppercase text-[10px]">Свой план</TabsTrigger><TabsTrigger value="plan" className="rounded-xl font-black uppercase text-[10px]">План ИИ</TabsTrigger><TabsTrigger value="inventory" className="rounded-xl font-black uppercase text-[10px]">Из продуктов</TabsTrigger></TabsList><TabsContent value="personal" className="mt-10"><PersonalMealPlan selectedDate={selectedDate || startOfToday()} /></TabsContent><TabsContent value="plan" className="mt-10">{recommendationDoc?.data ? <RecommendationDisplay data={recommendationDoc.data} mode="meals" /> : <div className="text-center py-20"><Button onClick={() => setActiveTab('dashboard')}>Сгенерировать</Button></div>}</TabsContent><TabsContent value="inventory" className="mt-10"><ProductsMenuGenerator /></TabsContent></Tabs></TabsContent>
              <TabsContent value="my-feed" className="mt-0"><div className="max-w-4xl mx-auto space-y-6"><h2 className="text-3xl font-black">Мои посты</h2>{posts?.filter(p => p.authorId === user.uid).map(post => (<Card key={post.id} className="premium-card p-8 space-y-4"><p className="text-lg">{post.content}</p></Card>))}</div></TabsContent>
              <TabsContent value="chats" className="mt-0"><ChatInterface /></TabsContent>
              <TabsContent value="profile" className="mt-0"><ProfileCabinet /></TabsContent>
            </div>
          </Tabs>
        )}
      </main>
      <AISpecialistChat />
      <footer className="mt-20 border-t py-12"><div className="container mx-auto px-4 text-center"><Activity className="h-5 w-5 text-primary mx-auto mb-4" /><p className="text-muted-foreground/30 text-[8px] uppercase tracking-[0.5em]">© 2024 NEXT GEN BIOTECH LABS.</p></div></footer>
    </div>
  );
}
