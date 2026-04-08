"use client";

import { useState } from 'react';
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
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Loader2, 
  Sparkles, 
  Activity, 
  Scale, 
  Ruler, 
  Calendar, 
  Watch, 
  Zap, 
  Moon, 
  Heart, 
  ThumbsDown, 
  Cigarette, 
  Wine, 
  Trophy, 
  Users 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const formSchema = z.object({
  weight: z.coerce.number().positive('Вес обязателен'),
  height: z.coerce.number().positive('Рост обязателен'),
  age: z.coerce.number().int().min(1, 'Возраст обязателен'),
  gender: z.enum(['мужской', 'женский']),
  activityLevel: z.enum(['малоактивный', 'среднеактивный', 'средний', 'активный', 'перенагрузка']),
  healthGoal: z.enum(['снизить массу тела', 'поддержать текущее состояние', 'набор массы']),
  smoking: z.enum(['да', 'нет']),
  alcohol: z.enum(['не употребляю', 'редко', 'умеренно', 'часто']),
  favoriteFoods: z.string().optional(),
  dislikedFoods: z.string().optional(),
  dailyActivities: z.string().optional(),
  planDuration: z.enum(['день', 'неделя']),
  dietaryInput: z.string().optional(),
  labResultsInput: z.string().optional(),
  medicalConditionsInput: z.string().optional(),
  deviceData: z.object({
    steps: z.coerce.number().optional(),
    avgHeartRate: z.coerce.number().optional(),
    sleepDurationHours: z.coerce.number().optional(),
  }).optional(),
});

interface RecommendationFormProps {
  onResult: (result: GenerateRecommendationsOutput) => void;
  selectedDate: Date;
}

