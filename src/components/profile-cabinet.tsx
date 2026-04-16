
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  User, 
  Scale, 
  Ruler, 
  Calendar, 
  FlaskConical, 
  CheckCircle2, 
  Save, 
  Loader2,
  Stethoscope,
  Activity,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';

const profileSchema = z.object({
  firstName: z.string().min(1, 'Имя обязательно'),
  lastName: z.string().optional(),
  gender: z.enum(['мужской', 'женский']),
  age: z.coerce.number().int().min(1, 'Возраст обязателен'),
  weight: z.coerce.number().positive('Вес обязателен'),
  height: z.coerce.number().positive('Рост обязателен'),
  smoking: z.enum(['да', 'нет']),
  alcohol: z.enum(['не употребляю', 'редко', 'умеренно', 'часто']),
  labResults: z.string().optional(),
});

type ProfileValues = z.infer<typeof profileSchema>;

export function ProfileCabinet() {
  const { user } = useUser();
  const { firestore } = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const userDocRef = user && firestore ? doc(firestore, 'users', user.uid) : null;
  const { data: userData, loading: docLoading } = useDoc<any>(userDocRef);

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      gender: 'мужской',
      age: 30,
      weight: 70,
      height: 175,
      smoking: 'нет',
      alcohol: 'не употребляю',
      labResults: '',
    },
  });

  // Заполнение формы данными из Firestore при загрузке
  useEffect(() => {
    if (userData) {
      form.reset({
        firstName: userData.firstName || userData.displayName || '',
        lastName: userData.lastName || '',
        gender: userData.gender || 'мужской',
        age: userData.age || 30,
        weight: userData.weight || 70,
        height: userData.height || 175,
        smoking: userData.smoking || 'нет',
        alcohol: userData.alcohol || 'не употребляю',
        labResults: userData.labResults || '',
      });
    }
  }, [userData, form]);

  async function onSubmit(values: ProfileValues) {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Firebase не подключен. Нажмите "Connect to Firebase" в Studio.',
      });
      return;
    }

    setLoading(true);
    try {
      await setDoc(doc(firestore, 'users', user.uid), {
        ...values,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      toast({
        title: 'Профиль обновлен',
        description: 'Ваши биометрические данные успешно сохранены.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка сохранения',
        description: 'Не удалось обновить данные профиля.',
      });
    } finally {
      setLoading(false);
    }
  }

  if (docLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Загрузка профиля...</p>
      </div>
    );
  }

  const inputClasses = "h-14 rounded-2xl bg-white border-muted shadow-sm font-bold px-6 focus:ring-2 focus:ring-primary/20";
  const selectClasses = "h-14 rounded-2xl bg-white border-muted shadow-sm font-bold px-6";

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
          <User className="h-6 w-6 md:h-8 md:w-8 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl md:text-5xl font-black tracking-tighter">Личный кабинет</h2>
          <p className="text-muted-foreground text-xs md:text-base font-medium">Управление вашим биометрическим профилем.</p>
        </div>
      </div>

      <Card className="premium-card overflow-hidden border-none shadow-2xl">
        <CardContent className="p-8 md:p-12">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
              {/* Основные данные */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b pb-4">
                  <User className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-black uppercase tracking-tight">Персональные данные</h3>
                </div>
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                  <FormField control={form.control} name="firstName" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Имя (Или никнейм)</FormLabel>
                      <FormControl><Input placeholder="Ваше имя" {...field} className={inputClasses} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="lastName" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Фамилия (Не обязательно)</FormLabel>
                      <FormControl><Input placeholder="Ваша фамилия" {...field} className={inputClasses} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              {/* Биометрия */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b pb-4">
                  <Activity className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-black uppercase tracking-tight">Биометрические показатели</h3>
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
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex gap-2"><Calendar className="h-3 w-3" /> Возраст</FormLabel>
                      <FormControl><Input type="number" {...field} className={inputClasses} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="weight" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex gap-2"><Scale className="h-3 w-3" /> Вес (кг)</FormLabel>
                      <FormControl><Input type="number" {...field} className={inputClasses} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="height" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex gap-2"><Ruler className="h-3 w-3" /> Рост (см)</FormLabel>
                      <FormControl><Input type="number" {...field} className={inputClasses} /></FormControl>
                    </FormItem>
                  )} />
                </div>
              </div>

              {/* Привычки */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b pb-4">
                  <Settings className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-black uppercase tracking-tight">Образ жизни</h3>
                </div>
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                  <FormField control={form.control} name="smoking" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex gap-2">Курение</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className={selectClasses}><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="да">Да, курю</SelectItem>
                          <SelectItem value="нет">Нет, не курю</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="alcohol" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex gap-2">Алкоголь</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className={selectClasses}><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="не употребляю">Не употребляю</SelectItem>
                          <SelectItem value="редко">Редко (по праздникам)</SelectItem>
                          <SelectItem value="умеренно">Умеренно</SelectItem>
                          <SelectItem value="часто">Часто</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                </div>
              </div>

              {/* Анализы */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b pb-4">
                  <FlaskConical className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-black uppercase tracking-tight">Медицинские анализы</h3>
                </div>
                <FormField control={form.control} name="labResults" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-relaxed">
                      Введите результаты анализов из бел. медцентров (Инвитро, Синэво, Лодэ и др.)
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Например: Гемоглобин 145, Холестерин 4.2, Витамин D 35..." 
                        className="min-h-[150px] rounded-[1.5rem] bg-white border-muted p-6 text-sm font-medium focus:ring-4 focus:ring-primary/10" 
                        {...field} 
                      />
                    </FormControl>
                    <CardDescription className="text-[9px] font-bold uppercase tracking-widest mt-2 px-2">
                      ИИ учтет эти данные при формировании ваших рекомендаций и плана питания.
                    </CardDescription>
                  </FormItem>
                )} />
              </div>

              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full h-20 rounded-2xl text-2xl font-black bg-primary shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-95"
              >
                {loading ? (
                  <><Loader2 className="mr-4 animate-spin h-8 w-8" /> Сохранение...</>
                ) : (
                  <><Save className="mr-4 h-8 w-8" /> Сохранить в Bio-Hub</>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
