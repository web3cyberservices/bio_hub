'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { 
  HeartPulse, Zap, Brain, Activity, Smile, Sun, 
  Moon, Battery, Wind, Sparkles, Loader2, CheckCircle2,
  Droplets, Thermometer, UserCheck, MessageSquare, Flame
} from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
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

  const [isCycleActive, setIsCycleActive] = useState(false);
  const [isCycleStart, setIsCycleStart] = useState(false);
  const [isCycleEnd, setIsCycleEnd] = useState(false);
  const [flowIntensity, setFlowIntensity] = useState('medium');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [mood, setMood] = useState<string[]>([]);
  const [sexActivity, setSexActivity] = useState<'none' | 'protected' | 'unprotected'>('none');
  const [notes, setNotes] = useState('');

  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  const logRef = useMemoFirebase(() => user?.uid ? doc(firestore!, 'users', user.uid, 'dailyLogs', dateKey) : null, [user?.uid, dateKey]);
  const { data: existingLog } = useDoc<any>(logRef);

  useEffect(() => {
    if (existingLog?.cycle) {
      const c = existingLog.cycle;
      setIsCycleActive(c.active || false);
      setIsCycleStart(c.isStart || false);
      setIsCycleEnd(c.isEnd || false);
      setFlowIntensity(c.intensity || 'medium');
      setSelectedSymptoms(c.symptoms || []);
      setMood(c.mood || []);
      setSexActivity(c.sex || 'none');
      setNotes(c.notes || '');
    } else {
      setIsCycleActive(false);
      setIsCycleStart(false);
      setIsCycleEnd(false);
      setFlowIntensity('medium');
      setSelectedSymptoms([]);
      setMood([]);
      setSexActivity('none');
      setNotes('');
    }
  }, [existingLog, isOpen]);

  // Хелпер для авто-активации цикла при выборе любого параметра
  const activateCycle = () => {
    if (!isCycleActive) setIsCycleActive(true);
  };

  const handleSave = async () => {
    if (!firestore || !user?.uid) return;
    setLoading(true);
    try {
      await setDoc(doc(firestore, 'users', user.uid, 'dailyLogs', dateKey), {
        date: dateKey,
        updatedAt: serverTimestamp(),
        timestamp: Timestamp.fromDate(selectedDate),
        cycle: {
          active: isCycleActive,
          isStart: isCycleActive ? isCycleStart : false,
          isEnd: isCycleActive ? isCycleEnd : false,
          intensity: isCycleActive ? flowIntensity : null,
          symptoms: selectedSymptoms,
          mood: mood,
          sex: sexActivity,
          notes: notes
        }
      }, { merge: true });
      
      setIsSuccess(true);
      toast({ title: 'Данные цикла обновлены' });
      setTimeout(() => {
        setIsOpen(false);
        setIsSuccess(false);
      }, 1500);
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Ошибка сохранения', description: e.message });
    } finally {
      setLoading(false);
    }
  };

  const flowLevels = [
    { id: 'spotting', label: 'Мажущие', color: 'bg-rose-300' },
    { id: 'light', label: 'Легкие', color: 'bg-rose-400' },
    { id: 'medium', label: 'Средние', color: 'bg-rose-500' },
    { id: 'heavy', label: 'Сильные', color: 'bg-rose-700' },
  ];

  const symptomList = [
    { id: 'cramps', label: 'Спазмы', icon: Zap },
    { id: 'tender_breasts', label: 'Грудь', icon: HeartPulse },
    { id: 'headache', label: 'Глова', icon: Brain },
    { id: 'acne', label: 'Акне', icon: Sparkles },
    { id: 'bloating', label: 'Вздутие', icon: Activity },
    { id: 'back_pain', label: 'Спина', icon: Wind },
  ];

  const moodList = [
    { id: 'happy', label: 'Радость', icon: Sun },
    { id: 'irritable', label: 'Гнев', icon: Flame },
    { id: 'anxious', label: 'Тревога', icon: Activity },
    { id: 'tired', label: 'Усталость', icon: Moon },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="h-10 w-10 flex items-center justify-center rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-500 hover:bg-pink-500/20 transition-all shadow-lg shadow-pink-500/5 group">
          <HeartPulse className="h-5 w-5 group-hover:scale-110 transition-transform" />
        </button>
      </DialogTrigger>
      <DialogContent className="w-[98vw] md:max-w-[600px] rounded-[2.5rem] md:rounded-[3.5rem] p-0 overflow-hidden border-none shadow-2xl z-[1100] bg-[#010411]">
        <DialogHeader className="p-8 md:p-10 bg-pink-500 text-white shrink-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-600 to-rose-400 opacity-95" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <DialogTitle className="text-3xl font-black uppercase tracking-tighter leading-none">Bio-Cycle Pro</DialogTitle>
              <p className="text-white/60 font-black uppercase text-[10px] tracking-widest mt-2">{format(selectedDate, 'd MMMM yyyy', { locale: ru })}</p>
            </div>
          </div>
          <HeartPulse className="absolute -right-8 -bottom-8 h-32 w-32 text-white/10 rotate-12" />
        </DialogHeader>

        <ScrollArea className="max-h-[75vh]">
          <div className="p-6 md:p-10 space-y-10 bg-pink-950/20 backdrop-blur-3xl min-h-[500px]">
            {!isSuccess ? (
              <>
                <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 flex items-center justify-between shadow-inner">
                   <div className="space-y-1">
                      <p className="text-sm font-black text-white uppercase leading-none">Менструация</p>
                      <p className="text-[10px] text-pink-400 font-bold uppercase tracking-widest">Отметьте день периода</p>
                   </div>
                   <Button 
                    onClick={() => setIsCycleActive(!isCycleActive)} 
                    className={cn(
                      "rounded-2xl h-14 px-10 font-black uppercase transition-all border-4",
                      isCycleActive ? "bg-pink-500 border-pink-400 text-white shadow-xl scale-105" : "bg-white/5 border-white/5 text-white/20"
                    )}
                  >
                    {isCycleActive ? 'ИДЁТ' : 'НЕТ'}
                  </Button>
                </div>

                <div className="space-y-10 animate-in slide-in-from-top-4 duration-500">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase text-pink-400/60 px-2 tracking-[0.2em] flex items-center gap-2">
                      <Droplets className="h-3 w-3" /> Интенсивность выделений
                    </h4>
                    <div className="grid grid-cols-4 gap-3">
                      {flowLevels.map((lvl) => (
                        <button 
                          key={lvl.id} 
                          onClick={() => { setFlowIntensity(lvl.id); activateCycle(); }}
                          className={cn(
                            "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all",
                            flowIntensity === lvl.id && isCycleActive ? "bg-pink-500/20 border-pink-500 shadow-lg" : "bg-white/5 border-white/5"
                          )}
                        >
                          <div className={cn("w-3 h-3 rounded-full shadow-sm", lvl.color)} />
                          <span className={cn("text-[8px] font-black uppercase", flowIntensity === lvl.id && isCycleActive ? "text-pink-400" : "text-white/30")}>
                            {lvl.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <button 
                       onClick={() => { setIsCycleStart(!isCycleStart); activateCycle(); }} 
                       className={cn("h-16 rounded-2xl font-black uppercase text-[10px] border-2 flex items-center justify-center gap-2 transition-all", isCycleStart && isCycleActive ? "bg-pink-600 border-pink-400 text-white shadow-xl" : "bg-white/5 border-white/5 text-white/20")}
                     >
                       {isCycleStart && isCycleActive && <CheckCircle2 className="h-4 w-4" />} Начало цикла
                     </button>
                     <button 
                       onClick={() => { setIsCycleEnd(!isCycleEnd); activateCycle(); }} 
                       className={cn("h-16 rounded-2xl font-black uppercase text-[10px] border-2 flex items-center justify-center gap-2 transition-all", isCycleEnd && isCycleActive ? "bg-pink-600 border-pink-400 text-white shadow-xl" : "bg-white/5 border-white/5 text-white/20")}
                     >
                       {isCycleEnd && isCycleActive && <CheckCircle2 className="h-4 w-4" />} Конец цикла
                     </button>
                  </div>
                </div>

                <div className="space-y-4">
                   <h4 className="text-[10px] font-black uppercase text-pink-400/60 px-2 tracking-[0.2em] flex items-center gap-2">
                     <Thermometer className="h-3 w-3" /> Физические симптомы
                   </h4>
                   <div className="grid grid-cols-3 gap-3">
                      {symptomList.map((s) => (
                        <button 
                          key={s.id} 
                          onClick={() => { setSelectedSymptoms(prev => prev.includes(s.id) ? prev.filter(i => i !== s.id) : [...prev, s.id]); activateCycle(); }}
                          className={cn(
                            "flex flex-col items-center justify-center gap-3 p-5 rounded-[1.5rem] border-2 transition-all",
                            selectedSymptoms.includes(s.id) ? "bg-pink-500/20 border-pink-500 text-pink-400 shadow-inner" : "bg-white/5 border-white/5 text-white/20"
                          )}
                        >
                          <s.icon className="h-6 w-6" />
                          <span className="text-[9px] font-black uppercase text-center leading-none">{s.label}</span>
                        </button>
                      ))}
                   </div>
                </div>

                <div className="space-y-4">
                   <h4 className="text-[10px] font-black uppercase text-pink-400/60 px-2 tracking-[0.2em] flex items-center gap-2">
                     <Smile className="h-3 w-3" /> Эмоции
                   </h4>
                   <div className="grid grid-cols-4 gap-3">
                      {moodList.map((m) => (
                        <button 
                          key={m.id} 
                          onClick={() => { setMood(prev => prev.includes(m.id) ? prev.filter(i => i !== m.id) : [...prev, m.id]); activateCycle(); }}
                          className={cn(
                            "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all",
                            mood.includes(m.id) ? "bg-pink-500/20 border-pink-500 text-pink-400" : "bg-white/5 border-white/5 text-white/20"
                          )}
                        >
                          <m.icon className="h-5 w-5" />
                          <span className="text-[8px] font-black uppercase">{m.label}</span>
                        </button>
                      ))}
                   </div>
                </div>

                <div className="space-y-4">
                   <h4 className="text-[10px] font-black uppercase text-pink-400/60 px-2 tracking-[0.2em] flex items-center gap-2">
                     <MessageSquare className="h-3 w-3" /> Личные заметки
                   </h4>
                   <Textarea 
                    placeholder="Как вы себя чувствуете сегодня?"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="min-h-[100px] rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-white/20 text-sm font-medium resize-none shadow-inner"
                   />
                </div>

                <div className="pt-6">
                   <Button 
                    className="w-full h-20 rounded-3xl bg-pink-500 text-white font-black text-xl shadow-[0_20px_50px_rgba(236,72,153,0.3)] hover:scale-[1.02] transition-all"
                    onClick={handleSave}
                    disabled={loading}
                   >
                     {loading ? <Loader2 className="animate-spin h-7 w-7" /> : 'СИНХРОНИЗИРОВАТЬ ДАННЫЕ'}
                   </Button>
                </div>
              </>
            ) : (
              <div className="py-24 flex flex-col items-center text-center space-y-8 animate-in zoom-in duration-500">
                <div className="w-32 h-32 bg-pink-500 rounded-[2.5rem] flex items-center justify-center shadow-[0_0_70px_rgba(236,72,153,0.6)] rotate-3">
                   <CheckCircle2 className="h-16 w-16 text-white" />
                </div>
                <div>
                   <h3 className="text-4xl font-black text-white uppercase tracking-tighter">Синхронизировано</h3>
                   <p className="text-pink-300/40 text-[10px] font-black uppercase tracking-[0.4em] mt-3">Bio-Cycle Engine Updated</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
