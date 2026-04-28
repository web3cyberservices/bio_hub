'use client';

import React, { useMemo, useEffect, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { 
  Droplet, Flame, Zap, Footprints, Moon, 
  Heart, Activity, Beef, Scale, Loader2, Save, CloudSync, X, RefreshCw
} from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface GaugeProps {
  label: string;
  value: number | string;
  goal?: number | string;
  icon: React.ReactNode;
  color: string;
  progress: number;
  className?: string;
  onClick?: () => void;
  isClickable?: boolean;
}

const NeonGauge = ({ label, value, goal, icon, color, progress, className, onClick, isClickable }: GaugeProps) => {
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center gap-1.5 md:gap-4 group transition-all duration-500", 
        isClickable && "cursor-pointer hover:scale-105 active:scale-95",
        className
      )}
      onClick={onClick}
    >
      <div className="relative w-24 h-24 md:w-28 md:h-28 flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle cx="50%" cy="50%" r="46%" fill="none" stroke="white" strokeOpacity="0.05" strokeWidth="1" />
          <circle 
            cx="50%" cy="50%" r="46%" fill="none" stroke={color} strokeWidth="3" 
            strokeDasharray="100" strokeDashoffset={100 - (progress || 0)} pathLength="100" strokeLinecap="round"
            className={cn(
              "drop-shadow-[0_0_15px_currentColor] transition-all duration-1000",
              isClickable && "group-hover:stroke-white transition-colors"
            )}
          />
        </svg>
        <div className="text-center flex flex-col items-center px-1">
          <div className="scale-[1.1] md:scale-125 mb-1 opacity-90 group-hover:opacity-100 transition-all">
            {icon}
          </div>
          <div className="flex flex-col items-center leading-none">
            <span className="text-[12px] md:text-sm font-black text-white block drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
              {value}
            </span>
            {goal && (
              <span className="text-[9px] md:text-[10px] font-bold text-white/30 mt-1 border-t border-white/5 pt-0.5">
                / {goal}
              </span>
            )}
          </div>
        </div>
        {isClickable && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center border border-primary/40 opacity-0 group-hover:opacity-100 transition-opacity">
            <Zap className="h-2.5 w-2.5 text-primary" />
          </div>
        )}
      </div>
      <span className={cn(
        "text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] transition-colors",
        isClickable ? "text-primary/60 group-hover:text-primary" : "text-white/40"
      )}>
        {label}
      </span>
    </div>
  );
};

