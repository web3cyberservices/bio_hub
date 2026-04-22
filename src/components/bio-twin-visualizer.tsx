'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Droplets, Flame, Zap, Droplet, Moon, Footprints, Beef, Activity } from 'lucide-react';

interface IndicatorProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  progress: number;
  unitLabel: string;
  className?: string;
}

const CircularIndicator = ({ label, value, icon, color, progress, unitLabel, className }: IndicatorProps) => {
  return (
    <div className={cn("flex flex-col items-center gap-1.5 transition-all duration-700", className)}>
      {/* Icon Above */}
      <div className="w-8 h-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center shadow-lg">
        {icon}
      </div>

      <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
        {/* Progress Ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle cx="50%" cy="50%" r="42%" fill="none" stroke="white" strokeOpacity="0.05" strokeWidth="2" />
          <circle 
            cx="50%" cy="50%" r="42%" fill="none" stroke={color} strokeWidth="4" 
            strokeDasharray="100" strokeDashoffset={100 - progress} pathLength="100" strokeLinecap="round"
            className="drop-shadow-[0_0_8px_currentColor] opacity-80 transition-all duration-1000"
            style={{ color }}
          />
        </svg>
        
        {/* Value */}
        <div className="text-center">
          <span className="text-base md:text-lg font-black text-white leading-none block">{value}</span>
          <span className="text-[5px] font-bold text-white/30 uppercase tracking-tighter">{unitLabel}</span>
        </div>
      </div>

      {/* Label Below */}
      <div className="text-center">
        <span className="text-[7px] md:text-[9px] font-black uppercase text-white/50 tracking-[0.2em] block">{label}</span>
      </div>
    </div>
  );
};

interface BioTwinVisualizerProps {
  score: number;
  deviceData?: any;
  macros?: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
  className?: string;
}

export function BioTwinVisualizer({ score, deviceData, macros, className }: BioTwinVisualizerProps) {
  const hologramImg = PlaceHolderImages.find(img => img.id === 'digital-twin-hologram');

  const getProgress = (val: number, goal: number) => Math.min(100, (val / (goal || 1)) * 100);

  return (
    <div className={cn("relative w-full h-full flex items-center justify-center overflow-hidden bg-[#010409]", className)}>
      
      {/* Background Atmosphere */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle,hsl(var(--primary)/0.15)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      {/* 3-Column Grid Layout */}
      <div className="relative w-full max-w-5xl mx-auto grid grid-cols-3 items-center px-4 md:px-8 z-30 h-full max-h-[85vh]">
        
        {/* Left Column (Stack 3) */}
        <div className="flex flex-col justify-between py-10 h-[55vh]">
          <CircularIndicator 
            label="ВОДА" value={deviceData?.water || 0} unitLabel="МЛ"
            icon={<Droplets className="h-4 w-4 text-[#0EA5E9]" />} color="#0EA5E9" 
            progress={getProgress(deviceData?.water || 0, 2000)}
          />
          <CircularIndicator 
            label="ККАЛ" value={macros?.calories || 0} unitLabel="ККАЛ"
            icon={<Flame className="h-4 w-4 text-[#F97316]" />} color="#F97316" 
            progress={getProgress(macros?.calories || 0, 2500)}
          />
          <CircularIndicator 
            label="ШАГИ" value={deviceData?.steps || 0} unitLabel="ЗНЕИ"
            icon={<Footprints className="h-4 w-4 text-[#00FFFF]" />} color="#00FFFF" 
            progress={getProgress(deviceData?.steps || 0, 10000)}
          />
        </div>

        {/* Center Column (Human Hologram ONLY) */}
        <div className="relative flex flex-col items-center justify-center h-[55vh] w-full">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Hologram Image with Max-Height constraint */}
            {hologramImg && (
              <div className="relative w-full h-full max-h-[55vh] flex items-center justify-center">
                <Image
                  src={hologramImg.imageUrl}
                  alt="Digital Twin Hologram"
                  fill
                  style={{ objectFit: 'contain', filter: 'drop-shadow(0 0 20px #00ffff)' }}
                  className="animate-hologram mix-blend-screen"
                  data-ai-hint={hologramImg.imageHint}
                  priority
                  unoptimized
                />
              </div>
            )}
            
            {/* Vitality Core */}
            <div className="absolute top-[40%] left-1/2 -translate-x-1/2 w-4 h-4 bg-primary/40 rounded-full neo-glow animate-ping z-20" />
            <div className="absolute top-[40%] left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rounded-full neo-glow z-20" />

            {/* Scan Line */}
            <div className="scan-line !opacity-30" />
          </div>

          {/* Floating Bio-Score Tag */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-40">
             <div className="bg-black/60 backdrop-blur-xl px-5 py-1.5 rounded-2xl border border-white/10 flex flex-col items-center gap-0 shadow-2xl">
                <p className="text-[6px] font-black text-white/40 uppercase tracking-[0.3em]">SYSTEM BIO-SCORE</p>
                <div className="flex items-center gap-1.5">
                   <Activity className="h-3 w-3 text-primary animate-pulse" />
                   <p className="text-xl font-black text-primary neo-glow">{score || 0}</p>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column (Stack 3) */}
        <div className="flex flex-col justify-between py-10 h-[55vh]">
          <CircularIndicator 
            label="ЖИРЫ" value={macros?.fat || 0} unitLabel="ГР"
            icon={<Moon className="h-4 w-4 text-[#EAB308]" />} color="#EAB308" 
            progress={getProgress(macros?.fat || 0, 80)}
          />
          <CircularIndicator 
            label="УГЛЕВОДЫ" value={macros?.carbs || 0} unitLabel="ГР"
            icon={<Zap className="h-4 w-4 text-[#10B981]" />} color="#10B981" 
            progress={getProgress(macros?.carbs || 0, 300)}
          />
          <CircularIndicator 
            label="БЕЛКИ" value={macros?.protein || 0} unitLabel="ГР"
            icon={<Beef className="h-4 w-4 text-[#A855F7]" />} color="#A855F7" 
            progress={getProgress(macros?.protein || 0, 150)}
          />
        </div>

      </div>
    </div>
  );
}
