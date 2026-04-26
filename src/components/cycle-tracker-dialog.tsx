'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  HeartPulse, Zap, Brain, Activity, Smile, Sun, 
  Moon, Battery, Wind, Sparkles, Loader2, CheckCircle2 
} from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface CycleTrackerDialogProps {
  selectedDate: Date;
}

export function CycleTrackerDialog({ selectedDate }: CycleTrackerDialogProps) {
  const { user } = useUser();
  const { firestore } = useFirestore();
  const { toast } = useToast();
  
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Состояние цикла
  const [isCycleActive, setIsCycleActive] = useState(false);
  const [isCycleStart, setIsCycleStart] = useState(false);
  const [isCycleEnd, setIsCycleEnd] = useState(false);
  const [cycleIntensity, setCycleIntensity] = useState('medium');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [energyStatus, setEnergyStatus] = useState('normal'); 

  const handleSave = async () => {
    if (!firestore || !user?.uid) return;
    setLoading(true);
    try {
      const dateKey = format(selectedDate, 'yyyy-MM-dd');
      const docRef = doc(firestore, 'users', user.uid, 'dailyLogs', dateKey);
      
      await setDoc(docRef, {
        date: dateKey,
        updatedAt: serverTimestamp(),
        timestamp: Timestamp.fromDate(selectedDate),
        cycle: {
          intensity: cycleIntensity,
          symptoms: selectedSymptoms,
          energyStatus: energyStatus,
          isStart: Boolean(isCycleStart),
          isEnd: Boolean(isCycleEnd),
          active: isCycleActive
        }
      }, { merge: true });
      
      setIsSuccess(true);
      toast({ title: 'Данные цикла сохранены' });
      
      // Авто-закрытие через 1.5 сек
      setTimeout(() => {
        setIsOpen(false);
        setIsSuccess(false);
      }, 1500);
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Ошибка', description: e.message });
    } finally {
      setLoading(false);
    }
  };

  const energyStates = [
    { id: 'energetic', label: 'Бодрое', icon: Sun, color: 'text-yellow-400' },
    { id: 'normal', label: 'Нормальное', icon: Smile, color: 'text-emerald-400' },
    { id: 'light_fatigue', label: 'Лёгкая усталость', icon: Battery, color: 'text-orange-400' },
    { id: 'fatigue', label: 'Усталость', icon: Moon, color: 'text-blue-400' },
  ];

  const physicalSymptoms = [
    { id: 'cramps', label: 'Тянущая боль', icon: Zap },
    { id: 'back_pain', label: 'Поясница', icon: Wind },
    { id: 'breasts', label: 'Грудь', icon: HeartPulse },
    { id: 'headache', label: 'Голова', icon: Brain },
    { id: 'acne', label: 'Акне', icon: Sparkles },
    { id: 'bloating', label: 'Вздутие', icon: Activity },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="h-10 w-10 flex items-center justify-center rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-500 hover:bg-pink-500/20 transition-all shadow-lg shadow-pink-500/5 group">
          <HeartPulse className="h-5 w-5 group-hover:scale-110 transition-transform" />
        </button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] md:max-w-[500px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl z-[1100] bg-[#010411]">
        <DialogHeader className="p-8 bg-pink-500 text-white shrink-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-600 to-rose-400 opacity-95" />
          <div className="relative z-10">
            <DialogTitle className="text-2xl font-black uppercase tracking-tighter leading-none">Трекер цикла</DialogTitle>
            <p className="text-white/60 font-black uppercase text-[10px] tracking-widest mt-1.5">{format(selectedDate, 'd MMMM yyyy', { locale: ru })}</p>
          </div>
          <HeartPulse className="absolute -right-6 -bottom-6 h-24 w-24 text-white/10 rotate-12" />
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="p-8 space-y-10 bg-pink-950/20 backdrop-blur-3xl min-h-[400px]">
            {!isSuccess ? (
              <>
                <div className="flex items-center justify-between bg-white/5 p-5 rounded-2xl border border-white/5 shadow-inner">
                  <span className="font-black text-[10px] text-pink-200 uppercase tracking-widest">Сегодня день периода?</span>
                  <Button 
                    onClick={() => setIsCycleActive(!isCycleActive)} 
                    className={cn(
                      "rounded-xl h-11 px-8 font-black uppercase text-[11px] transition-all border-2",
                      isCycleActive ? "bg-pink-500 border-pink-400 text-white shadow-lg" : "bg-white/5 border-white/5 text-white/30"
                    )}
                  >
                    {isCycleActive ? 'ДА' : 'НЕТ'}
                  </Button>
                </div>

                {isCycleActive && (
                  <div className="space-y-10 animate-in slide-in-from-top-4 duration-500">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-pink-400/60 px-2 text-center block tracking-widest">Границы периода</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => setIsCycleStart(!isCycleStart)} className={cn("h-14 rounded-2xl font-black uppercase text-[9px] border-2 transition-all", isCycleStart ? "bg-pink-600 border-pink-400 text-white shadow-lg" : "bg-white/5 border-white/5 text-white/20")}>Начало цикла</button>
                        <button onClick={() => setIsCycleEnd(!isCycleEnd)} className={cn("h-14 rounded-2xl font-black uppercase text-[9px] border-2 transition-all", isCycleEnd ? "bg-pink-600 border-pink-400 text-white shadow-lg" : "bg-white/5 border-white/5 text-white/20")}>Конец цикла</button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-pink-400/60 px-2 text-center block tracking-widest">Интенсивность</label>
                      <div className="grid grid-cols-3 gap-3">
                        {['low', 'medium', 'high'].map((val) => (
                          <button key={val} onClick={() => setCycleIntensity(val)} className={cn("h-12 rounded-xl font-black uppercase text-[8px] border-2 transition-all", cycleIntensity === val ? "bg-pink-500 border-pink-400 text-white shadow-md" : "bg-white/5 border-white/5 text-white/20")}>
                            {val === 'low' ? 'Легкая' : val === 'medium' ? 'Средняя' : 'Сильная'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-pink-400/60 px-2 text-center block tracking-widest">Физические симптомы</label>
                      <div className="grid grid-cols-3 gap-3">
                        {physicalSymptoms.map((s) => (
                          <button key={s.id} onClick={() => setSelectedSymptoms(prev => prev.includes(s.id) ? prev.filter(i => i !== s.id) : [...prev, s.id])} className={cn("flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all", selectedSymptoms.includes(s.id) ? "bg-pink-500/20 border-pink-500 text-pink-400 shadow-md" : "bg-white/5 border-white/5 text-white/20")}>
                            <s.icon className={cn("h-5 w-5", selectedSymptoms.includes(s.id) ? "text-pink-400" : "text-white/20")} />
                            <span className="text-[8px] font-black uppercase text-center leading-tight">{s.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-4">
                   <Button className="w-full h-18 rounded-2xl bg-pink-500 text-white font-black text-xl shadow-[0_0_30px_rgba(236,72,153,0.3)] hover:scale-[1.02] transition-all" onClick={handleSave} disabled={loading}>
                     {loading ? <Loader2 className="animate-spin h-6 w-6" /> : 'СОХРАНИТЬ В БАЗУ'}
                   </Button>
                </div>
              </>
            ) : (
              <div className="py-20 flex flex-col items-center text-center space-y-8 animate-in zoom-in duration-500">
                <div className="w-24 h-24 bg-pink-500 rounded-[2rem] flex items-center justify-center shadow-[0_0_50px_rgba(236,72,153,0.5)] rotate-3">
                   <CheckCircle2 className="h-12 w-12 text-white" />
                </div>
                <div>
                   <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Синхронизировано</h3>
                   <p className="text-pink-200/40 text-[10px] font-black uppercase tracking-widest mt-2 text-center">Neural Cycle Sync v4.1</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
