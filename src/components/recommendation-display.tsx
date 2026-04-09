
'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { GenerateRecommendationsOutput } from '@/ai/flows/generate-personalized-recommendations';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HeartPulse, Utensils, Pill, Flame, Beef, Droplets, Wheat, Activity, ChevronRight, ChevronLeft, Zap, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface RecommendationDisplayProps {
  data: GenerateRecommendationsOutput;
  mode?: 'dashboard' | 'meals';
}

export function RecommendationDisplay({ data, mode = 'dashboard' }: RecommendationDisplayProps) {
  const { recommendations, macros, mealPlan, activityAnalysis } = data;
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getMealImage = (imageId: string) => {
    const found = (PlaceHolderImages || []).find(img => img?.id === imageId);
    if (found?.imageUrl) return found;
    return (PlaceHolderImages && PlaceHolderImages[0]) || {
      id: 'fallback',
      imageUrl: 'https://picsum.photos/seed/fallback/400/300',
      imageHint: 'healthy meal',
      description: 'Healthy food placeholder'
    };
  };

  const chartData = useMemo(() => [
    { name: 'Белки', value: Math.max(0, (macros.protein || 0) * 4), color: 'hsl(var(--primary))', raw: macros.protein || 0 },
    { name: 'Жиры', value: Math.max(0, (macros.fat || 0) * 9), color: 'hsl(var(--secondary))', raw: macros.fat || 0 },
    { name: 'Углеводы', value: Math.max(0, (macros.carbs || 0) * 4), color: 'hsl(var(--accent))', raw: macros.carbs || 0 },
  ], [macros]);

  if (mode === 'dashboard') {
    return (
      <div className="space-y-8 md:space-y-12 animate-in fade-in duration-700">
        {/* Macros & Infographics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <Card className="premium-card p-6 border-none overflow-hidden bg-white/60 backdrop-blur-xl lg:col-span-1">
            <div className="flex flex-col items-center">
              <div className="relative w-full aspect-square max-w-[200px] md:max-w-[240px]">
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
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-1">Ккал</span>
                </div>
              </div>
              <div className="grid grid-cols-3 w-full gap-2 mt-4">
                {chartData.map((stat, i) => (
                   <div key={i} className="flex flex-col items-center p-2 rounded-xl bg-white/40 border shadow-sm">
                     <div className="w-1.5 h-1.5 rounded-full mb-1" style={{ backgroundColor: stat.color }} />
                     <span className="text-sm font-black tracking-tight">{stat.raw}г</span>
                     <span className="text-[7px] font-bold text-muted-foreground uppercase">{stat.name}</span>
                   </div>
                ))}
              </div>
            </div>
          </Card>

          <div className="lg:col-span-2 grid grid-cols-2 gap-4 md:gap-6">
            {[
              { label: 'Суточные Калории', value: macros.calories, unit: 'ккал', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50' },
              { label: 'Целевой Белок', value: macros.protein, unit: 'г', icon: Beef, color: 'text-primary', bg: 'bg-primary/5' },
              { label: 'Здоровые Жиры', value: macros.fat, unit: 'г', icon: Droplets, color: 'text-secondary', bg: 'bg-secondary/5' },
              { label: 'Сложные Углеводы', value: macros.carbs, unit: 'г', icon: Wheat, color: 'text-blue-500', bg: 'bg-blue-50' },
            ].map((stat, i) => (
              <Card key={i} className="premium-card border-none overflow-hidden relative group">
                <CardContent className="p-6 md:p-8 flex flex-col gap-4">
                  <div className={`${stat.bg} w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center`}>
                    <stat.icon className={`h-5 w-5 md:h-6 md:w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl md:text-3xl font-black tracking-tighter">{stat.value}<span className="text-[10px] ml-1 opacity-40 uppercase">{stat.unit}</span></p>
                    <p className="text-[8px] md:text-[9px] font-black text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Activity Analysis */}
        {activityAnalysis && (
          <Card className="premium-card border-none bg-foreground text-white p-6 md:p-8">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shrink-0">
                <Zap className="h-6 w-6 text-white fill-white" />
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="text-lg md:text-xl font-black tracking-tight">Биометрический анализ</h3>
                <p className="text-white/70 font-medium text-sm md:text-base italic">{activityAnalysis}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Insights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Образ жизни', icon: HeartPulse, color: 'text-primary', content: recommendations.lifestyle, bg: 'bg-primary/5' },
            { title: 'Диета', icon: Utensils, color: 'text-secondary', content: recommendations.diet, bg: 'bg-secondary/5' },
            { title: 'Добавки', icon: Pill, color: 'text-accent-foreground', content: recommendations.supplements, bg: 'bg-accent/10' },
          ].map((section, idx) => (
            <Card key={idx} className="premium-card flex flex-col border-none group">
              <CardHeader className="flex flex-row items-center gap-4 p-6 border-b border-muted/50 bg-white group-hover:bg-muted/5 transition-colors">
                <div className={`${section.bg} w-10 h-10 rounded-xl flex items-center justify-center`}>
                  <section.icon className={`h-5 w-5 ${section.color}`} />
                </div>
                <CardTitle className="text-xs md:text-sm font-black uppercase tracking-widest">{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-6 flex-1 bg-white">
                <p className="text-sm leading-relaxed text-muted-foreground font-medium whitespace-pre-wrap line-clamp-6 group-hover:line-clamp-none transition-all">
                  {section.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (mode === 'meals') {
    return (
      <div className="space-y-10 animate-in fade-in duration-700">
        {mealPlan && mealPlan.length > 0 && selectedDayIdx < mealPlan.length && (
          <Card className="premium-card overflow-hidden border-none shadow-xl">
            <CardHeader className="px-6 md:px-10 py-8 flex flex-col md:flex-row items-center justify-between border-b bg-muted/20 gap-6">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-2xl">
                  <Utensils className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl md:text-2xl font-black tracking-tight">Гастрономический план</CardTitle>
                  <CardDescription className="text-[9px] font-bold uppercase tracking-widest mt-1">Настроено под ваши биоритмы</CardDescription>
                </div>
              </div>
              {mealPlan.length > 1 && (
                <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm">
                  <Button variant="ghost" size="icon" disabled={selectedDayIdx === 0} onClick={() => setSelectedDayIdx(p => p - 1)} className="rounded-lg h-8 w-8">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase tracking-widest px-4 h-8 flex items-center rounded-lg">
                    {mealPlan[selectedDayIdx].day}
                  </Badge>
                  <Button variant="ghost" size="icon" disabled={selectedDayIdx === mealPlan.length - 1} onClick={() => setSelectedDayIdx(p => p + 1)} className="rounded-lg h-8 w-8">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-6 md:p-10 space-y-8 md:space-y-12">
              {mealPlan[selectedDayIdx].meals.map((meal, idx) => {
                const mealImg = getMealImage(meal.imageId);
                return (
                  <div key={idx} className="group flex flex-col lg:flex-row gap-6 md:gap-10 p-6 md:p-8 rounded-[2rem] hover:bg-muted/30 transition-all duration-500 border border-transparent hover:border-border">
                    <div className="relative w-full lg:w-[280px] h-[160px] md:h-[200px] shrink-0 rounded-[1.5rem] overflow-hidden shadow-lg">
                      <Image 
                        src={mealImg.imageUrl} 
                        alt={meal.name} 
                        fill 
                        className="object-cover group-hover:scale-110 transition-transform duration-1000" 
                        data-ai-hint={mealImg.imageHint} 
                      />
                    </div>
                    <div className="flex-1 space-y-4 py-2">
                      <div className="flex items-center justify-between">
                        <Badge className="bg-primary text-white border-none px-4 py-1.5 rounded-lg font-black uppercase tracking-widest text-[8px]">
                          {meal.time}
                        </Badge>
                        <span className="font-black text-lg md:text-xl tracking-tighter text-primary">{meal.calories}<span className="text-[9px] ml-1 uppercase text-muted-foreground font-bold">Ккал</span></span>
                      </div>
                      <h4 className="text-xl md:text-3xl font-black tracking-tighter leading-none">{meal.name}</h4>
                      <p className="text-muted-foreground leading-relaxed font-medium text-sm md:text-base pr-4">{meal.description}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return null;
}
