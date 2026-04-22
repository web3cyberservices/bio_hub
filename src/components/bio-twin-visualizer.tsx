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
    <div className={cn("flex flex-col items-center gap-2 transition-all duration-700", className)}>
      {/* Icon Above */}
      <div className="w-9 h-9 rounded-full bg-black/60 border border-white/10 flex items-center justify-center shadow-lg mb-1">
        {icon}
      </div>

      <div className="relative w-18 h-18 md:w-22 md:h-22 flex items-center justify-center">
        {/* Progress Ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle cx="50%" cy="50%" r="42%" fill="none" stroke="white" strokeOpacity="0.05" strokeWidth="3" />
          <circle 
            cx="50%" cy="50%" r="42%" fill="none" stroke={color} strokeWidth="5" 
            strokeDasharray="100" strokeDashoffset={100 - progress} pathLength="100" strokeLinecap="round"
            className="drop-shadow-[0_0_8px_currentColor] opacity-80 transition-all duration-1000"
            style={{ color }}
          />
        </svg>
        
        {/* Value */}
        <div className="text-center">
          <span className="text-lg md:text-xl font-black text-white leading-none block">{value}</span>
          <span className="text-[6px] font-bold text-white/30 uppercase tracking-tighter">{unitLabel}</span>
        </div>
      </div>

      {/* Label Below */}
      <div className="text-center">
        <span className="text-[8px] md:text-[10px] font-black uppercase text-white/50 tracking-[0.2em] block">{label}</span>
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

      {/* Grid Layout for Gauges */}
      <div className="relative w-full h-full max-w-6xl mx-auto flex items-center justify-between px-6 md:px-12 z-30">
        
        {/* Left Stack (3 Gauges) */}
        <div className="flex flex-col gap-6 md:gap-10">
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

        {/* Center: Main Hologram Human Asset */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[85%] flex items-center justify-center z-10 pointer-events-none">
          <div className="relative h-full aspect-[1/2.2] max-h-[75vh]">
            {/* Cyan Glow Layer */}
            <div className="absolute inset-0 bg-[#00ffff]/5 rounded-full blur-[80px] animate-pulse" />
            
            {hologramImg && (
              <Image
                src={hologramImg.imageUrl}
                alt="Digital Twin Hologram"
                fill
                className="object-contain drop-shadow-[0_0_35px_rgba(0,255,255,0.6)] animate-hologram mix-blend-screen"
                data-ai-hint={hologramImg.imageHint}
                priority
                unoptimized
              />
            )}
            
            {/* Heart Core Pulsation */}
            <div className="absolute top-[35%] left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rounded-full neo-glow animate-pulse z-20" />
            <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-2 h-2 bg-primary/40 rounded-full neo-glow animate-ping z-20" />

            {/* Scan Line Effect */}
            <div className="scan-line" />
          </div>

          {/* Bio-Score Central Tag - Positioned at feet */}
          <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2">
             <div className="bg-black/80 backdrop-blur-xl px-6 py-2 rounded-2xl border border-white/10 flex flex-col items-center gap-0 shadow-2xl">
                <p className="text-[7px] font-black text-white/40 uppercase tracking-[0.4em]">SYSTEM BIO-SCORE</p>
                <div className="flex items-center gap-2">
                   <Activity className="h-3 w-3 text-primary animate-pulse" />
                   <p className="text-2xl font-black text-primary neo-glow">{score || 0}</p>
                </div>
             </div>
          </div>
        </div>

        {/* Right Stack (3 Gauges) */}
        <div className="flex flex-col gap-6 md:gap-10">
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