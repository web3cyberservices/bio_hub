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
import { Loader2, Sparkles, Activity, Target, User, Scale, Ruler, Calendar, Apple, FlaskConical } from 'lucide-react';

const formSchema = z.object({
  weight: z.coerce.number().positive('Вес обязателен'),
  height: z.coerce.number().positive('Рост обязателен'),
  age: z.coerce.number().int().min(1, 'Возраст обязателен'),
  gender: z.enum(['мужской', 'женский']),
  activityLevel: z.enum(['малоактивный', 'среднеактивный', 'средний', 'активный', 'перенагрузка']),
  healthGoal: z.enum(['снизить массу тела', 'поддержать текущее состояние', 'набор массы']),
  dietaryInput: z.string().optional(),
  labResultsInput: z.string().optional(),
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
    <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden p-2">
      <CardContent className="p-8 space-y-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <Activity className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-2xl font-black">Профиль здоровья</h3>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 grid-cols-2">
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <Scale className="h-3 w-3" /> Вес (кг)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" {...field} className="h-12 rounded-xl bg-muted/50 border-none focus-visible:ring-primary" />
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
                    <FormLabel className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <Ruler className="h-3 w-3" /> Рост (см)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" {...field} className="h-12 rounded-xl bg-muted/50 border-none focus-visible:ring-primary" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 grid-cols-2">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <Calendar className="h-3 w-3" /> Возраст
                    </FormLabel>
                    <FormControl>
                      <Input type="number" {...field} className="h-12 rounded-xl bg-muted/50 border-none focus-visible:ring-primary" />
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
                    <FormLabel className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <User className="h-3 w-3" /> Пол
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 rounded-xl bg-muted/50 border-none">
                          <SelectValue placeholder="Пол" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="мужской">Мужчина</SelectItem>
                        <SelectItem value="женский">Женщина</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="activityLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <Activity className="h-3 w-3" /> Активность
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 rounded-xl bg-muted/50 border-none">
                        <SelectValue placeholder="Уровень активности" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="малоактивный">Сидячий образ жизни</SelectItem>
                      <SelectItem value="среднеактивный">Легкие нагрузки</SelectItem>
                      <SelectItem value="средний">Средние нагрузки</SelectItem>
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
                  <FormLabel className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <Target className="h-3 w-3" /> Ваша цель
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 rounded-xl bg-muted/50 border-none">
                        <SelectValue placeholder="Выберите цель" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="снизить массу тела">Похудение</SelectItem>
                      <SelectItem value="поддержать текущее состояние">Поддержание веса</SelectItem>
                      <SelectItem value="набор массы">Набор мышечной массы</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full h-16 rounded-[1.5rem] text-xl font-black bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                  Думаю...
                </>
              ) : (
                <>
                  <Sparkles className="mr-3 h-6 w-6" />
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