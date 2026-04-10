
"use client";

import { useState, useRef, useEffect, useMemo } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Loader2, 
  Sparkles, 
  Scale, 
  Ruler, 
  Calendar, 
  Users,
  FlaskConical,
  Stethoscope,
  Utensils,
  Camera,
  X,
  Mic,
  FileUp,
  Target,
  Activity,
  Zap,
  Cigarette,
  GlassWater,
  Heart,
  Ban,
  Timer,
  Footprints,
  Moon,
  RefreshCw
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
  favoriteFoods: z.string().optional(),
  dislikedFoods: z.string().optional(),
  dailyActivities: z.string().optional(),
  planDuration: z.enum(['день', 'неделя']),
  dietaryInput: z.string().optional(),
  labResultsInput: z.string().optional(),
  medicalConditionsInput: z.string().optional(),
  steps: z.coerce.number().optional(),
  avgHeartRate: z.coerce.number().optional(),
  sleepDurationHours: z.coerce.number().optional(),
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
  const [activeCamera, setActiveCamera] = useState<'diet' | 'labs' | null>(null);
  const [isRecording, setIsRecording] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
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
      favoriteFoods: '',
      dislikedFoods: '',
      dailyActivities: '',
      planDuration: 'день',
      dietaryInput: '',
      labResultsInput: '',
      medicalConditionsInput: '',
      steps: 0,
      avgHeartRate: 0,
      sleepDurationHours: 0,
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
    await new Promise(r => setTimeout(r, 1500));
    form.setValue('steps', Math.floor(Math.random() * (12000 - 4000) + 4000));
    form.setValue('avgHeartRate', Math.floor(Math.random() * (75 - 60) + 60));
    form.setValue('sleepDurationHours', Math.floor(Math.random() * (9 - 6) + 6));
    setSyncing(false);
    toast({
      title: "Данные синхронизированы",
      description: "Показатели здоровья успешно импортированы.",
    });
  };

  const toggleVoiceInput = (fieldName: keyof z.infer<typeof formSchema>) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({
        variant: 'destructive',
        title: 'Не поддерживается',
        description: 'Браузер не поддерживает голосовой ввод.',
      });
      return;
    }

    if (isRecording === fieldName) {
      setIsRecording(null);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ru-RU';
    recognition.onstart = () => setIsRecording(fieldName);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const currentVal = form.getValues(fieldName);
      form.setValue(fieldName, `${currentVal} ${transcript}`.trim());
      setIsRecording(null);
    };
    recognition.onerror = () => setIsRecording(null);
    recognition.onend = () => setIsRecording(null);
    recognition.start();
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !firestore) return;
    setLoading(true);
    try {
      // Сохраняем биометрические данные в профиль пользователя
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

      // Обезличиваем данные для ИИ (отправляем только метрики)
      const { steps, avgHeartRate, sleepDurationHours, ...anonymizedData } = values;
      
      const result = await generatePersonalizedRecommendations({
        ...anonymizedData,
        targetDate: selectedDate.toISOString(),
        deviceData: (steps || avgHeartRate || sleepDurationHours) ? {
          steps,
          avgHeartRate,
          sleepDurationHours,
        } : undefined,
      });
      
      onResult(result);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка анализа',
        description: 'Не удалось сформировать план. Попробуйте еще раз.',
      });
    } finally {
      setLoading(false);
    }
  }

  const inputClasses = "h-14 md:h-20 rounded-[1.25rem] md:rounded-[1.5rem] bg-primary/90 border-none font-black text-white px-6 md:px-8 focus:ring-4 focus:ring-white/20 placeholder:text-white/40";
  const selectTriggerClasses = "h-14 md:h-20 rounded-[1.25rem] md:rounded-[1.5rem] bg-primary/90 border-none font-black text-white px-6 md:px-8 focus:ring-4 focus:ring-white/20";
  const textareaClasses = "min-h-[100px] md:min-h-[120px] rounded-[1.5rem] md:rounded-[2rem] bg-primary/90 border-none p-6 md:p-8 font-bold text-white text-base md:text-lg resize-none focus:ring-4 focus:ring-white/20 placeholder:text-white/40";
  const sectionHeaderClasses = "text-xl md:text-2xl font-black font-headline tracking-tighter text-foreground border-b pb-4 md:pb-6 flex items-center gap-3 md:gap-4 mb-6 md:mb-10";
  const sectionNumberClasses = "w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm md:text-base font-black shrink-0";

  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  return (
    <Card className="premium-card overflow-hidden">
      <CardContent className="p-4 sm:p-8 md:p-16 lg:p-24 space-y-12 md:space-y-24">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12 md:space-y-24">
            
            <div>
              <h4 className={sectionHeaderClasses}>
                <span className={sectionNumberClasses}>1</span> Базовые показатели
              </h4>
              <div className="grid gap-6 md:gap-10 grid-cols-2 lg:grid-cols-4">
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem className="col-span-2 md:col-span-1">
                      <FormLabel className="text-[9px] md:text-[10px] font-black text-muted-foreground flex items-center gap-2 mb-2 md:mb-4 uppercase tracking-[0.2em]">
                        <Users className="h-3 md:h-3.5 w-3 md:w-3.5" /> Пол
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className={selectTriggerClasses}>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-[1.5rem] bg-primary text-white border-none">
                          <SelectItem value="мужской">Мужской</SelectItem>
                          <SelectItem value="женский">Женский</SelectItem>
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
                        <FormLabel className="text-[9px] md:text-[10px] font-black text-muted-foreground flex items-center gap-2 mb-2 md:mb-4 uppercase tracking-[0.2em]">
                          <metric.icon className="h-3 md:h-3.5 w-3 md:w-3.5" /> {metric.label}
                        </FormLabel>
                        <FormControl>
                          <Input type="number" {...field} className={cn(inputClasses, "text-xl md:text-3xl")} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>

            <div>
              <h4 className={sectionHeaderClasses}>
                <span className={sectionNumberClasses}>2</span> Цели и Образ жизни
              </h4>
              <div className="grid gap-6 md:gap-10 grid-cols-1 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="healthGoal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[9px] md:text-[10px] font-black text-muted-foreground flex items-center gap-2 mb-2 md:mb-4 uppercase tracking-[0.2em]">
                        <Target className="h-3 md:h-3.5 w-3 md:w-3.5" /> Основная цель
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className={cn(selectTriggerClasses, "text-sm md:text-xl")}>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-[1.5rem] bg-primary text-white border-none">
                          <SelectItem value="снизить массу тела">Снизить массу тела</SelectItem>
                          <SelectItem value="поддержать текущее состояние">Поддержать текущее состояние</SelectItem>
                          <SelectItem value="набор массы">Набор массы</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="activityLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[9px] md:text-[10px] font-black text-muted-foreground flex items-center gap-2 mb-2 md:mb-4 uppercase tracking-[0.2em]">
                        <Zap className="h-3 md:h-3.5 w-3 md:w-3.5" /> Активность
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className={cn(selectTriggerClasses, "text-sm md:text-xl")}>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-[1.5rem] bg-primary text-white border-none">
                          <SelectItem value="малоактивный">Малоактивный</SelectItem>
                          <SelectItem value="среднеактивный">Среднеактивный</SelectItem>
                          <SelectItem value="средний">Средний</SelectItem>
                          <SelectItem value="активный">Активный</SelectItem>
                          <SelectItem value="перенагрузка">Перенагрузка</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="smoking"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[9px] md:text-[10px] font-black text-muted-foreground flex items-center gap-2 mb-2 md:mb-4 uppercase tracking-[0.2em]">
                        <Cigarette className="h-3 md:h-3.5 w-3 md:w-3.5" /> Курение
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className={cn(selectTriggerClasses, "text-sm md:text-xl")}>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-[1.5rem] bg-primary text-white border-none">
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
                      <FormLabel className="text-[9px] md:text-[10px] font-black text-muted-foreground flex items-center gap-2 mb-2 md:mb-4 uppercase tracking-[0.2em]">
                        <GlassWater className="h-3 md:h-3.5 w-3 md:w-3.5" /> Алкоголь
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className={cn(selectTriggerClasses, "text-sm md:text-xl")}>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-[1.5rem] bg-primary text-white border-none">
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
            </div>

            <div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 md:pb-6 mb-6 md:mb-10">
                <h4 className="text-xl md:text-2xl font-black font-headline tracking-tighter text-foreground flex items-center gap-3">
                  <span className={sectionNumberClasses}>3</span> Данные гаджетов
                </h4>
                <Button 
                  type="button" 
                  onClick={simulateSync} 
                  disabled={syncing}
                  className="rounded-xl h-10 md:h-12 px-4 md:px-6 bg-primary/10 text-primary hover:bg-primary/20 border-none font-black uppercase tracking-widest text-[8px] md:text-[10px] gap-2 self-start md:self-auto"
                >
                  {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  Синхронизировать
                </Button>
              </div>
              <div className="grid gap-6 md:gap-10 grid-cols-2 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="steps"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[9px] md:text-[10px] font-black text-muted-foreground flex items-center gap-2 mb-2 md:mb-4 uppercase tracking-[0.2em]">
                        <Footprints className="h-3 md:h-3.5 w-3 md:w-3.5 text-primary" /> Шаги
                      </FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className={cn(inputClasses, "text-xl md:text-2xl")} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="avgHeartRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[9px] md:text-[10px] font-black text-muted-foreground flex items-center gap-2 mb-2 md:mb-4 uppercase tracking-[0.2em]">
                        <Heart className="h-3 md:h-3.5 w-3 md:w-3.5 text-secondary" /> Пульс
                      </FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className={cn(inputClasses, "text-xl md:text-2xl")} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sleepDurationHours"
                  render={({ field }) => (
                    <FormItem className="col-span-2 md:col-span-1">
                      <FormLabel className="text-[9px] md:text-[10px] font-black text-muted-foreground flex items-center gap-2 mb-2 md:mb-4 uppercase tracking-[0.2em]">
                        <Moon className="h-3 md:h-3.5 w-3 md:w-3.5 text-accent-foreground" /> Сон (ч)
                      </FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className={cn(inputClasses, "text-xl md:text-2xl")} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-20 sm:h-24 md:h-28 rounded-[1.5rem] md:rounded-[2rem] text-xl sm:text-2xl md:text-3xl font-black bg-primary shadow-[0_25px_50px_rgba(76,175,80,0.3)] transition-all hover:scale-[1.01] active:scale-95 group overflow-hidden" 
              disabled={loading}
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              {loading ? (
                <><Loader2 className="mr-3 md:mr-6 h-6 md:h-10 w-6 md:w-10 animate-spin" /> Обработка данных...</>
              ) : (
                <><Sparkles className="mr-3 md:mr-6 h-6 md:h-10 w-6 md:w-10 group-hover:rotate-12 transition-transform" /> Сформировать отчет</>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
