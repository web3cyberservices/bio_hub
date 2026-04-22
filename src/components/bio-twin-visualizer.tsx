'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Activity, Droplet, Zap, Moon, Heart, Footprints } from 'lucide-react';

interface BioTwinVisualizerProps {
  score: number;
  deviceData?: any;
  className?: string;
}

export function BioTwinVisualizer({ score, deviceData, className }: BioTwinVisualizerProps) {
  return (
    <div className={cn("relative w-full aspect-[3/4] flex items-center justify-center overflow-hidden", className)}>
      {/* Background Pulse Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[80%] aspect-square rounded-full border border-primary/10 animate-ping opacity-20" />
        <div className="w-[60%] aspect-square rounded-full border border-primary/5 animate-pulse opacity-10" style={{ animationDuration: '4s' }} />
      </div>

      {/* Central Human Hologram (Stylized SVG) */}
      <div className="relative w-full h-full flex items-center justify-center animate-hologram">
        <div className="scan-line" />
        <svg viewBox="0 0 200 400" className="h-[90%] w-auto text-primary opacity-80 neo-glow">
          <path
            fill="currentColor"
            d="M100 40c-10 0-18 8-18 18s8 18 18 18 18-8 18-18-8-18-18-18zm0 40c-25 0-45 20-45 45v80c0 5 4 10 10 10s10-5 10-10v-80c0-14 11-25 25-25s25 11 25 25v80c0 5 4 10 10 10s10-5 10-10v-80c0-25-20-45-45-45zm-15 145v135c0 5 4 10 10 10s10-5 10-10v-135h10v135c0 5 4 10 10 10s10-5 10-10V225h-50z"
            className="opacity-40"
          />
          {/* Detailed anatomical lines */}
          <circle cx="100" cy="120" r="2" fill="white" className="animate-pulse" />
          <path d="M100 120 L130 140" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 2" />
          <path d="M100 120 L70 140" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 2" />
        </svg>

        {/* Nodes / Labels (Positioned relative to body parts) */}
        <div className="bio-node top-[15%] left-[10%]">
          <div className="bio-node-dot" />
          <span className="bio-node-label">Гидратация</span>
          <span className="text-[10px] font-bold text-white">{(deviceData?.water || 0) / 1000}л</span>
        </div>

        <div className="bio-node top-[10%] right-[10%]">
          <div className="bio-node-dot" />
          <span className="bio-node-label">Сон</span>
          <span className="text-[10px] font-bold text-white">{deviceData?.sleepDurationHours || 0}ч</span>
        </div>

        <div className="bio-node top-[40%] left-[5%]">
          <div className="bio-node-dot" />
          <span className="bio-node-label">Питание</span>
          <span className="text-[10px] font-bold text-white">{score > 70 ? 'Optimal' : 'Adjust'}</span>
        </div>

        <div className="bio-node top-[35%] right-[5%]">
          <div className="bio-node-dot" style={{ backgroundColor: '#EF4444' }} />
          <span className="bio-node-label">Пульс</span>
          <span className="text-[10px] font-bold text-white">{deviceData?.avgHeartRate || '--'} bpm</span>
        </div>

        <div className="bio-node bottom-[20%] left-[15%]">
          <div className="bio-node-dot" />
          <span className="bio-node-label">Шаги</span>
          <span className="text-[10px] font-bold text-white">{deviceData?.steps?.toLocaleString() || 0}</span>
        </div>

        <div className="bio-node bottom-[15%] right-[15%]">
          <div className="bio-node-dot" />
          <span className="bio-node-label">Энергия</span>
          <span className="text-[10px] font-bold text-white">{deviceData?.energy || 50}%</span>
        </div>
      </div>
    </div>
  );
}