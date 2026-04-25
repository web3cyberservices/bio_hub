'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { 
  Droplet, Flame, Zap, Footprints, Moon, 
  Heart, Activity, Beef, Scale
} from 'lucide-react';

interface GaugeProps {
  label: string;
  value: number | string;
  goal?: number | string;
  icon: React.ReactNode;
  color: string;
  progress: number;
  className?: string;
}

const NeonGauge = ({ label, value, goal, icon, color, progress, className }: GaugeProps) => {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-1.5 md:gap-4 group transition-all duration-500", className)}>
      <div className="relative w-24 h-24 md:w-28 md:h-28 flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle cx="50%" cy="50%" r="46%" fill="none" stroke="white" strokeOpacity="0.05" strokeWidth="1" />
          <circle 
            cx="50%" cy="50%" r="46%" fill="none" stroke={color} strokeWidth="3" 
            strokeDasharray="100" strokeDashoffset={100 - (progress || 0)} pathLength="100" strokeLinecap="round"
            className="drop-shadow-[0_0_15px_currentColor] transition-all duration-1000"
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
      </div>
      <span className="text-[8px] md:text-[9px] font-black uppercase text-white/40 tracking-[0.2em] group-hover:text-primary transition-colors">
        {label}
      </span>
    </div>
  );
};

export function BioTwinVisualizer({ score, deviceData, profileData, macros, goals, className }: any) {
  const gender = profileData?.gender || 'мужской';
  
  // Определяем изображение голограммы в зависимости от пола
  const hologramSrc = gender === 'женский' ? '/woman_hologram.png' : '/bio-hologram.png';

  const calculatedGoals = useMemo(() => {
    if (goals && goals.calories > 0) return goals;

    if (!profileData?.weight || !profileData?.height || !profileData?.birthDate) {
      return { calories: 2500, protein: 150, fat: 80, carbs: 300 };
    }

    const weight = profileData.weight;
    const height = profileData.height;
    const activityLevel = profileData.activityLevel || 'moderate';
    const healthGoal = profileData.healthGoal || 'поддержать текущее состояние';

    const birthDate = new Date(profileData.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;

    // 1. Формула Миффлина-Сан Жеора
    let bmrMifflin = (10 * weight) + (6.25 * height) - (5 * age);
    bmrMifflin = gender === 'мужской' ? bmrMifflin + 5 : bmrMifflin - 161;

    // 2. Формула Харриса-Бенедикта (уточненная Роза-Шизгала)
    let bmrHarris = gender === 'мужской' 
      ? 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
      : 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);

    // Используем среднее значение для повышения точности
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
  }, [goals, profileData, gender]);

  const stepsVal = deviceData?.steps || 0;
  const sleepVal = deviceData?.sleepDurationHours || 0;
  const hrVal = deviceData?.avgHeartRate || 0;
  const weightVal = deviceData?.weight || profileData?.weight || 0;
  
  const kcalVal = macros?.calories || 0;
  const proteinVal = macros?.protein || 0;
  const fatVal = macros?.fat || 0;
  const carbVal = macros?.carbs || 0;

  const getProgress = (val: number, goal: number) => Math.min(100, (val / (goal || 1)) * 100);

  return (
    <div className={cn("relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-[#000000] touch-none pt-4", className)}>
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-1">
        <div className="px-6 py-2 rounded-full border border-[#00ffff]/30 bg-[#00ffff]/10 backdrop-blur-xl shadow-[0_0_20px_rgba(0,255,255,0.2)] flex items-center gap-3">
          <Activity className="h-4 w-4 text-[#00ffff] animate-pulse" />
          <span className="text-[10px] font-black text-white tracking-widest uppercase">Bio-Score</span>
          <span className="text-xl font-black text-[#00ffff] drop-shadow-[0_0_8px_#00ffff]">{score || 92}</span>
        </div>
        <div className="text-[7px] font-black text-[#00ffff]/40 uppercase tracking-[0.4em] text-center">Neural Metabolism Check</div>
      </div>
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.15),transparent_70%)]" />
        <div className="scan-line opacity-30" />
      </div>
      <div className="relative z-[60] w-full h-full flex items-center justify-between px-2 md:px-20 pointer-events-none">
        <div className="flex flex-col gap-4 md:gap-8 items-start justify-center h-full pointer-events-auto">
          <NeonGauge label="ШАГИ" value={stepsVal} goal={10000} icon={<Footprints className="h-5 w-5 text-[#00ffff]" />} color="#00ffff" progress={getProgress(stepsVal, 10000)} />
          <NeonGauge label="СОН" value={`${sleepVal}ч`} goal="8ч" icon={<Moon className="h-5 w-5 text-[#818CF8]" />} color="#818CF8" progress={getProgress(sleepVal, 8)} />
          <NeonGauge label="ПУЛЬС" value={hrVal} goal={100} icon={<Heart className="h-5 w-5 text-[#FB7185]" />} color="#FB7185" progress={getProgress(hrVal, 100)} />
          <NeonGauge label="ВЕС" value={`${weightVal}кг`} icon={<Scale className="h-5 w-5 text-[#F472B6]" />} color="#F472B6" progress={100} />
        </div>
        <div className="flex flex-col gap-4 md:gap-8 items-end justify-center h-full pointer-events-auto">
          <NeonGauge label="ККАЛ" value={kcalVal} goal={calculatedGoals.calories} icon={<Flame className="h-5 w-5 text-[#FB923C]" />} color="#FB923C" progress={getProgress(kcalVal, calculatedGoals.calories)} />
          <NeonGauge label="БЕЛКИ" value={`${proteinVal}г`} goal={`${calculatedGoals.protein}г`} icon={<Beef className="h-5 w-5 text-[#F87171]" />} color="#F87171" progress={getProgress(proteinVal, calculatedGoals.protein)} />
          <NeonGauge label="ЖИРЫ" value={`${fatVal}г`} goal={`${calculatedGoals.fat}г`} icon={<Droplet className="h-5 w-5 text-[#FACC15]" />} color="#FACC15" progress={getProgress(fatVal, calculatedGoals.fat)} />
          <NeonGauge label="УГЛЕВ" value={`${carbVal}г`} goal={`${calculatedGoals.carbs}г`} icon={<Zap className="h-5 w-5 text-[#4ADE80]" />} color="#4ADE80" progress={getProgress(carbVal, calculatedGoals.carbs)} />
        </div>
      </div>
      <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center p-4">
        <div className="relative w-full h-full max-h-[65vh] animate-hologram flex items-center justify-center">
          <Image 
            src={hologramSrc} 
            alt="Bio-Hologram" 
            fill 
            className="object-contain filter drop-shadow-[0_0_15px_rgba(0,255,255,0.6)]" 
            priority 
            unoptimized 
          />
        </div>
      </div>
    </div>
  );
}