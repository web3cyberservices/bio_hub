'use client';

import { useState } from 'react';
import { PersonalMealPlan } from './personal-meal-plan';
import { RecommendationDisplay } from './recommendation-display';
import { RecommendationForm } from './recommendation-form';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Utensils, Sparkles, Stethoscope, Loader2, Info, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MealsHubProps {
  selectedDate: Date;
}

export function MealsHub({ selectedDate }: MealsHubProps) {
  const { user } = useUser();
  const { firestore } = useFirestore();
  const [activeSubTab, setActiveTab] = useState<'personal' | 'ai' | 'specialist'>('personal');
  
  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  
  const recRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid || user.uid === 'public-user') return null;
    return doc(firestore, 'users', user.uid, 'recommendations', dateKey);
  }, [firestore, user?.uid, dateKey]);

  const { data: recommendation, isLoading: recLoading } = useDoc<any>(recRef);

  const tabs = [
    { id: 'personal', label: 'Свой план', icon: Utensils },
    { id: 'ai', label: 'План от ИИ', icon: Sparkles },
    { id: 'specialist', label: 'План эксперта', icon: Stethoscope },
  ] as const;

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto space-y-8 pb-32">
      {/* SUB-TABS NAVIGATION */}
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

      {/* CONTENT AREA */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        {activeSubTab === 'personal' && (
          <div className="space-y-6">
            <PersonalMealPlan selectedDate={selectedDate} />
          </div>
        )}

        {activeSubTab === 'ai' && (
          <div className="space-y-6">
            {recLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
                <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">Анализ данных...</p>
              </div>
            ) : recommendation?.data ? (
              <div className="space-y-8">
                 <div className="bg-primary/10 border border-primary/20 rounded-3xl p-6 flex items-start gap-4 mx-4">
                    <Info className="h-6 w-6 text-primary shrink-0" />
                    <div className="space-y-1">
                       <p className="text-sm font-bold text-white uppercase tracking-tight">Ваш био-рацион на {format(selectedDate, 'd MMMM', { locale: (require('date-fns/locale').ru) })}</p>
                       <p className="text-xs text-white/60 font-medium">Это меню сформировано ИИ на основе вашего текущего веса, целей и последних загруженных анализов.</p>
                    </div>
                 </div>
                 <RecommendationDisplay data={recommendation.data} mode="meals" />
                 <div className="flex justify-center pt-4">
                    <button 
                      onClick={() => setActiveTab('personal')} 
                      className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40 hover:text-primary transition-colors"
                    >
                      Обновить данные в профиле для нового расчета
                    </button>
                 </div>
              </div>
            ) : (
              <div className="px-4">
                 <RecommendationForm onResult={() => {}} selectedDate={selectedDate} />
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'specialist' && (
          <div className="px-4 py-20 text-center space-y-8 animate-in zoom-in-95 duration-500">
             <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10 shadow-inner">
                <Stethoscope className="h-10 w-10 text-white/20" />
             </div>
             <div className="max-w-md mx-auto space-y-4">
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">План от эксперта</h3>
                <p className="text-sm text-white/40 font-medium leading-relaxed">
                   Ваш лечащий врач или нутрициолог пока не составил индивидуальный план питания на эту дату.
                </p>
                <div className="bg-white/5 p-6 rounded-2xl border border-white/5 text-left flex items-start gap-4">
                   <MessageSquare className="h-5 w-5 text-primary shrink-0" />
                   <p className="text-xs text-white/60 font-medium">
                      Вы можете отправить свои био-данные и результаты анализов специалисту в разделе <strong>Профиль -> Архив здоровья</strong> и запросить консультацию в чате.
                   </p>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
