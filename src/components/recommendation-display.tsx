"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { GenerateRecommendationsOutput } from '@/ai/flows/generate-personalized-recommendations';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, Footprints, Moon, Heart, 
  MessageSquare, ShieldCheck,
  Smartphone, Database, LayoutGrid, FlaskConical
} from 'lucide-react';
import { BioTwinVisualizer } from './bio-twin-visualizer';

interface RecommendationDisplayProps {
  data: GenerateRecommendationsOutput;
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

  const { bioScore, recommendations, macros } = data;

  if (mode === 'dashboard') {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 max-w-2xl mx-auto overflow-visible pb-20">
        {/* Header Status */}
        <div className="flex items-center justify-between px-6">
           <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="text-[10px] font-black tracking-[0.3em] text-primary/80 uppercase">SYSTEM STATUS: OPTIMAL</h1>
           </div>
           <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary text-[8px] font-black tracking-widest px-3 py-1 uppercase">
             Bio-Sync Active
           </Badge>
        </div>

        {/* Bio-Score Central Hub */}
        <div className="text-center py-4 relative">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-primary/10 rounded-full blur-[80px] -z-10" />
           <div className="inline-flex flex-col items-center">
              <span className="text-[8px] font-black text-primary/60 uppercase tracking-[0.5em] mb-2">Health Index</span>
              <span className="text-7xl font-black text-white neo-glow-strong leading-none">{bioScore}</span>
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-2">v4.0.2 Protocol</span>
           </div>
        </div>

        {/* The 3D Digital Twin Visualizer with side rings */}
        <BioTwinVisualizer 
          score={bioScore} 
          deviceData={deviceData} 
          macros={macros}
        />

        {/* Quick Insights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 pt-10">
           <Card className="cyber-card p-6 flex items-center justify-between border-white/5 hover:border-primary/40 group cursor-pointer">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-all shadow-[0_0_15px_rgba(14,165,233,0.1)]">
                    <FlaskConical className="h-6 w-6" />
                 </div>
                 <div>
                    <h3 className="text-xs font-black tracking-tight text-white uppercase">LabScan AI</h3>
                    <p className="text-[9px] text-white/40 font-medium">Анализ маркеров крови</p>
                 </div>
              </div>
              <LayoutGrid className="h-4 w-4 text-white/20 group-hover:text-primary transition-colors" />
           </Card>

           <Card className="cyber-card p-6 flex items-center justify-between border-white/5 hover:border-primary/40 group cursor-pointer">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-all shadow-[0_0_15px_rgba(14,165,233,0.1)]">
                    <Database className="h-6 w-6" />
                 </div>
                 <div>
                    <h3 className="text-xs font-black tracking-tight text-white uppercase">Bio-Архив</h3>
                    <p className="text-[9px] text-white/40 font-medium">История и рекомендации</p>
                 </div>
              </div>
              <LayoutGrid className="h-4 w-4 text-white/20 group-hover:text-primary transition-colors" />
           </Card>
        </div>

        {/* Footer Brand */}
        <div className="text-center pt-8 opacity-20">
           <p className="text-[6px] font-black uppercase tracking-[1.2em]">PRO SEBYA DIGITAL TWIN INTERFACE</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-4xl mx-auto py-10">
       <div className="text-center space-y-2">
          <Badge className="bg-primary text-black font-black uppercase text-[10px] px-6 py-1">Nutrition Protocol</Badge>
          <h2 className="text-3xl font-black text-white neo-glow tracking-tighter uppercase">План оптимизации</h2>
       </div>
       
       <div className="grid grid-cols-1 gap-6">
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
