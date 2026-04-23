
"use client";

import { useState, useMemo, useEffect } from 'react';
import { 
  Utensils, Loader2, Plus, MessageSquare, 
  HeartPulse, Smile, Settings, Heart,
  LayoutGrid, Activity, Sparkles
} from 'lucide-react';
import { format, startOfToday } from 'date-fns';
import { ru } from 'date-fns/locale/ru';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { UnifiedDataEntry } from '@/components/unified-data-entry';
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query, orderBy, where, limit } from 'firebase/firestore';
import { ProfileCabinet } from '@/components/profile-cabinet';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { CreatePostDialog } from '@/components/create-post-dialog';
import { ChatInterface } from '@/components/chat-interface';
import { SpecialistPublicProfile } from '@/components/specialist-public-profile';
import { PersonalMealPlan } from '@/components/personal-meal-plan';
import { WellBeingStatus } from '@/components/well-being-status';
import { RecommendationDisplay } from '@/components/recommendation-display';
import { useHealthAggregator } from '@/hooks/use-health-aggregator';

export default function DashboardPage() {
  const { user, loading: userLoading } = useUser();
  const { firestore } = useFirestore();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMounted, setIsMounted] = useState(false);
  const [viewingSpecialistId, setViewingSpecialistId] = useState<string | null>(null);

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

  const { data: userData } = useDoc<any>(userDocRef);
  const profileType = userData?.profileType === 'specialist' ? 'specialist' : 'user';

  const dailyLogRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid || !dateKey) return null;
    return doc(firestore, 'users', user.uid, 'dailyLogs', dateKey);
  }, [firestore, user?.uid, dateKey]);

  const { data: dailyLogDoc } = useDoc<any>(dailyLogRef);

  const postsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'posts'), orderBy('createdAt', 'desc'), limit(20));
  }, [firestore]);

  const { data: posts } = useCollection<any>(postsQuery);

  if (!isMounted || userLoading || !user) return <div className="flex min-h-screen items-center justify-center bg-black"><Loader2 className="h-12 w-12 animate-spin text-[#00ffff] opacity-50" /></div>;

  return (
    <div className="flex flex-col bg-[#000000] text-white overflow-hidden h-screen w-screen relative">
      
      {/* FIXED HEADER: 80px height */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#010411]/80 backdrop-blur-xl border-b border-white/5 h-20 w-full shrink-0">
        <div className="container mx-auto h-full flex items-center justify-between px-6 md:px-12">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-white/5 border border-[#00ffff]/30 flex items-center justify-center shadow-[0_0_15px_rgba(0,255,255,0.2)]">
              <HeartPulse className="h-7 w-7 text-[#00ffff]" />
            </div>
            <div className="text-left">
              <h1 className="text-xl md:text-2xl font-black text-white leading-none tracking-tight">PRO <span className="text-white">СЕБЯ</span></h1>
              <p className="text-[8px] font-black text-[#00ffff]/40 uppercase tracking-[0.4em]">BIO-TECH HUB</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {profileType === 'specialist' && <CreatePostDialog />}
            <Badge variant="outline" className="h-10 px-6 rounded-full border-[#00ffff]/20 bg-[#00ffff]/5 text-[#00ffff] font-black uppercase text-[10px] tracking-widest gap-2">
              Protocol Active
            </Badge>
          </div>
        </div>
      </header>
      
      <main className="flex-1 relative w-full overflow-hidden flex flex-col">
        {viewingSpecialistId ? (
          <div className="mt-20 overflow-y-auto h-full px-4 pb-32">
            <SpecialistPublicProfile 
              specialistId={viewingSpecialistId} 
              onBack={() => setViewingSpecialistId(null)} 
              onStartChat={() => {
                setViewingSpecialistId(null);
                setActiveTab('chats');
              }} 
            />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
            
            {/* DOUBLE / HOLOGRAM TAB: Special height and padding to fit human model */}
            <TabsContent 
              value="dashboard" 
              className="m-0 h-[100vh] w-full overflow-hidden flex items-start justify-center outline-none data-[state=active]:flex pt-[10px] !mt-0"
            >
               <RecommendationDisplay mode="dashboard" deviceData={dailyLogDoc} />
            </TabsContent>

            <TabsContent value="feed" className="flex-1 m-0 mt-20 pt-10 overflow-y-auto h-full px-4 pb-40 no-scrollbar outline-none data-[state=active]:block">
              <div className="max-w-3xl mx-auto space-y-8 pb-10">
                <div className="text-center space-y-2 mb-12">
                   <Badge className="bg-primary text-black font-black uppercase text-[10px]">Expert Insights</Badge>
                   <h2 className="text-4xl font-black tracking-tighter uppercase">Bio-Лента</h2>
                </div>
                {posts?.map((post) => (
                  <Card key={post.id} className="cyber-card overflow-hidden border-none shadow-2xl bg-white/[0.03] backdrop-blur-xl">
                    <div className="p-6 md:p-8 space-y-6">
                      <div className="flex items-center justify-between">
                        <button onClick={() => setViewingSpecialistId(post.authorId)} className="flex items-center gap-4 group">
                          <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-primary/20 group-hover:border-primary transition-colors">
                            {post.authorPhoto ? <Image src={post.authorPhoto} alt={post.authorName} width={48} height={48} className="object-cover" /> : <div className="w-full h-full bg-primary/10 flex items-center justify-center"><Activity className="h-5 w-5 text-primary" /></div>}
                          </div>
                          <div className="text-left">
                            <p className="font-black text-sm uppercase tracking-tight group-hover:text-primary transition-colors">{post.authorName}</p>
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{post.authorRole}</p>
                          </div>
                        </button>
                        <Badge variant="outline" className="border-white/10 text-white/30 text-[9px] uppercase font-black">
                          {post.createdAt && format(new Date(post.createdAt), 'd MMM', { locale: ru })}
                        </Badge>
                      </div>
                      <p className="text-lg font-medium leading-relaxed text-white/80">{post.content}</p>
                      {post.imageUrl && (
                        <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/5">
                          <Image src={post.imageUrl} alt="Post content" fill className="object-cover" unoptimized />
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="meals" className="flex-1 m-0 mt-20 pt-10 overflow-y-auto h-full px-4 pb-40 no-scrollbar outline-none data-[state=active]:block">
               <div className="max-w-4xl mx-auto pb-10">
                  <PersonalMealPlan selectedDate={selectedDate || startOfToday()} />
               </div>
            </TabsContent>

            <TabsContent value="chats" className="flex-1 m-0 mt-20 pt-10 h-full px-4 pb-40 outline-none data-[state=active]:flex flex-col">
              <div className="flex-1 min-h-0 max-w-6xl w-full mx-auto pb-10">
                <ChatInterface />
              </div>
            </TabsContent>

            <TabsContent value="feeling" className="flex-1 m-0 mt-20 pt-10 overflow-y-auto h-full px-4 pb-40 no-scrollbar outline-none data-[state=active]:block">
              <div className="max-w-4xl mx-auto pb-10">
                <WellBeingStatus deviceData={dailyLogDoc} />
              </div>
            </TabsContent>

            {/* PROFILE TAB: margin-top 80px and padding-top 20px */}
            <TabsContent value="profile" className="flex-1 m-0 mt-[80px] pt-[20px] overflow-y-auto px-4 pb-40 no-scrollbar outline-none data-[state=active]:block">
              <div className="max-w-5xl mx-auto">
                <ProfileCabinet />
              </div>
            </TabsContent>

            {/* NAVIGATION BAR */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[500] w-[96vw] max-w-4xl">
               <div className="bg-[#010411]/90 backdrop-blur-3xl border border-white/5 rounded-[3rem] h-20 md:h-22 px-6 md:px-10 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
                  
                  <button onClick={() => setActiveTab('feed')} className={cn("transition-all duration-300 flex flex-col items-center gap-1", activeTab === 'feed' ? "text-[#00ffff] scale-110" : "text-white/30 hover:text-white/50")}>
                    <LayoutGrid className="h-5 w-5 md:h-6 md:w-6" />
                    <span className="text-[7px] font-black uppercase tracking-widest hidden md:block">Лента</span>
                  </button>

                  <button onClick={() => setActiveTab('meals')} className={cn("transition-all duration-300 flex flex-col items-center gap-1", activeTab === 'meals' ? "text-[#00ffff] scale-110" : "text-white/30 hover:text-white/50")}>
                    <Utensils className="h-5 w-5 md:h-6 md:w-6" />
                    <span className="text-[7px] font-black uppercase tracking-widest hidden md:block">Еда</span>
                  </button>

                  <button onClick={() => setActiveTab('dashboard')} className={cn("transition-all duration-300 flex flex-col items-center gap-1", activeTab === 'dashboard' ? "text-[#00ffff] scale-110" : "text-white/30 hover:text-white/50")}>
                    <Activity className="h-5 w-5 md:h-6 md:w-6" />
                    <span className="text-[7px] font-black uppercase tracking-widest hidden md:block">Двойник</span>
                  </button>

                  <div className="relative flex items-center justify-center px-2">
                     <UnifiedDataEntry selectedDate={selectedDate || startOfToday()}>
                        <button className="h-14 w-14 md:h-16 md:w-16 bg-[#00ffff] rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(0,255,255,0.6)] hover:scale-110 active:scale-95 transition-all border-4 border-black/30">
                           <Plus className="h-7 w-7 md:h-8 md:w-8 text-white stroke-[3px]" />
                        </button>
                     </UnifiedDataEntry>
                  </div>

                  <button onClick={() => setActiveTab('chats')} className={cn("transition-all duration-300 flex flex-col items-center gap-1", activeTab === 'chats' ? "text-[#00ffff] scale-110" : "text-white/30 hover:text-white/50")}>
                    <MessageSquare className="h-5 w-5 md:h-6 md:w-6" />
                    <span className="text-[7px] font-black uppercase tracking-widest hidden md:block">Чаты</span>
                  </button>

                  <button onClick={() => setActiveTab('feeling')} className={cn("transition-all duration-300 flex flex-col items-center gap-1", activeTab === 'feeling' ? "text-[#00ffff] scale-110" : "text-white/30 hover:text-white/50")}>
                    <Smile className="h-5 w-5 md:h-6 md:w-6" />
                    <span className="text-[7px] font-black uppercase tracking-widest hidden md:block">Статус</span>
                  </button>

                  <button onClick={() => setActiveTab('profile')} className={cn("transition-all duration-300 flex flex-col items-center gap-1", activeTab === 'profile' ? "text-[#00ffff] scale-110" : "text-white/30 hover:text-white/50")}>
                    <Settings className="h-5 w-5 md:h-6 md:w-6" />
                    <span className="text-[7px] font-black uppercase tracking-widest hidden md:block">Профиль</span>
                  </button>
               </div>
            </div>

          </Tabs>
        )}
      </main>
    </div>
  );
}
