'use client';

import { useState } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, addDoc, updateDoc, doc, deleteDoc, orderBy } from 'firebase/firestore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Pill, Plus, Trash2, CheckCircle2, 
  Clock, Loader2, Save, X, Calendar, 
  ChevronRight, AlertCircle, Info, Mic
} from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export function MedicationHub() {
  const { user } = useUser();
  const { firestore } = useFirestore();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [type, setType] = useState<'medicine' | 'supplement'>('medicine');
  const [form, setForm] = useState('таблетки');
  const [dosage, setDosage] = useState('');
  const [time, setTime] = useState('09:00');
  const [mealRelation, setMealRelation] = useState('независимо от еды');

  const medsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(
      collection(firestore, 'users', user.uid, 'medications'),
      orderBy('time', 'asc')
    );
  }, [firestore, user?.uid]);

  const { data: meds, isLoading } = useCollection<any>(medsQuery);

  const handleAdd = async () => {
    if (!firestore || !user?.uid || !name) return;
    setLoading(true);
    try {
      await addDoc(collection(firestore, 'users', user.uid, 'medications'), {
        name, type, form, dosage, time, mealRelation,
        status: 'active',
        createdAt: new Date().toISOString()
      });
      toast({ title: 'Препарат добавлен' });
      setIsAdding(false);
      reset();
    } catch (e) {
      toast({ variant: 'destructive', title: 'Ошибка сохранения' });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setName(''); setDosage(''); setTime('09:00');
  };

  const handleDelete = async (id: string) => {
    if (!firestore || !user?.uid) return;
    await deleteDoc(doc(firestore, 'users', user.uid, 'medications', id));
  };

  const getTimeGroup = (t: string) => {
    const hour = parseInt(t.split(':')[0]);
    if (hour >= 5 && hour < 12) return 'Утро';
    if (hour >= 12 && hour < 17) return 'День';
    if (hour >= 17 && hour < 22) return 'Вечер';
    return 'Ночь';
  };

  const groupedMeds = meds?.reduce((acc: any, med: any) => {
    const group = getTimeGroup(med.time);
    if (!acc[group]) acc[group] = [];
    acc[group].push(med);
    return acc;
  }, {});

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-32 px-4">
      <div className="flex items-center justify-between">
         <div>
            <h2 className="text-3xl font-black uppercase text-white tracking-tighter">Лекарства и БАДы</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 mt-1">Medication Monitoring Hub</p>
         </div>
         <Button onClick={() => setIsAdding(true)} className="h-12 px-6 rounded-xl bg-primary text-slate-950 font-black shadow-lg shadow-primary/20">
            <Plus className="h-5 w-5 mr-2" /> ДОБАВИТЬ
         </Button>
      </div>

      <div className="space-y-12">
        {isLoading ? (
          <div className="py-20 text-center"><Loader2 className="h-12 w-12 animate-spin text-primary mx-auto opacity-20" /></div>
        ) : groupedMeds && Object.keys(groupedMeds).length > 0 ? (
          Object.entries(groupedMeds).map(([group, items]: any) => (
            <div key={group} className="space-y-6">
               <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/30 px-2 flex items-center gap-3">
                  <Clock className="h-4 w-4" /> {group}
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {items.map((med: any) => (
                    <Card key={med.id} className="cyber-card p-6 bg-blue-950/40 border-none flex items-center justify-between group">
                       <div className="flex items-center gap-5">
                          <div className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center border",
                            med.type === 'medicine' ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          )}>
                             <Pill className="h-7 w-7" />
                          </div>
                          <div>
                             <h4 className="font-black text-white text-lg leading-tight uppercase">{med.name}</h4>
                             <div className="flex flex-wrap items-center gap-3 mt-1.5">
                                <Badge variant="outline" className="text-[8px] border-white/10 text-white/40 uppercase px-2">{med.time}</Badge>
                                <span className="text-[10px] font-black text-primary/60 uppercase">{med.dosage} {med.form}</span>
                                <span className="text-[10px] font-bold text-white/20 italic">{med.mealRelation}</span>
                             </div>
                          </div>
                       </div>
                       <Button variant="ghost" size="icon" onClick={() => handleDelete(med.id)} className="h-10 w-10 opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all">
                          <Trash2 className="h-5 w-5" />
                       </Button>
                    </Card>
                  ))}
               </div>
            </div>
          ))
        ) : (
          <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.03] space-y-4">
             <Pill className="h-12 w-12 text-white/10 mx-auto" />
             <p className="text-xl font-black text-white/40 uppercase tracking-tight">Курсы не добавлены</p>
          </div>
        )}
      </div>

      <Dialog open={isAdding} onOpenChange={setIsAdding}>
        <DialogContent className="w-[95vw] md:max-w-[600px] rounded-[2.5rem] bg-[#010411] p-0 overflow-hidden border border-white/10 shadow-2xl">
          <DialogHeader className="p-8 bg-primary text-slate-950 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-[#00ffff]/80 opacity-90" />
            <DialogTitle className="text-2xl font-black uppercase tracking-tighter relative z-10">Добавить курс</DialogTitle>
            <Pill className="absolute -right-4 -bottom-4 h-24 w-24 text-slate-950/10 rotate-12" />
          </DialogHeader>
          <div className="p-8 space-y-6 bg-blue-950/40 backdrop-blur-3xl">
             <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-xl border border-white/5">
                   <button onClick={() => setType('medicine')} className={cn("h-10 rounded-lg font-black uppercase text-[10px] transition-all", type === 'medicine' ? "bg-primary text-slate-950 shadow-lg" : "text-white/40")}>ЛЕКАРСТВО</button>
                   <button onClick={() => setType('supplement')} className={cn("h-10 rounded-lg font-black uppercase text-[10px] transition-all", type === 'supplement' ? "bg-primary text-slate-950 shadow-lg" : "text-white/40")}>БАД / ВИТАМИН</button>
                </div>
                <div className="space-y-1">
                   <Label className="text-[10px] font-black uppercase text-white/30 ml-2">Название</Label>
                   <Input placeholder="Напр: Магний B6" value={name} onChange={e => setName(e.target.value)} className="h-14 bg-white/5 border-white/10 rounded-xl font-bold text-lg" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <Label className="text-[10px] font-black uppercase text-white/30 ml-2">Дозировка</Label>
                      <Input placeholder="1" value={dosage} onChange={e => setDosage(e.target.value)} className="h-14 bg-white/5 border-white/10 rounded-xl font-bold text-lg" />
                   </div>
                   <div className="space-y-1">
                      <Label className="text-[10px] font-black uppercase text-white/30 ml-2">Форма</Label>
                      <Select value={form} onValueChange={setForm}>
                         <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-xl"><SelectValue /></SelectTrigger>
                         <SelectContent className="bg-slate-900 border-white/10 text-white"><SelectItem value="таблетки">Таблетки</SelectItem><SelectItem value="капсулы">Капсулы</SelectItem><SelectItem value="сироп">Сироп</SelectItem><SelectItem value="капли">Капли</SelectItem></SelectContent>
                      </Select>
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <Label className="text-[10px] font-black uppercase text-white/30 ml-2">Время приёма</Label>
                      <Input type="time" value={time} onChange={e => setTime(e.target.value)} className="h-14 bg-white/5 border-white/10 rounded-xl font-bold text-xl text-center" />
                   </div>
                   <div className="space-y-1">
                      <Label className="text-[10px] font-black uppercase text-white/30 ml-2">Связь с едой</Label>
                      <Select value={mealRelation} onValueChange={setMealRelation}>
                         <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-xl"><SelectValue /></SelectTrigger>
                         <SelectContent className="bg-slate-900 border-white/10 text-white"><SelectItem value="до еды">До еды</SelectItem><SelectItem value="во время еды">Во время еды</SelectItem><SelectItem value="после еды">После еды</SelectItem><SelectItem value="независимо от еды">Независимо</SelectItem></SelectContent>
                      </Select>
                   </div>
                </div>
             </div>
             <Button onClick={handleAdd} disabled={loading || !name} className="w-full h-18 rounded-2xl bg-primary text-slate-950 font-black text-xl shadow-xl">
                {loading ? <Loader2 className="animate-spin" /> : "СОХРАНИТЬ КУРС"}
             </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
