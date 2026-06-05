'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { 
  User, Loader2, Smartphone, ExternalLink, Activity, 
  Pill, Briefcase, Info, Upload, LogOut, Save, ShieldCheck,
  Ban, Wine, Flame, Target
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, useMemoFirebase, useAuth } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { AnalysisHistoryDialog } from './analysis-history-dialog';

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

export function ProfileCabinet({ onNavigateToDiary }: { onNavigateToDiary?: () => void }) {
  const { user } = useUser();
  const { auth } = useAuth();
  const { firestore } = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userDocRef = useMemoFirebase(() => user?.uid ? doc(firestore!, 'users', user.uid) : null, [user?.uid, firestore]);
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

  useEffect(() => {
    if (userData) {
      const sanitizedData: any = { ...userData };
      Object.keys(profileSchema.shape).forEach(key => {
        if (sanitizedData[key] === undefined || sanitizedData[key] === null) {
          if (key === 'weight' || key === 'height' || key === 'workHoursPerDay') {
            sanitizedData[key] = 0;
          } else if (key === 'gender') {
            sanitizedData[key] = 'мужской';
          } else if (key === 'profileType') {
            sanitizedData[key] = 'user';
          } else {
            sanitizedData[key] = '';
          }
        }
      });
      form.reset(sanitizedData); 
    } 
  }, [userData, form]);

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
    if (!user?.uid || !firestore) return;
    setLoading(true);
    try {
      await setDoc(doc(firestore, 'users', user.uid), { 
        ...values, 
        id: user.uid, 
        updatedAt: new Date().toISOString() 
      }, { merge: true });
      
      toast({ title: 'Профиль успешно обновлен' });
    } catch (e: any) {
      console.error("Save error:", e);
      toast({ 
        variant: 'destructive', 
        title: 'Ошибка сохранения', 
        description: 'Убедитесь, что все поля заполнены корректно.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      router.push('/');
      toast({ title: 'Выход выполнен' });
    } catch (error) { toast({ variant: 'destructive', title: 'Ошибка выхода' }); }
  };

  const isSpecialist = form.watch('profileType') === 'specialist';

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
          {/* ФОТО */}
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

          {/* 1. ЛИЧНЫЕ ДАННЫЕ */}
          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-primary/60 px-2 flex items-center gap-2"><Info className="h-4 w-4" /> 1. Личные данные</h3>
            <Card className="cyber-card bg-blue-950/40 p-8 space-y-6 border-white/5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="firstName" render={({ field }) => (<FormItem><FormLabel>Имя</FormLabel><FormControl><Input {...field} className="h-14 rounded-2xl bg-white/5 border-white/10 text-white" /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="lastName" render={({ field }) => (<FormItem><FormLabel>Фамилия</FormLabel><FormControl><Input {...field} className="h-14 rounded-2xl bg-white/5 border-white/10 text-white" /></FormControl></FormItem>)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="birthDate" render={({ field }) => (<FormItem><FormLabel>Дата рождения</FormLabel><FormControl><Input {...field} placeholder="01.01.1990" className="h-14 rounded-2xl bg-white/5 border-white/10 text-white" /></FormControl></FormItem>)} />
                <FormField control={form.control} name="profileType" render={({ field }) => (
                  <FormItem><FormLabel>Роль в системе</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-14 rounded-2xl bg-white/5 border-white/10"><SelectValue /></SelectTrigger></FormControl><SelectContent className="bg-slate-950 border-white/10 text-white"><SelectItem value="user">Пользователь (Био-хакер)</SelectItem><SelectItem value="specialist">Специалист (Врач / Эксперт)</SelectItem></SelectContent></Select></FormItem>
                )} />
              </div>
            </Card>
          </div>

          {/* 2. БИОМЕТРИЯ */}
          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-primary/60 px-2 flex items-center gap-2"><Activity className="h-4 w-4" /> 2. Биометрия</h3>
            <Card className="cyber-card bg-blue-950/40 p-8 space-y-6 border-white/5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="gender" render={({ field }) => (
                  <FormItem><FormLabel>Пол</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-14 rounded-2xl bg-white/5 border-white/10"><SelectValue /></SelectTrigger></FormControl><SelectContent className="bg-slate-950 border-white/10 text-white"><SelectItem value="мужской">Мужской</SelectItem><SelectItem value="женский">Женский</SelectItem></SelectContent></Select></FormItem>
                )} />
                <FormField control={form.control} name="weight" render={({ field }) => (<FormItem><FormLabel>Вес (кг)</FormLabel><FormControl><Input type="number" {...field} className="h-14 rounded-2xl bg-white/5 border-white/10 text-white" /></FormControl></FormItem>)} />
                <FormField control={form.control} name="height" render={({ field }) => (<FormItem><FormLabel>Рост (см)</FormLabel><FormControl><Input type="number" {...field} className="h-14 rounded-2xl bg-white/5 border-white/10 text-white" /></FormControl></FormItem>)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField control={form.control} name="activityLevel" render={({ field }) => (
                    <FormItem><FormLabel>Уровень активности</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-14 rounded-2xl bg-white/5 border-white/10"><SelectValue /></SelectTrigger></FormControl><SelectContent className="bg-slate-950 border-white/10 text-white"><SelectItem value="minimal">Сидячий образ жизни</SelectItem><SelectItem value="low">Низкая нагрузка</SelectItem><SelectItem value="moderate">Умеренная нагрузка</SelectItem><SelectItem value="high">Высокая активность</SelectItem><SelectItem value="athlete">Профессиональный спорт</SelectItem></SelectContent></Select></FormItem>
                 )} />
                 <FormField control={form.control} name="healthGoal" render={({ field }) => (
                    <FormItem><FormLabel>Основная цель</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-14 rounded-2xl bg-white/5 border-white/10"><SelectValue /></SelectTrigger></FormControl><SelectContent className="bg-slate-950 border-white/10 text-white"><SelectItem value="снизить массу тела">Снижение веса</SelectItem><SelectItem value="поддержать текущее состояние">Поддержание формы</SelectItem><SelectItem value="набор массы">Набор мышечной массы</SelectItem></SelectContent></Select></FormItem>
                 )} />
              </div>
            </Card>
          </div>

          {/* 3. ОБРАЗ ЖИЗНИ (ВОССТАНОВЛЕНО) */}
          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-primary/60 px-2 flex items-center gap-2"><Flame className="h-4 w-4" /> 3. Образ жизни</h3>
            <Card className="cyber-card bg-blue-950/40 p-8 space-y-6 border-white/5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="smoking" render={({ field }) => (
                  <FormItem><FormLabel className="flex items-center gap-2"><Ban className="h-4 w-4" /> Курение</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-14 rounded-2xl bg-white/5 border-white/10"><SelectValue /></SelectTrigger></FormControl><SelectContent className="bg-slate-950 border-white/10 text-white"><SelectItem value="нет">Не курю</SelectItem><SelectItem value="да">Курю</SelectItem></SelectContent></Select></FormItem>
                )} />
                <FormField control={form.control} name="alcohol" render={({ field }) => (
                  <FormItem><FormLabel className="flex items-center gap-2"><Wine className="h-4 w-4" /> Алкоголь</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-14 rounded-2xl bg-white/5 border-white/10"><SelectValue /></SelectTrigger></FormControl><SelectContent className="bg-slate-950 border-white/10 text-white"><SelectItem value="не употребляю">Не употребляю</SelectItem><SelectItem value="редко">Редко (раз в месяц)</SelectItem><SelectItem value="умеренно">Умеренно</SelectItem><SelectItem value="часто">Часто</SelectItem></SelectContent></Select></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField control={form.control} name="favoriteFoods" render={({ field }) => (<FormItem><FormLabel>Любимые продукты</FormLabel><FormControl><Input {...field} placeholder="Напр: Лосось, орехи..." className="h-14 rounded-2xl bg-white/5 border-white/10" /></FormControl></FormItem>)} />
                 <FormField control={form.control} name="dislikedFoods" render={({ field }) => (<FormItem><FormLabel>Исключить из рациона</FormLabel><FormControl><Input {...field} placeholder="Напр: Сахар, молоко..." className="h-14 rounded-2xl bg-white/5 border-white/10" /></FormControl></FormItem>)} />
              </div>
              <FormField control={form.control} name="medications" render={({ field }) => (
                 <FormItem><FormLabel className="flex items-center gap-2"><Pill className="h-4 w-4" /> Текущие лекарства и БАДы</FormLabel><FormControl><Textarea {...field} placeholder="Перечислите препараты, которые вы принимаете на постоянной основе..." className="min-h-[100px] rounded-2xl bg-white/5 border-white/10 resize-none" /></FormControl></FormItem>
              )} />
            </Card>
          </div>

          {/* 4. РАБОТА И НАГРУЗКА (ВОССТАНОВЛЕНО) */}
          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-primary/60 px-2 flex items-center gap-2"><Briefcase className="h-4 w-4" /> 4. Работа и нагрузка</h3>
            <Card className="cyber-card bg-blue-950/40 p-8 space-y-6 border-white/5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="occupation" render={({ field }) => (<FormItem><FormLabel>Профессия</FormLabel><FormControl><Input {...field} placeholder="Напр: Программист" className="h-14 rounded-2xl bg-white/5 border-white/10 text-white" /></FormControl></FormItem>)} />
                <FormField control={form.control} name="workActivityType" render={({ field }) => (
                  <FormItem><FormLabel>Тип нагрузки</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-14 rounded-2xl bg-white/5 border-white/10"><SelectValue /></SelectTrigger></FormControl><SelectContent className="bg-slate-950 border-white/10 text-white"><SelectItem value="mental">Умственная</SelectItem><SelectItem value="physical">Физическая</SelectItem></SelectContent></Select></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="workHoursPerDay" render={({ field }) => (
                <FormItem><FormLabel className="flex items-center gap-2"><Clock className="h-4 w-4" /> Рабочих часов в день</FormLabel><FormControl><Input type="number" {...field} className="h-14 rounded-2xl bg-white/5 border-white/10 text-white" /></FormControl></FormItem>
              )} />
            </Card>
          </div>

          {isSpecialist && (
            <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
              <h3 className="text-sm font-black uppercase tracking-widest text-[#00ffff]/60 px-2 flex items-center gap-2"><Briefcase className="h-4 w-4" /> 5. Рабочее пространство</h3>
              <Card className="cyber-card bg-[#00ffff]/5 p-8 border-[#00ffff]/20 flex flex-col md:flex-row items-center justify-between gap-6">
                 <div className="space-y-1 text-center md:text-left">
                    <h4 className="text-xl font-black text-white uppercase tracking-tight">Дневник специалиста</h4>
                    <p className="text-xs text-white/40 font-medium">Управление локальными файлами и записями о пациентах.</p>
                 </div>
                 <Button type="button" onClick={onNavigateToDiary} className="h-14 px-10 rounded-2xl bg-[#00ffff] text-slate-950 font-black uppercase text-xs shadow-xl shadow-[#00ffff]/20 gap-2">
                    <ShieldCheck className="h-4 w-4" /> ОТКРЫТЬ ДНЕВНИК
                 </Button>
              </Card>
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full h-20 rounded-2xl bg-primary text-slate-950 font-black text-2xl shadow-[0_0_50px_rgba(0,255,255,0.4)] hover:scale-[1.02] active:scale-95 transition-all">
            {loading ? <Loader2 className="animate-spin h-8 w-8" /> : <><Save className="mr-3 h-8 w-8" /> СОХРАНИТЬ ИЗМЕНЕНИЯ</>}
          </Button>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <Card className="cyber-card bg-blue-950/40 p-8 flex flex-col gap-4 border-white/5">
                <h3 className="font-black uppercase flex items-center gap-2 text-white/60 text-xs tracking-widest"><Smartphone className="h-5 w-5 text-primary" /> Уведомления</h3>
                <Button type="button" variant="outline" onClick={() => window.open(`https://t.me/web3cyberservices_bot?start=${user?.uid}`, '_blank')} className="h-14 rounded-xl bg-white/5 border-white/10 text-white gap-3 uppercase font-black">Telegram <ExternalLink className="h-3 w-3 opacity-30" /></Button>
             </Card>
             <Card className="cyber-card bg-blue-950/40 p-8 flex flex-col gap-4 border-white/5">
                <h3 className="font-black uppercase flex items-center gap-2 text-white/60 text-xs tracking-widest"><Activity className="h-5 w-5 text-primary" /> Архив</h3>
                <AnalysisHistoryDialog><Button type="button" className="h-14 rounded-xl bg-white/5 text-primary border-primary/20 font-black uppercase">Открыть архив</Button></AnalysisHistoryDialog>
             </Card>
          </div>

          <div className="pt-10 flex justify-center">
             <Button variant="ghost" onClick={handleLogout} className="text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-xl gap-2 font-black uppercase text-[10px] tracking-widest">
                <LogOut className="h-4 w-4" /> ВЫЙТИ ИЗ СИСТЕМЫ
             </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
