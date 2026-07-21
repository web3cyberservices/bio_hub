
'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export function ChatList() {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 text-slate-500 w-4 h-4" />
        <Input placeholder="Поиск чатов..." className="pl-10 bg-slate-900 border-slate-800" />
      </div>
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center space-x-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center font-bold text-cyan-400">
              AI
            </div>
            <div className="flex-1">
              <div className="flex justify-between">
                <p className="font-bold">Bio Hub AI Ассистент</p>
                <p className="text-[10px] text-slate-500 uppercase">14:20</p>
              </div>
              <p className="text-sm text-slate-400 truncate">Ваш отчет по нутриентам готов. Хотите взглянуть?</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
