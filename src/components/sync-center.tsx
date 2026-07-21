
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Upload, Smartphone, Database } from 'lucide-react';

export function SyncCenter({ onSyncComplete }: { onSyncComplete: () => void }) {
  return (
    <div className="space-y-6 text-center">
      <div className="py-8">
        <div className="w-20 h-20 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Plus className="text-cyan-500 w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold">Центр Синхронизации</h2>
        <p className="text-slate-400 mt-2">Добавьте новые данные для обновления Bio-Score</p>
      </div>

      <div className="grid gap-4">
        <Button onClick={onSyncComplete} className="h-16 justify-start px-6 bg-slate-900 hover:bg-slate-800 border-slate-800">
          <Smartphone className="mr-4 text-cyan-400" />
          <div className="text-left">
            <p className="font-bold">Apple Health / Google Fit</p>
            <p className="text-xs text-slate-500">Автоматическая синхронизация активности</p>
          </div>
        </Button>
        <Button onClick={onSyncComplete} className="h-16 justify-start px-6 bg-slate-900 hover:bg-slate-800 border-slate-800">
          <Database className="mr-4 text-purple-400" />
          <div className="text-left">
            <p className="font-bold">Загрузить анализы</p>
            <p className="text-xs text-slate-500">PDF или фото результатов лабораторий</p>
          </div>
        </Button>
        <Button onClick={onSyncComplete} className="h-16 justify-start px-6 bg-slate-900 hover:bg-slate-800 border-slate-800">
          <Upload className="mr-4 text-emerald-400" />
          <div className="text-left">
            <p className="font-bold">Дневник питания</p>
            <p className="text-xs text-slate-500">Записать последний прием пищи</p>
          </div>
        </Button>
      </div>
    </div>
  );
}
