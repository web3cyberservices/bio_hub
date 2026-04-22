'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Droplets, Flame, Zap, Droplet, Moon } from 'lucide-react';

interface IndicatorProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  position: 'left-top' | 'left-bottom' | 'right-top' | 'right-bottom';
  progress: number;
  unitLabel: string;
}

const CircularIndicator = ({ label, value, icon, color, position, progress, unitLabel }: IndicatorProps) => {
  const posClasses = {
    'left-top': 'top-[20%] left-[10%] md:left-[15%]',
    'left-bottom': 'bottom-[20%] left-[10%] md:left-[15%]',
    'right-top': 'top-[20%] right-[10%] md:right-[15%]',
    'right-bottom': 'bottom-[20%] right-[10%] md:right-[15%]',
  };

  return (
    <div className={cn("absolute flex flex-col items-center gap-2 z-30 transition-all duration-700", posClasses[position])}>
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

      {/* Symmetric Indicators exactly as in reference */}
      <CircularIndicator 
        label="ВОДА" value={deviceData?.water || 0} unitLabel="ВОДА"
        icon={<Droplets className="h-4 w-4 text-[#0EA5E9]" />} color="#0EA5E9" 
        position="left-top" progress={getProgress(deviceData?.water || 0, 2000)}
      />
      <CircularIndicator 
        label="ККАЛ" value={macros?.calories || 0} unitLabel="ККАЛ"
        icon={<Flame className="h-4 w-4 text-[#F97316]" />} color="#F97316" 
        position="left-bottom" progress={getProgress(macros?.calories || 0, 2500)}
      />
      <CircularIndicator 
        label="ЖИРЫ" value={macros?.fat || 0} unitLabel="ЖИРЫ"
        icon={<Moon className="h-4 w-4 text-[#EAB308]" />} color="#EAB308" 
        position="right-top" progress={getProgress(macros?.fat || 0, 80)}
      />
      <CircularIndicator 
        label="УГЛЕВОДЫ" value={macros?.carbs || 0} unitLabel="УГЛЕВОДЫ"
        icon={<Zap className="h-4 w-4 text-[#10B981]" />} color="#10B981" 
        position="right-bottom" progress={getProgress(macros?.carbs || 0, 300)}
      />

      {/* Main Hologram Asset */}
      <div className="relative w-full h-[70vh] flex items-center justify-center z-10">
        
        {/* Glow behind */}
        <div className="absolute top-[30%] w-80 h-80 bg-[#00ffff]/10 rounded-full blur-[120px] animate-pulse" />

        <div className="relative h-full aspect-[1/2] transition-transform duration-1000 group">
          {hologramImg && (
            <Image
              src={hologramImg.imageUrl}
              alt="Digital Twin Hologram"
              fill
              className="object-contain drop-shadow-[0_0_40px_rgba(0,255,255,0.3)] animate-hologram"
              data-ai-hint={hologramImg.imageHint}
              priority
              unoptimized
            />
          )}
          
          {/* Glowing Brain Node */}
          <div className="absolute top-[5%] left-[50%] -translate-x-1/2 w-8 h-8 z-20">
            <div className="absolute inset-0 bg-[#00ffff]/30 rounded-full blur-xl animate-pulse" />
            <div className="absolute inset-2 bg-[#00ffff]/60 rounded-full shadow-[0_0_20px_#00ffff]" />
          </div>

          {/* Glowing Heart Node (The Pulse) */}
          <div className="absolute top-[25%] left-[49%] -translate-x-1/2 w-6 h-6 z-20">
            <div className="absolute inset-0 bg-[#00ffff] rounded-full animate-ping opacity-30" />
            <div className="absolute inset-1 bg-[#00ffff] rounded-full shadow-[0_0_25px_#00ffff] border border-white/20" />
          </div>
        </div>

        {/* Floating Steps Widget */}
        <div className="absolute right-[5%] top-[45%] opacity-60">
           <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex flex-col items-center gap-1 shadow-2xl">
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-white">{deviceData?.steps || '0'}</span>
                <span className="text-[8px] font-black text-white/40 uppercase">STEP</span>
              </div>
              <span className="text-[6px] font-black text-primary uppercase tracking-[0.2em]">ЗНЕИ</span>
           </div>
        </div>
      </div>
    </div>
  );
}