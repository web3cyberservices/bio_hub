'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Flame, Beef, Droplets, Zap, Heart, Moon, Timer, Activity } from 'lucide-react';

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
  
  const IndicatorNode = ({ 
    icon: Icon, 
    label, 
    value, 
    color, 
    position 
  }: { 
    icon: any; 
    label: string; 
    value: string; 
    color: string;
    position: string;
  }) => (
    <div className={cn("absolute flex flex-col items-center gap-1 group z-50", position)}>
      <div 
        className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center border-2 backdrop-blur-md transition-all duration-500 group-hover:scale-110"
        style={{ borderColor: `${color}40`, backgroundColor: `${color}10`, boxShadow: `0 0 15px ${color}20` }}
      >
        <Icon className="h-6 w-6" style={{ color }} />
      </div>
      <div className="text-center">
        <p className="text-[7px] font-black uppercase tracking-widest text-white/40">{label}</p>
        <p className="text-[10px] font-bold text-white">{value}</p>
      </div>
    </div>
  );

  const MacroRing = ({ 
    value, 
    max, 
    color, 
    label, 
    unit,
    className 
  }: { 
    value: number; 
    max: number; 
    color: string; 
    label: string; 
    unit: string;
    className?: string;
  }) => {
    const percentage = Math.min(Math.round((value / (max || 1)) * 100), 100);
    return (
      <div className={cn("flex items-center gap-3 bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/5", className)}>
        <div className="relative w-10 h-10">
          <svg className="w-full h-full -rotate-90">
            <circle cx="50%" cy="50%" r="40%" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/5" />
            <circle 
              cx="50%" cy="50%" r="40%" fill="none" stroke="currentColor" strokeWidth="3" 
              strokeDasharray="100" strokeDashoffset={100 - percentage}
              pathLength="100" strokeLinecap="round"
              style={{ color }}
              className="transition-all duration-1000 drop-shadow-[0_0_8px_currentColor]"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
             <span className="text-[8px] font-black" style={{ color }}>{percentage}%</span>
          </div>
        </div>
        <div>
          <p className="text-[8px] font-black uppercase text-white/40 leading-none mb-1">{label}</p>
          <p className="text-xs font-bold text-white">{value}{unit}</p>
        </div>
      </div>
    );
  };

  return (
    <div className={cn("relative w-full min-h-[550px] md:min-h-[700px] flex items-center justify-center overflow-visible", className)}>
      
      {/* Background Cyber Elements */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle,hsl(var(--primary)/0.1)_0%,transparent_70%)]" />
        <div className="w-full h-full" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
      </div>

      {/* Top Level Indicators (Matching the photo layout) */}
      <IndicatorNode 
        icon={Droplets} 
        label="Гидратация" 
        value={`${(deviceData?.water || 0) / 1000}л`} 
        color="#0EA5E9" 
        position="top-[5%] left-[15%] md:left-[25%]" 
      />
      <IndicatorNode 
        icon={Moon} 
        label="Сон" 
        value={`${deviceData?.sleepDurationHours || 0}ч`} 
        color="#818CF8" 
        position="top-[5%] right-[15%] md:right-[25%]" 
      />
      <IndicatorNode 
        icon={Activity} 
        label="Питание" 
        value={score > 70 ? "Optimal" : "Check"} 
        color="#10B981" 
        position="top-[18%] left-[5%] md:left-[15%]" 
      />

      {/* Main Central Silhouette */}
      <div className="relative h-[85%] w-full flex items-center justify-center z-10">
        
        {/* Holographic Core Glow */}
        <div className="absolute top-[40%] w-48 h-48 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
        
        {/* Scanning Line */}
        <div className="scan-line !opacity-20" />

        <svg viewBox="0 0 240 500" className="h-full w-auto text-primary transition-all duration-700">
          <defs>
            <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
              <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Detailed Silhouette Path */}
          <path
            fill="url(#bodyGradient)"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeOpacity="0.3"
            d="M120,40 c-15,0 -28,12 -28,28 c0,15 12,28 28,28 s28,-12 28,-28 c0,-16 -13,-28 -28,-28 m0,56 c-30,0 -50,25 -50,55 v100 c0,15 8,25 20,25 h10 v200 c0,10 10,15 20,15 s20,-5 20,-15 v-200 h0 v200 c0,10 10,15 20,15 s20,-5 20,-15 v-200 h10 c12,0 20,-10 20,-25 v-100 c0,-30 -20,-55 -50,-55 z"
          />
          
          {/* Glowing Outline */}
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            filter="url(#glow)"
            className="opacity-80 animate-pulse"
            d="M120,40 c-15,0 -28,12 -28,28 c0,15 12,28 28,28 s28,-12 28,-28 c0,-16 -13,-28 -28,-28 m0,56 c-30,0 -50,25 -50,55 v100 c0,15 8,25 20,25 h10 v200 c0,10 10,15 20,15 s20,-5 20,-15 v-200 h0 v200 c0,10 10,15 20,15 s20,-5 20,-15 v-200 h10 c12,0 20,-10 20,-25 v-100 c0,-30 -20,-55 -50,-55 z"
          />

          {/* Internal System: Heart */}
          <circle cx="120" cy="140" r="8" fill="#EF4444" className="animate-ping opacity-40" />
          <circle cx="120" cy="140" r="4" fill="#EF4444" filter="url(#glow)" className="animate-pulse" />

          {/* Neural Connections (Branching lines) */}
          <g className="opacity-30" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2">
             <path d="M120,140 L190,120" />
             <path d="M120,140 L50,120" />
             <path d="M120,140 L180,240" />
             <path d="M120,140 L60,240" />
             <path d="M120,80 L120,130" />
          </g>

          {/* Bio-Nodes on the body */}
          <circle cx="120" cy="180" r="2" fill="white" className="animate-pulse" />
          <circle cx="120" cy="280" r="2" fill="white" className="animate-pulse" />
          <circle cx="100" cy="140" r="1.5" fill="white" />
          <circle cx="140" cy="140" r="1.5" fill="white" />
        </svg>

        {/* Side Info Cards (Connecting to silhouette) */}
        <div className="absolute left-[2%] top-[45%] flex flex-col gap-4">
           <div className="flex items-center gap-3 group">
              <div className="text-right">
                 <p className="text-[8px] font-black uppercase text-white/30">Пульс</p>
                 <p className="text-xs font-bold text-white">{deviceData?.avgHeartRate || '--'} bpm</p>
              </div>
              <div className="w-8 h-px bg-primary/40 group-hover:w-12 transition-all" />
           </div>
           <div className="flex items-center gap-3 group">
              <div className="text-right">
                 <p className="text-[8px] font-black uppercase text-white/30">Шаги</p>
                 <p className="text-xs font-bold text-white">{deviceData?.steps?.toLocaleString() || 0}</p>
              </div>
              <div className="w-8 h-px bg-primary/40 group-hover:w-12 transition-all" />
           </div>
        </div>

        <div className="absolute right-[2%] top-[45%] flex flex-col gap-4">
           <div className="flex items-center gap-3 group flex-row-reverse">
              <div className="text-left">
                 <p className="text-[8px] font-black uppercase text-white/30">Энергия</p>
                 <p className="text-xs font-bold text-white">{deviceData?.energy || 50}%</p>
              </div>
              <div className="w-8 h-px bg-primary/40 group-hover:w-12 transition-all" />
           </div>
           <div className="flex items-center gap-3 group flex-row-reverse">
              <div className="text-left">
                 <p className="text-[8px] font-black uppercase text-white/30">Вес</p>
                 <p className="text-xs font-bold text-white">{deviceData?.weight || '--'} кг</p>
              </div>
              <div className="w-8 h-px bg-primary/40 group-hover:w-12 transition-all" />
           </div>
        </div>
      </div>

      {/* KBZHU Orbital Rings (At the bottom) */}
      <div className="absolute bottom-[2%] left-0 right-0 px-6 grid grid-cols-2 md:grid-cols-4 gap-3 z-50">
        <MacroRing value={macros?.calories || 0} max={2500} color="#0EA5E9" label="Калории" unit=" ккал" />
        <MacroRing value={macros?.protein || 0} max={160} color="#F87171" label="Белки" unit="г" />
        <MacroRing value={macros?.fat || 0} max={80} color="#FACC15" label="Жиры" unit="г" />
        <MacroRing value={macros?.carbs || 0} max={300} color="#2DD4BF" label="Углеводы" unit="г" />
      </div>

      {/* Decorative Rotating Grid */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
        <div className="w-[85%] aspect-square rounded-full border border-primary/20 border-dashed animate-[spin_60s_linear_infinite]" />
        <div className="w-[95%] aspect-square rounded-full border border-primary/10 animate-[spin_80s_linear_infinite_reverse]" />
      </div>
    </div>
  );
}
