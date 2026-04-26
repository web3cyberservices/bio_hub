'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { 
  User, Loader2, Smartphone, Send, ExternalLink, Activity, 
  Pill, Mic, Briefcase, Info, ImageIcon,
  CalendarDays, Target, Zap, Wine, Ban, UtensilsCrossed,
  Upload, X, CheckCircle2, Instagram, Timer, Brain, Share2, Copy
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { AnalysisHistoryDialog } from './analysis-history-dialog';
import Image from 'next/image';

const profileSchema = z.object({
  firstName: z.string().min(1, 'Имя обязательно'),
  lastName: z.string().optional().default(''),
  birthDate: z.string().optional().default(''),
  photoUrl: z.string().optional().default(''),
  gender: z.enum(['мужской', 'женский']).default('мужской'),
  weight: z.coerce.number().optional().default(0),
  height: z.coerce.number().optional().default(0),
  activityLevel: z.enum(['minimal', 'low', 'moderate', 'high', 'athlete']).default('moderate'),
  healthGoal: z.enum(['снизить массу тела', 'поддержать текущее состояние', 'набор массы']).default('поддержать текущее состояние'),
  smoking: z.enum(['да', 'нет']).default('нет'),
  alcohol: z.enum(['не употребляю', 'редко', 'умеренно', 'часто']).default('не употребляю'),
  favoriteFoods: z.string().optional().default(''),
  dislikedFoods: z.string().optional().default(''),
  medications: z.string().optional().default(''),
  profileType: z.enum(['user', 'specialist']).default('user'),
  specialization: z.string().optional().default(''),
  bio: z.string().optional().default(''),
  instagramUrl: z.string().optional().default(''),
  occupation: z.string().optional().default(''),
  workActivityType: z.enum(['mental', 'physical']).default('mental'),
  workHoursPerDay: z.coerce.number().optional().default(0),
});

type ProfileValues = z.infer<typeof profileSchema>;

