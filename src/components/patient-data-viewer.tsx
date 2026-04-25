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
  User, Target, Ban, Wine, Scale, MessageSquare, Pill
} from 'lucide-react';
import { format, addDays, subDays, differenceInYears } from 'date-fns';
import { ru } from 'date-fns/locale';
import { BioTwinVisualizer } from './bio-twin-visualizer';
import { cn } from '@/lib/utils';
import { downloadLabResultsDocx } from '@/lib/docx-generator';

interface PatientDataViewerProps {
  patient: any;
  onStartChat?: (id: string, name: string, photo: string) => void;
}

export function PatientDataViewer({ patient, onStartChat }: PatientDataViewerProps) {
  const { firestore } = useFirestore();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'dashboard' | 'meals' | 'labs'>('profile');
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

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-32">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4">
        <div className="flex items-center gap-4">
           <Avatar className="h-20 w-20 border-4 border-primary/20 rounded-2xl"><AvatarImage src={patient.photoUrl} /><AvatarFallback>{patient.firstName?.charAt(0)}</AvatarFallback></Avatar>
           <div>
              <h2 className="text-3xl font-black text-white uppercase">{patient.firstName} {patient.lastName}</h2>
              <button onClick={() => onStartChat?.(patient.id, `${patient.firstName} ${patient.lastName}`, patient.photoUrl)} className="text-[10px] font-black uppercase text-primary hover:underline flex items-center gap-1"><MessageSquare className="h-3 w-3" /> Написать</button>
           </div>
        </div>
        <div className="flex items-center bg-white/5 border border-white/10 p-2 rounded-2xl">
           <Button variant="ghost" size="icon" onClick={() => setSelectedDate(subDays(selectedDate, 1))}><ChevronLeft className="h-5 w-5" /></Button>
           <span className="px-6 font-black text-white uppercase">{format(selectedDate, 'd MMM yyyy', { locale: ru })}</span>
           <Button variant="ghost" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, 1))}><ChevronRight className="h-5 w-5" /></Button>
        </div>
      </div>

      <div className="flex justify-center gap-2 px-4">
        {['profile', 'dashboard', 'meals', 'labs'].map(t => (
          <button key={t} onClick={() => setActiveSubTab(t as any)} className={cn("px-6 py-3 rounded-xl font-black uppercase text-[10px]", activeSubTab === t ? "bg-primary text-slate-950" : "bg-white/5 text-white/30")}>
            {t === 'profile' ? 'Профиль' : t === 'dashboard' ? 'Биометрия' : t === 'meals' ? 'Еда' : 'Лаб'}
          </button>
        ))}
      </div>

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
                <div className="flex justify-between"><span>Цель</span><Badge className="bg-primary/20 text-primary">{patient.healthGoal}</Badge></div>
                <div className="flex justify-between"><span>Курение</span><span className={patient.smoking === 'да' ? 'text-red-400' : 'text-emerald-400'}>{patient.smoking}</span></div>
              </div>
            </Card>
            <Card className="cyber-card p-8 bg-blue-950/40 space-y-6">
              <h4 className="text-sm font-black uppercase text-primary flex items-center gap-2"><Pill className="h-4 w-4" /> Лекарства и БАДы</h4>
              <div className="p-4 rounded-xl bg-white/5 text-sm leading-relaxed">{patient.medications || 'Не указано'}</div>
            </Card>
          </div>
        )}
        {activeSubTab === 'dashboard' && <Card className="cyber-card h-[600px]"><BioTwinVisualizer score={recData?.data?.bioScore} deviceData={dailyLogDoc} profileData={patient} macros={actualMacros} goals={recData?.data?.macros} className="h-full" /></Card>}
        {activeSubTab === 'meals' && <div className="grid gap-4">{meals?.map((m: any) => <Card key={m.id} className="cyber-card p-6 bg-blue-950/40 flex justify-between items-center"><div><h4 className="font-black text-lg">{m.name}</h4><Badge variant="outline">{m.time}</Badge></div><div className="text-primary font-black">{m.calories} ккал</div></Card>)}</div>}
        {activeSubTab === 'labs' && <div className="grid gap-4">{labs?.map((l: any) => <Card key={l.id} className="cyber-card p-8 bg-blue-950/40 space-y-4"><div><p className="font-black uppercase">Отчет от {format(new Date(l.createdAt), 'd MMM yyyy')}</p><p className="text-xs text-white/60">{l.summary}</p></div><Button variant="outline" onClick={() => downloadLabResultsDocx(l)} className="w-full">Скачать DOCX</Button></Card>)}</div>}
      </div>
    </div>
  );
}
