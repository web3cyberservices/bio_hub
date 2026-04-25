'use client';

import { useState } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { ru } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Zap, Calendar, Loader2 } from 'lucide-react';
import { ActivityLogger } from './activity-logger';
import { WorkoutScheduler } from './workout-scheduler';

interface ActivitiesHubProps {
  selectedDate: Date;
  patientId?: string; // Для просмотра специалистом
}

export function ActivitiesHub({ selectedDate, patientId }: ActivitiesHubProps) {
  const { user } = useUser();
  const [activeSubTab, setActiveTab] = useState<'log' | 'workout'>('log');
  
  const effectiveUid = patientId || user?.uid;

  const tabs = [
    { id: 'log', label: 'Лог нагрузок', icon: Zap },
    { id: 'workout', label: 'График тренировок', icon: Calendar },
  ] as const;

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto space-y-8 pb-32">
      <div className="flex items-center justify-center">
        <div className="inline-flex bg-white/5 backdrop-blur-xl p-1.5 rounded-[2rem] border border-white/10 shadow-2xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-[1.5rem] transition-all duration-300 relative overflow-hidden group",
                activeSubTab === tab.id 
                  ? "bg-primary text-slate-950 shadow-lg" 
                  : "text-white/40 hover:text-white/70"
              )}
            >
              <tab.icon className={cn("h-4 w-4", activeSubTab === tab.id ? "stroke-[3px]" : "opacity-50")} />
              <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest">{tab.label}</span>
              {activeSubTab === tab.id && (
                <span className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        {activeSubTab === 'log' && (
          <ActivityLogger selectedDate={selectedDate} patientId={patientId} />
        )}

        {activeSubTab === 'workout' && (
          <WorkoutScheduler selectedDate={selectedDate} patientId={patientId} />
        )}
      </div>
    </div>
  );
}