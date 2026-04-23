"use client";

import { useState, useMemo, useEffect } from 'react';
import { RecommendationDisplay } from '@/components/recommendation-display';
import { 
  Activity, Calendar as CalendarIcon, 
  Utensils, UserCircle, Loader2, Plus, Zap, MessageSquare, 
  HeartPulse, BookOpen, Smile, Settings, Heart
} from 'lucide-react';
import { format, startOfToday } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { UnifiedDataEntry } from '@/components/unified-data-entry';
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query, orderBy, where } from 'firebase/firestore';
import { ProfileCabinet } from '@/components/profile-cabinet';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { CreatePostDialog } from '@/components/create-post-dialog';
import { ChatInterface } from '@/components/chat-interface';
import { SpecialistPublicProfile } from '@/components/specialist-public-profile';
import { PersonalMealPlan } from '@/components/personal-meal-plan';
import { WellBeingStatus } from '@/components/well-being-status';
import { useHealthAggregator } from '@/hooks/use-health-aggregator';

export default function DashboardPage() {
  const { user, loading: userLoading } = useUser();
  const { firestore } = useFirestore();
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

  const { data: userData } = useDoc<any>(userDocRef);
  const profileType = userData?.profileType === 'specialist' ? 'specialist' : 'user';

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

  const { data: recommendationDoc } = useDoc<any>(recommendationRef);
  const { data: dailyLogDoc } = useDoc<any>(dailyLogRef);
  const { data: posts } = useCollection<any>(postsQuery);
  const { data: patients } = useCollection<any>(patientsQuery);

  if (!isMounted || userLoading || !user) return <div className="flex min-h-screen items-center justify-center bg-black"><Loader2 className="h-12 w-12 animate-spin text-[#00ffff] opacity-50" /></div>;

  return (
    <div className="flex h-screen flex-col bg-[#000000] text-white overflow-hidden">
      
      {/* Top Header Bar - High Priority Layer */}
      <header className="fixed top-0 left-0 right-0 z-[400] bg-[#010411]/70 backdrop-blur-xl border-b border-white/5 h-20 md:h-24">
        <div className="container mx-auto h-full flex items-center justify-between px-6 md:px-12">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-white/5 border border-[#00ffff]/30 flex items-center justify-center shadow-[0_0_15px_rgba(0,255,255,0.2)]">
              <HeartPulse className="h-7 w-7 text-[#00ffff]" />
            </div>
            <div className="text-left">
              <h1 className="text-xl md:text-2xl font-black text-white leading-none tracking-tight">PRO <span className="text-[#00ffff]">СЕБЯ</span></h1>
              <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.4em]">BIO-TECH HUB</p>
            </div>
          </div>
          <Badge variant="outline" className="h-10 px-6 rounded-full border-[#00ffff]/20 bg-[#00ffff]/5 text-[#00ffff] font-black uppercase text-[10px] tracking-widest gap-2">
            <Zap className="h-4 w-4 fill-[#00ffff]" /> ВІО-ДАШБОРД
          </Badge>
        </div>
      </header>
      
      <main className="flex-1 relative w-full h-full overflow-hidden">
        {viewingSpecialistId ? (
          <div className="mt-28 overflow-y-auto h-full px-4 pb-32">
            <SpecialistPublicProfile 
              specialistId={viewingSpecialistId} 
              onBack={() => setViewingSpecialistId(null)} 
              onStartChat={() => setActiveTab('chats')} 
            />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
            
            <div className="flex-1 min-h-0 relative">
              <TabsContent value="feed" className="mt-28 space-y-8 h-full overflow-y-auto px-4 pb-32 no-scrollbar">
                 <div className="flex items-center justify-between px-2 max-w-2xl mx-auto">
                    <h2 className="text-xl font-black tracking-widest text-[#00ffff] uppercase">Bio-Лента</h2>
                    {profileType === 'specialist' && <CreatePostDialog />}
                 </div>
                 <div className="grid grid-cols-1 gap-6 max-w-2xl mx-auto">
                    {posts?.map((post) => (
                      <Card key={post.id} className="cyber-card p-6 space-y-6">
                        <button className="flex items-center gap-3 text-left" onClick={() => setViewingSpecialistId(post.authorId)}>
                           <div className="w-10 h-10 rounded-xl bg-[#00ffff]/10 flex items-center justify-center overflow-hidden border border-[#00ffff]/20">
                              {post.authorPhoto ? <Image src={post.authorPhoto} alt="Author" width={40} height={40} className="object-cover" /> : <UserCircle className="h-5 w-5 text-[#00ffff]" />}
                           </div>
                           <div>
                              <h4 className="font-black text-sm tracking-tight text-white">{post.authorName}</h4>
                              <p className="text-[8px] text-[#00ffff]/60 uppercase font-bold">{post.authorRole}</p>
                           </div>
                        </button>
                        <p className="text-xs md:text-sm font-medium leading-relaxed text-white/80">{post.content}</p>
                        {post.imageUrl && <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/5"><Image src={post.imageUrl} alt="Post" fill className="object-cover" /></div>}
                      </Card>
                    ))}
                 </div>
              </TabsContent>

              <TabsContent value="dashboard" className="m-0 h-full w-full overflow-hidden flex items-center justify-center">
                <RecommendationDisplay 
                  data={recommendationDoc?.data} 
                  mode="dashboard" 
                  deviceData={dailyLogDoc} 
                />
              </TabsContent>

              <TabsContent value="meals" className="mt-28 overflow-y-auto h-full px-4 pb-32 no-scrollbar">
                 <div className="max-w-4xl mx-auto space-y-8">
                    <PersonalMealPlan selectedDate={selectedDate || startOfToday()} />
                 </div>
              </TabsContent>

              <TabsContent value="chats" className="mt-28 h-full px-4 pb-32"><ChatInterface /></TabsContent>
              <TabsContent value="feeling" className="mt-28 overflow-y-auto h-full px-4 pb-32 no-scrollbar"><WellBeingStatus deviceData={dailyLogDoc} /></TabsContent>
              <TabsContent value="profile" className="mt-28 overflow-y-auto h-full px-4 pb-32 no-scrollbar"><ProfileCabinet /></TabsContent>
            </div>

            {/* Bottom Nav Bar - High Priority Layer */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[400] w-[95vw] max-w-2xl">
               <div className="bg-[#010411]/80 backdrop-blur-3xl border border-white/5 rounded-[3rem] h-20 md:h-22 px-10 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
                  <button onClick={() => setActiveTab('feed')} className={cn("transition-all", activeTab === 'feed' ? "text-white scale-125" : "text-white/30 hover:text-white/50")}>
                    <BookOpen className="h-6 w-6" />
                  </button>
                  
                  <button onClick={() => setActiveTab('dashboard')} className={cn("transition-all", activeTab === 'dashboard' ? "text-[#00ffff] scale-125 drop-shadow-[0_0_8px_#00ffff]" : "text-white/30 hover:text-white/50")}>
                    <HeartPulse className="h-6 w-6" />
                  </button>

                  <button onClick={() => setActiveTab('meals')} className={cn("transition-all", activeTab === 'meals' ? "text-white scale-125" : "text-white/30 hover:text-white/50")}>
                    <Utensils className="h-6 w-6" />
                  </button>

                  <div className="relative flex items-center justify-center px-2">
                     <UnifiedDataEntry selectedDate={selectedDate || startOfToday()}>
                        <button className="h-16 w-16 bg-[#00ffff] rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(0,255,255,0.6)] hover:scale-110 active:scale-95 transition-all border-4 border-black/30">
                           <Plus className="h-8 w-8 text-white stroke-[3px]" />
                        </button>
                     </UnifiedDataEntry>
                  </div>

                  <button onClick={() => setActiveTab('chats')} className={cn("transition-all", activeTab === 'chats' ? "text-white scale-125" : "text-white/30 hover:text-white/50")}>
                    <MessageSquare className="h-6 w-6" />
                  </button>

                  <button onClick={() => setActiveTab('feeling')} className={cn("transition-all", activeTab === 'feeling' ? "text-white scale-125" : "text-white/30 hover:text-white/50")}>
                    <Smile className="h-6 w-6" />
                  </button>

                  <button onClick={() => setActiveTab('profile')} className={cn("transition-all", activeTab === 'profile' ? "text-white scale-125" : "text-white/30 hover:text-white/50")}>
                    <Settings className="h-6 w-6" />
                  </button>
               </div>
            </div>

          </Tabs>
        )}
      </main>
    </div>
  );
}
