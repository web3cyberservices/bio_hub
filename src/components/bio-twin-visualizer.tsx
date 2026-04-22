
'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

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

  const BioNode = ({ label, position, linePath }: { label: string, position: string, linePath: string }) => (
    <div className={cn("absolute flex items-center gap-2 group z-30", position)}>
      <div className="flex flex-col items-start">
        <span className="text-[7px] font-black uppercase tracking-widest text-primary/60 bg-black/60 px-2 py-0.5 rounded-full border border-primary/20 backdrop-blur-md">
          {label}
        </span>
      </div>
      <svg className="absolute overflow-visible pointer-events-none" style={{ width: '40px', height: '20px' }}>
        <path d={linePath} fill="none" stroke="hsl(var(--primary)/0.3)" strokeWidth="0.5" strokeDasharray="2 2" />
      </svg>
    </div>
  );

  return (
    <div className={cn("relative w-full h-full flex items-center justify-center overflow-visible", className)}>
      
      {/* Background Radials & Grids */}
      <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle,hsl(var(--primary)/0.2)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* Anatomical Nodes pointing to the body */}
      <BioNode label="Нейро-модуль" position="top-[15%] left-[5%]" linePath="M60,10 L100,20" />
      <BioNode label="Био-синтез" position="top-[40%] left-[2%]" linePath="M60,5 L110,15" />
      <BioNode label="Синапсы" position="bottom-[35%] right-[2%]" linePath="M-10,5 L-50,15" />
      <BioNode label="Энерго-ядро" position="top-[45%] right-[5%]" linePath="M-10,0 L-40,-20" />

      {/* Main Central Realistic Hologram */}
      <div className="relative w-full h-full max-h-[85vh] flex items-center justify-center z-10 transition-transform duration-700">
        
        {/* Core Glow behind image */}
        <div className="absolute top-[30%] w-48 h-48 bg-primary/30 rounded-full blur-[80px] animate-pulse" />
        
        {/* Scanning Line */}
        <div className="scan-line !opacity-20 !h-0.5" />

        <div className="relative aspect-[2/3] h-full w-auto">
          {hologramImg && (
            <Image
              src={hologramImg.imageUrl}
              alt="Digital Twin Hologram"
              fill
              className="object-contain drop-shadow-[0_0_25px_rgba(14,165,233,0.5)] animate-hologram"
              data-ai-hint={hologramImg.imageHint}
              unoptimized
            />
          )}
          
          {/* Overlay Interactive Elements */}
          {/* Pulsing Heart Node */}
          <div className="absolute top-[28%] left-[49%] -translate-x-1/2 w-4 h-4 z-20">
            <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-60" />
            <div className="absolute inset-1 bg-red-400 rounded-full shadow-[0_0_15px_#ef4444]" />
          </div>

          {/* Brain Glow Node */}
          <div className="absolute top-[8%] left-[50%] -translate-x-1/2 w-6 h-6 z-20">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse blur-md" />
            <div className="absolute inset-2 bg-primary/40 rounded-full shadow-[0_0_10px_hsl(var(--primary))]" />
          </div>
        </div>

        {/* Small Data Labels around figure */}
        <div className="absolute left-[10%] bottom-[20%] flex flex-col gap-2">
           <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-primary/20">
              <span className="text-[7px] font-black text-white/30 uppercase">BPM</span>
              <span className="text-sm font-black text-white">{deviceData?.avgHeartRate || '--'}</span>
           </div>
        </div>
        <div className="absolute right-[10%] bottom-[20%] flex flex-col gap-2 text-right">
           <div className="flex items-center gap-2 flex-row-reverse bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-primary/20">
              <span className="text-[7px] font-black text-white/30 uppercase">STEP</span>
              <span className="text-sm font-black text-white">{deviceData?.steps || '0'}</span>
           </div>
        </div>
      </div>

      {/* KBZHU Circular Progress - Positioned at the bottom for accessibility */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 px-6 z-40">
        {[
          { l: 'Ккал', v: macros?.calories || 0, c: '#0EA5E9', p: 75 },
          { l: 'Белки', v: macros?.protein || 0, c: '#F87171', p: 60 },
          { l: 'Жиры', v: macros?.fat || 0, c: '#FACC15', p: 45 },
          { l: 'Углеводы', v: macros?.carbs || 0, c: '#2DD4BF', p: 85 }
        ].map((m, i) => (
          <div key={i} className="flex flex-col items-center gap-1 group">
             <div className="relative w-14 h-14 md:w-16 md:h-16 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="50%" cy="50%" r="42%" fill="none" stroke="white" strokeOpacity="0.05" strokeWidth="2" />
                  <circle 
                    cx="50%" cy="50%" r="42%" fill="none" stroke={m.c} strokeWidth="3" 
                    strokeDasharray="100" strokeDashoffset={100 - m.p} pathLength="100" strokeLinecap="round"
                    className="drop-shadow-[0_0_8px_currentColor]"
                    style={{ color: m.c }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[10px] md:text-xs font-black text-white leading-none">{m.v}</span>
                </div>
             </div>
             <span className="text-[6px] md:text-[7px] font-black uppercase text-white/40 tracking-widest">{m.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
