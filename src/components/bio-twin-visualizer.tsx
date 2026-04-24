
'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { 
  Droplet, Flame, Zap, Footprints, Moon, 
  Heart, Activity, Beef
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
      {/* Увеличенный размер на мобильных: w-24 h-24 (96px), на десктопе: w-28 h-28 (112px) */}
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
          <div className="scale-[0.9] md:scale-125 mb-1 opacity-90 group-hover:opacity-100 transition-all">
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

export function BioTwinVisualizer({ score, deviceData, macros, goals, className }: any) {
  const stepsVal = deviceData?.steps || 0;
  const sleepVal = deviceData?.sleepDurationHours || 0;
  const hrVal = deviceData?.avgHeartRate || 0;
  const bpVal = deviceData?.bloodPressure || '120/80';
  
  // Фактическое потребление (macros)
  const kcalVal = macros?.calories || 0;
  const proteinVal = macros?.protein || 0;
  const fatVal = macros?.fat || 0;
  const carbVal = macros?.carbs || 0;

  // Цели (из ИИ-плана или дефолты)
  const kcalGoal = goals?.calories || 2500;
  const proteinGoal = goals?.protein || 150;
  const fatGoal = goals?.fat || 80;
  const carbGoal = goals?.carbs || 300;

  const getProgress = (val: number, goal: number) => Math.min(100, (val / (goal || 1)) * 100);

  return (
    <div className={cn("relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-[#000000] touch-none pt-4 pb-24 md:pb-32", className)}>
      
      {/* LAYER 0: BIO-SCORE TOP INDICATOR */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-1 animate-in fade-in slide-in-from-top-4 duration-1000">
        <div className="px-6 py-2 rounded-full border border-[#00ffff]/30 bg-[#00ffff]/10 backdrop-blur-xl shadow-[0_0_20px_rgba(0,255,255,0.2)] flex items-center gap-3">
          <Activity className="h-4 w-4 text-[#00ffff] animate-pulse" />
          <span className="text-[10px] font-black text-white tracking-widest uppercase">Bio-Score</span>
          <span className="text-xl font-black text-[#00ffff] drop-shadow-[0_0_8px_#00ffff]">{score || 92}</span>
        </div>
        <div className="text-[7px] font-black text-[#00ffff]/40 uppercase tracking-[0.4em] text-center">Neural Health Assessment</div>
      </div>

      {/* LAYER 1: BACKGROUND GRID & AMBIENT GLOW */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.15),transparent_70%)]" />
        <div className="scan-line opacity-30" />
      </div>

      {/* LAYER 2: HUD INTERFACE (GAUGES) */}
      <div className="relative z-[60] w-full h-full flex items-center justify-between px-2 md:px-20 pointer-events-none">
        
        {/* LEFT COLUMN: VITALITY */}
        <div className="flex flex-col gap-4 md:gap-8 items-start justify-start pt-14 h-full pointer-events-auto">
          <NeonGauge 
            label="ШАГИ" value={stepsVal} goal={10000}
            icon={<Footprints className="h-4 w-4 md:h-6 md:w-6 text-[#00ffff]" />} color="#00ffff" 
            progress={getProgress(stepsVal, 10000)}
          />
          <NeonGauge 
            label="СОН" value={`${sleepVal}ч`} goal="8ч"
            icon={<Moon className="h-4 w-4 md:h-6 md:w-6 text-[#818CF8]" />} color="#818CF8" 
            progress={getProgress(sleepVal, 8)}
          />
          <NeonGauge 
            label="ПУЛЬС" value={hrVal} goal={100}
            icon={<Heart className="h-4 w-4 md:h-6 md:w-6 text-[#FB7185]" />} color="#FB7185" 
            progress={getProgress(hrVal, 100)}
          />
          <NeonGauge 
            label="АД" value={bpVal}
            icon={<Activity className="h-4 w-4 md:h-6 md:w-6 text-[#F472B6]" />} color="#F472B6" 
            progress={100}
          />
        </div>

        {/* RIGHT COLUMN: NUTRITION (КБЖУ) */}
        <div className="flex flex-col gap-4 md:gap-8 items-end justify-start pt-14 h-full pointer-events-auto">
          <NeonGauge 
            label="ККАЛ" value={kcalVal} goal={kcalGoal}
            icon={<Flame className="h-4 w-4 md:h-6 md:w-6 text-[#FB923C]" />} color="#FB923C" 
            progress={getProgress(kcalVal, kcalGoal)}
          />
          <NeonGauge 
            label="БЕЛКИ" value={`${proteinVal}г`} goal={`${proteinGoal}г`}
            icon={<Beef className="h-4 w-4 md:h-6 md:w-6 text-[#F87171]" />} color="#F87171" 
            progress={getProgress(proteinVal, proteinGoal)}
          />
          <NeonGauge 
            label="ЖИРЫ" value={`${fatVal}г`} goal={`${fatGoal}г`}
            icon={<Droplet className="h-4 w-4 md:h-6 md:w-6 text-[#FACC15]" />} color="#FACC15" 
            progress={getProgress(fatVal, fatGoal)}
          />
          <NeonGauge 
            label="УГЛЕВ" value={`${carbVal}г`} goal={`${carbGoal}г`}
            icon={<Zap className="h-4 w-4 md:h-6 md:w-6 text-[#4ADE80]" />} color="#4ADE80" 
            progress={getProgress(carbVal, carbGoal)}
          />
        </div>
      </div>

      {/* LAYER 3: HOLOGRAM - CENTERED VERTICALLY IN VISIBLE AREA */}
      <div className="absolute top-0 left-0 right-0 bottom-24 md:bottom-32 z-50 pointer-events-none flex items-center justify-center p-4">
        <div className="relative w-full h-full max-h-[55vh] md:max-h-[75vh] animate-hologram flex items-center justify-center transition-all duration-1000">
          
          <div className="relative w-full h-full flex items-center justify-center">
            <Image 
              src="/bio-hologram.png" 
              alt="Bio-Hologram" 
              fill
              className="object-contain filter drop-shadow-[0_0_15px_rgba(0,255,255,0.6)]"
              priority
              unoptimized
            />

            {/* BIO-CORE */}
            <div className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70]">
              <div className="relative w-6 h-6 md:w-10 md:h-10 flex items-center justify-center">
                <div className="absolute inset-0 bg-[#00ffff]/40 rounded-full animate-ping opacity-70" />
                <div className="w-2 h-2 md:w-4 md:h-4 rounded-full bg-[#00ffff] shadow-[0_0_30px_#00ffff] animate-pulse" />
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