export function ProfileCabinet() {
  const { user } = useUser();
  const { firestore } = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [recordingField, setRecordingField] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userDocRef = useMemoFirebase(() => user ? doc(firestore!, 'users', user.uid) : null, [user, firestore]);
  const { data: userData } = useDoc<any>(userDocRef);

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { 
      firstName: '', 
      lastName: '',
      birthDate: '',
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
      medications: '',
      profileType: 'user',
      specialization: '',
      bio: '',
      instagramUrl: '',
      occupation: '',
      workActivityType: 'mental',
      workHoursPerDay: 0,
    },
  });

  const profileType = form.watch('profileType');
  const currentPhotoUrl = form.watch('photoUrl');

  useEffect(() => { 
    if (userData) {
      form.reset({ 
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        birthDate: userData.birthDate || '',
        photoUrl: userData.photoUrl || '',
        gender: userData.gender || 'мужской',
        weight: userData.weight || 0,
        height: userData.height || 0,
        activityLevel: userData.activityLevel || 'moderate',
        healthGoal: userData.healthGoal || 'поддержать текущее состояние',
        smoking: userData.smoking || 'нет',
        alcohol: userData.alcohol || 'не употребляю',
        favoriteFoods: userData.favoriteFoods || '',
        dislikedFoods: userData.dislikedFoods || '',
        medications: userData.medications || '',
        profileType: userData.profileType || 'user',
        specialization: userData.specialization || '',
        bio: userData.bio || '',
        instagramUrl: userData.instagramUrl || '',
        occupation: userData.occupation || '',
        workActivityType: userData.workActivityType || 'mental',
        workHoursPerDay: userData.workHoursPerDay || 0,
      }); 
    } 
  }, [userData, form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 7 * 1024 * 1024) {
      toast({ variant: 'destructive', title: 'Файл слишком большой', description: 'Максимальный размер фото — 7 МБ.' });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      form.setValue('photoUrl', reader.result as string);
      toast({ title: 'Фото готово к загрузке' });
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (values: ProfileValues) => {
    if (!user || !firestore) return;
    setLoading(true);
    try {
      await setDoc(doc(firestore, 'users', user.uid), { ...values, id: user.uid, updatedAt: new Date().toISOString() }, { merge: true });
      toast({ title: 'Профиль обновлен', description: 'Данные успешно сохранены.' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Ошибка сохранения', description: e.message || 'Проверьте соединение с базой данных.' });
    } finally { setLoading(false); }
  };

  const handleCopyInviteLink = () => {
    if (!user) return;
    const link = `${window.location.origin}/specialist/${user.uid}`;
    navigator.clipboard.writeText(link).then(() => {
      toast({ title: 'Ссылка скопирована', description: 'Теперь вы можете приглашать пациентов напрямую в свой профиль.' });
    });
  };

  const handleShareToTelegram = () => {
    if (!user) return;
    // Deep link для Telegram бота с параметром специалиста
    const botLink = `https://t.me/web3cyberservices_bot?start=spec_${user.uid}`;
    const shareText = `Заходите в мой профиль специалиста в приложении PRO Себя!`;
    const fullShareLink = `https://t.me/share/url?url=${encodeURIComponent(botLink)}&text=${encodeURIComponent(shareText)}`;
    window.open(fullShareLink, '_blank');
  };

  const startVoiceInput = (fieldName: keyof ProfileValues) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = 'ru-RU';
    recognition.onstart = () => setRecordingField(fieldName);
    recognition.onend = () => setRecordingField(null);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const current = form.getValues(fieldName as any);
      form.setValue(fieldName as any, (current ? current + ' ' : '') + transcript);
    };
    recognition.start();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700 pb-32 px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30 shadow-lg shadow-primary/10">
            <User className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h2 className="text-4xl font-black uppercase text-white tracking-tighter leading-none">Кабинет</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40 mt-1">Biometric ID Profile</p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
          
          {profileType === 'specialist' && (
            <Card className="cyber-card bg-primary/10 p-8 border-primary/30 space-y-6 animate-in slide-in-from-top-4 duration-500">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                     <Share2 className="h-6 w-6 text-slate-950" />
                  </div>
                  <div className="space-y-0.5">
                     <h3 className="text-xl font-black text-white uppercase tracking-tight leading-none">Приглашение пациентов</h3>
                     <p className="text-[9px] font-bold text-primary/60 uppercase tracking-widest">Персональная Bio-ссылка</p>
                  </div>
               </div>
               <div className="space-y-4">
                  <p className="text-sm font-medium text-white/70 leading-relaxed">
                     Отправьте ссылку пациентам. Они смогут открыть ваш профиль напрямую в вебе или через Telegram-бот.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                     <div className="flex-1 h-14 rounded-2xl bg-black/40 border border-primary/20 px-6 flex items-center overflow-hidden">
                        <code className="text-[10px] font-mono text-primary/80 truncate w-full">
                           {typeof window !== 'undefined' ? `${window.location.origin}/specialist/${user?.uid}` : '...'}
                        </code>
                     </div>
                     <div className="flex gap-2 shrink-0">
                        <Button 
                          type="button" 
                          onClick={handleCopyInviteLink} 
                          className="h-14 px-6 rounded-2xl bg-white/10 text-white font-black uppercase text-[10px] gap-2 hover:bg-white/20 transition-all"
                        >
                           <Copy className="h-4 w-4" /> Копировать
                        </Button>
                        <Button 
                          type="button" 
                          onClick={handleShareToTelegram} 
                          className="h-14 px-6 rounded-2xl bg-[#229ED9] text-white font-black uppercase text-[10px] gap-2 shadow-xl hover:scale-105 transition-all"
                        >
                           <Send className="h-4 w-4" /> В Telegram
                        </Button>
                     </div>
                  </div>
               </div>
            </Card>
          )}

          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-primary/60 px-2 flex items-center gap-2">
              <ImageIcon className="h-4 w-4" /> Фото профиля
            </h3>
            <Card className="cyber-card bg-blue-950/40 p-8 border-white/5">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative group">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] overflow-hidden border-4 border-primary/20 bg-white/5 relative shadow-2xl">
                    {currentPhotoUrl ? (
                      <img src={currentPhotoUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="h-12 w-12 text-white/20" />
                      </div>
                    )}
                  </div>
                  {currentPhotoUrl && (
                    <button 
                      type="button" 
                      onClick={() => form.setValue('photoUrl', '')}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                
                <div className="flex-1 space-y-4 text-center md:text-left">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer border-2 border-dashed border-white/10 rounded-2xl p-6 bg-white/5 hover:bg-white/10 hover:border-primary/30 transition-all group"
                  >
                    <Upload className="h-8 w-8 text-primary mx-auto md:mx-0 mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-sm font-black text-white uppercase">Загрузить новое фото</p>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">До 7 МБ (JPG, PNG)</p>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-primary/60 px-2 flex items-center gap-2">
              <Info className="h-4 w-4" /> 1. Личные данные
            </h3>
            <Card className="cyber-card bg-blue-950/40 p-8 space-y-6 border-white/5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="firstName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase text-white/40 tracking-widest px-1">Имя</FormLabel>
                    <FormControl><Input {...field} className="h-14 rounded-2xl bg-white/5 border-white/10 text-white font-bold" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="lastName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase text-white/40 tracking-widest px-1">Фамилия</FormLabel>
                    <FormControl><Input {...field} className="h-14 rounded-2xl bg-white/5 border-white/10 text-white font-bold" /></FormControl>
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="birthDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase text-white/40 tracking-widest px-1 flex items-center gap-2"><CalendarDays className="h-3.5 w-3.5" /> Дата рождения</FormLabel>
                    <FormControl><Input type="date" {...field} className="h-14 rounded-2xl bg-white/5 border-white/10 text-white font-bold" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="profileType" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase text-white/40 tracking-widest px-1">Роль в системе</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-14 rounded-2xl bg-white/5 border-white/10 text-white font-bold">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-900 border-white/10 text-white rounded-xl">
                        <SelectItem value="user">Пользователь (Био-хаб)</SelectItem>
                        <SelectItem value="specialist">Специалист (Врач/Нутрициолог)</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
              </div>
            </Card>
          </div>

          {profileType === 'specialist' && (
            <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
               <h3 className="text-sm font-black uppercase tracking-widest text-primary/60 px-2 flex items-center gap-2">
                 <Briefcase className="h-4 w-4" /> 1.1 Данные специалиста
               </h3>
               <Card className="cyber-card bg-primary/5 p-8 space-y-6 border-primary/20">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="specialization" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase text-white/40 tracking-widest px-1">Специализация</FormLabel>
                        <FormControl><Input {...field} placeholder="Эндокринолог, Нутрициолог..." className="h-14 rounded-2xl bg-white/5 border-white/10 text-white font-bold" /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="instagramUrl" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase text-white/40 tracking-widest px-1 flex items-center gap-2">
                          <Instagram className="h-3.5 w-3.5" /> Instagram URL
                        </FormLabel>
                        <FormControl><Input {...field} placeholder="https://instagram.com/yourname" className="h-14 rounded-2xl bg-white/5 border-white/10 text-white font-bold" /></FormControl>
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="bio" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase text-white/40 tracking-widest px-1">О себе / Опыт</FormLabel>
                      <FormControl><Textarea {...field} className="min-h-[120px] rounded-2xl bg-white/5 border-white/10 text-white text-lg font-medium resize-none shadow-inner" /></FormControl>
                    </FormItem>
                  )} />
               </Card>
            </div>
          )}

          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-primary/60 px-2 flex items-center gap-2">
              <Activity className="h-4 w-4" /> 2. Биометрия
            </h3>
            <Card className="cyber-card bg-blue-950/40 p-8 space-y-8 border-white/5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="gender" render={({ field }) => (
                   <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase text-white/40 tracking-widest px-1">Пол</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                         <FormControl>
                            <SelectTrigger className="h-14 rounded-2xl bg-white/5 border-white/10 text-white font-bold">
                               <SelectValue />
                            </SelectTrigger>
                         </FormControl>
                         <SelectContent className="bg-slate-900 border-white/10 text-white rounded-xl">
                            <SelectItem value="мужской">Мужской</SelectItem>
                            <SelectItem value="женский">Женский</SelectItem>
                         </SelectContent>
                      </Select>
                   </FormItem>
                )} />
                <FormField control={form.control} name="weight" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase text-white/40 tracking-widest px-1">Вес (кг)</FormLabel>
                    <FormControl><Input type="number" {...field} className="h-14 rounded-2xl bg-white/5 border-white/10 text-white font-bold" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="height" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase text-white/40 tracking-widest px-1">Рост (см)</FormLabel>
                    <FormControl><Input type="number" {...field} className="h-14 rounded-2xl bg-white/5 border-white/10 text-white font-bold" /></FormControl>
                  </FormItem>
                )} />
              </div>

              {profileType === 'user' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                  <FormField control={form.control} name="healthGoal" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase text-white/40 tracking-widest px-1 flex items-center gap-2"><Target className="h-3.5 w-3.5" /> Цель здоровья</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                         <FormControl>
                          <SelectTrigger className="h-14 rounded-2xl bg-white/5 border-white/10 text-white font-bold">
                            <SelectValue />
                          </SelectTrigger>
                         </FormControl>
                         <SelectContent className="bg-slate-900 border-white/10 text-white rounded-xl">
                            <SelectItem value="снизить массу тела">Снизить вес</SelectItem>
                            <SelectItem value="поддержать текущее состояние">Поддержание</SelectItem>
                            <SelectItem value="набор массы">Набор массы</SelectItem>
                         </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="activityLevel" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase text-white/40 tracking-widest px-1 flex items-center gap-2"><Zap className="h-3.5 w-3.5" /> Активность</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                         <FormControl>
                          <SelectTrigger className="h-14 rounded-2xl bg-white/5 border-white/10 text-white font-bold">
                            <SelectValue />
                          </SelectTrigger>
                         </FormControl>
                         <SelectContent className="bg-slate-900 border-white/10 text-white rounded-xl">
                            <SelectItem value="minimal">Минимальная</SelectItem>
                            <SelectItem value="low">Низкая (1-3 тренировки)</SelectItem>
                            <SelectItem value="moderate">Средняя (3-5 тренировок)</SelectItem>
                            <SelectItem value="high">Высокая (каждый день)</SelectItem>
                            <SelectItem value="athlete">Спортсмен (2 раза в день)</SelectItem>
                         </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                </div>
              )}
            </Card>
          </div>

          {profileType === 'user' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-sm font-black uppercase tracking-widest text-primary/60 px-2 flex items-center gap-2">
                <Briefcase className="h-4 w-4" /> 3. Работа
              </h3>
              <Card className="cyber-card bg-blue-950/40 p-8 space-y-6 border-white/5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="occupation" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase text-white/40 tracking-widest px-1">Профессия</FormLabel>
                      <FormControl><Input {...field} placeholder="Напр: Программист, Учитель..." className="h-14 rounded-2xl bg-white/5 border-white/10 text-white font-bold" /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="workHoursPerDay" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase text-white/40 tracking-widest px-1 flex items-center gap-2"><Timer className="h-3.5 w-3.5" /> Часов работы в день</FormLabel>
                      <FormControl><Input type="number" {...field} className="h-14 rounded-2xl bg-white/5 border-white/10 text-white font-bold" /></FormControl>
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="workActivityType" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase text-white/40 tracking-widest px-1">Характер работы</FormLabel>
                    <div className="grid grid-cols-2 gap-4">
                      <Button 
                        type="button" 
                        onClick={() => form.setValue('workActivityType', 'mental')}
                        variant={field.value === 'mental' ? "default" : "outline"}
                        className={cn("h-14 rounded-2xl font-black uppercase text-[10px] gap-2", field.value === 'mental' ? "bg-primary text-slate-950" : "bg-white/5 border-white/10 text-white/40")}
                      >
                         <Brain className="h-4 w-4" /> Умственная
                      </Button>
                      <Button 
                        type="button" 
                        onClick={() => form.setValue('workActivityType', 'physical')}
                        variant={field.value === 'physical' ? "default" : "outline"}
                        className={cn("h-14 rounded-2xl font-black uppercase text-[10px] gap-2", field.value === 'physical' ? "bg-primary text-slate-950" : "bg-white/5 border-white/10 text-white/40")}
                      >
                         <Activity className="h-4 w-4" /> Физическая
                      </Button>
                    </div>
                  </FormItem>
                )} />
              </Card>
            </div>
          )}

          <div className="pt-4">
            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full h-20 rounded-2xl bg-primary text-slate-950 font-black text-2xl shadow-[0_0_50px_rgba(0,255,255,0.4)] hover:scale-[1.02] active:scale-95 transition-all border-4 border-black/20"
            >
              {loading ? <Loader2 className="animate-spin h-8 w-8" /> : 'СОХРАНИТЬ ИЗМЕНЕНИЯ'}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <Card className="cyber-card bg-blue-950/40 p-8 flex flex-col gap-4 border-white/5">
                <h3 className="font-black uppercase flex items-center gap-2 text-white/60 text-xs tracking-widest">
                  <Smartphone className="h-5 w-5 text-primary" /> Уведомления
                </h3>
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => window.open(`https://t.me/web3cyberservices_bot?start=${user?.uid}`, '_blank')} 
                  className="h-14 rounded-xl bg-white/5 border-white/10 text-white gap-3 uppercase font-black hover:bg-white/10 transition-all shadow-sm"
                >
                  <Send className="h-4 w-4 text-primary" /> Telegram <ExternalLink className="h-3 w-3 opacity-30" />
                </Button>
             </Card>
             <Card className="cyber-card bg-blue-950/40 p-8 flex flex-col gap-4 border-white/5">
                <h3 className="font-black uppercase flex items-center gap-2 text-white/60 text-xs tracking-widest">
                  <Activity className="h-5 w-5 text-primary" /> Архив
                </h3>
                <AnalysisHistoryDialog>
                  <Button type="button" className="h-14 rounded-xl bg-white/5 text-primary border-primary/20 font-black uppercase hover:bg-primary/5 transition-all shadow-sm">
                    Открыть архив здоровья
                  </Button>
                </AnalysisHistoryDialog>
             </Card>
          </div>
        </form>
      </Form>
    </div>
  );
}
