'use client';

import { useState, useMemo } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, addDoc, updateDoc, doc, deleteDoc, orderBy } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { 
  Clock, Plus, Check, X, Loader2, 
  CalendarDays, User, AlertCircle, 
  CheckCircle2, Trash2, Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

export function SpecialistBookingManager() {
  const { user } = useUser();
  const { firestore } = useFirestore();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [newSlotTime, setNewSlotTime] = useState('10:00');

  const dateKey = format(selectedDate, 'yyyy-MM-dd');

  const appointmentsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(
      collection(firestore, 'appointments'),
      where('specialistId', '==', user.uid),
      orderBy('date', 'asc')
    );
  }, [firestore, user?.uid]);

  const { data: appointments, isLoading } = useCollection<any>(appointmentsQuery);

  const dailySlots = useMemo(() => {
    return appointments?.filter(a => a.date === dateKey).sort((a: any, b: any) => a.time.localeCompare(b.time)) || [];
  }, [appointments, dateKey]);

  const pendingRequests = useMemo(() => {
    return appointments?.filter(a => a.status === 'pending') || [];
  }, [appointments]);

  const handleAddSlot = async () => {
    if (!firestore || !user?.uid) return;
    setLoading(true);
    try {
      await addDoc(collection(firestore, 'appointments'), {
        specialistId: user.uid,
        date: dateKey,
        time: newSlotTime,
        status: 'available',
        createdAt: new Date().toISOString()
      });
      toast({ title: 'Слот добавлен', description: `Вы открыли запись на ${newSlotTime}` });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Ошибка', description: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: 'confirmed' | 'rejected' | 'available') => {
    if (!firestore) return;
    try {
      const appRef = doc(firestore, 'appointments', id);
      await updateDoc(appRef, { status, updatedAt: new Date().toISOString() });
      toast({ title: status === 'confirmed' ? 'Запись подтверждена' : 'Статус обновлен' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Ошибка', description: e.message });
    }
  };

  const handleDeleteSlot = async (id: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, 'appointments', id));
      toast({ title: 'Слот удален' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Ошибка' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="text-center md:text-left space-y-2">
         <Badge className="bg-primary text-black font-black uppercase text-[10px] px-4">Bio-Scheduler Pro</Badge>
         <h2 className="text-4xl font-black tracking-tighter text-white uppercase leading-none">Управление расписанием</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Calendar Column */}
        <div className="lg:col-span-5 space-y-6">
           <Card className="cyber-card p-6 border-blue-500/30 bg-blue-900/20 shadow-2xl">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                locale={ru}
                className="w-full"
              />
           </Card>

           <Card className="cyber-card p-8 border-blue-500/30 bg-blue-900/20 space-y-6">
              <h3 className="text-sm font-black uppercase text-primary flex items-center gap-2">
                 <Plus className="h-5 w-5" /> Открыть время
              </h3>
              <div className="flex gap-3">
                 <input 
                   type="time" 
                   value={newSlotTime}
                   onChange={e => setNewSlotTime(e.target.value)}
                   className="flex-1 h-14 bg-white/10 border border-white/10 rounded-2xl px-6 font-black text-xl text-white outline-none focus:border-primary transition-all shadow-inner"
                 />
                 <Button onClick={handleAddSlot} disabled={loading} className="h-14 rounded-2xl bg-primary text-slate-950 px-8 font-black shadow-xl hover:scale-105 active:scale-95 transition-all">
                    ДОБАВИТЬ
                 </Button>
              </div>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-relaxed">Выберите дату в календаре и введите время, чтобы пациенты могли записаться.</p>
           </Card>
        </div>

        {/* Requests and Slots Column */}
        <div className="lg:col-span-7 space-y-10">
           {/* Pending Section */}
           {pendingRequests.length > 0 && (
             <div className="space-y-4">
                <h3 className="text-xs font-black uppercase text-accent flex items-center gap-2 px-2">
                   <AlertCircle className="h-4 w-4 animate-pulse" /> Новые заявки ({pendingRequests.length})
                </h3>
                <div className="grid gap-4">
                   {pendingRequests.map((req) => (
                     <Card key={req.id} className="cyber-card p-5 border-accent/30 bg-accent/5 flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                           <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent border border-accent/20">
                              <User className="h-7 w-7" />
                           </div>
                           <div>
                              <p className="font-black text-white text-base uppercase">{req.patientName || 'Анонимный пациент'}</p>
                              <div className="flex items-center gap-2 mt-1">
                                 <Badge variant="outline" className="text-[9px] border-white/10 text-white/50">{format(new Date(req.date), 'd MMM')}</Badge>
                                 <Badge className="bg-accent text-black text-[10px] font-black px-3">{req.time}</Badge>
                              </div>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <Button 
                             onClick={() => handleStatusChange(req.id, 'confirmed')} 
                             className="h-12 w-12 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg transition-transform hover:scale-110"
                             size="icon"
                           >
                              <Check className="h-6 w-6" />
                           </Button>
                           <Button 
                             onClick={() => handleStatusChange(req.id, 'rejected')} 
                             variant="destructive"
                             className="h-12 w-12 rounded-2xl shadow-lg transition-transform hover:scale-110"
                             size="icon"
                           >
                              <X className="h-6 w-6" />
                           </Button>
                        </div>
                     </Card>
                   ))}
                </div>
             </div>
           )}

           {/* Daily Slots List */}
           <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                 <h3 className="text-sm font-black uppercase text-white/50 flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" /> Расписание на {format(selectedDate, 'd MMMM', { locale: ru })}
                 </h3>
                 <Badge variant="outline" className="text-[10px] border-primary/20 text-primary/60">{dailySlots.length} слотов</Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                 {dailySlots.map((slot) => (
                   <Card key={slot.id} className={cn(
                     "cyber-card p-6 border-none transition-all group relative overflow-hidden",
                     slot.status === 'confirmed' ? "bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]" : 
                     slot.status === 'pending' ? "bg-accent/10 border-accent/20" : "bg-blue-900/20"
                   )}>
                      <div className="flex items-center justify-between relative z-10">
                         <div className="flex items-center gap-4">
                            <Clock className={cn("h-6 w-6", slot.status === 'confirmed' ? "text-emerald-500" : "text-primary")} />
                            <span className="text-2xl font-black text-white">{slot.time}</span>
                         </div>
                         <div className="flex items-center gap-2">
                            {slot.status === 'available' ? (
                               <Badge className="bg-primary/20 text-primary border-none text-[9px] font-black px-3">СВОБОДНО</Badge>
                            ) : slot.status === 'confirmed' ? (
                               <Badge className="bg-emerald-500 text-white border-none text-[9px] font-black px-3">УТВЕРЖДЕНО</Badge>
                            ) : (
                               <Badge className="bg-accent text-black border-none text-[9px] font-black px-3">ОЖИДАНИЕ</Badge>
                            )}
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteSlot(slot.id)} className="h-9 w-9 rounded-xl opacity-0 group-hover:opacity-100 text-white/30 hover:text-destructive hover:bg-destructive/10 transition-all">
                               <Trash2 className="h-5 w-5" />
                            </Button>
                         </div>
                      </div>
                      {slot.status !== 'available' && (
                        <div className="mt-5 pt-5 border-t border-white/5 flex items-center gap-4 relative z-10">
                           <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                              <User className="h-5 w-5 text-white/40" />
                           </div>
                           <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-black text-white/70 truncate uppercase tracking-tight">{slot.patientName || 'Загрузка...'}</p>
                              <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Пациент</p>
                           </div>
                        </div>
                      )}
                      {slot.status === 'confirmed' && <Zap className="absolute -right-4 -bottom-4 h-16 w-16 text-emerald-500/5 rotate-12" />}
                   </Card>
                 ))}
                 {dailySlots.length === 0 && (
                   <div className="col-span-full py-20 text-center bg-blue-900/10 border-2 border-dashed border-blue-500/10 rounded-[2.5rem]">
                      <Clock className="h-12 w-12 text-white/10 mx-auto mb-4" />
                      <p className="text-sm font-black uppercase text-white/30 tracking-[0.2em]">Нет записей на этот день</p>
                   </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
