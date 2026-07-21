
'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Utensils } from 'lucide-react';

export function DietPlanner({ profile }: { profile: any }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">План питания</h2>
      {[1, 2, 3].map((i) => (
        <Card key={i} className="bg-slate-900 border-slate-800 overflow-hidden">
          <CardContent className="p-0 flex">
            <div className="w-24 h-24 bg-slate-800 flex items-center justify-center">
              <Utensils className="text-slate-600" />
            </div>
            <div className="p-4 flex-1">
              <p className="text-xs text-cyan-400 font-bold uppercase">Завтрак</p>
              <h3 className="font-semibold">Овсянка с ягодами и миндалем</h3>
              <p className="text-xs text-slate-500 mt-1">420 ккал • 15г белка</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
