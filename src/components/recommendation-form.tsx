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
      <CardContent className="p-8 md:p-12 space-y-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-primary/10 rounded-2xl shadow-sm">
              <Activity className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-3xl font-bold tracking-tight">Персональный план</h3>
              <p className="text-muted-foreground font-medium">На {format(selectedDate, 'd MMMM', { locale: ru })}</p>
            </div>
          </div>
          <Badge className="bg-secondary/10 text-secondary border-none px-4 py-2 rounded-full flex gap-2 font-bold">
            <Watch className="h-4 w-4" /> Данные синхронизированы
          </Badge>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
            {/* Core Metrics */}
            <div className="grid gap-8 grid-cols-2 lg:grid-cols-4">
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-bold text-muted-foreground flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4" /> ПОЛ
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-14 rounded-xl bg-muted/30 border-none font-medium text-lg">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="мужской">Мужской</SelectItem>
                        <SelectItem value="женский">Женский</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              {[
                { name: 'weight', label: 'ВЕС (кг)', icon: Scale },
                { name: 'height', label: 'РОСТ (см)', icon: Ruler },
                { name: 'age', label: 'ВОЗРАСТ', icon: Calendar },
              ].map((metric) => (
                <FormField
                  key={metric.name}
                  control={form.control}
                  name={metric.name as any}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold text-muted-foreground flex items-center gap-2 mb-2">
                        <metric.icon className="h-4 w-4" /> {metric.label}
                      </FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className="h-14 rounded-xl bg-muted/30 border-none font-medium text-lg" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <FormField
                control={form.control}
                name="activityLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-bold text-muted-foreground mb-2">УРОВЕНЬ АКТИВНОСТИ</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-14 rounded-xl bg-muted/30 border-none font-medium">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="малоактивный">Сидячий образ жизни</SelectItem>
                        <SelectItem value="среднеактивный">Легкие нагрузки</SelectItem>
                        <SelectItem value="средний">Средняя активность</SelectItem>
                        <SelectItem value="активный">Высокая активность</SelectItem>
                        <SelectItem value="перенагрузка">Экстремальные нагрузки</SelectItem>
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
                    <FormLabel className="text-sm font-bold text-muted-foreground mb-2">ЦЕЛЬ ЗДОРОВЬЯ</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-14 rounded-xl bg-muted/30 border-none font-medium">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="снизить массу тела">Снижение веса</SelectItem>
                        <SelectItem value="поддержать текущее состояние">Поддержание веса</SelectItem>
                        <SelectItem value="набор массы">Набор массы</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            {/* Habits */}
            <div className="grid gap-8 md:grid-cols-2 p-8 rounded-3xl bg-primary/5 border border-primary/10">
              <FormField
                control={form.control}
                name="smoking"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-bold text-muted-foreground flex items-center gap-2 mb-2">
                      <Cigarette className="h-4 w-4 text-primary" /> КУРЕНИЕ
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 rounded-xl bg-white border-none font-medium">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="да">Курю</SelectItem>
                        <SelectItem value="нет">Не курю</SelectItem>
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
                    <FormLabel className="text-sm font-bold text-muted-foreground flex items-center gap-2 mb-2">
                      <Wine className="h-4 w-4 text-primary" /> АЛКОГОЛЬ
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 rounded-xl bg-white border-none font-medium">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl">
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

            {/* Dietary Preferences */}
            <div className="space-y-8">
              <FormField
                control={form.control}
                name="favoriteFoods"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-bold text-muted-foreground flex items-center gap-2 mb-2">
                      <Heart className="h-4 w-4 text-primary" /> ЛЮБИМЫЕ ПРОДУКТЫ
                    </FormLabel>
                    <FormControl>
                      <Textarea placeholder="Что вам нравится? (например: авокадо, лосось...)" className="min-h-[100px] rounded-2xl bg-muted/30 border-none p-4" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dislikedFoods"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-bold text-muted-foreground flex items-center gap-2 mb-2">
                      <ThumbsDown className="h-4 w-4 text-destructive" /> НЕ ЛЮБЛЮ / АЛЛЕРГИИ
                    </FormLabel>
                    <FormControl>
                      <Textarea placeholder="Чего стоит избегать? (например: молоко, арахис...)" className="min-h-[100px] rounded-2xl bg-muted/30 border-none p-4" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-20 rounded-2xl text-2xl font-bold bg-primary shadow-xl shadow-primary/30 transition-all hover:scale-[1.01]" 
              disabled={loading}
            >
              {loading ? (
                <><Loader2 className="mr-3 h-8 w-8 animate-spin" /> АНАЛИЗИРУЮ...</>
              ) : (
                <><Sparkles className="mr-3 h-8 w-8" /> СОСТАВИТЬ ПЛАН</>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
