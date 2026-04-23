
'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Droplets, Flame, Moon, Zap, Footprints, Activity, Beef, Brain } from 'lucide-react';

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
      <div className="text-white/40 group-hover:text-white transition-colors">{icon}</div>
      <div className="relative w-20 h-20 md:w-24 md:h-24 flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle cx="50%" cy="50%" r="42%" fill="none" stroke="white" strokeOpacity="0.05" strokeWidth="1" />
          <circle 
            cx="50%" cy="50%" r="42%" fill="none" stroke={color} strokeWidth="2.5" 
            strokeDasharray="100" strokeDashoffset={100 - (progress || 0)} pathLength="100" strokeLinecap="round"
            className="drop-shadow-[0_0_8px_currentColor] transition-all duration-1000"
          />
        </svg>
        <div className="text-center">
          <span className="text-xl md:text-2xl font-black text-white leading-none block">{value}</span>
        </div>
      </div>
      <span className="text-[8px] font-black uppercase text-white/30 tracking-[0.2em] group-hover:text-primary/60 transition-colors">{label}</span>
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
    <div className={cn("relative w-full h-full flex items-center justify-center overflow-hidden bg-[#000000]", className)}>
      
      {/* BACKGROUND EFFECTS */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.05),transparent_70%)] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />

      {/* 3-COLUMN LAYOUT */}
      <div className="relative z-30 grid grid-cols-12 w-full max-w-7xl h-full items-center px-4 md:px-10">
        
        {/* LEFT COLUMN: Metrics */}
        <div className="col-span-3 flex flex-col gap-8 md:gap-16 items-center justify-center">
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

        {/* CENTER COLUMN: THE HUMAN HOLOGRAM */}
        <div className="col-span-6 relative flex items-center justify-center h-full">
          <div className="relative w-full max-h-[55vh] aspect-[1/2] flex items-center justify-center">
            
            {/* INLINE SVG HUMAN SILHOUETTE (Guaranteed to show) */}
            <svg 
              viewBox="0 0 200 400" 
              className="w-full h-full drop-shadow-[0_0_25px_rgba(0,255,255,0.6)] animate-pulse"
              style={{ filter: 'drop-shadow(0 0 15px #00ffff)' }}
            >
              <defs>
                <linearGradient id="hologramGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#00ffff" stopOpacity="0.4" />
                  <stop offset="50%" stopColor="#00ffff" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#00ffff" stopOpacity="0.4" />
                </linearGradient>
              </defs>
              {/* Human Outline */}
              <path 
                d="M100,20 C110,20 115,28 115,40 C115,52 110,60 100,60 C90,60 85,52 85,40 C85,28 90,20 100,20 M100,65 C120,65 135,80 135,110 L135,170 C135,175 145,175 145,185 L145,260 C145,270 135,270 135,260 L130,170 C130,170 115,165 100,165 C85,165 70,170 70,170 L65,260 C65,270 55,270 55,260 L55,185 C55,175 65,175 65,170 L65,110 C65,80 80,65 100,65 M85,175 L85,280 C85,290 80,300 80,310 L80,370 C80,380 95,380 95,370 L95,310 C95,310 97,300 100,300 C103,300 105,310 105,310 L105,370 C105,380 120,380 120,370 L120,310 C120,300 115,290 115,280 L115,175"
                fill="url(#hologramGrad)"
                stroke="#00ffff"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Internal Nerve Lines */}
              <path d="M100,60 L100,165 M100,165 L85,280 M100,165 L115,280 M75,110 L125,110" stroke="#00ffff" strokeWidth="0.5" strokeOpacity="0.5" />
            </svg>

            {/* PULSING CORE DOT (Heart) */}
            <div className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-40">
               <div className="relative">
                  <div className="w-5 h-5 bg-[#00ffff] rounded-full shadow-[0_0_25px_#00ffff] animate-pulse" />
                  <div className="absolute inset-0 w-full h-full bg-[#00ffff] rounded-full animate-ping opacity-40" />
               </div>
            </div>

            {/* NEURAL SYNC BADGE (Bio-Score) */}
            <div className="absolute top-[15%] -left-4 md:-left-12 z-40 animate-in fade-in slide-in-from-left duration-1000">
               <div className="bg-black/60 backdrop-blur-2xl px-5 py-3 rounded-2xl border border-white/10 flex flex-col items-start shadow-2xl">
                  <p className="text-[7px] font-black text-[#00ffff]/60 uppercase tracking-[0.3em]">NEURAL SYNC</p>
                  <p className="text-2xl font-black text-white leading-none">{score || 0}<span className="text-[#00ffff]/40 text-[10px] ml-1">/100</span></p>
                  <div className="w-full h-0.5 bg-white/5 mt-2 rounded-full overflow-hidden">
                     <div className="h-full bg-primary animate-pulse" style={{ width: `${score || 0}%` }} />
                  </div>
               </div>
            </div>

            {/* STEPS HUD (Floating Bottom) */}
            <div className="absolute bottom-[5%] right-0 z-40">
               <div className="bg-white/5 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10 shadow-xl flex items-center gap-3 group transition-all hover:border-primary/40">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Footprints className="h-4 w-4 text-primary animate-bounce" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-black text-sm leading-none">{deviceData?.steps || 0}</span>
                    <span className="text-[6px] font-bold text-white/30 uppercase tracking-[0.2em]">STEP PROTOCOL</span>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Metrics */}
        <div className="col-span-3 flex flex-col gap-8 md:gap-16 items-center justify-center">
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

      {/* OVERLAY VIGNETTE */}
      <div className="absolute top-0 left-0 right-0 h-1/4 bg-gradient-to-b from-black via-black/40 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />
    </div>
  );
}