export function BioTwinVisualizer({ score, deviceData, profileData, macros, goals, className }: any) {
  const { user } = useUser();
  const { firestore } = useFirestore();
  const { toast } = useToast();

  const [hologramSrc, setHologramSrc] = useState('/bio-hologram.png');
  const [version, setVersion] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  const [selectedDataType, setSelectedDataType] = useState<'steps' | 'heartRate' | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (!profileData) return;
    
    const gender = String(profileData.gender || 'мужской').toLowerCase().trim();
    const isFemale = gender === 'женский' || gender === 'female' || gender === 'жен' || gender === 'woman' || gender === 'w';
    
    const newSrc = isFemale ? '/woman_hologram.png' : '/bio-hologram.png';
    
    if (newSrc !== hologramSrc) {
      setHologramSrc(newSrc);
      setVersion(prev => prev + 1);
    }
  }, [profileData?.gender, hologramSrc]);

  const calculatedGoals = useMemo(() => {
    if (goals && goals.calories > 0) return goals;

    if (!profileData?.weight || !profileData?.height || !profileData?.birthDate) {
      return { calories: 2500, protein: 150, fat: 80, carbs: 300 };
    }

    const weight = profileData.weight;
    const height = profileData.height;
    const gender = profileData.gender || 'мужской';
    const activityLevel = profileData.activityLevel || 'moderate';
    const healthGoal = profileData.healthGoal || 'поддержать текущее состояние';

    const birthDate = new Date(profileData.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;

    let bmrMifflin = (10 * weight) + (6.25 * height) - (5 * age);
    bmrMifflin = gender === 'мужской' ? bmrMifflin + 5 : bmrMifflin - 161;

    let bmrHarris = gender === 'мужской' 
      ? 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
      : 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);

    const bmr = (bmrMifflin + bmrHarris) / 2;
    const multipliers: Record<string, number> = {
      minimal: 1.2, low: 1.375, moderate: 1.55, high: 1.725, athlete: 1.9
    };

    let tdee = bmr * (multipliers[activityLevel] || 1.55);
    if (healthGoal === 'снизить массу тела') tdee -= 500;
    if (healthGoal === 'набор массы') tdee += 500;

    const protein = Math.round(weight * 1.8); 
    const fat = Math.round(weight * 0.9);
    const carbs = Math.round((tdee - (protein * 4) - (fat * 9)) / 4);

    return { calories: Math.round(tdee), protein, fat, carbs };
  }, [goals, profileData]);

  const stepsVal = deviceData?.steps || 0;
  const sleepVal = deviceData?.sleepDurationHours || 0;
  const hrVal = deviceData?.avgHeartRate || 0;
  const weightVal = deviceData?.weight || profileData?.weight || 0;
  
  const kcalVal = macros?.calories || 0;
  const proteinVal = macros?.protein || 0;
  const fatVal = macros?.fat || 0;
  const carbVal = macros?.carbs || 0;

  const getProgress = (val: number, goal: number) => Math.min(100, (val / (goal || 1)) * 100);

  const handleManualSave = async () => {
    if (!user || !firestore || !selectedDataType || !inputValue) return;

    setIsSaving(true);
    try {
      const dateKey = format(new Date(), 'yyyy-MM-dd');
      const logRef = doc(firestore, 'users', user.uid, 'dailyLogs', dateKey);
      
      const updateData: any = {
        updatedAt: serverTimestamp(),
      };

      if (selectedDataType === 'steps') {
        updateData.steps = Number(inputValue);
      } else {
        updateData.avgHeartRate = Number(inputValue);
      }

      await setDoc(logRef, updateData, { merge: true });
      
      toast({ title: 'Данные обновлены', description: `Показатель успешно сохранен.` });
      setSelectedDataType(null);
      setInputValue('');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Ошибка сохранения', description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isMounted) return <div className="w-full h-full bg-black" />;

  return (
    <div className={cn("relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-[#000000] touch-none", className)}>
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-1">
        <div className="px-6 py-2 rounded-full border border-[#00ffff]/30 bg-[#00ffff]/10 backdrop-blur-xl shadow-[0_0_20px_rgba(0,255,255,0.2)] flex items-center gap-3">
          <Activity className="h-4 w-4 text-[#00ffff] animate-pulse" />
          <span className="text-[10px] font-black text-white tracking-widest uppercase">Bio-Score</span>
          <span className="text-xl font-black text-[#00ffff] drop-shadow-[0_0_8px_#00ffff]">{score || 92}</span>
        </div>
      </div>
      
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.15),transparent_70%)]" />
        <div className="scan-line opacity-30" />
      </div>

      <div className="relative z-[60] w-full h-full flex items-center justify-between px-2 md:px-20 pointer-events-none">
        <div className="flex flex-col gap-4 md:gap-8 items-start justify-center h-full pointer-events-auto">
          <NeonGauge label="ШАГИ" value={stepsVal} goal={10000} icon={<Footprints className="h-5 w-5 text-[#00ffff]" />} color="#00ffff" progress={getProgress(stepsVal, 10000)} isClickable onClick={() => setSelectedDataType('steps')} />
          <NeonGauge label="СОН" value={`${sleepVal}ч`} goal="8ч" icon={<Moon className="h-5 w-5 text-[#818CF8]" />} color="#818CF8" progress={getProgress(sleepVal, 8)} />
          <NeonGauge label="ПУЛЬС" value={hrVal} goal={100} icon={<Heart className="h-5 w-5 text-[#FB7185]" />} color="#FB7185" progress={getProgress(hrVal, 100)} isClickable onClick={() => setSelectedDataType('heartRate')} />
          <NeonGauge label="ВЕС" value={`${weightVal}кг`} icon={<Scale className="h-5 w-5 text-[#F472B6]" />} color="#F472B6" progress={100} />
        </div>
        <div className="flex flex-col gap-4 md:gap-8 items-end justify-center h-full pointer-events-auto">
          <NeonGauge label="ККАЛ" value={kcalVal} goal={calculatedGoals.calories} icon={<Flame className="h-5 w-5 text-[#FB923C]" />} color="#FB923C" progress={getProgress(kcalVal, calculatedGoals.calories)} />
          <NeonGauge label="БЕЛКИ" value={`${proteinVal}г`} goal={`${calculatedGoals.protein}г`} icon={<Beef className="h-5 w-5 text-[#F87171]" />} color="#F87171" progress={getProgress(proteinVal, calculatedGoals.protein)} />
          <NeonGauge label="ЖИРЫ" value={`${fatVal}г`} goal={`${calculatedGoals.fat}г`} icon={<Droplet className="h-5 w-5 text-[#FACC15]" />} color="#FACC15" progress={getProgress(fatVal, calculatedGoals.fat)} />
          <NeonGauge label="УГЛЕВ" value={`${carbVal}г`} goal={`${calculatedGoals.carbs}г`} icon={<Zap className="h-5 w-5 text-[#4ADE80]" />} color="#4ADE80" progress={getProgress(carbVal, calculatedGoals.carbs)} />
        </div>
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none flex items-center justify-center p-4 w-full h-full">
        <div key={`${hologramSrc}-${version}`} className="relative w-full h-full max-h-[75vh] animate-hologram flex items-center justify-center">
          <Image 
            src={`${hologramSrc}?v=${version}`} 
            alt="Bio-Hologram" 
            fill 
            className="object-contain filter drop-shadow-[0_0_35px_rgba(0,255,255,0.8)] brightness-110 contrast-125 transition-all duration-1000" 
            priority unoptimized 
          />
        </div>
      </div>

      <Dialog open={!!selectedDataType} onOpenChange={(open) => !open && setSelectedDataType(null)}>
        <DialogContent className="w-[90vw] max-w-[400px] rounded-[2.5rem] bg-[#010411] border border-primary/20 p-0 overflow-hidden shadow-2xl z-[1200]">
          <DialogHeader className="p-8 bg-primary text-slate-950 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-[#00ffff]/80 opacity-90" />
            <div className="relative z-10">
              <DialogTitle className="text-2xl font-black uppercase tracking-tighter">
                {selectedDataType === 'steps' ? 'Ввод данных: Шаги' : 'Ввод данных: Пульс'}
              </DialogTitle>
              <p className="text-slate-950/60 font-black uppercase text-[10px] tracking-widest mt-1">Manual Biometric Entry</p>
            </div>
          </DialogHeader>
          <div className="p-8 space-y-8 bg-blue-950/40 backdrop-blur-3xl">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 px-2">Ручной ввод</label>
              <Input type="number" placeholder={selectedDataType === 'steps' ? "Введите кол-во шагов" : "Введите уд/мин"} value={inputValue} onChange={(e) => setInputValue(e.target.value)} className="h-16 rounded-2xl bg-white/5 border-white/10 font-black text-2xl text-center text-white focus:ring-4 focus:ring-primary/10 transition-all shadow-inner" />
              <Button onClick={handleManualSave} disabled={isSaving || !inputValue} className="w-full h-14 rounded-2xl bg-primary text-slate-950 font-black shadow-[0_10px_30px_rgba(0,255,255,0.2)]">
                {isSaving ? <Loader2 className="animate-spin h-5 w-5" /> : <Save className="mr-2 h-5 w-5" />} СОХРАНИТЬ ВРУЧНУЮ
              </Button>
            </div>
            <div className="relative py-2"><div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10" /></div><div className="relative flex justify-center text-[9px] font-black uppercase tracking-widest"><span className="bg-[#0c1221] px-4 text-white/30">Или</span></div></div>
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 px-2">Автоматически</label>
              <Button variant="outline" onClick={() => console.log("Триггер OAuth Google")} className="w-full h-16 rounded-2xl border-2 border-white/10 bg-white/5 text-white gap-3 transition-all"><Image src="https://www.gstatic.com/firebase/explore/images/goog-logo.svg" width={16} height={16} alt="Google" /> СИНХРОНИЗИРОВАТЬ С GOOGLE FIT</Button>
            </div>
          </div>
          <DialogFooter className="p-4 bg-black/40 border-t border-white/5"><Button variant="ghost" onClick={() => setSelectedDataType(null)} className="w-full font-bold text-white/40 hover:text-white">ОТМЕНА</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
