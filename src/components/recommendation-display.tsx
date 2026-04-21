
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { GenerateRecommendationsOutput } from '@/ai/flows/generate-personalized-recommendations';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, Footprints, Moon, Heart, Droplet, 
  Timer, Flame, Zap, Utensils
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const { bioScore, recommendations, macros, fastingWindow, mealPlan } = data;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Целевые значения из расчета ИИ
  const targetGoals = {
    calories: macros.calories || 2400,
    protein: macros.protein || 160,
    fat: macros.fat || 80,
    carbs: macros.carbs || 250,
  };

  // Фактические значения (из логов)
  const currentFact = actualMacros || {
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0
  };

  const macroRings = [
    { name: 'Белки', current: currentFact.protein, goal: targetGoals.protein, color: '#F97316', icon: Flame },
    { name: 'Жиры', current: currentFact.fat, goal: targetGoals.fat, color: '#EAB308', icon: Droplet },
    { name: 'Углеводы', current: currentFact.carbs, goal: targetGoals.carbs, color: '#2D7A4D', icon: Zap },
  ];

  if (mode === 'dashboard') {
    return (
      <div className="space-y-16 animate-in fade-in slide-in-from-bottom-12 duration-1000">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8">
            <Card className="bg-gradient-to-br from-[#1A3C26] via-[#2D5A3C] to-[#142F1C] text-white p-12 md:p-16 relative overflow-hidden h-full flex flex-col justify-center border-none shadow-3xl rounded-[4rem]">
              <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-16">
                {/* Главное кольцо Bio-Score */}
                <div className="relative w-72 h-72 md:w-[380px] md:h-[380px] shrink-0">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-[80px] animate-pulse" />
                  <svg className="w-full h-full -rotate-90 bio-ring-glow">
                    <circle cx="50%" cy="50%" r="42%" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="20" />
                    <circle 
                      cx="50%" 
                      cy="50%" 
                      r="42%" 
                      fill="none" 
                      stroke="white" 
                      strokeWidth="20" 
                      strokeDasharray="100 100" 
                      strokeDashoffset={100 - bioScore} 
                      pathLength="100" 
                      strokeLinecap="round" 
                      className="transition-all duration-1000 ease-out" 
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[100px] md:text-[130px] font-black leading-none">{bioScore}</span>
                    <span className="text-[14px] font-black uppercase tracking-[0.5em] opacity-40 -mt-2">Bio-Score</span>
                  </div>
                </div>

                {/* Кольца БЖУ */}
                <div className="flex-1 grid grid-cols-3 gap-6 w-full">
                  {macroRings.map((m, i) => (
                    <div key={i} className="flex flex-col items-center gap-4 group">
                      <div className="relative w-24 h-24 md:w-32 md:h-32">
                        <svg className="w-full h-full -rotate-90">
                          <circle cx="50%" cy="50%" r="40%" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                          <circle 
                            cx="50%" 
                            cy="50%" 
                            r="40%" 
                            fill="none" 
                            stroke={m.color} 
                            strokeWidth="8" 
                            strokeDasharray="100 100" 
                            strokeDashoffset={100 - Math.min(100, (m.current / m.goal) * 100)} 
                            pathLength="100" 
                            strokeLinecap="round" 
                            className="transition-all duration-1000 delay-300" 
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <m.icon className="h-6 w-6 md:h-8 md:w-8" style={{ color: m.color }} />
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-xl md:text-2xl font-black leading-none">{Math.round(m.current)}г</p>
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-50 mt-1">{m.name}</p>
                        <p className="text-[8px] font-bold opacity-30 mt-0.5">из {Math.round(m.goal)}г</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Activity className="absolute -bottom-40 -left-40 h-[50rem] w-[50rem] text-white/5 pointer-events-none rotate-12" />
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <Card className="premium-card p-12 border-none bg-white flex flex-col justify-between h-[calc(50%-16px)]">
              <div>
                <p className="text-[12px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-4">КАЛОРИИ (ФАКТ)</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-7xl font-black tracking-tighter text-foreground leading-none">{Math.round(currentFact.calories)}</h3>
                  <span className="text-xl font-bold opacity-20">/ {Math.round(targetGoals.calories)}</span>
                </div>
                <p className="text-muted-foreground mt-4 font-medium">ккал съедено за сегодня</p>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden mt-8">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-1000" 
                  style={{ width: `${Math.min(100, (currentFact.calories / targetGoals.calories) * 100)}%` }} 
                />
              </div>
            </Card>

            <Card className="premium-card p-12 border-none bg-[#EFF0FF] flex flex-col justify-between h-[calc(50%-16px)]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                  <Timer className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-indigo-950">Голодание</h3>
                  <Badge className="bg-indigo-100 text-indigo-600 border-none text-[9px] font-black">{fastingWindow?.type || '16:8'}</Badge>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-5xl font-black text-indigo-600">{fastingWindow?.remainingTime || '05:24'}</p>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">До приема пищи</p>
              </div>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
           {[
             { label: 'Шаги', val: deviceData?.steps?.toLocaleString() || '0', goal: '10,000', icon: Footprints, color: 'text-orange-500', bg: 'bg-orange-50' },
             { label: 'Энергия', val: `${deviceData?.energy || 50}%`, goal: '100%', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
             { label: 'Пульс', val: deviceData?.avgHeartRate || '--', goal: 'bpm', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50' },
             { label: 'Вода', val: `${(deviceData?.water || 0) / 1000}л`, goal: '2.5л', icon: Droplet, color: 'text-blue-500', bg: 'bg-blue-50' }
           ].map((m, i) => (
             <Card key={i} className={cn("premium-card p-10 border-none flex flex-col gap-8 transition-transform hover:scale-105", m.bg)}>
                <div className="flex justify-between items-start">
                  <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg bg-white/50")}>
                    <m.icon className={cn("h-8 w-8", m.color)} />
                  </div>
                </div>
                <div className="space-y-1">
                   <p className="text-3xl font-black leading-none">{m.val}</p>
                   <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.4em]">{m.label}</p>
                </div>
             </Card>
           ))}
        </div>
      </div>
    );
  }

  if (mode === 'meals') {
    return (
      <div className="space-y-16 animate-in fade-in slide-in-from-bottom-12 duration-1000 max-w-6xl mx-auto py-12">
        <div className="space-y-12 relative">
          {mealPlan[0].meals.map((meal, idx) => {
            return (
              <Card key={idx} className="premium-card border-none bg-white overflow-hidden flex flex-col xl:flex-row shadow-2xl transition-all hover:scale-[1.01]">
                <div className="relative w-full xl:w-[400px] h-[300px] xl:h-auto shrink-0 overflow-hidden group bg-muted/20">
                  {meal.imageUrl ? (
                    <Image 
                      src={meal.imageUrl} 
                      alt={meal.name} 
                      fill 
                      className="object-cover transition-transform duration-700 group-hover:scale-110" 
                      unoptimized={true}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-primary/20">
                      <Utensils className="h-16 w-16 mb-2" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Image Loading...</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-20" />
                  <div className="absolute bottom-6 left-6 right-6">
                     <Badge className="bg-primary/90 text-white border-none font-black text-[10px] uppercase tracking-widest px-3 py-1">
                        {meal.time}
                     </Badge>
                  </div>
                </div>
                <div className="p-10 flex-1 space-y-8">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <h3 className="text-3xl font-black tracking-tighter leading-none text-foreground">{meal.name}</h3>
                      <p className="text-muted-foreground text-sm font-medium italic leading-relaxed">{meal.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-5xl font-black text-primary drop-shadow-sm">{meal.calories}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">ккал</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {meal.components?.map((comp, ci) => (
                      <div key={ci} className="flex items-center justify-between p-6 bg-primary/5 rounded-[2rem] border border-primary/10 transition-all hover:bg-primary/10 group/item">
                        <span className="text-base font-bold text-foreground/80 group-hover/item:text-foreground transition-colors">{comp.ingredient}</span>
                        <Badge 
                          variant="default" 
                          className="bg-primary text-white font-black px-4 py-2 rounded-xl shadow-lg text-sm transition-transform group-hover/item:scale-110"
                        >
                          {comp.weight}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}
