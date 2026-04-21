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
  Droplet, Scale, Utensils, Brain, Smile, Thermometer, Battery
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
        toast({ title: 'Запись создана', description: `${result.mealName} добавлено в дневник.` });
      } else {
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
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Ошибка', description: error.message || 'Не удалось обработать.' });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setDescription(''); setRefinement(''); setImage(null); setMealResult(null);
    setIsSuccess(false); setWater(''); setWeight(''); setSteps(''); setMood(''); setEnergy(50);
    stopCamera();
  };

  const inputClasses = "h-14 md:h-20 rounded-[1.5rem] md:rounded-[2.5rem] bg-primary/5 border-none font-black text-foreground text-xl md:text-3xl placeholder:text-muted-foreground/20 focus:ring-4 md:ring-[12px] focus:ring-primary/5 transition-all px-6 md:px-10 shadow-inner";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) reset(); }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-[95vw] md:max-w-[750px] lg:max-w-[850px] rounded-[2rem] md:rounded-[4rem] p-0 overflow-hidden border-none shadow-2xl max-h-[95vh] flex flex-col">
        <DialogHeader className="p-6 md:p-12 bg-primary text-white relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-[#163D25] opacity-95" />
          <div className="relative z-10 space-y-2">
            <DialogTitle className="text-3xl md:text-5xl font-black tracking-tighter leading-none">Bio-Синхронизация</DialogTitle>
            <p className="text-white/70 font-medium text-sm md:text-lg">Запишите показатели на {format(selectedDate, 'd MMMM', { locale: ru })}</p>
          </div>
          <Zap className="absolute -right-12 -bottom-12 h-40 w-40 text-white/10 rotate-12" />
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-8 md:space-y-12 no-scrollbar">
          {!mealResult && !isSuccess ? (
            <Tabs defaultValue="meal" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5 rounded-[2rem] h-16 md:h-20 bg-muted/60 p-2 mb-8 md:mb-12 shadow-inner">
                <TabsTrigger value="meal" className="rounded-[1.5rem] font-black gap-1 text-[8px] md:text-[10px] uppercase tracking-widest flex-1 h-full"><Utensils className="h-3 w-3 md:h-4 md:w-4" /> ЕДА</TabsTrigger>
                <TabsTrigger value="feeling" className="rounded-[1.5rem] font-black gap-1 text-[8px] md:text-[10px] uppercase tracking-widest flex-1 h-full"><Smile className="h-3 w-3 md:h-4 md:w-4" /> ДУХ</TabsTrigger>
                <TabsTrigger value="metrics" className="rounded-[1.5rem] font-black gap-1 text-[8px] md:text-[10px] uppercase tracking-widest flex-1 h-full"><Scale className="h-3 w-3 md:h-4 md:w-4" /> ТЕЛО</TabsTrigger>
                <TabsTrigger value="fasting" className="rounded-[1.5rem] font-black gap-1 text-[8px] md:text-[10px] uppercase tracking-widest flex-1 h-full"><Timer className="h-3 w-3 md:h-4 md:w-4" /> ФАСТ</TabsTrigger>
                <TabsTrigger value="labs" className="rounded-[1.5rem] font-black gap-1 text-[8px] md:text-[10px] uppercase tracking-widest flex-1 h-full"><FlaskConical className="h-3 w-3 md:h-4 md:w-4" /> ЛАБ</TabsTrigger>
              </TabsList>

              <TabsContent value="meal" className="space-y-6 md:space-y-8 outline-none">
                <Textarea 
                  placeholder="Что вы съели?" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  className="min-h-[150px] md:min-h-[200px] rounded-[2rem] md:rounded-[3rem] bg-primary/5 border-none p-6 md:p-10 text-xl md:text-2xl font-medium resize-none shadow-inner" 
                />
                <div className="grid grid-cols-2 gap-4 md:gap-8">
                  <Button variant="outline" className="h-24 md:h-32 rounded-[2rem] border-dashed border-2 flex flex-col gap-2 hover:bg-primary/5 transition-all" onClick={startCamera}>
                    <Camera className="h-6 w-6 md:h-8 md:w-8 text-primary" /><span className="text-[10px] font-black">КАМЕРА</span>
                  </Button>
                  <label className="cursor-pointer">
                    <div className="h-24 md:h-32 rounded-[2rem] border-dashed border-2 flex flex-col gap-2 items-center justify-center hover:bg-primary/5 transition-all">
                      <Upload className="h-6 w-6 md:h-8 md:w-8 text-primary" /><span className="text-[10px] font-black">ФАЙЛ</span>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
                <Button className="w-full h-16 md:h-24 rounded-[2rem] md:rounded-[3rem] text-xl md:text-2xl font-black bg-primary shadow-xl" onClick={() => handleSubmit(false)} disabled={loading}>
                  {loading ? <Loader2 className="animate-spin h-8 w-8" /> : <><Sparkles className="mr-4 h-6 w-6 md:h-8 md:w-8 text-accent" /> РАСПОЗНАТЬ</>}
                </Button>
              </TabsContent>

              <TabsContent value="feeling" className="space-y-10 outline-none">
                 <div className="space-y-8">
                    <label className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 px-4">Настроение</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                       {['Счастлив', 'Спокоен', 'Устал', 'Раздражен'].map(m => (
                          <Button 
                             key={m} 
                             onClick={() => setMood(m)}
                             variant={mood === m ? "default" : "outline"}
                             className="h-16 rounded-[1.5rem] font-black text-sm"
                          >
                             {m}
                          </Button>
                       ))}
                    </div>
                    <div className="space-y-4 pt-6">
                       <label className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 px-4 flex justify-between">
                          <span>Энергия</span>
                          <span className="text-primary">{energy}%</span>
                       </label>
                       <div className="px-4">
                          <input 
                            type="range" 
                            className="w-full h-2 bg-primary/10 rounded-full appearance-none accent-primary" 
                            value={energy} 
                            onChange={(e) => setEnergy(Number(e.target.value))}
                          />
                       </div>
                    </div>
                 </div>
                 <Button className="w-full h-16 md:h-20 rounded-[2rem] text-xl font-black bg-primary mt-8" onClick={() => handleSubmit(false)}>СОХРАНИТЬ</Button>
              </TabsContent>

              <TabsContent value="metrics" className="space-y-8 outline-none">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/40 px-4">Вес (кг)</label>
                      <Input placeholder="76.2" value={weight} onChange={e => setWeight(e.target.value)} type="number" className={inputClasses} />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/40 px-6">Вода (мл)</label>
                      <Input placeholder="500" value={water} onChange={e => setWater(e.target.value)} type="number" className={inputClasses} />
                   </div>
                   <div className="space-y-2 col-span-full">
                      <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/40 px-6">Шаги</label>
                      <Input placeholder="10,000" value={steps} onChange={e => setSteps(e.target.value)} type="number" className={inputClasses} />
                   </div>
                </div>
                <Button className="w-full h-16 md:h-20 rounded-[2rem] text-xl font-black bg-primary" onClick={() => handleSubmit(false)}>ОБНОВИТЬ ТЕЛО</Button>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="py-12 flex flex-col items-center text-center space-y-8">
               <div className="w-32 h-32 bg-primary rounded-full flex items-center justify-center shadow-xl animate-in zoom-in">
                  <CheckCircle2 className="h-16 w-16 text-white" />
               </div>
               <h3 className="text-3xl font-black tracking-tighter">Bio-Синхронизация завершена!</h3>
               <Button className="w-64 h-16 rounded-[1.5rem] font-black text-xl bg-primary" onClick={reset}>ОТЛИЧНО</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}