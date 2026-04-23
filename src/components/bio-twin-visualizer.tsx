'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Droplets, Flame, Moon, Zap, Footprints, Activity } from 'lucide-react';

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
    <div className={cn("flex flex-col items-center gap-2 transition-all duration-700", className)}>
      <div className="text-white/60 mb-1 scale-90 md:scale-100">{icon}</div>
      <div className="relative w-20 h-20 md:w-24 md:h-24 flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle cx="50%" cy="50%" r="42%" fill="none" stroke="white" strokeOpacity="0.05" strokeWidth="1" />
          <circle 
            cx="50%" cy="50%" r="42%" fill="none" stroke={color} strokeWidth="2" 
            strokeDasharray="100" strokeDashoffset={100 - (progress || 0)} pathLength="100" strokeLinecap="round"
            className="drop-shadow-[0_0_8px_currentColor] opacity-80 transition-all duration-1000"
          />
        </svg>
        <div className="text-center">
          <span className="text-xl md:text-2xl font-black text-white leading-none block">{value}</span>
        </div>
      </div>
      <span className="text-[8px] font-black uppercase text-white/40 tracking-[0.2em] mt-1">{label}</span>
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
      
      {/* BACKGROUND AMBIENCE */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.08),transparent_70%)] pointer-events-none" />
      
      {/* MAIN HUD GRID */}
      <div className="relative w-full max-w-6xl mx-auto grid grid-cols-12 items-center px-6 z-30 h-full gap-4">
        
        {/* LEFT COLUMN: Water & Kcal */}
        <div className="col-span-3 flex flex-col gap-12 md:gap-20 items-center justify-center">
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

        {/* CENTER COLUMN: The Human Hologram */}
        <div className="col-span-6 relative flex items-center justify-center h-full w-full">
          <div className="relative w-full max-h-[55vh] aspect-[1/2] flex items-center justify-center animate-hologram">
            {hologramImg && (
              <div className="relative w-full h-full flex items-center justify-center transition-transform duration-[4000ms] ease-in-out hover:scale-105">
                <Image
                  src={hologramImg.imageUrl}
                  alt="Neural Human Hologram"
                  fill
                  style={{ 
                    objectFit: 'contain', 
                    filter: 'drop-shadow(0 0 30px rgba(0,255,255,0.5))' 
                  }}
                  className="mix-blend-screen opacity-90"
                  priority
                  unoptimized
                />
              </div>
            )}
            
            {/* CORE BIOMETRIC NODES */}
            {/* Heart Core Dot */}
            <div className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-40">
               <div className="relative">
                  <div className="w-4 h-4 bg-[#00ffff] rounded-full shadow-[0_0_20px_#00ffff] animate-pulse" />
                  <div className="absolute inset-0 w-full h-full bg-[#00ffff] rounded-full animate-ping opacity-30" />
               </div>
            </div>

            {/* Brain Neural Glow */}
            <div className="absolute top-[10%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-40">
               <div className="w-12 h-12 bg-[#00ffff]/20 rounded-full blur-xl animate-pulse" />
            </div>
            
            {/* BIO-SCORE HUD */}
            <div className="absolute top-[5%] left-0 z-40 animate-in fade-in slide-in-from-left duration-1000">
               <div className="bg-black/60 backdrop-blur-2xl px-5 py-3 rounded-2xl border border-white/10 flex flex-col items-start shadow-2xl">
                  <p className="text-[7px] font-black text-[#00ffff]/60 uppercase tracking-[0.3em]">NEURAL SYNC</p>
                  <p className="text-2xl font-black text-white leading-none">{score || 0}<span className="text-[#00ffff]/40 text-[10px] ml-1">/100</span></p>
                  <div className="w-full h-0.5 bg-white/5 mt-2 rounded-full overflow-hidden">
                     <div className="h-full bg-primary animate-pulse" style={{ width: `${score || 0}%` }} />
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Fats & Carbs & Steps */}
        <div className="col-span-3 flex flex-col gap-12 md:gap-20 items-center justify-center relative">
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
          
          {/* STEP HUD */}
          <div className="absolute -bottom-10 right-0 flex items-center gap-3 bg-white/5 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/10 shadow-xl group transition-all hover:border-primary/40">
             <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Footprints className="h-5 w-5 text-primary neo-glow animate-pulse" />
             </div>
             <div className="flex flex-col">
                <span className="text-white font-black text-lg leading-none">{deviceData?.steps || 0}</span>
                <span className="text-[7px] font-bold text-white/30 uppercase tracking-[0.2em]">STEP PROTOCOL</span>
             </div>
          </div>
        </div>

      </div>

      {/* OVERLAY DECOR */}
      <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-black to-transparent pointer-events-none" />
    </div>
  );
}
