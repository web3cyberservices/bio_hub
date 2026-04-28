'use client';

import { useState, useMemo } from 'react';
import { useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where, orderBy } from 'firebase/firestore';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Activity, Utensils, FlaskConical, ChevronLeft, ChevronRight,
  User, Target, Ban, Wine, Scale, MessageSquare, Pill, Zap, Dumbbell
} from 'lucide-react';
import { format, addDays, subDays, differenceInYears } from 'date-fns';
import { ru } from 'date-fns/locale';
import { BioTwinVisualizer } from './bio-twin-visualizer';
import { cn } from '@/lib/utils';
import { downloadLabResultsDocx } from '@/lib/docx-generator';
import { PersonalMealPlan } from './personal-meal-plan';
import { ActivitiesHub } from './activities-hub';

interface PatientDataViewerProps {
  patient: any;
  onStartChat?: (id: string, name: string, photo: string) => void;
}

export function PatientDataViewer({ patient, onStartChat }: PatientDataViewerProps) {
  const { firestore } = useFirestore();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'dashboard' | 'meals' | 'activities' | 'labs'>('profile');
  const dateKey = format(selectedDate, 'yyyy-MM-dd');

  const dailyLogRef = useMemoFirebase(() => patient?.id ? doc(firestore!, 'users', patient.id, 'dailyLogs', dateKey) : null, [firestore, patient?.id, dateKey]);
  const mealsQuery = useMemoFirebase(() => patient?.id ? query(collection(firestore!, 'users', patient.id, 'personalMeals'), where('date', '==', dateKey)) : null, [firestore, patient?.id, dateKey]);
  const recRef = useMemoFirebase(() => patient?.id ? doc(firestore!, 'users', patient.id, 'recommendations', dateKey) : null, [firestore, patient?.id, dateKey]);
  const labsQuery = useMemoFirebase(() => patient?.id ? query(collection(firestore!, 'users', patient.id, 'labResults'), orderBy('createdAt', 'desc')) : null, [firestore, patient?.id]);

  const { data: dailyLogDoc } = useDoc<any>(dailyLogRef);
  const { data: meals } = useCollection<any>(mealsQuery);
  const { data: recData } = useDoc<any>(recRef);
  const { data: labs } = useCollection<any>(labsQuery);

  const age = patient?.birthDate ? differenceInYears(new Date(), new Date(patient.birthDate)) : '—';
  const actualMacros = meals?.reduce((acc: any, m: any) => ({
    calories: acc.calories + (m.calories || 0),
    protein: acc.protein + (m.protein || 0),
    fat: acc.fat + (m.fat || 0),
    carbs: acc.carbs + (m.carbs || 0),
  }), { calories: 0, protein: 0, fat: 0, carbs: 0 });

  const tabs = [
    { id: 'profile', label: 'Профиль', icon: User },
    { id: 'dashboard', label: 'Биометрия', icon: Activity },
    { id: 'meals', label: 'Питание', icon: Utensils },
    { id: 'activities', label: 'Активности', icon: Zap },
    { id: 'labs', label: 'Анализы', icon: FlaskConical },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-32">
      {/* HEADER PATIENT INFO */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4">
        <div className="flex items-center gap-4">
           <Avatar className="h-20 w-20 border-4 border-primary/20 rounded-2xl shadow-xl">
              <AvatarImage src={patient.photoUrl} className="object-cover" />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-black">{patient.firstName?.charAt(0)}</AvatarFallback>
           </Avatar>
           <div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter">{patient.firstName} {patient.lastName}</h2>
              <button 
                onClick={() => onStartChat?.(patient.id, `${patient.firstName} ${patient.lastName}`, patient.photoUrl)} 
                className="text-[10px] font-black uppercase text-primary hover:underline flex items-center gap-1 mt-1"
              >
                <MessageSquare className="h-3 w-3" /> Написать сообщение
              </button>
           </div>
        </div>
        
        {/* DATE PICKER */}
        <div className="flex items-center bg-white/5 border border-white/10 p-2 rounded-2xl shadow-inner">
           <Button variant="ghost" size="icon" onClick={() => setSelectedDate(subDays(selectedDate, 1))} className="text-white/40 hover:text-white"><ChevronLeft className="h-5 w-5" /></Button>
           <span className="px-6 font-black text-white uppercase text-sm">{format(selectedDate, 'd MMM yyyy', { locale: ru })}</span>
           <Button variant="ghost" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, 1))} className="text-white/40 hover:text-white"><ChevronRight className="h-5 w-5" /></Button>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex justify-center flex-wrap gap-2 px-4">
        {tabs.map(t => (
          <button 
            key={t.id} 
            onClick={() => setActiveSubTab(t.id as any)} 
            className={cn(
              "px-6 py-3 rounded-xl font-black uppercase text-[10px] flex items-center gap-2 transition-all", 
              activeSubTab === t.id ? "bg-primary text-slate-950 shadow-lg shadow-primary/20" : "bg-white/5 text-white/30 hover:bg-white/10"
            )}
          >
            <t.icon className="h-3.5 w-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <div className="px-4">
        {activeSubTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
            <Card className="cyber-card p-8 bg-blue-950/40 space-y-6">
              <h4 className="text-sm font-black uppercase text-primary flex items-center gap-2"><User className="h-4 w-4" /> Анамнез</h4>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-[8px] font-black text-white/30 uppercase">Возраст</p><p className="text-xl font-black text-white">{age} лет</p></div>
                <div><p className="text-[8px] font-black text-white/30 uppercase">Рост/Вес</p><p className="text-xl font-black text-white">{patient.height}/{patient.weight}</p></div>
              </div>
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex justify-between items-center"><span className="text-xs text-white/40 uppercase font-black">Цель</span><Badge className="bg-primary/20 text-primary border-none">{patient.healthGoal}</Badge></div>
                <div className="flex justify-between items-center"><span className="text-xs text-white/40 uppercase font-black">Курение</span><span className={cn("font-bold text-sm", patient.smoking === 'да' ? 'text-red-400' : 'text-emerald-400')}>{patient.smoking?.toUpperCase()}</span></div>
                <div className="flex justify-between items-center"><span className="text-xs text-white/40 uppercase font-black">Алкоголь</span><span className="font-bold text-sm text-white/80">{patient.alcohol?.toUpperCase()}</span></div>
              </div>
            </Card>
            <Card className="cyber-card p-8 bg-blue-950/40 space-y-6">
              <h4 className="text-sm font-black uppercase text-primary flex items-center gap-2"><Pill className="h-4 w-4" /> Лекарства и БАДы</h4>
              <div className="p-5 rounded-2xl bg-black/40 text-sm leading-relaxed border border-white/5 min-h-[150px] text-white/70 italic">
                {patient.medications || 'Данные о приеме препаратов не указаны.'}
              </div>
              <div className="pt-4 border-t border-white/5 space-y-2">
                 <p className="text-[8px] font-black uppercase text-white/30">Предпочтения в еде</p>
                 <p className="text-xs text-white/60"><strong className="text-primary/60">Любит:</strong> {patient.favoriteFoods || '—'}</p>
                 <p className="text-xs text-white/60"><strong className="text-red-400/60">Исключить:</strong> {patient.dislikedFoods || '—'}</p>
              </div>
            </Card>
          </div>
        )}
        
        {activeSubTab === 'dashboard' && (
          <div className="animate-in fade-in duration-500">
            <Card className="cyber-card h-[650px] overflow-hidden">
               <BioTwinVisualizer 
                 score={recData?.data?.bioScore} 
                 deviceData={dailyLogDoc} 
                 profileData={patient} 
                 macros={actualMacros} 
                 goals={recData?.data?.macros} 
                 className="h-full" 
               />
            </Card>
          </div>
        )}

        {activeSubTab === 'meals' && (
          <div className="animate-in fade-in duration-500">
            <PersonalMealPlan selectedDate={selectedDate} patientId={patient.id} />
          </div>
        )}

        {activeSubTab === 'activities' && (
          <div className="animate-in fade-in duration-500">
             <ActivitiesHub selectedDate={selectedDate} patientId={patient.id} />
          </div>
        )}

        {activeSubTab === 'labs' && (
          <div className="grid gap-6 animate-in fade-in duration-500">
            {labs?.map((l: any) => (
              <Card key={l.id} className="cyber-card p-8 bg-blue-950/40 space-y-6 border-white/5 group">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-black text-xl text-white uppercase tracking-tight">Отчет от {format(new Date(l.createdAt), 'd MMMM yyyy', { locale: ru })}</p>
                    <p className="text-sm text-white/50 mt-2 leading-relaxed">{l.summary}</p>
                  </div>
                  <Button variant="outline" onClick={() => downloadLabResultsDocx(l)} className="rounded-xl border-primary/20 text-primary hover:bg-primary/5 font-black uppercase text-[10px]">Скачать DOCX</Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/5">
                   {l.markers?.slice(0, 4).map((m: any, i: number) => (
                      <div key={i} className="bg-black/20 p-3 rounded-xl">
                         <p className="text-[7px] font-black text-white/30 uppercase truncate">{m.name}</p>
                         <p className={cn("text-sm font-black", m.status === 'normal' ? 'text-emerald-400' : 'text-red-400')}>{m.value}</p>
                      </div>
                   ))}
                </div>
              </Card>
            ))}
            {(!labs || labs.length === 0) && (
              <div className="py-24 text-center bg-white/[0.03] border-2 border-dashed border-white/5 rounded-[3rem]">
                 <FlaskConical className="h-12 w-12 text-white/10 mx-auto mb-4" />
                 <p className="text-sm font-black uppercase text-white/30 tracking-widest">Нет загруженных анализов</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
