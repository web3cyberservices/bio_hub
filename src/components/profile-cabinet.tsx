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
  User, Loader2, Smartphone, Send, ExternalLink, Activity, Pill, Mic, Briefcase, Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
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
});

type ProfileValues = z.infer<typeof profileSchema>;

export function ProfileCabinet() {
  const { user } = useUser();
  const { firestore } = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [recordingField, setRecordingField] = useState<string | null>(null);

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
    },
  });

  const profileType = form.watch('profileType');

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
      }); 
    } 
  }, [userData, form]);

  const onSubmit = async (values: ProfileValues) => {
    if (!user || !firestore) return;

    setLoading(true);
    try {
      await setDoc(doc(firestore, 'users', user.uid), {
        ...values,
        id: user.uid,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      toast({ title: 'Профиль обновлен', description: 'Данные успешно сохранены.' });
    } catch (e: any) {
      toast({ 
        variant: 'destructive', 
        title: 'Ошибка сохранения', 
        description: e.message || 'Проверьте соединение с базой данных.' 
      });
    } finally { 
      setLoading(false); 
    }
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
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700 pb-32 px-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30">
          <User className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-4xl font-black uppercase text-white tracking-tighter leading-none">Кабинет</h2>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="cyber-card bg-blue-950/40 p-8 space-y-8 border-white/5">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="profileType" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase text-white/40 tracking-widest px-1">Ваша роль</FormLabel>
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
                <FormField control={form.control} name="firstName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase text-white/40 tracking-widest px-1">Имя</FormLabel>
                    <FormControl><Input {...field} className="h-14 rounded-2xl bg-white/5 border-white/10 text-white font-bold" /></FormControl>
                  </FormItem>
                )} />
             </div>

             {profileType === 'specialist' && (
               <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
                  <FormField control={form.control} name="specialization" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase text-primary/60 tracking-widest px-1 flex items-center gap-2">
                        <Briefcase className="h-3 w-3" /> Специализация
                      </FormLabel>
                      <FormControl><Input {...field} placeholder="Напр: Эндокринолог, Нутрициолог..." className="h-14 rounded-2xl bg-primary/5 border-primary/20 text-white font-bold" /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="bio" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase text-primary/60 tracking-widest px-1">О себе / Опыт</FormLabel>
                      <FormControl><Textarea {...field} className="min-h-[120px] rounded-2xl bg-primary/5 border-primary/20 text-white text-lg font-medium resize-none shadow-inner" /></FormControl>
                    </FormItem>
                  )} />
               </div>
             )}
             
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

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="healthGoal" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase text-white/40 tracking-widest px-1">Цель здоровья</FormLabel>
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
                    <FormLabel className="text-[10px] font-black uppercase text-white/40 tracking-widest px-1">Уровень активности</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                       <FormControl>
                        <SelectTrigger className="h-14 rounded-2xl bg-white/5 border-white/10 text-white font-bold">
                          <SelectValue />
                        </SelectTrigger>
                       </FormControl>
                       <SelectContent className="bg-slate-900 border-white/10 text-white rounded-xl">
                          <SelectItem value="minimal">Минимальный (сидячий)</SelectItem>
                          <SelectItem value="low">Низкий (1-3 тренировки)</SelectItem>
                          <SelectItem value="moderate">Средний (3-5 тренировок)</SelectItem>
                          <SelectItem value="high">Высокий (ежедневно)</SelectItem>
                          <SelectItem value="athlete">Атлет (2 раза в день)</SelectItem>
                       </SelectContent>
                    </Select>
                  </FormItem>
                )} />
             </div>

             <FormField control={form.control} name="medications" render={({ field }) => (
               <FormItem>
                <FormLabel className="text-[10px] font-black uppercase text-white/40 tracking-widest px-1 flex items-center gap-2">
                  <Pill className="h-3 w-3 text-primary" /> Лекарства и БАДы
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Textarea {...field} placeholder="Какие препараты вы принимаете?" className="min-h-[100px] rounded-2xl bg-white/5 border-white/10 text-white text-lg font-medium resize-none shadow-inner" />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => startVoiceInput('medications')} 
                      className={cn(
                        "absolute right-3 top-3 h-10 w-10 rounded-full shadow-lg transition-all", 
                        recordingField === 'medications' ? "bg-red-500 text-white animate-pulse" : "bg-white/10 text-primary hover:bg-white/20"
                      )}
                    >
                      <Mic className="h-4 w-4" />
                    </Button>
                  </div>
                </FormControl>
               </FormItem>
             )} />
          </Card>
          
          <Button 
            type="submit" 
            disabled={loading} 
            className="w-full h-18 rounded-2xl bg-primary text-slate-950 font-black text-xl shadow-[0_0_40px_rgba(0,255,255,0.3)] hover:scale-[1.01] active:scale-95 transition-all"
          >
            {loading ? <Loader2 className="animate-spin h-6 w-6" /> : 'СОХРАНИТЬ ИЗМЕНЕНИЯ'}
          </Button>

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
