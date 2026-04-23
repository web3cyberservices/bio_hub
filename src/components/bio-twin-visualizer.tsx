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
    <div className={cn("flex flex-col items-center gap-2 group transition-all duration-500", className)}>
      <div className="text-white/40 group-hover:text-white transition-colors mb-1">{icon}</div>
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
          <span className="text-sm md:text-lg font-black text-white leading-none block">{value}</span>
        </div>
      </div>
      <span className="text-[7px] font-black uppercase text-white/30 tracking-[0.2em] group-hover:text-primary/60 transition-colors mt-1">{label}</span>
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
  const getProgress = (val: number, goal: number) => Math.min(100, (val / (goal || 1)) * 100);

  return (
    <div className={cn("relative w-full h-full flex items-center justify-center overflow-hidden bg-black", className)}>
      
      {/* BACKGROUND DECOR */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.08),transparent_70%)] pointer-events-none" />
      
      {/* MAIN 3-COLUMN GRID */}
      <div className="relative z-30 grid grid-cols-12 w-full max-w-7xl h-full items-center px-4 md:px-10 gap-4">
        
        {/* LEFT COLUMN: Metrics (3 Gauges) */}
        <div className="col-span-3 flex flex-col gap-6 md:gap-10 items-center justify-center">
          <NeonGauge 
            label="ВОДА" value={deviceData?.water || 0}
            icon={<Droplets className="h-4 w-4 text-[#0EA5E9]" />} color="#0EA5E9" 
            progress={getProgress(deviceData?.water || 0, 2000)}
          />
          <NeonGauge 
            label="ККАЛ" value={macros?.calories || 0}
            icon={<Flame className="h-4 w-4 text-[#F97316]" />} color="#F97316" 
            progress={getProgress(macros?.calories || 0, 2500)}
          />
          <NeonGauge 
            label="ШАГИ" value={deviceData?.steps || 0}
            icon={<Footprints className="h-4 w-4 text-[#00ffff]" />} color="#00ffff" 
            progress={getProgress(deviceData?.steps || 0, 10000)}
          />
        </div>

        {/* CENTER COLUMN: THE HOLOGRAM HUMAN */}
        <div className="col-span-6 relative flex items-center justify-center h-full">
          <div className="relative w-full h-full max-h-[55vh] flex items-center justify-center animate-hologram">
            
            {/* THE HUMAN IMAGE (ASSET image_12.png equivalent) */}
            <div className="relative w-full h-full flex items-center justify-center">
              <Image 
                src="https://picsum.photos/seed/hologram_detailed_12/800/1200" 
                alt="Digital Twin Hologram"
                fill
                className="object-contain drop-shadow-[0_0_20px_#00ffff]"
                priority
                unoptimized
                data-ai-hint="detailed blue human hologram neural network"
              />
              
              {/* OVERLAY: ACTIVE BRAIN GLOW */}
              <div className="absolute top-[3%] left-1/2 -translate-x-1/2 w-6 h-6 bg-[#00ffff]/20 blur-lg rounded-full animate-pulse" />
              
              {/* OVERLAY: ACTIVE HEART CORE */}
              <div className="absolute top-[28%] left-1/2 -translate-x-1/2 z-40">
                <div className="relative">
                  <div className="w-4 h-4 bg-[#00ffff] rounded-full shadow-[0_0_20px_#00ffff] animate-pulse" />
                  <div className="absolute inset-0 w-full h-full bg-[#00ffff] rounded-full animate-ping opacity-40" />
                </div>
              </div>
            </div>

            {/* FLOATING HUD: NEURAL SYNC (BIO-SCORE) */}
            <div className="absolute top-0 left-0 md:-left-8 z-50">
               <div className="bg-black/60 backdrop-blur-xl px-4 py-2 rounded-xl border border-primary/30 shadow-2xl flex flex-col items-start">
                  <p className="text-[6px] font-black text-primary/60 uppercase tracking-[0.3em]">NEURAL SYNC</p>
                  <p className="text-xl font-black text-white leading-none">{score || 92}<span className="text-primary/40 text-[8px] ml-1">/100</span></p>
                  <div className="w-16 h-0.5 bg-white/5 mt-2 rounded-full overflow-hidden">
                     <div className="h-full bg-primary animate-pulse" style={{ width: `${score || 92}%` }} />
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Metrics (3 Gauges) */}
        <div className="col-span-3 flex flex-col gap-6 md:gap-10 items-center justify-center">
          <NeonGauge 
            label="ЖИРЫ" value={macros?.fat || 0}
            icon={<Moon className="h-4 w-4 text-[#EAB308]" />} color="#EAB308" 
            progress={getProgress(macros?.fat || 0, 80)}
          />
          <NeonGauge 
            label="УГЛЕВОДЫ" value={macros?.carbs || 0}
            icon={<Zap className="h-4 w-4 text-[#10B981]" />} color="#10B981" 
            progress={getProgress(macros?.carbs || 0, 300)}
          />
          <NeonGauge 
            label="БЕЛКИ" value={macros?.protein || 0}
            icon={<Beef className="h-4 w-4 text-[#A855F7]" />} color="#A855F7" 
            progress={getProgress(macros?.protein || 0, 150)}
          />
        </div>

      </div>

      {/* OVERLAY VIGNETTE */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black to-transparent z-40 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-40 pointer-events-none" />
    </div>
  );
}
