'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Smile, Frown, Meh, Zap, Brain, 
  Timer, Battery, Activity, Sparkles,
  TrendingUp, TrendingDown, Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface WellBeingStatusProps {
  deviceData?: any;
}

export function WellBeingStatus({ deviceData }: WellBeingStatusProps) {
  const mood = deviceData?.mood || 'Не указано';
  const energy = deviceData?.energy || 50;

  const getMoodIcon = (m: string) => {
    switch (m.toLowerCase()) {
      case 'счастлив': return <Smile className="h-12 w-12 text-emerald-400" />;
      case 'спокоен': return <Meh className="h-12 w-12 text-blue-400" />;
      case 'устал': return <Battery className="h-12 w-12 text-orange-400" />;
      case 'раздражен': return <Frown className="h-12 w-12 text-red-400" />;
      default: return <Smile className="h-12 w-12 text-primary" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-2">
         <Badge variant="outline" className="px-6 py-1 rounded-2xl border-primary/30 text-primary font-black uppercase tracking-[0.3em] text-[9px] bg-primary/5">
            Psycho-Biometric Status
         </Badge>
         <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase leading-none">Самочувствие</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Mood Card */}
         <Card className="cyber-card p-10 flex flex-col items-center justify-center text-center gap-6 group">
            <div className="relative">
               <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse group-hover:bg-primary/40 transition-all" />
               <div className="relative z-10 transition-transform duration-500 group-hover:scale-110">
                  {getMoodIcon(mood)}
               </div>
            </div>
            <div className="space-y-1">
               <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Ваш настрой</p>
               <h3 className="text-3xl font-black text-white">{mood}</h3>
            </div>
         </Card>

         {/* Energy Card */}
         <Card className="cyber-card p-10 flex flex-col justify-center gap-8 group">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <Zap className="h-6 w-6 text-yellow-400 neo-glow" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Уровень энергии</span>
               </div>
               <span className="text-2xl font-black text-white">{energy}%</span>
            </div>
            <div className="space-y-4">
               <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/10 shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-500 via-yellow-400 to-emerald-400 transition-all duration-1000 shadow-[0_0_20px_rgba(250,204,21,0.5)]" 
                    style={{ width: `${energy}%` }}
                  />
               </div>
               <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest leading-relaxed">
                  {energy > 70 ? 'Вы в отличной форме для тренировок и работы' : energy > 40 ? 'Умеренный тонус, рекомендуется баланс нагрузки' : 'Низкий ресурс, время для восстановления'}
               </p>
            </div>
         </Card>
      </div>

      {/* Bio-Rhythms & Fasting Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="cyber-card p-8 md:col-span-2 flex flex-col md:flex-row items-center gap-8 bg-gradient-to-br from-primary/5 to-transparent">
            <div className="w-24 h-24 rounded-full border-4 border-primary/20 flex items-center justify-center relative shrink-0">
               <Timer className="h-10 w-10 text-primary animate-pulse" />
               <div className="absolute inset-0 border-t-4 border-primary rounded-full animate-spin duration-[4000ms]" />
            </div>
            <div className="space-y-4 text-center md:text-left flex-1">
               <div className="space-y-1">
                  <h4 className="text-xl font-black text-white uppercase tracking-tight">Цикл голодания (16:8)</h4>
                  <p className="text-xs text-white/50 font-medium">Система рассчитывает идеальное окно питания на основе вашего последнего приема пищи.</p>
               </div>
               <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <Badge className="bg-white/5 text-white/60 border-none font-bold py-1.5 px-4">Окно: 12:00 - 20:00</Badge>
                  <Badge className="bg-primary/20 text-primary border-none font-black py-1.5 px-4">Статус: В фазе сна</Badge>
               </div>
            </div>
         </Card>

         <Card className="cyber-card p-8 flex flex-col items-center justify-center gap-4 text-center">
            <Brain className="h-8 w-8 text-primary/60" />
            <div className="space-y-1">
               <h4 className="text-[10px] font-black uppercase text-white/40 tracking-widest">Когнитивный фокус</h4>
               <p className="text-xl font-black text-white">Высокий</p>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
               <TrendingUp className="h-4 w-4" />
               <span className="text-[10px] font-bold">+12% к норме</span>
            </div>
         </Card>
      </div>

      <div className="bg-primary/5 p-6 rounded-[2rem] border border-primary/20 flex items-start gap-4">
         <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
            <Sparkles className="h-5 w-5 text-primary" />
         </div>
         <div className="space-y-1">
            <h5 className="font-black text-sm text-white uppercase">ИИ Инсайт</h5>
            <p className="text-xs text-white/60 leading-relaxed">
               Ваша энергия коррелирует с уровнем гидратации. Сегодня вы выпили на 300мл меньше нормы, что может вызвать легкую усталость к 18:00. Рекомендуем выпить стакан воды с лимоном прямо сейчас.
            </p>
         </div>
      </div>
      
      <div className="text-center opacity-10 pt-10">
         <p className="text-[6px] font-black uppercase tracking-[1.5em]">Neural Psycho-Sync Protocol v4.0.2</p>
      </div>
    </div>
  );
}
