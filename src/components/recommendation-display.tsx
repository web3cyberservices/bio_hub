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
      <div className="space-y-2 animate-in fade-in slide-in-from-bottom-8 duration-1000 max-w-2xl mx-auto pb-40">
        
        {/* Top Header - Compact Bio-Score (as in reference) */}
        <div className="flex items-center justify-between px-6 pt-4 mb-4">
           <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full border-2 border-primary/20 flex items-center justify-center bg-primary/5">
                 <Droplets className="h-5 w-5 text-primary" />
              </div>
              <span className="text-[7px] font-black text-white/40 uppercase mt-1">Вода</span>
           </div>

           <div className="relative group">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
              <div className="relative w-32 h-32 flex items-center justify-center">
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
                  <span className="text-4xl font-black text-white neo-glow leading-none">{bioScore}</span>
                  <span className="text-[8px] font-bold text-white/40 block">/100</span>
                </div>
              </div>
           </div>

           <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full border-2 border-primary/20 flex items-center justify-center bg-primary/5">
                 <Moon className="h-5 w-5 text-primary" />
              </div>
              <span className="text-[7px] font-black text-white/40 uppercase mt-1">Сон</span>
           </div>
        </div>

        {/* The Holographic Digital Twin Visualizer - Centered and Shrunk */}
        <BioTwinVisualizer 
          score={bioScore} 
          deviceData={deviceData} 
          macros={macros}
        />

        {/* Functional List (as in reference bottom section) */}
        <div className="px-6 space-y-3 pt-6">
           <Card className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:bg-white/10 transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <MessageSquare className="h-5 w-5" />
                 </div>
                 <div>
                    <h3 className="text-xs font-black text-white uppercase tracking-tight">Мой Чат: Ассистент PRO</h3>
                    <p className="text-[9px] text-white/40 font-medium">Мгновенные советы по биометрии</p>
                 </div>
              </div>
              <ChevronRight className="h-4 w-4 text-white/20" />
           </Card>

           <Card className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:bg-white/10 transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <FlaskConical className="h-5 w-5" />
                 </div>
                 <div>
                    <h3 className="text-xs font-black text-white uppercase tracking-tight">Расшифровка LabScan AI</h3>
                    <p className="text-[9px] text-white/40 font-medium">Анализ маркеров крови и гормонов</p>
                 </div>
              </div>
              <ChevronRight className="h-4 w-4 text-white/20" />
           </Card>

           <Card className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:bg-white/10 transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <ShoppingBasket className="h-5 w-5" />
                 </div>
                 <div>
                    <h3 className="text-xs font-black text-white uppercase tracking-tight">Smart Inventory</h3>
                    <p className="text-[9px] text-white/40 font-medium">Меню из вашего холодильника</p>
                 </div>
              </div>
              <ChevronRight className="h-4 w-4 text-white/20" />
           </Card>
        </div>

        <div className="text-center pt-8 opacity-10">
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
