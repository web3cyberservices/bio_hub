
'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, Clock, Flame } from 'lucide-react';

export function WorkoutLog() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Нагрузки сегодня</h2>
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <Clock className="text-blue-400 mb-2" />
            <p className="text-2xl font-bold">45 <span className="text-sm font-normal text-slate-500">мин</span></p>
            <p className="text-xs text-slate-400 uppercase font-bold tracking-tighter">Активность</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <Flame className="text-orange-500 mb-2" />
            <p className="text-2xl font-bold">320 <span className="text-sm font-normal text-slate-500">ккал</span></p>
            <p className="text-xs text-slate-400 uppercase font-bold tracking-tighter">Сожжено</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
