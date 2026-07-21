
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ProfileCabinet({ user, profile, onUpdate }: { user: any, profile: any, onUpdate: () => void }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-24 h-24 rounded-full bg-slate-800 mx-auto mb-4 border-4 border-cyan-500/20 overflow-hidden">
          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} alt="Avatar" />
        </div>
        <h2 className="text-xl font-bold">{profile?.name || user?.email}</h2>
        <p className="text-slate-500 text-sm">Тариф: Premium</p>
      </div>

      <div className="space-y-4 bg-slate-900 p-6 rounded-3xl border border-slate-800">
        <div className="grid gap-2">
          <Label>Имя</Label>
          <Input defaultValue={profile?.name} className="bg-slate-950 border-slate-800" />
        </div>
        <div className="grid gap-2">
          <Label>Цель</Label>
          <Input defaultValue="Биохакинг и долголетие" className="bg-slate-950 border-slate-800" />
        </div>
        <Button className="w-full bg-cyan-600 hover:bg-cyan-700 mt-4" onClick={onUpdate}>
          Сохранить изменения
        </Button>
      </div>
    </div>
  );
}
