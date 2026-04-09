'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Upload, Sparkles, X, Loader2, Activity, FlaskConical, Stethoscope, CheckCircle2, Watch, Smartphone, Bluetooth, Trophy, Timer, Zap, Heart, Calendar as CalendarIcon, Footprints, Moon, RefreshCw, MessageSquare } from 'lucide-react';
import { analyzeMeal, AnalyzeMealOutput } from '@/ai/flows/analyze-meal';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface UnifiedDataEntryProps {
  children: React.ReactNode;
  selectedDate?: Date;
}

export function UnifiedDataEntry({ children, selectedDate = new Date() }: UnifiedDataEntryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('meal');
  const [description, setDescription] = useState('');
  const [refinement, setRefinement] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [mealResult, setMealResult] = useState<AnalyzeMealOutput | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [connectingDevice, setConnectingDevice] = useState<string | null>(null);
  
  const [steps, setSteps] = useState<string>('');
  const [heartRate, setHeartRate] = useState<string>('');
  const [sleep, setSleep] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setShowCamera(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setHasCameraPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Доступ отклонен',
        description: 'Включите камеру в настройках.',
      });
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
        setImage(canvas.toDataURL('image/jpeg'));
        stopCamera();
      }
    }
  };

  const connectDevice = async (name: string) => {
    setConnectingDevice(name);
    await new Promise(r => setTimeout(r, 1500));
    setConnectingDevice(null);
    toast({ title: 'Готово', description: `${name} синхронизирован.` });
    setSteps('9200'); setHeartRate('68'); setSleep('8.2');
  };

  const addActivity = (activity: string) => {
    setDescription(prev => prev ? `${prev}, ${activity}` : activity);
  };

  const handleSubmit = async (isRefinement = false) => {
    if (!description && !image && !steps && !heartRate && !sleep && !refinement) {
      toast({ variant: 'destructive', title: 'Пусто', description: 'Введите данные.' });
      return;
    }

    setLoading(true);
    try {
      if (activeTab === 'meal') {
        const result = await analyzeMeal({
          description,
          photoDataUri: image || undefined,
          refinement: isRefinement ? refinement : undefined,
        });
        setMealResult(result);
        if (isRefinement) setRefinement('');
      } else {
        await new Promise(r => setTimeout(r, 1000));
        setIsSuccess(true);
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Не удалось обработать.' });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setDescription(''); setRefinement(''); setImage(null); setMealResult(null);
    setIsSuccess(false); setHasCameraPermission(null); setSteps(''); setHeartRate(''); setSleep('');
    stopCamera();
  };

  const sports = [
    { name: 'Бег', icon: Timer }, { name: 'Футбол', icon: Activity },
    { name: 'Теннис', icon: Trophy }, { name: 'Зал', icon: Zap },
    { name: 'Йога', icon: Heart }, { name: 'Плавание', icon: Activity }
  ];

  const inputClasses = "h-14 rounded-xl bg-primary/90 border-none font-bold text-white text-lg placeholder:text-white/40 focus:ring-4 focus:ring-white/20";
  const textareaClasses = "min-h-[150px] rounded-3xl bg-primary/90 border-none p-6 text-lg font-medium text-white resize-none placeholder:text-white/40 focus:ring-4 focus:ring-white/20";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) reset(); }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[650px] rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-10 bg-primary text-white">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-3xl font-black tracking-tight">Био-Центр</DialogTitle>
            <Badge className="bg-white/20 text-white border-none px-4 py-2 rounded-xl flex gap-2 font-bold backdrop-blur-md">
              <CalendarIcon className="h-4 w-4" /> {format(selectedDate, 'd MMMM', { locale: ru })}
            </Badge>
          </div>
        </DialogHeader>
        
        <div className="p-8 space-y-6 max-h-[80vh] overflow-y-auto no-scrollbar">
          {!mealResult && !isSuccess ? (
            <>
              <Tabs defaultValue="meal" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5 rounded-2xl h-14 bg-muted/50 p-1">
                  <TabsTrigger value="meal" className="rounded-xl font-bold gap-2 text-[10px]"><Activity className="h-4 w-4" /> Еда</TabsTrigger>
                  <TabsTrigger value="activities" className="rounded-xl font-bold gap-2 text-[10px]"><Trophy className="h-4 w-4" /> Спорт</TabsTrigger>
                  <TabsTrigger value="labs" className="rounded-xl font-bold gap-2 text-[10px]"><FlaskConical className="h-4 w-4" /> Анализы</TabsTrigger>
                  <TabsTrigger value="health" className="rounded-xl font-bold gap-2 text-[10px]"><Stethoscope className="h-4 w-4" /> Жалобы</TabsTrigger>
                  <TabsTrigger value="devices" className="rounded-xl font-bold gap-2 text-[10px]"><Watch className="h-4 w-4" /> Гаджеты</TabsTrigger>
                </TabsList>
                
                <TabsContent value="activities" className="mt-8 space-y-6 animate-in fade-in duration-300">
                   <div className="grid grid-cols-3 gap-3">
                    {sports.map((sport) => (
                      <Button key={sport.name} variant="outline" className="h-20 rounded-2xl flex flex-col gap-1 border-2" onClick={() => addActivity(sport.name)}>
                        <sport.icon className="h-5 w-5 text-primary" />
                        <span className="text-xs font-bold">{sport.name}</span>
                      </Button>
                    ))}
                  </div>
                  <Textarea placeholder="Опишите активности..." value={description} onChange={(e) => setDescription(e.target.value)} className={textareaClasses} />
                  <Button className="w-full h-20 rounded-[1.75rem] text-2xl font-black bg-primary" onClick={() => handleSubmit(false)}>Сохранить</Button>
                </TabsContent>

                <TabsContent value="devices" className="mt-8 space-y-8 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2"><Footprints className="h-3 w-3" /> Шаги</label>
                      <Input placeholder="0" value={steps} onChange={e => setSteps(e.target.value)} type="number" className={inputClasses} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2"><Heart className="h-3 w-3" /> Пульс</label>
                      <Input placeholder="0" value={heartRate} onChange={e => setHeartRate(e.target.value)} type="number" className={inputClasses} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2"><Moon className="h-3 w-3" /> Сон (ч)</label>
                      <Input placeholder="0" value={sleep} onChange={e => setSleep(e.target.value)} type="number" className={inputClasses} />
                    </div>
                  </div>
                  <Button className="w-full h-20 rounded-[1.75rem] text-2xl font-black bg-primary" onClick={() => handleSubmit(false)}>Сохранить биометрию</Button>
                </TabsContent>

                <TabsContent value="meal" className="mt-8 space-y-6">
                  <Textarea placeholder="Что вы съели?..." value={description} onChange={(e) => setDescription(e.target.value)} className={textareaClasses} />
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="h-28 rounded-[2rem] border-dashed border-2 flex flex-col gap-2" onClick={startCamera}>
                      <Camera className="h-8 w-8 text-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Камера</span>
                    </Button>
                    <label className="cursor-pointer">
                      <div className="h-28 rounded-[2rem] border-dashed border-2 flex flex-col gap-2 items-center justify-center">
                        <Upload className="h-8 w-8 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Файл</span>
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                    </label>
                  </div>
                  {showCamera && (
                    <div className="relative rounded-[2.5rem] overflow-hidden bg-black aspect-video">
                      <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
                        <Button onClick={capturePhoto} className="rounded-full w-14 h-14 bg-white text-primary"><Camera className="h-7 w-7" /></Button>
                        <Button onClick={stopCamera} variant="destructive" className="rounded-full w-14 h-14"><X className="h-7 w-7" /></Button>
                      </div>
                    </div>
                  )}
                  {image && !showCamera && <img src={image} className="rounded-[2.5rem] w-full aspect-video object-cover" />}
                  <Button className="w-full h-20 rounded-[1.75rem] text-2xl font-black bg-primary" onClick={() => handleSubmit(false)} disabled={loading}>
                    {loading ? <Loader2 className="mr-3 h-8 w-8 animate-spin" /> : <Sparkles className="mr-3 h-8 w-8" />} Распознать AI
                  </Button>
                </TabsContent>

                <TabsContent value="labs" className="mt-8 space-y-6">
                   <Textarea placeholder="Результаты анализов..." value={description} onChange={(e) => setDescription(e.target.value)} className={textareaClasses} />
                   <Button className="w-full h-20 rounded-[1.75rem] text-2xl font-black bg-primary" onClick={() => handleSubmit(false)}>Загрузить</Button>
                </TabsContent>
                <TabsContent value="health" className="mt-8 space-y-6">
                   <Textarea placeholder="Опишите жалобы..." value={description} onChange={(e) => setDescription(e.target.value)} className={textareaClasses} />
                   <Button className="w-full h-20 rounded-[1.75rem] text-2xl font-black bg-primary" onClick={() => handleSubmit(false)}>Отправить</Button>
                </TabsContent>
              </Tabs>
            </>
          ) : mealResult ? (
            <div className="space-y-8 animate-in fade-in duration-500">
               <div className="text-center space-y-2">
                <Badge className="bg-primary/10 text-primary border-none px-6 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px]">AI Распознано</Badge>
                <h3 className="text-4xl font-black tracking-tight">{mealResult.mealName}</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 {[
                   { label: 'Ккал', val: mealResult.calories, unit: '', bg: 'bg-primary/5' },
                   { label: 'Белки', val: mealResult.protein, unit: 'г', bg: 'bg-secondary/10' },
                   { label: 'Жиры', val: mealResult.fat, unit: 'г', bg: 'bg-accent/20' },
                   { label: 'Углеводы', val: mealResult.carbs, unit: 'г', bg: 'bg-muted' }
                 ].map((stat, i) => (
                   <div key={i} className={cn("p-6 rounded-[2rem] flex flex-col items-center justify-center text-center", stat.bg)}>
                     <p className="text-3xl font-black">{stat.val}{stat.unit}</p>
                     <p className="text-[11px] font-bold uppercase tracking-widest opacity-70">{stat.label}</p>
                   </div>
                 ))}
              </div>
              <div className="bg-muted/30 p-6 rounded-[2rem]">
                <p className="text-sm font-medium italic text-foreground/80 leading-relaxed italic">"{mealResult.analysis}"</p>
              </div>

              {/* Refinement Loop UI in Unified Center */}
              <div className="space-y-3 pt-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <MessageSquare className="h-3 w-3" /> Ошибка в составе? Уточните детали
                </label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Например: 'это был борщ без картофеля'"
                    value={refinement}
                    onChange={(e) => setRefinement(e.target.value)}
                    className="h-12 rounded-xl bg-primary/10 border-none font-bold placeholder:text-primary/40 focus:ring-2 focus:ring-primary/20"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-12 w-12 rounded-xl bg-primary text-white shrink-0 hover:bg-primary/90"
                    onClick={() => handleSubmit(true)}
                    disabled={loading || !refinement}
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
                  </Button>
                </div>
              </div>

              <Button className="w-full h-18 rounded-2xl font-black text-xl" onClick={reset}>Готово</Button>
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center text-center space-y-6 animate-in zoom-in duration-500">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center"><CheckCircle2 className="h-12 w-12 text-primary" /></div>
              <h3 className="text-3xl font-black">Данные обновлены!</h3>
              <Button className="w-64 h-16 rounded-2xl font-bold text-lg" onClick={reset}>Понятно</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
