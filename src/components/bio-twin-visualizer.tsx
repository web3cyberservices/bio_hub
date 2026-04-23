'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Droplets, Flame, Moon, Zap, Footprints } from 'lucide-react';

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
      <div className="relative w-20 h-20 md:w-28 md:h-28 flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle cx="50%" cy="50%" r="45%" fill="none" stroke="white" strokeOpacity="0.05" strokeWidth="1" />
          <circle 
            cx="50%" cy="50%" r="45%" fill="none" stroke={color} strokeWidth="1.5" 
            strokeDasharray="100" strokeDashoffset={100 - (progress || 0)} pathLength="100" strokeLinecap="round"
            className="drop-shadow-[0_0_8px_currentColor] transition-all duration-1000"
          />
        </svg>
        <div className="text-center">
          <span className="text-xl md:text-3xl font-black text-white leading-none block">{value}</span>
        </div>
      </div>
      <span className="text-[8px] md:text-[10px] font-black uppercase text-white/30 tracking-[0.2em] group-hover:text-primary transition-colors">
        {label}
      </span>
    </div>
  );
};

export function BioTwinVisualizer({ score, deviceData, macros, className }: any) {
  // Инициализация значений "0", если данные отсутствуют
  const waterVal = deviceData?.water || 0;
  const kcalVal = macros?.calories || 0;
  const fatVal = macros?.fat || 0;
  const carbVal = macros?.carbs || 0;
  const stepsVal = deviceData?.steps || 0;

  const getProgress = (val: number, goal: number) => Math.min(100, (val / (goal || 1)) * 100);

  return (
    <div className={cn("relative w-full h-full flex items-center justify-center overflow-hidden bg-[#000000]", className)}>
      
      {/* 3-Column Layout */}
      <div className="relative z-30 grid grid-cols-3 w-full max-w-7xl h-full items-center px-6 md:px-12">
        
        {/* LEFT COLUMN: Water & Kcal */}
        <div className="flex flex-col gap-12 md:gap-20 items-center justify-center h-full">
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

        {/* CENTER COLUMN: The Hologram */}
        <div className="relative flex items-center justify-center h-full">
          <div className="relative w-full h-[55vh] flex items-center justify-center animate-hologram">
             <div className="relative w-full h-full">
                <Image 
                  src="/hologram.png" 
                  alt="Bio-Hologram" 
                  fill 
                  className="object-contain drop-shadow-[0_0_20px_#00ffff]"
                  priority
                  unoptimized
                />
             </div>

             {/* Single Cyan Heart Dot */}
             <div className="absolute top-[38%] left-1/2 -translate-x-1/2 z-40">
                <div className="relative w-6 h-6 flex items-center justify-center">
                   <div className="absolute inset-0 bg-[#00ffff]/40 rounded-full animate-ping opacity-50" />
                   <div className="w-2.5 h-2.5 rounded-full bg-[#00ffff] shadow-[0_0_15px_#00ffff] animate-pulse" />
                </div>
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Fat, Carbs & Steps */}
        <div className="flex flex-col gap-12 md:gap-20 items-center justify-center h-full relative">
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
          
          {/* Separate Step Counter */}
          <div className="absolute bottom-10 right-0 flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md group hover:border-primary/40 transition-all">
             <Footprints className="h-4 w-4 text-[#00ffff] group-hover:scale-110 transition-transform" />
             <span className="text-sm font-black text-white">{stepsVal} <span className="text-[10px] text-white/40 uppercase">STEP</span></span>
          </div>
        </div>

      </div>

      {/* Background Decor */}
      <div className="absolute inset-0 z-10 pointer-events-none">
         <div className="w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.05),transparent_70%)]" />
         <div className="scan-line opacity-20" />
      </div>

    </div>
  );
}
