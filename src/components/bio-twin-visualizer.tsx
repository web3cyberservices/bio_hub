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
  icon: React.ReactNode;
  color: string;
  progress: number;
  className?: string;
}

const NeonGauge = ({ label, value, icon, color, progress, className }: GaugeProps) => {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-1 group transition-all duration-500", className)}>
      <div className="relative w-12 h-12 md:w-16 md:h-16 flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle cx="50%" cy="50%" r="48%" fill="none" stroke="white" strokeOpacity="0.03" strokeWidth="1" />
          <circle 
            cx="50%" cy="50%" r="48%" fill="none" stroke={color} strokeWidth="2" 
            strokeDasharray="100" strokeDashoffset={100 - (progress || 0)} pathLength="100" strokeLinecap="round"
            className="drop-shadow-[0_0_8px_currentColor] transition-all duration-1000"
          />
        </svg>
        <div className="text-center flex flex-col items-center">
          <div className="scale-75 mb-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
            {icon}
          </div>
          <span className="text-[10px] md:text-xs font-black text-white leading-none block drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">
            {value}
          </span>
        </div>
      </div>
      <span className="text-[6px] md:text-[8px] font-black uppercase text-white/30 tracking-[0.1em] group-hover:text-primary transition-colors">
        {label}
      </span>
    </div>
  );
};

export function BioTwinVisualizer({ score, deviceData, macros, className }: any) {
  // Данные из биометрии
  const stepsVal = deviceData?.steps || 0;
  const sleepVal = deviceData?.sleepDurationHours || 0;
  const hrVal = deviceData?.avgHeartRate || 0;
  const bpVal = deviceData?.bloodPressure || '120/80';
  
  // Данные из макросов
  const kcalVal = macros?.calories || 0;
  const proteinVal = macros?.protein || 0;
  const fatVal = macros?.fat || 0;
  const carbVal = macros?.carbs || 0;

  const getProgress = (val: number, goal: number) => Math.min(100, (val / (goal || 1)) * 100);

  return (
    <div className={cn("relative w-full h-full flex items-center justify-center overflow-hidden bg-[#000000] touch-none", className)}>
      
      {/* LAYER 1: BACKGROUND GRID & AMBIENT GLOW */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.15),transparent_70%)]" />
        <div className="scan-line" />
      </div>

      {/* LAYER 2: HUD INTERFACE (GAUGES) */}
      <div className="relative z-10 w-full max-w-7xl h-full flex items-center justify-between px-4 md:px-12">
        
        {/* LEFT COLUMN: ACTIVITY & VITALS */}
        <div className="flex flex-col gap-3 md:gap-8 items-start justify-center h-full pt-10">
          <NeonGauge 
            label="ШАГИ" value={stepsVal}
            icon={<Footprints className="h-4 w-4 text-[#00ffff]" />} color="#00ffff" 
            progress={getProgress(stepsVal, 10000)}
          />
          <NeonGauge 
            label="СОН" value={`${sleepVal}ч`}
            icon={<Moon className="h-4 w-4 text-[#818CF8]" />} color="#818CF8" 
            progress={getProgress(sleepVal, 8)}
          />
          <NeonGauge 
            label="ПУЛЬС" value={hrVal}
            icon={<Heart className="h-4 w-4 text-[#FB7185]" />} color="#FB7185" 
            progress={getProgress(hrVal, 100)}
          />
          <NeonGauge 
            label="АД" value={bpVal}
            icon={<Activity className="h-4 w-4 text-[#F472B6]" />} color="#F472B6" 
            progress={100}
          />
        </div>

        {/* RIGHT COLUMN: NUTRITION */}
        <div className="flex flex-col gap-3 md:gap-8 items-end justify-center h-full pt-10">
          <NeonGauge 
            label="ККАЛ" value={kcalVal}
            icon={<Flame className="h-4 w-4 text-[#FB923C]" />} color="#FB923C" 
            progress={getProgress(kcalVal, 2500)}
          />
          <NeonGauge 
            label="БЕЛКИ" value={`${proteinVal}г`}
            icon={<Beef className="h-4 w-4 text-[#F87171]" />} color="#F87171" 
            progress={getProgress(proteinVal, 150)}
          />
          <NeonGauge 
            label="ЖИРЫ" value={`${fatVal}г`}
            icon={<Droplet className="h-4 w-4 text-[#FACC15]" />} color="#FACC15" 
            progress={getProgress(fatVal, 80)}
          />
          <NeonGauge 
            label="УГЛЕВ" value={`${carbVal}г`}
            icon={<Zap className="h-4 w-4 text-[#4ADE80]" />} color="#4ADE80" 
            progress={getProgress(carbVal, 300)}
          />
        </div>
      </div>

      {/* LAYER 4: BIO-CORE HEART BEAT */}
      <div className="absolute top-[32%] md:top-[36%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
        <div className="relative w-8 h-8 md:w-12 md:h-12 flex items-center justify-center">
          <div className="absolute inset-0 bg-[#00ffff]/30 rounded-full animate-ping opacity-60" />
          <div className="w-2.5 h-2.5 md:w-4 md:h-4 rounded-full bg-[#00ffff] shadow-[0_0_20px_#00ffff] animate-pulse" />
        </div>
      </div>

      {/* LAYER 5: THE PERSON (TOP LAYER) */}
      <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center">
        <div className="relative w-[120vw] h-[85vh] md:w-full md:h-[68vh] max-w-none md:max-w-6xl animate-hologram flex items-center justify-center transition-all duration-700 -translate-y-4 md:-translate-y-14">
          <Image 
            src="/bio-hologram.png" 
            alt="Bio-Hologram" 
            fill
            className="object-contain filter drop-shadow-[0_0_80px_rgba(0,255,255,0.8)]"
            priority
            unoptimized
          />
        </div>
      </div>

    </div>
  );
}
