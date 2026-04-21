"use client";

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { GenerateRecommendationsOutput } from '@/ai/flows/generate-personalized-recommendations';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, Footprints, Moon, Heart, Droplet, 
  Timer, Trophy, Flame, Utensils,
  Plus, Coffee, Clock, ChefHat, Sparkles, Info, TrendingDown, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { cn } from '@/lib/utils';
import { UnifiedDataEntry } from '@/components/unified-data-entry';

interface RecommendationDisplayProps {
  data: GenerateRecommendationsOutput;
  mode?: 'dashboard' | 'meals';
}

export function RecommendationDisplay({ data, mode = 'dashboard' }: RecommendationDisplayProps) {
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

  const macroData = [
    { name: 'Белки', value: macros.protein, color: 'hsl(var(--secondary))', goal: 150 },
    { name: 'Жиры', value: macros.fat, color: 'hsl(var(--accent))', goal: 80 },
    { name: 'Углеводы', value: macros.carbs, color: 'hsl(var(--muted-foreground))', goal: 250 },
  ];

  const calorieLimit = 2450;
  const remainingCalories = Math.max(0, calorieLimit - macros.calories);

  if (mode === 'dashboard') {
    return (
      <div className="space-y-16 md:space-y-24 animate-in fade-in slide-in-from-bottom-12 duration-1000">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <Card className="bg-gradient-to-br from-[#1A3C26] via-[#2D5A3C] to-[#142F1C] text-white p-12 md:p-20 relative overflow-hidden h-full flex flex-col justify-center border-none shadow-2xl rounded-[3.5rem]">
              <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-16">
                <div className="relative w-72 h-72 md:w-[400px] md:h-[400px] shrink-0">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
                  <svg className="w-full h-full -rotate-90 bio-ring-glow">
                    <circle cx="50%" cy="50%" r="42%" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="24" />
                    <circle cx="50%" cy="50%" r="42%" fill="none" stroke="white" strokeWidth="24" strokeDasharray="100 100" strokeDashoffset={100 - (Math.min(100, (macros.calories / calorieLimit) * 100))} pathLength="100" strokeLinecap="round" className="macro-ring" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[110px] md:text-[150px] font-black leading-none">{bioScore}</span>
                    <span className="text-[16px] font-black uppercase tracking-[0.6em] opacity-40 -mt-4">Bio-Score</span>
                  </div>
                </div>
                <div className="flex-1 space-y-10 text-center xl:text-left">
                  <div className="space-y-6">
                    <Badge className="bg-white/10 text-white border-white/20 px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[11px]">СТАТУС: ОПТИМАЛЬНО</Badge>
                    <h3 className="text-6xl md:text-9xl font-black tracking-tighter leading-[0.8]">Ваш Пик</h3>
                    <p className="text-white/70 text-xl font-medium">Ваш метаболизм работает на пике эффективности.</p>
                  </div>
                  <div className="flex justify-center xl:justify-start">
                     <div className="flex items-center gap-5 bg-white/5 px-10 py-6 rounded-[2.5rem] border border-white/10">
                        <Trophy className="h-8 w-8 text-accent animate-bounce" />
                        <span className="text-[12px] font-black uppercase tracking-[0.3em]">Личный рекорд</span>
                     </div>
                  </div>
                </div>
              </div>
              <Activity className="absolute -bottom-40 -left-40 h-[50rem] w-[50rem] text-white/5 pointer-events-none rotate-12" />
            </Card>
          </div>

          <div className="lg:col-span-4">
            <Card className="premium-card p-14 md:p-16 border-none bg-[#EFF0FF] flex flex-col justify-between h-full">
              <div className="flex items-center justify-between mb-16">
                 <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-indigo-600/40">
                       <Timer className="h-10 w-10 text-white" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black tracking-tight text-indigo-950">Голодание</h3>
                      <p className="text-[12px] font-black text-indigo-400 uppercase tracking-widest">{fastingWindow?.type || '16:8'}</p>
                    </div>
                 </div>
              </div>
              <div className="space-y-14">
                <div className="relative h-10 bg-indigo-100/50 rounded-full overflow-hidden p-2">
                  <div className="h-full bg-indigo-600 rounded-full transition-all duration-1000" style={{ width: `${fastingWindow?.progress || 68}%` }} />
                </div>
                <div className="flex justify-between items-end">
                  <div>
                     <p className="text-[12px] font-black text-indigo-400 uppercase tracking-widest">Осталось</p>
                     <p className="text-7xl font-black text-indigo-600 tabular-nums">{fastingWindow?.remainingTime || '05:24'}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           <Card className="lg:col-span-5 premium-card p-14 border-none bg-white">
              <h3 className="text-4xl font-black mb-12">Баланс КБЖУ (Факт)</h3>
              <div className="h-[350px] relative">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie data={macroData} innerRadius={110} outerRadius={140} paddingAngle={8} dataKey="value" stroke="none">
                          {macroData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                       </Pie>
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-6xl font-black">{macros.calories}</span>
                    <span className="text-[12px] font-black uppercase opacity-40">Ккал</span>
                 </div>
              </div>
              <div className="grid grid-cols-3 gap-6 mt-12">
                 {macroData.map((m, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                       <div className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color }} />
                       <span className="text-[11px] font-black uppercase opacity-50">{m.name}</span>
                       <span className="text-xl font-black">{m.value}г</span>
                       <span className="text-[9px] font-bold text-muted-foreground">цель: {m.goal}г</span>
                    </div>
                 ))}
              </div>
           </Card>

           <Card className="lg:col-span-7 p-14 border-none bg-[#1A3C26] text-white relative overflow-hidden flex flex-col justify-between rounded-[3.5rem] shadow-2xl">
              <div className="relative z-10">
                 <p className="text-[14px] font-black uppercase tracking-[0.5em] opacity-60 mb-8">ЛИМИТ ЭНЕРГИИ</p>
                 <div className="space-y-4">
                    <h3 className="text-8xl md:text-[140px] font-black tracking-tighter leading-none">{remainingCalories}</h3>
                    <p className="text-2xl md:text-4xl font-medium opacity-80">ккал осталось на сегодня</p>
                 </div>
              </div>
              <div className="relative z-10 pt-16 flex items-center gap-10">
                 <div className="flex-1 space-y-4">
                    <div className="flex justify-between text-[11px] font-black uppercase opacity-60">
                       <span>Факт дня</span>
                       <span>{macros.calories} / {calorieLimit}</span>
                    </div>
                    <div className="h-4 bg-white/10 rounded-full overflow-hidden p-1">
                       <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (macros.calories / calorieLimit) * 100)}%` }} />
                    </div>
                 </div>
                 <UnifiedDataEntry>
                   <Button className="rounded-full w-24 h-24 bg-white text-primary hover:scale-110 transition-all shadow-2xl">
                      <Plus className="h-10 w-10 text-primary" />
                   </Button>
                 </UnifiedDataEntry>
              </div>
              <Flame className="absolute -right-20 -top-20 h-96 w-96 text-white/5 opacity-40 rotate-12" />
           </Card>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
           {[
             { label: 'Шаги', val: '9,215', goal: '12,000', icon: Footprints, color: 'text-orange-500', bg: 'bg-orange-50' },
             { label: 'Сон', val: '7ч 45м', goal: '8ч', icon: Moon, color: 'text-indigo-600', bg: 'bg-indigo-50' },
             { label: 'Пульс', val: '62', goal: 'bpm', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50' },
             { label: 'Вода', val: '1.8л', goal: '3л', icon: Droplet, color: 'text-blue-500', bg: 'bg-blue-50' }
           ].map((m, i) => (
             <Card key={i} className={cn("premium-card p-10 border-none flex flex-col items-center text-center gap-8", m.bg)}>
                <div className={cn("w-20 h-20 rounded-[2.5rem] flex items-center justify-center shadow-lg", m.color.replace('text', 'bg').replace('500', '100').replace('600', '100'))}>
                   <m.icon className={cn("h-10 w-10", m.color)} />
                </div>
                <div className="space-y-2">
                   <p className="text-4xl font-black leading-none">{m.val}</p>
                   <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.4em]">{m.label}</p>
                   <p className="text-[10px] font-bold text-muted-foreground/40">Цель: {m.goal}</p>
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
          <div className="absolute left-8 top-10 bottom-10 w-1 bg-gradient-to-b from-primary/5 via-primary/20 to-primary/5 rounded-full hidden md:block" />
          {mealPlan[0].meals.map((meal, idx) => (
            <div key={idx} className="relative md:pl-24 group">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-4 border-primary shadow-lg z-10 hidden md:block" />
              <Card className="premium-card border-none bg-white overflow-hidden flex flex-col xl:flex-row shadow-2xl">
                <div className="relative w-full xl:w-[450px] h-[350px] xl:h-auto shrink-0">
                  <Image src={getMealImage(meal.imageId)} alt={meal.name} fill className="object-cover group-hover:scale-110 transition-transform duration-1000" />
                  <div className="absolute bottom-8 left-8 flex items-center gap-3">
                     <Clock className="h-5 w-5 text-white" />
                     <span className="text-xl font-black text-white">{meal.time}</span>
                  </div>
                </div>
                <div className="p-12 md:p-14 flex-1 space-y-10">
                  <div className="space-y-6">
                    <div className="flex justify-between items-start">
                       <div>
                          <Badge variant="outline" className="border-primary/20 text-primary mb-4 px-4 py-1.5 rounded-xl font-black text-[10px] uppercase">
                            {idx === 0 ? 'Завтрак' : idx === 1 ? 'Обед' : idx === 2 ? 'Ужин' : 'Перекус'}
                          </Badge>
                          <h3 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">{meal.name}</h3>
                       </div>
                       <div className="text-right">
                          <p className="text-4xl md:text-5xl font-black text-primary leading-none">
                            {meal.calories} <span className="text-[10px] uppercase font-black opacity-30">ккал</span>
                          </p>
                       </div>
                    </div>
                    <div className="bg-muted/30 p-8 rounded-[2rem] border-l-8 border-accent">
                       <p className="text-lg font-medium italic text-foreground/80 leading-relaxed">«{meal.description}»</p>
                    </div>

                    <div className="space-y-4 pt-6">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Состав блюда:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {meal.components?.map((comp, ci) => (
                          <div key={ci} className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl">
                            <span className="text-sm font-bold">{comp.ingredient}</span>
                            <Badge variant="secondary" className="bg-white font-black">{comp.weight}</Badge>
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
