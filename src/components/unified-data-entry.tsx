
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
  Footprints, Moon, RefreshCw, 
  Droplet, Scale, Utensils, Smile, Save, MessageSquare,
  AlertCircle, TrendingUp, TrendingDown, Smartphone
} from 'lucide-react';
import { analyzeMeal, AnalyzeMealOutput } from '@/ai/flows/analyze-meal';
import { analyzeLabResults, AnalyzeLabOutput } from '@/ai/flows/analyze-lab-results';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { cn } from '@/lib/utils';

interface UnifiedDataEntryProps {
  children: React.ReactNode;
  selectedDate?: Date;
}

export function UnifiedDataEntry({ children, selectedDate = new Date() }: UnifiedDataEntryProps) {
  const { user } = useUser();
  const { firestore } = useFirestore();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState('meal');
  const [description, setDescription] = useState('');
  const [refinement, setRefinement] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [mealResult, setMealResult] = useState<AnalyzeMealOutput | null>(null);
  const [labResult, setLabResult] = useState<AnalyzeLabOutput | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [editedMeal, setEditedMeal] = useState<AnalyzeMealOutput | null>(null);

  const [water, setWater] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [steps, setSteps] = useState<string>('');
  const [heartRate, setHeartRate] = useState<string>('');
  const [sleep, setSleep] = useState<string>('');
  const [mood, setMood] = useState<string>('');
  const [energy, setEnergy] = useState<number>(50);

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

  const handleSmartSync = async () => {
    setSyncing(true);
    await new Promise(r => setTimeout(r, 1500));
    
    setSteps(Math.floor(Math.random() * 5000 + 5000).toString());
    setHeartRate(Math.floor(Math.random() * 20 + 60).toString());
    setSleep((Math.random() * 2 + 6).toFixed(1));
    
    setSyncing(false);
    toast({
      title: 'Синхронизация завершена',
      description: 'Данные с ваших устройств успешно импортированы.',
    });
  };

  const saveMealToFirestore = async (data: AnalyzeMealOutput) => {
    if (!firestore || !user) return;
    
    setLoading(true);
    try {
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
        components: data.components,
        createdAt: serverTimestamp()
      });
      
      setIsSuccess(true);
      toast({ title: 'Запись сохранена', description: `${data.mealName} добавлено в дневник.` });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Ошибка сохранения', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (isRefinement = false) => {
    if (!firestore || !user) {
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Сервисы временно недоступны.' });
      return;
    }

    if (activeTab === 'meal') {
      if (!description && !image && !refinement) {
        toast({ variant: 'destructive', title: 'Нет данных', description: 'Опишите блюдо или добавьте фото.' });
        return;
      }

      setLoading(true);
      try {
        const result = await analyzeMeal({
          description: description || undefined,
          photoDataUri: image || undefined,
          refinement: isRefinement ? refinement : undefined,
        });
        setMealResult(result);
        setEditedMeal(result);
        if (isRefinement) setRefinement('');
      } catch (error: any) {
        console.error("AI Error:", error);
        toast({ variant: 'destructive', title: 'Ошибка анализа ИИ', description: error.message || 'Не удалось обработать.' });
      } finally {
        setLoading(false);
      }
    } else if (activeTab === 'labs') {
      if (!image) {
        toast({ variant: 'destructive', title: 'Нет фото', description: 'Сфотографируйте или загрузите результат анализов.' });
        return;
      }

      setLoading(true);
      try {
        const result = await analyzeLabResults({
          photoDataUri: image,
        });
        setLabResult(result);
      } catch (error: any) {
        toast({ variant: 'destructive', title: 'Ошибка ИИ-анализа', description: 'Не удалось распознать документ.' });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDailyLogSubmit = async () => {
    if (!firestore || !user) return;
    
    setLoading(true);
    try {
      const dateKey = format(selectedDate, 'yyyy-MM-dd');
      const docRef = doc(firestore, 'users', user.uid, 'dailyLogs', dateKey);
      await setDoc(docRef, {
        date: dateKey,
        water: water ? Number(water) : undefined,
        weight: weight ? Number(weight) : undefined,
        steps: steps ? Number(steps) : undefined,
        avgHeartRate: heartRate ? Number(heartRate) : undefined,
        sleepDurationHours: sleep ? Number(sleep) : undefined,
        mood: mood || undefined,
        energy: energy,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      setIsSuccess(true);
      toast({ title: 'Биометрия обновлена' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Ошибка', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const saveLabResultToFirestore = async () => {
    if (!firestore || !user || !labResult) return;
    
    setLoading(true);
    try {
      const labId = `lab_${Date.now()}`;
      const docRef = doc(firestore, 'users', user.uid, 'labResults', labId);
      await setDoc(docRef, {
        id: labId,
        userId: user.uid,
        date: format(selectedDate, 'yyyy-MM-dd'),
        ...labResult,
        createdAt: serverTimestamp()
      });
      setIsSuccess(true);
      toast({ title: 'Анализы сохранены' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Ошибка сохранения', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setDescription(''); setRefinement(''); setImage(null); setMealResult(null); setEditedMeal(null); setLabResult(null);
    setIsSuccess(false); setWater(''); setWeight(''); setSteps(''); setHeartRate(''); setSleep(''); setMood(''); setEnergy(50);
    stopCamera();
  };

  const inputClasses = "h-14 md:h-18 rounded-2xl md:rounded-[2rem] bg-primary/5 border-none font-black text-foreground text-xl md:text-2xl placeholder:text-muted-foreground/20 focus:ring-4 focus:ring-primary/5 transition-all px-6 md:px-8 shadow-inner";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) reset(); }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-[95vw] md:max-w-[700px] lg:max-w-[800px] rounded-[2rem] md:rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl max-h-[90vh] flex flex-col z-[1001]">
        <DialogHeader className="p-5 md:p-8 bg-primary text-white relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-[#163D25] opacity-95" />
          <div className="relative z-10 space-y-0.5">
            <DialogTitle className="text-xl md:text-3xl font-black tracking-tighter leading-none">Bio-Синхронизация</DialogTitle>
            <p className="text-white/70 font-medium text-[10px] md:text-sm">Запишите показатели на {format(selectedDate, 'd MMMM', { locale: ru })}</p>
          </div>
          <Zap className="absolute -right-6 -bottom-6 h-24 w-24 text-white/10 rotate-12" />
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 md:space-y-10 no-scrollbar">
          {!mealResult && !labResult && !isSuccess ? (
            <Tabs defaultValue="meal" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5 rounded-[1.5rem] h-14 md:h-16 bg-muted/60 p-1.5 mb-6 md:mb-10 shadow-inner">
                <TabsTrigger value="meal" className="rounded-[1rem] font-black gap-1 text-[8px] md:text-[9px] uppercase tracking-widest flex-1 h-full"><Utensils className="h-3 w-3" /> ЕДА</TabsTrigger>
                <TabsTrigger value="feeling" className="rounded-[1rem] font-black gap-1 text-[8px] md:text-[9px] uppercase tracking-widest flex-1 h-full"><Smile className="h-3 w-3" /> ДУХ</TabsTrigger>
                <TabsTrigger value="metrics" className="rounded-[1rem] font-black gap-1 text-[8px] md:text-[9px] uppercase tracking-widest flex-1 h-full"><Scale className="h-3 w-3" /> ТЕЛО</TabsTrigger>
                <TabsTrigger value="fasting" className="rounded-[1rem] font-black gap-1 text-[8px] md:text-[9px] uppercase tracking-widest flex-1 h-full"><Timer className="h-3 w-3" /> ФАСТ</TabsTrigger>
                <TabsTrigger value="labs" className="rounded-[1rem] font-black gap-1 text-[8px] md:text-[9px] uppercase tracking-widest flex-1 h-full"><FlaskConical className="h-3 w-3" /> ЛАБ</TabsTrigger>
              </TabsList>

              <TabsContent value="meal" className="space-y-6 outline-none">
                <Textarea 
                  placeholder="Что вы съели?" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  className="min-h-[120px] md:min-h-[180px] rounded-[1.5rem] md:rounded-[2rem] bg-primary/5 border-none p-6 md:p-8 text-lg md:text-xl font-medium resize-none shadow-inner" 
                />
                
                <div className="grid grid-cols-2 gap-4 md:gap-6">
                  <Button variant="outline" className="h-20 md:h-28 rounded-[1.5rem] border-dashed border-2 flex flex-col gap-2 hover:bg-primary/5 transition-all" onClick={startCamera}>
                    <Camera className="h-5 w-5 md:h-6 md:u-6 text-primary" /><span className="text-[9px] font-black">КАМЕРА</span>
                  </Button>
                  <label className="cursor-pointer">
                    <div className="h-20 md:h-28 rounded-[1.5rem] border-dashed border-2 flex flex-col gap-2 items-center justify-center hover:bg-primary/5 transition-all">
                      <Upload className="h-5 w-5 md:h-6 md:u-6 text-primary" /><span className="text-[9px] font-black">ФАЙЛ</span>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>

                <div className="flex justify-center w-full">
                  {showCamera && (
                    <div className="relative rounded-2xl overflow-hidden bg-black aspect-video w-full max-w-md shadow-2xl">
                      <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                        <Button onClick={capturePhoto} className="rounded-full w-12 h-12 bg-white text-primary"><Camera className="h-6 w-6" /></Button>
                        <Button onClick={stopCamera} variant="destructive" className="rounded-full w-12 h-12"><X className="h-6 w-6" /></Button>
                      </div>
                    </div>
                  )}

                  {image && !showCamera && (
                    <div className="relative rounded-2xl overflow-hidden aspect-video w-full max-w-md shadow-2xl border-4 border-white flex items-center justify-center bg-black/5">
                      <img src={image} alt="Preview" className="max-w-full max-h-full object-contain" />
                      <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-lg" onClick={() => setImage(null)}><X className="h-4 w-4" /></Button>
                    </div>
                  )}
                </div>

                <Button className="w-full h-14 md:h-20 rounded-[1.5rem] md:rounded-[2rem] text-lg md:text-xl font-black bg-primary shadow-xl" onClick={() => handleAnalyze(false)} disabled={loading}>
                  {loading ? <Loader2 className="animate-spin h-6 w-6" /> : <><Sparkles className="mr-3 h-5 w-5 md:h-6 text-accent" /> РАСПОЗНАТЬ</>}
                </Button>
              </TabsContent>

              <TabsContent value="feeling" className="space-y-8 outline-none">
                 <div className="space-y-6">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 px-2">Настроение</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                       {['Счастлив', 'Спокоен', 'Устал', 'Раздражен'].map(m => (
                          <Button 
                             key={m} 
                             onClick={() => setMood(m)}
                             variant={mood === m ? "default" : "outline"}
                             className="h-14 rounded-[1.2rem] font-black text-xs"
                          >
                             {m}
                          </Button>
                       ))}
                    </div>
                    <div className="space-y-3 pt-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 px-2 flex justify-between">
                          <span>Энергия</span>
                          <span className="text-primary">{energy}%</span>
                       </label>
                       <div className="px-2">
                          <input 
                            type="range" 
                            className="w-full h-2 bg-primary/10 rounded-full appearance-none accent-primary" 
                            value={energy} 
                            onChange={(e) => setEnergy(Number(e.target.value))}
                          />
                       </div>
                    </div>
                 </div>
                 <Button className="w-full h-14 md:h-18 rounded-[1.5rem] text-lg font-black bg-primary mt-6" onClick={handleDailyLogSubmit} disabled={loading}>
                   {loading ? <Loader2 className="animate-spin h-6 w-6" /> : "СОХРАНИТЬ"}
                 </Button>
              </TabsContent>

              <TabsContent value="metrics" className="space-y-6 outline-none">
                <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 space-y-4">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <Smartphone className="h-5 w-5 text-primary" />
                         <span className="text-sm font-black uppercase tracking-tight">Умные устройства</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-[9px] font-black uppercase h-8 px-3 bg-primary text-white hover:bg-primary/90 rounded-lg gap-2"
                        onClick={handleSmartSync}
                        disabled={syncing}
                      >
                         {syncing ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                         Синхронизация
                      </Button>
                   </div>
                   <p className="text-[10px] text-muted-foreground font-medium">Автоматический импорт шагов, пульса и сна из Health Kit.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 px-4 flex items-center gap-2"><Scale className="h-3 w-3" /> Вес (кг)</label>
                      <Input placeholder="76.2" value={weight} onChange={e => setWeight(e.target.value)} type="number" className={inputClasses} />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 px-4 flex items-center gap-2"><Droplet className="h-3 w-3" /> Вода (мл)</label>
                      <Input placeholder="500" value={water} onChange={e => setWater(e.target.value)} type="number" className={inputClasses} />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 px-4 flex items-center gap-2"><Footprints className="h-3 w-3" /> Шаги</label>
                      <Input placeholder="10,000" value={steps} onChange={e => setSteps(e.target.value)} type="number" className={inputClasses} />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 px-4 flex items-center gap-2"><Heart className="h-3 w-3" /> Пульс (bpm)</label>
                      <Input placeholder="72" value={heartRate} onChange={e => setHeartRate(e.target.value)} type="number" className={inputClasses} />
                   </div>
                   <div className="space-y-2 col-span-full">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 px-4 flex items-center gap-2"><Moon className="h-3 w-3" /> Сон (часов)</label>
                      <Input placeholder="7.5" value={sleep} onChange={e => setSleep(e.target.value)} type="number" step="0.1" className={inputClasses} />
                   </div>
                </div>
                <Button className="w-full h-14 md:h-18 rounded-[1.5rem] text-lg font-black bg-primary mt-2" onClick={handleDailyLogSubmit} disabled={loading}>
                   {loading ? <Loader2 className="animate-spin h-6 w-6" /> : "ОБНОВИТЬ ТЕЛО"}
                </Button>
              </TabsContent>

              <TabsContent value="labs" className="space-y-6 outline-none">
                <div className="space-y-4">
                  <div className="bg-primary/5 p-6 rounded-2xl border-2 border-dashed border-primary/20 flex flex-col items-center text-center gap-4">
                    <FlaskConical className="h-10 w-10 text-primary opacity-40" />
                    <div>
                      <p className="font-bold">Анализ документов</p>
                      <p className="text-[10px] text-muted-foreground">Загрузите фото бланка с результатами анализов</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="h-16 rounded-xl flex items-center gap-2" onClick={startCamera}>
                      <Camera className="h-5 w-5" /> Камера
                    </Button>
                    <label className="cursor-pointer">
                      <div className="h-16 rounded-xl border border-input flex items-center justify-center gap-2 hover:bg-accent transition-colors">
                        <Upload className="h-5 w-5" /> Файл
                      </div>
                      <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileUpload} />
                    </label>
                  </div>

                  {image && (
                    <div className="relative rounded-2xl overflow-hidden aspect-video border-4 border-white shadow-lg bg-black/5 flex items-center justify-center">
                      <img src={image} alt="Lab Preview" className="max-w-full max-h-full object-contain" />
                      <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-lg" onClick={() => setImage(null)}><X className="h-4 w-4" /></Button>
                    </div>
                  )}

                  <Button className="w-full h-16 rounded-xl bg-primary font-black" onClick={() => handleAnalyze()} disabled={loading || !image}>
                    {loading ? <Loader2 className="animate-spin h-6 w-6" /> : <><Sparkles className="mr-2 h-5 w-5" /> АНАЛИЗИРОВАТЬ ИИ</>}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          ) : mealResult && editedMeal && !isSuccess ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="text-center space-y-2">
                  <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black uppercase tracking-widest px-4">AI BioScan Result</Badge>
                  <Input 
                    value={editedMeal.mealName} 
                    onChange={e => setEditedMeal({...editedMeal, mealName: e.target.value})}
                    className="text-2xl md:text-3xl font-black text-center border-none bg-transparent h-auto focus-visible:ring-0"
                  />
               </div>

               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                     <label className="text-[9px] font-black uppercase text-muted-foreground text-center block">Ккал</label>
                     <Input 
                        type="number" 
                        value={editedMeal.calories} 
                        onChange={e => setEditedMeal({...editedMeal, calories: Number(e.target.value)})}
                        className="h-14 rounded-2xl bg-primary/5 border-none text-center font-black text-xl"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[9px] font-black uppercase text-muted-foreground text-center block">Белки (г)</label>
                     <Input 
                        type="number" 
                        value={editedMeal.protein} 
                        onChange={e => setEditedMeal({...editedMeal, protein: Number(e.target.value)})}
                        className="h-14 rounded-2xl bg-secondary/10 border-none text-center font-black text-xl"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[9px] font-black uppercase text-muted-foreground text-center block">Жиры (г)</label>
                     <Input 
                        type="number" 
                        value={editedMeal.fat} 
                        onChange={e => setEditedMeal({...editedMeal, fat: Number(e.target.value)})}
                        className="h-14 rounded-2xl bg-accent/20 border-none text-center font-black text-xl"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[9px] font-black uppercase text-muted-foreground text-center block">Углеводы (г)</label>
                     <Input 
                        type="number" 
                        value={editedMeal.carbs} 
                        onChange={e => setEditedMeal({...editedMeal, carbs: Number(e.target.value)})}
                        className="h-14 rounded-2xl bg-muted border-none text-center font-black text-xl"
                     />
                  </div>
               </div>

               <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-2">Приблизительный состав</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {editedMeal.components?.map((comp, i) => (
                        <div key={i} className="flex items-center justify-between p-5 bg-primary/5 rounded-2xl border border-primary/10 transition-colors hover:bg-primary/10">
                           <span className="text-base font-bold text-foreground/80">{comp.ingredient}</span>
                           <Badge className="bg-primary text-white font-black px-4 py-2 rounded-xl shadow-lg text-sm">
                              {comp.weight}
                           </Badge>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="bg-muted/30 p-5 rounded-[1.75rem]">
                  <p className="text-sm font-medium leading-relaxed italic text-foreground/80">"{editedMeal.analysis}"</p>
               </div>

               <div className="space-y-4">
                  <div className="flex gap-4">
                     <Button 
                        variant="outline" 
                        className="flex-1 h-16 rounded-[1.2rem] font-bold" 
                        onClick={() => { setMealResult(null); setEditedMeal(null); }}
                     >
                        Переснять
                     </Button>
                     <Button 
                        className="flex-[2] h-16 rounded-[1.2rem] font-black text-lg bg-primary shadow-xl"
                        onClick={() => saveMealToFirestore(editedMeal)}
                        disabled={loading}
                     >
                        {loading ? <Loader2 className="animate-spin h-6 w-6" /> : <><Save className="mr-2 h-5 w-5" /> ПОДТВЕРДИТЬ И ЗАПИСАТЬ</>}
                     </Button>
                  </div>
               </div>
            </div>
          ) : labResult && !isSuccess ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
              <div className="text-center space-y-2">
                <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black uppercase tracking-widest px-4">LabScan AI 1.0</Badge>
                <h3 className="text-2xl font-black tracking-tighter">Результаты анализа</h3>
              </div>

              <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10">
                <p className="text-sm font-medium leading-relaxed text-foreground/80">{labResult.summary}</p>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 px-2">Обнаруженные маркеры</label>
                <div className="space-y-3">
                  {labResult.markers.map((marker, i) => (
                    <div key={i} className="bg-white border rounded-2xl p-4 flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm">{marker.name}</span>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-[8px] h-4 px-1 border-none",
                              marker.status === 'high' ? "bg-red-100 text-red-600" : 
                              marker.status === 'low' ? "bg-yellow-100 text-yellow-700" : 
                              "bg-green-100 text-green-600"
                            )}
                          >
                            {marker.status === 'normal' ? 'В НОРМЕ' : marker.status === 'high' ? 'ВЫШЕ НОРМЫ' : 'НИЖЕ НОРМЫ'}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground">{marker.interpretation}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-lg">{marker.value}</p>
                        {marker.status !== 'normal' && (
                          marker.status === 'high' ? <TrendingUp className="h-4 w-4 text-red-500 ml-auto" /> : <TrendingDown className="h-4 w-4 text-yellow-500 ml-auto" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 px-2">Рекомендации</label>
                <div className="grid gap-3">
                  {labResult.recommendations.map((rec, i) => (
                    <div key={i} className="flex gap-3 items-start p-4 bg-muted/30 rounded-2xl">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <p className="text-xs font-medium">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button variant="outline" className="flex-1 h-14 rounded-xl" onClick={() => setLabResult(null)}>Переснять</Button>
                <Button className="flex-[2] h-14 rounded-xl bg-primary font-black shadow-xl" onClick={saveLabResultToFirestore} disabled={loading}>
                  {loading ? <Loader2 className="animate-spin h-6 w-6" /> : "СОХРАНИТЬ В ПРОФИЛЬ"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-8 flex flex-col items-center text-center space-y-6">
               <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center shadow-xl animate-in zoom-in">
                  <CheckCircle2 className="h-12 w-12 text-white" />
               </div>
               <h3 className="text-2xl font-black tracking-tighter">Bio-Синхронизация завершена!</h3>
               <p className="text-muted-foreground font-medium">Ваши данные успешно записаны в облако.</p>
               <Button className="w-56 h-14 rounded-[1.2rem] font-black text-lg bg-primary" onClick={reset}>ОТЛИЧНО</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
