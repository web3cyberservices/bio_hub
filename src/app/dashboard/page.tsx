'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Utensils, Loader2, Plus, MessageSquare, 
  HeartPulse, ShieldCheck,
  LayoutGrid, Activity, Calendar as CalendarIcon,
  BarChart3, Zap, Settings, UserCheck
} from 'lucide-react';
import { format, startOfToday } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { PWAInstallBanner } from '@/components/pwa-install-banner';
import { UnifiedDataEntry } from '@/components/unified-data-entry';

// Оптимизированные динамические импорты
const SocialFeed = dynamic(() => import('@/components/social-feed').then(m => m.SocialFeed), { ssr: false });
const RecommendationDisplay = dynamic(() => import('@/components/recommendation-display').then(m => m.RecommendationDisplay), { ssr: false });
const MealsHub = dynamic(() => import('@/components/meals-hub').then(m => m.MealsHub), { ssr: false });
const ActivitiesHub = dynamic(() => import('@/components/activities-hub').then(m => m.ActivitiesHub), { ssr: false });
const SpecialistPatientsView = dynamic(() => import('@/components/specialist-patients-view').then(m => m.SpecialistPatientsView), { ssr: false });
const ProfileCabinet = dynamic(() => import('@/components/profile-cabinet').then(m => m.ProfileCabinet), { ssr: false });
const ChatInterface = dynamic(() => import('@/components/chat-interface').then(m => m.ChatInterface), { ssr: false });
const SpecialistDiaryHub = dynamic(() => import('@/components/specialist-diary-hub').then(m => m.SpecialistDiaryHub), { ssr: false });

