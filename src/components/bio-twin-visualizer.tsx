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
    <div className={cn("flex flex-col items-center justify-center gap-2 md:gap-4 group transition-all duration-500", className)}>
      <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle cx="50%" cy="50%" r="48%" fill="none" stroke="white" strokeOpacity="0.03" strokeWidth="1" />
          <circle 
            cx="50%" cy="50%" r="48%" fill="none" stroke={color} strokeWidth="2.5" 
            strokeDasharray="100" strokeDashoffset={100 - (progress || 0)} pathLength="100" strokeLinecap="round"
            className="drop-shadow-[0_0_12px_currentColor] transition-all duration-1000"
          />
        </svg>
        <div className="text-center flex flex-col items-center">
          <div className="scale-110 md:scale-125 mb-0.5 opacity-90 group-hover:opacity-100 transition-opacity">
            {icon}
          </div>
          <span className="text-[10px] md:text-sm font-black text-white leading-none block drop-shadow-[0_0_5px_rgba(255,255,255,0.4)]">
            {value}
          </span>
        </div>
      </div>
      <span className="text-[7px] md:text-[9px] font-black uppercase text-white/40 tracking-[0.1em] group-hover:text-primary transition-colors">
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
      <div className="absolute inset-0 z-0 pointer-events-none opacity-25">
        <div className="w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.2),transparent_70%)]" />
        <div className="scan-line opacity-30" />
      </div>

      {/* LAYER 2: HUD INTERFACE (GAUGES) */}
      <div className="relative z-[60] w-full h-full flex items-center justify-between px-4 md:px-16 pointer-events-none">
        
        {/* LEFT COLUMN: VITALITY */}
        <div className="flex flex-col gap-4 md:gap-8 items-start justify-center h-full pt-16 md:pt-12 pointer-events-auto">
          <NeonGauge 
            label="ШАГИ" value={stepsVal}
            icon={<Footprints className="h-5 w-5 md:h-6 md:w-6 text-[#00ffff]" />} color="#00ffff" 
            progress={getProgress(stepsVal, 10000)}
          />
          <NeonGauge 
            label="СОН" value={`${sleepVal}ч`}
            icon={<Moon className="h-5 w-5 md:h-6 md:w-6 text-[#818CF8]" />} color="#818CF8" 
            progress={getProgress(sleepVal, 8)}
          />
          <NeonGauge 
            label="ПУЛЬС" value={hrVal}
            icon={<Heart className="h-5 w-5 md:h-6 md:w-6 text-[#FB7185]" />} color="#FB7185" 
            progress={getProgress(hrVal, 100)}
          />
          <NeonGauge 
            label="АД" value={bpVal}
            icon={<Activity className="h-5 w-5 md:h-6 md:w-6 text-[#F472B6]" />} color="#F472B6" 
            progress={100}
          />
        </div>

        {/* RIGHT COLUMN: NUTRITION */}
        <div className="flex flex-col gap-4 md:gap-8 items-end justify-center h-full pt-16 md:pt-12 pointer-events-auto">
          <NeonGauge 
            label="ККАЛ" value={kcalVal}
            icon={<Flame className="h-5 w-5 md:h-6 md:w-6 text-[#FB923C]" />} color="#FB923C" 
            progress={getProgress(kcalVal, 2500)}
          />
          <NeonGauge 
            label="БЕЛКИ" value={`${proteinVal}г`}
            icon={<Beef className="h-5 w-5 md:h-6 md:w-6 text-[#F87171]" />} color="#F87171" 
            progress={getProgress(proteinVal, 150)}
          />
          <NeonGauge 
            label="ЖИРЫ" value={`${fatVal}г`}
            icon={<Droplet className="h-5 w-5 md:h-6 md:w-6 text-[#FACC15]" />} color="#FACC15" 
            progress={getProgress(fatVal, 80)}
          />
          <NeonGauge 
            label="УГЛЕВ" value={`${carbVal}г`}
            icon={<Zap className="h-5 w-5 md:h-6 md:w-6 text-[#4ADE80]" />} color="#4ADE80" 
            progress={getProgress(carbVal, 300)}
          />
        </div>
      </div>

      {/* LAYER 4: BIO-CORE HEART BEAT */}
      <div className="absolute top-[38%] md:top-[36%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] pointer-events-none">
        <div className="relative w-10 h-10 md:w-14 md:h-14 flex items-center justify-center">
          <div className="absolute inset-0 bg-[#00ffff]/40 rounded-full animate-ping opacity-70" />
          <div className="w-3 h-3 md:w-5 md:h-5 rounded-full bg-[#00ffff] shadow-[0_0_30px_#00ffff] animate-pulse" />
        </div>
      </div>

      {/* LAYER 5: THE PERSON (TOP LAYER) */}
      <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden">
        <div className="relative w-[600vw] h-[200vh] md:w-full md:h-[68vh] max-w-none md:max-w-6xl animate-hologram flex items-center justify-center transition-all duration-700 -translate-y-12 md:-translate-y-32 scale-125 md:scale-100">
          <Image 
            src="/bio-hologram.png" 
            alt="Bio-Hologram" 
            fill
            className="object-contain filter drop-shadow-[0_0_100px_rgba(0,255,255,0.9)]"
            priority
            unoptimized
          />
        </div>
      </div>

    </div>
  );
}
