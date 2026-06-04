'use client';

import { useState, useEffect } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Footprints, Heart, Moon, Scale, 
  Save, Loader2, RefreshCw, Zap, 
  Smartphone, Info
} from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { isNativeBridgeAvailable, requestNativePermissions, fetchNativeHealthData } from '@/lib/health-bridge';
import { cn } from '@/lib/utils';

type HealthDataType = 'steps' | 'heartRate' | 'sleep' | 'weight';

interface HealthDataModalProps {
  type: HealthDataType | null;
  onClose: () => void;
}

export function HealthDataModal({ type, onClose }: HealthDataModalProps) {
  const { user } = useUser();
  const { firestore } = useFirestore();
  const { toast } = useToast();
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    setIsNative(isNativeBridgeAvailable());
  }, []);

  if (!type) return null;

  const config = {
    steps: {
      title: 'Шаги',
      icon: <Footprints className="h-6 w-6 text-[#00ffff]" />,
      placeholder: 'Напр: 10000',
      unit: 'шагов',
      dbKey: 'steps'
    },
    heartRate: {
      title: 'Пульс',
      icon: <Heart className="h-6 w-6 text-[#FB7185]" />,
      placeholder: 'Напр: 72',
      unit: 'уд/мин',
      dbKey: 'avgHeartRate'
    },
    sleep: {
      title: 'Сон',
      icon: <Moon className="h-6 w-6 text-[#818CF8]" />,
      placeholder: 'Напр: 8',
      unit: 'часов',
      dbKey: 'sleepDurationHours'
    },
    weight: {
      title: 'Вес',
      icon: <Scale className="h-6 w-6 text-[#F472B6]" />,
      placeholder: 'Напр: 75.5',
      unit: 'кг',
      dbKey: 'weight'
    }
  }[type];

  const handleSave = async () => {
    if (!user || !firestore || !value) return;
    setLoading(true);
    try {
      const dateKey = format(new Date(), 'yyyy-MM-dd');
      const logRef = doc(firestore, 'users', user.uid, 'dailyLogs', dateKey);
      
      await setDoc(logRef, {
        [config.dbKey]: Number(value),
        updatedAt: serverTimestamp(),
      }, { merge: true });

      toast({ 
        title: 'Данные сохранены', 
        description: `${config.title} обновлены: ${value} ${config.unit}` 
      });
      onClose();
      setValue('');
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Ошибка сохранения', description: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSyncTrigger = async () => {
    setLoading(true);
    try {
      if (isNative) {
        const allowed = await requestNativePermissions();
        if (allowed) {
          const data = await fetchNativeHealthData();
          if (data && user && firestore) {
            const dateKey = format(new Date(), 'yyyy-MM-dd');
            const logRef = doc(firestore, 'users', user.uid, 'dailyLogs', dateKey);
            
            await setDoc(logRef, {
              steps: data.steps || undefined,
              avgHeartRate: data.heartRate || undefined,
              sleepDurationHours: data.sleepHours || undefined,
              weight: data.weight || undefined,
              updatedAt: serverTimestamp(),
            }, { merge: true });

            toast({ title: "Синхронизация завершена", description: "Данные получены." });
            onClose();
          }
        } else {
          toast({ variant: 'destructive', title: "Доступ отклонен", description: "Разрешите доступ в системе Android." });
        }
      } else {
        toast({
          title: "Облачная синхронизация",
          description: "Инициируем подключение к Google Fit API...",
        });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: "Ошибка синхронизации" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={!!type} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] max-w-[450px] rounded-[2.5rem] bg-[#010411] border border-white/10 p-0 overflow-hidden shadow-2xl z-[1200]">
        <DialogHeader className="p-8 bg-primary text-slate-950 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-[#00ffff]/80 opacity-90" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
              {config.icon}
            </div>
            <div>
              <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Ввод данных: {config.title}</DialogTitle>
              <p className="text-slate-950/60 font-black uppercase text-[10px] tracking-widest mt-1">Manual Biometric Hub</p>
            </div>
          </div>
          <Zap className="absolute -right-4 -bottom-4 h-24 w-24 text-slate-950/10 rotate-12" />
        </DialogHeader>

        <div className="p-8 space-y-8 bg-blue-950/40 backdrop-blur-3xl">
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 px-2 flex items-center gap-2">
              <Smartphone className="h-3 w-3" /> Автоматический трекинг
            </label>
            <Button 
              variant="outline" 
              onClick={handleSyncTrigger}
              disabled={loading}
              className="w-full h-16 rounded-2xl border-2 border-white/10 bg-white/5 text-white gap-4 hover:bg-white/10 transition-all group overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-red-500/10 to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              {isNative ? (
                <div className="flex items-center justify-center w-6 h-6 rounded bg-primary/20 mr-1">
                   <Zap className="h-4 w-4 text-primary" />
                </div>
              ) : (
                <Image src="https://www.gstatic.com/firebase/explore/images/goog-logo.svg" width={20} height={20} alt="Google" />
              )}
              <div className="flex flex-col items-start leading-none z-10">
                <span className="text-[11px] font-black uppercase tracking-tight">Подключить трекеры здоровья</span>
                <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest mt-1">
                  {isNative ? 'Native Health Connect' : 'Google Health Sync'}
                </span>
              </div>
              <RefreshCw className={cn("h-4 w-4 ml-auto text-primary/40 group-hover:rotate-180 transition-transform duration-500", loading && "animate-spin")} />
            </Button>
            
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-start gap-3">
               <Info className="h-4 w-4 text-primary/40 shrink-0 mt-0.5" />
               <p className="text-[9px] font-bold text-white/30 uppercase leading-relaxed tracking-wider">
                 Данные будут получены напрямую без ввода пароля через защищенный нативный шлюз.
               </p>
            </div>
          </div>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10" /></div>
            <div className="relative flex justify-center text-[9px] font-black uppercase tracking-widest">
              <span className="bg-[#0c1221] px-4 text-white/30">Или ручной ввод</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Input 
                type="number" 
                placeholder={config.placeholder}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="h-16 rounded-2xl bg-white/5 border-white/10 font-black text-2xl text-center text-white focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 font-black uppercase text-[10px]">
                {config.unit}
              </div>
            </div>
            <Button 
              onClick={handleSave} 
              disabled={loading || !value} 
              className="w-full h-14 rounded-2xl bg-primary text-slate-950 font-black shadow-[0_10px_30px_rgba(0,255,255,0.2)] hover:scale-[1.02] active:scale-95 transition-all"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Save className="mr-2 h-5 w-5" />} СОХРАНИТЬ В ХАБ
            </Button>
          </div>
        </div>

        <DialogFooter className="p-4 bg-black/40 border-t border-white/5">
          <Button variant="ghost" onClick={onClose} className="w-full font-bold text-white/20 hover:text-white uppercase text-[10px] tracking-widest">ОТМЕНА</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
