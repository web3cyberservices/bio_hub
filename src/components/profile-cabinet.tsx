
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
  Fingerprint,
  CalendarDays,
  Smartphone,
  Send,
  MessageCircle,
  BellRing,
  Stethoscope,
  Briefcase,
  Camera,
  Image as ImageIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

const profileSchema = z.object({
  firstName: z.string().min(1, 'Имя обязательно'),
  lastName: z.string().optional(),
  birthDate: z.string().optional(),
  photoUrl: z.string().optional(),
  gender: z.enum(['мужской', 'женский']),
  weight: z.coerce.number().default(0),
  height: z.coerce.number().default(0),
  activityLevel: z.enum(['minimal', 'low', 'moderate', 'high', 'athlete']),
  healthGoal: z.enum(['снизить массу тела', 'поддержать текущее состояние', 'набор массы']),
  smoking: z.enum(['да', 'нет']),
  alcohol: z.enum(['не употребляю', 'редко', 'умеренно', 'часто']),
  favoriteFoods: z.string().optional(),
  dislikedFoods: z.string().optional(),
  profileType: z.enum(['user', 'specialist']).default('user'),
  specialization: z.string().optional(),
  bio: z.string().optional(),
});

type ProfileValues = z.infer<typeof profileSchema>;

const months = [
  { value: "01", label: "Январь" }, { value: "02", label: "Февраль" }, { value: "03", label: "Март" },
  { value: "04", label: "Апрель" }, { value: "05", label: "Май" }, { value: "06", label: "Июнь" },
  { value: "07", label: "Июль" }, { value: "08", label: "Август" }, { value: "09", label: "Сентябрь" },
  { value: "10", label: "Октябрь" }, { value: "11", label: "Ноябрь" }, { value: "12", label: "Декабрь" },
];

