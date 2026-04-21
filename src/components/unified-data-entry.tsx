
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/tabs';
import { 
  Camera, Upload, Sparkles, X, Loader2, Activity, FlaskConical, 
  CheckCircle2, Timer, Zap, Heart, 
  Calendar as CalendarIcon, Footprints, Moon, RefreshCw, 
  Droplet, Scale, Utensils, Brain, Smile, Thermometer, Battery,
  Save, Beef, Wheat, MessageSquare
} from 'lucide-react';
import { analyzeMeal, AnalyzeMealOutput } from '@/ai/flows/analyze-meal';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useUser, useFirestore } from '@/firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Card } from '@/components/ui/card';

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
  
  // Editable meal result state
  const [editedMeal, setEditedMeal] = useState<AnalyzeMealOutput | null>(null);

  const [water, setWater] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [steps, setSteps] = useState<string>('');
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

  const saveMealToFirestore = async (data: AnalyzeMealOutput) => {
    if (!firestore || !user || user.uid === 'public-user') return;
    
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
    if (!firestore || !user || user.uid === 'public-user') {
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Вы не авторизованы.' });
      return;
    }

    setLoading(true);
    try {
      const result = await analyzeMeal({
        description,
        photoDataUri: image || undefined,
        refinement: isRefinement ? refinement : undefined,
      });
      setMealResult(result);
      setEditedMeal(result);
      if (isRefinement) setRefinement('');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Ошибка анализа', description: error.message || 'Не удалось обработать.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDailyLogSubmit = async () => {
    if (!firestore || !user || user.uid === 'public-user') return;
    
    setLoading(true);
    try {
      const dateKey = format(selectedDate, 'yyyy-MM-dd');
      const docRef = doc(firestore, 'users', user.uid, 'dailyLogs', dateKey);
      await setDoc(docRef, {
        date: dateKey,
        water: water ? Number(water) : undefined,
        weight: weight ? Number(weight) : undefined,
        steps: steps ? Number(steps) : undefined,
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

  const reset = () => {
    setDescription(''); setRefinement(''); setImage(null); setMealResult(null); setEditedMeal(null);
    setIsSuccess(false); setWater(''); setWeight(''); setSteps(''); setMood(''); setEnergy(50);
    stopCamera();
  };

  const inputClasses = "h-14 md:h-18 rounded-2xl md:rounded-[2rem] bg-primary/5 border-none font-black text-foreground text-xl md:text-2xl placeholder:text-muted-foreground/20 focus:ring-4 focus:ring-primary/5 transition-all px-6 md:px-8 shadow-inner";
  const editInputClasses = "h-12 rounded-xl bg-white border shadow-sm font-bold px-4 focus:ring-2 focus:ring-primary/20";

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
          {!mealResult && !isSuccess ? (
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

                {showCamera && (
                  <div className="relative rounded-2xl overflow-hidden bg-black aspect-video">
                    <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                      <Button onClick={capturePhoto} className="rounded-full w-12 h-12 bg-white text-primary"><Camera className="h-6 w-6" /></Button>
                      <Button onClick={stopCamera} variant="destructive" className="rounded-full w-12 h-12"><X className="h-6 w-6" /></Button>
                    </div>
                  </div>
                )}

                {image && !showCamera && (
                  <div className="relative rounded-2xl overflow-hidden aspect-video">
                    <img src={image} alt="Preview" className="w-full h-full object-cover" />
                    <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-8 w-8 rounded-full" onClick={() => setImage(null)}><X className="h-4 w-4" /></Button>
                  </div>
                )}

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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 px-4">Вес (кг)</label>
                      <Input placeholder="76.2" value={weight} onChange={e => setWeight(e.target.value)} type="number" className={inputClasses} />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 px-4">Вода (мл)</label>
                      <Input placeholder="500" value={water} onChange={e => setWater(e.target.value)} type="number" className={inputClasses} />
                   </div>
                   <div className="space-y-2 col-span-full">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 px-4">Шаги</label>
                      <Input placeholder="10,000" value={steps} onChange={e => setSteps(e.target.value)} type="number" className={inputClasses} />
                   </div>
                </div>
                <Button className="w-full h-14 md:h-18 rounded-[1.5rem] text-lg font-black bg-primary mt-2" onClick={handleDailyLogSubmit} disabled={loading}>
                   {loading ? <Loader2 className="animate-spin h-6 w-6" /> : "ОБНОВИТЬ ТЕЛО"}
                </Button>
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
                  
                  <div className="flex gap-2 items-center px-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <Input 
                      placeholder="Уточнить (например: 'порция была больше')"
                      value={refinement}
                      onChange={e => setRefinement(e.target.value)}
                      className="h-10 border-none bg-primary/5 rounded-xl font-bold placeholder:font-normal"
                    />
                    <Button size="sm" variant="ghost" className="h-10 text-primary font-black" onClick={() => handleAnalyze(true)} disabled={loading}>
                      ПЕРЕСЧИТАТЬ ИИ
                    </Button>
                  </div>
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
