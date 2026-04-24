
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
  CheckCircle2, Trash2
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

  // Запрос всех слотов специалиста
  const appointmentsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(
      collection(firestore, 'appointments'),
      where('specialistId', '==', user.uid),
      orderBy('date', 'asc'),
      orderBy('time', 'asc')
    );
  }, [firestore, user?.uid]);

  const { data: appointments, isLoading } = useCollection<any>(appointmentsQuery);

  const dailySlots = useMemo(() => {
    return appointments?.filter(a => a.date === dateKey) || [];
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
        <div className="lg:col-span-4 space-y-6">
           <Card className="cyber-card p-6 border-none bg-blue-950/40 backdrop-blur-xl">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                locale={ru}
                className="w-full h-full"
              />
           </Card>

           <Card className="cyber-card p-6 border-none bg-blue-950/40 backdrop-blur-xl space-y-4">
              <h3 className="text-sm font-black uppercase text-primary flex items-center gap-2">
                 <Plus className="h-4 w-4" /> Добавить время
              </h3>
              <div className="flex gap-2">
                 <input 
                   type="time" 
                   value={newSlotTime}
                   onChange={e => setNewSlotTime(e.target.value)}
                   className="flex-1 h-12 bg-white/5 border border-white/10 rounded-xl px-4 font-black text-white outline-none focus:border-primary transition-colors"
                 />
                 <Button onClick={handleAddSlot} disabled={loading} className="h-12 rounded-xl bg-primary text-slate-950 px-6 font-black shadow-lg">
                    ОТКРЫТЬ
                 </Button>
              </div>
              <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Выберите дату в календаре и время для записи</p>
           </Card>
        </div>

        {/* Requests and Slots Column */}
        <div className="lg:col-span-8 space-y-8">
           {/* Pending Section */}
           {pendingRequests.length > 0 && (
             <div className="space-y-4">
                <h3 className="text-xs font-black uppercase text-accent flex items-center gap-2 px-2">
                   <AlertCircle className="h-4 w-4 animate-pulse" /> Новые заявки на прием ({pendingRequests.length})
                </h3>
                <div className="grid gap-3">
                   {pendingRequests.map((req) => (
                     <Card key={req.id} className="cyber-card p-4 border-accent/20 bg-accent/5 flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                              <User className="h-6 w-6" />
                           </div>
                           <div>
                              <p className="font-black text-white text-sm uppercase">{req.patientName || 'Анонимный пациент'}</p>
                              <div className="flex items-center gap-2 mt-1">
                                 <Badge variant="outline" className="text-[8px] border-white/10 text-white/40">{format(new Date(req.date), 'd MMM')}</Badge>
                                 <Badge className="bg-accent text-black text-[9px] font-black px-2">{req.time}</Badge>
                              </div>
                           </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <Button 
                             onClick={() => handleStatusChange(req.id, 'confirmed')} 
                             className="h-10 w-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg"
                             size="icon"
                           >
                              <Check className="h-5 w-5" />
                           </Button>
                           <Button 
                             onClick={() => handleStatusChange(req.id, 'rejected')} 
                             variant="destructive"
                             className="h-10 w-10 rounded-xl shadow-lg"
                             size="icon"
                           >
                              <X className="h-5 w-5" />
                           </Button>
                        </div>
                     </Card>
                   ))}
                </div>
             </div>
           )}

           {/* Daily Slots List */}
           <div className="space-y-4">
              <h3 className="text-xs font-black uppercase text-white/40 flex items-center gap-2 px-2">
                 <CalendarDays className="h-4 w-4" /> Слоты на {format(selectedDate, 'd MMMM', { locale: ru })}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {dailySlots.map((slot) => (
                   <Card key={slot.id} className={cn(
                     "cyber-card p-5 border-none transition-all group",
                     slot.status === 'confirmed' ? "bg-emerald-500/10 border-emerald-500/20" : 
                     slot.status === 'pending' ? "bg-accent/10 border-accent/20" : "bg-white/5"
                   )}>
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <Clock className={cn("h-5 w-5", slot.status === 'confirmed' ? "text-emerald-500" : "text-primary")} />
                            <span className="text-xl font-black text-white">{slot.time}</span>
                         </div>
                         <div className="flex items-center gap-2">
                            {slot.status === 'available' ? (
                               <Badge className="bg-primary/20 text-primary border-none text-[8px] font-black">СВОБОДНО</Badge>
                            ) : slot.status === 'confirmed' ? (
                               <Badge className="bg-emerald-500 text-white border-none text-[8px] font-black">ПОДТВЕРЖДЕНО</Badge>
                            ) : (
                               <Badge className="bg-accent text-black border-none text-[8px] font-black">ОЖИДАНИЕ</Badge>
                            )}
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteSlot(slot.id)} className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 text-white/20 hover:text-destructive">
                               <Trash2 className="h-4 w-4" />
                            </Button>
                         </div>
                      </div>
                      {slot.status !== 'available' && (
                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                              <User className="h-4 w-4 text-white/40" />
                           </div>
                           <p className="text-[11px] font-bold text-white/60 truncate uppercase">{slot.patientName || 'Загрузка...'}</p>
                        </div>
                      )}
                   </Card>
                 ))}
                 {dailySlots.length === 0 && (
                   <div className="col-span-full py-16 text-center bg-white/[0.02] border-2 border-dashed border-white/5 rounded-3xl">
                      <Clock className="h-10 w-10 text-white/10 mx-auto mb-4" />
                      <p className="text-xs font-black uppercase text-white/20">Нет открытых слотов на этот день</p>
                   </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
