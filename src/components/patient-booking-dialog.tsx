'use client';

import { useState, useMemo } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogTrigger, DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, updateDoc, doc } from 'firebase/firestore';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { 
  Clock, CheckCircle2, Loader2, 
  Zap, ArrowLeft, CalendarDays, ShieldCheck
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { sendAppNotification } from '@/app/actions/notifications';

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

  const availableSlots = useMemo(() => {
    if (!rawSlots) return [];
    return [...rawSlots].sort((a, b) => a.time.localeCompare(b.time));
  }, [rawSlots]);

  const handleBook = async () => {
    if (!firestore || !user?.uid || !selectedSlotId) return;
    setLoading(true);
    try {
      const targetSlot = availableSlots.find(s => s.id === selectedSlotId);
      const slotRef = doc(firestore, 'appointments', selectedSlotId);
      
      const patientName = (user as any).displayName || (user as any).firstName || 'Пациент';
      
      await updateDoc(slotRef, {
        patientId: user.uid,
        patientName: patientName,
        patientPhoto: (user as any).photoURL || (user as any).photoUrl || '',
        status: 'pending',
        updatedAt: new Date().toISOString()
      });

      sendAppNotification({
        userId: specialistId,
        title: 'Новая заявка на приём',
        message: `Пациент ${patientName} хочет записаться на ${format(selectedDate, 'd MMMM')} в ${targetSlot?.time}.`,
        type: 'appointment'
      });

      setIsSuccess(true);
      toast({ title: 'Заявка отправлена', description: 'Специалист рассмотрит вашу запись в ближайшее время.' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Ошибка бронирования', description: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) { setIsSuccess(false); setSelectedSlotId(null); }
    }}>
      <DialogTrigger asChild>
        <Button className="w-full rounded-2xl h-14 px-8 font-black bg-[#00ffff] text-slate-950 shadow-xl shadow-[#00ffff]/20 transition-all hover:scale-[1.02] active:scale-95 text-lg">
           ЗАПИСАТЬСЯ НА ПРИЁМ
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[98vw] md:max-w-[800px] h-[92vh] md:h-auto max-h-[92vh] rounded-[2rem] md:rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl z-[1200] bg-[#010411] flex flex-col gap-0">
        <DialogHeader className="p-4 md:p-8 bg-primary text-white shrink-0 relative border-b border-white/5">
           <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-[#00ffff]/80 opacity-95" />
           <div className="relative z-10 flex items-center gap-3">
              {!isSuccess && selectedSlotId && (
                <Button variant="ghost" size="icon" className="rounded-full text-slate-950 hover:bg-black/10 h-8 w-8" onClick={() => setSelectedSlotId(null)}><ArrowLeft className="h-5 w-5" /></Button>
              )}
              <div>
                <DialogTitle className="text-lg md:text-3xl font-black tracking-tighter text-slate-950 uppercase leading-none">Запись на приём</DialogTitle>
                <p className="text-slate-950/60 font-black uppercase text-[8px] md:text-sm tracking-widest mt-1">Эксперт: {specialistName}</p>
              </div>
           </div>
           <Zap className="absolute -right-4 -bottom-4 h-16 w-20 text-slate-950/10 rotate-12" />
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 bg-blue-950/40 backdrop-blur-3xl">
          <div className="p-4 md:p-10 pb-10">
            {!isSuccess ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
                 <div className="space-y-4">
                    <h4 className="text-[9px] font-black uppercase text-primary/60 px-2 flex items-center gap-2"><CalendarDays className="h-3 w-3" /> 1. ВЫБЕРИТЕ ДАТУ</h4>
                    <div className="p-1.5 border border-white/10 bg-white/5 rounded-3xl flex justify-center"><Calendar mode="single" selected={selectedDate} onSelect={(date) => { if (date) { setSelectedDate(date); setSelectedSlotId(null); } }} locale={ru} className="scale-90 md:scale-100" /></div>
                 </div>
                 <div className="space-y-4">
                    <h4 className="text-[9px] font-black uppercase text-primary/60 px-2 flex items-center gap-2"><Clock className="h-3 w-3" /> 2. ДОСТУПНОЕ ВРЕМЯ</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 gap-3 pb-4">
                       {slotsLoading ? <div className="col-span-full py-10 text-center"><Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" /></div> : availableSlots.length > 0 ? availableSlots.map((slot) => (
                          <button key={slot.id} onClick={() => setSelectedSlotId(slot.id)} className={cn("h-14 md:h-16 rounded-xl md:rounded-2xl border-2 font-black text-sm md:text-lg transition-all flex items-center justify-center", selectedSlotId === slot.id ? "bg-primary text-slate-950 border-primary shadow-lg" : "bg-white/5 border-white/5 text-white hover:bg-white/10")}>{slot.time}</button>
                       )) : <div className="col-span-full py-10 text-center opacity-30"><Clock className="h-10 w-10 mx-auto" /><p className="text-[9px] font-black uppercase tracking-widest text-white">Нет слотов</p></div>}
                    </div>
                 </div>
              </div>
            ) : (
              <div className="py-10 text-center space-y-8 animate-in zoom-in duration-500">
                 <div className="w-20 h-20 md:w-24 md:h-24 bg-primary rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl rotate-3"><CheckCircle2 className="h-10 w-10 md:h-12 md:w-12 text-slate-950" /></div>
                 <div className="max-w-md mx-auto space-y-4"><h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">Заявка отправлена!</h3><p className="text-xs md:text-sm text-white/50 px-4">Специалист получил ваш запрос на <strong>{format(selectedDate, 'd MMMM')} в {availableSlots.find(s => s.id === selectedSlotId)?.time}</strong>.</p></div>
                 <Button onClick={() => setIsOpen(false)} className="h-14 rounded-xl bg-primary text-slate-950 font-black px-12 uppercase text-xs">ВЕРНУТЬСЯ В ПРОФИЛЬ</Button>
              </div>
            )}
          </div>
        </ScrollArea>

        {!isSuccess && (
          <div className="p-4 md:p-8 bg-black/60 border-t border-white/10 flex items-center justify-between gap-4 sticky bottom-0 z-20 shrink-0">
             <div className="hidden md:flex items-center gap-3 text-white/30"><ShieldCheck className="h-5 w-5" /><span className="text-[9px] font-black uppercase tracking-widest">AES-512 Secure</span></div>
             <div className="flex gap-3 w-full md:w-auto">
                <Button variant="ghost" onClick={() => setIsOpen(false)} className="flex-1 md:flex-none font-bold text-white/60 uppercase text-[10px] h-12 md:h-14">Отмена</Button>
                <Button onClick={handleBook} disabled={loading || !selectedSlotId} className="flex-[2] md:flex-none rounded-xl bg-primary text-slate-950 px-8 md:px-12 font-black h-12 md:h-14 shadow-xl uppercase text-xs md:text-sm">{loading ? <Loader2 className="animate-spin h-5 w-5" /> : "ПОДТВЕРДИТЬ ЗАПИСЬ"}</Button>
             </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
