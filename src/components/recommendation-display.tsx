"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { GenerateRecommendationsOutput } from '@/ai/flows/generate-personalized-recommendations';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, Footprints, Moon, Heart, Droplet, 
  MessageSquare, ShieldCheck,
  Smartphone, Database, LayoutGrid, FlaskConical
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const { bioScore, recommendations, macros } = data;

  if (mode === 'dashboard') {
    return (
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-lg mx-auto">
        {/* Header Branding */}
        <div className="flex items-center justify-between px-2">
           <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary neo-glow" />
              <h1 className="text-sm font-black tracking-widest text-primary/80 uppercase">PRO SEBYA: Ваш цифровой двойник</h1>
           </div>
           <ShieldCheck className="h-4 w-4 text-primary/40" />
        </div>

        {/* Bio-Score Central Hub */}
        <div className="relative pt-6">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-primary/10 rounded-full blur-[80px] -z-10" />
           <div className="flex flex-col items-center">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="50%" cy="50%" r="45%" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                  <circle 
                    cx="50%" cy="50%" r="45%" fill="none" stroke="currentColor" strokeWidth="8" 
                    strokeDasharray="100 100" strokeDashoffset={100 - bioScore} 
                    pathLength="100" strokeLinecap="round" className="text-primary transition-all duration-1000 ease-out neo-glow" 
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xs font-black text-primary/60 uppercase tracking-tighter">Bio-Score 4.0:</span>
                  <span className="text-5xl font-black text-white neo-glow">{bioScore}</span>
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">/ 100</span>
                </div>
              </div>
           </div>
        </div>

        {/* Holographic Twin Visualizer with KBJU Rings */}
        <BioTwinVisualizer 
          score={bioScore} 
          deviceData={deviceData} 
          macros={macros}
        />

        {/* Quick Access Grid */}
        <div className="grid grid-cols-1 gap-4 px-2">
           <Card className="cyber-card p-5 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                    <MessageSquare className="h-6 w-6" />
                 </div>
                 <div>
                    <h3 className="text-sm font-black tracking-tight">Мой Чат:</h3>
                    <p className="text-[10px] text-primary/60 uppercase font-bold">Ассистент AVITA</p>
                 </div>
              </div>
              <Button variant="ghost" size="icon" className="text-primary/40"><LayoutGrid className="h-4 w-4" /></Button>
           </Card>

           <Card className="cyber-card p-5 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                    <Database className="h-6 w-6" />
                 </div>
                 <div>
                    <h3 className="text-sm font-black tracking-tight">Smart Inventory:</h3>
                    <p className="text-[10px] text-primary/60 uppercase font-bold">Холодильник</p>
                 </div>
              </div>
              <Button variant="ghost" size="icon" className="text-primary/40"><LayoutGrid className="h-4 w-4" /></Button>
           </Card>

           <Card className="cyber-card p-5 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                    <FlaskConical className="h-6 w-6" />
                 </div>
                 <div>
                    <h3 className="text-sm font-black tracking-tight">Расшифровка</h3>
                    <p className="text-[10px] text-primary/60 uppercase font-bold">LabScan AI</p>
                 </div>
              </div>
              <Button variant="ghost" size="icon" className="text-primary/40"><LayoutGrid className="h-4 w-4" /></Button>
           </Card>

           <Card className="cyber-card p-5 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                    <Smartphone className="h-6 w-6" />
                 </div>
                 <div>
                    <h3 className="text-sm font-black tracking-tight">Синхронизация гаджетов</h3>
                    <div className="flex gap-2 mt-1 opacity-60">
                       <Footprints className="h-3 w-3" />
                       <Heart className="h-3 w-3" />
                       <Moon className="h-3 w-3" />
                    </div>
                 </div>
              </div>
              <Button variant="ghost" size="icon" className="text-primary/40"><LayoutGrid className="h-4 w-4" /></Button>
           </Card>
        </div>

        {/* Footer Info */}
        <div className="text-center pb-10">
           <p className="text-[8px] font-black uppercase tracking-[0.4em] text-primary/30">Holographic Biometric Interface v4.0</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-4xl mx-auto py-10">
       <h2 className="text-2xl font-black text-center text-primary neo-glow tracking-widest">Протокол питания</h2>
       <div className="grid grid-cols-1 gap-6">
          {data.mealPlan?.[0]?.meals.map((meal, idx) => (
             <Card key={idx} className="cyber-card overflow-hidden flex flex-col md:flex-row border-white/5">
                <div className="relative w-full md:w-48 h-48 md:h-auto shrink-0 grayscale hover:grayscale-0 transition-all duration-700">
                   <Image src={meal.imageUrl} alt={meal.name} fill className="object-cover" unoptimized />
                   <div className="absolute inset-0 bg-primary/10 mix-blend-overlay" />
                   <Badge className="absolute top-4 left-4 bg-primary text-black font-black text-[8px]">{meal.time}</Badge>
                </div>
                <div className="p-8 flex-1 space-y-4">
                   <h3 className="text-xl font-black tracking-tight">{meal.name}</h3>
                   <div className="flex gap-4 text-[9px] font-black uppercase text-primary/60">
                      <span>{meal.calories} Ккал</span>
                      <span>Б: {meal.protein}г</span>
                      <span>Ж: {meal.fat}г</span>
                      <span>У: {meal.carbs}г</span>
                   </div>
                   <p className="text-xs text-muted-foreground leading-relaxed">{meal.description}</p>
                </div>
             </Card>
          ))}
       </div>
    </div>
  );
}
