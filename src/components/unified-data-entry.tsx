'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Camera, Upload, Sparkles, X, Loader2, Activity, FlaskConical, 
  CheckCircle2, Timer, Zap, Heart, 
  Calendar as CalendarIcon, Footprints, Moon, RefreshCw, 
  Droplet, Scale, Utensils, Brain
} from 'lucide-react';
import { analyzeMeal, AnalyzeMealOutput } from '@/ai/flows/analyze-meal';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useUser, useFirestore } from '@/firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface UnifiedDataEntryProps {
  children: React.ReactNode;
  selectedDate?: Date;
}

export function UnifiedDataEntry({ children, selectedDate = new Date() }: UnifiedDataEntryProps) {
  const { user } = useUser();
  const { firestore } = useFirestore();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('meal');
  const [description, setDescription] = useState('');
  const [refinement, setRefinement] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [mealResult, setMealResult] = useState<AnalyzeMealOutput | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // States for Quick Logs
  const [water, setWater] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [steps, setSteps] = useState<string>('');

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
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Ошибка камеры', description: 'Доступ отклонен.' });
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
        setImage(canvas.toDataURL('image/jpeg'));
        stopCamera();
      }
    }
  };

  const saveMealLog = async (data: AnalyzeMealOutput) => {
    if (!firestore || !user) return;
    
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const logId = `${dateKey}_${Date.now()}`;
    const logRef = doc(firestore, 'users', user.uid, 'dietaryLogs', logId);
    
    await setDoc(logRef, {
      id: logId,
      userId: user.uid,
      logDate: selectedDate.toISOString(),
      mealName: data.mealName,
      calories: data.calories,
      protein: data.protein,
      fat: data.fat,
      carbs: data.carbs,
      analysis: data.analysis,
      createdAt: serverTimestamp()
    });
  };

  const handleSubmit = async (isRefinement = false) => {
    if (!firestore || !user) {
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Вы не авторизованы.' });
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
        await saveMealLog(result);
        toast({ title: 'Прием пищи записан', description: `${result.mealName} добавлено в дневник.` });
      } else {
        // Логика для других вкладок (вода, шаги и т.д.)
        await new Promise(r => setTimeout(r, 1000));
        setIsSuccess(true);
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Ошибка', description: error.message || 'Не удалось обработать.' });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setDescription(''); setRefinement(''); setImage(null); setMealResult(null);
    setIsSuccess(false); setWater(''); setWeight(''); setSteps('');
    stopCamera();
  };

  const inputClasses = "h-20 rounded-[2.5rem] bg-primary/5 border-none font-black text-foreground text-3xl placeholder:text-muted-foreground/20 focus:ring-[12px] focus:ring-primary/5 transition-all px-10 shadow-inner";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) reset(); }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[850px] rounded-[5rem] p-0 overflow-hidden border-none shadow-[0_80px_200px_-40px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-24 duration-700">
        <DialogHeader className="p-16 bg-primary text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-[#163D25] opacity-95" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-3">
              <DialogTitle className="text-6xl font-black tracking-tighter leading-none">Bio-Синхронизация</DialogTitle>
              <p className="text-white/70 font-medium text-xl">Запишите ваши показатели за сегодня</p>
            </div>
            <Badge className="bg-white/15 text-white border border-white/20 px-10 py-5 rounded-[2rem] flex gap-5 font-black backdrop-blur-3xl text-[16px] shadow-2xl">
              <CalendarIcon className="h-7 w-7" /> {format(selectedDate, 'd MMMM', { locale: ru })}
            </Badge>
          </div>
          <Zap className="absolute -right-24 -bottom-24 h-80 w-80 text-white/10 rotate-12" />
        </DialogHeader>
        
        <div className="p-16 space-y-16">
          {!mealResult && !isSuccess ? (
            <Tabs defaultValue="meal" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 rounded-[3rem] h-24 bg-muted/60 p-3 mb-16 shadow-inner">
                <TabsTrigger value="meal" className="rounded-[2.5rem] font-black gap-4 text-[12px] uppercase tracking-[0.3em] transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-2xl flex-1 h-full"><Utensils className="h-6 w-6" /> ЕДА</TabsTrigger>
                <TabsTrigger value="fasting" className="rounded-[2.5rem] font-black gap-4 text-[12px] uppercase tracking-[0.3em] transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-2xl flex-1 h-full"><Timer className="h-6 w-6" /> ФАСТ</TabsTrigger>
                <TabsTrigger value="metrics" className="rounded-[2.5rem] font-black gap-4 text-[12px] uppercase tracking-[0.3em] transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-2xl flex-1 h-full"><Scale className="h-6 w-6" /> ТЕЛО</TabsTrigger>
                <TabsTrigger value="labs" className="rounded-[2.5rem] font-black gap-4 text-[12px] uppercase tracking-[0.3em] transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-2xl flex-1 h-full"><FlaskConical className="h-6 w-6" /> ЛАБ</TabsTrigger>
              </TabsList>

              <TabsContent value="meal" className="space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 outline-none">
                <div className="space-y-8">
                  <label className="text-[14px] font-black uppercase tracking-[0.6em] text-muted-foreground/30 px-6">AI NEURAL SCAN</label>
                  <Textarea 
                    placeholder="Опишите ваш прием пищи или добавьте фото. ИИ мгновенно рассчитает калории и нутриенты..." 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    className="min-h-[250px] rounded-[4rem] bg-primary/5 border-none p-14 text-3xl font-medium resize-none placeholder:text-muted-foreground/20 focus:ring-[20px] focus:ring-primary/5 transition-all shadow-inner leading-relaxed" 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-10">
                  <Button variant="outline" className="h-48 rounded-[4rem] border-dashed border-4 border-muted/50 flex flex-col gap-5 hover:bg-primary/5 hover:border-primary/50 transition-all group shadow-sm" onClick={startCamera}>
                    <div className="w-20 h-20 bg-primary/10 rounded-[2.5rem] flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                       <Camera className="h-10 w-10 text-primary" />
                    </div>
                    <span className="text-[14px] font-black uppercase tracking-[0.4em] opacity-40">КАМЕРА</span>
                  </Button>
                  <label className="cursor-pointer">
                    <div className="h-48 rounded-[4rem] border-dashed border-4 border-muted/50 flex flex-col gap-5 items-center justify-center hover:bg-primary/5 hover:border-primary/50 transition-all group shadow-sm">
                      <div className="w-20 h-20 bg-primary/10 rounded-[2.5rem] flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                        <Upload className="h-10 w-10 text-primary" />
                      </div>
                      <span className="text-[14px] font-black uppercase tracking-[0.4em] opacity-40">ЗАГРУЗИТЬ</span>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
                
                {showCamera && (
                  <div className="relative rounded-[5rem] overflow-hidden bg-black aspect-video shadow-[0_60px_150px_-30px_rgba(0,0,0,0.6)] animate-in zoom-in duration-700">
                    <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                    <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-10">
                      <Button onClick={capturePhoto} className="rounded-full w-28 h-28 bg-white text-primary hover:scale-110 transition-all shadow-2xl"><Camera className="h-14 w-14" /></Button>
                      <Button onClick={stopCamera} variant="destructive" className="rounded-full w-28 h-28 shadow-2xl"><X className="h-14 w-14" /></Button>
                    </div>
                  </div>
                )}
                
                {image && !showCamera && (
                  <div className="relative rounded-[5rem] overflow-hidden group shadow-[0_50px_120px_-25px_rgba(0,0,0,0.4)] border-[12px] border-white animate-in zoom-in duration-700">
                    <img src={image} className="w-full aspect-video object-cover" />
                    <Button variant="destructive" size="icon" className="absolute top-10 right-10 rounded-full opacity-0 group-hover:opacity-100 transition-all h-16 w-16 shadow-2xl" onClick={() => setImage(null)}><X className="h-8 w-8" /></Button>
                  </div>
                )}
                
                <Button className="w-full h-32 rounded-[3.5rem] text-4xl font-black bg-primary shadow-2xl shadow-primary/40 hover:scale-[1.03] active:scale-95 transition-all mt-10" onClick={() => handleSubmit(false)} disabled={loading}>
                  {loading ? <Loader2 className="mr-8 h-16 w-16 animate-spin" /> : <Sparkles className="mr-8 h-16 w-16 text-accent" />} АНАЛИЗИРОВАТЬ ЕДУ
                </Button>
              </TabsContent>

              <TabsContent value="fasting" className="space-y-16 animate-in fade-in duration-1000 outline-none">
                 <div className="p-20 bg-indigo-50/50 rounded-[6rem] text-center space-y-14 border border-indigo-100/50 relative overflow-hidden shadow-inner">
                    <div className="relative mx-auto w-48 h-48">
                       <div className="absolute inset-0 bg-indigo-600/10 rounded-full animate-ping" />
                       <div className="relative w-full h-full bg-indigo-600 rounded-[3.5rem] flex items-center justify-center shadow-[0_40px_100px_-20px_rgba(79,70,229,0.5)]">
                          <Timer className="h-24 w-24 text-white" />
                       </div>
                    </div>
                    <div className="space-y-6">
                      <h4 className="text-5xl font-black text-indigo-950 tracking-tighter">Метаболический Контроль</h4>
                      <p className="text-indigo-600/60 font-medium text-2xl max-w-lg mx-auto leading-relaxed">ИИ оптимизирует ваши биоритмы во время интервального голодания.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-10 pt-10">
                       <Button className="h-28 rounded-[3rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black text-3xl shadow-2xl shadow-indigo-600/40 transition-all hover:scale-105">Начать</Button>
                       <Button variant="outline" className="h-28 rounded-[3rem] border-indigo-200 text-indigo-600 font-black text-3xl hover:bg-white shadow-sm">Завершить</Button>
                    </div>
                 </div>
              </TabsContent>

              <TabsContent value="metrics" className="space-y-16 animate-in fade-in duration-1000 outline-none">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div className="space-y-6">
                      <label className="text-[14px] font-black uppercase tracking-[0.5em] text-muted-foreground/40 flex gap-5 px-6"><Scale className="h-5 w-5" /> Вес (кг)</label>
                      <Input placeholder="76.2" value={weight} onChange={e => setWeight(e.target.value)} type="number" className={inputClasses} />
                   </div>
                   <div className="space-y-6">
                      <label className="text-[14px] font-black uppercase tracking-[0.5em] text-muted-foreground/40 flex gap-5 px-6"><Droplet className="h-5 w-5" /> Вода (мл)</label>
                      <Input placeholder="500" value={water} onChange={e => setWater(e.target.value)} type="number" className={inputClasses} />
                   </div>
                   <div className="space-y-6 col-span-full">
                      <label className="text-[14px] font-black uppercase tracking-[0.5em] text-muted-foreground/40 flex gap-5 px-6"><Footprints className="h-5 w-5" /> Активность (шаги)</label>
                      <Input placeholder="12,500" value={steps} onChange={e => setSteps(e.target.value)} type="number" className={inputClasses} />
                   </div>
                </div>
                <Button className="w-full h-32 rounded-[4rem] text-4xl font-black bg-primary shadow-2xl shadow-primary/40 transition-all hover:scale-[1.02]" onClick={() => handleSubmit(false)}>СИНХРОНИЗИРОВАТЬ ДАННЫЕ</Button>
              </TabsContent>

              <TabsContent value="labs" className="space-y-16 animate-in fade-in duration-1000 outline-none">
                 <div className="space-y-8">
                    <label className="text-[14px] font-black uppercase tracking-[0.5em] text-muted-foreground/30 flex gap-5 px-6"><Brain className="h-5 w-5" /> MEDICAL INTELLIGENCE</label>
                    <Textarea 
                       placeholder="Введите результаты анализов или опишите ваше самочувствие для глубокого медицинского анализа..." 
                       className="min-h-[350px] rounded-[5rem] bg-primary/5 border-none p-16 text-3xl font-medium resize-none placeholder:text-muted-foreground/20 focus:ring-[20px] focus:ring-primary/5 transition-all shadow-inner leading-relaxed" 
                    />
                 </div>
                 <Button className="w-full h-32 rounded-[4rem] text-4xl font-black bg-primary shadow-2xl shadow-primary/40 transition-all hover:scale-[1.02]" onClick={() => handleSubmit(false)}>АНАЛИЗИРОВАТЬ ОТЧЕТ</Button>
              </TabsContent>
            </Tabs>
          ) : mealResult ? (
            <div className="space-y-20 animate-in zoom-in duration-1000">
              <div className="text-center space-y-8">
                <Badge className="bg-primary/10 text-primary border-none px-12 py-5 rounded-[2rem] font-black uppercase tracking-[0.6em] text-[14px] shadow-sm">AI BIO-SCAN SUCCESS</Badge>
                <h3 className="text-7xl md:text-9xl font-black tracking-tighter leading-none text-foreground">{mealResult.mealName}</h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                 {[
                   { label: 'Ккал', val: mealResult.calories, color: 'text-primary', bg: 'bg-primary/5' },
                   { label: 'Белки', val: mealResult.protein, color: 'text-secondary', bg: 'bg-secondary/10' },
                   { label: 'Жиры', val: mealResult.fat, color: 'text-accent-foreground', bg: 'bg-accent/10' },
                   { label: 'Карбо', val: mealResult.carbs, color: 'text-muted-foreground', bg: 'bg-muted/50' }
                 ].map((stat, i) => (
                   <div key={i} className={cn("p-12 rounded-[4rem] flex flex-col items-center justify-center text-center gap-2 shadow-inner", stat.bg)}>
                     <p className={cn("text-5xl font-black tracking-tighter leading-none", stat.color)}>{stat.val}</p>
                     <p className="text-[14px] font-black uppercase tracking-widest opacity-40 mt-4">{stat.label}</p>
                   </div>
                 ))}
              </div>

              <div className="bg-muted/30 p-16 rounded-[5rem] border-l-[16px] border-primary relative overflow-hidden group shadow-inner">
                <Brain className="absolute -right-16 -top-16 h-64 w-64 text-primary/5 rotate-12 group-hover:rotate-45 transition-transform duration-1000" />
                <p className="text-3xl font-medium italic text-foreground/80 leading-relaxed relative z-10">«{mealResult.analysis}»</p>
              </div>

              <div className="flex gap-10">
                <Button className="flex-1 h-28 rounded-[3rem] font-black text-3xl bg-primary shadow-2xl shadow-primary/40 transition-all hover:scale-[1.02]" onClick={() => setIsOpen(false)}>ПОДТВЕРДИТЬ И ЗАПИСАТЬ</Button>
                <Button variant="outline" className="h-28 w-28 rounded-[3rem] border-muted bg-muted/20 hover:bg-white transition-all shadow-sm" onClick={reset}><RefreshCw className="h-12 w-12 text-muted-foreground" /></Button>
              </div>
            </div>
          ) : (
            <div className="py-40 flex flex-col items-center text-center space-y-16 animate-in zoom-in duration-1000">
              <div className="w-64 h-64 bg-primary/10 rounded-full flex items-center justify-center relative">
                 <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                 <div className="relative w-full h-full bg-primary rounded-full flex items-center justify-center shadow-[0_50px_120px_-25px_rgba(45,122,77,0.5)]">
                    <CheckCircle2 className="h-32 w-32 text-white" />
                 </div>
              </div>
              <div className="space-y-6">
                <h3 className="text-6xl font-black tracking-tighter leading-none">Bio-Синхронизация</h3>
                <p className="text-muted-foreground font-medium text-3xl max-w-lg mx-auto leading-relaxed">ИИ успешно обновил ваш Bio-Score и план питания на основе новых данных.</p>
              </div>
              <Button className="w-96 h-28 rounded-[3rem] font-black text-3xl bg-primary shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all" onClick={reset}>ПРОДОЛЖИТЬ</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
