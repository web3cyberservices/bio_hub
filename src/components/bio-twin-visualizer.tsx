'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Droplets, Flame, Zap, Droplet } from 'lucide-react';

interface IndicatorProps {
  label: string;
  value: number;
  unit: string;
  icon: React.ReactNode;
  color: string;
  position: 'left-top' | 'left-bottom' | 'right-top' | 'right-bottom';
  progress: number;
}

const CircularIndicator = ({ label, value, unit, icon, color, position, progress }: IndicatorProps) => {
  const posClasses = {
    'left-top': 'top-[15%] left-[5%] md:left-[10%]',
    'left-bottom': 'bottom-[15%] left-[5%] md:left-[10%]',
    'right-top': 'top-[15%] right-[5%] md:right-[10%]',
    'right-bottom': 'bottom-[15%] right-[5%] md:right-[10%]',
  };

  return (
    <div className={cn("absolute flex flex-col items-center gap-2 z-30 transition-all duration-700", posClasses[position])}>
      <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
        {/* Background Circle */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle cx="50%" cy="50%" r="42%" fill="none" stroke="white" strokeOpacity="0.05" strokeWidth="4" />
          <circle 
            cx="50%" cy="50%" r="42%" fill="none" stroke={color} strokeWidth="4" 
            strokeDasharray="100" strokeDashoffset={100 - progress} pathLength="100" strokeLinecap="round"
            className="drop-shadow-[0_0_8px_currentColor] opacity-80"
            style={{ color }}
          />
        </svg>
        
        {/* Icon Badge */}
        <div className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-black/60 border border-white/10 flex items-center justify-center shadow-lg">
          {icon}
        </div>

        {/* Value */}
        <div className="text-center">
          <span className="text-sm md:text-lg font-black text-white leading-none block">{value}</span>
        </div>
      </div>
      <div className="text-center space-y-0.5">
        <span className="text-[7px] md:text-[9px] font-black uppercase text-white/40 tracking-widest block">{label}</span>
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

  // Calculation for progress (mock logic if real goals aren't set)
  const getProgress = (val: number, goal: number) => Math.min(100, (val / (goal || 1)) * 100);

  return (
    <div className={cn("relative w-full h-full flex items-center justify-center overflow-hidden", className)}>
      
      {/* Background Atmosphere */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle,hsl(var(--primary)/0.3)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      {/* Symmetric Indicators */}
      <CircularIndicator 
        label="Вода" value={deviceData?.water || 0} unit="мл" 
        icon={<Droplets className="h-3 w-3 text-primary" />} color="#0EA5E9" 
        position="left-top" progress={getProgress(deviceData?.water || 0, 2000)}
      />
      <CircularIndicator 
        label="Ккал" value={macros?.calories || 0} unit="ккал" 
        icon={<Flame className="h-3 w-3 text-orange-500" />} color="#F97316" 
        position="left-bottom" progress={getProgress(macros?.calories || 0, 2500)}
      />
      <CircularIndicator 
        label="Жиры" value={macros?.fat || 0} unit="г" 
        icon={<Droplet className="h-3 w-3 text-yellow-500" />} color="#EAB308" 
        position="right-top" progress={getProgress(macros?.fat || 0, 80)}
      />
      <CircularIndicator 
        label="Углеводы" value={macros?.carbs || 0} unit="г" 
        icon={<Zap className="h-3 w-3 text-emerald-500" />} color="#10B981" 
        position="right-bottom" progress={getProgress(macros?.carbs || 0, 300)}
      />

      {/* Main Hologram Container */}
      <div className="relative w-full h-full max-h-[75vh] flex items-center justify-center z-10">
        
        {/* Core Cyan Glow */}
        <div className="absolute top-[30%] w-64 h-64 bg-[#00ffff]/10 rounded-full blur-[100px] animate-pulse" />
        
        {/* Scanning Effect */}
        <div className="scan-line !opacity-10 !h-[1px] !bg-[#00ffff]" />

        <div className="relative h-[85%] aspect-[1/2] transition-transform duration-1000">
          {hologramImg && (
            <Image
              src={hologramImg.imageUrl}
              alt="Digital Twin Hologram"
              fill
              className="object-contain drop-shadow-[0_0_35px_rgba(0,255,255,0.4)] animate-hologram"
              data-ai-hint={hologramImg.imageHint}
              priority
              unoptimized
            />
          )}
          
          {/* Heart Pulsing Node */}
          <div className="absolute top-[28%] left-[49%] -translate-x-1/2 w-4 h-4 z-20">
            <div className="absolute inset-0 bg-[#00ffff] rounded-full animate-ping opacity-40" />
            <div className="absolute inset-1 bg-[#00ffff] rounded-full shadow-[0_0_15px_#00ffff]" />
          </div>

          {/* Brain Glow */}
          <div className="absolute top-[8%] left-[50%] -translate-x-1/2 w-6 h-6 z-20">
            <div className="absolute inset-0 bg-[#00ffff]/20 rounded-full animate-pulse blur-md" />
            <div className="absolute inset-2 bg-[#00ffff]/40 rounded-full shadow-[0_0_10px_#00ffff]" />
          </div>
        </div>

        {/* Steps/BPM Overlay Info as seen in ref */}
        <div className="absolute right-[5%] bottom-[40%] flex flex-col items-end gap-1 opacity-60">
           <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
              <span className="text-[8px] font-black text-white/50 uppercase">Steps</span>
              <span className="text-xs font-black text-white">{deviceData?.steps || '0'}</span>
           </div>
        </div>
      </div>

      {/* Bio-Score Central Overlay at Bottom */}
      <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 z-40 flex flex-col items-center">
        <div className="bg-black/60 backdrop-blur-2xl border border-white/10 px-8 py-3 rounded-full shadow-2xl">
           <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[7px] font-black text-primary/60 uppercase tracking-widest block">Bio-Score</span>
                <span className="text-xl font-black text-white leading-none">{score}</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-left">
                <span className="text-[7px] font-black text-white/30 uppercase tracking-widest block">Status</span>
                <span className="text-[9px] font-black text-emerald-400 uppercase">Optimized</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
