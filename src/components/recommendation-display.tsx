'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { GenerateRecommendationsOutput } from '@/ai/flows/generate-personalized-recommendations';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  HeartPulse, Utensils, Pill, Flame, Beef, Droplets, Wheat, Activity, 
  ChevronRight, ChevronLeft, Zap, Footprints, Moon, Heart, Droplet, 
  TrendingDown, Timer, ShieldCheck, Star, Brain, Apple
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
  const { bioScore, recommendations, macros, micronutrients, fastingWindow, mealPlan, activityAnalysis } = data;
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
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
      <div className="space-y-8 md:space-y-12 animate-in fade-in duration-1000">
        
        {/* ВЕРХНЯЯ ПАНЕЛЬ: BIO-SCORE И ГЛАВНЫЕ МЕТРИКИ (YAZIO + LIFESUM STYLE) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 premium-card border-none bg-gradient-to-br from-primary to-primary/80 text-white p-8 md:p-12 relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
              <div className="relative w-40 h-40 shrink-0">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="80" cy="80" r="74" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="12" />
                  <circle cx="80" cy="80" r="74" fill="none" stroke="white" strokeWidth="12" strokeDasharray="465" 
                    strokeDashoffset={465 - (465 * bioScore / 100)} className="transition-all duration-1000 ease-out" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black">{bioScore}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Bio-Score</span>
                </div>
              </div>
              <div className="space-y-4 text-center md:text-left">
                <Badge className="bg-white/20 text-white border-none px-4 py-1 rounded-full font-black uppercase tracking-widest text-[10px]">Ваш индекс здоровья</Badge>
                <h3 className="text-2xl md:text-4xl font-black tracking-tighter leading-none">Отличный прогресс!</h3>
                <p className="text-white/80 font-medium max-w-md">Ваши биометрические показатели на 12% лучше, чем на прошлой неделе. Продолжайте в том же духе.</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
                   <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
                      <ShieldCheck className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase">Иммунитет Ок</span>
                   </div>
                   <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
                      <Star className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase">Гормоны в норме</span>
                   </div>
                </div>
              </div>
            </div>
            <Activity className="absolute -bottom-10 -right-10 h-64 w-64 text-white/5" />
          </Card>

          {/* Интервальное голодание (YAZIO Style) */}
          <Card className="premium-card border-none bg-white p-8 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                     <Timer className="h-5 w-5 text-indigo-500" />
                  </div>
                  <h3 className="text-lg font-black tracking-tight">Голодание</h3>
               </div>
               <Badge variant="outline" className="border-indigo-100 text-indigo-600 font-black">{fastingWindow?.type || '16:8'}</Badge>
            </div>
            <div className="space-y-6">
              <div className="relative h-4 bg-muted rounded-full overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-indigo-500 transition-all duration-1000" 
                  style={{ width: `${fastingWindow?.progress || 65}%` }}
                />
              </div>
              <div className="flex justify-between items-end">
                <div>
                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Осталось</p>
                   <p className="text-3xl font-black text-indigo-500">{fastingWindow?.remainingTime || '05:42'}</p>
                </div>
                <Button className="rounded-xl h-10 px-6 bg-indigo-500 hover:bg-indigo-600 font-black text-[10px] uppercase">Старт</Button>
              </div>
            </div>
          </Card>
        </div>

        {/* НУТРИЕНТЫ И МИКРОНУТРИЕНТЫ (CRONOMETER STYLE) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <Card className="lg:col-span-2 premium-card p-8 border-none bg-white">
              <div className="flex items-center gap-3 mb-8">
                <Apple className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-black tracking-tight">Микронутриенты и Витамины</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                {(micronutrients || [
                  { name: 'Магний', current: 320, goal: 400, unit: 'мг' },
                  { name: 'Железо', current: 15, goal: 18, unit: 'мг' },
                  { name: 'Витамин D', current: 400, goal: 2000, unit: 'ME' },
                  { name: 'Омега-3', current: 1.2, goal: 1.6, unit: 'г' },
                ]).map((micro, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                      <span className="text-muted-foreground">{micro.name}</span>
                      <span className="text-foreground">{micro.current} / {micro.goal} {micro.unit}</span>
                    </div>
                    <Progress value={(micro.current / micro.goal) * 100} className="h-2" />
                  </div>
                ))}
              </div>
              <div className="mt-8 p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center gap-4">
                 <Brain className="h-5 w-5 text-primary shrink-0" />
                 <p className="text-xs font-medium text-muted-foreground italic">ИИ советует: добавьте в рацион шпинат и тыквенные семечки для восполнения дефицита Магния.</p>
              </div>
           </Card>

           {/* Счётчик воды (FatSecret Style) */}
           <Card className="premium-card p-8 border-none bg-blue-50/50">
              <div className="flex flex-col h-full justify-between">
                <div className="flex items-center gap-3 mb-6">
                  <Droplet className="h-6 w-6 text-blue-500" />
                  <h3 className="text-xl font-black tracking-tight">Вода</h3>
                </div>
                <div className="grid grid-cols-4 gap-2 mb-6">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className={cn(
                      "aspect-square rounded-xl border-2 flex items-center justify-center transition-all",
                      i < 7 ? "bg-blue-500 border-blue-500 text-white" : "border-blue-100 bg-white"
                    )}>
                      <Droplet size={16} className={i < 7 ? "fill-current" : "text-blue-100"} />
                    </div>
                  ))}
                </div>
                <Button className="w-full h-14 rounded-2xl bg-blue-500 hover:bg-blue-600 font-black text-xl">+ 250 мл</Button>
              </div>
           </Card>
        </div>

        {/* ТАЙМЛАЙН ПИТАНИЯ (FATSECRET STYLE) */}
        <div className="space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black tracking-tighter">Дневник Bio-Tech питания</h3>
              <Button variant="outline" className="rounded-xl font-black text-[10px] uppercase">Экспорт PDF</Button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {mealPlan[0].meals.map((meal, idx) => (
                <Card key={idx} className="premium-card border-none overflow-hidden group hover:shadow-2xl transition-all duration-500">
                  <div className="relative aspect-video">
                    <Image src={getMealImage(meal.imageId)} alt={meal.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <Badge className="absolute top-4 left-4 bg-white/20 backdrop-blur-md text-white border-none font-black text-[8px] uppercase">{meal.time}</Badge>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                       <h4 className="text-lg font-black leading-tight truncate">{meal.name}</h4>
                    </div>
                  </div>
                  <CardContent className="p-5 space-y-4">
                     <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        <span>{meal.calories} Ккал</span>
                        <div className="flex gap-2">
                           <span className="text-primary">{meal.protein || 0}Б</span>
                           <span className="text-secondary">{meal.fat || 0}Ж</span>
                           <span className="text-accent-foreground">{meal.carbs || 0}У</span>
                        </div>
                     </div>
                     <p className="text-xs font-medium text-muted-foreground line-clamp-2">{meal.description}</p>
                  </CardContent>
                </Card>
              ))}
           </div>
        </div>

        {/* ДИНАМИКА ВЕСА (CRONOMETER STYLE) */}
        <Card className="premium-card p-8 border-none bg-white">
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                 <TrendingDown className="h-6 w-6 text-primary" />
                 <h3 className="text-xl font-black tracking-tight">Динамика прогресса</h3>
              </div>
              <div className="text-right">
                 <p className="text-3xl font-black">73.2 <span className="text-xs text-muted-foreground">кг</span></p>
                 <p className="text-[10px] font-black text-primary uppercase">-2.4 кг за период</p>
              </div>
           </div>
           <div className="h-[300px] w-full">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weightData}>
                    <defs>
                      <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                    <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                    />
                    <Area type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={4} fillOpacity={1} fill="url(#colorWeight)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
           </div>
        </Card>
      </div>
    );
  }

  // Вкладка ЕДА (FatSecret Style Detail)
  if (mode === 'meals') {
    return (
      <div className="space-y-8 animate-in fade-in duration-700">
         {mealPlan[selectedDayIdx].meals.map((meal, idx) => (
           <Card key={idx} className="premium-card border-none bg-white overflow-hidden flex flex-col md:flex-row">
              <div className="relative w-full md:w-64 h-48 shrink-0">
                 <Image src={getMealImage(meal.imageId)} alt={meal.name} fill className="object-cover" />
              </div>
              <div className="p-8 flex-1 space-y-4">
                 <div className="flex justify-between items-start">
                    <div>
                       <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase mb-2">{meal.time}</Badge>
                       <h3 className="text-2xl font-black tracking-tight">{meal.name}</h3>
                    </div>
                    <div className="text-right">
                       <p className="text-2xl font-black text-primary">{meal.calories} <span className="text-xs opacity-50">Ккал</span></p>
                    </div>
                 </div>
                 <p className="text-muted-foreground font-medium">{meal.description}</p>
                 <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div className="text-center">
                       <p className="text-lg font-black">{meal.protein || 0}г</p>
                       <p className="text-[9px] font-bold text-muted-foreground uppercase">Белки</p>
                    </div>
                    <div className="text-center">
                       <p className="text-lg font-black">{meal.fat || 0}г</p>
                       <p className="text-[9px] font-bold text-muted-foreground uppercase">Жиры</p>
                    </div>
                    <div className="text-center">
                       <p className="text-lg font-black">{meal.carbs || 0}г</p>
                       <p className="text-[9px] font-bold text-muted-foreground uppercase">Углеводы</p>
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