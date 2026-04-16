'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { GenerateRecommendationsOutput } from '@/ai/flows/generate-personalized-recommendations';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, Zap, Footprints, Moon, Heart, Droplet, 
  TrendingDown, Timer, ShieldCheck, Star, Brain, Apple, Flame, Utensils,
  Trophy, ArrowUpRight, Scale, Info
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
      <div className="space-y-12 md:space-y-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        
        {/* SECTION 1: THE ULTIMATE BIO-HUB (LIFESUM + YAZIO MIX) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* MAIN BIO-SCORE CARD */}
          <div className="lg:col-span-8">
            <Card className="premium-card border-none bg-gradient-to-br from-primary via-[#2D7A4D] to-[#1B4D31] text-white p-12 md:p-16 relative overflow-hidden h-full flex flex-col justify-center">
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-16">
                
                {/* THE RING */}
                <div className="relative w-64 h-64 md:w-80 md:h-80 shrink-0 group">
                  <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl animate-pulse group-hover:bg-white/20 transition-all" />
                  <svg className="w-full h-full -rotate-90 filter drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                    <circle cx="50%" cy="50%" r="44%" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="16" />
                    <circle 
                      cx="50%" cy="50%" r="44%" fill="none" stroke="white" strokeWidth="16" 
                      strokeDasharray="100 100" strokeDashoffset={100 - bioScore} 
                      pathLength="100" strokeLinecap="round" 
                      className="macro-ring"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-8xl font-black tracking-tighter leading-none">{bioScore}</span>
                    <span className="text-[12px] font-black uppercase tracking-[0.5em] opacity-60 mt-2">Bio-Score</span>
                  </div>
                </div>
                
                {/* CONTENT */}
                <div className="flex-1 space-y-8 text-center md:text-left">
                  <div className="space-y-3">
                    <Badge className="bg-white/20 text-white border-none px-6 py-2 rounded-2xl font-black uppercase tracking-widest text-[10px] backdrop-blur-xl">Ваш статус: Оптимально</Badge>
                    <h3 className="text-4xl md:text-7xl font-black tracking-tighter leading-tight">Биологический пик</h3>
                    <p className="text-white/80 text-lg md:text-xl font-medium max-w-lg leading-relaxed">
                      Ваш метаболизм работает на 94% эффективнее, чем на прошлой неделе. ИИ зафиксировал идеальный баланс нутриентов.
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap justify-center md:justify-start gap-5">
                     <div className="flex items-center gap-3 bg-white/10 px-6 py-4 rounded-[2rem] backdrop-blur-xl border border-white/10 group hover:bg-white/20 transition-all cursor-default">
                        <Trophy className="h-6 w-6 text-accent animate-bounce" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Личный рекорд</span>
                     </div>
                     <div className="flex items-center gap-3 bg-white/10 px-6 py-4 rounded-[2rem] backdrop-blur-xl border border-white/10">
                        <ArrowUpRight className="h-6 w-6 text-primary-foreground" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">+14% к энергии</span>
                     </div>
                  </div>
                </div>
              </div>
              <Activity className="absolute -bottom-32 -left-32 h-[30rem] w-[30rem] text-white/5 pointer-events-none rotate-12" />
            </Card>
          </div>

          {/* FASTING WIDGET (YAZIO STYLE) */}
          <div className="lg:col-span-4 h-full">
            <Card className="premium-card p-12 border-none bg-[#F3F4FF] flex flex-col justify-between h-full group hover:shadow-indigo-500/10 transition-all">
              <div className="flex items-center justify-between mb-10">
                 <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-indigo-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-600/30 group-hover:scale-110 transition-transform">
                       <Timer className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-xl font-black tracking-tight text-indigo-950">Голодание</h3>
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Протокол {fastingWindow?.type || '16:8'}</p>
                    </div>
                 </div>
                 <Button variant="ghost" size="icon" className="text-indigo-300 hover:text-indigo-600"><Info className="h-5 w-5" /></Button>
              </div>

              <div className="space-y-10">
                <div className="relative h-6 bg-indigo-100 rounded-full overflow-hidden p-1 shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-all duration-1000" 
                    style={{ width: `${fastingWindow?.progress || 68}%` }}
                  />
                </div>

                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                     <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Осталось времени</p>
                     <p className="text-6xl font-black text-indigo-600 tracking-tighter tabular-nums">
                        {fastingWindow?.remainingTime || '05:24'}
                     </p>
                  </div>
                  <Button className="rounded-[1.75rem] h-16 px-10 bg-indigo-600 hover:bg-indigo-700 font-black text-[11px] uppercase tracking-widest shadow-xl shadow-indigo-600/30 active:scale-95 transition-all">
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
             { label: 'Восстановление', val: '7ч 45м', goal: '8ч', icon: Moon, color: 'text-indigo-600', bg: 'bg-indigo-50/50' },
             { label: 'Пульс (Покой)', val: '62', goal: 'bpm', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50/50' },
             { label: 'Гидратация', val: '1.8л', goal: '3.0л', icon: Droplet, color: 'text-blue-500', bg: 'bg-blue-50/50' }
           ].map((m, i) => (
             <Card key={i} className={cn("premium-card p-10 border-none flex flex-col items-center text-center gap-6 transition-all hover:scale-105 hover:bg-white", m.bg)}>
                <div className={cn("w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-sm", m.color.replace('text', 'bg').replace('500', '100').replace('600', '100'))}>
                   <m.icon className={cn("h-8 w-8", m.color)} />
                </div>
                <div className="space-y-1">
                   <p className="text-3xl font-black tracking-tight">{m.val}</p>
                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">{m.label}</p>
                </div>
             </Card>
           ))}
        </div>

        {/* SECTION 3: NUTRITION & MICRO-ANALYSIS (CRONOMETER + MYFITNESSPAL) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           
           {/* MICRONUTRIENTS CARD */}
           <Card className="lg:col-span-8 premium-card p-12 border-none bg-white">
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-5">
                   <div className="w-14 h-14 bg-primary/10 rounded-[2rem] flex items-center justify-center">
                      <Apple className="h-7 w-7 text-primary" />
                   </div>
                   <div>
                      <h3 className="text-3xl font-black tracking-tight">Микронутриенты</h3>
                      <p className="text-sm font-medium text-muted-foreground">Анализ витаминов и минералов</p>
                   </div>
                </div>
                <Badge variant="outline" className="rounded-2xl px-6 py-2 font-black uppercase text-[10px] border-primary/20 text-primary">Отчет ИИ</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-12">
                {(micronutrients || [
                  { name: 'Магний', current: 360, goal: 400, unit: 'мг' },
                  { name: 'Железо', current: 16, goal: 18, unit: 'мг' },
                  { name: 'Витамин D', current: 1800, goal: 2000, unit: 'ME' },
                  { name: 'Омега-3', current: 1.4, goal: 1.6, unit: 'г' },
                ]).map((micro, i) => (
                  <div key={i} className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">{micro.name}</span>
                      <span className="text-sm font-black text-foreground">
                        {micro.current} <span className="text-[10px] text-muted-foreground font-medium uppercase">{micro.unit}</span>
                      </span>
                    </div>
                    <Progress value={(micro.current / micro.goal) * 100} className="h-3 bg-muted rounded-full" />
                  </div>
                ))}
              </div>

              <div className="mt-16 p-8 bg-primary/5 rounded-[2.5rem] border border-primary/10 flex items-start gap-6">
                 <div className="w-14 h-14 bg-white rounded-[2rem] flex items-center justify-center shadow-lg shadow-primary/5 shrink-0">
                    <Brain className="h-7 w-7 text-primary" />
                 </div>
                 <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">AI Insight</p>
                    <p className="text-lg font-medium text-foreground/80 leading-relaxed italic">
                      «Ваш баланс Магния и Витамина D идеален для восстановления нервной системы. Рекомендую перенести тренировку на вечер, так как био-ритм сейчас на пике.»
                    </p>
                 </div>
              </div>
           </Card>

           {/* CALORIE BALANCE CARD */}
           <Card className="lg:col-span-4 premium-card p-12 border-none bg-white flex flex-col justify-between group">
              <div className="flex items-center gap-5 mb-12">
                 <div className="w-14 h-14 bg-secondary/10 rounded-[2rem] flex items-center justify-center group-hover:bg-secondary transition-all">
                    <Flame className="h-7 w-7 text-secondary group-hover:text-white transition-all" />
                 </div>
                 <h3 className="text-2xl font-black tracking-tight">Энергобаланс</h3>
              </div>
              <div className="space-y-10">
                 <div className="flex justify-between items-center py-5 border-b border-muted">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Цель</span>
                    <span className="text-2xl font-black tracking-tight">2,450 ккал</span>
                 </div>
                 <div className="flex justify-between items-center py-5 border-b border-muted">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Питание</span>
                    <span className="text-2xl font-black text-primary tracking-tight">-1,342 ккал</span>
                 </div>
                 <div className="flex justify-between items-center py-5 border-b border-muted">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Активность</span>
                    <span className="text-2xl font-black text-secondary tracking-tight">+420 ккал</span>
                 </div>
                 <div className="pt-8">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-3">Осталось</p>
                    <p className="text-7xl font-black text-primary tracking-tighter tabular-nums leading-none">1,528</p>
                    <p className="text-sm font-bold text-muted-foreground mt-4">ккал до лимита сегодня</p>
                 </div>
              </div>
           </Card>
        </div>

        {/* SECTION 4: PROGRESS VISUALIZATION (APPLE HEALTH + FITBIT) */}
        <Card className="premium-card p-12 border-none bg-white">
           <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
              <div className="flex items-center gap-6">
                 <div className="w-16 h-16 bg-primary/10 rounded-[2rem] flex items-center justify-center">
                    <TrendingDown className="h-8 w-8 text-primary" />
                 </div>
                 <div>
                    <h3 className="text-3xl font-black tracking-tight">Динамика веса</h3>
                    <p className="text-sm font-medium text-muted-foreground">Тренд за последний месяц</p>
                 </div>
              </div>
              <div className="text-center md:text-right space-y-2">
                 <p className="text-6xl font-black tracking-tighter text-foreground">76.2 <span className="text-xl font-bold text-muted-foreground uppercase tracking-widest">кг</span></p>
                 <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] uppercase tracking-widest px-6 py-2 rounded-xl">
                   -2.3 кг за 30 дней
                 </Badge>
              </div>
           </div>
           
           <div className="h-[400px] w-full">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weightTrendData}>
                    <defs>
                      <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 12, fontWeight: 'bold', fill: 'hsl(var(--muted-foreground))'}} 
                      dy={20}
                    />
                    <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '2rem', border: 'none', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.15)', padding: '24px' }}
                      itemStyle={{ fontWeight: 'black', fontSize: '16px', color: 'hsl(var(--primary))' }}
                      labelStyle={{ fontWeight: 'bold', color: 'hsl(var(--muted-foreground))', marginBottom: '8px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={6} 
                      fillOpacity={1} 
                      fill="url(#colorWeight)" 
                      animationDuration={2500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
           </div>
        </Card>

        {/* SECTION 5: PREMIUM MEAL TIMELINE (FATSECRET STYLE) */}
        <div className="space-y-10">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                 <div className="w-16 h-16 bg-primary/10 rounded-[2rem] flex items-center justify-center">
                    <Utensils className="h-8 w-8 text-primary" />
                 </div>
                 <h3 className="text-4xl font-black tracking-tighter">Дневник питания</h3>
              </div>
              <Button variant="outline" className="rounded-[1.75rem] h-14 px-8 font-black text-[11px] uppercase tracking-widest border-primary/20 text-primary hover:bg-primary/5">Детальный отчет</Button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {mealPlan[0].meals.map((meal, idx) => (
                <Card key={idx} className="premium-card border-none overflow-hidden group hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] transition-all duration-700">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image src={getMealImage(meal.imageId)} alt={meal.name} fill className="object-cover group-hover:scale-110 transition-transform duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    <Badge className="absolute top-8 left-8 bg-white/20 backdrop-blur-xl text-white border-none font-black text-[10px] uppercase tracking-[0.2em] px-5 py-2.5 rounded-xl">{meal.time}</Badge>
                    <div className="absolute bottom-8 left-8 right-8 text-white">
                       <h4 className="text-3xl font-black leading-tight tracking-tight truncate group-hover:translate-x-2 transition-transform">{meal.name}</h4>
                    </div>
                  </div>
                  <CardContent className="p-10 space-y-8">
                     <div className="flex justify-between items-center">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-black text-primary">{meal.calories}</span>
                          <span className="text-[10px] uppercase tracking-widest font-black opacity-40">ккал</span>
                        </div>
                        <div className="flex gap-5">
                           <div className="flex flex-col items-center"><span className="text-sm font-black text-primary">{meal.protein || 0}г</span><span className="text-[9px] font-black text-muted-foreground uppercase">Б</span></div>
                           <div className="flex flex-col items-center"><span className="text-sm font-black text-secondary">{meal.fat || 0}г</span><span className="text-[9px] font-black text-muted-foreground uppercase">Ж</span></div>
                           <div className="flex flex-col items-center"><span className="text-sm font-black text-accent-foreground">{meal.carbs || 0}г</span><span className="text-[9px] font-black text-muted-foreground uppercase">У</span></div>
                        </div>
                     </div>
                     <p className="text-base font-medium text-muted-foreground leading-relaxed line-clamp-2">{meal.description}</p>
                     <Button variant="ghost" className="w-full h-14 rounded-2xl bg-muted/50 font-black text-[10px] uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-all">Редактировать</Button>
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
      <div className="grid grid-cols-1 gap-12 animate-in fade-in duration-1000 max-w-5xl mx-auto py-10">
         {mealPlan[0].meals.map((meal, idx) => (
           <Card key={idx} className="premium-card border-none bg-white overflow-hidden flex flex-col md:flex-row group hover:shadow-2xl transition-all">
              <div className="relative w-full md:w-[400px] h-[300px] shrink-0 overflow-hidden">
                 <Image src={getMealImage(meal.imageId)} alt={meal.name} fill className="object-cover group-hover:scale-105 transition-transform duration-1000" />
                 <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-all" />
              </div>
              <div className="p-12 flex-1 flex flex-col justify-between">
                 <div className="space-y-6">
                    <div className="flex justify-between items-start">
                       <div>
                          <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black uppercase tracking-widest mb-4 px-6 py-2 rounded-xl">{meal.time}</Badge>
                          <h3 className="text-4xl font-black tracking-tight leading-none">{meal.name}</h3>
                       </div>
                       <div className="text-right">
                          <p className="text-4xl font-black text-primary leading-none">{meal.calories} <span className="text-xs uppercase tracking-widest font-black opacity-30">ккал</span></p>
                       </div>
                    </div>
                    <p className="text-muted-foreground font-medium text-xl leading-relaxed">{meal.description}</p>
                 </div>
                 
                 <div className="grid grid-cols-3 gap-12 pt-10 border-t mt-10">
                    <div className="space-y-2">
                       <p className="text-3xl font-black text-primary leading-none">{meal.protein || 0}г</p>
                       <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Белки</p>
                    </div>
                    <div className="space-y-2">
                       <p className="text-3xl font-black text-secondary leading-none">{meal.fat || 0}г</p>
                       <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Жиры</p>
                    </div>
                    <div className="space-y-2">
                       <p className="text-3xl font-black text-accent-foreground leading-none">{meal.carbs || 0}г</p>
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