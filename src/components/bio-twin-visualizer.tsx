
'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Droplets, Flame, Moon, Zap, Footprints, Beef, Activity } from 'lucide-react';
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
    <div className={cn("flex flex-col items-center justify-center gap-2 group transition-all duration-500", className)}>
      <div className="text-white/40 group-hover:text-white transition-colors mb-1">
        {icon}
      </div>
      <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle cx="50%" cy="50%" r="42%" fill="none" stroke="white" strokeOpacity="0.05" strokeWidth="1" />
          <circle 
            cx="50%" cy="50%" r="42%" fill="none" stroke={color} strokeWidth="2" 
            strokeDasharray="100" strokeDashoffset={100 - (progress || 0)} pathLength="100" strokeLinecap="round"
            className="drop-shadow-[0_0_8px_currentColor] transition-all duration-1000"
          />
        </svg>
        <div className="text-center">
          <span className="text-lg md:text-2xl font-black text-white leading-none block">{value}</span>
        </div>
      </div>
      <span className="text-[8px] font-black uppercase text-white/30 tracking-[0.2em] group-hover:text-primary transition-colors">
        {label}
      </span>
    </div>
  );
};

export function BioTwinVisualizer({ score, deviceData, macros, className }: any) {
  const getProgress = (val: number, goal: number) => Math.min(100, (val / (goal || 1)) * 100);

  // Получаем путь к изображению голограммы. По умолчанию ищем в /public/hologram.png
  const hologramImage = PlaceHolderImages.find(img => img.id === 'digital-twin-hologram')?.imageUrl || '/hologram.png';

  return (
    <div className={cn("relative w-full h-full flex items-center justify-center overflow-hidden bg-black", className)}>
      
      {/* 3x3 HUD Layout */}
      <div className="relative z-30 grid grid-cols-3 w-full max-w-6xl h-full items-center px-4 md:px-10">
        
        {/* LEFT COLUMN: Water, Calories, Steps */}
        <div className="flex flex-col gap-6 md:gap-12 items-center justify-center">
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

        {/* CENTRAL COLUMN: The Human Hologram Image */}
        <div className="relative flex items-center justify-center h-full py-10">
          {/* Bio-Score floating badge */}
          <div className="absolute top-20 left-0 z-50">
             <div className="bg-black/60 backdrop-blur-xl px-4 py-2 rounded-xl border border-primary/30 shadow-[0_0_15px_rgba(0,255,255,0.2)] flex flex-col items-start animate-in slide-in-from-left-4">
                <p className="text-[6px] font-black text-primary/60 uppercase tracking-[0.3em]">NEURAL SYNC</p>
                <p className="text-xl font-black text-white leading-none">{score || 92}<span className="text-primary/40 text-[8px] ml-1">/100</span></p>
             </div>
          </div>
          
          <div className="relative w-full h-[55vh] flex items-center justify-center animate-hologram">
             <Image 
               src={hologramImage}
               alt="Digital Twin Hologram"
               fill
               className="object-contain drop-shadow-[0_0_20px_#00ffff]"
               priority
               unoptimized
             />
             
             {/* Heart Core Node - Наложенный элемент поверх изображения */}
             <div className="absolute top-[35%] left-1/2 -translate-x-1/2 z-40">
                <div className="relative w-6 h-6 flex items-center justify-center">
                   <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-30" />
                   <div className="w-2.5 h-2.5 rounded-full bg-primary neo-glow animate-pulse shadow-[0_0_15px_#00ffff]" />
                </div>
             </div>

             {/* Brain Node */}
             <div className="absolute top-[12%] left-1/2 -translate-x-1/2 z-40">
                <div className="w-1.5 h-1.5 rounded-full bg-primary/60 neo-glow shadow-[0_0_10px_#00ffff] animate-pulse" />
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Fats, Carbs, Proteins */}
        <div className="flex flex-col gap-6 md:gap-12 items-center justify-center">
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

      {/* Decorative Overlays */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black to-transparent z-40 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-40 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.03),transparent_70%)] pointer-events-none" />
    </div>
  );
}
