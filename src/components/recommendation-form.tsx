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
import { Loader2, Sparkles, Activity, Target, User, Scale, Ruler, Calendar, Stethoscope } from 'lucide-react';

const formSchema = z.object({
  weight: z.coerce.number().positive('Вес обязателен'),
  height: z.coerce.number().positive('Рост обязателен'),
  age: z.coerce.number().int().min(1, 'Возраст обязателен'),
  gender: z.enum(['мужской', 'женский']),
  activityLevel: z.enum(['малоактивный', 'среднеактивный', 'средний', 'активный', 'перенагрузка']),
  healthGoal: z.enum(['снизить массу тела', 'поддержать текущее состояние', 'набор массы']),
  dietaryInput: z.string().optional(),
  labResultsInput: z.string().optional(),
  medicalConditionsInput: z.string().optional(),
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
      dietaryInput: '',
      labResultsInput: '',
      medicalConditionsInput: '',
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
    <Card className="border-none shadow-2xl rounded-[3rem] bg-white/80 backdrop-blur-xl overflow-hidden p-1">
      <CardContent className="p-10 space-y-10">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-primary/10 rounded-2xl shadow-inner">
            <Activity className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h3 className="text-3xl font-black tracking-tighter">Ваш профиль</h3>
            <p className="text-muted-foreground font-medium">Введите данные для анализа</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid gap-6 grid-cols-2">
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground/80">
                      <Scale className="h-3.5 w-3.5 text-primary/60" /> Вес (кг)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" {...field} className="h-14 rounded-2xl bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all font-bold text-lg" />
                    </FormControl>
                    <FormMessage />
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
                      <Input type="number" {...field} className="h-14 rounded-2xl bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all font-bold text-lg" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 grid-cols-2">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground/80">
                      <Calendar className="h-3.5 w-3.5 text-primary/60" /> Возраст
                    </FormLabel>
                    <FormControl>
                      <Input type="number" {...field} className="h-14 rounded-2xl bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all font-bold text-lg" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground/80">
                      <User className="h-3.5 w-3.5 text-primary/60" /> Пол
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-14 rounded-2xl bg-muted/30 border-none font-bold text-lg">
                          <SelectValue placeholder="Пол" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="мужской">Мужчина</SelectItem>
                        <SelectItem value="женский">Женщина</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <FormLabel className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground/80">
                      <Activity className="h-3.5 w-3.5 text-primary/60" /> Активность
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-14 rounded-2xl bg-muted/30 border-none font-bold text-lg">
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
                    <FormLabel className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground/80">
                      <Target className="h-3.5 w-3.5 text-primary/60" /> Цель
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-14 rounded-2xl bg-muted/30 border-none font-bold text-lg">
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

            <FormField
              control={form.control}
              name="medicalConditionsInput"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground/80">
                    <Stethoscope className="h-3.5 w-3.5 text-primary/60" /> Заболевания и жалобы (необязательно)
                  </FormLabel>
                  <FormControl>
                    <Textarea placeholder="Укажите хронические заболевания или симптомы..." {...field} className="min-h-[100px] rounded-2xl bg-muted/30 border-none font-medium text-lg resize-none" />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full h-18 rounded-[1.75rem] text-2xl font-black bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/30 transition-all hover:scale-[1.03] active:scale-95 py-8 mt-4" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-3 h-7 w-7 animate-spin" />
                  Обработка...
                </>
              ) : (
                <>
                  <Sparkles className="mr-3 h-7 w-7" />
                  Анализ данных
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
