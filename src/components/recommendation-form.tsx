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
  Users,
  Dna
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
      <CardContent className="p-8 md:p-16 lg:p-24 space-y-20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
          <div className="flex items-center gap-8">
            <div className="p-6 bg-primary/10 rounded-[2rem] shadow-[0_15px_30px_rgba(76,175,80,0.15)]">
              <Dna className="h-12 w-12 text-primary" />
            </div>
            <div>
              <h3 className="text-5xl font-black tracking-tighter leading-none">Биометрия</h3>
              <p className="text-muted-foreground font-black uppercase tracking-[0.3em] text-[9px] mt-2">Точный расчет на основе ИИ алгоритмов</p>
            </div>
          </div>
          <Badge className="bg-primary/5 text-primary border-none px-6 py-3 rounded-2xl flex gap-3 font-black uppercase tracking-widest text-[10px]">
            <span className="w-2 h-2 bg-primary rounded-full animate-ping" />
            Анализ в режиме реального времени
          </Badge>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-16">
            {/* Core Metrics Grid */}
            <div className="grid gap-12 grid-cols-2 lg:grid-cols-4">
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black text-muted-foreground flex items-center gap-2 mb-4 uppercase tracking-[0.2em]">
                      <Users className="h-3.5 w-3.5" /> Биологический пол
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-20 rounded-[1.5rem] bg-muted/30 border-none font-black text-2xl px-8 focus:ring-4 focus:ring-primary/10 transition-all">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-[1.5rem] border-none shadow-2xl p-2">
                        <SelectItem value="мужской" className="rounded-xl font-black text-lg py-3">Мужской</SelectItem>
                        <SelectItem value="женский" className="rounded-xl font-black text-lg py-3">Женский</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              {[
                { name: 'weight', label: 'Текущий Вес (кг)', icon: Scale },
                { name: 'height', label: 'Рост (см)', icon: Ruler },
                { name: 'age', label: 'Возраст', icon: Calendar },
              ].map((metric) => (
                <FormField
                  key={metric.name}
                  control={form.control}
                  name={metric.name as any}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black text-muted-foreground flex items-center gap-2 mb-4 uppercase tracking-[0.2em]">
                        <metric.icon className="h-3.5 w-3.5" /> {metric.label}
                      </FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className="h-20 rounded-[1.5rem] bg-muted/30 border-none font-black text-3xl px-8 focus:ring-4 focus:ring-primary/10 transition-all" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              ))}
            </div>

            {/* Strategic Selections */}
            <div className="grid gap-12 md:grid-cols-2">
              <FormField
                control={form.control}
                name="activityLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black text-muted-foreground mb-4 uppercase tracking-[0.2em]">Уровень метаболизма</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-20 rounded-[1.5rem] bg-muted/30 border-none font-black px-8 text-xl">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-[1.5rem] border-none shadow-2xl p-2">
                        <SelectItem value="малоактивный" className="rounded-xl py-3 font-bold">Сидячий / Офис</SelectItem>
                        <SelectItem value="среднеактивный" className="rounded-xl py-3 font-bold">Легкий фитнес</SelectItem>
                        <SelectItem value="средний" className="rounded-xl py-3 font-bold">Средняя активность</SelectItem>
                        <SelectItem value="активный" className="rounded-xl py-3 font-bold">Высокие нагрузки</SelectItem>
                        <SelectItem value="перенагрузка" className="rounded-xl py-3 font-bold">Атлетический режим</SelectItem>
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
                    <FormLabel className="text-[10px] font-black text-muted-foreground mb-4 uppercase tracking-[0.2em]">Глобальный таргет</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-20 rounded-[1.5rem] bg-muted/30 border-none font-black px-8 text-xl">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-[1.5rem] border-none shadow-2xl p-2">
                        <SelectItem value="снизить массу тела" className="rounded-xl py-3 font-bold">Снижение веса</SelectItem>
                        <SelectItem value="поддержать текущее состояние" className="rounded-xl py-3 font-bold">Баланс и Тонус</SelectItem>
                        <SelectItem value="набор массы" className="rounded-xl py-3 font-bold">Гипертрофия мышц</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            {/* Lifestyle & Habits */}
            <div className="p-12 rounded-[2.5rem] bg-primary/5 border border-primary/10 grid gap-12 md:grid-cols-2">
              <FormField
                control={form.control}
                name="smoking"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black text-muted-foreground flex items-center gap-3 mb-4 uppercase tracking-[0.2em]">
                      <Cigarette className="h-4 w-4 text-primary" /> Курение
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-16 rounded-2xl bg-white border-none font-black px-8 shadow-sm">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl border-none shadow-2xl">
                        <SelectItem value="да" className="font-bold">Курильщик</SelectItem>
                        <SelectItem value="нет" className="font-bold">Не курю</SelectItem>
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
                    <FormLabel className="text-[10px] font-black text-muted-foreground flex items-center gap-3 mb-4 uppercase tracking-[0.2em]">
                      <Wine className="h-4 w-4 text-primary" /> Алкоголь
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-16 rounded-2xl bg-white border-none font-black px-8 shadow-sm">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl border-none shadow-2xl">
                        <SelectItem value="не употребляю" className="font-bold">Не употребляю</SelectItem>
                        <SelectItem value="редко" className="font-bold">Редко</SelectItem>
                        <SelectItem value="умеренно" className="font-bold">Умеренно</SelectItem>
                        <SelectItem value="часто" className="font-bold">Часто</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            {/* Foods Preference */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <FormField
                control={form.control}
                name="favoriteFoods"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black text-muted-foreground flex items-center gap-3 mb-4 uppercase tracking-[0.2em]">
                      <Heart className="h-4 w-4 text-primary" /> Любимые ингредиенты
                    </FormLabel>
                    <FormControl>
                      <Textarea placeholder="Что добавить в меню?" className="min-h-[160px] rounded-[2rem] bg-muted/30 border-none p-8 font-bold text-xl focus:ring-4 focus:ring-primary/5 resize-none placeholder:text-muted-foreground/40" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dislikedFoods"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black text-muted-foreground flex items-center gap-3 mb-4 uppercase tracking-[0.2em]">
                      <ThumbsDown className="h-4 w-4 text-destructive" /> Стоп-лист (Исключить)
                    </FormLabel>
                    <FormControl>
                      <Textarea placeholder="Что строго запрещено?" className="min-h-[160px] rounded-[2rem] bg-muted/30 border-none p-8 font-bold text-xl focus:ring-4 focus:ring-destructive/5 resize-none placeholder:text-muted-foreground/40" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-28 rounded-[2rem] text-3xl font-black bg-primary shadow-[0_25px_50px_rgba(76,175,80,0.3)] transition-all hover:scale-[1.01] active:scale-95 group relative overflow-hidden" 
              disabled={loading}
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              {loading ? (
                <><Loader2 className="mr-6 h-10 w-10 animate-spin" /> Формируем данные...</>
              ) : (
                <><Sparkles className="mr-6 h-10 w-10 group-hover:rotate-12 transition-transform" /> Сформировать AI План</>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}