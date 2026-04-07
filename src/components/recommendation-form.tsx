
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
  FormDescription,
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, Activity, Target, FlaskConical, Apple, User, Scale, Ruler, Calendar } from 'lucide-react';

const formSchema = z.object({
  weight: z.coerce.number().positive('Вес должен быть положительным'),
  height: z.coerce.number().positive('Рост должен быть положительным'),
  age: z.coerce.number().int().min(1, 'Возраст должен быть больше 0'),
  gender: z.enum(['мужской', 'женский']),
  activityLevel: z.enum([
    'малоактивный',
    'среднеактивный',
    'средний',
    'активный',
    'перенагрузка',
  ]),
  healthGoal: z.enum([
    'снизить массу тела',
    'поддержать текущее состояние',
    'набор массы',
  ]),
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
    <Card className="border-none shadow-xl bg-white overflow-hidden">
      <CardHeader className="bg-primary/5 border-b">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Activity className="h-6 w-6 text-primary" />
          Ваши показатели
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid gap-6 sm:grid-cols-4">
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5 min-h-[1.5rem]">
                      <User className="h-4 w-4 text-muted-foreground" /> Пол
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Пол" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="мужской">Муж</SelectItem>
                        <SelectItem value="женский">Жен</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5 min-h-[1.5rem]">
                      <Scale className="h-4 w-4 text-muted-foreground" /> Вес (кг)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="70" {...field} className="h-11" />
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
                    <FormLabel className="flex items-center gap-1.5 min-h-[1.5rem]">
                      <Ruler className="h-4 w-4 text-muted-foreground" /> Рост (см)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="175" {...field} className="h-11" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5 min-h-[1.5rem]">
                      <Calendar className="h-4 w-4 text-muted-foreground" /> Возраст
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="30" {...field} className="h-11" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="activityLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5 min-h-[1.5rem]">
                      <Activity className="h-4 w-4 text-secondary" /> Образ жизни
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Выберите активность" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="малоактивный">Малоактивный</SelectItem>
                        <SelectItem value="среднеактивный">Среднеактивный</SelectItem>
                        <SelectItem value="средний">Средний</SelectItem>
                        <SelectItem value="активный">Активный</SelectItem>
                        <SelectItem value="перенагрузка">Перенагрузка</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="healthGoal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5 min-h-[1.5rem]">
                      <Target className="h-4 w-4 text-primary" /> Желаемый результат
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Выберите цель" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="снизить массу тела">Снизить массу тела</SelectItem>
                        <SelectItem value="поддержать текущее состояние">Поддержать состояние</SelectItem>
                        <SelectItem value="набор массы">Набор массы</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-6">
              <FormField
                control={form.control}
                name="dietaryInput"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5 min-h-[1.5rem]">
                      <Apple className="h-4 w-4 text-accent-foreground" /> Рацион питания (необязательно)
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Опишите ваши привычные продукты питания, завтраки, обеды и ужины..." 
                        className="min-h-[100px] bg-accent/5 focus:bg-white transition-colors"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>Список продуктов, которые вы употребляете регулярно.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="labResultsInput"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5 min-h-[1.5rem]">
                      <FlaskConical className="h-4 w-4 text-destructive" /> Результаты анализов (необязательно)
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Введите показатели ваших недавних анализов (ферритин, витамин D, ТТГ и т.д.)..." 
                        className="min-h-[100px] bg-accent/5 focus:bg-white transition-colors"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>Укажите отклонения или важные для вас показатели.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 text-xl font-bold bg-primary hover:bg-primary/90 shadow-xl shadow-primary/10 transition-all hover:scale-[1.01]" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  Анализируем ваши данные...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-6 w-6" />
                  Сгенерировать рекомендации
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
