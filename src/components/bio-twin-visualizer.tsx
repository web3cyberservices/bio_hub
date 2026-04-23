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
    <div className={cn("flex flex-col items-center justify-center gap-3 md:gap-4 group transition-all duration-500", className)}>
      <div className="relative w-20 h-20 md:w-24 md:h-24 flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle cx="50%" cy="50%" r="48%" fill="none" stroke="white" strokeOpacity="0.05" strokeWidth="1" />
          <circle 
            cx="50%" cy="50%" r="48%" fill="none" stroke={color} strokeWidth="3" 
            strokeDasharray="100" strokeDashoffset={100 - (progress || 0)} pathLength="100" strokeLinecap="round"
            className="drop-shadow-[0_0_15px_currentColor] transition-all duration-1000"
          />
        </svg>
        <div className="text-center flex flex-col items-center">
          <div className="scale-125 md:scale-150 mb-1 opacity-90 group-hover:opacity-100 transition-opacity">
            {icon}
          </div>
          <span className="text-xs md:text-sm font-black text-white leading-none block drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
            {value}
          </span>
        </div>
      </div>
      <span className="text-[8px] md:text-[10px] font-black uppercase text-white/50 tracking-[0.2em] group-hover:text-primary transition-colors">
        {label}
      </span>
    </div>
  );
};

export function BioTwinVisualizer({ score, deviceData, macros, className }: any) {
  const stepsVal = deviceData?.steps || 0;
  const sleepVal = deviceData?.sleepDurationHours || 0;
  const hrVal = deviceData?.avgHeartRate || 0;
  const bpVal = deviceData?.bloodPressure || '120/80';
  
  const kcalVal = macros?.calories || 0;
  const proteinVal = macros?.protein || 0;
  const fatVal = macros?.fat || 0;
  const carbVal = macros?.carbs || 0;

  const getProgress = (val: number, goal: number) => Math.min(100, (val / (goal || 1)) * 100);

  return (
    <div className={cn("relative w-full h-full flex items-center justify-center overflow-hidden bg-[#000000] touch-none", className)}>
      
      {/* LAYER 1: BACKGROUND GRID & AMBIENT GLOW */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.25),transparent_80%)]" />
        <div className="scan-line opacity-40" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#00ffff]/10 to-transparent pointer-events-none" />
      </div>

      {/* LAYER 2: HUD INTERFACE (GAUGES) */}
      <div className="relative z-[60] w-full h-full flex items-center justify-between px-6 md:px-20 pointer-events-none">
        
        {/* LEFT COLUMN: VITALITY */}
        <div className="flex flex-col gap-6 md:gap-10 items-start justify-center h-full pt-12 md:pt-0 pointer-events-auto">
          <NeonGauge 
            label="ШАГИ" value={stepsVal}
            icon={<Footprints className="h-6 w-6 md:h-7 md:w-7 text-[#00ffff]" />} color="#00ffff" 
            progress={getProgress(stepsVal, 10000)}
          />
          <NeonGauge 
            label="СОН" value={`${sleepVal}ч`}
            icon={<Moon className="h-6 w-6 md:h-7 md:w-7 text-[#818CF8]" />} color="#818CF8" 
            progress={getProgress(sleepVal, 8)}
          />
          <NeonGauge 
            label="ПУЛЬС" value={hrVal}
            icon={<Heart className="h-6 w-6 md:h-7 md:w-7 text-[#FB7185]" />} color="#FB7185" 
            progress={getProgress(hrVal, 100)}
          />
          <NeonGauge 
            label="АД" value={bpVal}
            icon={<Activity className="h-6 w-6 md:h-7 md:w-7 text-[#F472B6]" />} color="#F472B6" 
            progress={100}
          />
        </div>

        {/* RIGHT COLUMN: NUTRITION */}
        <div className="flex flex-col gap-6 md:gap-10 items-end justify-center h-full pt-12 md:pt-0 pointer-events-auto">
          <NeonGauge 
            label="ККАЛ" value={kcalVal}
            icon={<Flame className="h-6 w-6 md:h-7 md:w-7 text-[#FB923C]" />} color="#FB923C" 
            progress={getProgress(kcalVal, 2500)}
          />
          <NeonGauge 
            label="БЕЛКИ" value={`${proteinVal}г`}
            icon={<Beef className="h-6 w-6 md:h-7 md:w-7 text-[#F87171]" />} color="#F87171" 
            progress={getProgress(proteinVal, 150)}
          />
          <NeonGauge 
            label="ЖИРЫ" value={`${fatVal}г`}
            icon={<Droplet className="h-6 w-6 md:h-7 md:w-7 text-[#FACC15]" />} color="#FACC15" 
            progress={getProgress(fatVal, 80)}
          />
          <NeonGauge 
            label="УГЛЕВ" value={`${carbVal}г`}
            icon={<Zap className="h-6 w-6 md:h-7 md:w-7 text-[#4ADE80]" />} color="#4ADE80" 
            progress={getProgress(carbVal, 300)}
          />
        </div>
      </div>

      {/* LAYER 4: BIO-CORE HEART BEAT */}
      <div className="absolute top-[52%] md:top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] pointer-events-none">
        <div className="relative w-12 h-12 md:w-16 md:h-16 flex items-center justify-center">
          <div className="absolute inset-0 bg-[#00ffff]/50 rounded-full animate-ping opacity-80" />
          <div className="w-4 h-4 md:w-6 md:h-6 rounded-full bg-[#00ffff] shadow-[0_0_40px_#00ffff] animate-pulse" />
        </div>
      </div>

      {/* LAYER 5: THE PERSON (TOP LAYER) */}
      <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden">
        <div className="relative w-[600vw] h-[220vh] md:w-full md:h-[75vh] max-w-none md:max-w-7xl animate-hologram flex items-center justify-center transition-all duration-1000 -translate-y-16 md:-translate-y-40 scale-[1.8] md:scale-100">
          <Image 
            src="/bio-hologram.png" 
            alt="Bio-Hologram" 
            fill
            className="object-contain filter drop-shadow-[0_0_120px_rgba(0,255,255,0.9)]"
            priority
            unoptimized
          />
        </div>
      </div>

    </div>
  );
}
