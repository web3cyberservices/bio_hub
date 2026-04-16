"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  generatePersonalizedRecommendations,
  GenerateRecommendationsOutput 
} from '@/ai/flows/generate-personalized-recommendations';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Loader2, 
  Sparkles, 
  Scale, 
  Ruler, 
  Calendar, 
  Users,
  Target,
  Zap,
  RefreshCw,
  Footprints,
  Heart,
  Moon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';

const formSchema = z.object({
  weight: z.coerce.number().positive('Вес обязателен'),
  height: z.coerce.number().positive('Рост обязателен'),
  age: z.coerce.number().int().min(1, 'Возраст обязателен'),
  gender: z.enum(['мужской', 'женский']),
  activityLevel: z.enum(['малоактивный', 'среднеактивный', 'средний', 'активный', 'перенагрузка']),
  healthGoal: z.enum(['снизить массу тела', 'поддержать текущее состояние', 'набор массы']),
  smoking: z.enum(['да', 'нет']),
  alcohol: z.enum(['не употребляю', 'редко', 'умеренно', 'часто']),
  steps: z.coerce.number().optional(),
  avgHeartRate: z.coerce.number().optional(),
  sleepDurationHours: z.coerce.number().optional(),
  planDuration: z.enum(['день', 'неделя']).default('день'),
});

interface RecommendationFormProps {
  onResult: (result: GenerateRecommendationsOutput) => void;
  selectedDate: Date;
}

export function RecommendationForm({ onResult, selectedDate }: RecommendationFormProps) {
  const { user } = useUser();
  const { firestore } = useFirestore();
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gender: 'мужской',
      weight: 70,
      height: 175,
      age: 30,
      activityLevel: 'средний',
      healthGoal: 'поддержать текущее состояние',
      smoking: 'нет',
      alcohol: 'не употребляю',
      steps: 6500,
      avgHeartRate: 72,
      sleepDurationHours: 7.5,
      planDuration: 'день',
    },
  });

  const simulateSync = async () => {
    setSyncing(true);
    await new Promise(r => setTimeout(r, 800));
    form.setValue('steps', Math.floor(Math.random() * 8000 + 4000));
    form.setValue('avgHeartRate', Math.floor(Math.random() * 15 + 60));
    form.setValue('sleepDurationHours', Math.floor(Math.random() * 2 + 6));
    setSyncing(false);
    toast({ title: "Синхронизация завершена" });
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      if (firestore && user && user.uid !== 'public-user') {
        const profileData = { ...values, updatedAt: new Date().toISOString() };
        setDoc(doc(firestore, 'users', user.uid), profileData, { merge: true });
      }

      const { steps, avgHeartRate, sleepDurationHours, ...biometrics } = values;
      const result = await generatePersonalizedRecommendations({
        ...biometrics,
        targetDate: selectedDate.toISOString(),
        deviceData: {
          steps: steps || 0,
          avgHeartRate: avgHeartRate || 0,
          sleepDurationHours: sleepDurationHours || 0,
        },
      });
      
      onResult(result);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Ошибка анализа ИИ' });
    } finally {
      setLoading(false);
    }
  }

  const inputClasses = "h-14 rounded-2xl bg-primary/90 border-none font-black text-white px-6";
  const selectTriggerClasses = "h-14 rounded-2xl bg-primary/90 border-none font-black text-white px-6";

  return (
    <Card className="premium-card overflow-hidden">
      <CardContent className="p-8 md:p-12 space-y-12">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
            <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
              <FormField control={form.control} name="gender" render={({ field }) => (
                <FormItem className="col-span-2 md:col-span-1">
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Пол</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger className={selectTriggerClasses}><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent><SelectItem value="мужской">Мужской</SelectItem><SelectItem value="женский">Женский</SelectItem></SelectContent>
                  </Select>
                </FormItem>
              )} />
              {[{ name: 'weight', label: 'Вес (кг)', icon: Scale }, { name: 'height', label: 'Рост (см)', icon: Ruler }, { name: 'age', label: 'Возраст', icon: Calendar }].map((m) => (
                <FormField key={m.name} control={form.control} name={m.name as any} render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{m.label}</FormLabel>
                    <FormControl><Input type="number" {...field} className={inputClasses} /></FormControl>
                  </FormItem>
                )} />
              ))}
            </div>

            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
              <FormField control={form.control} name="healthGoal" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Цель</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger className={selectTriggerClasses}><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="снизить массу тела">Снизить вес</SelectItem>
                      <SelectItem value="поддержать текущее состояние">Баланс</SelectItem>
                      <SelectItem value="набор массы">Набор массы</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
              <FormField control={form.control} name="activityLevel" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Активность</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger className={selectTriggerClasses}><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="малоактивный">Малая</SelectItem>
                      <SelectItem value="средний">Средняя</SelectItem>
                      <SelectItem value="активный">Высокая</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <h4 className="text-xl font-black flex items-center gap-2"><Zap className="h-5 w-5 text-accent" /> Биометрия носимых устройств</h4>
                <Button type="button" onClick={simulateSync} disabled={syncing} className="bg-primary/10 text-primary h-10 px-4 font-black text-[10px] uppercase">
                  {syncing ? <Loader2 className="animate-spin h-4 w-4" /> : <RefreshCw className="h-4 w-4 mr-2" />} Синхронизация
                </Button>
              </div>
              <div className="grid gap-6 grid-cols-3">
                <FormField control={form.control} name="steps" render={({ field }) => (
                  <FormItem><FormLabel className="text-[10px] font-black uppercase flex gap-2"><Footprints className="h-3 w-3" /> Шаги</FormLabel><FormControl><Input type="number" {...field} className={inputClasses} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="avgHeartRate" render={({ field }) => (
                  <FormItem><FormLabel className="text-[10px] font-black uppercase flex gap-2"><Heart className="h-3 w-3" /> Пульс</FormLabel><FormControl><Input type="number" {...field} className={inputClasses} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="sleepDurationHours" render={({ field }) => (
                  <FormItem><FormLabel className="text-[10px] font-black uppercase flex gap-2"><Moon className="h-3 w-3" /> Сон (ч)</FormLabel><FormControl><Input type="number" {...field} className={inputClasses} /></FormControl></FormItem>
                )} />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-20 rounded-2xl text-2xl font-black bg-primary shadow-xl shadow-primary/20">
              {loading ? <><Loader2 className="mr-4 animate-spin h-8 w-8" /> Анализ данных...</> : <><Sparkles className="mr-4 h-8 w-8" /> Сформировать био-отчет</>}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
