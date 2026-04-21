"use client";

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { GenerateRecommendationsOutput } from '@/ai/flows/generate-personalized-recommendations';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, Footprints, Moon, Heart, Droplet, 
  Timer, Trophy, Flame, Utensils,
  Plus, Clock, Sparkles, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { UnifiedDataEntry } from '@/components/unified-data-entry';

interface RecommendationDisplayProps {
  data: GenerateRecommendationsOutput;
  mode?: 'dashboard' | 'meals';
  deviceData?: {
    steps?: number;
    water?: number;
    weight?: number;
    mood?: string;
    energy?: number;
  };
}

export function RecommendationDisplay({ data, mode = 'dashboard', deviceData }: RecommendationDisplayProps) {
  const { bioScore, recommendations, macros, micronutrients, fastingWindow, mealPlan } = data;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getMealImage = (imageId: string) => {
    const found = (PlaceHolderImages || []).find(img => img?.id === imageId);
    if (found) return found.imageUrl;
    return `https://picsum.photos/seed/food-${imageId}/600/400`;
  };

  // Целевые значения (можно вычислять на основе профиля, здесь используем референсные значения)
  const goals = {
    calories: 2400,
    protein: 160,
    fat: 80,
    carbs: 250,
    steps: 10000,
    water: 2500,
  };

  const macroRings = [
    { name: 'Белки', current: macros.protein, goal: goals.protein, color: 'hsl(var(--secondary))', icon: Flame },
    { name: 'Жиры', current: macros.fat, goal: goals.fat, color: 'hsl(var(--accent))', icon: Droplet },
    { name: 'Углеводы', current: macros.carbs, goal: goals.carbs, color: 'hsl(var(--primary))', icon: Zap },
  ];

  const remainingCalories = Math.max(0, goals.calories - macros.calories);

  if (!mounted) return null;

  if (mode === 'dashboard') {
    return (
      <div className="space-y-16 animate-in fade-in slide-in-from-bottom-12 duration-1000">
        {/* Центральный блок: Bio-Score и Макро-кольца */}
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

                {/* Кольца Макронутриентов */}
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
                        <p className="text-xl md:text-2xl font-black leading-none">{m.current}г</p>
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-50 mt-1">{m.name}</p>
                        <p className="text-[8px] font-bold opacity-30">цель: {m.goal}г</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Activity className="absolute -bottom-40 -left-40 h-[50rem] w-[50rem] text-white/5 pointer-events-none rotate-12" />
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-8">
            {/* Остаток калорий */}
            <Card className="premium-card p-12 border-none bg-white flex flex-col justify-between h-[calc(50%-16px)]">
              <div>
                <p className="text-[12px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-4">ЛИМИТ ЭНЕРГИИ</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-7xl font-black tracking-tighter text-foreground leading-none">{remainingCalories}</h3>
                  <span className="text-xl font-bold opacity-20">ккал</span>
                </div>
                <p className="text-muted-foreground mt-4 font-medium">осталось на сегодня</p>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden mt-8">
                <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (macros.calories / goals.calories) * 100)}%` }} />
              </div>
            </Card>

            {/* Фастинг или Активность */}
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
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Осталось до приема пищи</p>
              </div>
            </Card>
          </div>
        </div>

        {/* Сетка данных с носимых устройств */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
           {[
             { 
               label: 'Шаги', 
               val: deviceData?.steps?.toLocaleString() || '0', 
               goal: goals.steps.toLocaleString(), 
               progress: deviceData?.steps ? (deviceData.steps / goals.steps) * 100 : 0,
               icon: Footprints, 
               color: 'text-orange-500', 
               bg: 'bg-orange-50' 
             },
             { 
               label: 'Сон', 
               val: '7ч 45м', 
               goal: '8ч', 
               progress: 85,
               icon: Moon, 
               color: 'text-indigo-600', 
               bg: 'bg-indigo-50' 
             },
             { 
               label: 'Пульс', 
               val: '62', 
               goal: 'bpm', 
               progress: 100,
               icon: Heart, 
               color: 'text-rose-500', 
               bg: 'bg-rose-50' 
             },
             { 
               label: 'Вода', 
               val: `${((deviceData?.water || 0) / 1000).toFixed(1)}л`, 
               goal: `${(goals.water / 1000).toFixed(1)}л`, 
               progress: deviceData?.water ? (deviceData.water / goals.water) * 100 : 0,
               icon: Droplet, 
               color: 'text-blue-500', 
               bg: 'bg-blue-50' 
             }
           ].map((m, i) => (
             <Card key={i} className={cn("premium-card p-10 border-none flex flex-col gap-8 transition-transform hover:scale-105", m.bg)}>
                <div className="flex justify-between items-start">
                  <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg", m.color.replace('text', 'bg').replace('500', '100').replace('600', '100'))}>
                    <m.icon className={cn("h-8 w-8", m.color)} />
                  </div>
                  <Badge variant="outline" className="border-muted-foreground/10 text-[9px] font-black">{Math.round(m.progress)}%</Badge>
                </div>
                <div className="space-y-1">
                   <p className="text-3xl font-black leading-none">{m.val}</p>
                   <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.4em]">{m.label}</p>
                   <div className="h-1.5 bg-black/5 rounded-full mt-4 overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all duration-1000", m.color.replace('text', 'bg'))} style={{ width: `${Math.min(100, m.progress)}%` }} />
                   </div>
                </div>
             </Card>
           ))}
        </div>

        {/* Инсайты */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <Card className="premium-card p-12 border-none bg-white space-y-8">
            <h3 className="text-2xl font-black flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-accent" /> Резюме дня
            </h3>
            <p className="text-lg font-medium leading-relaxed text-muted-foreground">
              {recommendations.lifestyle}
            </p>
          </Card>
          <Card className="premium-card p-12 border-none bg-primary/5 space-y-8">
            <h3 className="text-2xl font-black flex items-center gap-3">
              <Utensils className="h-6 w-6 text-primary" /> Совет по питанию
            </h3>
            <p className="text-lg font-medium leading-relaxed text-muted-foreground">
              {recommendations.diet}
            </p>
          </Card>
        </div>
      </div>
    );
  }

  if (mode === 'meals') {
    return (
      <div className="space-y-16 animate-in fade-in slide-in-from-bottom-12 duration-1000 max-w-6xl mx-auto py-12">
        <div className="space-y-12 relative">
          <div className="absolute left-8 top-10 bottom-10 w-1 bg-gradient-to-b from-primary/5 via-primary/20 to-primary/5 rounded-full hidden md:block" />
          {mealPlan[0].meals.map((meal, idx) => (
            <div key={idx} className="relative md:pl-24 group">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-4 border-primary shadow-lg z-10 hidden md:block" />
              <Card className="premium-card border-none bg-white overflow-hidden flex flex-col xl:flex-row shadow-2xl transition-all hover:scale-[1.01]">
                <div className="relative w-full xl:w-[450px] h-[350px] xl:h-auto shrink-0 overflow-hidden">
                  <Image src={getMealImage(meal.imageId)} alt={meal.name} fill className="object-cover group-hover:scale-110 transition-transform duration-1000" />
                  <div className="absolute bottom-8 left-8 flex items-center gap-3 bg-black/20 backdrop-blur-md px-6 py-3 rounded-2xl">
                     <Clock className="h-5 w-5 text-white" />
                     <span className="text-xl font-black text-white">{meal.time}</span>
                  </div>
                </div>
                <div className="p-10 md:p-14 flex-1 space-y-10">
                  <div className="space-y-6">
                    <div className="flex justify-between items-start">
                       <div>
                          <Badge variant="outline" className="border-primary/20 text-primary mb-4 px-4 py-1.5 rounded-xl font-black text-[10px] uppercase">
                            {idx === 0 ? 'Завтрак' : idx === 1 ? 'Обед' : idx === 2 ? 'Ужин' : 'Перекус'}
                          </Badge>
                          <h3 className="text-3xl md:text-5xl font-black tracking-tighter leading-none">{meal.name}</h3>
                       </div>
                       <div className="text-right">
                          <p className="text-4xl font-black text-primary leading-none">
                            {meal.calories} <span className="text-[10px] uppercase font-black opacity-30">ккал</span>
                          </p>
                       </div>
                    </div>
                    
                    <div className="bg-muted/30 p-8 rounded-[2rem] border-l-8 border-accent">
                       <p className="text-lg font-medium italic text-foreground/80 leading-relaxed">«{meal.description}»</p>
                    </div>

                    <div className="space-y-4 pt-6">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Utensils className="h-3 w-3" /> Точный состав:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {meal.components?.map((comp, ci) => (
                          <div key={ci} className="flex items-center justify-between p-5 bg-primary/5 rounded-[1.75rem] border border-primary/5">
                            <span className="text-sm font-bold text-foreground/80">{comp.ingredient}</span>
                            <Badge variant="secondary" className="bg-white font-black px-3 py-1 shadow-sm">{comp.weight}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
