"use client";

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { NavBar } from '@/components/nav-bar';
import { RecommendationDisplay } from '@/components/recommendation-display';
import { GenerateRecommendationsOutput } from '@/ai/flows/generate-personalized-recommendations';
import { Button } from '@/components/ui/button';
import { 
  Activity, Calendar as CalendarIcon, LayoutDashboard, 
  Utensils, UserCircle, Loader2, Plus, LogOut, Sparkles, MessageSquare, Brain, 
  HeartPulse, Stethoscope, Heart, ArrowLeft, Star, User, BookOpen, Users, CalendarCheck,
  ThumbsUp, Share2, Info, Briefcase, Zap, ShoppingBasket, ClipboardList, PenTool,
  RefreshCw, ShieldCheck, Mic, Smile
} from 'lucide-react';
import { format, startOfToday } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { UnifiedDataEntry } from '@/components/unified-data-entry';
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, setDoc, collection, query, orderBy, where } from 'firebase/firestore';
import { ProfileCabinet } from '@/components/profile-cabinet';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { CreatePostDialog } from '@/components/create-post-dialog';
import { ChatInterface } from '@/components/chat-interface';
import { SpecialistPublicProfile } from '@/components/specialist-public-profile';
import { ProductsMenuGenerator } from '@/components/products-menu-generator';
import { PersonalMealPlan } from '@/components/personal-meal-plan';
import { WellBeingStatus } from '@/components/well-being-status';
import { useHealthAggregator } from '@/hooks/use-health-aggregator';

export default function DashboardPage() {
  const { user, loading: userLoading } = useUser();
  const { firestore } = useFirestore();
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

  if (!isMounted || userLoading || !user) return <div className="flex min-h-screen items-center justify-center bg-[#010409]"><Loader2 className="h-12 w-12 animate-spin text-primary opacity-50" /></div>;

  return (
    <div className="flex h-screen flex-col bg-[#010409] text-foreground overflow-hidden">
      
      {/* Fixed Header with high z-index */}
      <header className="fixed top-8 left-1/2 -translate-x-1/2 z-[300] w-[95vw] max-w-6xl">
        <div className="flex items-center justify-between px-8 h-20">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(0,255,255,0.4)]">
              <Activity className="h-6 w-6 text-black" />
            </div>
            <div className="text-left">
              <h1 className="text-xl md:text-2xl font-black text-white leading-none tracking-tight">PRO <span className="text-primary">СЕБЯ</span></h1>
              <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.4em]">BIO-TECH HUB</p>
            </div>
          </div>
          <Badge variant="outline" className="h-10 px-6 rounded-full border-primary/20 bg-primary/5 text-primary font-black uppercase text-[10px] tracking-widest gap-2">
            <Zap className="h-3 w-3 animate-pulse" /> БИО-ДАШБОРД
          </Badge>
        </div>
      </header>
      
      <main className="flex-1 relative w-full h-full overflow-hidden">
        {viewingSpecialistId ? <div className="mt-28 overflow-y-auto h-full px-4 pb-32"><SpecialistPublicProfile specialistId={viewingSpecialistId} onBack={() => setViewingSpecialistId(null)} onStartChat={() => setActiveTab('chats')} /></div> : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
            
            <div className="flex-1 min-h-0">
              <TabsContent value="feed" className="mt-28 space-y-8 h-full overflow-y-auto px-4 pb-32 no-scrollbar">
                 <div className="flex items-center justify-between px-2 max-w-2xl mx-auto">
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

              <TabsContent value="patients" className="mt-28 overflow-y-auto h-full px-4 pb-32 no-scrollbar">
                <div className="max-w-4xl mx-auto space-y-8">
                  <h2 className="text-xl font-black text-primary uppercase tracking-widest px-2">Список пациентов</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {patients?.map(p => (
                      <Card key={p.id} className="cyber-card p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                            {p.photoUrl ? <Image src={p.photoUrl} alt="Patient" width={48} height={48} className="rounded-lg object-cover" /> : <User className="h-6 w-6 text-primary" />}
                          </div>
                          <div>
                            <h4 className="font-black text-sm text-white">{p.firstName} {p.lastName}</h4>
                            <Badge variant="outline" className="text-[7px] uppercase tracking-widest border-primary/20 text-primary/60">Доступ разрешен</Badge>
                          </div>
                        </div>
                        <Button size="sm" className="rounded-lg h-9 px-3 bg-primary font-black uppercase text-[8px]" onClick={() => { setViewingPatientId(p.id); setActiveTab('dashboard'); }}>Аналитика</Button>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="chats" className="mt-28 h-full px-4 pb-32"><ChatInterface /></TabsContent>
              <TabsContent value="feeling" className="mt-28 overflow-y-auto h-full px-4 pb-32 no-scrollbar"><WellBeingStatus deviceData={dailyLogDoc} /></TabsContent>
              <TabsContent value="profile" className="mt-28 overflow-y-auto h-full px-4 pb-32 no-scrollbar"><ProfileCabinet /></TabsContent>
            </div>

            {/* Pill-shaped Fixed Navigation */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[300] w-[95vw] max-w-2xl">
               <div className="bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[3rem] h-20 px-8 flex items-center justify-between shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
                  <button onClick={() => setActiveTab('feed')} className={cn("flex flex-col items-center justify-center transition-all", activeTab === 'feed' ? "text-primary scale-110" : "text-white/30 hover:text-white/50")}>
                    <BookOpen className="h-6 w-6" />
                  </button>
                  
                  <button onClick={() => setActiveTab('dashboard')} className={cn("flex flex-col items-center justify-center transition-all", activeTab === 'dashboard' ? "text-primary scale-110" : "text-white/30 hover:text-white/50")}>
                    <Activity className="h-6 w-6" />
                  </button>

                  <button onClick={() => setActiveTab('meals')} className={cn("flex flex-col items-center justify-center transition-all", activeTab === 'meals' ? "text-primary scale-110" : "text-white/30 hover:text-white/50")}>
                    <Utensils className="h-6 w-6" />
                  </button>

                  <div className="relative flex items-center justify-center px-2">
                     <UnifiedDataEntry selectedDate={selectedDate || startOfToday()}>
                        <button className="h-16 w-16 bg-primary rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(0,255,255,0.6)] hover:scale-110 active:scale-95 transition-all border-4 border-black/20">
                           <Plus className="h-8 w-8 text-black" />
                        </button>
                     </UnifiedDataEntry>
                  </div>

                  <button onClick={() => setActiveTab('chats')} className={cn("flex flex-col items-center justify-center transition-all", activeTab === 'chats' ? "text-primary scale-110" : "text-white/30 hover:text-white/50")}>
                    <MessageSquare className="h-6 w-6" />
                  </button>

                  <button onClick={() => setActiveTab('feeling')} className={cn("flex flex-col items-center justify-center transition-all", activeTab === 'feeling' ? "text-primary scale-110" : "text-white/30 hover:text-white/50")}>
                    <Smile className="h-6 w-6" />
                  </button>

                  <button onClick={() => setActiveTab('profile')} className={cn("flex flex-col items-center justify-center transition-all", activeTab === 'profile' ? "text-primary scale-110" : "text-white/30 hover:text-white/50")}>
                    <UserCircle className="h-6 w-6" />
                  </button>
               </div>
            </div>

          </Tabs>
        )}
      </header>
    </div>
  );
}
