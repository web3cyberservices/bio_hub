'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { GenerateRecommendationsOutput } from '@/ai/flows/generate-personalized-recommendations';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HeartPulse, Utensils, Pill, Flame, Beef, Droplets, Wheat, Activity, ChevronRight, ChevronLeft, Zap, Footprints, Moon, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface RecommendationDisplayProps {
  data: GenerateRecommendationsOutput;
  mode?: 'dashboard' | 'meals';
}

export function RecommendationDisplay({ data, mode = 'dashboard' }: RecommendationDisplayProps) {
  const { recommendations, macros, currentIntake, mealPlan, activityAnalysis } = data;
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

  // Данные для круговых диаграмм прогресса КБЖУ
  const nutrients = [
    { name: 'Белки', current: currentIntake?.protein || 0, goal: macros.protein, color: 'hsl(var(--primary))', icon: Beef },
    { name: 'Жиры', current: currentIntake?.fat || 0, goal: macros.fat, color: 'hsl(var(--secondary))', icon: Droplets },
    { name: 'Углеводы', current: currentIntake?.carbs || 0, goal: macros.carbs, color: 'hsl(var(--accent))', icon: Wheat },
  ];

  if (mode === 'dashboard') {
    return (
      <div className="space-y-8 md:space-y-12 animate-in fade-in duration-700">
        
        {/* КБЖУ Счётчики (Круги прогресса) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="premium-card p-6 border-none bg-white/80 backdrop-blur-xl flex flex-col items-center justify-center text-center">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle cx="64" cy="64" r="58" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
                <circle cx="64" cy="64" r="58" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="364.4" 
                  strokeDashoffset={364.4 - (364.4 * Math.min(1, (currentIntake?.calories || 0) / macros.calories))} 
                  className="text-primary transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black leading-none">{currentIntake?.calories}</span>
                <span className="text-[7px] font-black uppercase text-muted-foreground">из {macros.calories}</span>
                <Flame className="h-3 w-3 text-primary mt-1" />
              </div>
            </div>
            <h4 className="mt-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Калории (ккал)</h4>
            <p className="text-[9px] font-bold text-primary mt-1">Осталось: {Math.max(0, macros.calories - (currentIntake?.calories || 0))}</p>
          </Card>

          {nutrients.map((n, i) => (
            <Card key={i} className="premium-card p-6 border-none bg-white/80 backdrop-blur-xl flex flex-col items-center justify-center text-center">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="56" cy="56" r="50" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/20" />
                  <circle cx="56" cy="56" r="50" fill="none" stroke="currentColor" strokeWidth="6" strokeDasharray="314" 
                    strokeDashoffset={314 - (314 * Math.min(1, n.current / n.goal))} 
                    style={{ color: n.color }}
                    className="transition-all duration-1000" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-black leading-none">{n.current}г</span>
                  <span className="text-[6px] font-black uppercase text-muted-foreground">из {n.goal}г</span>
                  <n.icon className="h-3 w-3 mt-1" style={{ color: n.color }} />
                </div>
              </div>
              <h4 className="mt-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{n.name}</h4>
              <p className="text-[9px] font-bold mt-1" style={{ color: n.color }}>Ещё: {Math.max(0, n.goal - n.current)}г</p>
            </Card>
          ))}
        </div>

        {/* Биометрия и Гаджеты */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[
            { label: 'Шаги сегодня', value: '8,420', unit: 'шагов', icon: Footprints, color: 'text-blue-500', bg: 'bg-blue-50' },
            { label: 'Качество сна', value: '7.5', unit: 'часов', icon: Moon, color: 'text-indigo-500', bg: 'bg-indigo-50' },
            { label: 'Пульс (bpm)', value: '72', unit: 'уд/мин', icon: Heart, color: 'text-red-500', bg: 'bg-red-50' },
            { label: 'Давление', value: '118/78', unit: 'мм рт.ст.', icon: Activity, color: 'text-primary', bg: 'bg-primary/10' },
          ].map((stat, i) => (
            <Card key={i} className="premium-card border-none overflow-hidden group">
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

        {/* Activity Analysis */}
        {activityAnalysis && (
          <Card className="premium-card border-none bg-foreground text-white p-6 md:p-8">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shrink-0">
                <Zap className="h-6 w-6 text-white fill-white" />
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="text-lg md:text-xl font-black tracking-tight">AI Био-Анализ</h3>
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