export function RecommendationForm({ onResult, selectedDate }: RecommendationFormProps) {
  const [loading, setLoading] = useState(false);

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
      favoriteFoods: '',
      dislikedFoods: '',
      dailyActivities: '',
      planDuration: 'день',
      deviceData: {
        steps: 8000,
        avgHeartRate: 65,
        sleepDurationHours: 7.5,
      }
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      const result = await generatePersonalizedRecommendations({
        ...values,
        targetDate: selectedDate.toISOString(),
      });
      onResult(result);
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="premium-card overflow-hidden">
      <CardContent className="p-8 md:p-16 space-y-16">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="p-5 bg-primary/10 rounded-[1.75rem] shadow-sm">
              <Activity className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h3 className="text-4xl font-black tracking-tighter">Параметры профиля</h3>
              <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Уточните свои данные для анализа</p>
            </div>
          </div>
          <Badge className="bg-secondary/10 text-secondary border-none px-5 py-2.5 rounded-2xl flex gap-2 font-black uppercase tracking-widest text-[10px] animate-pulse">
            <Watch className="h-4 w-4" /> Live Sync Active
          </Badge>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
            {/* Core Metrics Grid */}
            <div className="grid gap-10 grid-cols-2 lg:grid-cols-4">
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black text-muted-foreground flex items-center gap-2 mb-3 uppercase tracking-[0.2em]">
                      <Users className="h-3.5 w-3.5" /> Пол
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-16 rounded-2xl bg-muted/30 border-none font-black text-xl px-6 focus:ring-2 focus:ring-primary/20">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-2xl border-none shadow-2xl">
                        <SelectItem value="мужской" className="font-bold">Мужской</SelectItem>
                        <SelectItem value="женский" className="font-bold">Женский</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              {[
                { name: 'weight', label: 'Вес (кг)', icon: Scale },
                { name: 'height', label: 'Рост (см)', icon: Ruler },
                { name: 'age', label: 'Возраст', icon: Calendar },
              ].map((metric) => (
                <FormField
                  key={metric.name}
                  control={form.control}
                  name={metric.name as any}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black text-muted-foreground flex items-center gap-2 mb-3 uppercase tracking-[0.2em]">
                        <metric.icon className="h-3.5 w-3.5" /> {metric.label}
                      </FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className="h-16 rounded-2xl bg-muted/30 border-none font-black text-2xl px-6 focus:ring-2 focus:ring-primary/20" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              ))}
            </div>

            {/* Strategy Selectors */}
            <div className="grid gap-10 md:grid-cols-2">
              <FormField
                control={form.control}
                name="activityLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black text-muted-foreground mb-3 uppercase tracking-[0.2em]">Активность</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-16 rounded-2xl bg-muted/30 border-none font-bold px-6">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-2xl border-none shadow-2xl">
                        <SelectItem value="малоактивный" className="font-medium">Сидячий образ жизни</SelectItem>
                        <SelectItem value="среднеактивный" className="font-medium">Легкие нагрузки</SelectItem>
                        <SelectItem value="средний" className="font-medium">Средняя активность</SelectItem>
                        <SelectItem value="активный" className="font-medium">Высокая активность</SelectItem>
                        <SelectItem value="перенагрузка" className="font-medium">Экстремальные нагрузки</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="healthGoal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black text-muted-foreground mb-3 uppercase tracking-[0.2em]">Глобальная цель</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-16 rounded-2xl bg-muted/30 border-none font-bold px-6">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-2xl border-none shadow-2xl">
                        <SelectItem value="снизить массу тела" className="font-medium">Снижение веса</SelectItem>
                        <SelectItem value="поддержать текущее состояние" className="font-medium">Поддержание веса</SelectItem>
                        <SelectItem value="набор массы" className="font-medium">Набор массы</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            {/* Habits Panel */}
            <div className="grid gap-10 md:grid-cols-2 p-10 rounded-[2.5rem] bg-primary/5 border-2 border-primary/10">
              <FormField
                control={form.control}
                name="smoking"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black text-muted-foreground flex items-center gap-2 mb-3 uppercase tracking-[0.2em]">
                      <Cigarette className="h-3.5 w-3.5 text-primary" /> Курение
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-14 rounded-xl bg-white border-none font-bold px-6 shadow-sm">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl border-none shadow-2xl">
                        <SelectItem value="да">Да, курю</SelectItem>
                        <SelectItem value="нет">Нет, не курю</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="alcohol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black text-muted-foreground flex items-center gap-2 mb-3 uppercase tracking-[0.2em]">
                      <Wine className="h-3.5 w-3.5 text-primary" /> Алкоголь
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-14 rounded-xl bg-white border-none font-bold px-6 shadow-sm">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl border-none shadow-2xl">
                        <SelectItem value="не употребляю">Не употребляю</SelectItem>
                        <SelectItem value="редко">Редко</SelectItem>
                        <SelectItem value="умеренно">Умеренно</SelectItem>
                        <SelectItem value="часто">Часто</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            {/* Preferences Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <FormField
                control={form.control}
                name="favoriteFoods"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black text-muted-foreground flex items-center gap-2 mb-3 uppercase tracking-[0.2em]">
                      <Heart className="h-3.5 w-3.5 text-primary" /> Любимые продукты
                    </FormLabel>
                    <FormControl>
                      <Textarea placeholder="Что включить в рацион?" className="min-h-[140px] rounded-3xl bg-muted/30 border-none p-6 font-medium text-lg focus:ring-2 focus:ring-primary/20 resize-none" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dislikedFoods"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black text-muted-foreground flex items-center gap-2 mb-3 uppercase tracking-[0.2em]">
                      <ThumbsDown className="h-3.5 w-3.5 text-destructive" /> Стоп-лист
                    </FormLabel>
                    <FormControl>
                      <Textarea placeholder="Что строго исключить?" className="min-h-[140px] rounded-3xl bg-muted/30 border-none p-6 font-medium text-lg focus:ring-2 focus:ring-destructive/20 resize-none" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-24 rounded-3xl text-2xl font-black bg-primary shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95 group" 
              disabled={loading}
            >
              {loading ? (
                <><Loader2 className="mr-4 h-10 w-10 animate-spin" /> Генерирую стратегию...</>
              ) : (
                <><Sparkles className="mr-4 h-10 w-10 group-hover:rotate-12 transition-transform" /> Сформировать AI План</>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