export function ProfileCabinet() {
  const { user } = useUser();
  const { firestore } = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore || user.uid === 'public-user') return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userData } = useDoc<any>(userDocRef);

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      birthDate: '1990-01-01',
      photoUrl: '',
      gender: 'мужской',
      weight: 0,
      height: 0,
      activityLevel: 'moderate',
      healthGoal: 'поддержать текущее состояние',
      smoking: 'нет',
      alcohol: 'не употребляю',
      favoriteFoods: '',
      dislikedFoods: '',
      profileType: 'user',
      specialization: '',
      bio: '',
    },
  });

  useEffect(() => {
    if (userData) {
      form.reset({
        firstName: userData.firstName || userData.displayName || '',
        lastName: userData.lastName || '',
        birthDate: userData.birthDate || '1990-01-01',
        photoUrl: userData.photoUrl || '',
        gender: userData.gender === 'женский' ? 'женский' : 'мужской',
        weight: userData.weight || 0,
        height: userData.height || 0,
        activityLevel: userData.activityLevel || 'moderate',
        healthGoal: userData.healthGoal || 'поддержать текущее состояние',
        smoking: userData.smoking || 'нет',
        alcohol: userData.alcohol || 'не употребляю',
        favoriteFoods: userData.favoriteFoods || '',
        dislikedFoods: userData.dislikedFoods || '',
        profileType: userData.profileType || 'user',
        specialization: userData.specialization || '',
        bio: userData.bio || '',
      });
    }
  }, [userData, form]);

  const profileTypeValue = form.watch('profileType');
  const photoUrlValue = form.watch('photoUrl');
  const birthDateValue = form.watch('birthDate') || '1990-01-01';
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
    if (parseInt(d) > maxDays) validDay = maxDays.toString().padStart(2, '0');
    form.setValue('birthDate', `${y}-${m}-${validDay}`);
  };

  const calculateAge = (dob: string) => {
    if (!dob) return 0;
    const today = new Date();
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return 0;
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  async function onSubmit(values: ProfileValues) {
    if (!user || !firestore || user.uid === 'public-user') return;
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
      toast({ title: 'Данные сохранены', description: 'Ваш био-профиль успешно обновлен.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Ошибка сохранения' });
    } finally {
      setLoading(false);
    }
  }

  const inputClasses = "h-14 rounded-2xl bg-[#E8F5EE] border-none shadow-inner font-bold px-6 focus:ring-2 focus:ring-primary/20 transition-all";
  const textareaClasses = "min-h-[120px] rounded-2xl bg-[#E8F5EE] border-none shadow-inner font-bold px-6 py-4 focus:ring-2 focus:ring-primary/20 transition-all resize-none";
  const selectClasses = "h-14 rounded-2xl bg-[#E8F5EE] border-none shadow-inner font-bold px-6 transition-all";

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-primary/20">
          {photoUrlValue ? (
            <Image src={photoUrlValue} alt="Profile" width={64} height={64} className="object-cover w-full h-full" />
          ) : (
            <User className="h-6 w-6 md:h-8 md:w-8 text-primary" />
          )}
        </div>
        <div>
          <h2 className="text-2xl md:text-5xl font-black tracking-tighter text-foreground leading-none">Личный кабинет</h2>
          <p className="text-muted-foreground text-xs md:text-base font-medium">Управление вашим био-аккаунтом.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="premium-card border-none shadow-xl bg-white/60 backdrop-blur-md overflow-hidden lg:col-span-2">
          <CardContent className="p-8 space-y-8">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-2">
                <Fingerprint className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-black uppercase tracking-tight">Тип аккаунта</h3>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button 
                type="button"
                onClick={() => form.setValue('profileType', 'user')}
                className={cn(
                  "h-20 rounded-2xl border-2 transition-all flex flex-col gap-1 items-center justify-center font-black uppercase tracking-widest text-[10px]",
                  profileTypeValue === 'user' ? "bg-primary text-white border-primary shadow-lg" : "bg-white text-primary border-primary/10 hover:bg-primary/5"
                )}
              >
                <User className="h-5 w-5" /> Пользователь
              </Button>
              <Button 
                type="button"
                onClick={() => form.setValue('profileType', 'specialist')}
                className={cn(
                  "h-20 rounded-2xl border-2 transition-all flex flex-col gap-1 items-center justify-center font-black uppercase tracking-widest text-[10px]",
                  profileTypeValue === 'specialist' ? "bg-primary text-white border-primary shadow-lg" : "bg-white text-primary border-primary/10 hover:bg-primary/5"
                )}
              >
                <Stethoscope className="h-5 w-5" /> Специалист
              </Button>
            </div>
          </CardContent>
        </Card>

        {profileTypeValue === 'user' && (
          <Card className="premium-card border-none shadow-xl bg-gradient-to-br from-primary/5 to-primary/10 backdrop-blur-md overflow-hidden flex flex-col justify-center">
            <CardContent className="p-8 text-center space-y-4">
               <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2"><Smartphone className="h-8 w-8 text-primary" /></div>
               <h3 className="font-black text-lg tracking-tight">Bio-Sync</h3>
               <Button onClick={() => toast({ title: 'Синхронизация запущена' })} className="w-full h-12 rounded-xl bg-primary font-black">Синхронизировать</Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="premium-card overflow-hidden border-none shadow-2xl bg-white/80 backdrop-blur-xl">
        <CardContent className="p-8 md:p-12">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b pb-4">
                   <ImageIcon className="h-5 w-5 text-primary" />
                   <h3 className="text-lg font-black uppercase tracking-tight">Фото профиля</h3>
                </div>
                <div className="flex flex-col md:flex-row gap-6 items-center">
                   <div className="w-32 h-32 rounded-[2rem] bg-primary/5 border-2 border-dashed border-primary/20 flex items-center justify-center shrink-0 overflow-hidden">
                      {photoUrlValue ? (
                        <Image src={photoUrlValue} alt="Preview" width={128} height={128} className="object-cover w-full h-full" />
                      ) : (
                        <Camera className="h-10 w-10 text-primary/20" />
                      )}
                   </div>
                   <div className="flex-1 w-full space-y-2">
                      <FormField control={form.control} name="photoUrl" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-4">Ссылка на фото (URL)</FormLabel>
                          <FormControl><Input placeholder="https://..." {...field} className={inputClasses} /></FormControl>
                          <p className="text-[9px] text-muted-foreground px-4 italic">Загрузите фото на любой хостинг и вставьте ссылку сюда.</p>
                        </FormItem>
                      )} />
                   </div>
                </div>
              </div>

              {profileTypeValue === 'specialist' && (
                <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
                  <div className="flex items-center gap-2 border-b pb-4">
                    <Briefcase className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-black uppercase tracking-tight">Профессиональные данные</h3>
                  </div>
                  <div className="grid gap-6">
                    <FormField control={form.control} name="specialization" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-4">Специализация (например: Спортивный врач)</FormLabel>
                        <FormControl><Input placeholder="Ваша роль..." {...field} className={inputClasses} /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="bio" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-4">О себе</FormLabel>
                        <FormControl><Textarea placeholder="Расскажите о своем опыте..." {...field} className={textareaClasses} /></FormControl>
                      </FormItem>
                    )} />
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b pb-4">
                  <User className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-black uppercase tracking-tight">Персональные данные</h3>
                </div>
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                  <FormField control={form.control} name="firstName" render={({ field }) => (
                    <FormItem><FormLabel className="text-[10px] font-black uppercase text-muted-foreground px-4">Имя *</FormLabel><FormControl><Input {...field} className={inputClasses} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name="lastName" render={({ field }) => (
                    <FormItem><FormLabel className="text-[10px] font-black uppercase text-muted-foreground px-4">Фамилия</FormLabel><FormControl><Input {...field} className={inputClasses} /></FormControl></FormItem>
                  )} />
                </div>
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-4 flex items-center gap-2"><CalendarDays className="h-3 w-3" /> Дата рождения</FormLabel>
                  <div className="grid grid-cols-3 gap-3 pt-1.5">
                    <Select value={currentDay} onValueChange={(val) => updateBirthDate(currentYear, currentMonth, val)}>
                      <SelectTrigger className="h-14 rounded-2xl bg-[#E8F5EE] border-none font-bold px-6"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-2xl">{daysInMonth.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={currentMonth} onValueChange={(val) => updateBirthDate(currentYear, val, currentDay)}>
                      <SelectTrigger className="h-14 rounded-2xl bg-[#E8F5EE] border-none font-bold px-6"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-2xl">{months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={currentYear} onValueChange={(val) => updateBirthDate(val, currentMonth, currentDay)}>
                      <SelectTrigger className="h-14 rounded-2xl bg-[#E8F5EE] border-none font-bold px-6"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-2xl">{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </FormItem>
              </div>

              {profileTypeValue === 'user' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b pb-4"><Activity className="h-5 w-5 text-primary" /><h3 className="text-lg font-black uppercase tracking-tight">Биометрия</h3></div>
                  <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
                    <FormField control={form.control} name="gender" render={({ field }) => (
                      <FormItem><FormLabel className="text-[10px] font-black uppercase text-muted-foreground px-4">Пол</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className={selectClasses}><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent className="rounded-2xl"><SelectItem value="мужской">Мужской</SelectItem><SelectItem value="женский">Женский</SelectItem></SelectContent></Select>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="weight" render={({ field }) => (
                      <FormItem><FormLabel className="text-[10px] font-black uppercase text-muted-foreground px-4">Вес (кг)</FormLabel><FormControl><Input type="number" {...field} className={inputClasses} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="height" render={({ field }) => (
                      <FormItem><FormLabel className="text-[10px] font-black uppercase text-muted-foreground px-4">Рост (см)</FormLabel><FormControl><Input type="number" {...field} className={inputClasses} /></FormControl></FormItem>
                    )} />
                  </div>
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full h-20 rounded-2xl text-2xl font-black bg-primary shadow-xl">
                {loading ? <Loader2 className="animate-spin h-8 w-8" /> : <><Save className="mr-4 h-8 w-8" /> Сохранить данные</>}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card className="premium-card p-8 border-none shadow-xl bg-white/60">
        <div className="flex items-center gap-2 border-b pb-4 mb-6"><BellRing className="h-5 w-5 text-primary" /><h3 className="text-lg font-black uppercase tracking-tight">Уведомления</h3></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button variant="outline" className="h-16 rounded-2xl bg-[#E8F5EE] border-none flex justify-between px-6 font-black text-primary hover:bg-[#D9EDE3]">
            <div className="flex items-center gap-3"><Send className="h-5 w-5" /><span className="text-xs uppercase">Telegram</span></div>
            <Badge variant="outline" className="text-[7px]">Привязать</Badge>
          </Button>
          <Button variant="outline" className="h-16 rounded-2xl bg-[#E8F5EE] border-none flex justify-between px-6 font-black text-primary hover:bg-[#D9EDE3]">
            <div className="flex items-center gap-3"><MessageCircle className="h-5 w-5" /><span className="text-xs uppercase">WhatsApp</span></div>
            <Badge variant="outline" className="text-[7px]">Привязать</Badge>
          </Button>
        </div>
      </Card>
    </div>
  );
}
