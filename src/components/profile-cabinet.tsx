'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { 
  User, Loader2, Smartphone, ExternalLink, Activity, 
  Info, Upload, LogOut, Save
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, useMemoFirebase, useAuth } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { syncToObsidian } from '@/lib/obsidian-sync';

const AnalysisHistoryDialog = dynamic(() => import('./analysis-history-dialog').then(m => m.AnalysisHistoryDialog), { ssr: false });

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
      profileType: 'user'
    },
  });

  useEffect(() => {
    if (userData) {
      const sanitizedData: any = { ...userData };
      // Санитарная очистка: заменяем null на пустые строки для валидации Zod
      Object.keys(profileSchema.shape).forEach(key => {
        if (sanitizedData[key] === undefined || sanitizedData[key] === null) {
          sanitizedData[key] = (key === 'weight' || key === 'height' || key === 'workHoursPerDay') ? 0 : 
                          (key === 'gender') ? 'мужской' :
                          (key === 'profileType') ? 'user' : '';
        }
      });
      form.reset(sanitizedData);
    } 
  }, [userData, form]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue('photoUrl', reader.result as string);
        toast({ title: 'Фото готово к сохранению' });
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values: ProfileValues) => {
    if (!user?.uid || !firestore) return;
    setLoading(true);
    try {
      await setDoc(doc(firestore, 'users', user.uid), { ...values, id: user.uid, updatedAt: new Date().toISOString() }, { merge: true });
      if (userData?.obsidianConnected) {
        await syncToObsidian({ type: 'profile', payload: values });
      }
      toast({ title: 'Профиль обновлен' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Ошибка сохранения' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/');
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
                {form.watch('photoUrl') ? (
                  <img src={form.watch('photoUrl')} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><User className="h-12 w-12 text-white/20" /></div>
                )}
              </div>
              <div className="flex-1 w-full">
                <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer border-2 border-dashed border-white/10 rounded-2xl p-6 bg-white/5 hover:bg-white/10 transition-all text-center">
                  <Upload className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-sm font-black text-white uppercase">Загрузить фото</p>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-primary/60 px-2 flex items-center gap-2"><Info className="h-4 w-4" /> Личные данные</h3>
            <Card className="cyber-card bg-blue-950/40 p-8 space-y-6 border-white/5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="firstName" render={({ field }) => (<FormItem><FormLabel>Имя</FormLabel><FormControl><Input {...field} className="h-14 rounded-2xl bg-white/5 border-white/10 text-white" /></FormControl></FormItem>)} />
                <FormField control={form.control} name="profileType" render={({ field }) => (
                  <FormItem><FormLabel>Роль</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-14 rounded-2xl bg-white/5 border-white/10"><SelectValue /></SelectTrigger></FormControl><SelectContent className="bg-slate-950 border-white/10 text-white"><SelectItem value="user">Пользователь</SelectItem><SelectItem value="specialist">Специалист</SelectItem></SelectContent></Select></FormItem>
                )} />
              </div>
            </Card>
          </div>

          {form.watch('profileType') === 'specialist' && (
            <div className="space-y-6">
              <Card className="cyber-card bg-[#00ffff]/5 p-8 border-[#00ffff]/20 flex flex-col md:flex-row items-center justify-between gap-6">
                 <div className="space-y-1 text-center md:text-left">
                    <h4 className="text-xl font-black text-white uppercase tracking-tight">Рабочая область</h4>
                    <p className="text-xs text-white/40 font-medium">Управление локальными файлами и пациентами.</p>
                 </div>
                 <Button type="button" onClick={onNavigateToDiary} className="h-14 px-10 rounded-2xl bg-[#00ffff] text-slate-950 font-black uppercase text-xs shadow-xl shadow-[#00ffff]/20">
                    ОТКРЫТЬ ДНЕВНИК
                 </Button>
              </Card>
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full h-20 rounded-2xl bg-primary text-slate-950 font-black text-2xl shadow-[0_0_50px_rgba(0,255,255,0.4)] hover:scale-[1.02] active:scale-95 transition-all">
            {loading ? <Loader2 className="animate-spin h-8 w-8" /> : 'СОХРАНИТЬ ИЗМЕНЕНИЯ'}
          </Button>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <Card className="cyber-card bg-blue-950/40 p-8 flex flex-col gap-4 border-white/5">
                <h3 className="font-black uppercase flex items-center gap-2 text-white/60 text-xs tracking-widest"><Smartphone className="h-5 w-5 text-primary" /> Telegram</h3>
                <Button type="button" variant="outline" onClick={() => window.open(`https://t.me/web3cyberservices_bot?start=${user?.uid}`, '_blank')} className="h-14 rounded-xl bg-white/5 border-white/10 text-white gap-3 uppercase font-black">Подключить <ExternalLink className="h-3 w-3 opacity-30" /></Button>
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
