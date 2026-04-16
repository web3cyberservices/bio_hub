'use client';

import { useState, useEffect, useRef } from 'react';
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
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { 
  User, 
  Scale, 
  Ruler, 
  Calendar, 
  FlaskConical, 
  Save, 
  Loader2,
  Activity,
  Settings,
  Camera,
  Upload,
  X,
  FileText,
  Image as ImageIcon
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
  labResultsFile: z.string().optional(),
});

type ProfileValues = z.infer<typeof profileSchema>;

export function ProfileCabinet() {
  const { user } = useUser();
  const { firestore } = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [labFile, setLabFile] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

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
      labResultsFile: '',
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
        smoking: userData.smoking || 'нет',
        alcohol: userData.alcohol || 'не употребляю',
        labResults: userData.labResults || '',
        labResultsFile: userData.labResultsFile || '',
      });
      if (userData.labResultsFile) {
        setLabFile(userData.labResultsFile);
      }
    }
  }, [userData, form]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setLabFile(base64);
        form.setValue('labResultsFile', base64);
        setShowCamera(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка камеры',
        description: 'Не удалось получить доступ к камере.',
      });
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const base64 = canvas.toDataURL('image/jpeg');
        setLabFile(base64);
        form.setValue('labResultsFile', base64);
        stopCamera();
      }
    }
  };

  async function onSubmit(values: ProfileValues) {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Firebase не подключен.',
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
        description: 'Все данные, включая анализы, сохранены.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка сохранения',
        description: 'Не удалось обновить данные.',
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

  const inputClasses = "h-14 rounded-2xl bg-white border-muted shadow-sm font-bold px-6 focus:ring-2 focus:ring-primary/20 transition-all";
  const selectClasses = "h-14 rounded-2xl bg-white border-muted shadow-sm font-bold px-6 transition-all";

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
          <User className="h-6 w-6 md:h-8 md:w-8 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl md:text-5xl font-black tracking-tighter text-foreground">Личный кабинет</h2>
          <p className="text-muted-foreground text-xs md:text-base font-medium">Управление вашим биометрическим профилем.</p>
        </div>
      </div>

      <Card className="premium-card overflow-hidden border-none shadow-2xl bg-white/80 backdrop-blur-xl">
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

              {/* Образ жизни */}
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
              <div className="space-y-8">
                <div className="flex items-center gap-2 border-b pb-4">
                  <FlaskConical className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-black uppercase tracking-tight">Медицинские анализы</h3>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <FormField control={form.control} name="labResults" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-relaxed">
                        Текстовое описание показателей
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Например: Гемоглобин 145, Холестерин 4.2..." 
                          className="min-h-[200px] rounded-[1.5rem] bg-white border-muted p-6 text-sm font-medium focus:ring-4 focus:ring-primary/10 shadow-inner" 
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )} />

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Прикрепить фото или файл бланка</label>
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-28 rounded-[2rem] border-dashed border-2 flex flex-col gap-2 hover:bg-primary/5 transition-all"
                        onClick={startCamera}
                      >
                        <Camera className="h-7 w-7 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Снять фото</span>
                      </Button>
                      <label className="cursor-pointer">
                        <div className="h-28 rounded-[2rem] border-dashed border-2 flex flex-col gap-2 items-center justify-center hover:bg-primary/5 transition-all">
                          <Upload className="h-7 w-7 text-primary" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Файл</span>
                        </div>
                        <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileUpload} />
                      </label>
                    </div>

                    {showCamera && (
                      <div className="relative rounded-[2rem] overflow-hidden bg-black aspect-video shadow-2xl">
                        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                          <Button type="button" onClick={capturePhoto} className="rounded-full w-12 h-12 bg-white text-primary hover:scale-110 transition-all"><Camera className="h-6 w-6" /></Button>
                          <Button type="button" onClick={stopCamera} variant="destructive" className="rounded-full w-12 h-12"><X className="h-6 w-6" /></Button>
                        </div>
                      </div>
                    )}

                    {labFile && !showCamera && (
                      <div className="relative rounded-[2rem] overflow-hidden border p-4 bg-muted/20 group animate-in zoom-in duration-300">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                            {labFile.startsWith('data:image') ? <ImageIcon className="h-6 w-6 text-primary" /> : <FileText className="h-6 w-6 text-primary" />}
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Документ загружен</p>
                            <p className="text-xs font-bold truncate">Результат анализа</p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              setLabFile(null);
                              form.setValue('labResultsFile', '');
                            }}
                          >
                            <X className="h-5 w-5" />
                          </Button>
                        </div>
                        {labFile.startsWith('data:image') && (
                          <div className="mt-4 rounded-xl overflow-hidden aspect-video border-2 border-white">
                            <img src={labFile} alt="Analysis Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <CardDescription className="text-[9px] font-bold uppercase tracking-widest mt-2 px-2 text-muted-foreground/60">
                  ИИ проанализирует загруженные документы и учтет их в ваших биометрических рекомендациях.
                </CardDescription>
              </div>

              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full h-20 rounded-2xl text-2xl font-black bg-primary shadow-xl shadow-primary/20 hover:scale-[1.01] transition-all active:scale-95"
              >
                {loading ? (
                  <><Loader2 className="mr-4 animate-spin h-8 w-8" /> Сохранение...</>
                ) : (
                  <><Save className="mr-4 h-8 w-8" /> Сохранить профиль</>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
