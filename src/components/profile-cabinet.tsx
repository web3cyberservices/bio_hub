
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
  Utensils,
  Mic,
  FileText,
  History,
  ExternalLink,
  Instagram
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { AnalysisHistoryDialog } from './analysis-history-dialog';

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
  instagramUrl: z.string().optional(),
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
  const [recordingField, setRecordingField] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
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
      instagramUrl: '',
    },
  });

  const handleConnectTelegram = () => {
    if (!user) return;
    const botUsername = 'ProSebyaBot'; 
    const link = `https://t.me/${botUsername}?start=${user.uid}`;
    window.open(link, '_blank');
    toast({ title: 'Telegram', description: 'Открываем диалог с ботом для связки аккаунта.' });
  };

  const startVoiceInput = (fieldName: keyof ProfileValues) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Браузер не поддерживает голосовой ввод.' });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ru-RU';
    recognition.onstart = () => setRecordingField(fieldName);
    recognition.onend = () => setRecordingField(null);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const currentVal = form.getValues(fieldName as any);
      form.setValue(fieldName as any, (currentVal ? currentVal + ' ' : '') + transcript);
      toast({ title: 'Голос распознан' });
    };
    recognition.start();
  };

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
        instagramUrl: userData.instagramUrl || '',
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
    if (!user || !firestore) return;
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

  const inputClasses = "h-14 rounded-2xl bg-primary/20 backdrop-blur-md border border-primary/30 shadow-[0_0_15px_rgba(14,165,233,0.1)] font-bold px-6 focus:ring-4 focus:ring-primary/10 transition-all pr-14 text-white placeholder:text-white/40";
  const textareaClasses = "min-h-[120px] rounded-2xl bg-primary/20 backdrop-blur-md border border-primary/30 shadow-[0_0_15px_rgba(14,165,233,0.1)] font-bold px-6 py-4 focus:ring-4 focus:ring-primary/10 transition-all resize-none pr-14 text-white placeholder:text-white/40";
  const selectClasses = "h-14 rounded-2xl bg-primary/20 backdrop-blur-md border border-primary/30 shadow-[0_0_15px_rgba(14,165,233,0.1)] font-bold px-6 transition-all text-white";

  const VoiceBtn = ({ field }: { field: keyof ProfileValues }) => (
    <Button 
      type="button" 
      variant="ghost" 
      size="icon" 
      onClick={() => startVoiceInput(field)}
      className={cn(
        "absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full shadow-sm transition-all",
        recordingField === field ? "bg-red-500 text-white animate-pulse" : "bg-white/10 text-primary hover:bg-white/20"
      )}
    >
      <Mic className="h-4 w-4" />
    </Button>
  );

  return (
    <div className="max-w-5xl mx-auto flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-primary/20">
          {photoUrlValue ? (
            <div className="relative w-full h-full"><Image src={photoUrlValue} alt="Profile" fill className="object-cover" unoptimized /></div>
          ) : (
            <User className="h-6 w-6 md:h-8 md:w-8 text-primary" />
          )}
        </div>
        <div>
          <h2 className="text-xl md:text-5xl font-black tracking-tighter text-white font-headline leading-none uppercase">Личный кабинет</h2>
          <p className="text-white/50 text-[10px] md:text-base font-medium">Управление вашим био-аккаунтом.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="premium-card border-none shadow-xl bg-white/[0.07] backdrop-blur-3xl overflow-hidden lg:col-span-2">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center gap-2 border-b border-white/5 pb-4"><Fingerprint className="h-5 w-5 text-primary" /><h3 className="text-lg font-black uppercase tracking-tight text-white">Тип аккаунта</h3></div>
                <div className="grid grid-cols-2 gap-4">
                  <button type="button" onClick={() => form.setValue('profileType', 'user')} className={cn("h-20 rounded-2xl border-2 transition-all flex flex-col gap-1 items-center justify-center font-black uppercase tracking-widest text-[10px]", profileTypeValue === 'user' ? "bg-primary text-slate-950 border-primary shadow-lg shadow-primary/20" : "bg-white/5 text-primary border-primary/10 hover:bg-white/10")}>
                    <User className="h-5 w-5" /> <span>Пользователь</span>
                  </button>
                  <button type="button" onClick={() => form.setValue('profileType', 'specialist')} className={cn("h-20 rounded-2xl border-2 transition-all flex flex-col gap-1 items-center justify-center font-black uppercase tracking-widest text-[10px]", profileTypeValue === 'specialist' ? "bg-primary text-slate-950 border-primary shadow-lg shadow-primary/20" : "bg-white/5 text-primary border-primary/10 hover:bg-white/10")}>
                    <Stethoscope className="h-5 w-5" /> <span>Специалист</span>
                  </button>
                </div>
              </CardContent>
            </Card>

            {profileTypeValue === 'user' && (
              <Card className="premium-card border-none shadow-xl bg-gradient-to-br from-primary/10 to-transparent backdrop-blur-3xl overflow-hidden flex flex-col justify-center">
                <CardContent className="p-8 text-center space-y-4">
                   <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2"><Smartphone className="h-8 w-8 text-primary" /></div>
                   <h3 className="font-black text-lg tracking-tight uppercase text-white">Bio-Sync</h3>
                   <Button type="button" onClick={() => toast({ title: 'Синхронизация запущена' })} className="w-full h-12 rounded-xl bg-primary text-slate-950 font-black">Синхронизировать</Button>
                </CardContent>
              </Card>
            )}
          </div>

          <Card className="premium-card overflow-hidden border-none shadow-2xl bg-white/[0.07] backdrop-blur-3xl">
            <CardContent className="p-8 md:p-12 space-y-6">
              <div className="flex items-center gap-2 border-b border-white/5 pb-4"><User className="h-5 w-5 text-primary" /><h3 className="text-lg font-black uppercase tracking-tight text-white">Персональные данные</h3></div>
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                <FormField control={form.control} name="firstName" render={({ field }) => (
                  <FormItem><FormLabel className="text-[10px] font-black uppercase text-white/50 px-4">Имя *</FormLabel><FormControl><div className="relative"><Input {...field} className={inputClasses} /><VoiceBtn field="firstName" /></div></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="lastName" render={({ field }) => (
                  <FormItem><FormLabel className="text-[10px] font-black uppercase text-white/50 px-4">Фамилия</FormLabel><FormControl><div className="relative"><Input {...field} className={inputClasses} /><VoiceBtn field="lastName" /></div></FormControl></FormItem>
                )} />
              </div>
              <FormItem>
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-white/50 px-4 flex items-center gap-2"><CalendarDays className="h-3 w-3" /> Дата рождения</FormLabel>
                <div className="grid grid-cols-3 gap-3 pt-1.5">
                  <Select value={currentDay} onValueChange={(val) => updateBirthDate(currentYear, currentMonth, val)}>
                    <SelectTrigger className={selectClasses}><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-2xl">{daysInMonth.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={currentMonth} onValueChange={(val) => updateBirthDate(currentYear, val, currentDay)}>
                    <SelectTrigger className={selectClasses}><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-2xl">{months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={currentYear} onValueChange={(val) => updateBirthDate(val, currentMonth, currentDay)}>
                    <SelectTrigger className={selectClasses}><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-2xl">{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </FormItem>
            </CardContent>
          </Card>

          <Card className="premium-card overflow-hidden border-none shadow-2xl bg-white/[0.07] backdrop-blur-3xl">
            <CardContent className="p-8 md:p-12 space-y-6">
                <div className="flex items-center gap-2 border-b border-white/5 pb-4"><ImageIcon className="h-5 w-5 text-primary" /><h3 className="text-lg font-black uppercase tracking-tight text-white">Фото профиля</h3></div>
                <div className="flex flex-col md:flex-row gap-8 items-center">
                   <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-primary/5 border-4 border-white/10 shadow-xl flex items-center justify-center shrink-0 overflow-hidden group">
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
                        <p className="text-[10px] text-white/40 font-medium italic md:col-span-2">Квадратное фото до 1 МБ.</p>
                      </div>
                   </div>
                </div>
            </CardContent>
          </Card>

          <Card className="premium-card overflow-hidden border-none shadow-2xl bg-white/[0.07] backdrop-blur-3xl">
            <CardContent className="p-8 md:p-12 space-y-6">
              {profileTypeValue === 'specialist' ? (
                <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 border-b border-white/5 pb-4"><Briefcase className="h-5 w-5 text-primary" /><h3 className="text-lg font-black uppercase tracking-tight text-white">Профессиональные данные</h3></div>
                    <div className="grid gap-6">
                      <FormField control={form.control} name="specialization" render={({ field }) => (
                        <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest text-white/50 px-4">Специализация</FormLabel><FormControl><div className="relative"><Input placeholder="Например: Нутрициолог..." {...field} className={inputClasses} /><VoiceBtn field="specialization" /></div></FormControl></FormItem>
                      )} />
                      <FormField control={form.control} name="bio" render={({ field }) => (
                        <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest text-white/50 px-4">О себе</FormLabel><FormControl><div className="relative"><Textarea placeholder="Ваш опыт..." {...field} className={textareaClasses} /><VoiceBtn field="bio" /></div></FormControl></FormItem>
                      )} />
                      <FormField control={form.control} name="instagramUrl" render={({ field }) => (
                        <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest text-white/50 px-4 flex items-center gap-2"><Instagram className="h-3 w-3" /> Ссылка на Instagram</FormLabel><FormControl><Input placeholder="https://instagram.com/username" {...field} className={inputClasses} /></FormControl></FormItem>
                      )} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8 animate-in slide-in-from-top-4 duration-500">
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 border-b border-white/5 pb-4"><Target className="h-5 w-5 text-primary" /><h3 className="text-lg font-black uppercase tracking-tight text-white">Цели и Активность</h3></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="healthGoal" render={({ field }) => (
                        <FormItem><FormLabel className="text-[10px] font-black uppercase text-white/50 px-4">Основная цель</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className={selectClasses}><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent className="rounded-2xl"><SelectItem value="снизить массу тела">Снизить вес</SelectItem><SelectItem value="поддержать текущее состояние">Поддержать форму</SelectItem><SelectItem value="набор массы">Набор массы</SelectItem></SelectContent></Select>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="activityLevel" render={({ field }) => (
                        <FormItem><FormLabel className="text-[10px] font-black uppercase text-white/50 px-4">Уровень активности</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className={selectClasses}><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent className="rounded-2xl"><SelectItem value="minimal">Минимальный (Сидячий)</SelectItem><SelectItem value="low">Низкий (Малоактивный)</SelectItem><SelectItem value="moderate">Умеренный (Средний)</SelectItem><SelectItem value="high">Высокий (Активный)</SelectItem><SelectItem value="athlete">Атлет (Спортсмен)</SelectItem></SelectContent></Select>
                        </FormItem>
                      )} />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-2 border-b border-white/5 pb-4"><Activity className="h-5 w-5 text-primary" /><h3 className="text-lg font-black uppercase tracking-tight text-white">Биометрия и Привычки</h3></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField control={form.control} name="gender" render={({ field }) => (
                        <FormItem><FormLabel className="text-[10px] font-black uppercase text-white/50 px-4">Пол</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className={selectClasses}><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent className="rounded-2xl"><SelectItem value="мужской">Мужской</SelectItem><SelectItem value="женский">Женский</SelectItem></SelectContent></Select>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="weight" render={({ field }) => (
                        <FormItem><FormLabel className="text-[10px] font-black uppercase text-white/50 px-4">Вес (кг)</FormLabel><FormControl><Input type="number" {...field} className={inputClasses} /></FormControl></FormItem>
                      )} />
                      <FormField control={form.control} name="height" render={({ field }) => (
                        <FormItem><FormLabel className="text-[10px] font-black uppercase text-white/50 px-4">Рост (см)</FormLabel><FormControl><Input type="number" {...field} className={inputClasses} /></FormControl></FormItem>
                      )} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="smoking" render={({ field }) => (
                        <FormItem><FormLabel className="text-[10px] font-black uppercase text-white/50 px-4 flex items-center gap-2"><Ban className="h-3 w-3" /> Курение</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className={selectClasses}><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent className="rounded-2xl"><SelectItem value="нет">Не курю</SelectItem><SelectItem value="да">Курю</SelectItem></SelectContent></Select>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="alcohol" render={({ field }) => (
                        <FormItem><FormLabel className="text-[10px] font-black uppercase text-white/50 px-4 flex items-center gap-2"><Wine className="h-3 w-3" /> Алкоголь</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className={selectClasses}><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent className="rounded-2xl"><SelectItem value="не употребляю">Не употребляю</SelectItem><SelectItem value="редко">Редко</SelectItem><SelectItem value="умеренно">Умеренно</SelectItem><SelectItem value="часто">Часто</SelectItem></SelectContent></Select>
                        </FormItem>
                      )} />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-2 border-b border-white/5 pb-4"><Utensils className="h-5 w-5 text-primary" /><h3 className="text-lg font-black uppercase tracking-tight text-white">Пищевые предпочтения</h3></div>
                    <div className="grid gap-6">
                      <FormField control={form.control} name="favoriteFoods" render={({ field }) => (
                        <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest text-white/50 px-4">Любимые блюда / ингредиенты</FormLabel><FormControl><div className="relative"><Textarea placeholder="Например: Авокадо, лосось, орехи..." {...field} className={textareaClasses} /><VoiceBtn field="favoriteFoods" /></div></FormControl></FormItem>
                      )} />
                      <FormField control={form.control} name="dislikedFoods" render={({ field }) => (
                        <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest text-white/50 px-4">Исключить из рациона</FormLabel><FormControl><div className="relative"><Textarea placeholder="Например: Молоко, лук, кинза..." {...field} className={textareaClasses} /><VoiceBtn field="dislikedFoods" /></div></FormControl></FormItem>
                      )} />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Button type="submit" disabled={loading} className="w-full h-20 rounded-2xl text-2xl font-black bg-primary text-slate-950 shadow-xl shadow-primary/20">
            {loading ? <Loader2 className="animate-spin h-8 w-8" /> : <><Save className="mr-4 h-8 w-8" /> Сохранить профиль</>}
          </Button>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="premium-card p-8 border-none shadow-xl bg-white/[0.07] backdrop-blur-3xl">
              <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-6"><BellRing className="h-5 w-5 text-primary" /><h3 className="text-lg font-black uppercase tracking-tight text-white">Уведомления</h3></div>
              <div className="grid grid-cols-1 gap-4">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={handleConnectTelegram} 
                  className="h-16 rounded-2xl bg-primary/10 border border-primary/20 flex justify-between px-6 font-black text-primary hover:bg-primary/20 transition-all"
                >
                  <div className="flex items-center gap-3"><Send className="h-5 w-5" /><span className="text-xs uppercase">Telegram</span></div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[7px] border-primary/20 bg-primary/5">Подключить</Badge>
                    <ExternalLink className="h-3 w-3 opacity-30" />
                  </div>
                </Button>
                <Button variant="outline" type="button" onClick={() => toast({ title: 'WhatsApp привязан' })} className="h-16 rounded-2xl bg-primary/10 border border-primary/20 flex justify-between px-6 font-black text-primary hover:bg-primary/20 transition-all"><div className="flex items-center gap-3"><MessageCircle className="h-5 w-5" /><span className="text-xs uppercase">WhatsApp</span></div><Badge variant="outline" className="text-[7px] border-primary/20 bg-primary/5">Подключить</Badge></Button>
              </div>
            </Card>

            <Card className="premium-card p-8 border-none shadow-xl bg-gradient-to-br from-primary/20 to-transparent backdrop-blur-3xl">
               <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-6"><History className="h-5 w-5 text-primary" /><h3 className="text-lg font-black uppercase tracking-tight text-white">Архив здоровья</h3></div>
               <div className="space-y-4">
                  <p className="text-[10px] text-white/50 font-medium px-1">Здесь хранятся все ваши загруженные отчеты, результаты анализов и рекомендации ИИ.</p>
                  <AnalysisHistoryDialog>
                     <Button type="button" className="w-full h-16 rounded-2xl bg-white/5 text-primary border-2 border-primary/20 font-black uppercase tracking-widest text-[10px] gap-3 shadow-lg hover:bg-primary/10 transition-all">
                        <FileText className="h-5 w-5" /> Посмотреть отчеты и анализы
                     </Button>
                  </AnalysisHistoryDialog>
               </div>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  );
}
