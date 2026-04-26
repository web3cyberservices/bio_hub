
"use client";

import { useState, useMemo, useEffect } from 'react';
import { 
  Utensils, Loader2, Plus, MessageSquare, 
  HeartPulse, Settings, 
  LayoutGrid, Activity, Calendar as CalendarIcon,
  ChevronDown,
  UserCheck,
  BarChart3,
  Zap,
  ThumbsUp,
  Share2
} from 'lucide-react';
import { format, startOfToday, startOfDay, addDays, isValid, isSameDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query, orderBy, limit, where, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { ProfileCabinet } from '@/components/cabinet/profile-cabinet';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { CreatePostDialog } from '@/components/create-post-dialog';
import { ChatInterface } from '@/components/chat-interface';
import { SpecialistPublicProfile } from '@/components/specialist-public-profile';
import { MealsHub } from '@/components/meals-hub';
import { RecommendationDisplay } from '@/components/recommendation-display';
import { useHealthAggregator } from '@/hooks/use-health-aggregator';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { SpecialistPatientsView } from '@/components/specialist-patients-view';
import { SpecialistBookingManager } from '@/components/specialist-booking-manager';
import { ActivitiesHub } from '@/components/activities-hub';
import { UnifiedDataEntry } from '@/components/unified-data-entry';
import { CycleTrackerDialog } from '@/components/cycle-tracker-dialog';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const { user, loading: userLoading } = useUser();
  const { firestore } = useFirestore();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMounted, setIsMounted] = useState(false);
  const [viewingSpecialistId, setViewingSpecialistId] = useState<string | null>(null);
  const [directChatRecipientId, setDirectChatRecipientId] = useState<string | null>(null);

  useHealthAggregator();

  useEffect(() => {
    setIsMounted(true);
    setSelectedDate(startOfToday());

    // Обработка инвайт-ссылки специалиста
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const spId = params.get('spId');
      if (spId) {
        setViewingSpecialistId(spId);
        // Очищаем URL от параметра, чтобы не открывать профиль при каждом обновлении
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, []);

  const dateKey = useMemo(() => {
    try {
      return format(selectedDate, 'yyyy-MM-dd');
    } catch (e) {
      return format(new Date(), 'yyyy-MM-dd');
    }
  }, [selectedDate]);
  
  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: userData } = useDoc<any>(userDocRef);
  const profileType = userData?.profileType === 'specialist' ? 'specialist' : 'user';

  const cycleLogsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'users', user.uid, 'dailyLogs'));
  }, [firestore, user?.uid]);

  const { data: allLogs } = useCollection<any>(cycleLogsQuery);

  const periodDaysMap = useMemo(() => {
    if (!allLogs || !allLogs.length) return {};
    const map: Record<string, number> = {};
    const starts = allLogs
      .filter(log => log.cycle?.isStart === true)
      .map(log => {
        let dateObj: Date;
        if (log.timestamp && typeof log.timestamp.toDate === 'function') {
          dateObj = log.timestamp.toDate();
        } else if (log.date) {
          dateObj = new Date(log.date + 'T00:00:00');
        } else {
          dateObj = new Date();
        }
        return {
          timestamp: startOfDay(dateObj).getTime(),
          dateStr: format(dateObj, 'yyyy-MM-dd'),
          duration: log.cycle?.periodDuration || 5
        };
      })
      .sort((a, b) => a.timestamp - b.timestamp);

    starts.forEach(start => {
      const startDate = new Date(start.dateStr + 'T00:00:00');
      for (let i = 0; i < start.duration; i++) {
        const d = addDays(startDate, i);
        const dStr = format(d, 'yyyy-MM-dd');
        if (i > 0 && starts.some(s => s.dateStr === dStr)) break;
        map[dStr] = i + 1;
      }
    });
    return map;
  }, [allLogs]);

  const dailyLogRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid || !dateKey) return null;
    return doc(firestore, 'users', user.uid, 'dailyLogs', dateKey);
  }, [firestore, user?.uid, dateKey]);

  const { data: dailyLogDoc } = useDoc<any>(dailyLogRef);

  const mealsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid || !dateKey) return null;
    return query(collection(firestore, 'users', user.uid, 'personalMeals'), where('date', '==', dateKey));
  }, [firestore, user?.uid, dateKey]);

  const { data: meals } = useCollection<any>(mealsQuery);

  const actualMacros = useMemo(() => {
    if (!meals) return { calories: 0, protein: 0, fat: 0, carbs: 0 };
    return meals.reduce((acc: any, m: any) => ({
      calories: acc.calories + (m.calories || 0),
      protein: acc.protein + (m.protein || 0),
      fat: acc.fat + (m.fat || 0),
      carbs: acc.carbs + (m.carbs || 0),
    }), { calories: 0, protein: 0, fat: 0, carbs: 0 });
  }, [meals]);

  const postsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'posts'), orderBy('createdAt', 'desc'), limit(20));
  }, [firestore]);

  const { data: posts } = useCollection<any>(postsQuery);

  const recommendationRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid || !dateKey) return null;
    return doc(firestore, 'users', user.uid, 'recommendations', dateKey);
  }, [firestore, user?.uid, dateKey]);

  const { data: recData } = useDoc<any>(recommendationRef);

  const handleToggleLike = async (postId: string, likedBy: string[]) => {
    if (!user || user.uid === 'public-user') {
      toast({ variant: 'destructive', title: 'Вход не выполнен', description: 'Лайки доступны только зарегистрированным пользователям.' });
      return;
    }
    
    const isLiked = likedBy?.includes(user.uid);
    const postRef = doc(firestore!, 'posts', postId);
    
    try {
      await updateDoc(postRef, {
        likedBy: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid),
        likes: isLiked ? Math.max(0, likedBy.length - 1) : (likedBy.length + 1)
      });
    } catch (e: any) {
      console.error("Like error:", e);
    }
  };

  if (!isMounted || userLoading || !user) {
    return <div className="flex min-h-screen items-center justify-center bg-black"><Loader2 className="h-12 w-12 animate-spin text-[#00ffff] opacity-50" /></div>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#000000] text-white overflow-hidden relative h-screen w-screen">
      <header className="fixed top-0 left-0 right-0 z-[500] bg-[#010411]/80 backdrop-blur-xl border-b border-white/5 h-20 w-full shrink-0">
        <div className="container mx-auto h-full flex items-center justify-between px-6 md:px-12">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-white/5 border border-[#00ffff]/30 flex items-center justify-center shadow-lg shadow-[#00ffff]/5"><HeartPulse className="h-7 w-7 text-[#00ffff]" /></div>
            <h1 className="text-xl md:text-2xl font-black text-white leading-none">PRO СЕБЯ</h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <CycleTrackerDialog selectedDate={selectedDate} />

            <Popover>
              <PopoverTrigger asChild>
                <button className="h-10 px-4 md:px-6 rounded-full border border-[#00ffff]/20 bg-[#00ffff]/5 text-[#00ffff] font-black uppercase text-[10px] flex items-center gap-2 shadow-lg shadow-[#00ffff]/5 hover:bg-[#00ffff]/10 transition-all">
                  <CalendarIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">{format(selectedDate, 'd MMM yyyy', { locale: ru })}</span>
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border-none shadow-2xl z-[600] bg-transparent" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDate(date);
                      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
                    }
                  }}
                  initialFocus
                  locale={ru}
                  periodDays={periodDaysMap}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </header>
      
      <main className="flex-1 relative w-full overflow-hidden flex flex-col pt-20">
        <div className="flex-1 overflow-hidden relative">
          <div className={cn("w-full h-full flex flex-col transition-all", viewingSpecialistId ? "opacity-0 pointer-events-none" : "opacity-100")}>
              {activeTab === 'dashboard' && (
                <div className="h-full w-full overflow-hidden flex items-center justify-center pt-0">
                     {profileType === 'specialist' ? (
                       <div className="w-full h-full overflow-y-auto p-4 md:p-8 pb-32"><SpecialistBookingManager /></div>
                     ) : (
                       <RecommendationDisplay mode="dashboard" deviceData={dailyLogDoc} profileData={userData} data={recData?.data} actualMacros={actualMacros} />
                     )}
                </div>
              )}
              {activeTab === 'feed' && (
                <div className="overflow-y-auto h-full px-4 pb-40 no-scrollbar animate-in fade-in duration-300">
                  <div className="max-w-3xl mx-auto space-y-8 pb-10">
                    <div className="flex justify-end mb-4 pt-4"><CreatePostDialog /></div>
                    {posts?.map((post) => (
                      <Card key={post.id} className="cyber-card p-6 md:p-8 space-y-6">
                          <div className="flex items-center justify-between">
                            <button onClick={() => setViewingSpecialistId(post.authorId)} className="flex items-center gap-4 text-left">
                              <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-primary/20">
                                {post.authorPhoto && <Image src={post.authorPhoto} alt={post.authorName} width={48} height={48} className="object-cover" unoptimized />}
                              </div>
                              <div>
                                <p className="font-black text-sm uppercase tracking-tight">{post.authorName}</p>
                                <p className="text-[10px] font-bold text-white/40 uppercase">{post.authorRole}</p>
                              </div>
                            </button>
                          </div>
                          <p className="text-lg font-medium leading-relaxed text-white/80">{post.content}</p>
                          {post.imageUrl && (
                            <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/5">
                              <Image src={post.imageUrl} alt="Post content" fill className="object-cover" unoptimized />
                            </div>
                          )}
                          <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                            <button 
                              onClick={() => handleToggleLike(post.id, post.likedBy || [])}
                              className={cn(
                                "flex items-center gap-2 transition-all group",
                                post.likedBy?.includes(user?.uid) ? "text-primary" : "text-white/30 hover:text-white"
                              )}
                            >
                              <ThumbsUp className={cn("h-5 w-5 transition-transform group-active:scale-125", post.likedBy?.includes(user?.uid) && "fill-primary")} />
                              <span className="font-black text-sm">{post.likes || 0}</span>
                            </button>
                            <button 
                              onClick={() => setViewingSpecialistId(post.authorId)}
                              className="flex items-center gap-2 text-white/30 hover:text-white transition-all"
                            >
                              <MessageSquare className="h-5 w-5" />
                              <span className="font-black text-[10px] uppercase tracking-widest">Обсудить</span>
                            </button>
                          </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === 'meals' && (
                <div className="overflow-y-auto h-full px-4 pb-40 no-scrollbar animate-in fade-in duration-300">
                  {profileType === 'specialist' ? (
                    <SpecialistPatientsView onStartChat={(id) => { setDirectChatRecipientId(id); setActiveTab('chats'); }} />
                  ) : (
                    <MealsHub selectedDate={selectedDate} />
                  )}
                </div>
              )}
              {activeTab === 'chats' && (
                <div className="h-full px-4 pb-40 flex flex-col animate-in fade-in duration-300">
                  <div className="flex-1 min-h-0 max-w-6xl w-full mx-auto pb-10 pt-4">
                    <ChatInterface initialSpecialistId={directChatRecipientId} />
                  </div>
                </div>
              )}
              {activeTab === 'activities' && (
                <div className="overflow-y-auto h-full px-4 pb-40 no-scrollbar animate-in fade-in duration-300">
                  <ActivitiesHub selectedDate={selectedDate} />
                </div>
              )}
              {activeTab === 'profile' && (
                <div className="overflow-y-auto h-full px-4 pb-40 no-scrollbar animate-in fade-in duration-300">
                  <div className="max-w-5xl mx-auto pt-4"><ProfileCabinet /></div>
                </div>
              )}
          </div>

          {viewingSpecialistId && (
            <div className="absolute inset-0 z-[400] bg-black overflow-y-auto px-4 pb-32 pt-4">
              <SpecialistPublicProfile 
                specialistId={viewingSpecialistId} 
                onBack={() => setViewingSpecialistId(null)} 
                onStartChat={(id) => { setViewingSpecialistId(null); setDirectChatRecipientId(id); setActiveTab('chats'); }} 
              />
            </div>
          )}
        </div>

        {/* НИЖНЕЕ МЕНЮ */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[500] w-[96vw] max-w-4xl">
           <div className="bg-[#010411]/90 backdrop-blur-3xl border border-white/5 rounded-[3rem] h-20 md:h-22 px-6 md:px-10 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
              <button onClick={() => setActiveTab('feed')} className={cn("transition-all duration-300 flex flex-col items-center gap-1", activeTab === 'feed' ? "text-[#00ffff]" : "text-white/30")}><LayoutGrid className="h-6 w-6" /></button>
              <button onClick={() => setActiveTab('meals')} className={cn("transition-all duration-300 flex flex-col items-center gap-1", activeTab === 'meals' ? "text-[#00ffff]" : "text-white/30")}>{profileType === 'specialist' ? <UserCheck className="h-6 w-6" /> : <Utensils className="h-6 w-6" />}</button>
              <button onClick={() => setActiveTab('dashboard')} className={cn("transition-all duration-300 flex flex-col items-center gap-1", activeTab === 'dashboard' ? "text-[#00ffff]" : "text-white/30")}>{profileType === 'specialist' ? <BarChart3 className="h-6 w-6" /> : <Activity className="h-6 w-6" />}</button>
              <UnifiedDataEntry selectedDate={selectedDate}><button className="h-14 w-14 md:h-16 md:w-16 bg-[#00ffff] rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(0,255,255,0.6)]"><Plus className="h-8 w-8 text-white stroke-[3px]" /></button></UnifiedDataEntry>
              <button onClick={() => setActiveTab('chats')} className={cn("transition-all duration-300 flex flex-col items-center gap-1", activeTab === 'chats' ? "text-[#00ffff]" : "text-white/30")}><MessageSquare className="h-6 w-6" /></button>
              <button onClick={() => setActiveTab('activities')} className={cn("transition-all duration-300 flex flex-col items-center gap-1", activeTab === 'activities' ? "text-[#00ffff]" : "text-white/30")}><Zap className="h-6 w-6" /></button>
              <button onClick={() => setActiveTab('profile')} className={cn("transition-all duration-300 flex flex-col items-center gap-1", activeTab === 'profile' ? "text-[#00ffff]" : "text-white/30")}><Settings className="h-6 w-6" /></button>
           </div>
        </div>
      </main>
    </div>
  );
}
