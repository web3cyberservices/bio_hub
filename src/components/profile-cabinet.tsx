
'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { 
  User, 
  Scale, 
  Ruler, 
  Calendar, 
  FlaskConical, 
  Save, 
  Loader2,
  Activity,
  Settings,
  Camera,
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  Zap,
  Target
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';

const profileSchema = z.object({
  firstName: z.string().min(1, 'Имя обязательно'),
  lastName: z.string().optional(),
  gender: z.enum(['мужской', 'женский']),
  age: z.coerce.number().int().min(1, 'Возраст обязателен'),
  weight: z.coerce.number().positive('Вес обязателен'),
  height: z.coerce.number().positive('Рост обязателен'),
  activityLevel: z.enum(['малоактивный', 'среднеактивный', 'средний', 'активный', 'перенагрузка']),
  healthGoal: z.enum(['снизить массу тела', 'поддержать текущее состояние', 'набор массы']),
  smoking: z.enum(['да', 'нет']),
  alcohol: z.enum(['не употребляю', 'редко', 'умеренно', 'часто']),
  labResults: z.string().optional(),
  labResultsFile: z.string().optional(),
});

type ProfileValues = z.infer<typeof profileSchema>;

export function ProfileCabinet() {
  const { user } = useUser();
  const { firestore } = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [labFile, setLabFile] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const userDocRef = user && firestore ? doc(firestore, 'users', user.uid) : null;
  const { data: userData, loading: docLoading } = useDoc<any>(userDocRef);

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      gender: 'мужской',
      age: 30,
      weight: 70,
      height: 175,
      activityLevel: 'средний',
      healthGoal: 'поддержать текущее состояние',
      smoking: 'нет',
      alcohol: 'не употребляю',
      labResults: '',
      labResultsFile: '',
    },
  });

  useEffect(() => {
    if (userData) {
      form.reset({
        firstName: userData.firstName || userData.displayName || '',
        lastName: userData.lastName || '',
        gender: userData.gender || 'мужской',
        age: userData.age || 30,
        weight: userData.weight || 70,
        height: userData.height || 175,
        activityLevel: userData.activityLevel || 'средний',
        healthGoal: userData.healthGoal || 'поддержать текущее состояние',
        smoking: userData.smoking || 'нет',
        alcohol: userData.alcohol || 'не употребляю',
        labResults: userData.labResults || '',
        labResultsFile: userData.labResultsFile || '',
      });
      if (userData.labResultsFile) {
        setLabFile(userData.labResultsFile);
      }
    }
  }, [userData, form]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setLabFile(base64);
        form.setValue('labResultsFile', base64);
        setShowCamera(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка камеры',
        description: 'Не удалось получить доступ к камере.',
      });
      setShowCamera(false);
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
        const base64 = canvas.toDataURL('image/jpeg');
        setLabFile(base64);
        form.setValue('labResultsFile', base64);
        stopCamera();
      }
    }
  };

  async function onSubmit(values: ProfileValues) {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Firebase не подключен.',
      });
      return;
    }

    setLoading(true);
    try {
      await setDoc(doc(firestore, 'users', user.uid), {
        ...values,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      toast({
        title: 'Профиль обновлен',
        description: 'Ваши биометрические данные синхронизированы.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка сохранения',
        description: 'Не удалось обновить данные.',
      });
    } finally {
      setLoading(false);
    }
  }

  if (docLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Загрузка профиля...</p>
      </div>
    );
  }

  const inputClasses = "h-14 rounded-2xl bg-white border-muted shadow-sm font-bold px-6 focus:ring-2 focus:ring-primary/20 transition-all";
  const selectClasses = "h-14 rounded-2xl bg-white border-muted shadow-sm font-bold px-6 transition-all";

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
          <User className="h-6 w-6 md:h-8 md:w-8 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl md:text-5xl font-black tracking-tighter text-foreground leading-none">Bio-Профиль</h2>
          <p className="text-muted-foreground text-xs md:text-base font-medium">Ваши базовые метрики и цели.</p>
        </div>
      </div>

      <Card className="premium-card overflow-hidden border-none shadow-2xl bg-white/80 backdrop-blur-xl">
        <CardContent className="p-8 md:p-12">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
              {/* Основные данные */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b pb-4">
                  <User className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-black uppercase tracking-tight">Персональные данные</h3>
                </div>
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                  <FormField control={form.control} name="firstName" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Имя</FormLabel>
                      <FormControl><Input placeholder="Ваше имя" {...field} className={inputClasses} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="lastName" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Фамилия</FormLabel>
                      <FormControl><Input placeholder="Ваша фамилия" {...field} className={inputClasses} /></FormControl>
                    </FormItem>
                  )} />
                </div>
              </div>

              {/* Цели и Активность */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b pb-4">
                  <Target className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-black uppercase tracking-tight">Цели и Активность</h3>
                </div>
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                  <FormField control={form.control} name="healthGoal" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Основная цель</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className={selectClasses}><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="снизить массу тела">Снизить вес</SelectItem>
                          <SelectItem value="поддержать текущее состояние">Поддержание веса</SelectItem>
                          <SelectItem value="набор массы">Набор массы (Профицит)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="activityLevel" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Уровень активности</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className={selectClasses}><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="малоактивный">Малоактивный (Сидячий)</SelectItem>
                          <SelectItem value="среднеактивный">Среднеактивный (1-3 тренировки)</SelectItem>
                          <SelectItem value="средний">Средний (3-5 тренировок)</SelectItem>
                          <SelectItem value="активный">Активный (Ежедневно)</SelectItem>
                          <SelectItem value="перенагрузка">Профессиональный спорт</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                </div>
              </div>

              {/* Биометрия */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b pb-4">
                  <Activity className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-black uppercase tracking-tight">Биометрия</h3>
                </div>
                <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
                  <FormField control={form.control} name="gender" render={({ field }) => (
                    <FormItem className="col-span-2 lg:col-span-1">
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Пол</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className={selectClasses}><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="мужской">Мужской</SelectItem>
                          <SelectItem value="женский">Женский</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="age" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Возраст</FormLabel>
                      <FormControl><Input type="number" {...field} className={inputClasses} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="weight" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Вес (кг)</FormLabel>
                      <FormControl><Input type="number" {...field} className={inputClasses} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="height" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Рост (см)</FormLabel>
                      <FormControl><Input type="number" {...field} className={inputClasses} /></FormControl>
                    </FormItem>
                  )} />
                </div>
              </div>

              {/* Привычки */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b pb-4">
                  <Settings className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-black uppercase tracking-tight">Дополнительно</h3>
                </div>
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                  <FormField control={form.control} name="smoking" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Курение</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className={selectClasses}><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="да">Курю</SelectItem>
                          <SelectItem value="нет">Не курю</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="alcohol" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Алкоголь</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className={selectClasses}><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="не употребляю">Не употребляю</SelectItem>
                          <SelectItem value="редко">Редко</SelectItem>
                          <SelectItem value="умеренно">Умеренно</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full h-20 rounded-2xl text-2xl font-black bg-primary shadow-xl shadow-primary/20 transition-all hover:scale-[1.01]"
              >
                {loading ? <Loader2 className="animate-spin h-8 w-8" /> : <><Save className="mr-4 h-8 w-8" /> Сохранить профиль</>}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
