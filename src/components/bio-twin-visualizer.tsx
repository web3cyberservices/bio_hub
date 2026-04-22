'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Flame, Beef, Droplets, Zap } from 'lucide-react';

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
  const MacroRing = ({ 
    value, 
    max, 
    color, 
    icon: Icon, 
    label, 
    unit,
    className 
  }: { 
    value: number; 
    max: number; 
    color: string; 
    icon: any; 
    label: string; 
    unit: string;
    className?: string;
  }) => {
    const percentage = Math.min(Math.round((value / (max || 1)) * 100), 100);
    const strokeDasharray = 100;
    const strokeDashoffset = 100 - percentage;

    return (
      <div className={cn("flex flex-col items-center gap-1 group", className)}>
        <div className="relative w-16 h-16 md:w-20 md:h-20">
          <svg className="w-full h-full -rotate-90">
            <circle cx="50%" cy="50%" r="42%" fill="none" stroke="currentColor" strokeWidth="3" className="text-white/5" />
            <circle 
              cx="50%" cy="50%" r="42%" fill="none" stroke="currentColor" strokeWidth="4" 
              strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset}
              pathLength="100" strokeLinecap="round"
              style={{ color }}
              className="transition-all duration-1000 ease-out drop-shadow-[0_0_12px_currentColor]"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon className="h-6 w-6 opacity-90" style={{ color }} />
          </div>
        </div>
        <div className="text-center">
          <p className="text-[8px] font-black uppercase tracking-widest text-white/40">{label}</p>
          <p className="text-[11px] font-bold text-white">{value}{unit}</p>
        </div>
      </div>
    );
  };

  return (
    <div className={cn("relative w-full min-h-[500px] md:min-h-[650px] flex items-center justify-center overflow-visible", className)}>
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--primary)/0.3) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Left Macro Column */}
      <div className="absolute left-[5%] top-1/2 -translate-y-1/2 flex flex-col gap-12 md:gap-20 z-40">
        <MacroRing 
          value={macros?.calories || 2100} 
          max={2500} 
          color="#0EA5E9" 
          icon={Flame} 
          label="Ккал" 
          unit="" 
        />
        <MacroRing 
          value={macros?.protein || 145} 
          max={180} 
          color="#F87171" 
          icon={Beef} 
          label="Белки" 
          unit="г" 
        />
      </div>

      {/* Right Macro Column */}
      <div className="absolute right-[5%] top-1/2 -translate-y-1/2 flex flex-col gap-12 md:gap-20 z-40">
        <MacroRing 
          value={macros?.fat || 65} 
          max={90} 
          color="#FACC15" 
          icon={Droplets} 
          label="Жиры" 
          unit="г" 
        />
        <MacroRing 
          value={macros?.carbs || 210} 
          max={300} 
          color="#2DD4BF" 
          icon={Zap} 
          label="Углеводы" 
          unit="г" 
        />
      </div>

      {/* Central Full-Height Hologram */}
      <div className="relative h-[90%] w-full flex items-center justify-center animate-hologram">
        {/* Pulsing Core */}
        <div className="absolute top-[40%] w-32 h-32 bg-primary/10 rounded-full blur-[60px] animate-pulse" />
        
        {/* Scanning Line */}
        <div className="scan-line !opacity-30" />

        <svg viewBox="0 0 200 500" className="h-full w-auto text-primary opacity-90 drop-shadow-[0_0_20px_rgba(14,165,233,0.4)]">
          {/* Detailed Full Body silhouette */}
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="0.8"
            d="M100,50 c-12,0 -22,10 -22,22 s10,22,22,22 s22,-10,22,-22 s-10,-22,-22,-22 m0,44 c-25,0 -45,20 -45,45 v90 c0,15 5,20 15,20 h10 v180 c0,10 8,15 15,15 s15,-5 15,-15 v-180 h10 v180 c0,10 8,15 15,15 s15,-5 15,-15 v-180 h10 c10,0 15,-5 15,-20 v-90 c0,-25 -20,-45 -45,-45 z"
            className="opacity-40"
          />
          {/* Main Glow Path */}
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            d="M100,50 c-12,0 -22,10 -22,22 s10,22,22,22 s22,-10,22,-22 s-10,-22,-22,-22 m0,44 c-25,0 -45,20 -45,45 v90 c0,15 5,20 15,20 h10 v180 c0,10 8,15 15,15 s15,-5 15,-15 v-180 h10 v180 c0,10 8,15 15,15 s15,-5 15,-15 v-180 h10 c10,0 15,-5 15,-20 v-90 c0,-25 -20,-45 -45,-45 z"
          />
          {/* Neural nodes */}
          <circle cx="100" cy="130" r="4" fill="white" className="animate-pulse" />
          <path d="M100,130 L160,110 M100,130 L40,110" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" className="opacity-40" />
          <path d="M100,220 L180,220 M100,220 L20,220" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" className="opacity-40" />
          <circle cx="100" cy="220" r="3" fill="currentColor" />
          <circle cx="100" cy="350" r="3" fill="currentColor" />
        </svg>

        {/* Data Nodes */}
        <div className="bio-node top-[15%] left-[20%]">
          <div className="bio-node-dot" />
          <span className="bio-node-label">Гидратация</span>
          <span className="text-[10px] font-bold text-white">{(deviceData?.water || 0) / 1000}л</span>
        </div>

        <div className="bio-node top-[10%] right-[20%]">
          <div className="bio-node-dot" />
          <span className="bio-node-label">Сон</span>
          <span className="text-[10px] font-bold text-white">{deviceData?.sleepDurationHours || 0}ч</span>
        </div>

        <div className="bio-node top-[42%] left-[10%]">
          <div className="bio-node-dot" style={{ backgroundColor: score > 70 ? '#10B981' : '#F59E0B' }} />
          <span className="bio-node-label">Питание</span>
          <span className="text-[10px] font-bold text-white">{score > 70 ? 'Optimal' : 'Adjust'}</span>
        </div>

        <div className="bio-node top-[35%] right-[10%]">
          <div className="bio-node-dot" style={{ backgroundColor: '#EF4444' }} />
          <span className="bio-node-label">Пульс</span>
          <span className="text-[10px] font-bold text-white">{deviceData?.avgHeartRate || '--'} bpm</span>
        </div>

        <div className="bio-node bottom-[15%] left-[25%]">
          <div className="bio-node-dot" />
          <span className="bio-node-label">Шаги</span>
          <span className="text-[10px] font-bold text-white">{deviceData?.steps?.toLocaleString() || 0}</span>
        </div>

        <div className="bio-node bottom-[10%] right-[25%]">
          <div className="bio-node-dot" />
          <span className="bio-node-label">Энергия</span>
          <span className="text-[10px] font-bold text-white">{deviceData?.energy || 50}%</span>
        </div>
      </div>
      
      {/* Decorative Circles */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
        <div className="w-[80%] aspect-square rounded-full border border-primary/20 border-dashed animate-[spin_40s_linear_infinite]" />
        <div className="w-[90%] aspect-square rounded-full border border-primary/5 animate-[spin_60s_linear_infinite_reverse]" />
      </div>
    </div>
  );
}
