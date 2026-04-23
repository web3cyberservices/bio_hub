
'use client';

import React from 'react';
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

        {/* CENTRAL COLUMN: The Actual Human Hologram (SVG) */}
        <div className="relative flex items-center justify-center h-full py-10">
          {/* Bio-Score floating badge */}
          <div className="absolute top-20 left-0 z-50">
             <div className="bg-black/60 backdrop-blur-xl px-4 py-2 rounded-xl border border-primary/30 shadow-[0_0_15px_rgba(0,255,255,0.2)] flex flex-col items-start animate-in slide-in-from-left-4">
                <p className="text-[6px] font-black text-primary/60 uppercase tracking-[0.3em]">NEURAL SYNC</p>
                <p className="text-xl font-black text-white leading-none">{score || 92}<span className="text-primary/40 text-[8px] ml-1">/100</span></p>
             </div>
          </div>
          
          <div className="relative w-full h-[55vh] flex items-center justify-center animate-hologram">
             {/* GUARANTEED HUMAN SVG SILHOUETTE */}
             <svg 
               viewBox="0 0 200 500" 
               className="h-full w-auto drop-shadow-[0_0_25px_rgba(0,255,255,0.6)]"
               fill="none" 
               xmlns="http://www.w3.org/2000/svg"
             >
                {/* Body Outline */}
                <path 
                  d="M100 20C115 20 125 35 125 50C125 65 115 80 100 80C85 80 75 65 75 50C75 35 85 20 100 20ZM100 90C130 90 145 110 145 150L140 250C140 250 135 260 145 270L160 380C160 380 165 400 150 400C135 400 120 400 120 400L115 480H85L80 400C80 400 65 400 50 400C35 400 40 380 40 380L55 270C65 260 60 250 60 250L55 150C55 110 70 90 100 90Z" 
                  stroke="#00ffff" 
                  strokeWidth="1.5" 
                  className="opacity-40"
                />
                {/* Neural Lines */}
                <path d="M100 80V250M100 120L60 160M100 120L140 160M100 250L70 480M100 250L130 480" stroke="#00ffff" strokeWidth="0.5" className="opacity-20" />
                
                {/* Brain Node */}
                <circle cx="100" cy="45" r="4" fill="#00ffff" className="animate-pulse shadow-[0_0_10px_#00ffff]" />
                
                {/* Heart Core Node */}
                <circle cx="100" cy="140" r="6" fill="#00ffff" className="animate-pulse shadow-[0_0_15px_#00ffff]" />
                <circle cx="100" cy="140" r="12" stroke="#00ffff" strokeWidth="1" className="animate-ping opacity-30" />
             </svg>
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
