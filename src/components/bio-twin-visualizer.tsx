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
  // Вспомогательная функция для отрисовки кольца макроса
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
        <div className="relative w-14 h-14 md:w-16 md:h-16">
          <svg className="w-full h-full -rotate-90">
            <circle cx="50%" cy="50%" r="42%" fill="none" stroke="currentColor" strokeWidth="3" className="text-white/5" />
            <circle 
              cx="50%" cy="50%" r="42%" fill="none" stroke="currentColor" strokeWidth="3" 
              strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset}
              pathLength="100" strokeLinecap="round"
              style={{ color }}
              className="transition-all duration-1000 ease-out drop-shadow-[0_0_8px_currentColor]"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon className="h-5 w-5 opacity-80" style={{ color }} />
          </div>
        </div>
        <div className="text-center">
          <p className="text-[7px] font-black uppercase tracking-widest text-white/40">{label}</p>
          <p className="text-[10px] font-bold text-white">{value}{unit}</p>
        </div>
      </div>
    );
  };

  return (
    <div className={cn("relative w-full aspect-square md:aspect-[3/4] flex items-center justify-center overflow-hidden", className)}>
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--primary)/0.2) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

      {/* Main Rings of KBJU (КБЖУ) */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-40">
        <div className="space-y-6">
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
        <div className="space-y-6">
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
      </div>

      {/* Central Hologram Silhuette */}
      <div className="relative w-full h-full flex items-center justify-center animate-hologram scale-110">
        {/* Pulsing Core */}
        <div className="absolute top-[40%] w-16 h-16 bg-primary/20 rounded-full blur-2xl animate-pulse" />
        
        {/* Scanning Line */}
        <div className="scan-line" />

        <svg viewBox="0 0 200 400" className="h-[85%] w-auto text-primary opacity-90 drop-shadow-[0_0_15px_rgba(14,165,233,0.5)]">
          {/* Detailed anatomical lines */}
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeDasharray="2 2"
            d="M100 40c-10 0-18 8-18 18s8 18 18 18 18-8 18-18-8-18-18-18zm0 40c-25 0-45 20-45 45v80c0 5 4 10 10 10s10-5 10-10v-80c0-14 11-25 25-25s25 11 25 25v80c0 5 4 10 10 10s10-5 10-10v-80c0-25-20-45-45-45zm-15 145v135c0 5 4 10 10 10s10-5 10-10v-135h10v135c0 5 4 10 10 10s10-5 10-10V225h-50z"
            className="opacity-20"
          />
          {/* Glow path */}
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            d="M100 40c-10 0-18 8-18 18s8 18 18 18 18-8 18-18-8-18-18-18zm0 40c-25 0-45 20-45 45v80c0 5 4 10 10 10s10-5 10-10v-80c0-14 11-25 25-25s25 11 25 25v80c0 5 4 10 10 10s10-5 10-10v-80c0-25-20-45-45-45zm-15 145v135c0 5 4 10 10 10s10-5 10-10v-135h10v135c0 5 4 10 10 10s10-5 10-10V225h-50z"
          />
          {/* Neural connectors */}
          <circle cx="100" cy="120" r="3" fill="white" className="animate-pulse" />
          <path d="M100 120 L140 100 M100 120 L60 100" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" className="opacity-40" />
          <path d="M100 180 L160 180 M100 180 L40 180" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" className="opacity-40" />
        </svg>

        {/* Data Nodes (Points of interest) */}
        <div className="bio-node top-[18%] left-[15%]">
          <div className="bio-node-dot" />
          <span className="bio-node-label">Гидратация</span>
          <span className="text-[10px] font-bold text-white">{(deviceData?.water || 0) / 1000}л</span>
        </div>

        <div className="bio-node top-[12%] right-[15%]">
          <div className="bio-node-dot" />
          <span className="bio-node-label">Сон</span>
          <span className="text-[10px] font-bold text-white">{deviceData?.sleepDurationHours || 0}ч</span>
        </div>

        <div className="bio-node top-[45%] left-[5%]">
          <div className="bio-node-dot" style={{ backgroundColor: score > 70 ? '#10B981' : '#F59E0B' }} />
          <span className="bio-node-label">Питание</span>
          <span className="text-[10px] font-bold text-white">{score > 70 ? 'Optimal' : 'Adjust'}</span>
        </div>

        <div className="bio-node top-[38%] right-[5%]">
          <div className="bio-node-dot" style={{ backgroundColor: '#EF4444' }} />
          <span className="bio-node-label">Сердце</span>
          <span className="text-[10px] font-bold text-white">{deviceData?.avgHeartRate || '--'} bpm</span>
        </div>

        <div className="bio-node bottom-[25%] left-[10%]">
          <div className="bio-node-dot" />
          <span className="bio-node-label">Активность</span>
          <span className="text-[10px] font-bold text-white">{deviceData?.steps?.toLocaleString() || 0}</span>
        </div>

        <div className="bio-node bottom-[18%] right-[10%]">
          <div className="bio-node-dot" />
          <span className="bio-node-label">Энергия</span>
          <span className="text-[10px] font-bold text-white">{deviceData?.energy || 50}%</span>
        </div>
      </div>
      
      {/* Decorative Rotating Circles */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <div className="w-[85%] aspect-square rounded-full border border-primary/20 border-dashed animate-[spin_20s_linear_infinite]" />
        <div className="w-[75%] aspect-square rounded-full border border-primary/10 animate-[spin_30s_linear_infinite_reverse]" />
      </div>
    </div>
  );
}
