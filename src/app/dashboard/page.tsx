'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Utensils, Loader2, Plus, MessageSquare, 
  HeartPulse, Settings, ShieldCheck,
  LayoutGrid, Activity, Calendar as CalendarIcon,
  ChevronDown,
  UserCheck,
  BarChart3,
  Zap,
  ThumbsUp,
  Pill,
  Timer,
  BookOpen
} from 'lucide-react';
import { format, startOfToday, addDays, isValid } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query, orderBy, limit, where, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import { ProfileCabinet } from '@/components/profile-cabinet';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { CreatePostDialog } from '@/components/create-post-dialog';
import { ChatInterface } from '@/components/chat-interface';
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
import { BeautyIndicatorsDialog } from '@/components/beauty-indicators-dialog';
import { MedicalCalculatorDialog } from '@/components/medical-calculator-dialog';
import { MedicationHub } from '@/components/medication-hub';
import { FastingHub } from '@/components/fasting-hub';
import { SpecialistDiaryHub } from '@/components/specialist-diary-hub';
import { useToast } from '@/hooks/use-toast';
import { PWAInstallBanner } from '@/components/pwa-install-banner';

function DashboardContent() {
  const { user, loading: userLoading } = useUser();
  const { firestore } = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMounted, setIsMounted] = useState(false);
  const [directChatRecipientId, setDirectChatRecipientId] = useState<string | null>(null);
  const [directChatId, setDirectChatId] = useState<string>('');
  const [unreadTotal, setUnreadTotal] = useState(0);

  useHealthAggregator();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: userData } = useDoc<any>(userDocRef);
  const isSpecialist = userData?.profileType === 'specialist';

  useEffect(() => {
    setIsMounted(true);
    setSelectedDate(startOfToday());
    
    const activeChat = searchParams.get('activeChat');
    if (activeChat) {
      setDirectChatId(activeChat);
      setActiveTab('chats');
    }
  }, [searchParams]);

  useEffect(() => {
    if (isSpecialist && activeTab === 'fasting') {
      setActiveTab('diary');
    }
  }, [isSpecialist, activeTab]);

  useEffect(() => {
    if (!firestore || !user?.uid || user.uid === 'public-user') return;

    const q = query(
      collection(firestore, 'chats'),
      where('participants', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let count = 0;
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.unreadCount && typeof data.unreadCount === 'object') {
          count += (data.unreadCount[user.uid] || 0);
        }
      });
      setUnreadTotal(count);
    }, (error) => {
      console.error("Unread monitor error:", error);
    });

    return () => unsubscribe();
  }, [firestore, user?.uid]);

  const dateKey = useMemo(() => {
    try {
      return format(selectedDate, 'yyyy-MM-dd');
    } catch (e) {
      return format(new Date(), 'yyyy-MM-dd');
    }
  }, [selectedDate]);

  const [periodDaysMap, setPeriodDaysMap] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!firestore || !user?.uid) return;
    
    const q = query(collection(firestore, user.uid === 'public-user' ? 'public-logs' : 'users', user.uid, 'dailyLogs'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const map: Record<string, number> = {};
      const logs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as any));
      const starts = logs
        .filter(log => log.cycle?.isStart === true && log.cycle?.active === true)
        .sort((a, b) => {
           const da = a.timestamp?.toDate?.() || (a.date ? new Date(a.date) : new Date(0));
           const db = b.timestamp?.toDate?.() || (b.date ? new Date(b.date) : new Date(0));
           return da.getTime() - db.getTime();
        });

      starts.forEach(start => {
        const startDate = start.timestamp?.toDate?.() || (start.date ? new Date(start.date + 'T00:00:00') : null);
        if (!startDate || !isValid(startDate)) return;
        const duration = start.cycle?.periodDuration || 5;
        for (let i = 0; i < duration; i++) {
          const d = addDays(startDate, i);
          if (isValid(d)) {
            const dStr = format(d, 'yyyy-MM-dd');
            map[dStr] = i + 1;
          }
        }
      });
      setPeriodDaysMap(map);
    });
    return () => unsubscribe();
  }, [firestore, user?.uid]);

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
        likes: isLiked ? Math.max(0, (likedBy?.length || 0) - 1) : ((likedBy?.length || 0) + 1)
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
      <PWAInstallBanner />
      
      <header className="fixed top-0 left-0 right-0 z-[500] bg-[#010411]/80 backdrop-blur-xl border-b border-white/5 h-20 w-full shrink-0">
        <div className="container mx-auto h-full flex items-center justify-between px-4 md:px-12">
          <div className="flex items-center gap-3 md:gap-4 shrink-0">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-white/5 border border-[#00ffff]/30 flex items-center justify-center shadow-lg shadow-[#00ffff]/5"><HeartPulse className="h-6 w-6 md:h-7 md:w-7 text-[#00ffff]" /></div>
            <h1 className="text-lg md:text-2xl font-black text-white leading-none uppercase hidden xs:block">Bio Hub Pro</h1>
          </div>
          <div className="flex items-center gap-1.5 md:gap-4">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
               <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
               <span className="text-[8px] font-black uppercase text-emerald-500/80 tracking-widest">AES-256 Protocol Active</span>
            </div>

            <div className="flex items-center gap-1.5 md:gap-2">
              {isSpecialist && <MedicalCalculatorDialog />}
              <BeautyIndicatorsDialog />
              {userData?.gender === 'женский' && (
                <CycleTrackerDialog selectedDate={selectedDate} />
              )}
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <button className="h-10 px-3 md:px-6 rounded-full border border-[#00ffff]/20 bg-[#00ffff]/5 text-[#00ffff] font-black uppercase text-[10px] flex items-center gap-2 shadow-lg shadow-[#00ffff]/5 hover:bg-[#00ffff]/10 transition-all">
                  <CalendarIcon className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline">{format(selectedDate, 'd MMM yyyy', { locale: ru })}</span>
                  <span className="sm:hidden">{format(selectedDate, 'd MMM', { locale: ru })}</span>
                  <ChevronDown className="h-3 w-3 opacity-50 hidden xs:block" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border-none shadow-2xl z-[600] bg-transparent" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDate(date);
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
        <div className="flex-1 min-h-0 overflow-hidden relative">
          <div className="w-full h-full flex flex-col">
              {activeTab === 'dashboard' && (
                <div className="h-full w-full overflow-hidden flex items-center justify-center pt-0">
                     {isSpecialist ? (
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
                            <button onClick={() => router.push(`/specialist/${post.authorId}`)} className="flex items-center gap-4 text-left">
                              <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-primary/20">
                                {post.authorPhoto && <Image src={post.authorPhoto} alt={post.authorName} width={48} height={48} className="object-cover" unoptimized />}
                              </div>
                              <div>
                                <p className="font-black text-sm uppercase tracking-tight">{post.authorName}</p>
                                <p className="text-[10px] font-bold text-white/40 uppercase">{post.authorRole}</p>
                              </div>
                            </button>
                          </div>
                          
                          <div 
                            className="space-y-6 cursor-pointer group/content"
                            onClick={() => router.push(`/specialist/${post.authorId}`)}
                          >
                            <p className="text-lg font-medium leading-relaxed text-white/80 group-hover/content:text-white transition-colors">{post.content}</p>
                            {post.imageUrl && (
                              <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/5 shadow-2xl group-hover/content:border-primary/30 transition-all">
                                <Image src={post.imageUrl} alt="Post content" fill className="object-cover" unoptimized />
                              </div>
                            )}
                          </div>

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
                          </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === 'meals' && (
                <div className="overflow-y-auto h-full px-4 pb-40 no-scrollbar animate-in fade-in duration-300">
                  {isSpecialist ? (
                    <SpecialistPatientsView onStartChat={(id) => { setDirectChatRecipientId(id); setDirectChatId(''); setActiveTab('chats'); }} />
                  ) : (
                    <MealsHub selectedDate={selectedDate} />
                  )}
                </div>
              )}
              {activeTab === 'meds' && (
                <div className="overflow-y-auto h-full px-4 pb-40 no-scrollbar animate-in fade-in duration-300">
                  <MedicationHub />
                </div>
              )}
              {activeTab === 'fasting' && !isSpecialist && (
                <div className="overflow-y-auto h-full px-4 pb-40 no-scrollbar animate-in fade-in duration-300">
                  <FastingHub />
                </div>
              )}
              {activeTab === 'diary' && isSpecialist && (
                <div className="h-full px-4 pb-32 flex flex-col animate-in fade-in duration-300">
                  <div className="flex-1 min-h-0 max-w-7xl w-full mx-auto pt-4 overflow-hidden">
                    <SpecialistDiaryHub />
                  </div>
                </div>
              )}
              {activeTab === 'chats' && (
                <div className="h-full px-4 pb-32 md:pb-10 flex flex-col animate-in fade-in duration-300">
                  <div className="flex-1 min-h-0 max-w-6xl w-full mx-auto pt-4 overflow-hidden">
                    <ChatInterface 
                      initialSpecialistId={directChatRecipientId} 
                      initialChatId={directChatId || ''}
                    />
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
                  <div className="max-w-5xl mx-auto pt-4">
                    <ProfileCabinet onNavigateToDiary={() => setActiveTab('diary')} />
                  </div>
                </div>
              )}
          </div>
        </div>

        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[500] w-[96vw] max-w-4xl">
           <div className="bg-[#010411]/90 backdrop-blur-3xl border border-white/5 rounded-[3rem] h-20 md:h-22 px-4 md:px-8 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-x-auto no-scrollbar">
              <button onClick={() => setActiveTab('feed')} className={cn("transition-all shrink-0 p-2", activeTab === 'feed' ? "text-[#00ffff]" : "text-white/30")}><LayoutGrid className="h-5 w-5" /></button>
              <button onClick={() => setActiveTab('meals')} className={cn("transition-all shrink-0 p-2", activeTab === 'meals' ? "text-[#00ffff]" : "text-white/30")}>{isSpecialist ? <UserCheck className="h-5 w-5" /> : <Utensils className="h-5 w-5" />}</button>
              
              {isSpecialist ? (
                <button onClick={() => setActiveTab('diary')} className={cn("transition-all shrink-0 p-2", activeTab === 'diary' ? "text-[#00ffff]" : "text-white/30")} title="Дневник специалиста">
                  <BookOpen className="h-5 w-5" />
                </button>
              ) : (
                <button onClick={() => setActiveTab('fasting')} className={cn("transition-all shrink-0 p-2", activeTab === 'fasting' ? "text-[#00ffff]" : "text-white/30")} title="Интервальное голодание">
                  <Timer className="h-5 w-5" />
                </button>
              )}
              
              <button onClick={() => setActiveTab('dashboard')} className={cn("transition-all shrink-0 p-2", activeTab === 'dashboard' ? "text-[#00ffff]" : "text-white/30")}>{isSpecialist ? <BarChart3 className="h-5 w-5" /> : <Activity className="h-5 w-5" />}</button>
              
              <UnifiedDataEntry selectedDate={selectedDate}><button className="h-12 w-12 md:h-14 md:w-14 bg-[#00ffff] rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(0,255,255,0.6)] shrink-0"><Plus className="h-7 w-7 text-white stroke-[3px]" /></button></UnifiedDataEntry>
              
              <button onClick={() => setActiveTab('meds')} className={cn("transition-all shrink-0 p-2", activeTab === 'meds' ? "text-[#00ffff]" : "text-white/30")}><Pill className="h-5 w-5" /></button>
              <button onClick={() => setActiveTab('chats')} className={cn("transition-all shrink-0 p-2 relative", activeTab === 'chats' ? "text-[#00ffff]" : "text-white/30")}><MessageSquare className="h-5 w-5" />{unreadTotal > 0 && <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-[8px] font-black text-white">{unreadTotal > 9 ? '9+' : unreadTotal}</span>}</button>
              <button onClick={() => setActiveTab('activities')} className={cn("transition-all shrink-0 p-2", activeTab === 'activities' ? "text-[#00ffff]" : "text-white/30")}><Zap className="h-5 w-5" /></button>
              <button onClick={() => setActiveTab('profile')} className={cn("transition-all shrink-0 p-2", activeTab === 'profile' ? "text-[#00ffff]" : "text-white/30")}><Settings className="h-5 w-5" /></button>
           </div>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className='p-10 text-center text-primary'>Инициализация Bio-Hub...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
