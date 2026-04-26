
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  HeartPulse, Zap, Brain, Activity, Smile, Sun, 
  Moon, Battery, Wind, Sparkles, Loader2, CheckCircle2,
  Droplets, Thermometer, UserCheck, MessageSquare, Flame,
  CalendarDays, Timer
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
  const [periodDuration, setPeriodDuration] = useState('5');
  const [flowIntensity, setFlowIntensity] = useState('medium');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [mood, setMood] = useState<string[]>([]);
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
      setPeriodDuration(c.periodDuration?.toString() || '5');
      setFlowIntensity(c.intensity || 'medium');
      setSelectedSymptoms(c.symptoms || []);
      setMood(c.mood || []);
      setNotes(c.notes || '');
    } else {
      setIsCycleActive(false);
      setIsCycleStart(false);
      setIsCycleEnd(false);
      setPeriodDuration('5');
      setFlowIntensity('medium');
      setSelectedSymptoms([]);
      setMood([]);
      setNotes('');
    }
  }, [existingLog, isOpen]);

  const handleToggleStart = () => {
    const newState = !isCycleStart;
    setIsCycleStart(newState);
    if (newState) setIsCycleActive(true);
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
          periodDuration: isCycleActive ? Number(periodDuration) : null,
          intensity: isCycleActive ? flowIntensity : null,
          symptoms: selectedSymptoms,
          mood: mood,
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
    { id: 'headache', label: 'Голова', icon: Brain },
    { id: 'acne', label: 'Акне', icon: Sparkles },
    { id: 'bloating', label: 'Вздутие', icon: Activity },
    { id: 'back_pain', label: 'Спина', icon: Wind },
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
          <div className="p-6 md:p-10 space-y-8 bg-pink-950/20 backdrop-blur-3xl min-h-[500px]">
            {!isSuccess ? (
              <>
                {/* НАСТРОЙКА ДЛИТЕЛЬНОСТИ */}
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
                  <h4 className="text-[10px] font-black uppercase text-pink-400/60 px-2 tracking-[0.2em] flex items-center gap-2">
                    <Timer className="h-3 w-3" /> Продолжительность периода
                  </h4>
                  <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 space-y-4">
                    <div className="flex items-center gap-4">
                      <Input 
                        type="number" 
                        value={periodDuration} 
                        onChange={(e) => {
                          setPeriodDuration(e.target.value);
                          setIsCycleActive(true);
                        }}
                        className="h-14 bg-black/40 border-pink-500/30 text-white font-black text-2xl text-center rounded-2xl w-24 focus:ring-pink-500/50"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-white uppercase">Дней менструации</p>
                        <p className="text-[9px] text-white/40 uppercase tracking-widest">Столько дней будет гореть маркер в календаре</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[3, 5, 7].map(d => (
                        <Button 
                          key={d}
                          type="button"
                          variant="ghost"
                          onClick={() => { setPeriodDuration(d.toString()); setIsCycleActive(true); }}
                          className={cn("h-10 rounded-xl border border-white/10 text-[10px] font-black uppercase", periodDuration === d.toString() ? "bg-pink-500 text-white border-none shadow-lg" : "text-white/40 hover:bg-white/5")}
                        >
                          {d} дня
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 flex items-center justify-between shadow-inner">
                   <div className="space-y-1">
                      <p className="text-sm font-black text-white uppercase leading-none">Менструация</p>
                      <p className="text-[10px] text-pink-400 font-bold uppercase tracking-widest">Активный статус</p>
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

                <div className="space-y-10">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase text-pink-400/60 px-2 tracking-[0.2em] flex items-center gap-2">
                      <Droplets className="h-3 w-3" /> Интенсивность выделений
                    </h4>
                    <div className="grid grid-cols-4 gap-3">
                      {flowLevels.map((lvl) => (
                        <button 
                          key={lvl.id} 
                          onClick={() => { setFlowIntensity(lvl.id); setIsCycleActive(true); }}
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
                       onClick={handleToggleStart} 
                       className={cn("h-16 rounded-2xl font-black uppercase text-[10px] border-2 flex items-center justify-center gap-2 transition-all", isCycleStart && isCycleActive ? "bg-pink-600 border-pink-400 text-white shadow-xl" : "bg-white/5 border-white/5 text-white/20")}
                     >
                       {isCycleStart && isCycleActive && <CheckCircle2 className="h-4 w-4" />} Начало цикла
                     </button>
                     <button 
                       onClick={() => { setIsCycleEnd(!isCycleEnd); setIsCycleActive(true); }} 
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
                          onClick={() => { setSelectedSymptoms(prev => prev.includes(s.id) ? prev.filter(i => i !== s.id) : [...prev, s.id]); setIsCycleActive(true); }}
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
                     <MessageSquare className="h-3 w-3" /> Личные заметки
                   </h4>
                   <Textarea 
                    placeholder="Как вы себя чувствуете сегодня?"
                    value={notes}
                    onChange={e => { setNotes(e.target.value); setIsCycleActive(true); }}
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
