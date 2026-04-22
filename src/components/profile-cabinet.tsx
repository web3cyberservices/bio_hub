
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
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
  ImageIcon,
  Upload,
  X,
  Target,
  Zap,
  Wine,
  Ban,
  Heart,
  Utensils
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

const profileSchema = z.object({
  firstName: z.string().min(1, 'Имя обязательно'),
  lastName: z.string().optional(),
  birthDate: z.string().optional(),
  photoUrl: z.string().optional(),
  gender: z.enum(['мужской', 'женский']).default('мужской'),
  weight: z.coerce.number().optional().default(0),
  height: z.coerce.number().optional().default(0),
  activityLevel: z.enum(['minimal', 'low', 'moderate', 'high', 'athlete']).default('moderate'),
  healthGoal: z.enum(['снизить массу тела', 'поддержать текущее состояние', 'набор массы']).default('поддержать текущее состояние'),
  smoking: z.enum(['да', 'нет']).default('нет'),
  alcohol: z.enum(['не употребляю', 'редко', 'умеренно', 'часто']).default('не употребляю'),
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const normalizeActivity = (val: string): any => {
    const map: Record<string, string> = {
      'минимальный': 'minimal', 'сидячий': 'minimal', 'низкий': 'low', 'малоактивный': 'low',
      'умеренный': 'moderate', 'средний': 'moderate', 'высокий': 'high', 'активный': 'high',
      'атлет': 'athlete', 'спортсмен': 'athlete'
    };
    if (!val) return 'moderate';
    const lower = val.toLowerCase();
    return map[lower] || (['minimal', 'low', 'moderate', 'high', 'athlete'].includes(lower) ? lower : 'moderate');
  };

  useEffect(() => {
    if (userData) {
      form.reset({
        firstName: userData.firstName || userData.displayName || '',
        lastName: userData.lastName || '',
        birthDate: userData.birthDate || '1990-01-01',
        photoUrl: userData.photoUrl || '',
        gender: userData.gender || 'мужской',
        weight: userData.weight || 0,
        height: userData.height || 0,
        activityLevel: normalizeActivity(userData.activityLevel),
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        toast({ variant: 'destructive', title: 'Файл слишком большой', description: 'Максимум 1 МБ.' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => form.setValue('photoUrl', reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    form.setValue('photoUrl', '');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

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

  const onSubmit = async (values: ProfileValues) => {
    if (!user || !firestore || user.uid === 'public-user') return;
    setLoading(true);
    const userRef = doc(firestore, 'users', user.uid);
    const dataToSave = { ...values, id: user.uid, email: (user as any).email || null, updatedAt: new Date().toISOString() };

    setDoc(userRef, dataToSave, { merge: true })
      .then(() => {
        setLoading(false);
        toast({ title: 'Данные сохранены', description: 'Ваш био-профиль успешно обновлен.' });
      })
      .catch((error) => {
        setLoading(false);
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: userRef.path, operation: 'update', requestResourceData: dataToSave }));
      });
  };

  const inputClasses = "h-14 rounded-2xl bg-[#E8F5EE] border-none shadow-inner font-bold px-6 focus:ring-2 focus:ring-primary/20 transition-all";
  const textareaClasses = "min-h-[120px] rounded-2xl bg-[#E8F5EE] border-none shadow-inner font-bold px-6 py-4 focus:ring-2 focus:ring-primary/20 transition-all resize-none";
  const selectClasses = "h-14 rounded-2xl bg-[#E8F5EE] border-none shadow-inner font-bold px-6 transition-all";

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-primary/20">
          {photoUrlValue ? (
            <div className="relative w-full h-full"><Image src={photoUrlValue} alt="Profile" fill className="object-cover" unoptimized /></div>
          ) : (
            <User className="h-6 w-6 md:h-8 md:w-8 text-primary" />
          )}
        </div>
        <div>
          <h2 className="text-2xl md:text-5xl font-black tracking-tighter text-foreground leading-none">Личный кабинет</h2>
          <p className="text-muted-foreground text-xs md:text-base font-medium">Управление вашим био-аккаунтом.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
          {/* Section 1: Account Type */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="premium-card border-none shadow-xl bg-white/60 backdrop-blur-md overflow-hidden lg:col-span-2">
              <CardContent className="p-8 space-y-8">
                <div className="flex items-center gap-2 border-b pb-4"><Fingerprint className="h-5 w-5 text-primary" /><h3 className="text-lg font-black uppercase tracking-tight">Тип аккаунта</h3></div>
                <div className="grid grid-cols-2 gap-4">
                  <Button type="button" onClick={() => form.setValue('profileType', 'user')} className={cn("h-20 rounded-2xl border-2 transition-all flex flex-col gap-1 items-center justify-center font-black uppercase tracking-widest text-[10px]", profileTypeValue === 'user' ? "bg-primary text-white border-primary shadow-lg" : "bg-white text-primary border-primary/10 hover:bg-primary/5")}><User className="h-5 w-5" /> Пользователь</Button>
                  <Button type="button" onClick={() => form.setValue('profileType', 'specialist')} className={cn("h-20 rounded-2xl border-2 transition-all flex flex-col gap-1 items-center justify-center font-black uppercase tracking-widest text-[10px]", profileTypeValue === 'specialist' ? "bg-primary text-white border-primary shadow-lg" : "bg-white text-primary border-primary/10 hover:bg-primary/5")}><Stethoscope className="h-5 w-5" /> Специалист</Button>
                </div>
              </CardContent>
            </Card>

            {profileTypeValue === 'user' && (
              <Card className="premium-card border-none shadow-xl bg-gradient-to-br from-primary/5 to-primary/10 backdrop-blur-md overflow-hidden flex flex-col justify-center">
                <CardContent className="p-8 text-center space-y-4">
                   <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2"><Smartphone className="h-8 w-8 text-primary" /></div>
                   <h3 className="font-black text-lg tracking-tight">Bio-Sync</h3>
                   <Button type="button" onClick={() => toast({ title: 'Синхронизация запущена' })} className="w-full h-12 rounded-xl bg-primary font-black">Синхронизировать данные</Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Section 2: Personal Data (Moved Up) */}
          <Card className="premium-card overflow-hidden border-none shadow-2xl bg-white/80 backdrop-blur-xl">
            <CardContent className="p-8 md:p-12 space-y-8">
              <div className="flex items-center gap-2 border-b pb-4"><User className="h-5 w-5 text-primary" /><h3 className="text-lg font-black uppercase tracking-tight">Персональные данные</h3></div>
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
                    <SelectTrigger className="h-14 rounded-2xl bg-[#E8F5EE] border-none font-bold px-6 focus:ring-0"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-2xl">{daysInMonth.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={currentMonth} onValueChange={(val) => updateBirthDate(currentYear, val, currentDay)}>
                    <SelectTrigger className="h-14 rounded-2xl bg-[#E8F5EE] border-none font-bold px-6 focus:ring-0"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-2xl">{months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={currentYear} onValueChange={(val) => updateBirthDate(val, currentMonth, currentDay)}>
                    <SelectTrigger className="h-14 rounded-2xl bg-[#E8F5EE] border-none font-bold px-6 focus:ring-0"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-2xl">{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </FormItem>
            </CardContent>
          </Card>

          {/* Section 3: Photo Profile */}
          <Card className="premium-card overflow-hidden border-none shadow-2xl bg-white/80 backdrop-blur-xl">
            <CardContent className="p-8 md:p-12 space-y-6">
                <div className="flex items-center gap-2 border-b pb-4"><ImageIcon className="h-5 w-5 text-primary" /><h3 className="text-lg font-black uppercase tracking-tight">Фото профиля</h3></div>
                <div className="flex flex-col md:flex-row gap-8 items-center">
                   <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-primary/5 border-4 border-white shadow-xl flex items-center justify-center shrink-0 overflow-hidden group">
                      {photoUrlValue ? (
                        <><Image src={photoUrlValue} alt="Preview" fill className="object-cover" unoptimized /><Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10" onClick={removePhoto}><X className="h-4 w-4" /></Button></>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-primary/30"><Camera className="h-10 w-10" /><span className="text-[8px] font-black uppercase">Нет фото</span></div>
                      )}
                   </div>
                   <div className="flex-1 w-full space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button type="button" variant="outline" className="h-14 rounded-2xl border-dashed border-2 border-primary/20 bg-primary/5 text-primary font-black uppercase tracking-widest text-[10px] gap-3 hover:bg-primary/10 transition-all" onClick={() => fileInputRef.current?.click()}><Upload className="h-4 w-4" /> Выбрать файл</Button>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                        <p className="text-[10px] text-muted-foreground font-medium italic md:col-span-2">Квадратное фото до 1 МБ.</p>
                      </div>
                   </div>
                </div>
            </CardContent>
          </Card>

          {/* Section 4: Role-Specific Bio / Metrics */}
          <Card className="premium-card overflow-hidden border-none shadow-2xl bg-white/80 backdrop-blur-xl">
            <CardContent className="p-8 md:p-12 space-y-12">
              {profileTypeValue === 'specialist' ? (
                <div className="space-y-10 animate-in slide-in-from-top-4 duration-500">
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 border-b pb-4"><Briefcase className="h-5 w-5 text-primary" /><h3 className="text-lg font-black uppercase tracking-tight">Профессиональные данные</h3></div>
                    <div className="grid gap-6">
                      <FormField control={form.control} name="specialization" render={({ field }) => (
                        <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-4">Специализация</FormLabel><FormControl><Input placeholder="Например: Нутрициолог..." {...field} className={inputClasses} /></FormControl></FormItem>
                      )} />
                      <FormField control={form.control} name="bio" render={({ field }) => (
                        <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-4">О себе</FormLabel><FormControl><Textarea placeholder="Ваш опыт..." {...field} className={textareaClasses} /></FormControl></FormItem>
                      )} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-12 animate-in slide-in-from-top-4 duration-500">
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 border-b pb-4"><Target className="h-5 w-5 text-primary" /><h3 className="text-lg font-black uppercase tracking-tight">Цели и Активность</h3></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="healthGoal" render={({ field }) => (
                        <FormItem><FormLabel className="text-[10px] font-black uppercase text-muted-foreground px-4">Основная цель</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className={selectClasses}><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent className="rounded-2xl"><SelectItem value="снизить массу тела">Снизить вес</SelectItem><SelectItem value="поддержать текущее состояние">Поддержать форму</SelectItem><SelectItem value="набор массы">Набор массы</SelectItem></SelectContent></Select>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="activityLevel" render={({ field }) => (
                        <FormItem><FormLabel className="text-[10px] font-black uppercase text-muted-foreground px-4">Уровень активности</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className={selectClasses}><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent className="rounded-2xl"><SelectItem value="minimal">Минимальный (Сидячий)</SelectItem><SelectItem value="low">Низкий (Малоактивный)</SelectItem><SelectItem value="moderate">Умеренный (Средний)</SelectItem><SelectItem value="high">Высокий (Активный)</SelectItem><SelectItem value="athlete">Атлет (Спортсмен)</SelectItem></SelectContent></Select>
                        </FormItem>
                      )} />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-2 border-b pb-4"><Activity className="h-5 w-5 text-primary" /><h3 className="text-lg font-black uppercase tracking-tight">Биометрия и Привычки</h3></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="smoking" render={({ field }) => (
                        <FormItem><FormLabel className="text-[10px] font-black uppercase text-muted-foreground px-4 flex items-center gap-2"><Ban className="h-3 w-3" /> Курение</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className={selectClasses}><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent className="rounded-2xl"><SelectItem value="нет">Не курю</SelectItem><SelectItem value="да">Курю</SelectItem></SelectContent></Select>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="alcohol" render={({ field }) => (
                        <FormItem><FormLabel className="text-[10px] font-black uppercase text-muted-foreground px-4 flex items-center gap-2"><Wine className="h-3 w-3" /> Алкоголь</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className={selectClasses}><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent className="rounded-2xl"><SelectItem value="не употребляю">Не употребляю</SelectItem><SelectItem value="редко">Редко</SelectItem><SelectItem value="умеренно">Умеренно</SelectItem><SelectItem value="часто">Часто</SelectItem></SelectContent></Select>
                        </FormItem>
                      )} />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-2 border-b pb-4"><Utensils className="h-5 w-5 text-primary" /><h3 className="text-lg font-black uppercase tracking-tight">Пищевые предпочтения</h3></div>
                    <div className="grid gap-6">
                      <FormField control={form.control} name="favoriteFoods" render={({ field }) => (
                        <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-4">Любимые блюда / ингредиенты</FormLabel><FormControl><Textarea placeholder="Например: Авокадо, лосось, орехи..." {...field} className={textareaClasses} /></FormControl></FormItem>
                      )} />
                      <FormField control={form.control} name="dislikedFoods" render={({ field }) => (
                        <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-4">Исключить из рациона</FormLabel><FormControl><Textarea placeholder="Например: Молоко, лук, кинза..." {...field} className={textareaClasses} /></FormControl></FormItem>
                      )} />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Button type="submit" disabled={loading} className="w-full h-20 rounded-2xl text-2xl font-black bg-primary shadow-xl">
            {loading ? <Loader2 className="animate-spin h-8 w-8" /> : <><Save className="mr-4 h-8 w-8" /> Сохранить профиль</>}
          </Button>
          
          <Card className="premium-card p-8 border-none shadow-xl bg-white/60">
            <div className="flex items-center gap-2 border-b pb-4 mb-6"><BellRing className="h-5 w-5 text-primary" /><h3 className="text-lg font-black uppercase tracking-tight">Уведомления</h3></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" type="button" onClick={() => toast({ title: 'Telegram привязан' })} className="h-16 rounded-2xl bg-[#E8F5EE] border-none flex justify-between px-6 font-black text-primary hover:bg-[#D9EDE3]"><div className="flex items-center gap-3"><Send className="h-5 w-5" /><span className="text-xs uppercase">Telegram</span></div><Badge variant="outline" className="text-[7px] border-primary/20">Подключить</Badge></Button>
              <Button variant="outline" type="button" onClick={() => toast({ title: 'WhatsApp привязан' })} className="h-16 rounded-2xl bg-[#E8F5EE] border-none flex justify-between px-6 font-black text-primary hover:bg-[#D9EDE3]"><div className="flex items-center gap-3"><MessageCircle className="h-5 w-5" /><span className="text-xs uppercase">WhatsApp</span></div><Badge variant="outline" className="text-[7px] border-primary/20">Подключить</Badge></Button>
            </div>
          </Card>
        </form>
      </Form>
    </div>
  );
}
