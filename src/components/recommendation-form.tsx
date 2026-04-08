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
import { Loader2, Sparkles, Activity, Scale, Ruler, Calendar, Watch, Zap, Moon, Heart, ThumbsDown, Cigarette, Wine, Trophy } from 'lucide-react';
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
  deviceData: z.object({
    steps: z.coerce.number().optional(),
    avgHeartRate: z.coerce.number().optional(),
    sleepDurationHours: z.coerce.number().optional(),
  }).optional(),
});

interface RecommendationFormProps {
  onResult: (result: GenerateRecommendationsOutput) => void;
}

export function RecommendationForm({ onResult }: RecommendationFormProps) {
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
      dietaryInput: '',
      labResultsInput: '',
      medicalConditionsInput: '',
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
      const result = await generatePersonalizedRecommendations(values);
      onResult(result);
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-none shadow-[0_32px_80px_-20px_rgba(20,60,40,0.12)] rounded-[3rem] bg-white overflow-hidden p-1">
      <CardContent className="p-10 space-y-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-primary/10 rounded-2xl shadow-inner">
              <Activity className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h3 className="text-3xl font-black tracking-tighter">Ваш профиль</h3>
              <p className="text-muted-foreground font-medium">Данные для ИИ-анализа</p>
            </div>
          </div>
          <Badge className="bg-secondary/10 text-secondary border-none px-4 py-2 rounded-xl flex gap-2 font-bold">
            <Watch className="h-4 w-4" /> Данные синхронизированы
          </Badge>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid gap-6 grid-cols-2 lg:grid-cols-3">
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground/80">
                      <Scale className="h-3.5 w-3.5 text-primary/60" /> Вес (кг)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" {...field} className="h-14 rounded-2xl bg-muted/30 border-none font-bold text-lg focus:ring-2 focus:ring-primary/20" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground/80">
                      <Ruler className="h-3.5 w-3.5 text-primary/60" /> Рост (см)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" {...field} className="h-14 rounded-2xl bg-muted/30 border-none font-bold text-lg focus:ring-2 focus:ring-primary/20" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground/80">
                      <Calendar className="h-3.5 w-3.5 text-primary/60" /> Возраст
                    </FormLabel>
                    <FormControl>
                      <Input type="number" {...field} className="h-14 rounded-2xl bg-muted/30 border-none font-bold text-lg focus:ring-2 focus:ring-primary/20" />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="activityLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground/80">Уровень активности</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-14 rounded-2xl bg-muted/30 border-none font-bold">
                          <SelectValue placeholder="Активность" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="малоактивный">Сидячий</SelectItem>
                        <SelectItem value="среднеактивный">Легкий</SelectItem>
                        <SelectItem value="средний">Средний</SelectItem>
                        <SelectItem value="активный">Высокий</SelectItem>
                        <SelectItem value="перенагрузка">Экстремальный</SelectItem>
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
                    <FormLabel className="text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground/80">Цель здоровья</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-14 rounded-2xl bg-muted/30 border-none font-bold">
                          <SelectValue placeholder="Цель" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="снизить массу тела">Похудение</SelectItem>
                        <SelectItem value="поддержать текущее состояние">Поддержание</SelectItem>
                        <SelectItem value="набор массы">Набор массы</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2 p-8 rounded-[2.5rem] bg-primary/5 border border-primary/10">
              <FormField
                control={form.control}
                name="smoking"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground/80">
                      <Cigarette className="h-3.5 w-3.5 text-primary/60" /> Вы курите?
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 rounded-xl bg-white border-none font-bold">
                          <SelectValue placeholder="Выберите" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="да">Да</SelectItem>
                        <SelectItem value="нет">Нет</SelectItem>
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
                    <FormLabel className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground/80">
                      <Wine className="h-3.5 w-3.5 text-primary/60" /> Алкоголь
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 rounded-xl bg-white border-none font-bold">
                          <SelectValue placeholder="Выберите частоту" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="не употребляю">Не употребляю</SelectItem>
                        <SelectItem value="редко">Редко (праздники)</SelectItem>
                        <SelectItem value="умеренно">Умеренно (1-2 раза в неделю)</SelectItem>
                        <SelectItem value="часто">Часто</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-6">
              <FormField
                control={form.control}
                name="dailyActivities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground/80">
                      <Trophy className="h-3.5 w-3.5 text-primary/60" /> Активности за сегодня
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Бег 30 мин, Футбол, Йога..." 
                        className="min-h-[80px] rounded-2xl bg-muted/30 border-none p-4 font-medium" 
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="favoriteFoods"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground/80">
                      <Heart className="h-3.5 w-3.5 text-primary/60" /> Любимые продукты
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Например: Авокадо, лосось, гречка, творог..." 
                        className="min-h-[100px] rounded-2xl bg-muted/30 border-none p-4 font-medium" 
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dislikedFoods"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.15em] text-destructive/80">
                      <ThumbsDown className="h-3.5 w-3.5 text-destructive/60" /> Нелюбимые продукты
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Например: Кинза, лук, молочные продукты..." 
                        className="min-h-[100px] rounded-2xl bg-muted/30 border-none p-4 font-medium" 
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="planDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground/80">Составить меню на:</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-14 rounded-2xl bg-muted/30 border-none font-bold">
                          <SelectValue placeholder="Длительность" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="день">Сегодня (1 день)</SelectItem>
                        <SelectItem value="неделя">Неделю (7 дней)</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <div className="p-8 rounded-[2.5rem] bg-secondary/5 border border-secondary/10 space-y-6">
              <div className="flex items-center gap-3">
                <Watch className="h-5 w-5 text-secondary" />
                <h4 className="font-black text-secondary uppercase tracking-widest text-[11px]">Данные носимых устройств</h4>
              </div>
              <div className="grid gap-4 grid-cols-3">
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase flex items-center gap-1"><Zap className="h-3 w-3" /> Шаги</label>
                  <Input type="number" {...form.register('deviceData.steps')} className="h-12 rounded-xl bg-white border-none font-bold text-center" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase flex items-center gap-1"><Activity className="h-3 w-3" /> Пульс</label>
                  <Input type="number" {...form.register('deviceData.avgHeartRate')} className="h-12 rounded-xl bg-white border-none font-bold text-center" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase flex items-center gap-1"><Moon className="h-3 w-3" /> Сон (ч)</label>
                  <Input type="number" step="0.1" {...form.register('deviceData.sleepDurationHours')} className="h-12 rounded-xl bg-white border-none font-bold text-center" />
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-20 rounded-[2rem] text-2xl font-black bg-primary shadow-2xl shadow-primary/30 hover:scale-[1.01] transition-all" 
              disabled={loading}
            >
              {loading ? (
                <><Loader2 className="mr-3 h-8 w-8 animate-spin" /> Анализирую данные...</>
              ) : (
                <><Sparkles className="mr-3 h-8 w-8" /> Получить план здоровья</>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
