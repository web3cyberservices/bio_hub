'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Droplets, Flame, Moon, Zap, Footprints, Beef, Activity } from 'lucide-react';

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
          <circle cx="50%" cy="50%" r="42%" fill="none" stroke="white" strokeOpacity="0.05" strokeWidth="1" />
          <circle 
            cx="50%" cy="50%" r="42%" fill="none" stroke={color} strokeWidth="2.5" 
            strokeDasharray="100" strokeDashoffset={100 - (progress || 0)} pathLength="100" strokeLinecap="round"
            className="drop-shadow-[0_0_12px_currentColor] transition-all duration-1000"
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
  const getProgress = (val: number, goal: number) => Math.min(100, (val / (goal || 1)) * 100);

  return (
    <div className={cn("relative w-full h-full flex items-center justify-center overflow-hidden bg-[#000000]", className)}>
      
      {/* 3-Column HUD Layout */}
      <div className="relative z-30 grid grid-cols-3 w-full max-w-7xl h-full items-center px-4 md:px-12">
        
        {/* LEFT COLUMN: Water, Kcal, Steps */}
        <div className="flex flex-col gap-6 md:gap-12 items-center justify-center h-full">
          <NeonGauge 
            label="ВОДА" value={deviceData?.water || 0}
            icon={<Droplets className="h-5 w-5 text-[#0EA5E9]" />} color="#0EA5E9" 
            progress={getProgress(deviceData?.water || 0, 2000)}
          />
          <NeonGauge 
            label="ККАЛ" value={macros?.calories || 0}
            icon={<Flame className="h-5 w-5 text-[#F97316]" />} color="#F97316" 
            progress={getProgress(macros?.calories || 0, 2500)}
          />
          <NeonGauge 
            label="ШАГИ" value={deviceData?.steps || 0}
            icon={<Footprints className="h-5 w-5 text-[#00ffff]" />} color="#00ffff" 
            progress={getProgress(deviceData?.steps || 0, 10000)}
          />
        </div>

        {/* CENTER COLUMN: YOUR HOLOGRAM IMAGE */}
        <div className="relative flex items-center justify-center h-full pt-10 pb-10">
          {/* Bio-Score floating badge */}
          <div className="absolute top-[15%] left-[50%] -translate-x-[160%] z-50">
             <div className="bg-black/60 backdrop-blur-xl px-4 py-2 rounded-xl border border-[#00ffff]/20 shadow-2xl flex flex-col items-start">
                <p className="text-[7px] font-black text-[#00ffff]/60 uppercase tracking-widest mb-0.5">NEURAL SYNC</p>
                <p className="text-xl md:text-2xl font-black text-white leading-none">
                  {score || 92}<span className="text-[#00ffff]/40 text-[10px] ml-1">/100</span>
                </p>
             </div>
          </div>
          
          {/* The Image Asset */}
          <div className="relative w-full h-[55vh] flex items-center justify-center animate-hologram">
             <div className="relative w-full h-full max-w-[400px]">
                <Image 
                  src="/hologram.png" 
                  alt="Bio-Hologram" 
                  fill 
                  className="object-contain drop-shadow-[0_0_25px_#00ffff] opacity-90"
                  priority
                  unoptimized
                />
             </div>

             {/* Core Node - Heart Area Pulse */}
             <div className="absolute top-[38%] left-1/2 -translate-x-1/2 z-40">
                <div className="relative w-8 h-8 flex items-center justify-center">
                   <div className="absolute inset-0 bg-[#00ffff]/40 rounded-full animate-ping opacity-50" />
                   <div className="w-3 h-3 rounded-full bg-[#00ffff] shadow-[0_0_20px_#00ffff] animate-pulse" />
                </div>
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Fats, Carbs, Protein */}
        <div className="flex flex-col gap-6 md:gap-12 items-center justify-center h-full">
          <NeonGauge 
            label="ЖИРЫ" value={macros?.fat || 0}
            icon={<Moon className="h-5 w-5 text-[#EAB308]" />} color="#EAB308" 
            progress={getProgress(macros?.fat || 0, 80)}
          />
          <NeonGauge 
            label="УГЛЕВОДЫ" value={macros?.carbs || 0}
            icon={<Zap className="h-5 w-5 text-[#10B981]" />} color="#10B981" 
            progress={getProgress(macros?.carbs || 0, 300)}
          />
          <NeonGauge 
            label="БЕЛКИ" value={macros?.protein || 0}
            icon={<Beef className="h-5 w-5 text-[#A855F7]" />} color="#A855F7" 
            progress={getProgress(macros?.protein || 0, 150)}
          />
        </div>

      </div>

      {/* Protocol Label */}
      <div className="absolute bottom-24 left-10 hidden lg:block z-40 max-w-[200px] opacity-20">
         <p className="text-[8px] font-black uppercase text-white/60 tracking-[0.2em] leading-relaxed border-l border-primary/40 pl-4">
            SYSTEM_PROTOCOL: ACTIVE<br />
            NEURAL_LINK_ESTABLISHED<br />
            BIO_HUB_V4.0.2<br />
            STATUS: REALTIME_SYNC
         </p>
      </div>

      {/* Scanning Line */}
      <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
         <div className="w-full h-[1px] bg-primary/20 absolute top-1/4 animate-scan shadow-[0_0_15px_rgba(0,255,255,0.2)]" />
      </div>

    </div>
  );
}
