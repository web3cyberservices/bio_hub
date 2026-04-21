
'use client';

import { useState, useEffect } from 'react';
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
  Ban
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
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
  favoriteFoods: z.string().optional(),
  dislikedFoods: z.string().optional(),
});

type ProfileValues = z.infer<typeof profileSchema>;

export function ProfileCabinet() {
  const { user } = useUser();
  const { firestore } = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

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
      gender: 'мужской',
      age: 30,
      weight: 70,
      height: 175,
      activityLevel: 'средний',
      healthGoal: 'поддержать текущее состояние',
      smoking: 'нет',
      alcohol: 'не употребляю',
      favoriteFoods: '',
      dislikedFoods: '',
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
        favoriteFoods: userData.favoriteFoods || '',
        dislikedFoods: userData.dislikedFoods || '',
      });
    }
  }, [userData, form]);

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
      await setDoc(doc(firestore, 'users', user.uid), {
        ...values,
        id: user.uid,
        email: user.email,
        profileType: 'RegularUser',
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      toast({
        title: 'Данные сохранены',
        description: 'Ваш био-профиль успешно обновлен.',
      });
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        variant: 'destructive',
        title: 'Ошибка сохранения',
        description: error.message || 'Проверьте соединение с интернетом.',
      });
    } finally {
      setLoading(false);
    }
  }

  if (docLoading && user && user.uid !== 'public-user') {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Загрузка данных...</p>
      </div>
    );
  }

  const inputClasses = "h-14 rounded-2xl bg-white border-muted shadow-sm font-bold px-6 focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50";
  const textareaClasses = "min-h-[100px] rounded-2xl bg-white border-muted shadow-sm font-bold px-6 py-4 focus:ring-2 focus:ring-primary/20 transition-all resize-none";
  const selectClasses = "h-14 rounded-2xl bg-white border-muted shadow-sm font-bold px-6 transition-all";

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
          <User className="h-6 w-6 md:h-8 md:w-8 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl md:text-5xl font-black tracking-tighter text-foreground leading-none">Личный кабинет</h2>
          <p className="text-muted-foreground text-xs md:text-base font-medium">Ваши биометрические данные и настройки аккаунта.</p>
        </div>
      </div>

      <Card className="premium-card border-none shadow-xl bg-white/60 backdrop-blur-md overflow-hidden mb-6">
        <CardContent className="p-8 space-y-6">
          <div className="flex items-center gap-2 border-b pb-4">
            <Fingerprint className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-black uppercase tracking-tight">Аккаунт</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email</label>
              <div className="flex items-center gap-3 h-14 bg-muted/30 rounded-2xl px-6 font-bold text-muted-foreground border">
                <Mail className="h-4 w-4 opacity-40" />
                {user?.email || 'Не указан (Анонимный вход)'}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">User ID</label>
              <div className="flex items-center gap-3 h-14 bg-muted/30 rounded-2xl px-6 font-mono text-[10px] text-muted-foreground/60 border overflow-hidden">
                {user?.uid}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="premium-card overflow-hidden border-none shadow-2xl bg-white/80 backdrop-blur-xl">
        <CardContent className="p-8 md:p-12">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b pb-4">
                  <User className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-black uppercase tracking-tight">Профиль</h3>
                </div>
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                  <FormField control={form.control} name="firstName" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Имя</FormLabel>
                      <FormControl><Input placeholder="Имя" {...field} className={inputClasses} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="lastName" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Фамилия</FormLabel>
                      <FormControl><Input placeholder="Фамилия" {...field} className={inputClasses} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b pb-4">
                  <Heart className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-black uppercase tracking-tight">Гастро-предпочтения</h3>
                </div>
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                  <FormField control={form.control} name="favoriteFoods" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Heart className="h-3 w-3 text-red-500 fill-red-500" /> Любимая еда
                      </FormLabel>
                      <FormControl><Textarea placeholder="Что вы любите? (например: авокадо, лосось, орехи)" {...field} className={textareaClasses} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="dislikedFoods" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Ban className="h-3 w-3 text-gray-400" /> Нелюбимая еда
                      </FormLabel>
                      <FormControl><Textarea placeholder="Что исключить? (например: кинза, лук, жирная свинина)" {...field} className={textareaClasses} /></FormControl>
                    </FormItem>
                  )} />
                </div>
                <p className="text-[9px] text-muted-foreground italic px-2">Эти данные будут использоваться ИИ при составлении вашего рациона.</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b pb-4">
                  <Target className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-black uppercase tracking-tight">Цели и Активность</h3>
                </div>
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                  <FormField control={form.control} name="healthGoal" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Цель</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className={selectClasses}><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="снизить массу тела">Снизить вес</SelectItem>
                          <SelectItem value="поддержать текущее состояние">Поддержание веса</SelectItem>
                          <SelectItem value="набор массы">Набор массы</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="activityLevel" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Активность</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className={selectClasses}><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="малоактивный">Малоактивный</SelectItem>
                          <SelectItem value="среднеактивный">Среднеактивный</SelectItem>
                          <SelectItem value="средний">Средний (3-5 тренировок)</SelectItem>
                          <SelectItem value="активный">Активный (Ежедневно)</SelectItem>
                          <SelectItem value="перенагрузка">Интенсивная</SelectItem>
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

              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b pb-4">
                  <Settings className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-black uppercase tracking-tight">Привычки</h3>
                </div>
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                  <FormField control={form.control} name="smoking" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Курение</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className={selectClasses}><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="да">Да</SelectItem>
                          <SelectItem value="нет">Нет</SelectItem>
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
                          <SelectItem value="часто">Часто</SelectItem>
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
                {loading ? <Loader2 className="animate-spin h-8 w-8" /> : <><Save className="mr-4 h-8 w-8" /> Сохранить данные</>}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
