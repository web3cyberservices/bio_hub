'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Droplets, Flame, Moon, Zap, Footprints, Beef, Activity, Sparkles } from 'lucide-react';

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
      <span className="text-[9px] font-black uppercase text-white/30 tracking-[0.3em] group-hover:text-primary transition-colors">
        {label}
      </span>
    </div>
  );
};

const CyberHuman = () => (
  <div className="relative w-full h-full flex items-center justify-center">
    {/* Встроенная векторная голограмма человека */}
    <svg viewBox="0 0 200 500" className="h-full w-auto filter drop-shadow(0 0 30px #00ffff)">
      <defs>
        <linearGradient id="hologramGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#00ffff" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#00ffff" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#00ffff" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      
      {/* Силуэт тела */}
      <path 
        d="M100 40c-15 0-25 12-25 25s10 25 25 25 25-12 25-25-10-25-25-25zM70 110h60l15 100-25 10v140l-20 10-20-10V220L55 210z" 
        fill="none" 
        stroke="url(#hologramGrad)" 
        strokeWidth="1.5"
        className="animate-pulse"
      />
      
      {/* Нервная система / Линии */}
      <g stroke="#00ffff" strokeWidth="0.5" strokeOpacity="0.4" fill="none">
        <path d="M100 90v120M100 130l-40 40M100 130l40 40M100 210l-25 140M100 210l25 140" />
        <circle cx="100" cy="65" r="3" fill="#00ffff" />
        <circle cx="100" cy="140" r="5" fill="#ff4d4d" className="animate-ping" />
        <circle cx="100" cy="140" r="3" fill="#ff0000" />
      </g>
    </svg>
    
    {/* Эффекты свечения фона вокруг человека */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(0,255,255,0.15),transparent_60%)] animate-pulse" />
  </div>
);

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
      
      {/* Основная сетка 3 колонки: Метрики | Человек | Метрики */}
      <div className="relative z-30 grid grid-cols-3 w-full max-w-7xl h-full items-center px-4 md:px-10">
        
        {/* ЛЕВАЯ КОЛОНКА */}
        <div className="flex flex-col gap-12 md:gap-16 items-center justify-center">
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

        {/* ЦЕНТРАЛЬНАЯ КОЛОНКА: ГОЛОГРАММА */}
        <div className="relative flex items-center justify-center h-full py-20">
          <div className="absolute top-24 left-0 z-50">
             <div className="bg-black/60 backdrop-blur-xl px-5 py-3 rounded-2xl border border-primary/30 shadow-[0_0_20px_rgba(0,255,255,0.2)] flex flex-col items-start animate-in slide-in-from-left-4 duration-1000">
                <p className="text-[7px] font-black text-primary/60 uppercase tracking-[0.4em]">BIO-SCORE 4.0</p>
                <p className="text-2xl font-black text-white leading-none">{score || 92}<span className="text-primary/40 text-[10px] ml-1">/100</span></p>
                <div className="w-16 h-1 bg-white/5 mt-3 rounded-full overflow-hidden">
                   <div className="h-full bg-primary animate-pulse shadow-[0_0_10px_#00ffff]" style={{ width: `${score || 92}%` }} />
                </div>
             </div>
          </div>
          
          <div className="w-full h-full max-h-[55vh]">
            <CyberHuman />
          </div>
        </div>

        {/* ПРАВАЯ КОЛОНКА */}
        <div className="flex flex-col gap-12 md:gap-16 items-center justify-center">
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

      {/* Оверлеи для глубины */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black via-black/80 to-transparent z-40 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black via-black/80 to-transparent z-40 pointer-events-none" />
    </div>
  );
}
