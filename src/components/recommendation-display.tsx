"use client";

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { GenerateRecommendationsOutput } from '@/ai/flows/generate-personalized-recommendations';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, Zap, Footprints, Moon, Heart, Droplet, 
  TrendingDown, Timer, ShieldCheck, Star, Brain, Apple, Flame, Utensils,
  Trophy, ArrowUpRight, Scale, Info, ChevronRight, LayoutGrid, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
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

  const macroData = [
    { name: 'Белки', value: macros.protein, color: 'hsl(var(--secondary))' },
    { name: 'Жиры', value: macros.fat, color: 'hsl(var(--accent))' },
    { name: 'Углеводы', value: macros.carbs, color: 'hsl(var(--muted-foreground))' },
  ];

  if (mode === 'dashboard') {
    return (
      <div className="space-y-16 md:space-y-24 animate-in fade-in slide-in-from-bottom-12 duration-1000">
        
        {/* SECTION 1: THE ULTIMATE BIO-HUB */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* MAIN BIO-SCORE CARD */}
          <div className="lg:col-span-8">
            <Card className="premium-card border-none bg-gradient-to-br from-[#1A3C26] via-[#2D5A3C] to-[#142F1C] text-white p-12 md:p-20 relative overflow-hidden h-full flex flex-col justify-center shadow-[0_50px_100px_-20px_rgba(45,122,77,0.4)]">
              <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-16">
                
                {/* THE RING */}
                <div className="relative w-72 h-72 md:w-[400px] md:h-[400px] shrink-0 group">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-[100px] animate-pulse group-hover:bg-primary/40 transition-all" />
                  <svg className="w-full h-full -rotate-90 bio-ring-glow">
                    <circle cx="50%" cy="50%" r="42%" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="24" />
                    <circle 
                      cx="50%" cy="50%" r="42%" fill="none" stroke="white" strokeWidth="24" 
                      strokeDasharray="100 100" strokeDashoffset={100 - bioScore} 
                      pathLength="100" strokeLinecap="round" 
                      className="macro-ring"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-[110px] md:text-[150px] font-black tracking-tighter leading-none">{bioScore}</span>
                    <span className="text-[16px] font-black uppercase tracking-[0.6em] opacity-40 -mt-4">Bio-Score</span>
                  </div>
                </div>
                
                {/* CONTENT */}
                <div className="flex-1 space-y-10 text-center xl:text-left">
                  <div className="space-y-6">
                    <div className="flex flex-wrap justify-center xl:justify-start gap-4">
                       <Badge className="bg-white/10 text-white border border-white/20 px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[11px] backdrop-blur-3xl shadow-xl">СТАТУС: ОПТИМАЛЬНО</Badge>
                       <Badge className="bg-accent/20 text-accent border border-accent/30 px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[11px] backdrop-blur-3xl shadow-xl">AI VERIFIED</Badge>
                    </div>
                    <h3 className="text-6xl md:text-9xl font-black tracking-tighter leading-[0.8] drop-shadow-2xl">Ваш Пик</h3>
                    <p className="text-white/70 text-xl md:text-3xl font-medium max-w-xl leading-relaxed mx-auto xl:mx-0">
                      Ваш метаболизм работает на 94% эффективнее. ИИ зафиксировал идеальный баланс нутриентов.
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap justify-center xl:justify-start gap-6 pt-4">
                     <div className="flex items-center gap-5 bg-white/5 px-10 py-6 rounded-[2.5rem] backdrop-blur-3xl border border-white/10 group hover:bg-white/10 transition-all cursor-default shadow-lg">
                        <Trophy className="h-8 w-8 text-accent animate-bounce" />
                        <span className="text-[12px] font-black uppercase tracking-[0.3em]">Личный рекорд</span>
                     </div>
                  </div>
                </div>
              </div>
              <Activity className="absolute -bottom-40 -left-40 h-[50rem] w-[50rem] text-white/5 pointer-events-none rotate-12" />
            </Card>
          </div>

          {/* FASTING WIDGET */}
          <div className="lg:col-span-4 h-full">
            <Card className="premium-card p-14 md:p-16 border-none bg-[#EFF0FF] flex flex-col justify-between h-full group hover:shadow-indigo-500/20 transition-all shadow-[0_40px_80px_-20px_rgba(79,70,229,0.1)]">
              <div className="flex items-center justify-between mb-16">
                 <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-indigo-600/40 group-hover:scale-110 transition-transform">
                       <Timer className="h-10 w-10 text-white" />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-3xl font-black tracking-tight text-indigo-950">Голодание</h3>
                      <p className="text-[12px] font-black text-indigo-400 uppercase tracking-widest">Протокол {fastingWindow?.type || '16:8'}</p>
                    </div>
                 </div>
                 <Button variant="ghost" size="icon" className="text-indigo-300 hover:text-indigo-600 rounded-full h-14 w-14"><Info className="h-7 w-7" /></Button>
              </div>

              <div className="space-y-14">
                <div className="relative h-10 bg-indigo-100/50 rounded-full overflow-hidden p-2 shadow-inner border border-indigo-200/30">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full transition-all duration-1000 shadow-lg shadow-indigo-600/30" 
                    style={{ width: `${fastingWindow?.progress || 68}%` }}
                  />
                </div>

                <div className="flex justify-between items-end">
                  <div className="space-y-3">
                     <p className="text-[12px] font-black text-indigo-400 uppercase tracking-widest">Осталось времени</p>
                     <p className="text-7xl md:text-8xl font-black text-indigo-600 tracking-tighter tabular-nums leading-none">
                        {fastingWindow?.remainingTime || '05:24'}
                     </p>
                  </div>
                  <Button className="rounded-[2.5rem] h-24 px-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[13px] uppercase tracking-[0.3em] shadow-2xl shadow-indigo-600/40 active:scale-95 transition-all">
                    Стоп
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* SECTION 2: MACRO VISUALIZATION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           {/* MACRO BREAKDOWN */}
           <Card className="lg:col-span-5 premium-card p-14 md:p-16 border-none bg-white">
              <h3 className="text-4xl font-black tracking-tighter mb-12">Баланс КБЖУ</h3>
              <div className="h-[350px] w-full flex items-center justify-center relative">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie 
                         data={macroData} 
                         innerRadius={110} 
                         outerRadius={140} 
                         paddingAngle={8} 
                         dataKey="value"
                         stroke="none"
                         animationDuration={2000}
                       >
                          {macroData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                       </Pie>
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-6xl font-black tracking-tighter">{macros.calories}</span>
                    <span className="text-[12px] font-black uppercase tracking-widest opacity-40">Ккал</span>
                 </div>
              </div>
              <div className="grid grid-cols-3 gap-6 mt-12">
                 {macroData.map((m, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                       <div className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color }} />
                       <span className="text-[11px] font-black uppercase tracking-widest opacity-50">{m.name}</span>
                       <span className="text-xl font-black">{m.value}г</span>
                    </div>
                 ))}
              </div>
           </Card>

           {/* ENERGY LIMIT CARD */}
           <Card className="lg:col-span-7 premium-card p-14 md:p-16 border-none bg-primary text-white relative overflow-hidden flex flex-col justify-between">
              <div className="relative z-10">
                 <p className="text-[14px] font-black uppercase tracking-[0.5em] opacity-60 mb-8">ЭНЕРГЕТИЧЕСКИЙ ЛИМИТ</p>
                 <div className="space-y-4">
                    <h3 className="text-8xl md:text-[140px] font-black tracking-tighter leading-none">{1528}</h3>
                    <p className="text-2xl md:text-4xl font-medium opacity-80">ккал осталось на сегодня</p>
                 </div>
              </div>
              <div className="relative z-10 pt-16 flex items-center gap-10">
                 <div className="flex-1 space-y-4">
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest opacity-60">
                       <span>Питание</span>
                       <span>{macros.calories} / 2450</span>
                    </div>
                    <div className="h-4 bg-white/10 rounded-full overflow-hidden p-1">
                       <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${(macros.calories / 2450) * 100}%` }} />
                    </div>
                 </div>
                 <Button className="rounded-full w-24 h-24 bg-white text-primary hover:scale-110 transition-all shadow-2xl">
                    <Plus className="h-10 w-10" />
                 </Button>
              </div>
              <Flame className="absolute -right-20 -top-20 h-96 w-96 text-white/5 opacity-40 rotate-12" />
           </Card>
        </div>

        {/* SECTION 3: LIVE METRICS HUB */}
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

        {/* SECTION 4: PROGRESS & MICRONUTRIENTS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           {/* PROGRESS CHART */}
           <Card className="lg:col-span-12 premium-card p-14 md:p-20 border-none bg-white">
              <div className="flex flex-col md:flex-row items-center justify-between gap-12 mb-20">
                 <div className="flex items-center gap-10">
                    <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center">
                       <TrendingDown className="h-12 w-12 text-primary" />
                    </div>
                    <div className="space-y-2">
                       <h3 className="text-5xl font-black tracking-tighter leading-none">Динамика веса</h3>
                       <p className="text-xl font-medium text-muted-foreground">Биометрический тренд прогресса</p>
                    </div>
                 </div>
                 <div className="text-center md:text-right space-y-4">
                    <p className="text-8xl font-black tracking-tighter text-foreground leading-none">76.2 <span className="text-2xl font-black text-muted-foreground uppercase tracking-[0.3em]">кг</span></p>
                    <Badge className="bg-primary/10 text-primary border-none font-black text-[13px] uppercase tracking-widest px-10 py-4 rounded-[1.5rem] shadow-sm">
                      -2.3 КГ ЗА МЕСЯЦ
                    </Badge>
                 </div>
              </div>
              <div className="h-[450px] w-full">
                 {mounted && (
                   <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={weightTrendData}>
                       <defs>
                         <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                           <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                         </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                       <XAxis 
                         dataKey="date" 
                         axisLine={false} 
                         tickLine={false} 
                         tick={{fontSize: 16, fontWeight: '900', fill: 'hsl(var(--muted-foreground))', letterSpacing: '0.1em'}} 
                         dy={30}
                       />
                       <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
                       <Tooltip 
                         contentStyle={{ borderRadius: '3rem', border: 'none', boxShadow: '0 50px 120px -20px rgba(0,0,0,0.3)', padding: '40px' }}
                         itemStyle={{ fontWeight: '900', fontSize: '24px', color: 'hsl(var(--primary))' }}
                         labelStyle={{ fontWeight: 'black', color: 'hsl(var(--muted-foreground))', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '0.3em', fontSize: '11px' }}
                       />
                       <Area 
                         type="monotone" 
                         dataKey="weight" 
                         stroke="hsl(var(--primary))" 
                         strokeWidth={10} 
                         fillOpacity={1} 
                         fill="url(#colorWeight)" 
                         animationDuration={3000}
                       />
                     </AreaChart>
                   </ResponsiveContainer>
                 )}
              </div>
           </Card>
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
              <div className="relative w-full xl:w-[500px] h-[400px] shrink-0 overflow-hidden">
                 <Image src={getMealImage(meal.imageId)} alt={meal.name} fill className="object-cover group-hover:scale-110 transition-transform duration-1000" />
                 <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-all" />
                 <Badge className="absolute top-10 left-10 bg-white/20 backdrop-blur-3xl text-white border-none font-black text-[12px] uppercase tracking-[0.4em] px-10 py-5 rounded-[2rem]">{meal.time}</Badge>
              </div>
              <div className="p-12 md:p-16 flex-1 flex flex-col justify-between">
                 <div className="space-y-8">
                    <div className="flex justify-between items-start gap-6">
                       <h3 className="text-5xl md:text-7xl font-black tracking-tighter leading-none text-foreground">{meal.name}</h3>
                       <div className="text-right shrink-0">
                          <p className="text-5xl md:text-7xl font-black text-primary leading-none tracking-tighter">{meal.calories} <span className="text-sm uppercase tracking-[0.5em] font-black opacity-30">ккал</span></p>
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
