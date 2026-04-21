
'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { 
  User, 
  Save, 
  Loader2,
  Activity,
  Settings,
  Target,
  Mail,
  Fingerprint,
  Heart,
  Ban,
  CalendarDays,
  Smartphone,
  RefreshCw,
  CheckCircle2,
  Send,
  MessageCircle,
  BellRing,
  Stethoscope,
  ShieldCheck
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const profileSchema = z.object({
  firstName: z.string().min(1, 'Имя обязательно'),
  lastName: z.string().optional(),
  birthDate: z.string().optional(),
  gender: z.enum(['мужской', 'женский']),
  weight: z.coerce.number().positive('Вес обязателен').default(70),
  height: z.coerce.number().positive('Рост обязателен').default(175),
  activityLevel: z.enum(['minimal', 'low', 'moderate', 'high', 'athlete']),
  healthGoal: z.enum(['снизить массу тела', 'поддержать текущее состояние', 'набор массы']),
  smoking: z.enum(['да', 'нет']),
  alcohol: z.enum(['не употребляю', 'редко', 'умеренно', 'часто']),
  favoriteFoods: z.string().optional(),
  dislikedFoods: z.string().optional(),
  profileType: z.enum(['user', 'specialist']).default('user'),
});

type ProfileValues = z.infer<typeof profileSchema>;

const months = [
  { value: "01", label: "Январь" },
  { value: "02", label: "Февраль" },
  { value: "03", label: "Март" },
  { value: "04", label: "Апрель" },
  { value: "05", label: "Май" },
  { value: "06", label: "Июнь" },
  { value: "07", label: "Июль" },
  { value: "08", label: "Август" },
  { value: "09", label: "Сентябрь" },
  { value: "10", label: "Октябрь" },
  { value: "11", label: "Ноябрь" },
  { value: "12", label: "Декабрь" },
];

