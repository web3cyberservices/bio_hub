'use client';

import { useState, useMemo } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogTrigger, DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, updateDoc, doc, orderBy } from 'firebase/firestore';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { 
  CalendarDays, Clock, CheckCircle2, Loader2, 
  ArrowRight, ShieldCheck, Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';

interface PatientBookingDialogProps {
  specialistId: string;
  specialistName: string;
}

export function PatientBookingDialog({ specialistId, specialistName }: PatientBookingDialogProps) {
  const { user } = useUser();
  const { firestore } = useFirestore();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const dateKey = format(selectedDate, 'yyyy-MM-dd');

  // Упрощенный запрос без orderBy, чтобы не требовать создания индексов вручную
  const slotsQuery = useMemoFirebase(() => {
    if (!firestore || !specialistId) return null;
    return query(
      collection(firestore, 'appointments'),
      where('specialistId', '==', specialistId),
      where('date', '==', dateKey),
      where('status', '==', 'available')
    );
  }, [firestore, specialistId, dateKey]);

  const { data: rawSlots, isLoading: slotsLoading } = useCollection<any>(slotsQuery);

  // Сортируем слоты на клиенте
  const availableSlots = useMemo(() => {
    if (!rawSlots) return [];
    return [...rawSlots].sort((a, b) => a.time.localeCompare(b.time));
  }, [rawSlots]);

  const handleBook = async () => {
    if (!firestore || !user?.uid || !selectedSlotId) return;
    setLoading(true);
    try {
      const slotRef = doc(firestore, 'appointments', selectedSlotId);
      await updateDoc(slotRef, {
        patientId: user.uid,
        patientName: (user as any).displayName || 'Пациент',
        status: 'pending',
        updatedAt: new Date().toISOString()
      });
      setIsSuccess(true);
      toast({ title: 'Заявка отправлена', description: 'Специалист рассмотрит вашу запись в ближайшее время.' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Ошибка бронирования', description: e.message });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setIsSuccess(false);
    setSelectedSlotId(null);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-2xl h-14 px-8 font-black bg-primary text-slate-950 shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
           Записаться на прием
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] md:max-w-[800px] rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl z-[1200] bg-[#010411]">
        <DialogHeader className="p-8 bg-primary text-white relative border-b border-white/5">
           <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-[#00ffff]/80 opacity-90" />
           <div className="relative z-10">
              <DialogTitle className="text-2xl md:text-3xl font-black tracking-tighter text-slate-950 uppercase">Запись к специалисту</DialogTitle>
              <p className="text-slate-950/60 font-black uppercase text-xs md:text-sm tracking-widest mt-1">Эксперт: {specialistName}</p>
           </div>
           <Zap className="absolute -right-4 -bottom-4 h-24 w-24 text-slate-950/10 rotate-12" />
        </DialogHeader>

        <div className="p-6 md:p-10 bg-blue-950/40 backdrop-blur-3xl">
          {!isSuccess ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
               <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase text-primary/60 px-2 flex items-center gap-2">
                     <CalendarDays className="h-4 w-4" /> 1. Выберите дату
                  </h4>
                  <div className="p-4 border border-white/10 bg-white/5 rounded-3xl shadow-inner">
                     <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        locale={ru}
                        className="w-full"
                     />
                  </div>
               </div>

               <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase text-primary/60 px-2 flex items-center gap-2">
                     <Clock className="h-4 w-4" /> 2. Доступное время
                  </h4>
                  <ScrollArea className="h-[300px] pr-4">
                     <div className="grid grid-cols-2 gap-3">
                        {slotsLoading ? (
                          <div className="col-span-full py-20 text-center">
                             <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto opacity-20" />
                          </div>
                        ) : availableSlots && availableSlots.length > 0 ? (
                          availableSlots.map((slot) => (
                             <button
                               key={slot.id}
                               onClick={() => setSelectedSlotId(slot.id)}
                               className={cn(
                                 "h-16 rounded-2xl border-2 font-black text-lg transition-all flex items-center justify-center gap-2",
                                 selectedSlotId === slot.id 
                                   ? "bg-primary text-slate-950 border-primary shadow-[0_0_20px_rgba(0,255,255,0.3)]" 
                                   : "bg-white/5 border-white/5 text-white hover:bg-white/10"
                               )}
                             >
                                {slot.time}
                             </button>
                          ))
                        ) : (
                          <div className="col-span-full py-20 text-center space-y-4 opacity-30">
                             <Clock className="h-12 w-12 mx-auto" />
                             <p className="text-[10px] font-black uppercase tracking-widest text-white">Нет доступных слотов на эту дату</p>
                          </div>
                        )}
                     </div>
                  </ScrollArea>
               </div>
            </div>
          ) : (
            <div className="py-20 text-center space-y-8 animate-in zoom-in duration-500">
               <div className="w-24 h-24 bg-primary rounded-[2rem] flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(0,255,255,0.4)] rotate-3">
                  <CheckCircle2 className="h-12 w-12 text-slate-950" />
               </div>
               <div className="max-w-md mx-auto space-y-4">
                  <h3 className="text-3xl font-black text-white uppercase tracking-tight">Заявка отправлена!</h3>
                  <p className="text-sm text-white/50 font-medium leading-relaxed">
                     Специалист {specialistName} получил ваш запрос на <strong>{format(selectedDate, 'd MMMM')} в {availableSlots?.find(s => s.id === selectedSlotId)?.time}</strong>. 
                     Как только запись будет подтверждена, статус обновится в вашем кабинете.
                  </p>
               </div>
               <Button onClick={reset} className="h-14 rounded-xl bg-primary text-slate-950 font-black px-12">ОТЛИЧНО</Button>
            </div>
          )}
        </div>

        {!isSuccess && (
          <DialogFooter className="p-8 bg-blue-950/60 border-t border-white/5 flex items-center justify-between gap-6">
             <div className="hidden md:flex items-center gap-3 text-white/30">
                <ShieldCheck className="h-5 w-5" />
                <span className="text-[9px] font-black uppercase tracking-widest">Безопасное бронирование</span>
             </div>
             <div className="flex gap-4 w-full md:w-auto">
                <Button variant="ghost" onClick={() => setIsOpen(false)} className="flex-1 md:flex-none font-bold text-white/60">Отмена</Button>
                <Button 
                  onClick={handleBook} 
                  disabled={loading || !selectedSlotId} 
                  className="flex-1 md:flex-none rounded-xl bg-primary text-slate-950 px-10 font-black h-12 shadow-xl"
                >
                   {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "ПОДТВЕРДИТЬ ЗАПИСЬ"}
                </Button>
             </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}