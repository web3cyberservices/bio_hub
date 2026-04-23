'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Droplets, Flame, Moon, Zap, Footprints } from 'lucide-react';

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
      <div className="relative w-24 h-24 md:w-28 md:h-28 flex items-center justify-center">
        {/* Neon Ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle cx="50%" cy="50%" r="45%" fill="none" stroke="white" strokeOpacity="0.05" strokeWidth="1" />
          <circle 
            cx="50%" cy="50%" r="45%" fill="none" stroke={color} strokeWidth="1.5" 
            strokeDasharray="100" strokeDashoffset={100 - progress} pathLength="100" strokeLinecap="round"
            className="drop-shadow-[0_0_8px_currentColor] opacity-80 transition-all duration-1000"
          />
        </svg>
        <div className="text-center">
          <span className="text-2xl md:text-3xl font-black text-white leading-none block">{value}</span>
        </div>
      </div>
      <span className="text-[9px] font-black uppercase text-white/40 tracking-[0.2em] mt-1">{label}</span>
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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.05),transparent_70%)] pointer-events-none" />
      
      {/* MAIN 3-COLUMN TERMINAL GRID */}
      <div className="relative w-full max-w-7xl mx-auto grid grid-cols-12 items-center px-6 z-30 h-full">
        
        {/* LEFT COLUMN: Water & Kcal */}
        <div className="col-span-3 flex flex-col gap-16 md:gap-24 items-center justify-center h-full">
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
        </div>

        {/* CENTER COLUMN: The Digital Twin Hologram */}
        <div className="col-span-6 relative flex items-center justify-center h-full w-full">
          <div className="relative w-full h-[55vh] flex items-center justify-center group">
            {/* Breathing Hologram Asset */}
            {hologramImg && (
              <div className="relative w-full h-full animate-hologram transition-transform duration-[4000ms] ease-in-out">
                <Image
                  src={hologramImg.imageUrl}
                  alt="Neural Human Hologram"
                  fill
                  style={{ 
                    objectFit: 'contain', 
                    filter: 'drop-shadow(0 0 25px rgba(0,255,255,0.4))' 
                  }}
                  className="mix-blend-screen opacity-90 transition-all"
                  priority
                  unoptimized
                />
              </div>
            )}
            
            {/* CORE BIOMETRIC NODES (Heart & Brain) */}
            {/* Heart Pulsing Core */}
            <div className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-40">
               <div className="relative">
                  <div className="w-3 h-3 bg-[#00ffff] rounded-full shadow-[0_0_20px_#00ffff] animate-pulse" />
                  <div className="absolute inset-0 w-full h-full bg-[#00ffff] rounded-full animate-ping opacity-40" />
               </div>
            </div>

            {/* Brain Neural Activity */}
            <div className="absolute top-[12%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-40">
               <div className="w-2 h-2 bg-[#00ffff] rounded-full blur-[2px] shadow-[0_0_15px_#00ffff] opacity-60 animate-pulse" />
            </div>
            
            {/* BIO-SCORE FLOATING HUD */}
            <div className="absolute top-[10%] left-0 md:left-4 z-40">
               <div className="bg-black/60 backdrop-blur-2xl px-5 py-3 rounded-2xl border border-white/10 flex flex-col items-start gap-0 shadow-2xl">
                  <p className="text-[7px] font-black text-[#00ffff]/60 uppercase tracking-[0.3em]">NEURAL SYNC</p>
                  <p className="text-2xl font-black text-white leading-none">{score || 92}<span className="text-[#00ffff]/40 text-[10px] ml-1">/100</span></p>
                  <div className="w-full h-0.5 bg-white/5 mt-2 rounded-full overflow-hidden">
                     <div className="h-full bg-primary animate-pulse" style={{ width: `${score || 92}%` }} />
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Fats & Carbs & Steps */}
        <div className="col-span-3 flex flex-col gap-16 md:gap-24 items-center justify-center h-full relative">
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
          
          {/* STEP HUD (Positioned like the reference) */}
          <div className="absolute bottom-10 right-0 flex items-center gap-4 bg-white/5 backdrop-blur-xl px-6 py-3 rounded-[1.5rem] border border-white/10 shadow-xl group transition-all hover:border-primary/40">
             <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Footprints className="h-6 w-6 text-primary neo-glow animate-pulse" />
             </div>
             <div className="flex flex-col">
                <span className="text-white font-black text-xl leading-none">{deviceData?.steps || 0}</span>
                <span className="text-[8px] font-bold text-white/30 uppercase tracking-[0.4em]">STEP PROTOCOL</span>
             </div>
          </div>
        </div>

      </div>

      {/* TOP SCAN LINES DECOR */}
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
    </div>
  );
}
