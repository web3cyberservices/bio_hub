"use client";

import { useState, useRef } from 'react';
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
  Zap, 
  Heart, 
  ThumbsDown, 
  Cigarette, 
  Wine, 
  Users,
  Dna,
  FlaskConical,
  Stethoscope,
  Utensils,
  Camera,
  Upload,
  X,
  Trophy
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

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
  const [image, setImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
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
      favoriteFoods: '',
      dislikedFoods: '',
      dailyActivities: '',
      planDuration: 'день',
      dietaryInput: '',
      labResultsInput: '',
      medicalConditionsInput: '',
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setShowCamera(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setHasCameraPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Доступ к камере отклонен',
        description: 'Пожалуйста, разрешите доступ к камере в настройках браузера.',
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        setImage(canvas.toDataURL('image/jpeg'));
        stopCamera();
      }
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      const result = await generatePersonalizedRecommendations({
        ...values,
        targetDate: selectedDate.toISOString(),
        // Note: In a real app we'd handle the image in the AI flow if needed
      });
      onResult(result);
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
      toast({
        variant: 'destructive',
        title: 'Ошибка генерации',
        description: 'Не удалось создать план. Попробуйте еще раз.',
      });
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
              <p className="text-muted-foreground font-black uppercase tracking-[0.3em] text-[9px] mt-2">Единый центр управления здоровьем</p>
            </div>
          </div>
          <Badge className="bg-primary/5 text-primary border-none px-6 py-3 rounded-2xl flex gap-3 font-black uppercase tracking-widest text-[10px]">
            <span className="w-2 h-2 bg-primary rounded-full animate-ping" />
            Анализ в режиме реального времени
          </Badge>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-20">
            {/* 1. Core Biometrics */}
            <div className="space-y-8">
              <h4 className="text-xs font-black uppercase tracking-[0.4em] text-muted-foreground/50 border-b pb-4">01. Базовые показатели</h4>
              <div className="grid gap-10 grid-cols-2 lg:grid-cols-4">
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
            </div>

            {/* 2. Clinical Context */}
            <div className="space-y-8">
              <h4 className="text-xs font-black uppercase tracking-[0.4em] text-muted-foreground/50 border-b pb-4">02. Клинический контекст</h4>
              <div className="grid gap-10 lg:grid-cols-2">
                <FormField
                  control={form.control}
                  name="labResultsInput"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black text-muted-foreground flex items-center gap-3 mb-4 uppercase tracking-[0.2em]">
                        <FlaskConical className="h-4 w-4 text-primary" /> Результаты анализов
                      </FormLabel>
                      <FormControl>
                        <Textarea placeholder="Введите данные из чекапа или лаб. тестов..." className="min-h-[160px] rounded-[2rem] bg-muted/30 border-none p-8 font-bold text-lg focus:ring-4 focus:ring-primary/5 resize-none placeholder:text-muted-foreground/40" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="medicalConditionsInput"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black text-muted-foreground flex items-center gap-3 mb-4 uppercase tracking-[0.2em]">
                        <Stethoscope className="h-4 w-4 text-primary" /> Жалобы и заболевания
                      </FormLabel>
                      <FormControl>
                        <Textarea placeholder="Опишите хронические заболевания или текущие симптомы..." className="min-h-[160px] rounded-[2rem] bg-muted/30 border-none p-8 font-bold text-lg focus:ring-4 focus:ring-primary/5 resize-none placeholder:text-muted-foreground/40" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* 3. Nutrition & Food Log */}
            <div className="space-y-8">
              <h4 className="text-xs font-black uppercase tracking-[0.4em] text-muted-foreground/50 border-b pb-4">03. Рацион и Логи</h4>
              <div className="grid gap-10 lg:grid-cols-12">
                <div className="lg:col-span-8">
                  <FormField
                    control={form.control}
                    name="dietaryInput"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black text-muted-foreground flex items-center gap-3 mb-4 uppercase tracking-[0.2em]">
                          <Utensils className="h-4 w-4 text-primary" /> Дневник питания
                        </FormLabel>
                        <FormControl>
                          <Textarea placeholder="Что вы съели за последнее время? Опишите кратко..." className="min-h-[220px] rounded-[2rem] bg-muted/30 border-none p-8 font-bold text-lg focus:ring-4 focus:ring-primary/5 resize-none placeholder:text-muted-foreground/40" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="lg:col-span-4 space-y-6">
                  <label className="text-[10px] font-black text-muted-foreground flex items-center gap-3 mb-4 uppercase tracking-[0.2em]">
                    <Camera className="h-4 w-4 text-primary" /> Фото еды
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <Button type="button" variant="outline" className="h-28 rounded-[2rem] border-dashed border-2 flex flex-col gap-2" onClick={startCamera}>
                      <Camera className="h-8 w-8 text-primary" />
                      <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Камера</span>
                    </Button>
                    <label className="cursor-pointer">
                      <div className="h-28 rounded-[2rem] border-dashed border-2 flex flex-col gap-2 items-center justify-center">
                        <Upload className="h-8 w-8 text-primary" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Загрузить</span>
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                    </label>
                  </div>
                  
                  {showCamera && (
                    <div className="relative rounded-[2rem] overflow-hidden bg-black aspect-square">
                      <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                        <Button type="button" onClick={capturePhoto} className="rounded-full w-12 h-12 bg-white text-primary"><Camera className="h-6 w-6" /></Button>
                        <Button type="button" onClick={stopCamera} variant="destructive" className="rounded-full w-12 h-12"><X className="h-6 w-6" /></Button>
                      </div>
                    </div>
                  )}

                  {image && !showCamera && (
                    <div className="relative rounded-[2rem] overflow-hidden group border-4 border-primary/20">
                      <img src={image} className="w-full aspect-square object-cover" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setImage(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 4. Strategic Targets */}
            <div className="space-y-8">
              <h4 className="text-xs font-black uppercase tracking-[0.4em] text-muted-foreground/50 border-b pb-4">04. Стратегия и Цели</h4>
              <div className="grid gap-10 md:grid-cols-2">
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
            </div>

            {/* 5. Lifestyle & Habits */}
            <div className="p-12 rounded-[2.5rem] bg-primary/5 border border-primary/10 grid gap-10 md:grid-cols-2">
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

             {/* 6. Food Preferences */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <FormField
                control={form.control}
                name="favoriteFoods"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black text-muted-foreground flex items-center gap-3 mb-4 uppercase tracking-[0.2em]">
                      <Heart className="h-4 w-4 text-primary" /> Любимые ингредиенты
                    </FormLabel>
                    <FormControl>
                      <Textarea placeholder="Что добавить в меню?" className="min-h-[160px] rounded-[2rem] bg-muted/30 border-none p-8 font-bold text-lg focus:ring-4 focus:ring-primary/5 resize-none placeholder:text-muted-foreground/40" {...field} />
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
                      <Textarea placeholder="Что строго запрещено?" className="min-h-[160px] rounded-[2rem] bg-muted/30 border-none p-8 font-bold text-lg focus:ring-4 focus:ring-destructive/5 resize-none placeholder:text-muted-foreground/40" {...field} />
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
                <><Loader2 className="mr-6 h-10 w-10 animate-spin" /> Глубокий анализ данных...</>
              ) : (
                <><Sparkles className="mr-6 h-10 w-10 group-hover:rotate-12 transition-transform" /> Сгенерировать План</>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}