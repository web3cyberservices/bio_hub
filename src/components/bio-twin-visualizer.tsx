'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Droplets, Flame, Moon, Zap, Footprints, Beef, Activity, Heart } from 'lucide-react';

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
      <span className="text-[10px] font-black uppercase text-white/30 tracking-[0.3em] group-hover:text-primary transition-colors">
        {label}
      </span>
    </div>
  );
};

export function BioTwinVisualizer({ score, deviceData, macros, className }: any) {
  const getProgress = (val: number, goal: number) => Math.min(100, (val / (goal || 1)) * 100);

  // Мы ожидаем, что пользователь загрузит присланное изображение в public/hologram.png
  const hologramSrc = "/hologram.png";

  return (
    <div className={cn("relative w-full h-full flex items-center justify-center overflow-hidden bg-black", className)}>
      
      {/* HUD Grid Layout 3x3 */}
      <div className="relative z-30 grid grid-cols-3 w-full max-w-7xl h-full items-center px-6 md:px-12">
        
        {/* LEFT COLUMN: Water, Calories, Steps */}
        <div className="flex flex-col gap-10 md:gap-16 items-center justify-center">
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

        {/* CENTRAL COLUMN: The Human Hologram Image */}
        <div className="relative flex items-center justify-center h-full py-20">
          {/* Bio-Score floating badge */}
          <div className="absolute top-[15%] -left-[10%] z-50">
             <div className="bg-black/60 backdrop-blur-2xl px-6 py-3 rounded-2xl border border-[#00ffff]/30 shadow-[0_0_30px_rgba(0,255,255,0.2)] flex flex-col items-start animate-in slide-in-from-left-8 duration-700">
                <p className="text-[8px] font-black text-[#00ffff]/60 uppercase tracking-[0.4em] mb-1">NEURAL SYNC</p>
                <p className="text-2xl md:text-4xl font-black text-white leading-none">
                  {score || 92}<span className="text-[#00ffff]/40 text-[12px] ml-1">/100</span>
                </p>
                <div className="h-1 w-full bg-white/5 rounded-full mt-2 overflow-hidden">
                   <div className="h-full bg-[#00ffff] w-[92%] shadow-[0_0_10px_#00ffff]" />
                </div>
             </div>
          </div>
          
          <div className="relative w-full h-[65vh] flex items-center justify-center animate-hologram">
             {/* Основное изображение голограммы */}
             <div className="relative w-full h-full">
                <Image 
                  src={hologramSrc}
                  alt="Neural Digital Twin"
                  fill
                  className="object-contain drop-shadow-[0_0_35px_#00ffff]"
                  priority
                  unoptimized
                />
             </div>
             
             {/* Heart Core Node - Пульсирующее ядро на месте сердца */}
             <div className="absolute top-[34%] left-1/2 -translate-x-1/2 z-40">
                <div className="relative w-8 h-8 flex items-center justify-center">
                   <div className="absolute inset-0 bg-[#00ffff]/40 rounded-full animate-ping opacity-30" />
                   <div className="w-3 h-3 rounded-full bg-[#00ffff] shadow-[0_0_20px_#00ffff] animate-pulse" />
                </div>
             </div>

             {/* Brain Node - Мягкое свечение мозга */}
             <div className="absolute top-[10%] left-1/2 -translate-x-1/2 z-40">
                <div className="w-2 h-2 rounded-full bg-[#00ffff]/60 shadow-[0_0_15px_#00ffff] animate-pulse" />
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Fats, Carbs, Proteins */}
        <div className="flex flex-col gap-10 md:gap-16 items-center justify-center">
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

      {/* Decorative Scan Line */}
      <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
         <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-[#00ffff]/20 to-transparent absolute animate-scan-slow shadow-[0_0_15px_#00ffff]" />
      </div>

      {/* Overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.05),transparent_70%)] pointer-events-none" />
    </div>
  );
}
