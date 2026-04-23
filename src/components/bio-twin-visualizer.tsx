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
    <div className={cn("flex flex-col items-center justify-center gap-3 group transition-all duration-500", className)}>
      <div className="text-white/40 group-hover:text-white transition-colors">
        {icon}
      </div>
      <div className="relative w-24 h-24 md:w-32 md:h-32 flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle cx="50%" cy="50%" r="42%" fill="none" stroke="white" strokeOpacity="0.05" strokeWidth="1" />
          <circle 
            cx="50%" cy="50%" r="42%" fill="none" stroke={color} strokeWidth="3" 
            strokeDasharray="100" strokeDashoffset={100 - (progress || 0)} pathLength="100" strokeLinecap="round"
            className="drop-shadow-[0_0_15px_currentColor] transition-all duration-1000"
          />
        </svg>
        <div className="text-center">
          <span className="text-2xl md:text-4xl font-black text-white leading-none block">{value}</span>
        </div>
      </div>
      <span className="text-[10px] md:text-[12px] font-black uppercase text-white/30 tracking-[0.3em] group-hover:text-primary transition-colors">
        {label}
      </span>
    </div>
  );
};

export function BioTwinVisualizer({ score, deviceData, macros, className }: any) {
  const getProgress = (val: number, goal: number) => Math.min(100, (val / (goal || 1)) * 100);

  return (
    <div className={cn("relative w-full h-full flex items-center justify-center overflow-hidden bg-black", className)}>
      
      {/* 3-Column Grid Layout */}
      <div className="relative z-30 grid grid-cols-3 w-full max-w-7xl h-full items-center px-6 md:px-12">
        
        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-10 md:gap-16 items-center justify-center h-full">
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

        {/* CENTER COLUMN: The Hologram */}
        <div className="relative flex items-center justify-center h-full">
          {/* Bio-Score floating badge */}
          <div className="absolute top-[15%] -left-[10%] md:-left-[25%] z-50">
             <div className="bg-black/60 backdrop-blur-xl px-5 py-3 rounded-2xl border border-[#00ffff]/20 shadow-2xl flex flex-col items-start animate-in slide-in-from-left-8 duration-700">
                <p className="text-[8px] font-black text-[#00ffff]/60 uppercase tracking-widest mb-1">NEURAL SYNC</p>
                <p className="text-2xl md:text-3xl font-black text-white leading-none">
                  {score || 92}<span className="text-[#00ffff]/40 text-[12px] ml-1">/100</span>
                </p>
             </div>
          </div>
          
          {/* Hologram Figure Container */}
          <div className="relative w-full h-[60vh] flex items-center justify-center animate-hologram">
             {/* Guaranteed SVG Hologram (Works without external files) */}
             <svg viewBox="0 0 200 500" className="h-full w-auto drop-shadow-[0_0_30px_#00ffff] opacity-90">
                <defs>
                   <linearGradient id="holoGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#00ffff" stopOpacity="0.8" />
                      <stop offset="50%" stopColor="#00ffff" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#00ffff" stopOpacity="0.1" />
                   </linearGradient>
                </defs>
                {/* Silhouette Path */}
                <path 
                  d="M100,20 C110,20 120,30 120,45 C120,60 110,70 100,70 C90,70 80,60 80,45 C80,30 90,20 100,20 M100,75 L100,85 M80,90 Q100,80 120,90 L135,180 Q140,200 125,200 L115,200 L115,350 L130,480 L110,480 L100,360 L90,360 L70,480 L50,480 L65,350 L65,200 L55,200 Q40,200 45,180 Z" 
                  fill="url(#holoGrad)"
                  stroke="#00ffff"
                  strokeWidth="0.5"
                  className="animate-pulse"
                />
                {/* Nervous System Lines */}
                <path d="M100,85 L100,350 M100,100 L130,170 M100,100 L70,170 M100,200 L115,350 M100,200 L85,350" stroke="#00ffff" strokeWidth="0.3" strokeOpacity="0.5" />
             </svg>

             {/* Core Node - Heart Area */}
             <div className="absolute top-[35%] left-1/2 -translate-x-1/2 z-40">
                <div className="relative w-10 h-10 flex items-center justify-center">
                   <div className="absolute inset-0 bg-[#00ffff]/30 rounded-full animate-ping opacity-40" />
                   <div className="w-3 h-3 rounded-full bg-[#00ffff] shadow-[0_0_25px_#00ffff] animate-pulse" />
                </div>
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-10 md:gap-16 items-center justify-center h-full">
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

      {/* Protocol Text */}
      <div className="absolute bottom-32 left-10 hidden lg:block z-40 max-w-[250px] opacity-30">
         <p className="text-[10px] font-black uppercase text-white/60 tracking-[0.25em] leading-relaxed border-l-2 border-primary/30 pl-5">
            SYSTEM_PROTOCOL: ACTIVE<br />
            NEURAL_LINK_IDENTIFIED<br />
            BIO_HUB_SYNC_V4.0.2<br />
            STATUS: MONITORING_BIOMETRICS...
         </p>
      </div>

      {/* Scanning Line Effect */}
      <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
         <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-[#00ffff]/30 to-transparent absolute top-1/4 animate-scan shadow-[0_0_20px_rgba(0,255,255,0.3)]" />
      </div>

    </div>
  );
}
