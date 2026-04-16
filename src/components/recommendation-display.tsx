"use client";

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { GenerateRecommendationsOutput } from '@/ai/flows/generate-personalized-recommendations';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, Zap, Footprints, Moon, Heart, Droplet, 
  TrendingDown, Timer, ShieldCheck, Star, Brain, Apple, Flame, Utensils,
  Trophy, ArrowUpRight, Scale, Info, ChevronRight, LayoutGrid
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

const weightTrendData = [
  { date: '01.04', weight: 78.5 },
  { date: '05.04', weight: 77.8 },
  { date: '10.04', weight: 77.2 },
  { date: '15.04', weight: 77.4 },
  { date: '20.04', weight: 76.8 },
  { date: 'Сегодня', weight: 76.2 },
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
      <div className="space-y-16 md:space-y-24 animate-in fade-in slide-in-from-bottom-12 duration-1000">
        
        {/* SECTION 1: THE ULTIMATE BIO-HUB */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* MAIN BIO-SCORE CARD */}
          <div className="lg:col-span-8">
            <Card className="premium-card border-none bg-gradient-to-br from-[#1E4D2B] via-[#2A6B3E] to-[#143B21] text-white p-12 md:p-20 relative overflow-hidden h-full flex flex-col justify-center">
              <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-16">
                
                {/* THE RING */}
                <div className="relative w-72 h-72 md:w-96 md:h-96 shrink-0 group">
                  <div className="absolute inset-0 bg-primary/30 rounded-full blur-[80px] animate-pulse group-hover:bg-primary/50 transition-all" />
                  <svg className="w-full h-full -rotate-90 bio-ring-glow">
                    <circle cx="50%" cy="50%" r="42%" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="18" />
                    <circle 
                      cx="50%" cy="50%" r="42%" fill="none" stroke="white" strokeWidth="18" 
                      strokeDasharray="100 100" strokeDashoffset={100 - bioScore} 
                      pathLength="100" strokeLinecap="round" 
                      className="macro-ring"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-[100px] md:text-[130px] font-black tracking-tighter leading-none">{bioScore}</span>
                    <span className="text-[14px] font-black uppercase tracking-[0.5em] opacity-50 -mt-2">Bio-Score</span>
                  </div>
                </div>
                
                {/* CONTENT */}
                <div className="flex-1 space-y-10 text-center xl:text-left">
                  <div className="space-y-4">
                    <div className="flex flex-wrap justify-center xl:justify-start gap-3">
                       <Badge className="bg-white/10 text-white border border-white/20 px-6 py-2 rounded-2xl font-black uppercase tracking-widest text-[10px] backdrop-blur-2xl">СТАТУС: ОПТИМАЛЬНО</Badge>
                       <Badge className="bg-accent/20 text-accent border border-accent/30 px-6 py-2 rounded-2xl font-black uppercase tracking-widest text-[10px] backdrop-blur-2xl">AI VERIFIED</Badge>
                    </div>
                    <h3 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9]">Биологический Пик</h3>
                    <p className="text-white/70 text-lg md:text-2xl font-medium max-w-xl leading-relaxed mx-auto xl:mx-0">
                      Ваш метаболизм работает на 94% эффективнее, чем на прошлой неделе. ИИ зафиксировал идеальный баланс нутриентов.
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap justify-center xl:justify-start gap-5">
                     <div className="flex items-center gap-4 bg-white/10 px-8 py-5 rounded-[2.5rem] backdrop-blur-2xl border border-white/10 group hover:bg-white/20 transition-all cursor-default">
                        <Trophy className="h-7 w-7 text-accent animate-bounce" />
                        <span className="text-[11px] font-black uppercase tracking-[0.2em]">Личный рекорд</span>
                     </div>
                     <div className="flex items-center gap-4 bg-white/10 px-8 py-5 rounded-[2.5rem] backdrop-blur-2xl border border-white/10">
                        <ArrowUpRight className="h-7 w-7 text-primary-foreground opacity-60" />
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/80">+14% к энергии</span>
                     </div>
                  </div>
                </div>
              </div>
              <Activity className="absolute -bottom-40 -left-40 h-[40rem] w-[40rem] text-white/5 pointer-events-none rotate-12" />
            </Card>
          </div>

          {/* FASTING WIDGET */}
          <div className="lg:col-span-4 h-full">
            <Card className="premium-card p-12 md:p-14 border-none bg-[#F3F4FF] flex flex-col justify-between h-full group hover:shadow-indigo-500/15 transition-all">
              <div className="flex items-center justify-between mb-12">
                 <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-indigo-600 rounded-[2.25rem] flex items-center justify-center shadow-2xl shadow-indigo-600/40 group-hover:scale-110 transition-transform">
                       <Timer className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-2xl font-black tracking-tight text-indigo-950">Голодание</h3>
                      <p className="text-[11px] font-black text-indigo-400 uppercase tracking-widest">Протокол {fastingWindow?.type || '16:8'}</p>
                    </div>
                 </div>
                 <Button variant="ghost" size="icon" className="text-indigo-200 hover:text-indigo-600 rounded-full h-12 w-12"><Info className="h-6 w-6" /></Button>
              </div>

              <div className="space-y-12">
                <div className="relative h-8 bg-indigo-100/50 rounded-full overflow-hidden p-1.5 shadow-inner border border-indigo-200/30">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-all duration-1000 shadow-lg shadow-indigo-500/20" 
                    style={{ width: `${fastingWindow?.progress || 68}%` }}
                  />
                </div>

                <div className="flex justify-between items-end">
                  <div className="space-y-2">
                     <p className="text-[11px] font-black text-indigo-400 uppercase tracking-widest">Осталось времени</p>
                     <p className="text-7xl font-black text-indigo-600 tracking-tighter tabular-nums leading-none">
                        {fastingWindow?.remainingTime || '05:24'}
                     </p>
                  </div>
                  <Button className="rounded-[2rem] h-20 px-12 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/40 active:scale-95 transition-all">
                    Стоп
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* SECTION 2: LIVE METRICS HUB */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
           {[
             { label: 'Активность', val: '9,215', goal: '12k', icon: Footprints, color: 'text-orange-500', bg: 'bg-orange-50/50' },
             { label: 'Сон', val: '7ч 45м', goal: '8ч', icon: Moon, color: 'text-indigo-600', bg: 'bg-indigo-50/50' },
             { label: 'Пульс', val: '62', goal: 'bpm', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50/50' },
             { label: 'Вода', val: '1.8л', goal: '3.0л', icon: Droplet, color: 'text-blue-500', bg: 'bg-blue-50/50' }
           ].map((m, i) => (
             <Card key={i} className={cn("premium-card p-10 md:p-14 border-none flex flex-col items-center text-center gap-8 transition-all hover:scale-105 hover:bg-white", m.bg)}>
                <div className={cn("w-20 h-20 rounded-[2.5rem] flex items-center justify-center shadow-lg", m.color.replace('text', 'bg').replace('500', '100').replace('600', '100'))}>
                   <m.icon className={cn("h-10 w-10", m.color)} />
                </div>
                <div className="space-y-2">
                   <p className="text-4xl font-black tracking-tighter leading-none">{m.val}</p>
                   <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-60">{m.label}</p>
                </div>
             </Card>
           ))}
        </div>

        {/* SECTION 3: NUTRITION & MICRO-ANALYSIS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           
           {/* MICRONUTRIENTS CARD */}
           <Card className="lg:col-span-8 premium-card p-12 md:p-16 border-none bg-white">
              <div className="flex items-center justify-between mb-16">
                <div className="flex items-center gap-6">
                   <div className="w-16 h-16 bg-primary/10 rounded-[2.5rem] flex items-center justify-center">
                      <Apple className="h-8 w-8 text-primary" />
                   </div>
                   <div className="space-y-1">
                      <h3 className="text-4xl font-black tracking-tighter leading-none">Микронутриенты</h3>
                      <p className="text-lg font-medium text-muted-foreground">Биометрический анализ витаминов</p>
                   </div>
                </div>
                <Badge variant="outline" className="rounded-2xl px-8 py-3 font-black uppercase text-[10px] border-primary/20 text-primary tracking-widest bg-primary/5">Deep Scan</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-24 gap-y-14">
                {(micronutrients || [
                  { name: 'Магний', current: 360, goal: 400, unit: 'мг' },
                  { name: 'Железо', current: 16, goal: 18, unit: 'мг' },
                  { name: 'Витамин D', current: 1800, goal: 2000, unit: 'ME' },
                  { name: 'Омега-3', current: 1.4, goal: 1.6, unit: 'г' },
                ]).map((micro, i) => (
                  <div key={i} className="space-y-5">
                    <div className="flex justify-between items-end">
                      <span className="text-[12px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-50">{micro.name}</span>
                      <span className="text-xl font-black text-foreground">
                        {micro.current} <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-widest">{micro.unit}</span>
                      </span>
                    </div>
                    <div className="relative h-4 bg-muted/50 rounded-full overflow-hidden">
                       <div 
                         className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(45,122,77,0.3)]"
                         style={{ width: `${Math.min((micro.current / micro.goal) * 100, 100)}%` }}
                       />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-20 p-10 bg-primary/5 rounded-[3.5rem] border border-primary/10 flex items-start gap-8 relative overflow-hidden group">
                 <div className="w-16 h-16 bg-white rounded-[2.5rem] flex items-center justify-center shadow-xl shadow-primary/5 shrink-0 relative z-10">
                    <Brain className="h-8 w-8 text-primary" />
                 </div>
                 <div className="space-y-3 relative z-10">
                    <p className="text-[11px] font-black uppercase tracking-[0.4em] text-primary">AI INSIGHT</p>
                    <p className="text-xl font-medium text-foreground/80 leading-relaxed italic">
                      «Ваш баланс Магния и Витамина D идеален для восстановления нервной системы. Рекомендую перенести тренировку на вечер, так как био-ритм сейчас на пике.»
                    </p>
                 </div>
                 <Activity className="absolute -right-20 -bottom-20 h-64 w-64 text-primary/5 opacity-40 group-hover:rotate-45 transition-transform duration-1000" />
              </div>
           </Card>

           {/* CALORIE BALANCE CARD */}
           <Card className="lg:col-span-4 premium-card p-12 md:p-14 border-none bg-white flex flex-col justify-between group">
              <div className="flex items-center gap-6 mb-16">
                 <div className="w-16 h-16 bg-secondary/10 rounded-[2.5rem] flex items-center justify-center group-hover:bg-secondary transition-all shadow-inner">
                    <Flame className="h-8 w-8 text-secondary group-hover:text-white transition-all" />
                 </div>
                 <h3 className="text-3xl font-black tracking-tighter">Энергобаланс</h3>
              </div>
              <div className="space-y-10">
                 <div className="flex justify-between items-center py-6 border-b border-muted/60">
                    <span className="text-[11px] font-black text-muted-foreground uppercase tracking-widest opacity-50">Цель</span>
                    <span className="text-3xl font-black tracking-tighter text-foreground">2,450 ккал</span>
                 </div>
                 <div className="flex justify-between items-center py-6 border-b border-muted/60">
                    <span className="text-[11px] font-black text-muted-foreground uppercase tracking-widest opacity-50">Питание</span>
                    <span className="text-3xl font-black text-primary tracking-tighter">-1,342 ккал</span>
                 </div>
                 <div className="flex justify-between items-center py-6 border-b border-muted/60">
                    <span className="text-[11px] font-black text-muted-foreground uppercase tracking-widest opacity-50">Активность</span>
                    <span className="text-3xl font-black text-secondary tracking-tighter">+420 ккал</span>
                 </div>
                 <div className="pt-10">
                    <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-4 opacity-40">Осталось</p>
                    <p className="text-8xl font-black text-primary tracking-tighter tabular-nums leading-[0.8]">1,528</p>
                    <p className="text-lg font-bold text-muted-foreground mt-6 px-1">ккал до лимита сегодня</p>
                 </div>
              </div>
           </Card>
        </div>

        {/* SECTION 4: PROGRESS VISUALIZATION */}
        <Card className="premium-card p-12 md:p-16 border-none bg-white">
           <div className="flex flex-col md:flex-row items-center justify-between gap-10 mb-20">
              <div className="flex items-center gap-8">
                 <div className="w-20 h-20 bg-primary/10 rounded-[2.5rem] flex items-center justify-center">
                    <TrendingDown className="h-10 w-10 text-primary" />
                 </div>
                 <div className="space-y-1">
                    <h3 className="text-4xl font-black tracking-tighter leading-none">Динамика веса</h3>
                    <p className="text-lg font-medium text-muted-foreground">Тренд за последний месяц</p>
                 </div>
              </div>
              <div className="text-center md:text-right space-y-3">
                 <p className="text-7xl font-black tracking-tighter text-foreground leading-none">76.2 <span className="text-2xl font-black text-muted-foreground uppercase tracking-widest">кг</span></p>
                 <Badge className="bg-primary/10 text-primary border-none font-black text-[11px] uppercase tracking-widest px-8 py-3 rounded-2xl">
                   -2.3 КГ ЗА 30 ДНЕЙ
                 </Badge>
              </div>
           </div>
           
           <div className="h-[450px] w-full">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weightTrendData}>
                    <defs>
                      <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 14, fontWeight: '900', fill: 'hsl(var(--muted-foreground))', letterSpacing: '0.1em'}} 
                      dy={25}
                    />
                    <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '2.5rem', border: 'none', boxShadow: '0 40px 100px -20px rgba(0,0,0,0.2)', padding: '32px' }}
                      itemStyle={{ fontWeight: '900', fontSize: '20px', color: 'hsl(var(--primary))' }}
                      labelStyle={{ fontWeight: 'black', color: 'hsl(var(--muted-foreground))', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '10px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={8} 
                      fillOpacity={1} 
                      fill="url(#colorWeight)" 
                      animationDuration={3000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
           </div>
        </Card>

        {/* SECTION 5: PREMIUM MEAL TIMELINE */}
        <div className="space-y-12">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                 <div className="w-20 h-20 bg-primary/10 rounded-[2.5rem] flex items-center justify-center">
                    <Utensils className="h-10 w-10 text-primary" />
                 </div>
                 <h3 className="text-5xl font-black tracking-tighter leading-none">Дневник питания</h3>
              </div>
              <Button variant="outline" className="rounded-[2rem] h-16 px-10 font-black text-[11px] uppercase tracking-widest border-primary/20 text-primary hover:bg-primary hover:text-white transition-all">Полный отчет</Button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-24 md:pb-0">
              {mealPlan[0].meals.map((meal, idx) => (
                <Card key={idx} className="premium-card border-none overflow-hidden group hover:shadow-[0_50px_120px_-25px_rgba(0,0,0,0.2)] transition-all duration-1000">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image src={getMealImage(meal.imageId)} alt={meal.name} fill className="object-cover group-hover:scale-110 transition-transform duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent" />
                    <Badge className="absolute top-10 left-10 bg-white/10 backdrop-blur-3xl text-white border border-white/20 font-black text-[11px] uppercase tracking-[0.3em] px-6 py-3 rounded-2xl">{meal.time}</Badge>
                    <div className="absolute bottom-10 left-10 right-10 text-white">
                       <h4 className="text-3xl md:text-4xl font-black leading-tight tracking-tight truncate group-hover:translate-x-3 transition-transform">{meal.name}</h4>
                    </div>
                  </div>
                  <CardContent className="p-12 space-y-10">
                     <div className="flex justify-between items-center">
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-black text-primary leading-none">{meal.calories}</span>
                          <span className="text-[11px] uppercase tracking-widest font-black opacity-30">ккал</span>
                        </div>
                        <div className="flex gap-6">
                           <div className="flex flex-col items-center"><span className="text-lg font-black text-primary leading-none">{meal.protein || 0}г</span><span className="text-[10px] font-black text-muted-foreground uppercase opacity-50 mt-1">Б</span></div>
                           <div className="flex flex-col items-center"><span className="text-lg font-black text-secondary leading-none">{meal.fat || 0}г</span><span className="text-[10px] font-black text-muted-foreground uppercase opacity-50 mt-1">Ж</span></div>
                           <div className="flex flex-col items-center"><span className="text-lg font-black text-accent-foreground leading-none">{meal.carbs || 0}г</span><span className="text-[10px] font-black text-muted-foreground uppercase opacity-50 mt-1">У</span></div>
                        </div>
                     </div>
                     <p className="text-lg font-medium text-muted-foreground leading-relaxed line-clamp-2 italic">«{meal.description}»</p>
                     <Button variant="ghost" className="w-full h-16 rounded-[1.75rem] bg-muted/50 font-black text-[11px] uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-all">Детализация</Button>
                  </CardContent>
                </Card>
              ))}
           </div>
        </div>
      </div>
    );
  }

  // MEALS MODE
  if (mode === 'meals') {
    return (
      <div className="grid grid-cols-1 gap-14 animate-in fade-in duration-1000 max-w-6xl mx-auto py-12 pb-32 md:pb-12">
         {mealPlan[0].meals.map((meal, idx) => (
           <Card key={idx} className="premium-card border-none bg-white overflow-hidden flex flex-col xl:flex-row group hover:shadow-3xl transition-all">
              <div className="relative w-full xl:w-[500px] h-[350px] shrink-0 overflow-hidden">
                 <Image src={getMealImage(meal.imageId)} alt={meal.name} fill className="object-cover group-hover:scale-110 transition-transform duration-1000" />
                 <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-all" />
                 <Badge className="absolute top-10 left-10 bg-white/20 backdrop-blur-3xl text-white border-none font-black text-[11px] uppercase tracking-[0.3em] px-8 py-4 rounded-[1.5rem]">{meal.time}</Badge>
              </div>
              <div className="p-12 md:p-16 flex-1 flex flex-col justify-between">
                 <div className="space-y-8">
                    <div className="flex justify-between items-start">
                       <h3 className="text-5xl md:text-7xl font-black tracking-tighter leading-none text-foreground">{meal.name}</h3>
                       <div className="text-right">
                          <p className="text-5xl md:text-7xl font-black text-primary leading-none tracking-tighter">{meal.calories} <span className="text-sm uppercase tracking-[0.4em] font-black opacity-30">ккал</span></p>
                       </div>
                    </div>
                    <p className="text-muted-foreground font-medium text-xl md:text-3xl leading-relaxed italic">«{meal.description}»</p>
                 </div>
                 
                 <div className="grid grid-cols-3 gap-16 pt-12 border-t mt-12">
                    <div className="space-y-3">
                       <p className="text-4xl md:text-6xl font-black text-primary leading-none tracking-tighter">{meal.protein || 0}г</p>
                       <p className="text-[12px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-40">Протеины</p>
                    </div>
                    <div className="space-y-3">
                       <p className="text-4xl md:text-6xl font-black text-secondary leading-none tracking-tighter">{meal.fat || 0}г</p>
                       <p className="text-[12px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-40">Липиды</p>
                    </div>
                    <div className="space-y-3">
                       <p className="text-4xl md:text-6xl font-black text-accent-foreground leading-none tracking-tighter">{meal.carbs || 0}г</p>
                       <p className="text-[12px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-40">Карбо</p>
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