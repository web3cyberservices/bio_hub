'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { GenerateRecommendationsOutput } from '@/ai/flows/generate-personalized-recommendations';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  HeartPulse, Activity, ChevronRight, Zap, Footprints, Moon, Heart, Droplet, 
  TrendingDown, Timer, ShieldCheck, Star, Brain, Apple, Flame, Utensils
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

interface RecommendationDisplayProps {
  data: GenerateRecommendationsOutput;
  mode?: 'dashboard' | 'meals';
}

const weightData = [
  { date: '01.03', weight: 75.5 },
  { date: '05.03', weight: 74.8 },
  { date: '10.03', weight: 74.2 },
  { date: '15.03', weight: 74.5 },
  { date: '20.03', weight: 73.9 },
  { date: 'Сегодня', weight: 73.2 },
];

export function RecommendationDisplay({ data, mode = 'dashboard' }: RecommendationDisplayProps) {
  const { bioScore, recommendations, macros, micronutrients, fastingWindow, mealPlan } = data;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getMealImage = (imageId: string) => {
    const found = (PlaceHolderImages || []).find(img => img?.id === imageId);
    return found?.imageUrl || 'https://picsum.photos/seed/fallback/400/300';
  };

  if (mode === 'dashboard') {
    return (
      <div className="space-y-10 md:space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        
        {/* HERO SECTION: BIO-SCORE CIRCLE (YAZIO STYLE) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <Card className="premium-card border-none bg-gradient-to-br from-primary to-[#2D7A4D] text-white p-10 md:p-14 relative overflow-hidden h-full min-h-[400px]">
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12 h-full">
                <div className="relative w-56 h-56 md:w-64 md:h-64 shrink-0 animate-float">
                  <svg className="w-full h-full -rotate-90 filter drop-shadow-2xl">
                    <circle cx="50%" cy="50%" r="46%" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="14" />
                    <circle cx="50%" cy="50%" r="46%" fill="none" stroke="white" strokeWidth="14" strokeDasharray="100 100" 
                      strokeDashoffset={100 - bioScore} pathLength="100" strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-7xl font-black tracking-tighter">{bioScore}</span>
                    <span className="text-[11px] font-black uppercase tracking-[0.4em] opacity-70">Bio-Score</span>
                  </div>
                </div>
                
                <div className="flex-1 space-y-6 text-center md:text-left">
                  <Badge className="bg-white/20 text-white border-none px-6 py-2 rounded-2xl font-black uppercase tracking-widest text-[10px] backdrop-blur-md">Индекс здоровья</Badge>
                  <h3 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">Превосходный темп!</h3>
                  <p className="text-white/80 text-lg font-medium max-w-md">Вы находитесь в «зеленой зоне» метаболизма. Сегодняшние показатели выше среднего на 14%.</p>
                  
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
                     <div className="flex items-center gap-3 bg-white/10 px-5 py-3 rounded-2xl backdrop-blur-md border border-white/10">
                        <ShieldCheck className="h-5 w-5 text-accent" />
                        <span className="text-xs font-black uppercase tracking-widest">Анализ завершен</span>
                     </div>
                     <div className="flex items-center gap-3 bg-white/10 px-5 py-3 rounded-2xl backdrop-blur-md border border-white/10">
                        <Star className="h-5 w-5 text-accent" />
                        <span className="text-xs font-black uppercase tracking-widest">Цель достижима</span>
                     </div>
                  </div>
                </div>
              </div>
              <Activity className="absolute -bottom-20 -right-20 h-96 w-96 text-white/5 pointer-events-none" />
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-8">
            {/* FASTING WIDGET (YAZIO STYLE) */}
            <Card className="premium-card p-10 border-none bg-indigo-50/50 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                       <Timer className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-black tracking-tight text-indigo-900">Голодание</h3>
                 </div>
                 <Badge variant="outline" className="border-indigo-200 text-indigo-600 font-black rounded-xl px-4">{fastingWindow?.type || '16:8'}</Badge>
              </div>
              <div className="space-y-8">
                <div className="relative h-5 bg-indigo-100 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="absolute inset-y-0 left-0 bg-indigo-500 transition-all duration-1000 shadow-xl" 
                    style={{ width: `${fastingWindow?.progress || 65}%` }}
                  />
                </div>
                <div className="flex justify-between items-end">
                  <div>
                     <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Осталось времени</p>
                     <p className="text-5xl font-black text-indigo-600 tracking-tighter">{fastingWindow?.remainingTime || '05:42'}</p>
                  </div>
                  <Button className="rounded-2xl h-14 px-8 bg-indigo-600 hover:bg-indigo-700 font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/30">Пауза</Button>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* METRICS GRID: STEPS, SLEEP, HEART, WATER (LIFESUM STYLE) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
           {[
             { label: 'Шаги', val: '8,432', goal: '10k', icon: Footprints, color: 'text-orange-500', bg: 'bg-orange-50' },
             { label: 'Сон', val: '7ч 20м', goal: '8ч', icon: Moon, color: 'text-indigo-500', bg: 'bg-indigo-50' },
             { label: 'Пульс', val: '68', goal: 'bpm', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50' },
             { label: 'Вода', val: '1.4л', goal: '2.5л', icon: Droplet, color: 'text-blue-500', bg: 'bg-blue-50' }
           ].map((m, i) => (
             <Card key={i} className={cn("premium-card p-8 border-none flex flex-col items-center text-center gap-4 transition-transform hover:scale-105", m.bg)}>
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm", m.color.replace('text', 'bg').replace('500', '100'))}>
                   <m.icon className={cn("h-7 w-7", m.color)} />
                </div>
                <div>
                   <p className="text-2xl font-black tracking-tight">{m.val}</p>
                   <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{m.label} / {m.goal}</p>
                </div>
             </Card>
           ))}
        </div>

        {/* NUTRITION & MACROS (YAZIO/MYFITNESSPAL STYLE) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           <Card className="lg:col-span-8 premium-card p-10 border-none bg-white">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                      <Apple className="h-6 w-6 text-primary" />
                   </div>
                   <h3 className="text-2xl font-black tracking-tight">Микронутриенты</h3>
                </div>
                <Badge variant="outline" className="rounded-xl px-4 py-1.5 font-bold">Оптимально</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
                {(micronutrients || [
                  { name: 'Магний', current: 320, goal: 400, unit: 'мг' },
                  { name: 'Железо', current: 15, goal: 18, unit: 'мг' },
                  { name: 'Витамин D', current: 1200, goal: 2000, unit: 'ME' },
                  { name: 'Омега-3', current: 1.2, goal: 1.6, unit: 'г' },
                ]).map((micro, i) => (
                  <div key={i} className="space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">{micro.name}</span>
                      <span className="text-sm font-bold">{micro.current} / {micro.goal} <span className="text-[10px] text-muted-foreground">{micro.unit}</span></span>
                    </div>
                    <Progress value={(micro.current / micro.goal) * 100} className="h-2.5 bg-muted" />
                  </div>
                ))}
              </div>
              <div className="mt-12 p-6 bg-primary/5 rounded-3xl border border-primary/10 flex items-center gap-5">
                 <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                    <Brain className="h-6 w-6 text-primary" />
                 </div>
                 <p className="text-sm font-medium text-foreground/80 leading-relaxed italic">
                    «Ваш уровень Магния сегодня ниже нормы. ИИ рекомендует добавить в ужин горсть миндаля или семян тыквы для стабилизации нервной системы перед сном.»
                 </p>
              </div>
           </Card>

           <Card className="lg:col-span-4 premium-card p-10 border-none bg-white flex flex-col justify-between">
              <div className="flex items-center gap-4 mb-10">
                 <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center">
                    <Flame className="h-6 w-6 text-secondary" />
                 </div>
                 <h3 className="text-xl font-black tracking-tight">Энергобаланс</h3>
              </div>
              <div className="space-y-8">
                 <div className="flex justify-between items-center py-4 border-b">
                    <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">Цель</span>
                    <span className="text-xl font-black">2,450 ккал</span>
                 </div>
                 <div className="flex justify-between items-center py-4 border-b">
                    <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">Питание</span>
                    <span className="text-xl font-black text-primary">-1,240 ккал</span>
                 </div>
                 <div className="flex justify-between items-center py-4 border-b">
                    <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">Активность</span>
                    <span className="text-xl font-black text-secondary">+340 ккал</span>
                 </div>
                 <div className="pt-6">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Осталось</p>
                    <p className="text-6xl font-black text-primary tracking-tighter">1,550</p>
                    <p className="text-sm font-bold text-muted-foreground mt-2">ккал до цели</p>
                 </div>
              </div>
           </Card>
        </div>

        {/* MEAL TIMELINE (FATSECRET STYLE) */}
        <div className="space-y-8">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <Utensils className="h-6 w-6 text-primary" />
                 </div>
                 <h3 className="text-3xl font-black tracking-tighter">Дневник питания</h3>
              </div>
              <Button variant="outline" className="rounded-2xl h-12 px-6 font-black text-[10px] uppercase tracking-widest border-primary/20 text-primary hover:bg-primary/5">Экспорт данных</Button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {mealPlan[0].meals.map((meal, idx) => (
                <Card key={idx} className="premium-card border-none overflow-hidden group hover:shadow-2xl transition-all duration-500">
                  <div className="relative aspect-[4/3]">
                    <Image src={getMealImage(meal.imageId)} alt={meal.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <Badge className="absolute top-6 left-6 bg-white/20 backdrop-blur-md text-white border-none font-black text-[9px] uppercase tracking-widest px-4 py-1.5">{meal.time}</Badge>
                    <div className="absolute bottom-6 left-6 right-6 text-white">
                       <h4 className="text-2xl font-black leading-tight tracking-tight truncate">{meal.name}</h4>
                    </div>
                  </div>
                  <CardContent className="p-8 space-y-6">
                     <div className="flex justify-between items-center">
                        <span className="text-2xl font-black text-primary">{meal.calories} <span className="text-[10px] uppercase tracking-widest opacity-50">ккал</span></span>
                        <div className="flex gap-4">
                           <div className="flex flex-col items-center"><span className="text-xs font-black text-primary">{meal.protein || 0}г</span><span className="text-[8px] font-bold text-muted-foreground uppercase">Б</span></div>
                           <div className="flex flex-col items-center"><span className="text-xs font-black text-secondary">{meal.fat || 0}г</span><span className="text-[8px] font-bold text-muted-foreground uppercase">Ж</span></div>
                           <div className="flex flex-col items-center"><span className="text-xs font-black text-accent-foreground">{meal.carbs || 0}г</span><span className="text-[8px] font-bold text-muted-foreground uppercase">У</span></div>
                        </div>
                     </div>
                     <p className="text-sm font-medium text-muted-foreground leading-relaxed line-clamp-2">{meal.description}</p>
                  </CardContent>
                </Card>
              ))}
           </div>
        </div>

        {/* PROGRESS CHART (YAZIO/CRONOMETER STYLE) */}
        <Card className="premium-card p-10 border-none bg-white">
           <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
              <div className="flex items-center gap-5">
                 <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <TrendingDown className="h-7 w-7 text-primary" />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black tracking-tight">Тренд массы тела</h3>
                    <p className="text-sm font-medium text-muted-foreground">Последние 30 дней анализа</p>
                 </div>
              </div>
              <div className="text-center md:text-right">
                 <p className="text-5xl font-black tracking-tighter text-foreground">73.2 <span className="text-lg font-bold text-muted-foreground">кг</span></p>
                 <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] uppercase tracking-widest mt-2">-2.4 кг за месяц</Badge>
              </div>
           </div>
           <div className="h-[350px] w-full">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weightData}>
                    <defs>
                      <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 11, fontWeight: 'bold', fill: 'hsl(var(--muted-foreground))'}} 
                      dy={15}
                    />
                    <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', padding: '16px' }}
                      itemStyle={{ fontWeight: 'black', fontSize: '14px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={5} 
                      fillOpacity={1} 
                      fill="url(#colorWeight)" 
                      animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
           </div>
        </Card>
      </div>
    );
  }

  // MEALS TAB VIEW
  if (mode === 'meals') {
    return (
      <div className="grid grid-cols-1 gap-8 animate-in fade-in duration-700 max-w-5xl mx-auto">
         {mealPlan[0].meals.map((meal, idx) => (
           <Card key={idx} className="premium-card border-none bg-white overflow-hidden flex flex-col md:flex-row group">
              <div className="relative w-full md:w-80 h-64 shrink-0 overflow-hidden">
                 <Image src={getMealImage(meal.imageId)} alt={meal.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
              </div>
              <div className="p-10 flex-1 flex flex-col justify-between">
                 <div className="space-y-4">
                    <div className="flex justify-between items-start">
                       <div>
                          <Badge className="bg-primary/10 text-primary border-none text-[9px] font-black uppercase tracking-widest mb-3 px-4 py-1">{meal.time}</Badge>
                          <h3 className="text-3xl font-black tracking-tight leading-none">{meal.name}</h3>
                       </div>
                       <div className="text-right">
                          <p className="text-3xl font-black text-primary leading-none">{meal.calories} <span className="text-xs uppercase tracking-widest opacity-40">ккал</span></p>
                       </div>
                    </div>
                    <p className="text-muted-foreground font-medium text-lg leading-relaxed">{meal.description}</p>
                 </div>
                 
                 <div className="grid grid-cols-3 gap-8 pt-8 border-t mt-8">
                    <div className="space-y-1">
                       <p className="text-2xl font-black text-primary">{meal.protein || 0}г</p>
                       <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Белки</p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-2xl font-black text-secondary">{meal.fat || 0}г</p>
                       <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Жиры</p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-2xl font-black text-accent-foreground">{meal.carbs || 0}г</p>
                       <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Углеводы</p>
                    </div>
                 </div>
              </div>
           </Card>
         ))}
      </div>
    );
  }

  return null;
}