'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Activity, Zap, Heart, Brain, ZapIcon } from 'lucide-react';

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
  
  const BioNode = ({ label, position, linePath }: { label: string, position: string, linePath: string }) => (
    <div className={cn("absolute flex items-center gap-2 group z-30", position)}>
      <div className="flex flex-col items-start">
        <span className="text-[7px] font-black uppercase tracking-widest text-primary/60 bg-black/60 px-2 py-0.5 rounded-full border border-primary/20 backdrop-blur-md">
          {label}
        </span>
      </div>
      <svg className="absolute overflow-visible pointer-events-none" style={{ width: '50px', height: '20px' }}>
        <path d={linePath} fill="none" stroke="hsl(var(--primary)/0.3)" strokeWidth="0.5" strokeDasharray="2 2" />
      </svg>
    </div>
  );

  return (
    <div className={cn("relative w-full h-[400px] md:h-[500px] flex items-center justify-center overflow-visible", className)}>
      
      {/* Background Radials */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle,hsl(var(--primary)/0.15)_0%,transparent_70%)]" />
      </div>

      {/* Anatomical Nodes pointing to the body */}
      <BioNode label="Нейро-модуль" position="top-[15%] left-[5%] md:left-[15%]" linePath="M60,10 L100,20" />
      <BioNode label="Био-синтез" position="top-[35%] left-[2%] md:left-[10%]" linePath="M60,5 L110,15" />
      <BioNode label="Синапсы" position="bottom-[30%] right-[2%] md:right-[10%]" linePath="M-10,5 L-50,15" />
      <BioNode label="Энерго-ядро" position="top-[45%] right-[5%] md:right-[15%]" linePath="M-10,0 L-40,-20" />

      {/* Main Central Silhouette */}
      <div className="relative h-full w-full flex items-center justify-center z-10 scale-90 md:scale-100">
        
        {/* Core Glow */}
        <div className="absolute top-[30%] w-32 h-32 bg-primary/20 rounded-full blur-[60px] animate-pulse" />
        
        {/* Scanning Line */}
        <div className="scan-line !opacity-10 !h-1" />

        <svg viewBox="0 0 240 500" className="h-full w-auto text-primary/80 transition-all duration-700 drop-shadow-[0_0_15px_rgba(14,165,233,0.3)]">
          <defs>
            <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
              <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
            </linearGradient>
            <filter id="neon">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Technical Body Silhouette */}
          <path
            fill="url(#bodyGrad)"
            stroke="currentColor"
            strokeWidth="0.8"
            className="animate-pulse"
            d="M120,40 c-15,0 -28,12 -28,28 c0,15 12,28 28,28 s28,-12 28,-28 c0,-16 -13,-28 -28,-28 m0,56 c-30,0 -50,25 -50,55 v100 c0,15 8,25 20,25 h10 v200 c0,10 10,15 20,15 s20,-5 20,-15 v-200 h0 v200 c0,10 10,15 20,15 s20,-5 20,-15 v-200 h10 c12,0 20,-10 20,-25 v-100 c0,-30 -20,-55 -50,-55 z"
          />

          {/* Internal Organs / Systems */}
          {/* Head/Brain Glow */}
          <circle cx="120" cy="65" r="10" fill="white" fillOpacity="0.05" />
          <circle cx="120" cy="65" r="4" fill="currentColor" filter="url(#neon)" className="animate-pulse" />

          {/* Heart Core */}
          <circle cx="120" cy="145" r="12" fill="white" fillOpacity="0.05" />
          <path 
            d="M120,135 L125,145 L120,155 L115,145 Z" 
            fill="#EF4444" 
            filter="url(#neon)" 
            className="animate-ping" 
            style={{ transformOrigin: '120px 145px', transform: 'scale(1.2)' }} 
          />
          <circle cx="120" cy="145" r="3" fill="#EF4444" />

          {/* Connective Tissue / Neural Lines */}
          <g className="opacity-20" stroke="currentColor" strokeWidth="0.5">
             <path d="M120,65 L120,130" />
             <path d="M120,145 L180,120" />
             <path d="M120,145 L60,120" />
             <path d="M120,145 L120,300" />
             <path d="M120,300 L160,450" />
             <path d="M120,300 L80,450" />
          </g>
          
          {/* Points on joints */}
          <circle cx="95" cy="120" r="1.5" fill="white" className="animate-pulse" />
          <circle cx="145" cy="120" r="1.5" fill="white" className="animate-pulse" />
          <circle cx="120" cy="300" r="2" fill="currentColor" />
        </svg>

        {/* Small Data Labels around figure */}
        <div className="absolute left-[5%] top-[60%] flex flex-col gap-2">
           <div className="flex items-center gap-2">
              <span className="text-[6px] font-black text-white/30 uppercase">BPM</span>
              <span className="text-xs font-black text-white">{deviceData?.avgHeartRate || '--'}</span>
           </div>
        </div>
        <div className="absolute right-[5%] top-[60%] flex flex-col gap-2 text-right">
           <div className="flex items-center gap-2 flex-row-reverse">
              <span className="text-[6px] font-black text-white/30 uppercase">STEP</span>
              <span className="text-xs font-black text-white">{deviceData?.steps || '0'}</span>
           </div>
        </div>
      </div>

      {/* Macro Indicators - Mini version for Dashboard */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-4 px-6 z-40">
        {[
          { l: 'Ккал', v: macros?.calories || 0, c: '#0EA5E9' },
          { l: 'Б', v: macros?.protein || 0, c: '#F87171' },
          { l: 'Ж', v: macros?.fat || 0, c: '#FACC15' },
          { l: 'У', v: macros?.carbs || 0, c: '#2DD4BF' }
        ].map((m, i) => (
          <div key={i} className="flex flex-col items-center gap-1 bg-black/40 backdrop-blur-md px-3 py-2 rounded-xl border border-white/5">
            <span className="text-[6px] font-black uppercase text-white/40">{m.l}</span>
            <span className="text-[10px] font-bold text-white" style={{ color: m.c }}>{m.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
