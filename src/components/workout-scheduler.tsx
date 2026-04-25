
'use client';

import { useState, useMemo } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, addDoc, updateDoc, doc, deleteDoc, orderBy } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dumbbell, Plus, Trash2, CheckCircle2, 
  Calendar as CalendarIcon, Loader2, Save,
  ChevronRight, ListTodo, X
} from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface WorkoutSchedulerProps {
  selectedDate: Date;
  patientId?: string;
}

export function WorkoutScheduler({ selectedDate, patientId }: WorkoutSchedulerProps) {
  const { user } = useUser();
  const { firestore } = useFirestore();
  const { toast } = useToast();
  const [localDate, setLocalDate] = useState<Date>(selectedDate);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [title, setTitle] = useState('');
  const [exercises, setExercises] = useState<{name: string, sets: number, reps: string, weight: string}[]>([]);
  const [newExName, setNewExName] = useState('');

  const dateKey = format(localDate, 'yyyy-MM-dd');
  const effectiveUid = patientId || user?.uid;

  const workoutsQuery = useMemoFirebase(() => {
    if (!firestore || !effectiveUid) return null;
    return query(
      collection(firestore, 'users', effectiveUid, 'workouts'),
      where('date', '==', dateKey)
    );
  }, [firestore, effectiveUid, dateKey]);

  const { data: workouts, isLoading } = useCollection<any>(workoutsQuery);

  const addEx = () => {
    if (!newExName) return;
    setExercises([...exercises, { name: newExName, sets: 3, reps: '12', weight: '—' }]);
    setNewExName('');
  };

  const removeEx = (idx: number) => {
    setExercises(exercises.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!firestore || !effectiveUid || !title) return;
    setLoading(true);
    try {
      await addDoc(collection(firestore, 'users', effectiveUid, 'workouts'), {
        date: dateKey,
        title,
        exercises,
        status: 'planned',
        createdBy: user?.uid,
        createdAt: new Date().toISOString()
      });
      toast({ title: 'Тренировка запланирована' });
      setIsAdding(false);
      setTitle(''); setExercises([]);
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Ошибка' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (w: any) => {
    if (!firestore || !effectiveUid) return;
    const newStatus = w.status === 'completed' ? 'planned' : 'completed';
    await updateDoc(doc(firestore, 'users', effectiveUid, 'workouts', w.id), {
      status: newStatus
    });
  };

  const handleDelete = async (id: string) => {
    if (!firestore || !effectiveUid) return;
    await deleteDoc(doc(firestore, 'users', effectiveUid, 'workouts', id));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-5 space-y-6">
         <Card className="cyber-card p-6 bg-blue-900/20 border-none">
            <Calendar
              mode="single"
              selected={localDate}
              onSelect={(d) => d && setLocalDate(d)}
              locale={ru}
            />
         </Card>
         <Button onClick={() => setIsAdding(true)} className="w-full h-16 rounded-2xl bg-primary text-slate-950 font-black text-lg gap-3 shadow-xl shadow-primary/20">
            <Plus className="h-6 w-6 stroke-[3px]" /> ЗАПЛАНИРОВАТЬ
         </Button>
      </div>

      <div className="lg:col-span-7 space-y-6">
         {isAdding ? (
            <Card className="cyber-card p-8 bg-blue-950/60 border-primary/30 animate-in slide-in-from-top-4 duration-300">
               <div className="space-y-6">
                  <div className="flex justify-between items-center">
                     <h3 className="text-xl font-black text-white uppercase">Новый план</h3>
                     <Button variant="ghost" size="icon" onClick={() => setIsAdding(false)}><X className="h-5 w-5" /></Button>
                  </div>
                  <Input placeholder="Название (напр: Спина + Бицепс)" value={title} onChange={e => setTitle(e.target.value)} className="h-14 bg-white/5 border-none text-lg font-bold" />
                  
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase text-white/30">Список упражнений</label>
                     <div className="flex gap-2">
                        <Input placeholder="Упражнение..." value={newExName} onChange={e => setNewExName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addEx()} className="h-12 bg-white/5 border-none" />
                        <Button onClick={addEx} variant="secondary" className="h-12 rounded-xl px-4"><Plus className="h-5 w-5" /></Button>
                     </div>
                     <div className="space-y-2">
                        {exercises.map((ex, i) => (
                           <div key={i} className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                              <span className="flex-1 font-bold text-sm text-white">{ex.name}</span>
                              <div className="flex items-center gap-2">
                                 <input type="number" value={ex.sets} onChange={e => {
                                    const next = [...exercises];
                                    next[i].sets = Number(e.target.value);
                                    setExercises(next);
                                 }} className="w-10 h-8 bg-black/40 rounded border-none text-center text-xs" />
                                 <span className="text-[8px] font-black uppercase opacity-40">Подх</span>
                              </div>
                              <Button variant="ghost" size="icon" onClick={() => removeEx(i)} className="h-8 w-8 text-white/20 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></Button>
                           </div>
                        ))}
                     </div>
                  </div>

                  <Button onClick={handleSave} disabled={loading || !title} className="w-full h-14 bg-primary text-slate-950 font-black rounded-xl">
                     {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "СОХРАНИТЬ ПЛАН"}
                  </Button>
               </div>
            </Card>
         ) : (
            <div className="space-y-4">
               <h3 className="text-[10px] font-black uppercase text-white/30 px-2">Тренировки на {format(localDate, 'd MMMM', { locale: ru })}</h3>
               {isLoading ? (
                  <div className="py-20 text-center"><Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" /></div>
               ) : workouts?.map((w) => (
                  <Card key={w.id} className={cn(
                    "cyber-card p-6 border-none transition-all",
                    w.status === 'completed' ? "bg-emerald-500/10 opacity-60" : "bg-blue-900/20"
                  )}>
                     <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                              <Dumbbell className="h-5 w-5" />
                           </div>
                           <div>
                              <h4 className="font-black text-white text-lg uppercase leading-none">{w.title}</h4>
                              <p className="text-[10px] font-bold text-white/30 uppercase mt-1">{w.exercises?.length || 0} упражнений</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <Button 
                             onClick={() => handleToggleStatus(w)}
                             className={cn("h-10 px-4 rounded-xl font-black text-[9px] uppercase tracking-widest", w.status === 'completed' ? "bg-emerald-500 text-white" : "bg-white/10 text-white")}
                           >
                              {w.status === 'completed' ? "Завершено" : "Выполнить"}
                           </Button>
                           <Button variant="ghost" size="icon" onClick={() => handleDelete(w.id)} className="text-white/20 hover:text-red-400"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                     </div>
                     
                     <div className="grid gap-2">
                        {w.exercises?.map((ex: any, idx: number) => (
                           <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl text-xs">
                              <span className="font-bold text-white/80">{ex.name}</span>
                              <div className="flex items-center gap-4 text-[10px] font-black uppercase text-primary/60">
                                 <span>{ex.sets} подходов</span>
                                 <span>{ex.reps} повт</span>
                                 {ex.weight !== '—' && <span>{ex.weight} кг</span>}
                              </div>
                           </div>
                        ))}
                     </div>
                  </Card>
               ))}
               {workouts?.length === 0 && (
                  <div className="py-20 text-center bg-white/[0.03] border-2 border-dashed border-white/5 rounded-[2.5rem]">
                     <Dumbbell className="h-12 w-12 text-white/10 mx-auto mb-4" />
                     <p className="text-[10px] font-black uppercase text-white/30 tracking-widest">Нет тренировок</p>
                  </div>
               )}
            </div>
         )}
      </div>
    </div>
  );
}
