
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Utensils, 
  Activity, 
  MessageSquare, 
  Settings, 
  Plus, 
  Zap, 
  LayoutGrid,
  UserCheck,
  BarChart3
} from 'lucide-react';
import { useUser, getSafeDb } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

// Tabs/Views (assuming these components exist in the project)
import { BioScoreView } from '@/components/bio-score-view';
import { DietPlanner } from '@/components/diet-planner';
import { SocialFeed } from '@/components/social-feed';
import { SyncCenter } from '@/components/sync-center';
import { ChatList } from '@/components/chat-list';
import { WorkoutLog } from '@/components/workout-log';
import { ProfileCabinet } from '@/components/profile-cabinet';

type Tab = 'diet' | 'feed' | 'stats' | 'sync' | 'chat' | 'workouts' | 'profile';

export default function DashboardPage() {
  const { user, loading: authLoading } = useUser();
  const [activeTab, setActiveTab] = useState<Tab>('stats');
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      const db = getSafeDb();
      if (!db) return;
      const docRef = doc(db, 'profiles', user.uid);
      try {
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setProfile(snap.data());
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    }
    if (!authLoading && user) {
      loadProfile();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 space-y-4">
        <Skeleton className="h-12 w-full bg-slate-900" />
        <Skeleton className="h-64 w-full bg-slate-900" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-32 bg-slate-900" />
          <Skeleton className="h-32 bg-slate-900" />
        </div>
      </div>
    );
  }

  const isSpecialist = profile?.role === 'specialist';

  const NAV_ITEMS = [
    { id: 'diet', icon: isSpecialist ? UserCheck : Utensils, label: isSpecialist ? 'Клиенты' : 'Питание' },
    { id: 'feed', icon: LayoutGrid, label: 'Лента' },
    { id: 'stats', icon: isSpecialist ? BarChart3 : Activity, label: isSpecialist ? 'Аналитика' : 'Дашборд' },
    { id: 'sync', icon: Plus, label: 'Плюс', center: true },
    { id: 'chat', icon: MessageSquare, label: 'Чаты' },
    { id: 'workouts', icon: Zap, label: 'Нагрузки' },
    { id: 'profile', icon: Settings, label: 'Профиль' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 pb-24 text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          BIO HUB <span className="text-slate-500 font-light text-sm ml-1">PRO</span>
        </h1>
        <div className="flex items-center space-x-2">
          {profile?.bioScore && (
            <div className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full flex items-center">
              <span className="text-xs font-bold text-cyan-400 mr-1">BIO</span>
              <span className="text-sm font-bold text-white">{profile.bioScore}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main View Area */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {activeTab === 'stats' && <BioScoreView profile={profile} />}
        {activeTab === 'diet' && <DietPlanner profile={profile} />}
        {activeTab === 'feed' && <SocialFeed />}
        {activeTab === 'sync' && <SyncCenter onSyncComplete={() => setActiveTab('stats')} />}
        {activeTab === 'chat' && <ChatList />}
        {activeTab === 'workouts' && <WorkoutLog />}
        {activeTab === 'profile' && <ProfileCabinet user={user!} profile={profile} onUpdate={() => window.location.reload()} />}
      </main>

      {/* Modern Bottom Navigation - 7 Buttons Fixed */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2 pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto bg-slate-900/90 backdrop-blur-xl border border-slate-800 shadow-2xl rounded-3xl flex justify-between items-center px-4 py-2">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`flex flex-col items-center justify-center p-2 transition-all duration-300 relative ${
                activeTab === item.id 
                  ? 'text-cyan-400 scale-110' 
                  : 'text-slate-500 hover:text-slate-300'
              } ${item.center ? 'bg-cyan-500 text-white rounded-2xl -mt-8 shadow-lg shadow-cyan-500/40 p-3 hover:scale-105 active:scale-95' : ''}`}
            >
              <item.icon className={`${item.center ? 'w-6 h-6' : 'w-5 h-5'}`} />
              {!item.center && <span className="text-[10px] mt-1 font-medium">{item.label}</span>}
              {activeTab === item.id && !item.center && (
                <span className="absolute -bottom-1 w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
