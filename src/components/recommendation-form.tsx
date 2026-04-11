"use client";

import { useState, useEffect, useMemo } from 'react';
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
  Cigarette,
  GlassWater,
  Heart,
  Moon,
  RefreshCw,
  Footprints
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useUser, useFirestore, useDoc } from '@/firebase';
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
  favoriteFoods: z.string().optional(),
  dislikedFoods: z.string().optional(),
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

  const userDocRef = useMemo(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userData, loading: loadingProfile } = useDoc<any>(userDocRef);

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
      steps: 0,
      avgHeartRate: 0,
      sleepDurationHours: 0,
      planDuration: 'день',
      favoriteFoods: '',
      dislikedFoods: '',
    },
  });

  useEffect(() => {
    if (userData) {
      const fields = ['gender', 'weight', 'height', 'age', 'activityLevel', 'healthGoal', 'smoking', 'alcohol'];
      fields.forEach((field) => {
        if (userData[field]) {
          form.setValue(field as any, userData[field]);
        }
      });
    }
  }, [userData, form]);

  const simulateSync = async () => {
    setSyncing(true);
    await new Promise(r => setTimeout(r, 1000));
    form.setValue('steps', Math.floor(Math.random() * 8000 + 4000));
    form.setValue('avgHeartRate', Math.floor(Math.random() * 15 + 60));
    form.setValue('sleepDurationHours', Math.floor(Math.random() * 3 + 6));
    setSyncing(false);
    toast({ title: "Данные синхронизированы" });
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !firestore) return;
    setLoading(true);
    try {
      // 1. Сохраняем биометрию в Firestore (привязка к пользователю)
      const profileData = {
        weight: values.weight,
        height: values.height,
        age: values.age,
        gender: values.gender,
        healthGoal: values.healthGoal,
        activityLevel: values.activityLevel,
        smoking: values.smoking,
        alcohol: values.alcohol,
        updatedAt: new Date().toISOString()
      };
      setDoc(doc(firestore, 'users', user.uid), profileData, { merge: true });

      // 2. Обезличиваем данные для ИИ (отправляем только метрики)
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
      toast({ variant: 'destructive', title: 'Ошибка анализа' });
    } finally {
      setLoading(false);
    }
  }

  const inputClasses = "h-14 md:h-20 rounded-2xl bg-primary/90 border-none font-black text-white px-6 focus:ring-4 focus:ring-white/20";
  const selectTriggerClasses = "h-14 md:h-20 rounded-2xl bg-primary/90 border-none font-black text-white px-6 focus:ring-4 focus:ring-white/20";
  const sectionHeaderClasses = "text-xl font-black font-headline tracking-tighter border-b pb-4 flex items-center gap-3 mb-6";

  if (loadingProfile) return <div className="py-20 flex justify-center"><Loader2 className="animate-spin opacity-20" /></div>;

  return (
    <Card className="premium-card overflow-hidden">
      <CardContent className="p-6 md:p-12 lg:p-16 space-y-12">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
            <div>
              <h4 className={sectionHeaderClasses}><Users className="h-5 w-5" /> Базовые показатели</h4>
              <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
                <FormField control={form.control} name="gender" render={({ field }) => (
                  <FormItem className="col-span-2 md:col-span-1">
                    <FormLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 flex gap-2">Пол</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger className={selectTriggerClasses}><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent className="bg-primary text-white border-none rounded-xl"><SelectItem value="мужской">Мужской</SelectItem><SelectItem value="женский">Женский</SelectItem></SelectContent>
                    </Select>
                  </FormItem>
                )} />
                {[{ name: 'weight', label: 'Вес (кг)', icon: Scale }, { name: 'height', label: 'Рост (см)', icon: Ruler }, { name: 'age', label: 'Возраст', icon: Calendar }].map((m) => (
                  <FormField key={m.name} control={form.control} name={m.name as any} render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 flex gap-2">{m.label}</FormLabel>
                      <FormControl><Input type="number" {...field} className={inputClasses} /></FormControl>
                    </FormItem>
                  )} />
                ))}
              </div>
            </div>

            <div>
              <h4 className={sectionHeaderClasses}><Target className="h-5 w-5" /> Цели и образ жизни</h4>
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                <FormField control={form.control} name="healthGoal" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Цель здоровья</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger className={selectTriggerClasses}><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent className="bg-primary text-white border-none rounded-xl">
                        <SelectItem value="снизить массу тела">Снизить массу тела</SelectItem>
                        <SelectItem value="поддержать текущее состояние">Поддержать текущее состояние</SelectItem>
                        <SelectItem value="набор массы">Набор массы</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
                <FormField control={form.control} name="activityLevel" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Уровень активности</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger className={selectTriggerClasses}><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent className="bg-primary text-white border-none rounded-xl">
                        <SelectItem value="малоактивный">Малоактивный</SelectItem>
                        <SelectItem value="средний">Средний</SelectItem>
                        <SelectItem value="активный">Активный</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between border-b pb-4 mb-6">
                <h4 className="text-xl font-black tracking-tight flex items-center gap-3"><Zap className="h-5 w-5" /> Данные гаджетов</h4>
                <Button type="button" onClick={simulateSync} disabled={syncing} className="bg-primary/10 text-primary hover:bg-primary/20 rounded-xl h-10 px-4 font-black uppercase text-[10px]">
                  {syncing ? <Loader2 className="animate-spin h-4 w-4" /> : <RefreshCw className="h-4 w-4 mr-2" />} Синхронизация
                </Button>
              </div>
              <div className="grid gap-6 grid-cols-3">
                <FormField control={form.control} name="steps" render={({ field }) => (
                  <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Footprints className="h-3 w-3" /> Шаги</FormLabel><FormControl><Input type="number" {...field} className={inputClasses} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="avgHeartRate" render={({ field }) => (
                  <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Heart className="h-3 w-3" /> Пульс</FormLabel><FormControl><Input type="number" {...field} className={inputClasses} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="sleepDurationHours" render={({ field }) => (
                  <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Moon className="h-3 w-3" /> Сон</FormLabel><FormControl><Input type="number" {...field} className={inputClasses} /></FormControl></FormItem>
                )} />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-20 rounded-2xl text-2xl font-black bg-primary shadow-xl shadow-primary/20 hover:scale-[1.01] transition-transform">
              {loading ? <><Loader2 className="mr-4 animate-spin h-8 w-8" /> Анализ данных...</> : <><Sparkles className="mr-4 h-8 w-8" /> Сформировать отчет</>}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