function DashboardContent() {
  const { user, loading: userLoading } = useUser();
  const { firestore } = useFirestore();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState("dashboard");
  const [unreadTotal, setUnreadTotal] = useState(0);

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid || user.uid === 'public-user') return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: userData } = useDoc<any>(userDocRef);
  const isSpecialist = userData?.profileType === 'specialist';

  useEffect(() => {
    setSelectedDate(startOfToday());
  }, []);

  useEffect(() => {
    if (!firestore || !user?.uid || user.uid === 'public-user') return;
    const q = query(collection(firestore, 'chats'), where('participants', 'array-contains', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let count = 0;
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.unreadCount) count += (data.unreadCount[user.uid] || 0);
      });
      setUnreadTotal(count);
    });
    return () => unsubscribe();
  }, [firestore, user?.uid]);

  if (userLoading || !user) {
    return <div className="flex min-h-screen items-center justify-center bg-black"><Loader2 className="h-12 w-12 animate-spin text-primary opacity-50" /></div>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#000000] text-white overflow-hidden relative h-screen w-screen">
      <PWAInstallBanner />
      
      <header className="fixed top-0 left-0 right-0 z-[500] bg-[#010411]/80 backdrop-blur-xl border-b border-white/5 h-20 shrink-0">
        <div className="container mx-auto h-full flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/5 border border-[#00ffff]/30 flex items-center justify-center shadow-lg"><HeartPulse className="h-6 w-6 text-[#00ffff]" /></div>
            <h1 className="text-lg font-black uppercase hidden xs:block tracking-tighter">Bio Hub Pro</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
               <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
               <span className="text-[8px] font-black uppercase text-emerald-400/80 tracking-widest">Protocol 1.0.26</span>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <button className="h-10 px-4 rounded-full border border-[#00ffff]/20 bg-[#00ffff]/5 text-[#00ffff] font-black uppercase text-[10px] flex items-center gap-2 transition-all hover:bg-[#00ffff]/10 shadow-sm">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{format(selectedDate, 'd MMM', { locale: ru })}</span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border-none bg-transparent" align="end">
                <Calendar mode="single" selected={selectedDate} onSelect={(d) => d && setSelectedDate(d)} locale={ru} />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </header>
      
      <main className="flex-1 relative w-full overflow-hidden flex flex-col pt-20">
        <div className={cn("flex-1 min-h-0 overflow-hidden relative", activeTab === 'diary' ? "pt-0" : "pt-4")}>
            <div className="w-full h-full flex flex-col">
              {activeTab === 'feed' && (
                <div className="overflow-y-auto h-full px-4 pb-40 no-scrollbar">
                  <SocialFeed />
                </div>
              )}
              {activeTab === 'dashboard' && (
                <div className="h-full w-full overflow-hidden flex items-center justify-center">
                     {isSpecialist ? (
                       <div className="w-full h-full overflow-y-auto p-4 pb-40 no-scrollbar">
                         <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500">
                            <h2 className="text-4xl font-black uppercase tracking-tighter">Управление</h2>
                            <Card className="cyber-card p-10 bg-blue-900/20 border-white/5 flex items-center justify-center">
                               <div className="text-center space-y-4">
                                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto border border-primary/20"><BarChart3 className="h-10 w-10 text-primary" /></div>
                                  <p className="text-sm font-bold text-white/40 uppercase tracking-widest">Модуль аналитики синхронизируется.</p>
                               </div>
                            </Card>
                         </div>
                       </div>
                     ) : (
                       <RecommendationDisplay mode="dashboard" profileData={userData} />
                     )}
                </div>
              )}
              {activeTab === 'meals' && (
                <div className="overflow-y-auto h-full px-4 pb-40 no-scrollbar">
                  {isSpecialist ? <SpecialistPatientsView /> : <MealsHub selectedDate={selectedDate} />}
                </div>
              )}
              {activeTab === 'diary' && isSpecialist && (
                <div className="flex-1 min-h-0 h-full overflow-hidden">
                  <SpecialistDiaryHub />
                </div>
              )}
              {activeTab === 'chats' && (
                <div className="h-full px-4 flex flex-col pb-40 no-scrollbar">
                  <ChatInterface />
                </div>
              )}
              {activeTab === 'activities' && <div className="overflow-y-auto h-full px-4 pb-40 no-scrollbar"><ActivitiesHub selectedDate={selectedDate} /></div>}
              {activeTab === 'profile' && <div className="overflow-y-auto h-full px-4 pb-40 no-scrollbar"><ProfileCabinet onNavigateToDiary={() => setActiveTab('diary')} /></div>}
          </div>
        </div>

        {/* BOTTOM NAVIGATION */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[500] w-[96vw] max-w-4xl">
           <div className="bg-[#010411]/90 backdrop-blur-3xl border border-white/5 rounded-[3rem] h-20 px-6 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
              <button onClick={() => setActiveTab('meals')} className={cn("transition-all p-3 rounded-2xl", activeTab === 'meals' ? "text-[#00ffff] bg-[#00ffff]/10" : "text-white/30 hover:text-white/60")}>
                {isSpecialist ? <UserCheck className="h-6 w-6" /> : <Utensils className="h-6 w-6" />}
              </button>
              
              <button onClick={() => setActiveTab('feed')} className={cn("transition-all p-3 rounded-2xl", activeTab === 'feed' ? "text-[#00ffff] bg-[#00ffff]/10" : "text-white/30 hover:text-white/60")}>
                <LayoutGrid className="h-6 w-6" />
              </button>

              <button onClick={() => setActiveTab('dashboard')} className={cn("transition-all p-3 rounded-2xl", activeTab === 'dashboard' ? "text-[#00ffff] bg-[#00ffff]/10" : "text-white/30 hover:text-white/60")}>
                {isSpecialist ? <BarChart3 className="h-6 w-6" /> : <Activity className="h-6 w-6" />}
              </button>
              
              <UnifiedDataEntry selectedDate={selectedDate}>
                <div className="h-14 w-14 bg-[#00ffff] rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(0,255,255,0.4)] active:scale-90 transition-transform cursor-pointer">
                  <Plus className="h-7 w-7 text-black stroke-[3px]" />
                </div>
              </UnifiedDataEntry>

              <button onClick={() => setActiveTab('chats')} className={cn("transition-all p-3 rounded-2xl relative", activeTab === 'chats' ? "text-[#00ffff] bg-[#00ffff]/10" : "text-white/30 hover:text-white/60")}>
                <MessageSquare className="h-6 w-6" />
                {unreadTotal > 0 && <span className="absolute top-2 right-2 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-[8px] font-black text-white shadow-lg border border-black">{unreadTotal}</span>}
              </button>
              
              <button onClick={() => setActiveTab('activities')} className={cn("transition-all p-3 rounded-2xl", activeTab === 'activities' ? "text-[#00ffff] bg-[#00ffff]/10" : "text-white/30 hover:text-white/60")}><Zap className="h-6 w-6" /></button>
              
              <button onClick={() => setActiveTab('profile')} className={cn("transition-all p-3 rounded-2xl", activeTab === 'profile' ? "text-[#00ffff] bg-[#00ffff]/10" : "text-white/30 hover:text-white/60")}><Settings className="h-6 w-6" /></button>
           </div>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return <Suspense fallback={<div className='p-10 text-center text-primary font-black uppercase tracking-widest'>Bio-Hub Initializing...</div>}><DashboardContent /></Suspense>;
}
