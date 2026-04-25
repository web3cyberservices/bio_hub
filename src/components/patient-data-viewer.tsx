
'use client';

import { useState, useMemo } from 'react';
import { useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where, orderBy } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Activity, Utensils, FlaskConical, 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight,
  Flame, Beef, Droplet, Zap, History, Loader2,
  TrendingUp, TrendingDown, CheckCircle2, Download,
  User, Target, Ban, Wine, Heart, Scale, Info, MessageSquare,
  ArrowUpRight, Pill
} from 'lucide-react';
import { format, addDays, subDays, differenceInYears } from 'date-fns';
import { ru } from 'date-fns/locale';
import { BioTwinVisualizer } from './bio-twin-visualizer';
import { ScrollArea } from '@/components/ui/scroll-area';
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

  // Данные лога пациента за день
  const dailyLogRef = useMemoFirebase(() => {
    if (!firestore || !patient?.id) return null;
    return doc(firestore, 'users', patient.id, 'dailyLogs', dateKey);
  }, [firestore, patient?.id, dateKey]);

  const { data: dailyLogDoc } = useDoc<any>(dailyLogRef);

  // План питания пациента за день
  const mealsQuery = useMemoFirebase(() => {
    if (!firestore || !patient?.id) return null;
    return query(
      collection(firestore, 'users', patient.id, 'personalMeals'),
      where('date', '==', dateKey)
    );
  }, [firestore, patient?.id, dateKey]);

  const { data: meals, isLoading: mealsLoading } = useCollection<any>(mealsQuery);

  // Рекомендации/цели пациента
  const recommendationRef = useMemoFirebase(() => {
    if (!firestore || !patient?.id) return null;
    return doc(firestore, 'users', patient.id, 'recommendations', dateKey);
  }, [firestore, patient?.id, dateKey]);

  const { data: recData } = useDoc<any>(recommendationRef);

  // Архив анализов пациента
  const labsQuery = useMemoFirebase(() => {
    if (!firestore || !patient?.id) return null;
    return query(
      collection(firestore, 'users', patient.id, 'labResults'),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, patient?.id]);

  const { data: labs, isLoading: labsLoading } = useCollection<any>(labsQuery);

  const actualMacros = useMemo(() => {
    if (!meals) return { calories: 0, protein: 0, fat: 0, carbs: 0 };
    return meals.reduce((acc: any, m: any) => ({
      calories: acc.calories + (m.calories || 0),
      protein: acc.protein + (m.protein || 0),
      fat: acc.fat + (m.fat || 0),
      carbs: acc.carbs + (m.carbs || 0),
    }), { calories: 0, protein: 0, fat: 0, carbs: 0 });
  }, [meals]);

  const age = useMemo(() => {
    if (!patient?.birthDate) return '—';
    try {
      return differenceInYears(new Date(), new Date(patient.birthDate));
    } catch (e) {
      return '—';
    }
  }, [patient?.birthDate]);

  const handlePrevDay = () => setSelectedDate(subDays(selectedDate, 1));
  const handleNextDay = () => setSelectedDate(addDays(selectedDate, 1));

  const stats = [
    { label: 'Возраст', value: `${age} лет`, icon: User, color: 'text-blue-400' },
    { label: 'Рост', value: `${patient.height || '—'} см`, icon: Activity, color: 'text-emerald-400' },
    { label: 'Вес (текущий)', value: `${patient.weight || '—'} кг`, icon: Scale, color: 'text-primary' },
    { label: 'Пол', value: patient.gender || '—', icon: User, color: 'text-indigo-400' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-32">
      {/* Header with Patient Summary & Navigation */}
      <div className="px-4 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
           <Avatar className="h-20 w-20 border-4 border-primary/20 rounded-[1.5rem] shadow-xl">
              <AvatarImage src={patient.photoUrl} className="object-cover" />
              <AvatarFallback className="bg-primary/5 text-primary text-2xl font-black">{patient.firstName?.charAt(0)}</AvatarFallback>
           </Avatar>
           <div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter">{patient.firstName} {patient.lastName}</h2>
              <div className="flex items-center gap-3 mt-1">
                 <Badge className="bg-primary text-slate-950 font-black text-[9px] uppercase px-3 py-1">Bio-ID: {patient.id?.slice(0, 8)}</Badge>
                 <button 
                  onClick={() => onStartChat?.(patient.id, `${patient.firstName} ${patient.lastName}`, patient.photoUrl)}
                  className="flex items-center gap-1.5 text-[10px] font-black uppercase text-primary hover:underline"
                 >
                   <MessageSquare className="h-3 w-3" /> Открыть чат
                 </button>
              </div>
           </div>
        </div>

        <div className="flex items-center bg-blue-950/40 backdrop-blur-xl border border-white/5 p-2 rounded-2xl shadow-xl">
           <Button variant="ghost" size="icon" onClick={handlePrevDay} className="h-10 w-10 text-white/40 hover:text-primary"><ChevronLeft className="h-5 w-5" /></Button>
           <div className="px-6 flex flex-col items-center">
              <span className="text-[9px] font-black uppercase text-primary/60 tracking-widest mb-0.5">Дата отчета</span>
              <span className="text-sm font-black text-white uppercase">{format(selectedDate, 'd MMMM yyyy', { locale: ru })}</span>
           </div>
           <Button variant="ghost" size="icon" onClick={handleNextDay} className="h-10 w-10 text-white/40 hover:text-primary"><ChevronRight className="h-5 w-5" /></Button>
        </div>
      </div>

      {/* Internal Navigation Tabs */}
      <div className="px-4 flex justify-center">
        <div className="inline-flex bg-blue-950/40 backdrop-blur-xl p-1.5 rounded-[1.5rem] border border-white/5 shadow-2xl">
           {[
             { id: 'profile', label: 'Профиль', icon: User },
             { id: 'dashboard', label: 'Биометрия', icon: Activity },
             { id: 'meals', label: 'Питание', icon: Utensils },
             { id: 'labs', label: 'Анализы', icon: FlaskConical }
           ].map((tab) => (
             <button
               key={tab.id}
               onClick={() => setActiveSubTab(tab.id as any)}
               className={cn(
                 "flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-black uppercase text-[10px] tracking-widest",
                 activeSubTab === tab.id 
                   ? "bg-primary text-slate-950 shadow-lg" 
                   : "text-white/30 hover:text-white/60"
               )}
             >
               <tab.icon className="h-4 w-4" /> {tab.label}
             </button>
           ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="px-4 min-h-[500px]">
        
        {activeSubTab === 'profile' && (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((s, i) => (
                  <Card key={i} className="cyber-card p-6 border-none bg-blue-950/40 text-center space-y-2">
                     <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center mx-auto">
                        <s.icon className={cn("h-5 w-5", s.color)} />
                     </div>
                     <div>
                        <p className="text-[9px] font-black uppercase text-white/30">{s.label}</p>
                        <p className="text-xl font-black text-white">{s.value}</p>
                     </div>
                  </Card>
                ))}
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="cyber-card p-8 border-none bg-blue-950/40 space-y-6">
                   <h4 className="text-sm font-black uppercase text-primary flex items-center gap-2">
                      <Target className="h-4 w-4" /> Цели и привычки
                   </h4>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-white/5">
                         <span className="text-[10px] font-black uppercase text-white/40">Цель здоровья</span>
                         <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] uppercase px-3">{patient.healthGoal || 'Не указана'}</Badge>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-white/5">
                         <span className="text-[10px] font-black uppercase text-white/40">Активность</span>
                         <Badge variant="outline" className="border-white/10 text-white/60 text-[10px] uppercase">{patient.activityLevel || 'Не указана'}</Badge>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-white/5">
                         <span className="text-[10px] font-black uppercase text-white/40">Курение</span>
                         <span className={cn("text-xs font-bold", patient.smoking === 'да' ? "text-red-400" : "text-emerald-400")}>
                            {patient.smoking === 'да' ? <div className="flex items-center gap-1"><Ban className="h-3 w-3" /> КУРИТ</div> : "НЕТ"}
                         </span>
                      </div>
                      <div className="flex justify-between items-center py-3">
                         <span className="text-[10px] font-black uppercase text-white/40">Алкоголь</span>
                         <span className="text-xs font-bold text-white/80 flex items-center gap-1">
                            <Wine className="h-3 w-3 text-orange-400" /> {patient.alcohol || '—'}
                         </span>
                      </div>
                   </div>
                </Card>

                <Card className="cyber-card p-8 border-none bg-blue-950/40 space-y-6">
                   <h4 className="text-sm font-black uppercase text-primary flex items-center gap-2">
                      <Utensils className="h-4 w-4" /> Пищевой профиль
                   </h4>
                   <div className="space-y-6">
                      <div className="space-y-2">
                         <p className="text-[10px] font-black uppercase text-white/40 px-1">Любит / Предпочитает</p>
                         <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-xs font-medium text-white/70 leading-relaxed min-h-[60px]">
                            {patient.favoriteFoods || 'Данные не заполнены'}
                         </div>
                      </div>
                      <div className="space-y-2">
                         <p className="text-[10px] font-black uppercase text-red-400/40 px-1">Исключить / Аллергии</p>
                         <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 text-xs font-medium text-red-400/70 leading-relaxed min-h-[60px]">
                            {patient.dislikedFoods || 'Данные не заполнены'}
                         </div>
                      </div>
                   </div>
                </Card>

                <Card className="cyber-card p-8 border-none bg-blue-950/40 space-y-6 md:col-span-2">
                   <h4 className="text-sm font-black uppercase text-primary flex items-center gap-2">
                      <Pill className="h-4 w-4" /> Медикаментозная поддержка
                   </h4>
                   <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-sm font-medium text-white/80 leading-relaxed min-h-[80px]">
                      {patient.medications || 'Информация о приеме лекарств и БАДов не указана.'}
                   </div>
                </Card>
             </div>
          </div>
        )}

        {activeSubTab === 'dashboard' && (
          <Card className="cyber-card bg-blue-950/40 border-none overflow-hidden h-[600px] relative">
            <BioTwinVisualizer 
              score={recData?.data?.bioScore} 
              deviceData={dailyLogDoc} 
              profileData={patient}
              macros={actualMacros}
              goals={recData?.data?.macros}
              className="w-full h-full"
            />
          </Card>
        )}

        {activeSubTab === 'meals' && (
          <div className="space-y-6">
            {mealsLoading ? (
              <div className="py-24 text-center"><Loader2 className="h-10 w-10 animate-spin text-primary mx-auto opacity-20" /></div>
            ) : meals && meals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {meals.map((meal: any) => (
                  <Card key={meal.id} className="cyber-card p-6 border-none bg-blue-950/40 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                         <Utensils className="h-6 w-6" />
                      </div>
                      <div>
                         <div className="flex items-center gap-2">
                            <h4 className="font-black text-lg text-white">{meal.name}</h4>
                            <Badge variant="outline" className="bg-primary/5 border-none text-[8px] uppercase tracking-widest text-primary/60">{meal.time}</Badge>
                         </div>
                         <div className="flex items-center gap-4 mt-1 text-[10px] font-black uppercase tracking-widest text-white/40">
                            <span className="flex items-center gap-1"><Flame className="h-3 w-3 text-orange-500" /> {meal.calories} ккал</span>
                            <span className="flex items-center gap-1"><Beef className="h-3 w-3 text-red-400" /> Б:{meal.protein}г</span>
                            <span className="flex items-center gap-1"><Droplet className="h-3 w-3 text-yellow-500" /> Ж:{meal.fat}г</span>
                            <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-primary" /> У:{meal.carbs}г</span>
                         </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="py-24 text-center bg-blue-950/20 border-2 border-dashed border-white/5 rounded-[2.5rem] space-y-4">
                 <Utensils className="h-12 w-12 text-white/10 mx-auto" />
                 <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Пациент еще не заполнил дневник на эту дату</p>
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'labs' && (
          <div className="space-y-6">
             <div className="flex items-center justify-between px-2">
                <h3 className="text-xl font-black text-white uppercase flex items-center gap-2">
                   <History className="h-5 w-5 text-primary" /> История анализов
                </h3>
                <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary text-[10px] font-black uppercase">{labs?.length || 0} отчетов</Badge>
             </div>
             
             {labsLoading ? (
               <div className="py-24 text-center"><Loader2 className="h-10 w-10 animate-spin text-primary mx-auto opacity-20" /></div>
             ) : labs && labs.length > 0 ? (
               <div className="grid grid-cols-1 gap-4">
                 {labs.map((lab: any) => (
                   <Card key={lab.id} className="cyber-card p-8 border-none bg-blue-950/40 space-y-6">
                      <div className="flex items-center justify-between border-b border-white/5 pb-4">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                               <FlaskConical className="h-6 w-6" />
                            </div>
                            <div>
                               <p className="font-black text-white text-lg leading-tight uppercase">Отчет от {format(new Date(lab.createdAt), 'd MMMM yyyy')}</p>
                               <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">LabScan AI Analysis Protocol</p>
                            </div>
                         </div>
                         <Button variant="outline" onClick={() => downloadLabResultsDocx(lab)} className="rounded-xl h-10 px-4 bg-white/5 border-white/10 text-white hover:bg-white/10 gap-2">
                            <Download className="h-4 w-4" /> DOCX
                         </Button>
                      </div>

                      <div className="bg-primary/5 p-5 rounded-2xl border border-primary/20">
                         <p className="text-sm font-medium text-white/70 italic">"{lab.summary}"</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                         {lab.markers?.map((marker: any, idx: number) => (
                            <div key={idx} className="bg-white/5 p-4 rounded-xl border border-white/5 flex items-center justify-between">
                               <div>
                                  <p className="text-sm font-bold text-white">{marker.name}</p>
                                  <Badge className={cn(
                                    "text-[7px] font-black uppercase mt-1 border-none px-2",
                                    marker.status === 'normal' ? "bg-emerald-500/20 text-emerald-500" : "bg-red-500/20 text-red-500"
                                  )}>
                                     {marker.status === 'normal' ? 'В НОРМЕ' : 'ОТКЛОНЕНИЕ'}
                                  </Badge>
                               </div>
                               <div className="text-right">
                                  <p className="text-lg font-black text-white">{marker.value}</p>
                                  <p className="text-[9px] font-bold text-white/20 uppercase tracking-tighter">Норма: {marker.referenceRange}</p>
                               </div>
                            </div>
                         ))}
                      </div>
                   </Card>
                 ))}
               </div>
             ) : (
               <div className="py-24 text-center bg-blue-950/20 border-2 border-dashed border-white/5 rounded-[2.5rem] space-y-4">
                  <FlaskConical className="h-12 w-12 text-white/10 mx-auto" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Нет загруженных анализов в архиве</p>
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
}
