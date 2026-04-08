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
  Dna,
  FlaskConical,
  Stethoscope,
  Utensils,
  Camera,
  X,
  Mic,
  MicOff,
  FileUp,
  Heart
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
});

interface RecommendationFormProps {
  onResult: (result: GenerateRecommendationsOutput) => void;
  selectedDate: Date;
}

export function RecommendationForm({ onResult, selectedDate }: RecommendationFormProps) {
  const [loading, setLoading] = useState(false);
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
    },
  });

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
      const result = await generatePersonalizedRecommendations({
        ...values,
        targetDate: selectedDate.toISOString(),
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
            Интеллектуальный анализ 2.0
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
                        <Users className="h-3.5 w-3.5" /> Пол
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-20 rounded-[1.5rem] bg-muted/30 border-none font-black text-2xl px-8">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-[1.5rem]">
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
                        <FormLabel className="text-[10px] font-black text-muted-foreground flex items-center gap-2 mb-4 uppercase tracking-[0.2em]">
                          <metric.icon className="h-3.5 w-3.5" /> {metric.label}
                        </FormLabel>
                        <FormControl>
                          <Input type="number" {...field} className="h-20 rounded-[1.5rem] bg-muted/30 border-none font-black text-3xl px-8" />
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
                    <FormItem className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <FormLabel className="text-[10px] font-black text-muted-foreground flex items-center gap-3 uppercase tracking-[0.2em]">
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
                            {isRecording === 'labResultsInput' ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                          </Button>
                          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => startCamera('labs')}>
                            <Camera className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <FormControl>
                        <div className="space-y-4">
                          <Textarea placeholder="Результаты лаб. тестов..." className="min-h-[160px] rounded-[2rem] bg-muted/30 border-none p-8 font-bold text-lg focus:ring-4 focus:ring-primary/5 resize-none" {...field} />
                          {(activeCamera === 'labs' || labImage) && (
                            <div className="relative rounded-[2rem] overflow-hidden border-2 border-primary/20 aspect-video">
                              {activeCamera === 'labs' ? (
                                <>
                                  <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                                    <Button type="button" onClick={() => capturePhoto('labs')} className="rounded-full w-12 h-12 bg-white text-primary"><Camera className="h-6 w-6" /></Button>
                                    <Button type="button" onClick={stopCamera} variant="destructive" className="rounded-full w-12 h-12"><X className="h-6 w-6" /></Button>
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
                      <div className="flex items-center justify-between mb-4">
                        <FormLabel className="text-[10px] font-black text-muted-foreground flex items-center gap-3 uppercase tracking-[0.2em]">
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
                        <Textarea placeholder="Опишите симптомы..." className="min-h-[160px] rounded-[2rem] bg-muted/30 border-none p-8 font-bold text-lg resize-none" {...field} />
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
                        <div className="flex items-center justify-between mb-4">
                          <FormLabel className="text-[10px] font-black text-muted-foreground flex items-center gap-3 uppercase tracking-[0.2em]">
                            <Utensils className="h-4 w-4 text-primary" /> Дневник питания
                          </FormLabel>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className={cn("h-8 w-8 rounded-lg", isRecording === 'dietaryInput' && "bg-red-100 text-red-500 animate-pulse")}
                            onClick={() => toggleVoiceInput('dietaryInput')}
                          >
                            <Mic className="h-4 w-4" />
                          </Button>
                        </div>
                        <FormControl>
                          <Textarea placeholder="Что вы сегодня ели? Надиктуйте или введите..." className="min-h-[220px] rounded-[2rem] bg-muted/30 border-none p-8 font-bold text-lg resize-none" {...field} />
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
                    <Button type="button" variant="outline" className="h-28 rounded-[2rem] border-dashed border-2 flex flex-col gap-2" onClick={() => startCamera('diet')}>
                      <Camera className="h-8 w-8 text-primary" />
                      <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Камера</span>
                    </Button>
                    <label className="cursor-pointer">
                      <div className="h-28 rounded-[2rem] border-dashed border-2 flex flex-col gap-2 items-center justify-center">
                        <FileUp className="h-8 w-8 text-primary" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Файл</span>
                      </div>
                      <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => handleFileUpload(e, 'diet')} />
                    </label>
                  </div>
                  
                  {activeCamera === 'diet' && (
                    <div className="relative rounded-[2rem] overflow-hidden bg-black aspect-square">
                      <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                        <Button type="button" onClick={() => capturePhoto('diet')} className="rounded-full w-12 h-12 bg-white text-primary"><Camera className="h-6 w-6" /></Button>
                        <Button type="button" onClick={stopCamera} variant="destructive" className="rounded-full w-12 h-12"><X className="h-6 w-6" /></Button>
                      </div>
                    </div>
                  )}

                  {dietaryImage && activeCamera !== 'diet' && (
                    <div className="relative rounded-[2rem] overflow-hidden group border-4 border-primary/20">
                      <img src={dietaryImage} className="w-full aspect-square object-cover" alt="Diet" />
                      <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setDietaryImage(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-28 rounded-[2rem] text-3xl font-black bg-primary shadow-[0_25px_50px_rgba(76,175,80,0.3)] transition-all hover:scale-[1.01] active:scale-95 group overflow-hidden" 
              disabled={loading}
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              {loading ? (
                <><Loader2 className="mr-6 h-10 w-10 animate-spin" /> Биометрический анализ...</>
              ) : (
                <><Sparkles className="mr-6 h-10 w-10 group-hover:rotate-12 transition-transform" /> Получить рекомендации</>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
