
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
      <div className="relative w-24 h-24 md:w-32 md:h-32 flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle cx="50%" cy="50%" r="48%" fill="none" stroke="white" strokeOpacity="0.03" strokeWidth="1" />
          <circle 
            cx="50%" cy="50%" r="48%" fill="none" stroke={color} strokeWidth="1.5" 
            strokeDasharray="100" strokeDashoffset={100 - (progress || 0)} pathLength="100" strokeLinecap="round"
            className="drop-shadow-[0_0_12px_currentColor] transition-all duration-1000"
          />
        </svg>
        <div className="text-center">
          <span className="text-2xl md:text-4xl font-black text-white leading-none block drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{value}</span>
        </div>
      </div>
      <span className="text-[9px] md:text-[11px] font-black uppercase text-white/30 tracking-[0.2em] group-hover:text-primary transition-colors">
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
      
      {/* BACKGROUND IMAGE LAYER (bio-hologram.png) */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-full h-[65vh] animate-hologram">
          <Image 
            src="/bio-hologram.png" 
            alt="Bio-Hologram Background" 
            fill 
            className="object-contain filter drop-shadow-[0_0_35px_#00ffff]"
            priority
            unoptimized
          />
        </div>
      </div>

      {/* CENTRAL PULSE (Heart Core) */}
      <div className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
        <div className="relative w-8 h-8 flex items-center justify-center">
          <div className="absolute inset-0 bg-[#00ffff]/30 rounded-full animate-ping opacity-60" />
          <div className="w-3 h-3 rounded-full bg-[#00ffff] shadow-[0_0_20px_#00ffff] animate-pulse" />
        </div>
      </div>

      {/* HUD OVERLAY LAYER (Gauges) */}
      <div className="relative z-30 w-full max-w-7xl h-full flex items-center px-8 md:px-16">
        
        {/* LEFT HUD: Water & Calories */}
        <div className="flex flex-col gap-16 md:gap-24 items-start justify-center h-full flex-1">
          <NeonGauge 
            label="ВОДА" value={waterVal}
            icon={<Droplets className="h-6 w-6 text-[#0EA5E9]" />} color="#0EA5E9" 
            progress={getProgress(waterVal, 2000)}
          />
          <NeonGauge 
            label="ККАЛ" value={kcalVal}
            icon={<Flame className="h-6 w-6 text-[#F97316]" />} color="#F97316" 
            progress={getProgress(kcalVal, 2500)}
          />
        </div>

        {/* RIGHT HUD: Fats & Carbs */}
        <div className="flex flex-col gap-16 md:gap-24 items-end justify-center h-full flex-1">
          <NeonGauge 
            label="ЖИРЫ" value={fatVal}
            icon={<Moon className="h-6 w-6 text-[#EAB308]" />} color="#EAB308" 
            progress={getProgress(fatVal, 80)}
          />
          <NeonGauge 
            label="УГЛЕВОДЫ" value={carbVal}
            icon={<Zap className="h-6 w-6 text-[#10B981]" />} color="#10B981" 
            progress={getProgress(carbVal, 300)}
          />
        </div>
      </div>

      {/* STEP COUNTER (Bottom Right HUD) */}
      <div className="absolute bottom-32 right-12 md:right-24 z-40 flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl backdrop-blur-md group hover:border-primary/40 transition-all cursor-pointer">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Footprints className="h-5 w-5 text-[#00ffff] group-hover:scale-110 transition-transform" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-black text-white leading-none">{stepsVal}</span>
          <span className="text-[9px] font-black text-white/30 uppercase tracking-widest mt-0.5">STEP COUNTER</span>
        </div>
      </div>

      {/* BIO-SCORE BADGE (Top Center HUD) */}
      <div className="absolute top-28 left-1/2 -translate-x-1/2 z-40">
        <div className="bg-[#00ffff]/10 border border-[#00ffff]/30 px-8 py-2.5 rounded-full backdrop-blur-xl shadow-[0_0_20px_rgba(0,255,255,0.15)] flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#00ffff] animate-pulse shadow-[0_0_8px_#00ffff]" />
          <span className="text-[10px] font-black text-white uppercase tracking-[0.4em]">BIO-SCORE 4.0</span>
        </div>
      </div>

      {/* SCAN LINES & GRID OVERLAY */}
      <div className="absolute inset-0 z-10 pointer-events-none opacity-20">
        <div className="w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.05),transparent_70%)]" />
        <div className="scan-line" />
      </div>

    </div>
  );
}
