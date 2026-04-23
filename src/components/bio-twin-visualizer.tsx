
'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Droplets, Flame, Moon, Zap, Footprints, Beef } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

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
    <div className={cn("flex flex-col items-center justify-center gap-3 group transition-all duration-500", className)}>
      <div className="text-white/40 group-hover:text-white transition-colors">
        {icon}
      </div>
      <div className="relative w-20 h-20 md:w-24 md:h-24 flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle cx="50%" cy="50%" r="42%" fill="none" stroke="white" strokeOpacity="0.05" strokeWidth="1" />
          <circle 
            cx="50%" cy="50%" r="42%" fill="none" stroke={color} strokeWidth="2" 
            strokeDasharray="100" strokeDashoffset={100 - (progress || 0)} pathLength="100" strokeLinecap="round"
            className="drop-shadow-[0_0_12px_currentColor] transition-all duration-1000"
          />
        </svg>
        <div className="text-center">
          <span className="text-xl md:text-3xl font-black text-white leading-none block">{value}</span>
        </div>
      </div>
      <span className="text-[9px] font-black uppercase text-white/30 tracking-[0.3em] group-hover:text-primary transition-colors">
        {label}
      </span>
    </div>
  );
};

export function BioTwinVisualizer({ score, deviceData, macros, className }: any) {
  const getProgress = (val: number, goal: number) => Math.min(100, (val / (goal || 1)) * 100);
  const hologramImg = PlaceHolderImages.find(img => img.id === 'digital-twin-hologram');

  return (
    <div className={cn("relative w-full h-full flex items-center justify-center overflow-hidden bg-[#000000]", className)}>
      
      {/* 3x3 Grid System */}
      <div className="relative z-30 grid grid-cols-1 md:grid-cols-3 w-full max-w-7xl h-full items-center px-6 md:px-10">
        
        {/* LEFT COLUMN: Water, Calories, Steps */}
        <div className="hidden md:flex flex-col gap-10 md:gap-14 items-center justify-center">
          <NeonGauge 
            label="ВОДА" value={deviceData?.water || 0}
            icon={<Droplets className="h-6 w-6 text-[#0EA5E9]" />} color="#0EA5E9" 
            progress={getProgress(deviceData?.water || 0, 2000)}
          />
          <NeonGauge 
            label="ККАЛ" value={macros?.calories || 0}
            icon={<Flame className="h-6 w-6 text-[#F97316]" />} color="#F97316" 
            progress={getProgress(macros?.calories || 0, 2500)}
          />
          <NeonGauge 
            label="ШАГИ" value={deviceData?.steps || 0}
            icon={<Footprints className="h-6 w-6 text-[#00ffff]" />} color="#00ffff" 
            progress={getProgress(deviceData?.steps || 0, 10000)}
          />
        </div>

        {/* CENTRAL COLUMN: The Human Hologram Asset */}
        <div className="relative flex items-center justify-center h-full py-10">
          {/* Bio-Score floating badge */}
          <div className="absolute top-20 left-4 md:left-0 z-50">
             <div className="bg-black/60 backdrop-blur-xl px-5 py-3 rounded-2xl border border-primary/30 shadow-[0_0_20px_rgba(0,255,255,0.2)] flex flex-col items-start animate-in slide-in-from-left-4 duration-1000">
                <p className="text-[7px] font-black text-primary/60 uppercase tracking-[0.4em]">BIO-SCORE 4.0</p>
                <p className="text-2xl font-black text-white leading-none">{score || 92}<span className="text-primary/40 text-[10px] ml-1">/100</span></p>
                <div className="w-16 h-1 bg-white/5 mt-3 rounded-full overflow-hidden">
                   <div className="h-full bg-primary animate-pulse shadow-[0_0_10px_#00ffff]" style={{ width: `${score || 92}%` }} />
                </div>
             </div>
          </div>
          
          <div className="relative w-full h-full max-h-[55vh] flex items-center justify-center animate-hologram">
             {/* The core asset image provided by user */}
             <div className="relative w-full h-full flex items-center justify-center">
                <Image 
                  src={hologramImg?.imageUrl || "https://picsum.photos/seed/hologram/800/1200"} 
                  alt="Digital Twin Hologram"
                  width={800}
                  height={1200}
                  className="max-h-full w-auto object-contain filter drop-shadow-[0_0_25px_rgba(0,255,255,0.6)]"
                  priority
                  unoptimized
                  data-ai-hint="detailed blue human hologram neural network"
                />
                
                {/* Visual heart core point */}
                <div className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full blur-[2px] shadow-[0_0_15px_#00ffff] animate-pulse z-20" />
                <div className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border border-primary/40 rounded-full animate-ping z-10" />
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Fats, Carbs, Proteins */}
        <div className="hidden md:flex flex-col gap-10 md:gap-14 items-center justify-center">
          <NeonGauge 
            label="ЖИРЫ" value={macros?.fat || 0}
            icon={<Moon className="h-6 w-6 text-[#EAB308]" />} color="#EAB308" 
            progress={getProgress(macros?.fat || 0, 80)}
          />
          <NeonGauge 
            label="УГЛЕВОДЫ" value={macros?.carbs || 0}
            icon={<Zap className="h-6 w-6 text-[#10B981]" />} color="#10B981" 
            progress={getProgress(macros?.carbs || 0, 300)}
          />
          <NeonGauge 
            label="БЕЛКИ" value={macros?.protein || 0}
            icon={<Beef className="h-6 w-6 text-[#A855F7]" />} color="#A855F7" 
            progress={getProgress(macros?.protein || 0, 150)}
          />
        </div>

      </div>

      {/* Decorative Overlays */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black via-black/80 to-transparent z-40 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black via-black/80 to-transparent z-40 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.05),transparent_70%)] pointer-events-none" />
    </div>
  );
}
