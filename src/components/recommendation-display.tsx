'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { GenerateRecommendationsOutput } from '@/ai/flows/generate-personalized-recommendations';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HeartPulse, Utensils, Pill, Flame, Beef, Droplets, Wheat, Activity, Calendar, ChevronRight, ChevronLeft, Zap, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface RecommendationDisplayProps {
  data: GenerateRecommendationsOutput;
}

export function RecommendationDisplay({ data }: RecommendationDisplayProps) {
  const { recommendations, macros, mealPlan, activityAnalysis } = data;
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getMealImage = (imageId: string) => {
    // Безопасный поиск изображения с фолбеком и проверкой на существованиеimageUrl
    const found = (PlaceHolderImages || []).find(img => img?.id === imageId);
    if (found?.imageUrl) return found;
    
    // Гарантированный возврат объекта, чтобы избежать TypeError
    return (PlaceHolderImages && PlaceHolderImages[0]) || {
      id: 'fallback',
      imageUrl: 'https://picsum.photos/seed/fallback/400/300',
      imageHint: 'healthy meal',
      description: 'Healthy food placeholder'
    };
  };

  const chartData = useMemo(() => [
    { name: 'Белки', value: Math.max(0, macros.protein * 4), color: 'hsl(var(--primary))', raw: macros.protein },
    { name: 'Жиры', value: Math.max(0, macros.fat * 9), color: 'hsl(var(--secondary))', raw: macros.fat },
    { name: 'Углеводы', value: Math.max(0, macros.carbs * 4), color: 'hsl(var(--accent))', raw: macros.carbs },
  ], [macros]);

  return (
    <div className="space-y-12 md:space-y-20 pb-24 animate-in fade-in duration-1000">
      {/* Mobile Macro Infographic */}
      <div className="block md:hidden">
        <Card className="premium-card p-6 border-none overflow-hidden bg-white/60 backdrop-blur-xl">
          <div className="flex flex-col items-center">
            <div className="relative w-full aspect-square max-w-[240px]">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                      cornerRadius={10}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              )}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-4xl font-black tracking-tighter leading-none">{macros.calories}</span>
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-1">Ккал / День</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 w-full gap-3 mt-4">
              {chartData.map((stat, i) => (
                 <div key={i} className="flex flex-col items-center p-3 rounded-2xl bg-white/40 border border-white/50 shadow-sm">
                   <div className="w-2 h-2 rounded-full mb-2" style={{ backgroundColor: stat.color }} />
                   <span className="text-base font-black tracking-tight">{stat.raw}г</span>
                   <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">{stat.name}</span>
                 </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Desktop Macro Analytics */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Суточные Калории', value: macros.calories, unit: 'ккал', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50' },
          { label: 'Целевой Белок', value: macros.protein, unit: 'г', icon: Beef, color: 'text-primary', bg: 'bg-primary/5' },
          { label: 'Здоровые Жиры', value: macros.fat, unit: 'г', icon: Droplets, color: 'text-secondary', bg: 'bg-secondary/5' },
          { label: 'Сложные Углеводы', value: macros.carbs, unit: 'г', icon: Wheat, color: 'text-blue-500', bg: 'bg-blue-50' },
        ].map((stat, i) => (
          <Card key={i} className="premium-card border-none overflow-hidden relative group">
            <CardContent className="p-8 flex flex-col gap-6">
              <div className={`${stat.bg} w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm`}>
                <stat.icon className={`h-7 w-7 ${stat.color}`} />
              </div>
              <div className="space-y-1">
                <p className="text-4xl font-black tracking-tighter">{stat.value}<span className="text-sm ml-2 font-bold opacity-40">{stat.unit}</span></p>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity Analysis Badge */}
      {activityAnalysis && (
        <Card className="premium-card border-none bg-foreground text-white p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary flex items-center justify-center shadow-[0_0_30px_rgba(76,175,80,0.4)] shrink-0">
              <Zap className="h-7 w-7 md:h-8 md:w-8 text-white fill-white" />
            </div>
            <div className="flex-1 space-y-2 text-center md:text-left">
              <h3 className="text-xl md:text-2xl font-black tracking-tight">Анализ нагрузок</h3>
              <p className="text-white/70 font-medium text-base md:text-lg italic leading-snug">{activityAnalysis}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Meal Plan Navigator */}
      {mealPlan && mealPlan.length > 0 && selectedDayIdx < mealPlan.length && (
        <Card className="premium-card overflow-hidden border-none shadow-2xl">
          <CardHeader className="px-6 md:px-10 py-8 md:py-12 flex flex-col md:flex-row items-start md:items-center justify-between border-b bg-muted/20 gap-8">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="bg-primary/10 p-3 md:p-4 rounded-[1.75rem] shadow-sm">
                <Utensils className="h-6 w-6 md:h-8 md:w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl md:text-3xl font-black tracking-tight">Гастрономическая стратегия</CardTitle>
                <CardDescription className="text-[10px] md:text-sm font-bold uppercase tracking-widest mt-1">Оптимизировано под ваши вкусы</CardDescription>
              </div>
            </div>
            {mealPlan.length > 1 && (
              <div className="flex items-center gap-2 md:gap-4 bg-white p-1 md:p-2 rounded-2xl shadow-sm self-center md:self-auto">
                <Button variant="ghost" size="icon" disabled={selectedDayIdx === 0} onClick={() => setSelectedDayIdx(p => p - 1)} className="rounded-xl h-10 w-10">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Badge className="bg-primary/10 text-primary border-none text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] px-4 md:px-6 h-8 md:h-10 flex items-center rounded-xl">
                  {mealPlan[selectedDayIdx].day}
                </Badge>
                <Button variant="ghost" size="icon" disabled={selectedDayIdx === mealPlan.length - 1} onClick={() => setSelectedDayIdx(p => p + 1)} className="rounded-xl h-10 w-10">
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="p-6 md:p-10 space-y-8 md:space-y-12">
            {mealPlan[selectedDayIdx].meals.map((meal, idx) => {
              const mealImg = getMealImage(meal.imageId);
              return (
                <div key={idx} className="group flex flex-col lg:flex-row gap-6 md:gap-12 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] hover:bg-muted/30 transition-all duration-500 border border-transparent hover:border-border">
                  <div className="relative w-full lg:w-[320px] h-[180px] md:h-[220px] shrink-0 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-2xl">
                    <Image 
                      src={mealImg.imageUrl} 
                      alt={meal.name} 
                      fill 
                      className="object-cover group-hover:scale-110 transition-transform duration-1000" 
                      data-ai-hint={mealImg.imageHint} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                       <p className="text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Info className="h-3 w-3" /> Детали состава</p>
                    </div>
                  </div>
                  <div className="flex-1 space-y-4 md:space-y-6 py-2">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-primary text-white border-none px-4 md:px-6 py-1.5 md:py-2 rounded-xl font-black uppercase tracking-[0.2em] text-[8px] md:text-[9px]">
                        {meal.time}
                      </Badge>
                      <span className="font-black text-xl md:text-2xl tracking-tighter text-primary">{meal.calories}<span className="text-[10px] ml-1 uppercase text-muted-foreground tracking-widest font-bold">Ккал</span></span>
                    </div>
                    <h4 className="text-2xl md:text-4xl font-black tracking-tighter leading-none">{meal.name}</h4>
                    <p className="text-muted-foreground leading-relaxed font-medium text-base md:text-lg pr-4">{meal.description}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Deep Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
        {[
          { title: 'Биохакинг Среды', icon: HeartPulse, color: 'text-primary', content: recommendations.lifestyle, bg: 'bg-primary/5' },
          { title: 'Нутритивная База', icon: Utensils, color: 'text-secondary', content: recommendations.diet, bg: 'bg-secondary/5' },
          { title: 'Микро-Коррекция', icon: Pill, color: 'text-accent-foreground', content: recommendations.supplements, bg: 'bg-accent/10' },
        ].map((section, idx) => (
          <Card key={idx} className="premium-card flex flex-col border-none group">
            <CardHeader className="flex flex-row items-center gap-4 md:gap-6 border-b border-muted/50 p-6 md:p-10 bg-white group-hover:bg-muted/5 transition-colors">
              <div className={`${section.bg} w-14 h-14 md:w-16 md:h-16 rounded-[1.25rem] flex items-center justify-center shadow-sm`}>
                <section.icon className={`h-7 w-7 md:h-8 md:w-8 ${section.color}`} />
              </div>
              <CardTitle className="text-lg md:text-xl font-black uppercase tracking-[0.15em] md:tracking-[0.2em] leading-tight">{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-10 flex-1 bg-white">
              <p className="text-base md:text-lg leading-relaxed text-muted-foreground font-medium whitespace-pre-wrap">
                {section.content}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
