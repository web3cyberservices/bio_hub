'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Droplets, Flame, Moon, Zap, Footprints, Beef } from 'lucide-react';

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
    <div className={cn("flex flex-col items-center gap-1 transition-all duration-700", className)}>
      <div className="text-white/40 mb-1">{icon}</div>
      <div className="relative w-20 h-20 md:w-24 md:h-24 flex items-center justify-center">
        {/* Neon Ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle cx="50%" cy="50%" r="45%" fill="none" stroke="white" strokeOpacity="0.05" strokeWidth="1" />
          <circle 
            cx="50%" cy="50%" r="45%" fill="none" stroke={color} strokeWidth="1.5" 
            strokeDasharray="100" strokeDashoffset={100 - progress} pathLength="100" strokeLinecap="round"
            className="drop-shadow-[0_0_5px_currentColor] opacity-90 transition-all duration-1000"
          />
        </svg>
        <div className="text-center">
          <span className="text-xl md:text-2xl font-black text-white leading-none block">{value}</span>
        </div>
      </div>
      <span className="text-[8px] font-black uppercase text-white/50 tracking-widest mt-1">{label}</span>
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
    <div className={cn("relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-black", className)}>
      
      {/* 3-Column Layout: Metrics | Human | Metrics */}
      <div className="relative w-full max-w-6xl mx-auto grid grid-cols-3 items-center px-6 z-30 h-full">
        
        {/* Left Column (Water & Kcal) */}
        <div className="flex flex-col gap-16 items-center justify-center h-full">
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
        </div>

        {/* Center Column (Human Hologram) */}
        <div className="relative flex items-center justify-center h-full w-full">
          <div className="relative w-full h-[55vh] flex items-center justify-center animate-hologram">
            {hologramImg && (
              <div className="relative w-full h-full">
                <Image
                  src={hologramImg.imageUrl}
                  alt="Human Hologram"
                  fill
                  style={{ objectFit: 'contain', filter: 'drop-shadow(0 0 20px #00ffff)' }}
                  className="mix-blend-screen opacity-90"
                  priority
                  unoptimized
                />
              </div>
            )}
            
            {/* Heart Core Dot */}
            <div className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-[#00ffff] rounded-full shadow-[0_0_15px_#00ffff] animate-pulse z-40" />
            
            {/* Bio-Score floating label */}
            <div className="absolute top-[15%] -left-4 z-40">
               <div className="bg-black/60 backdrop-blur-xl px-4 py-1.5 rounded-xl border border-white/10 flex flex-col items-start gap-0">
                  <p className="text-[6px] font-black text-white/40 uppercase tracking-[0.2em]">BIO-SCORE 4.0</p>
                  <p className="text-xl font-black text-[#00ffff]">{score || 92}<span className="text-white/30 text-[10px]">/100</span></p>
               </div>
            </div>
          </div>
        </div>

        {/* Right Column (Fats & Carbs & Steps) */}
        <div className="flex flex-col gap-12 items-center justify-center h-full relative">
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
          
          {/* Step Counter (Separate) */}
          <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/10 mt-4">
             <Footprints className="h-5 w-5 text-[#00ffff]" />
             <div className="flex flex-col">
                <span className="text-white font-black text-lg leading-none">{deviceData?.steps || 0}</span>
                <span className="text-[7px] font-bold text-white/40 uppercase tracking-widest">STEP</span>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
