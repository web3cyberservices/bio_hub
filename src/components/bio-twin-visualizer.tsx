'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Droplets, Flame, Zap, Footprints, Moon } from 'lucide-react';

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
    <div className={cn("flex flex-col items-center justify-center gap-2 group transition-all duration-500", className)}>
      <div className="text-white/40 group-hover:text-white transition-colors">
        {icon}
      </div>
      <div className="relative w-16 h-16 md:w-24 md:h-24 flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle cx="50%" cy="50%" r="48%" fill="none" stroke="white" strokeOpacity="0.03" strokeWidth="1" />
          <circle 
            cx="50%" cy="50%" r="48%" fill="none" stroke={color} strokeWidth="1.5" 
            strokeDasharray="100" strokeDashoffset={100 - (progress || 0)} pathLength="100" strokeLinecap="round"
            className="drop-shadow-[0_0_12px_currentColor] transition-all duration-1000"
          />
        </svg>
        <div className="text-center">
          <span className="text-sm md:text-xl font-black text-white leading-none block drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{value}</span>
        </div>
      </div>
      <span className="text-[8px] md:text-[9px] font-black uppercase text-white/30 tracking-[0.2em] group-hover:text-primary transition-colors">
        {label}
      </span>
    </div>
  );
};

export function BioTwinVisualizer({ score, deviceData, macros, className }: any) {
  const waterVal = deviceData?.water || 0;
  const kcalVal = deviceData?.calories || 0;
  const fatVal = macros?.fat || 0;
  const carbVal = macros?.carbs || 0;
  const stepsVal = deviceData?.steps || 0;

  const getProgress = (val: number, goal: number) => Math.min(100, (val / (goal || 1)) * 100);

  return (
    <div className={cn("relative w-full h-full flex items-center justify-center overflow-hidden bg-[#000000]", className)}>
      
      {/* LAYER 1: BACKGROUND GRID & AMBIENT GLOW */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.15),transparent_70%)]" />
        <div className="scan-line" />
      </div>

      {/* LAYER 2: HUD INTERFACE (GAUGES) */}
      <div className="relative z-10 w-full max-w-7xl h-full flex items-center px-6 md:px-12">
        
        {/* LEFT HUD: Water & Calories */}
        <div className="flex flex-col gap-16 md:gap-24 items-start justify-center h-full flex-1">
          <NeonGauge 
            label="ВОДА" value={waterVal}
            icon={<Droplets className="h-5 w-5 text-[#0EA5E9]" />} color="#0EA5E9" 
            progress={getProgress(waterVal, 2000)}
          />
          <NeonGauge 
            label="ККАЛ" value={kcalVal}
            icon={<Flame className="h-5 w-5 text-[#F97316]" />} color="#F97316" 
            progress={getProgress(kcalVal, 2500)}
          />
        </div>

        {/* RIGHT HUD: Fats & Carbs */}
        <div className="flex flex-col gap-16 md:gap-24 items-end justify-center h-full flex-1">
          <NeonGauge 
            label="ЖИРЫ" value={fatVal}
            icon={<Moon className="h-5 w-5 text-[#EAB308]" />} color="#EAB308" 
            progress={getProgress(fatVal, 80)}
          />
          <NeonGauge 
            label="УГЛЕВОДЫ" value={carbVal}
            icon={<Zap className="h-5 w-5 text-[#10B981]" />} color="#10B981" 
            progress={getProgress(carbVal, 300)}
          />
        </div>
      </div>

      {/* LAYER 3: STEP COUNTER HUD */}
      <div className="absolute bottom-32 right-8 md:right-24 z-20 flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl backdrop-blur-md">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Footprints className="h-5 w-5 text-[#00ffff]" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-black text-white leading-none">{stepsVal}</span>
          <span className="text-[9px] font-black text-white/30 uppercase tracking-widest mt-0.5">STEP COUNTER</span>
        </div>
      </div>

      {/* LAYER 4: BIO-CORE HEART BEAT (STAYS IN THE BACKGROUND) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
        <div className="relative w-12 h-12 flex items-center justify-center">
          <div className="absolute inset-0 bg-[#00ffff]/30 rounded-full animate-ping opacity-60" />
          <div className="w-4 h-4 rounded-full bg-[#00ffff] shadow-[0_0_25px_#00ffff] animate-pulse" />
        </div>
      </div>

      {/* LAYER 5: THE PERSON (TOP LAYER) - OPTIMIZED FOR ALL SCREEN SIZES */}
      <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center overflow-visible">
        <div className="relative w-[140vw] h-[90vh] md:w-full md:h-[75vh] max-w-none md:max-w-6xl animate-hologram flex items-center justify-center transition-all duration-700 md:-translate-y-8">
          <Image 
            src="/bio-hologram.png" 
            alt="Bio-Hologram" 
            fill
            className="object-contain filter drop-shadow-[0_0_100px_rgba(0,255,255,0.8)]"
            priority
            unoptimized
          />
        </div>
      </div>

    </div>
  );
}