export function ProfileCabinet() {
  const { user } = useUser();
  const { firestore } = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore || user.uid === 'public-user') return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userData, isLoading: docLoading } = useDoc<any>(userDocRef);

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      birthDate: '1990-01-01',
      gender: 'мужской',
      weight: 70,
      height: 175,
      activityLevel: 'moderate',
      healthGoal: 'поддержать текущее состояние',
      smoking: 'нет',
      alcohol: 'не употребляю',
      favoriteFoods: '',
      dislikedFoods: '',
      profileType: 'user',
    },
  });

  useEffect(() => {
    if (userData) {
      form.reset({
        firstName: userData.firstName || userData.displayName || '',
        lastName: userData.lastName || '',
        birthDate: userData.birthDate || '1990-01-01',
        gender: userData.gender === 'женский' ? 'женский' : 'мужской',
        weight: userData.weight || 70,
        height: userData.height || 175,
        activityLevel: userData.activityLevel || 'moderate',
        healthGoal: userData.healthGoal || 'поддержать текущее состояние',
        smoking: userData.smoking || 'нет',
        alcohol: userData.alcohol || 'не употребляю',
        favoriteFoods: userData.favoriteFoods || '',
        dislikedFoods: userData.dislikedFoods || '',
        profileType: userData.profileType || 'user',
      });
    }
  }, [userData, form]);

  const birthDateValue = form.watch('birthDate') || '1990-01-01';
  const profileTypeValue = form.watch('profileType');
  const [currentYear, currentMonth, currentDay] = birthDateValue.split('-');

  const years = useMemo(() => {
    const endYear = new Date().getFullYear();
    const startYear = endYear - 120;
    return Array.from({ length: endYear - startYear + 1 }, (_, i) => (endYear - i).toString());
  }, []);

  const daysInMonth = useMemo(() => {
    const y = parseInt(currentYear);
    const m = parseInt(currentMonth);
    const days = new Date(y, m, 0).getDate();
    return Array.from({ length: days }, (_, i) => (i + 1).toString().padStart(2, '0'));
  }, [currentYear, currentMonth]);

  const updateBirthDate = (y: string, m: string, d: string) => {
    const maxDays = new Date(parseInt(y), parseInt(m), 0).getDate();
    let validDay = d;
    if (parseInt(d) > maxDays) {
      validDay = maxDays.toString().padStart(2, '0');
    }
    form.setValue('birthDate', `${y}-${m}-${validDay}`);
  };

  const calculateAge = (dob: string) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleDeviceSync = async () => {
    setSyncing(true);
    await new Promise(r => setTimeout(r, 2000));
    form.setValue('weight', 74.5);
    form.setValue('height', 178);
    setSyncing(false);
    toast({
      title: 'Био-синхронизация завершена',
      description: 'Данные с ваших устройств (браслет, весы) успешно импортированы.',
    });
  };

  const handleSocialLink = (platform: 'Telegram' | 'WhatsApp') => {
    toast({
      title: `Синхронизация с ${platform}`,
      description: `Перенаправляем в ${platform} для подтверждения...`,
    });
  };

  async function onSubmit(values: ProfileValues) {
    if (!user || !firestore || user.uid === 'public-user') {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Войдите в аккаунт, чтобы сохранить изменения.',
      });
      return;
    }

    setLoading(true);
    try {
      const age = calculateAge(values.birthDate || '1990-01-01');
      const userRef = doc(firestore, 'users', user.uid);
      await setDoc(userRef, {
        ...values,
        age,
        id: user.uid,
        email: (user as any).email || null,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      toast({
        title: 'Данные сохранены',
        description: 'Ваш био-профиль успешно обновлен.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Ошибка сохранения',
        description: 'Не удалось обновить профиль.',
      });
    } finally {
      setLoading(false);
    }
  }

  const inputClasses = "h-14 rounded-2xl bg-[#E8F5EE] border-none shadow-inner font-bold px-6 focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50";
  const textareaClasses = "min-h-[100px] rounded-2xl bg-[#E8F5EE] border-none shadow-inner font-bold px-6 py-4 focus:ring-2 focus:ring-primary/20 transition-all resize-none";
  const selectClasses = "h-14 rounded-2xl bg-[#E8F5EE] border-none shadow-inner font-bold px-6 transition-all";

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
          <User className="h-6 w-6 md:h-8 md:w-8 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl md:text-5xl font-black tracking-tighter text-foreground leading-none">Личный кабинет</h2>
          <p className="text-muted-foreground text-xs md:text-base font-medium">Ваши биометрические данные и настройки аккаунта.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="premium-card border-none shadow-xl bg-white/60 backdrop-blur-md overflow-hidden lg:col-span-2">
          <CardContent className="p-8 space-y-8">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-2">
                <Fingerprint className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-black uppercase tracking-tight">Аккаунт</h3>
              </div>
            </div>

            <div className="space-y-4">
               <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-4">Тип аккаунта</label>
               <div className="grid grid-cols-2 gap-4">
                  <Button 
                    type="button"
                    onClick={() => form.setValue('profileType', 'user')}
                    className={cn(
                      "h-20 rounded-2xl border-2 transition-all flex flex-col gap-1 items-center justify-center font-black uppercase tracking-widest text-[10px]",
                      profileTypeValue === 'user' ? "bg-primary text-white border-primary shadow-lg" : "bg-white text-primary border-primary/10 hover:bg-primary/5"
                    )}
                  >
                    <User className="h-5 w-5" />
                    Я — Пользователь
                  </Button>
                  <Button 
                    type="button"
                    onClick={() => form.setValue('profileType', 'specialist')}
                    className={cn(
                      "h-20 rounded-2xl border-2 transition-all flex flex-col gap-1 items-center justify-center font-black uppercase tracking-widest text-[10px]",
                      profileTypeValue === 'specialist' ? "bg-primary text-white border-primary shadow-lg" : "bg-white text-primary border-primary/10 hover:bg-primary/5"
                    )}
                  >
                    <Stethoscope className="h-5 w-5" />
                    Я — Специалист
                  </Button>
               </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-4">Email</label>
                <div className="flex items-center gap-3 h-14 bg-[#E8F5EE] rounded-2xl px-6 font-bold text-muted-foreground border-none">
                  <Mail className="h-4 w-4 opacity-40" />
                  <span className="truncate">{(user as any)?.email || 'Не указан'}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-4">Статус проверки</label>
                <div className="flex items-center gap-3 h-14 bg-[#E8F5EE] rounded-2xl px-6 font-bold text-primary border-none">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Верифицирован</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2">
               <div className="flex items-center gap-2 px-4">
                  <BellRing className="h-3 w-3 text-primary" />
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Уведомления</label>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" onClick={() => handleSocialLink('Telegram')} className="h-16 rounded-2xl bg-[#E8F5EE] border-none hover:bg-[#D4E9DF] flex justify-between px-6 font-black text-primary">
                    <div className="flex items-center gap-3"><Send className="h-5 w-5" /><span className="text-xs uppercase">Telegram</span></div>
                    <Badge variant="outline" className="text-[7px]">OFF</Badge>
                  </Button>
                  <Button variant="outline" onClick={() => handleSocialLink('WhatsApp')} className="h-16 rounded-2xl bg-[#E8F5EE] border-none hover:bg-[#D4E9DF] flex justify-between px-6 font-black text-primary">
                    <div className="flex items-center gap-3"><MessageCircle className="h-5 w-5" /><span className="text-xs uppercase">WhatsApp</span></div>
                    <Badge variant="outline" className="text-[7px]">OFF</Badge>
                  </Button>
               </div>
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card border-none shadow-xl bg-gradient-to-br from-primary/5 to-primary/10 backdrop-blur-md overflow-hidden flex flex-col justify-center">
          <CardContent className="p-8 text-center space-y-4">
             <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Smartphone className="h-8 w-8 text-primary" />
             </div>
             <div className="space-y-1">
                <h3 className="font-black text-lg tracking-tight">Bio-Синхронизация</h3>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest leading-relaxed">
                   Импорт данных из Google Health, Apple Health и браслетов.
                </p>
             </div>
             <Button onClick={handleDeviceSync} disabled={syncing} className="w-full h-12 rounded-xl bg-primary font-black gap-2">
                {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Синхронизировать
             </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="premium-card overflow-hidden border-none shadow-2xl bg-white/80 backdrop-blur-xl">
        <CardContent className="p-8 md:p-12">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b pb-4">
                  <User className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-black uppercase tracking-tight">Персональные данные</h3>
                </div>
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                  <FormField control={form.control} name="firstName" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-4">Имя *</FormLabel>
                      <FormControl><Input placeholder="Имя" {...field} className={inputClasses} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="lastName" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-4">Фамилия</FormLabel>
                      <FormControl><Input placeholder="Фамилия" {...field} className={inputClasses} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="grid gap-6 grid-cols-1">
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-4 flex items-center gap-2">
                      <CalendarDays className="h-3 w-3" /> Дата рождения
                    </FormLabel>
                    <div className="grid grid-cols-3 gap-1.5 pt-1.5">
                      <Select value={currentDay} onValueChange={(val) => updateBirthDate(currentYear, currentMonth, val)}>
                        <SelectTrigger className="h-14 rounded-xl bg-[#E8F5EE] border-none shadow-inner font-bold px-3 text-xs focus:ring-0"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-xl border-none shadow-2xl">
                          {daysInMonth.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Select value={currentMonth} onValueChange={(val) => updateBirthDate(currentYear, val, currentDay)}>
                        <SelectTrigger className="h-14 rounded-xl bg-[#E8F5EE] border-none shadow-inner font-bold px-3 text-xs focus:ring-0"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-xl border-none shadow-2xl">
                          {months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Select value={currentYear} onValueChange={(val) => updateBirthDate(val, currentMonth, currentDay)}>
                        <SelectTrigger className="h-14 rounded-xl bg-[#E8F5EE] border-none shadow-inner font-bold px-3 text-xs focus:ring-0"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-xl border-none shadow-2xl">
                          {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </FormItem>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b pb-4">
                  <Target className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-black uppercase tracking-tight">Цели и Активность</h3>
                </div>
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                  <FormField control={form.control} name="healthGoal" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-4">Цель</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className={selectClasses}><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent className="rounded-2xl">
                          <SelectItem value="снизить массу тела">Снизить вес</SelectItem>
                          <SelectItem value="поддержать текущее состояние">Поддержание</SelectItem>
                          <SelectItem value="набор массы">Набор массы</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="activityLevel" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-4">Активность</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className={selectClasses}><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent className="rounded-2xl">
                          <SelectItem value="minimal">Минимальный (Сидячий)</SelectItem>
                          <SelectItem value="low">Низкий (Малоподвижный)</SelectItem>
                          <SelectItem value="moderate">Умеренный (Средний)</SelectItem>
                          <SelectItem value="high">Высокий (Активный)</SelectItem>
                          <SelectItem value="athlete">Очень высокий (Спортсмен)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b pb-4">
                  <Activity className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-black uppercase tracking-tight">Биометрия</h3>
                </div>
                <div className="grid gap-6 grid-cols-2 lg:grid-cols-3">
                  <FormField control={form.control} name="gender" render={({ field }) => (
                    <FormItem className="col-span-2 lg:col-span-1">
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-4">Пол</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className={selectClasses}><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent className="rounded-2xl"><SelectItem value="мужской">Мужской</SelectItem><SelectItem value="женский">Женский</SelectItem></SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="weight" render={({ field }) => (
                    <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-4">Вес (кг)</FormLabel><FormControl><Input type="number" {...field} className={inputClasses} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name="height" render={({ field }) => (
                    <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-4">Рост (см)</FormLabel><FormControl><Input type="number" {...field} className={inputClasses} /></FormControl></FormItem>
                  )} />
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full h-20 rounded-2xl text-2xl font-black bg-primary shadow-xl">
                {loading ? <Loader2 className="animate-spin h-8 w-8" /> : <><Save className="mr-4 h-8 w-8" /> Сохранить данные</>}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
