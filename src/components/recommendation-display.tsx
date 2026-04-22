"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { GenerateRecommendationsOutput, replaceMeal } from '@/ai/flows/generate-personalized-recommendations';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, Footprints, Moon, Heart, Droplet, 
  Timer, Flame, Zap, Utensils, RefreshCw, Loader2,
  ScanBarcode, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { BarcodeScannerDialog } from './barcode-scanner-dialog';

interface RecommendationDisplayProps {
  data: GenerateRecommendationsOutput;
  actualMacros?: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
  mode?: 'dashboard' | 'meals';
  deviceData?: any;
}

export function RecommendationDisplay({ data, actualMacros, mode = 'dashboard', deviceData }: RecommendationDisplayProps) {
  const [mounted, setMounted] = useState(false);
  const [mealPlan, setMealPlan] = useState(data.mealPlan);
  const [replacingIdx, setReplacingIdx] = useState<number | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [activeReplaceIdx, setActiveReplaceIdx] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (data.mealPlan) {
      setMealPlan(data.mealPlan);
    }
  }, [data.mealPlan]);

  if (!mounted) return null;

  const { bioScore, recommendations, macros, fastingWindow } = data;

  const targetGoals = {
    calories: macros?.calories || 2400,
    protein: macros?.protein || 160,
    fat: macros?.fat || 80,
    carbs: macros?.carbs || 250,
  };

  const currentFact = actualMacros || {
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0
  };

  const macroRings = [
    { name: 'Белки', current: currentFact.protein, goal: targetGoals.protein, color: '#F97316', icon: Flame },
    { name: 'Жиры', current: currentFact.fat, goal: targetGoals.fat, color: '#EAB308', icon: Droplet },
    { name: 'Углеводы', current: currentFact.carbs, goal: targetGoals.carbs, color: '#2D7A4D', icon: Zap },
  ];

  const handleReplaceMeal = async (idx: number, specificProduct?: string) => {
    if (replacingIdx !== null) return;
    
    setReplacingIdx(idx);
    try {
      const currentMeal = mealPlan[0].meals[idx];
      const newMeal = await replaceMeal({
        previousMealName: specificProduct || currentMeal.name,
        mealTime: currentMeal.time,
        userContext: {
          healthGoal: data.recommendations?.diet || 'Баланс',
        }
      });

      if (!newMeal) throw new Error('Empty response');

      const updatedPlan = [...mealPlan];
      updatedPlan[0].meals[idx] = newMeal;
      setMealPlan(updatedPlan);
      
      toast({ title: 'Блюдо обновлено', description: specificProduct ? `Составлено на основе скана: ${newMeal.name}` : `Новый вариант: ${newMeal.name}` });
    } catch (error) {
      console.error('Replacement failed:', error);
      toast({ 
        variant: 'destructive', 
        title: 'Ошибка обновления', 
        description: 'ИИ не смог обработать запрос. Попробуйте еще раз.' 
      });
    } finally {
      setReplacingIdx(null);
      setActiveReplaceIdx(null);
    }
  };

  const handleBarcodeReplace = (idx: number) => {
    setActiveReplaceIdx(idx);
    setIsScannerOpen(true);
  };

  const onBarcodeScanResult = (product: any) => {
    if (activeReplaceIdx !== null) {
      handleReplaceMeal(activeReplaceIdx, product.name);
    }
  };

  const getFallbackImage = (mealName: string) => {
    const name = mealName.toLowerCase();
    
    // Продвинутый маппинг ключевых слов на Unsplash IDs
    if (name.includes('каша') || name.includes('овсян') || name.includes('злаки')) 
      return "https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&w=800&q=80";
    if (name.includes('яйц') || name.includes('омлет') || name.includes('глазунья')) 
      return "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80";
    if (name.includes('смузи') || name.includes('боул')) 
      return "https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=800&q=80";
    if (name.includes('творог') || name.includes('йогурт')) 
      return "https://images.unsplash.com/photo-1481931098708-28308112ef81?auto=format&fit=crop&w=800&q=80";
    if (name.includes('рыб') || name.includes('лосось') || name.includes('треска')) 
      return "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80";
    if (name.includes('стейк') || name.includes('мясо') || name.includes('говядин')) 
      return "https://images.unsplash.com/photo-1600891964092-4316c2850dbc?auto=format&fit=crop&w=800&q=80";
    if (name.includes('куриц') || name.includes('индейк') || name.includes('птиц')) 
      return "https://images.unsplash.com/photo-1632778149955-e80f8ceca23b?auto=format&fit=crop&w=800&q=80";
    if (name.includes('суп') || name.includes('борщ')) 
      return "https://images.unsplash.com/photo-1547592166903-89826d2d82bb?auto=format&fit=crop&w=800&q=80";
    if (name.includes('салат') || name.includes('овощ')) 
      return "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80";
    if (name.includes('паста') || name.includes('макарон')) 
      return "https://images.unsplash.com/photo-1473093226724-4e24059a9742?auto=format&fit=crop&w=800&q=80";
    if (name.includes('рис') || name.includes('плов')) 
      return "https://images.unsplash.com/photo-1512058560367-0035672fb799?auto=format&fit=crop&w=800&q=80";
    if (name.includes('яблок') || name.includes('фрукт') || name.includes('банан')) 
      return "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=800&q=80";
    if (name.includes('орех') || name.includes('кешью')) 
      return "https://images.unsplash.com/photo-1536592248-b0a688680074?auto=format&fit=crop&w=800&q=80";
    if (name.includes('авокадо') || name.includes('тост')) 
      return "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80";
    if (name.includes('блины') || name.includes('оладьи'))
      return "https://images.unsplash.com/photo-1567620905049-cf37180b7ccf?auto=format&fit=crop&w=800&q=80";
    if (name.includes('сэндвич') || name.includes('бутерброд'))
      return "https://images.unsplash.com/photo-1528735602780-2552da2451b6?auto=format&fit=crop&w=800&q=80";

    return "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80"; // Default salad
  };

  if (mode === 'dashboard') {
    return (
      <div className="space-y-16 animate-in fade-in slide-in-from-bottom-12 duration-1000">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8">
            <Card className="bg-gradient-to-br from-[#1A3C26] via-[#2D5A3C] to-[#142F1C] text-white p-12 md:p-16 relative overflow-hidden h-full flex flex-col justify-center border-none shadow-3xl rounded-[4rem]">
              <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-16">
                <div className="relative w-72 h-72 md:w-[380px] md:h-[380px] shrink-0">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-[80px] animate-pulse" />
                  <svg className="w-full h-full -rotate-90 bio-ring-glow">
                    <circle cx="50%" cy="50%" r="42%" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="20" />
                    <circle 
                      cx="50%" cy="50%" r="42%" fill="none" stroke="white" strokeWidth="20" 
                      strokeDasharray="100 100" strokeDashoffset={100 - bioScore} 
                      pathLength="100" strokeLinecap="round" className="transition-all duration-1000 ease-out" 
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[100px] md:text-[130px] font-black leading-none">{bioScore}</span>
                    <span className="text-[14px] font-black uppercase tracking-[0.5em] opacity-40 -mt-2">Bio-Score</span>
                  </div>
                </div>
                <div className="flex-1 grid grid-cols-3 gap-6 w-full">
                  {macroRings.map((m, i) => (
                    <div key={i} className="flex flex-col items-center gap-4 group">
                      <div className="relative w-24 h-24 md:w-32 md:h-32">
                        <svg className="w-full h-full -rotate-90">
                          <circle cx="50%" cy="50%" r="40%" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                          <circle 
                            cx="50%" cy="50%" r="40%" fill="none" stroke={m.color} strokeWidth="8" 
                            strokeDasharray="100 100" strokeDashoffset={100 - Math.min(100, (m.current / m.goal) * 100)} 
                            pathLength="100" strokeLinecap="round" className="transition-all duration-1000 delay-300" 
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <m.icon className="h-6 w-6 md:h-8 md:w-8" style={{ color: m.color }} />
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-xl md:text-2xl font-black leading-none">{Math.round(m.current)}г</p>
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-50 mt-1">{m.name}</p>
                        <p className="text-[8px] font-bold opacity-30 mt-0.5">из {Math.round(m.goal)}г</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Activity className="absolute -bottom-40 -left-40 h-[50rem] w-[50rem] text-white/5 pointer-events-none rotate-12" />
            </Card>
          </div>
          <div className="lg:col-span-4 space-y-8">
            <Card className="premium-card p-12 border-none bg-white flex flex-col justify-between h-[calc(50%-16px)]">
              <div>
                <p className="text-[12px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-4">КАЛОРИИ (ФАКТ)</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-7xl font-black tracking-tighter text-foreground leading-none">{Math.round(currentFact.calories)}</h3>
                  <span className="text-xl font-bold opacity-20">/ {Math.round(targetGoals.calories)}</span>
                </div>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden mt-8">
                <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (currentFact.calories / targetGoals.calories) * 100)}%` }} />
              </div>
            </Card>
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
              </div>
            </Card>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
           {[
             { label: 'Шаги', val: deviceData?.steps?.toLocaleString() || '0', goal: '10,000', icon: Footprints, color: 'text-orange-500', bg: 'bg-orange-50' },
             { label: 'Энергия', val: `${deviceData?.energy || 50}%`, goal: '100%', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
             { label: 'Пульс', val: deviceData?.avgHeartRate || '--', goal: 'bpm', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50' },
             { label: 'Вода', val: `${(deviceData?.water || 0) / 1000}л`, goal: '2.5л', icon: Droplet, color: 'text-blue-500', bg: 'bg-blue-50' }
           ].map((m, i) => (
             <Card key={i} className={cn("premium-card p-10 border-none flex flex-col gap-8 transition-transform hover:scale-105", m.bg)}>
                <div className="flex justify-between items-start">
                  <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg bg-white/50")}>
                    <m.icon className={cn("h-8 w-8", m.color)} />
                  </div>
                </div>
                <div className="space-y-1">
                   <p className="text-3xl font-black leading-none">{m.val}</p>
                   <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.4em]">{m.label}</p>
                </div>
             </Card>
           ))}
        </div>
      </div>
    );
  }

  if (mode === 'meals') {
    return (
      <div className="space-y-16 animate-in fade-in slide-in-from-bottom-12 duration-1000 max-w-6xl mx-auto py-12 px-4">
        <div className="space-y-12 relative">
          {mealPlan && mealPlan.length > 0 && mealPlan[0].meals.map((meal, idx) => {
            const isReplacing = replacingIdx === idx;
            const finalImageUrl = meal.imageUrl?.startsWith('http') ? meal.imageUrl : getFallbackImage(meal.name);
            
            return (
              <Card key={idx} className={cn(
                "premium-card border-none bg-white overflow-hidden flex flex-col xl:flex-row shadow-2xl transition-all relative",
                isReplacing && "opacity-50 grayscale"
              )}>
                <div className="relative w-full xl:w-[400px] h-[300px] xl:h-auto shrink-0 overflow-hidden group bg-muted/20">
                  <Image 
                    src={finalImageUrl} 
                    alt={meal.name} 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-110" 
                    unoptimized={true}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between gap-2">
                     <Badge className="bg-primary/90 text-white border-none font-black text-[10px] uppercase tracking-widest px-3 py-1">
                        {meal.time}
                     </Badge>
                     <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleBarcodeReplace(idx)}
                          className="rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 h-10 w-10 border border-white/20"
                          disabled={isReplacing}
                        >
                          <ScanBarcode className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleReplaceMeal(idx)}
                          className="rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 h-10 w-10 border border-white/20"
                          disabled={isReplacing}
                        >
                          {isReplacing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                        </Button>
                     </div>
                  </div>
                </div>
                <div className="p-10 flex-1 space-y-8">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <h3 className="text-3xl font-black tracking-tighter leading-none text-foreground">{meal.name}</h3>
                      <p className="text-muted-foreground text-sm font-medium italic leading-relaxed">{meal.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-5xl font-black text-primary drop-shadow-sm">{meal.calories}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">ккал</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {meal.components?.map((comp, i) => (
                      <div key={i} className="flex items-center justify-between p-6 bg-primary/5 rounded-[2rem] border border-primary/10 transition-all hover:bg-primary/10 group/item">
                        <span className="text-base font-bold text-foreground/80 group-hover/item:text-foreground transition-colors">{comp.ingredient}</span>
                        <Badge variant="default" className="bg-primary text-white font-black px-4 py-2 rounded-xl shadow-lg text-sm transition-transform group-hover/item:scale-110">
                          {comp.weight}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-6 pt-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 border-t">
                    <div className="flex items-center gap-1.5"><Flame className="h-3 w-3 text-orange-500" /> Б: {meal.protein}г</div>
                    <div className="flex items-center gap-1.5"><Droplet className="h-3 w-3 text-yellow-500" /> Ж: {meal.fat}г</div>
                    <div className="flex items-center gap-1.5"><Zap className="h-3 w-3 text-primary" /> У: {meal.carbs}г</div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <BarcodeScannerDialog 
          open={isScannerOpen} 
          onOpenChange={setIsScannerOpen} 
          onScan={onBarcodeScanResult}
        />
      </div>
    );
  }

  return null;
}