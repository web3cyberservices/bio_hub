'use client';

import { useState } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Zap, Brain, Clock, Flame, Plus, Trash2, Loader2, 
  ChevronRight, Activity, Mic, Save, ArrowLeft 
} from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface ActivityLoggerProps {
  selectedDate: Date;
  patientId?: string;
}

export function ActivityLogger({ selectedDate, patientId }: ActivityLoggerProps) {
  const { user } = useUser();
  const { firestore } = useFirestore();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<'physical' | 'mental'>('physical');
  const [duration, setDuration] = useState('');
  const [intensity, setIntensity] = useState('medium');

  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  const effectiveUid = patientId || user?.uid;

  const activitiesQuery = useMemoFirebase(() => {
    if (!firestore || !effectiveUid) return null;
    return query(
      collection(firestore, 'users', effectiveUid, 'activities'),
      where('date', '==', dateKey)
    );
  }, [firestore, effectiveUid, dateKey]);

  const { data: activities, isLoading } = useCollection<any>(activitiesQuery);

  const calculateCalories = (dur: number, intens: string, t: string) => {
    const base = t === 'physical' ? 5 : 1.5; // ккал в минуту
    const mult = intens === 'high' ? 2 : intens === 'low' ? 0.6 : 1;
    return Math.round(dur * base * mult);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !effectiveUid || !name || !duration) return;

    setLoading(true);
    try {
      const cals = calculateCalories(Number(duration), intensity, type);
      await addDoc(collection(firestore, 'users', effectiveUid, 'activities'), {
        date: dateKey,
        name,
        type,
        duration: Number(duration),
        intensity,
        calories: cals,
        createdAt: new Date().toISOString()
      });
      toast({ title: 'Активность добавлена' });
      reset();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Ошибка' });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setName(''); setDuration(''); setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    if (!firestore || !effectiveUid) return;
    await deleteDoc(doc(firestore, 'users', effectiveUid, 'activities', id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
         <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Нагрузка дня</h3>
         <Button onClick={() => setIsAdding(!isAdding)} className="rounded-xl bg-primary text-slate-950 font-black h-10 px-6 gap-2">
            <Plus className="h-4 w-4" /> Добавить
         </Button>
      </div>

      {isAdding && (
        <Card className="cyber-card bg-blue-900/20 border-primary/20 animate-in zoom-in-95 duration-300">
           <CardContent className="p-8">
              <form onSubmit={handleAdd} className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-white/40 px-2">Тип нагрузки</label>
                       <div className="grid grid-cols-2 gap-2">
                          <Button 
                            type="button" 
                            onClick={() => setType('physical')}
                            variant={type === 'physical' ? "default" : "outline"}
                            className={cn("h-12 rounded-xl", type === 'physical' ? "bg-primary text-slate-950" : "bg-white/5 border-white/10")}
                          >
                             <Activity className="h-4 w-4 mr-2" /> Физическая
                          </Button>
                          <Button 
                            type="button" 
                            onClick={() => setType('mental')}
                            variant={type === 'mental' ? "default" : "outline"}
                            className={cn("h-12 rounded-xl", type === 'mental' ? "bg-primary text-slate-950" : "bg-white/5 border-white/10")}
                          >
                             <Brain className="h-4 w-4 mr-2" /> Умственная
                          </Button>
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-white/40 px-2">Название</label>
                       <Input placeholder="Напр: Созвон, Бег, Работа..." value={name} onChange={e => setName(e.target.value)} className="h-12 rounded-xl bg-white/5 border-none font-bold" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-white/40 px-2">Минуты</label>
                       <Input type="number" placeholder="60" value={duration} onChange={e => setDuration(e.target.value)} className="h-12 rounded-xl bg-white/5 border-none font-bold" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-white/40 px-2">Интенсивность</label>
                       <Select value={intensity} onValueChange={setIntensity}>
                          <SelectTrigger className="h-12 rounded-xl bg-white/5 border-none font-bold">
                             <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                             <SelectItem value="low">Низкая</SelectItem>
                             <SelectItem value="medium">Средняя</SelectItem>
                             <SelectItem value="high">Высокая</SelectItem>
                          </SelectContent>
                       </Select>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <Button type="button" variant="ghost" onClick={reset} className="flex-1 h-14 rounded-xl font-bold">Отмена</Button>
                    <Button type="submit" disabled={loading} className="flex-1 h-14 rounded-xl bg-primary text-slate-950 font-black">
                       {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <><Save className="mr-2 h-5 w-5" /> Сохранить</>}
                    </Button>
                 </div>
              </form>
           </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
         {isLoading ? (
            <div className="py-20 text-center"><Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" /></div>
         ) : activities?.map((act) => (
            <Card key={act.id} className="cyber-card p-5 bg-blue-950/40 border-none flex items-center justify-between group">
               <div className="flex items-center gap-5">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center border",
                    act.type === 'physical' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                  )}>
                     {act.type === 'physical' ? <Activity className="h-6 w-6" /> : <Brain className="h-6 w-6" />}
                  </div>
                  <div>
                     <h4 className="font-black text-white text-lg leading-tight">{act.name}</h4>
                     <div className="flex items-center gap-3 mt-1">
                        <Badge variant="outline" className="text-[8px] border-white/10 text-white/40 uppercase px-2 py-0">{act.duration} мин</Badge>
                        <span className="flex items-center gap-1 text-[10px] font-black text-primary/60 uppercase">
                           <Flame className="h-3 w-3" /> {act.calories} ккал
                        </span>
                     </div>
                  </div>
               </div>
               <Button variant="ghost" size="icon" onClick={() => handleDelete(act.id)} className="h-10 w-10 opacity-0 group-hover:opacity-100 text-white/20 hover:text-destructive hover:bg-destructive/5 transition-all">
                  <Trash2 className="h-5 w-5" />
               </Button>
            </Card>
         ))}
         {activities?.length === 0 && (
            <div className="py-20 text-center bg-white/[0.03] border-2 border-dashed border-white/5 rounded-[2.5rem]">
               <Zap className="h-12 w-12 text-white/10 mx-auto mb-4" />
               <p className="text-[10px] font-black uppercase text-white/30 tracking-widest">Нет записей активности</p>
            </div>
         )}
      </div>
    </div>
  );
}