
'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function SocialFeed() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Лента экспертов</h2>
      {[1, 2].map((i) => (
        <Card key={i} className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center space-x-4 pb-2">
            <Avatar>
              <AvatarImage src={`https://picsum.photos/seed/${i}/40/40`} />
              <AvatarFallback>EX</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-bold">Доктор Анна Петрова</p>
              <p className="text-xs text-slate-500">Нутрициолог • 2ч назад</p>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-300">Сегодня поговорим о важности магния для глубокой фазы сна. Исследования показывают, что...</p>
            <div className="mt-4 rounded-xl bg-slate-800 h-48 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
