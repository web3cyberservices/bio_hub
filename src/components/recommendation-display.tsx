"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { GenerateRecommendationsOutput } from '@/ai/flows/generate-personalized-recommendations';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, Droplets, Moon, Utensils, 
  FlaskConical, Database, Zap, LayoutGrid, 
  ChevronRight, Sparkles, MessageSquare, ShoppingBasket
} from 'lucide-react';
import { BioTwinVisualizer } from './bio-twin-visualizer';
import { cn } from '@/lib/utils';

interface RecommendationDisplayProps {
  data?: GenerateRecommendationsOutput;
  actualMacros?: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
  mode?: 'dashboard' | 'meals';
  deviceData?: any;
}

export function RecommendationDisplay({ data, actualMacros, mode = 'dashboard', deviceData }: RecommendationDisplayProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const bioScore = data?.bioScore ?? 0;
  const macros = data?.macros ?? { calories: 0, protein: 0, fat: 0, carbs: 0 };

  if (mode === 'dashboard') {
    return (
      <div className="relative h-[calc(100vh-280px)] flex flex-col items-center justify-between animate-in fade-in slide-in-from-bottom-8 duration-1000 overflow-hidden">
        
        {/* Top Header - Compact Bio-Score */}
        <div className="flex items-center justify-between w-full max-w-md px-6 pt-4 z-50">
           <div className="flex flex-col items-center">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-primary/20 flex items-center justify-center bg-primary/5">
                 <Droplets className="h-5 w-5 text-primary" />
              </div>
              <span className="text-[7px] font-black text-white/40 uppercase mt-1">Вода</span>
           </div>

           <div className="relative group">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
              <div className="relative w-28 h-28 md:w-32 md:h-32 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle cx="50%" cy="50%" r="45%" fill="none" stroke="white" strokeOpacity="0.05" strokeWidth="4" />
                  <circle 
                    cx="50%" cy="50%" r="45%" fill="none" stroke="hsl(var(--primary))" strokeWidth="6" 
                    strokeDasharray="100" strokeDashoffset={100 - bioScore} pathLength="100" strokeLinecap="round"
                    className="drop-shadow-[0_0_15px_hsl(var(--primary))]"
                  />
                </svg>
                <div className="text-center">
                  <span className="text-[8px] font-black text-primary/60 uppercase tracking-[0.2em] block">Bio-Score</span>
                  <span className="text-3xl md:text-4xl font-black text-white neo-glow leading-none">{bioScore}</span>
                  <span className="text-[8px] font-bold text-white/40 block">/100</span>
                </div>
              </div>
           </div>

           <div className="flex flex-col items-center">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-primary/20 flex items-center justify-center bg-primary/5">
                 <Moon className="h-5 w-5 text-primary" />
              </div>
              <span className="text-[7px] font-black text-white/40 uppercase mt-1">Сон</span>
           </div>
        </div>

        {/* The Holographic Digital Twin Visualizer - Fixed in Center */}
        <div className="flex-1 w-full flex items-center justify-center py-4">
          <BioTwinVisualizer 
            score={bioScore} 
            deviceData={deviceData} 
            macros={macros}
            className="scale-110 md:scale-125"
          />
        </div>

        {/* Bottom Metadata - Shrunk and cleaned */}
        <div className="text-center pb-4 opacity-10">
           <p className="text-[6px] font-black uppercase tracking-[1em]">PRO SEBYA INTERFACE V4.0.2</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-4xl mx-auto py-10">
       <div className="text-center space-y-2">
          <Badge className="bg-primary text-black font-black uppercase text-[10px] px-6 py-1">Nutrition Protocol</Badge>
          <h2 className="text-3xl font-black text-white neo-glow tracking-tighter uppercase">План оптимизации</h2>
       </div>
       
       <div className="grid grid-cols-1 gap-6 px-4">
          {data.mealPlan?.[0]?.meals.map((meal, idx) => (
             <Card key={idx} className="cyber-card overflow-hidden flex flex-col md:flex-row border-white/5 hover:border-primary/30 transition-all">
                <div className="relative w-full md:w-56 h-48 md:h-auto shrink-0 group">
                   <Image src={meal.imageUrl} alt={meal.name} fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700" unoptimized />
                   <div className="absolute inset-0 bg-primary/10 mix-blend-overlay group-hover:bg-transparent" />
                   <Badge className="absolute top-4 left-4 bg-primary text-black font-black text-[9px] px-3">{meal.time}</Badge>
                </div>
                <div className="p-8 flex-1 space-y-6">
                   <div className="flex justify-between items-start">
                      <h3 className="text-2xl font-black tracking-tight text-white">{meal.name}</h3>
                      <div className="text-right">
                         <span className="text-xl font-black text-primary">{meal.calories}</span>
                         <p className="text-[7px] font-black uppercase text-white/40">Ккал</p>
                      </div>
                   </div>
                   <div className="flex gap-6 text-[10px] font-black uppercase text-primary/60 border-t border-white/5 pt-4">
                      <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Б: {meal.protein}г</span>
                      <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> Ж: {meal.fat}г</span>
                      <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> У: {meal.carbs}г</span>
                   </div>
                   <p className="text-sm text-white/50 leading-relaxed font-medium italic">"{meal.description}"</p>
                </div>
             </Card>
          ))}
       </div>
    </div>
  );
}
