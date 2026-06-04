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
  Pill, Mic, Briefcase, Info, 
  Upload, Instagram, Brain, ShieldCheck,
  LogOut, Database, Zap, BookOpen, CheckCircle2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, useMemoFirebase, useAuth } from '@/firebase';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { AnalysisHistoryDialog } from './analysis-history-dialog';
import { get as getInIdb, set as setInIdb } from 'idb-keyval';

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
  const { auth } = useAuth();
  const { firestore } = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [recordingField, setRecordingField] = useState<string | null>(null);
  const [obsidianLoading, setObsidianLoading] = useState(false);
  const [obsidianVault, setObsidianVault] = useState<string | null>(null);
  const [isObsidianSupported, setIsObsidianSupported] = useState(true);
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
    setIsObsidianSupported(typeof window !== 'undefined' && 'showDirectoryPicker' in window);
    
    const checkObsidianAccess = async () => {
      if (userData?.obsidianConnected) {
        try {
          const handle = await getInIdb('obsidian_vault_handle');
          if (handle) {
            const hasPermission = await verifyPermission(handle, false);
            if (hasPermission) {
              setObsidianVault(handle.name);
            } else {
              setObsidianVault(null); // Требуется повторный запрос прав
            }
          }
        } catch (err) {
          console.error("Obsidian access error:", err);
        }
      }
    };

    if (userData) {
      form.reset({ 
        ...userData,
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
      checkObsidianAccess();
    } 
  }, [userData, form]);

  const verifyPermission = async (handle: any, readWrite: boolean) => {
    const options: any = {};
    if (readWrite) {
      options.mode = 'readwrite';
    }
    if ((await handle.queryPermission(options)) === 'granted') {
      return true;
    }
    if ((await handle.requestPermission(options)) === 'granted') {
      return true;
    }
    return false;
  };

  const handleConnectObsidian = async () => {
    if (!isObsidianSupported) return;
    
    setObsidianLoading(true);
    try {
      // 1. Вызываем системное окно выбора папки
      const handle = await (window as any).showDirectoryPicker({
        mode: 'readwrite'
      });

      // 2. Сохраняем хэндл в IndexedDB
      await setInIdb('obsidian_vault_handle', handle);

      // 3. Обновляем статус в Firestore
      if (user && firestore) {
        await updateDoc(doc(firestore, 'users', user.uid), {
          obsidianConnected: true,
          obsidianVaultName: handle.name,
          updatedAt: new Date().toISOString()
        });
      }

      setObsidianVault(handle.name);
      toast({ 
        title: 'Obsidian подключен', 
        description: `База данных "${handle.name}" успешно привязана локально.` 
      });
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        toast({ variant: 'destructive', title: 'Ошибка подключения', description: 'Не удалось получить доступ к папке.' });
      }
    } finally {
      setObsidianLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      form.setValue('photoUrl', reader.result as string);
      toast({ title: 'Фото готово к сохранению' });
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (values: ProfileValues) => {
    if (!user || !firestore) return;
    setLoading(true);
    try {
      await setDoc(doc(firestore, 'users', user.uid), { ...values, id: user.uid, updatedAt: new Date().toISOString() }, { merge: true });
      toast({ title: 'Профиль обновлен' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Ошибка сохранения' });
    } finally { setLoading(false); }
  };

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      router.push('/');
      toast({ title: 'Выход выполнен', description: 'Будем рады видеть вас снова!' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Ошибка выхода' });
    }
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
      const current = form.getValues(fieldName as any);
      form.setValue(fieldName as any, (current ? current + ' ' : '') + transcript);
    };
    recognition.start();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700 pb-32 px-4">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30 shadow-lg shadow-primary/10">
          <User className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h2 className="text-4xl font-black uppercase text-white tracking-tighter leading-none">Кабинет</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40 mt-1">Biometric ID Profile</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
          
          <Card className="cyber-card bg-blue-950/40 p-8 border-white/5">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] overflow-hidden border-4 border-primary/20 bg-white/5 relative shadow-2xl">
                {currentPhotoUrl ? (
                  <img src={currentPhotoUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><User className="h-12 w-12 text-white/20" /></div>
                )}
              </div>
              <div className="flex-1 space-y-4">
                <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer border-2 border-dashed border-white/10 rounded-2xl p-6 bg-white/5 hover:bg-white/10 hover:border-primary/30 transition-all text-center">
                  <Upload className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-sm font-black text-white uppercase">Загрузить новое фото</p>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-primary/60 px-2 flex items-center gap-2"><Info className="h-4 w-4" /> 1. Личные данные</h3>
            <Card className="cyber-card bg-blue-950/40 p-8 space-y-6 border-white/5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="firstName" render={({ field }) => (<FormItem><FormLabel>Имя</FormLabel><FormControl><Input {...field} className="h-14 rounded-2xl bg-white/5 border-white/10 text-white" /></FormControl></FormItem>)} />
                <FormField control={form.control} name="lastName" render={({ field }) => (<FormItem><FormLabel>Фамилия</FormLabel><FormControl><Input {...field} className="h-14 rounded-2xl bg-white/5 border-white/10 text-white" /></FormControl></FormItem>)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="birthDate" render={({ field }) => (<FormItem><FormLabel>Дата рождения (ДД.ММ.ГГГГ)</FormLabel><FormControl><Input {...field} placeholder="01.01.1990" className="h-14 rounded-2xl bg-white/5 border-white/10 text-white" /></FormControl></FormItem>)} />
                <FormField control={form.control} name="profileType" render={({ field }) => (
                  <FormItem><FormLabel>Роль</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-14 rounded-2xl bg-white/5 border-white/10"><SelectValue /></SelectTrigger></FormControl><SelectContent className="bg-slate-900 border-white/10 text-white"><SelectItem value="user">Пользователь</SelectItem><SelectItem value="specialist">Специалист</SelectItem></SelectContent></Select></FormItem>
                )} />
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-primary/60 px-2 flex items-center gap-2"><Activity className="h-4 w-4" /> 2. Биометрия</h3>
            <Card className="cyber-card bg-blue-950/40 p-8 space-y-6 border-white/5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="gender" render={({ field }) => (
                  <FormItem><FormLabel>Пол</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-14 rounded-2xl bg-white/5 border-white/10"><SelectValue /></SelectTrigger></FormControl><SelectContent className="bg-slate-900 border-white/10 text-white"><SelectItem value="мужской">Мужской</SelectItem><SelectItem value="женский">Женский</SelectItem></SelectContent></Select></FormItem>
                )} />
                <FormField control={form.control} name="weight" render={({ field }) => (<FormItem><FormLabel>Вес (кг)</FormLabel><FormControl><Input type="number" {...field} className="h-14 rounded-2xl bg-white/5 border-white/10 text-white" /></FormControl></FormItem>)} />
                <FormField control={form.control} name="height" render={({ field }) => (<FormItem><FormLabel>Рост (см)</FormLabel><FormControl><Input type="number" {...field} className="h-14 rounded-2xl bg-white/5 border-white/10 text-white" /></FormControl></FormItem>)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="healthGoal" render={({ field }) => (
                  <FormItem><FormLabel>Цель</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-14 rounded-2xl bg-white/5 border-white/10"><SelectValue /></SelectTrigger></FormControl><SelectContent className="bg-slate-900 border-white/10 text-white"><SelectItem value="снизить массу тела">Снизить вес</SelectItem><SelectItem value="поддержать текущее состояние">Поддержание</SelectItem><SelectItem value="набор массы">Набор массы</SelectItem></SelectContent></Select></FormItem>
                )} />
                <FormField control={form.control} name="activityLevel" render={({ field }) => (
                  <FormItem><FormLabel>Активность</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-14 rounded-2xl bg-white/5 border-white/10"><SelectValue /></SelectTrigger></FormControl><SelectContent className="bg-slate-900 border-white/10 text-white"><SelectItem value="minimal">Минимальная</SelectItem><SelectItem value="low">Низкая</SelectItem><SelectItem value="moderate">Средняя</SelectItem><SelectItem value="high">Высокая</SelectItem><SelectItem value="athlete">Атлет</SelectItem></SelectContent></Select></FormItem>
                )} />
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-primary/60 px-2 flex items-center gap-2"><UtensilsCrossed className="h-4 w-4" /> 3. Образ жизни и Питание</h3>
            <Card className="cyber-card bg-blue-950/40 p-8 space-y-8 border-white/5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="smoking" render={({ field }) => (
                  <FormItem><FormLabel>Курение</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-14 rounded-2xl bg-white/5 border-white/10"><SelectValue /></SelectTrigger></FormControl><SelectContent className="bg-slate-900 border-white/10 text-white"><SelectItem value="нет">Не курю</SelectItem><SelectItem value="да">Курю</SelectItem></SelectContent></Select></FormItem>
                )} />
                <FormField control={form.control} name="alcohol" render={({ field }) => (
                  <FormItem><FormLabel>Алкоголь</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-14 rounded-2xl bg-white/5 border-white/10"><SelectValue /></SelectTrigger></FormControl><SelectContent className="bg-slate-900 border-white/10 text-white"><SelectItem value="не употребляю">Не употребляю</SelectItem><SelectItem value="редко">Редко</SelectItem><SelectItem value="умеренно">Умеренно</SelectItem><SelectItem value="часто">Часто</SelectItem></SelectContent></Select></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="favoriteFoods" render={({ field }) => (
                  <FormItem><FormLabel className="flex items-center justify-between">Любимые продукты <Button type="button" variant="ghost" size="icon" onClick={() => startVoiceInput('favoriteFoods')} className={cn("h-8 w-8", recordingField === 'favoriteFoods' && "bg-red-500 animate-pulse text-white")}><Mic className="h-4 w-4" /></Button></FormLabel><FormControl><Textarea {...field} placeholder="Напр: Лосось, шпинат, орехи..." className="min-h-[100px] rounded-2xl bg-white/5 border-white/10 text-white" /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="dislikedFoods" render={({ field }) => (
                  <FormItem><FormLabel className="flex items-center justify-between">Исключить из рациона <Button type="button" variant="ghost" size="icon" onClick={() => startVoiceInput('dislikedFoods')} className={cn("h-8 w-8", recordingField === 'dislikedFoods' && "bg-red-500 animate-pulse text-white")}><Mic className="h-4 w-4" /></Button></FormLabel><FormControl><Textarea {...field} placeholder="Напр: Лактоза, сахар, лук..." className="min-h-[100px] rounded-2xl bg-white/5 border-white/10 text-white" /></FormControl></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="medications" render={({ field }) => (
                <FormItem><FormLabel className="flex items-center justify-between"><Pill className="h-4 w-4 mr-2" /> Лекарства / Витамины / БАДы <Button type="button" variant="ghost" size="icon" onClick={() => startVoiceInput('medications')} className={cn("h-8 w-8", recordingField === 'medications' && "bg-red-500 animate-pulse text-white")}><Mic className="h-4 w-4" /></Button></FormLabel><FormControl><Textarea {...field} placeholder="Перечислите все препараты, которые принимаете..." className="min-h-[100px] rounded-2xl bg-white/5 border-white/10 text-white" /></FormControl></FormItem>
              )} />
            </Card>
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-primary/60 px-2 flex items-center gap-2"><Briefcase className="h-4 w-4" /> 4. Профессиональная деятельность</h3>
            <Card className="cyber-card bg-blue-950/40 p-8 space-y-6 border-white/5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="occupation" render={({ field }) => (<FormItem><FormLabel>Профессия / Должность</FormLabel><FormControl><Input {...field} placeholder="Напр: Программист, Тренер..." className="h-14 rounded-2xl bg-white/5 border-white/10 text-white" /></FormControl></FormItem>)} />
                <FormField control={form.control} name="workHoursPerDay" render={({ field }) => (<FormItem><FormLabel>Часов работы в день</FormLabel><FormControl><Input type="number" {...field} className="h-14 rounded-2xl bg-white/5 border-white/10 text-white" /></FormControl></FormItem>)} />
              </div>
              <FormField control={form.control} name="workActivityType" render={({ field }) => (
                <FormItem><FormLabel>Характер работы</FormLabel><div className="grid grid-cols-2 gap-4">
                  <Button type="button" onClick={() => form.setValue('workActivityType', 'mental')} variant={field.value === 'mental' ? "default" : "outline"} className={cn("h-14 rounded-2xl font-black uppercase tracking-widest text-[10px]", field.value === 'mental' ? "bg-primary text-slate-950" : "bg-white/5 border-white/10 text-white")}><Brain className="h-4 w-4 mr-2" /> Умственная</Button>
                  <Button type="button" onClick={() => form.setValue('workActivityType', 'physical')} variant={field.value === 'physical' ? "default" : "outline"} className={cn("h-14 rounded-2xl font-black uppercase tracking-widest text-[10px]", field.value === 'physical' ? "bg-primary text-slate-950" : "bg-white/5 border-white/10 text-white")}><Activity className="h-4 w-4 mr-2" /> Физическая</Button>
                </div></FormItem>
              )} />
            </Card>
          </div>

          {profileType === 'specialist' && (
            <div className="space-y-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2 px-2"><ShieldCheck className="h-4 w-4" /> 5. Профиль эксперта</h3>
              <Card className="cyber-card bg-primary/5 p-8 space-y-6 border-primary/20">
                <FormField control={form.control} name="specialization" render={({ field }) => (<FormItem><FormLabel>Специализация</FormLabel><FormControl><Input placeholder="Напр: Эндокринолог, Нутрициолог" {...field} className="h-14 rounded-2xl bg-white/5 border-white/10 text-white" /></FormControl></FormItem>)} />
                <FormField control={form.control} name="bio" render={({ field }) => (<FormItem><FormLabel className="flex items-center justify-between">О себе / Квалификация <Button type="button" variant="ghost" size="icon" onClick={() => startVoiceInput('bio')} className={cn("h-8 w-8", recordingField === 'bio' && "bg-red-500 animate-pulse text-white")}><Mic className="h-4 w-4" /></Button></FormLabel><FormControl><Textarea {...field} placeholder="Ваш опыт и достижения..." className="min-h-[120px] rounded-2xl bg-white/5 border-white/10 text-white" /></FormControl></FormItem>)} />
                <FormField control={form.control} name="instagramUrl" render={({ field }) => (<FormItem><FormLabel className="flex items-center gap-2"><Instagram className="h-4 w-4" /> Instagram</FormLabel><FormControl><Input placeholder="https://instagram.com/yourprofile" {...field} className="h-14 rounded-2xl bg-white/5 border-white/10 text-white" /></FormControl></FormItem>)} />
              </Card>
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full h-20 rounded-2xl bg-primary text-slate-950 font-black text-2xl shadow-[0_0_50px_rgba(0,255,255,0.4)] hover:scale-[1.02] active:scale-95 transition-all">
            {loading ? <Loader2 className="animate-spin h-8 w-8" /> : 'СОХРАНИТЬ ВСЕ ИЗМЕНЕНИЯ'}
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <Card className="cyber-card bg-blue-950/40 p-8 flex flex-col gap-4 border-white/5">
                <h3 className="font-black uppercase flex items-center gap-2 text-white/60 text-xs tracking-widest"><Smartphone className="h-5 w-5 text-primary" /> Уведомления</h3>
                <Button type="button" variant="outline" onClick={() => window.open(`https://t.me/web3cyberservices_bot?start=${user?.uid}`, '_blank')} className="h-14 rounded-xl bg-white/5 border-white/10 text-white gap-3 uppercase font-black hover:bg-primary/5 transition-all"><Send className="h-4 w-4 text-primary" /> Telegram <ExternalLink className="h-3 w-3 opacity-30" /></Button>
             </Card>
             <Card className="cyber-card bg-blue-950/40 p-8 flex flex-col gap-4 border-white/5">
                <h3 className="font-black uppercase flex items-center gap-2 text-white/60 text-xs tracking-widest"><Activity className="h-5 w-5 text-primary" /> Архив</h3>
                <AnalysisHistoryDialog><Button type="button" className="h-14 rounded-xl bg-white/5 text-primary border-primary/20 font-black uppercase hover:bg-primary/5 transition-all">Открыть архив здоровья</Button></AnalysisHistoryDialog>
             </Card>
          </div>

          {/* ИНТЕГРАЦИЯ OBSIDIAN */}
          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-primary/60 px-2 flex items-center gap-2"><Database className="h-4 w-4" /> Интеграция Obsidian</h3>
            <Card className="cyber-card bg-blue-950/40 p-8 space-y-6 border-white/5">
               <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-2 flex-1">
                     <h4 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" /> База знаний Obsidian
                     </h4>
                     <p className="text-xs text-white/50 font-medium leading-relaxed max-w-md">
                        Подключите локальное хранилище Obsidian для синхронизации ваших медицинских заметок и ИИ-анализа. Данные хранятся только на вашем устройстве.
                     </p>
                     <div className="flex items-center gap-2 mt-4">
                        <span className={cn(
                          "h-2 w-2 rounded-full",
                          obsidianVault ? "bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" : "bg-red-500"
                        )} />
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-widest",
                          obsidianVault ? "text-emerald-400" : "text-red-400"
                        )}>
                           {obsidianVault ? `Подключено: ${obsidianVault}` : "Не подключено"}
                        </span>
                     </div>
                  </div>
                  <div className="w-full md:w-auto">
                    <Button 
                      type="button"
                      variant="outline"
                      disabled={!isObsidianSupported || obsidianLoading}
                      onClick={handleConnectObsidian}
                      className={cn(
                        "w-full md:w-auto h-16 px-8 rounded-2xl border-2 font-black uppercase tracking-widest text-[10px] transition-all relative group",
                        obsidianVault 
                          ? "border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/5" 
                          : "border-primary/20 text-primary hover:border-primary/60 hover:shadow-[0_0_20px_rgba(0,255,255,0.2)]"
                      )}
                    >
                      {obsidianLoading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                        <div className="flex items-center gap-2">
                          <Zap className={cn("h-4 w-4", !obsidianVault && "animate-pulse")} />
                          {obsidianVault ? "ОБНОВИТЬ ДОСТУП" : "ПОДКЛЮЧИТЬ OBSIDIAN"}
                        </div>
                      )}
                      {!isObsidianSupported && (
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] text-white/30">
                          Доступно только в десктопной версии
                        </div>
                      )}
                    </Button>
                  </div>
               </div>
               <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 flex items-start gap-4">
                  <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                  <p className="text-[9px] font-bold text-white/50 uppercase leading-relaxed tracking-wider">
                    Ваши файлы не передаются на сервер. Приложение использует File System Access API для локальной обработки .md файлов.
                  </p>
               </div>
            </Card>
          </div>

          <Card className="cyber-card bg-red-950/20 p-8 flex flex-col gap-4 border-red-500/20">
             <h3 className="font-black uppercase flex items-center gap-2 text-red-500/60 text-xs tracking-widest"><LogOut className="h-5 w-5" /> Сессия</h3>
             <Button 
                type="button" 
                variant="outline" 
                onClick={handleLogout} 
                className="h-14 rounded-xl border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all uppercase font-black tracking-widest text-[10px]"
             >
                ВЫЙТИ ИЗ АККАУНТА
             </Button>
          </Card>
        </form>
      </Form>
    </div>
  );
}