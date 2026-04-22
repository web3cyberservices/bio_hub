'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Droplets, Flame, Zap, Droplet, Moon, Footprints, Beef } from 'lucide-react';

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
      <div className="w-10 h-10 rounded-full bg-black/40 border border-white/10 flex items-center justify-center shadow-lg mb-1">
        {icon}
      </div>

      <div className="relative w-20 h-20 md:w-24 md:h-24 flex items-center justify-center">
        {/* Progress Ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle cx="50%" cy="50%" r="40%" fill="none" stroke="white" strokeOpacity="0.05" strokeWidth="4" />
          <circle 
            cx="50%" cy="50%" r="40%" fill="none" stroke={color} strokeWidth="6" 
            strokeDasharray="100" strokeDashoffset={100 - progress} pathLength="100" strokeLinecap="round"
            className="drop-shadow-[0_0_12px_currentColor] opacity-90 transition-all duration-1000"
            style={{ color }}
          />
        </svg>
        
        {/* Value */}
        <div className="text-center">
          <span className="text-xl md:text-2xl font-black text-white leading-none block">{value}</span>
          <span className="text-[7px] font-bold text-white/30 uppercase tracking-tighter">{unitLabel}</span>
        </div>
      </div>

      {/* Label Below */}
      <div className="text-center">
        <span className="text-[9px] md:text-[11px] font-black uppercase text-white/50 tracking-[0.2em] block">{label}</span>
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
      
      {/* Background Grid & Atmos */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle,hsl(var(--primary)/0.2)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:100px_100px]" />
      </div>

      {/* Left Stack */}
      <div className="absolute left-[5%] md:left-[10%] top-1/2 -translate-y-1/2 flex flex-col gap-8 md:gap-12 z-30">
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

      {/* Right Stack */}
      <div className="absolute right-[5%] md:right-[10%] top-1/2 -translate-y-1/2 flex flex-col gap-8 md:gap-12 z-30">
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

      {/* Main Hologram Asset */}
      <div className="relative w-full h-[75vh] flex items-center justify-center z-10 px-4">
        {/* Glow behind */}
        <div className="absolute top-[30%] w-80 h-80 bg-[#00ffff]/10 rounded-full blur-[120px] animate-pulse" />

        <div className="relative h-full aspect-[1/2] transition-transform duration-1000 group max-h-[70vh]">
          {hologramImg && (
            <Image
              src={hologramImg.imageUrl}
              alt="Digital Twin Hologram"
              fill
              className="object-contain drop-shadow-[0_0_40px_rgba(0,255,255,0.4)] animate-hologram"
              data-ai-hint={hologramImg.imageHint}
              priority
              unoptimized
            />
          )}
        </div>

        {/* Bio-Score Central Label */}
        <div className="absolute bottom-[15%] left-1/2 -translate-x-1/2">
           <div className="bg-black/60 backdrop-blur-md px-6 py-2 rounded-2xl border border-white/10 flex flex-col items-center gap-0 shadow-2xl">
              <p className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em]">Bio-Score</p>
              <p className="text-2xl font-black text-primary neo-glow">{score || 0}</p>
           </div>
        </div>
      </div>
    </div>
  );
}