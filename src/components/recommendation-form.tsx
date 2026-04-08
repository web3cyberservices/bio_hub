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
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [dietaryImage, setDietaryImage] = useState<string | null>(null);
  const [labImage, setLabImage] = useState<string | null>(null);
  const [activeCamera, setActiveCamera] = useState<'diet' | 'labs' | null>(null);
  const [isRecording, setIsRecording] = useState<string | null>(null);
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
      steps: 0,
      avgHeartRate: 0,
      sleepDurationHours: 0,
    },
  });

  const simulateSync = async () => {
    setSyncing(true);
    await new Promise(r => setTimeout(r, 1500));
    form.setValue('steps', Math.floor(Math.random() * (12000 - 4000) + 4000));
    form.setValue('avgHeartRate', Math.floor(Math.random() * (75 - 60) + 60));
    form.setValue('sleepDurationHours', Math.floor(Math.random() * (9 - 6) + 6));
    setSyncing(false);
    toast({
      title: "Данные синхронизированы",
      description: "Показатели Apple Health успешно импортированы.",
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'diet' | 'labs') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'diet') setDietaryImage(reader.result as string);
        else setLabImage(reader.result as string);
        setActiveCamera(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async (type: 'diet' | 'labs') => {
    setActiveCamera(type);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка камеры',
        description: 'Пожалуйста, разрешите доступ к камере в настройках.',
      });
      setActiveCamera(null);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setActiveCamera(null);
  };

  const capturePhoto = (type: 'diet' | 'labs') => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg');
        if (type === 'diet') setDietaryImage(dataUrl);
        else setLabImage(dataUrl);
        stopCamera();
      }
    }
  };

  const toggleVoiceInput = (fieldName: keyof z.infer<typeof formSchema>) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast({
        variant: 'destructive',
        title: 'Не поддерживается',
        description: 'Ваш браузер не поддерживает голосовой ввод.',
      });
      return;
    }

    if (isRecording === fieldName) {
      setIsRecording(null);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ru-RU';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(fieldName);
      toast({ title: "Голосовой ввод", description: "Слушаю вас..." });
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const currentVal = form.getValues(fieldName);
      form.setValue(fieldName, `${currentVal} ${transcript}`.trim());
      setIsRecording(null);
    };

    recognition.onerror = () => {
      setIsRecording(null);
      toast({ variant: 'destructive', title: "Ошибка", description: "Не удалось распознать голос." });
    };

    recognition.onend = () => setIsRecording(null);
    
    recognition.start();
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      const { steps, avgHeartRate, sleepDurationHours, ...rest } = values;
      const result = await generatePersonalizedRecommendations({
        ...rest,
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
        title: 'Ошибка генерации',
        description: 'Не удалось создать план. Попробуйте еще раз.',
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

  return (
    <Card className="premium-card overflow-hidden">
      <CardContent className="p-4 sm:p-8 md:p-16 lg:p-24 space-y-12 md:space-y-24">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12 md:space-y-24">
            
            {/* 1. Core Biometrics */}
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
                          <SelectItem value="мужской" className="focus:bg-white/10 focus:text-white">Мужской</SelectItem>
                          <SelectItem value="женский" className="focus:bg-white/10 focus:text-white">Женский</SelectItem>
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

            {/* 2. Lifestyle & Goals */}
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
                          <SelectItem value="снизить массу тела" className="focus:bg-white/10 focus:text-white">Снизить массу тела</SelectItem>
                          <SelectItem value="поддержать текущее состояние" className="focus:bg-white/10 focus:text-white">Поддержать текущее состояние</SelectItem>
                          <SelectItem value="набор массы" className="focus:bg-white/10 focus:text-white">Набор массы</SelectItem>
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
                        <Zap className="h-3 md:h-3.5 w-3 md:w-3.5" /> Уровень активности
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className={cn(selectTriggerClasses, "text-sm md:text-xl")}>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-[1.5rem] bg-primary text-white border-none">
                          <SelectItem value="малоактивный" className="focus:bg-white/10 focus:text-white">Малоактивный</SelectItem>
                          <SelectItem value="среднеактивный" className="focus:bg-white/10 focus:text-white">Среднеактивный</SelectItem>
                          <SelectItem value="средний" className="focus:bg-white/10 focus:text-white">Средний</SelectItem>
                          <SelectItem value="активный" className="focus:bg-white/10 focus:text-white">Активный</SelectItem>
                          <SelectItem value="перенагрузка" className="focus:bg-white/10 focus:text-white">Перенагрузка</SelectItem>
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
                          <SelectItem value="да" className="focus:bg-white/10 focus:text-white">Да, курю</SelectItem>
                          <SelectItem value="нет" className="focus:bg-white/10 focus:text-white">Нет, не курю</SelectItem>
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
                          <SelectItem value="не употребляю" className="focus:bg-white/10 focus:text-white">Не употребляю</SelectItem>
                          <SelectItem value="редко" className="focus:bg-white/10 focus:text-white">Редко (по праздникам)</SelectItem>
                          <SelectItem value="умеренно" className="focus:bg-white/10 focus:text-white">Умеренно</SelectItem>
                          <SelectItem value="часто" className="focus:bg-white/10 focus:text-white">Часто</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* 3. Device & BioData */}
            <div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 md:pb-6 mb-6 md:mb-10">
                <h4 className="text-xl md:text-2xl font-black font-headline tracking-tighter text-foreground flex items-center gap-3">
                  <span className={sectionNumberClasses}>3</span> Данные устройств
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
              <FormField
                control={form.control}
                name="dailyActivities"
                render={({ field }) => (
                  <FormItem className="mt-8 md:mt-10">
                    <div className="flex items-center justify-between mb-2 md:mb-4">
                      <FormLabel className="text-[9px] md:text-[10px] font-black text-muted-foreground flex items-center gap-3 uppercase tracking-[0.2em]">
                        <Activity className="h-4 w-4 text-primary" /> Активности
                      </FormLabel>
                      <Button type="button" variant="ghost" size="icon" className={cn("h-8 w-8 rounded-lg", isRecording === 'dailyActivities' && "bg-red-100 text-red-500")} onClick={() => toggleVoiceInput('dailyActivities')}>
                        <Mic className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormControl>
                      <Textarea placeholder="Например: Бег 30 мин..." className={textareaClasses} {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* 4. Preferences & Planning */}
            <div>
              <h4 className={sectionHeaderClasses}>
                <span className={sectionNumberClasses}>4</span> Предпочтения
              </h4>
              <div className="grid gap-6 md:gap-10 grid-cols-1 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="favoriteFoods"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between mb-2 md:mb-4">
                        <FormLabel className="text-[9px] md:text-[10px] font-black text-muted-foreground flex items-center gap-3 uppercase tracking-[0.2em]">
                          <Heart className="h-4 w-4 text-primary" /> Любимые продукты
                        </FormLabel>
                        <Button type="button" variant="ghost" size="icon" className={cn("h-8 w-8 rounded-lg", isRecording === 'favoriteFoods' && "bg-red-100 text-red-500")} onClick={() => toggleVoiceInput('favoriteFoods')}>
                          <Mic className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormControl>
                        <Textarea placeholder="Что вы любите?..." className={textareaClasses} {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dislikedFoods"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between mb-2 md:mb-4">
                        <FormLabel className="text-[9px] md:text-[10px] font-black text-muted-foreground flex items-center gap-3 uppercase tracking-[0.2em]">
                          <Ban className="h-4 w-4 text-destructive" /> Нелюбимые продукты
                        </FormLabel>
                        <Button type="button" variant="ghost" size="icon" className={cn("h-8 w-8 rounded-lg", isRecording === 'dislikedFoods' && "bg-red-100 text-red-500")} onClick={() => toggleVoiceInput('dislikedFoods')}>
                          <Mic className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormControl>
                        <Textarea placeholder="Что исключить?..." className={textareaClasses} {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="planDuration"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-[9px] md:text-[10px] font-black text-muted-foreground flex items-center gap-2 mb-2 md:mb-4 uppercase tracking-[0.2em]">
                        <Timer className="h-3 md:h-3.5 w-3 md:w-3.5" /> Длительность плана
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className={cn(selectTriggerClasses, "text-base md:text-2xl")}>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-[1.5rem] bg-primary text-white border-none">
                          <SelectItem value="день" className="focus:bg-white/10 focus:text-white">План на 1 день</SelectItem>
                          <SelectItem value="неделя" className="focus:bg-white/10 focus:text-white">План на неделю</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* 5. Clinical Context */}
            <div>
              <h4 className={sectionHeaderClasses}>
                <span className={sectionNumberClasses}>5</span> Клинический контекст
              </h4>
              <div className="grid gap-6 md:gap-10 grid-cols-1 lg:grid-cols-2">
                <FormField
                  control={form.control}
                  name="labResultsInput"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <div className="flex items-center justify-between mb-2 md:mb-4">
                        <FormLabel className="text-[9px] md:text-[10px] font-black text-muted-foreground flex items-center gap-3 uppercase tracking-[0.2em]">
                          <FlaskConical className="h-4 w-4 text-primary" /> Анализы
                        </FormLabel>
                        <div className="flex gap-2">
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className={cn("h-8 w-8 rounded-lg", isRecording === 'labResultsInput' && "bg-red-100 text-red-500 animate-pulse")}
                            onClick={() => toggleVoiceInput('labResultsInput')}
                          >
                            <Mic className="h-4 w-4" />
                          </Button>
                          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => startCamera('labs')}>
                            <Camera className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <FormControl>
                        <div className="space-y-4">
                          <Textarea placeholder="Результаты анализов..." className={cn(textareaClasses, "min-h-[140px] md:min-h-[160px]")} {...field} />
                          {(activeCamera === 'labs' || labImage) && (
                            <div className="relative rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border-2 border-primary/20 aspect-video">
                              {activeCamera === 'labs' ? (
                                <>
                                  <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                                    <Button type="button" onClick={() => capturePhoto('labs')} className="rounded-full w-10 h-10 bg-white text-primary"><Camera className="h-5 w-5" /></Button>
                                    <Button type="button" onClick={stopCamera} variant="destructive" className="rounded-full w-10 h-10"><X className="h-5 w-5" /></Button>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <img src={labImage!} className="w-full h-full object-cover" alt="Labs" />
                                  <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 rounded-full" onClick={() => setLabImage(null)}><X className="h-4 w-4" /></Button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="medicalConditionsInput"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between mb-2 md:mb-4">
                        <FormLabel className="text-[9px] md:text-[10px] font-black text-muted-foreground flex items-center gap-3 uppercase tracking-[0.2em]">
                          <Stethoscope className="h-4 w-4 text-primary" /> Жалобы
                        </FormLabel>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className={cn("h-8 w-8 rounded-lg", isRecording === 'medicalConditionsInput' && "bg-red-100 text-red-500 animate-pulse")}
                          onClick={() => toggleVoiceInput('medicalConditionsInput')}
                        >
                          <Mic className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormControl>
                        <Textarea placeholder="Опишите симптомы..." className={cn(textareaClasses, "min-h-[140px] md:min-h-[160px]")} {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* 6. Daily Logs */}
            <div>
              <h4 className={sectionHeaderClasses}>
                <span className={sectionNumberClasses}>6</span> Дневник питания
              </h4>
              <div className="grid gap-6 md:gap-10 grid-cols-1 lg:grid-cols-12">
                <div className="lg:col-span-8">
                  <FormField
                    control={form.control}
                    name="dietaryInput"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between mb-2 md:mb-4">
                          <FormLabel className="text-[9px] md:text-[10px] font-black text-muted-foreground flex items-center gap-3 uppercase tracking-[0.2em]">
                            <Utensils className="h-4 w-4 text-primary" /> Рацион
                          </FormLabel>
                          <Button type="button" variant="ghost" size="icon" className={cn("h-8 w-8 rounded-lg", isRecording === 'dietaryInput' && "bg-red-100 text-red-500")} onClick={() => toggleVoiceInput('dietaryInput')}>
                            <Mic className="h-4 w-4" />
                          </Button>
                        </div>
                        <FormControl>
                          <Textarea placeholder="Что вы сегодня ели?..." className={cn(textareaClasses, "min-h-[140px] md:min-h-[160px]")} {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="lg:col-span-4 space-y-4 md:space-y-6">
                  <label className="text-[9px] md:text-[10px] font-black text-muted-foreground flex items-center gap-3 mb-2 md:mb-4 uppercase tracking-[0.2em]">
                    <Camera className="h-4 w-4 text-primary" /> Фото еды
                  </label>
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <Button type="button" variant="outline" className="h-20 md:h-28 rounded-[1.5rem] md:rounded-[2rem] border-dashed border-2 flex flex-col gap-1 md:gap-2 hover:bg-primary/5 hover:border-primary/30 transition-all" onClick={() => startCamera('diet')}>
                      <Camera className="h-6 md:h-8 w-6 md:w-8 text-primary" />
                      <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest text-muted-foreground">Камера</span>
                    </Button>
                    <label className="cursor-pointer">
                      <div className="h-20 md:h-28 rounded-[1.5rem] md:rounded-[2rem] border-dashed border-2 flex flex-col gap-1 md:gap-2 items-center justify-center hover:bg-primary/5 hover:border-primary/30 transition-all">
                        <FileUp className="h-6 md:h-8 w-6 md:w-8 text-primary" />
                        <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest text-muted-foreground">Файл</span>
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'diet')} />
                    </label>
                  </div>
                  
                  {activeCamera === 'diet' && (
                    <div className="relative rounded-[1.5rem] md:rounded-[2rem] overflow-hidden bg-black aspect-square">
                      <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                        <Button type="button" onClick={() => capturePhoto('diet')} className="rounded-full w-10 h-10 bg-white text-primary"><Camera className="h-5 w-5" /></Button>
                        <Button type="button" onClick={stopCamera} variant="destructive" className="rounded-full w-10 h-10"><X className="h-5 w-5" /></Button>
                      </div>
                    </div>
                  )}

                  {dietaryImage && activeCamera !== 'diet' && (
                    <div className="relative rounded-[1.5rem] md:rounded-[2rem] overflow-hidden group border-4 border-primary/20">
                      <img src={dietaryImage} className="w-full aspect-square object-cover" alt="Diet" />
                      <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 rounded-full opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity" onClick={() => setDietaryImage(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-20 sm:h-24 md:h-28 rounded-[1.5rem] md:rounded-[2rem] text-xl sm:text-2xl md:text-3xl font-black bg-primary shadow-[0_25px_50px_rgba(76,175,80,0.3)] transition-all hover:scale-[1.01] active:scale-95 group overflow-hidden" 
              disabled={loading}
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              {loading ? (
                <><Loader2 className="mr-3 md:mr-6 h-6 md:h-10 w-6 md:w-10 animate-spin" /> Анализ...</>
              ) : (
                <><Sparkles className="mr-3 md:mr-6 h-6 md:h-10 w-6 md:w-10 group-hover:rotate-12 transition-transform" /> Сформировать план</>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
