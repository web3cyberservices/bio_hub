
'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Timer, Zap, Flame, Droplets, 
  Play, Square, ChevronRight, Info,
  Loader2, CheckCircle2, History
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { format } from 'date-fns';

export function FastingHub() {
  const { user } = useUser();
  const { firestore } = useFirestore();
  const { toast } = useToast();
  
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [mode, setMode] = useState<'16/8' | '14/10' | '18/6' | '12/12'>('16/8');
  const [phase, setPhase] = useState('Пищеварение');

  const modes = {
    '12/12': 12, '14/10': 14, '16/8': 16, '18/6': 18
  };

  const userDocRef = useMemoFirebase(() => user ? doc(firestore!, 'users', user.uid) : null, [user, firestore]);
  const { data: userData } = useDoc<any>(userDocRef);

  useEffect(() => {
    if (userData?.activeFasting) {
      setStartTime(userData.activeFasting.start);
      setMode(userData.activeFasting.mode);
      setIsActive(true);
    }
  }, [userData]);

  useEffect(() => {
    if (!isActive || !startTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - startTime;
      const total = modes[mode] * 3600000;
      const remaining = Math.max(0, total - elapsed);
      
      setTimeLeft(remaining);
      
      // Логика фаз
      const hoursElapsed = elapsed / 3600000;
      if (hoursElapsed < 2) setPhase('Пищеварение');
      else if (hoursElapsed < 8) setPhase('Сжигание сахара');
      else if (hoursElapsed < 12) setPhase('Кетоз');
      else setPhase('Аутофагия');

      if (remaining === 0) {
        setIsActive(false);
        toast({ title: 'Голодание завершено!', description: 'Вы достигли цели.' });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, startTime, mode]);

  const handleStart = async () => {
    if (!user || !firestore) return;
    const start = Date.now();
    try {
      await setDoc(doc(firestore, 'users', user.uid), {
        activeFasting: { start, mode, createdAt: new Date().toISOString() }
      }, { merge: true });
      setStartTime(start);
      setIsActive(true);
      toast({ title: 'Таймер запущен' });
    } catch (e) { toast({ variant: 'destructive', title: 'Ошибка доступа' }); }
  };

  const handleStop = async () => {
    if (!user || !firestore) return;
    try {
      await setDoc(doc(firestore, 'users', user.uid), { activeFasting: null }, { merge: true });
      setIsActive(false);
      setStartTime(null);
      toast({ title: 'Таймер остановлен' });
    } catch (e) { toast({ variant: 'destructive', title: 'Ошибка' }); }
  };

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const mins = Math.floor((ms % 3600000) / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = startTime ? Math.min(100, ((Date.now() - startTime) / (modes[mode] * 3600000)) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-32 px-4">
      <div className="text-center space-y-2">
         <Badge className="bg-primary/20 text-primary border-none text-[8px] font-black uppercase px-6">Bio-Rhythm Engine</Badge>
         <h2 className="text-4xl font-black text-white tracking-tighter uppercase">Интервальное голодание</h2>
      </div>

      <Card className="cyber-card p-10 bg-blue-950/40 border-none relative overflow-hidden flex flex-col items-center text-center gap-10">
         <div className="relative z-10 space-y-6 w-full">
            <div className="flex justify-center gap-3">
               {(Object.keys(modes) as (keyof typeof modes)[]).map(m => (
                  <button key={m} onClick={() => !isActive && setMode(m)} className={cn("px-6 py-2.5 rounded-xl font-black text-[10px] transition-all border-2", mode === m ? "bg-primary border-primary text-slate-950 shadow-lg" : "bg-white/5 border-white/5 text-white/40")}>{m}</button>
               ))}
            </div>

            <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
               <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle cx="50%" cy="50%" r="46%" fill="none" stroke="white" strokeOpacity="0.05" strokeWidth="4" />
                  <circle cx="50%" cy="50%" r="46%" fill="none" stroke="currentColor" strokeWidth="6" strokeDasharray="100" strokeDashoffset={100 - progress} pathLength="100" strokeLinecap="round" className="text-primary transition-all duration-1000 drop-shadow-[0_0_15px_rgba(0,255,255,0.6)]" />
               </svg>
               <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">{isActive ? 'ДО ОКОНЧАНИЯ' : 'ГОТОВ К ЗАПУСКУ'}</span>
                  <span className="text-5xl font-black text-white tabular-nums">{isActive ? formatTime(timeLeft) : `${modes[mode]}:00:00`}</span>
                  {isActive && <Badge className="bg-primary/10 text-primary border-none mt-2 font-black uppercase text-[8px]">{phase}</Badge>}
               </div>
            </div>

            <div className="flex justify-center gap-4">
               {!isActive ? (
                  <Button onClick={handleStart} className="h-16 px-12 rounded-2xl bg-primary text-slate-950 font-black text-xl shadow-2xl hover:scale-105 transition-all"><Play className="mr-3 h-6 w-6" /> НАЧАТЬ</Button>
               ) : (
                  <Button onClick={handleStop} variant="destructive" className="h-16 px-12 rounded-2xl font-black text-xl shadow-2xl hover:scale-105 transition-all"><Square className="mr-3 h-6 w-6" /> ЗАВЕРШИТЬ</Button>
               )}
            </div>
         </div>
         <Timer className="absolute -right-10 -bottom-10 h-48 w-48 text-primary/5 rotate-12" />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <Card className="cyber-card p-8 bg-emerald-500/5 border-emerald-500/20 flex items-start gap-5 shadow-inner">
            <Flame className="h-8 w-8 text-emerald-400 shrink-0 mt-1" />
            <div className="space-y-2">
               <h4 className="font-black text-white uppercase text-sm">Метаболический эффект</h4>
               <p className="text-xs text-white/50 leading-relaxed font-medium">Через 12 часов голодания уровень инсулина падает, и организм начинает активнее использовать жировые запасы в качестве энергии.</p>
            </div>
         </Card>
         <Card className="cyber-card p-8 bg-blue-500/5 border-blue-500/20 flex items-start gap-5 shadow-inner">
            <Droplets className="h-8 w-8 text-blue-400 shrink-0 mt-1" />
            <div className="space-y-2">
               <h4 className="font-black text-white uppercase text-sm">Водный баланс</h4>
               <p className="text-xs text-white/50 leading-relaxed font-medium">В период голодания важно поддерживать гидратацию. Пейте чистую воду, зеленый чай или черный кофе без сахара.</p>
            </div>
         </Card>
      </div>
    </div>
  );
}
