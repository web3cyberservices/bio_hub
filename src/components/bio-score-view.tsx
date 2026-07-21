
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, ShieldCheck, Zap } from 'lucide-react';

export function BioScoreView({ profile }: { profile: any }) {
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-600 to-blue-700 p-8 text-white shadow-2xl">
        <div className="relative z-10">
          <p className="text-cyan-100 text-sm font-medium uppercase tracking-wider">Ваш Bio-Score</p>
          <div className="flex items-baseline space-x-2 mt-2">
            <h2 className="text-6xl font-bold">{profile?.bioScore || 85}</h2>
            <span className="text-xl text-cyan-200">/ 100</span>
          </div>
          <p className="mt-4 text-cyan-50 text-sm max-w-xs">Ваш биологический возраст на 2.4 года меньше паспортного. Отличная работа!</p>
        </div>
        <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-20">
          <Activity size={240} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <ShieldCheck className="text-cyan-400 mb-2" />
            <p className="text-xs text-slate-400">Иммунитет</p>
            <p className="text-xl font-bold">Высокий</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <Zap className="text-yellow-400 mb-2" />
            <p className="text-xs text-slate-400">Энергия</p>
            <p className="text-xl font-bold">92%</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
