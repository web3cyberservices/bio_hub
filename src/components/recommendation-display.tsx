"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { GenerateRecommendationsOutput } from '@/ai/flows/generate-personalized-recommendations';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BioTwinVisualizer } from './bio-twin-visualizer';

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
      <div className="relative w-full h-full animate-in fade-in duration-1000 overflow-hidden">
        <BioTwinVisualizer 
          score={bioScore} 
          deviceData={deviceData} 
          macros={macros}
          className="w-full h-full"
        />
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