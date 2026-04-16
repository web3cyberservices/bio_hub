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
  MessageSquare, Droplet, Scale, Flame, User, Utensils, Brain
} from 'lucide-react';
import { analyzeMeal, AnalyzeMealOutput } from '@/ai/flows/analyze-meal';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
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

  const handleSubmit = async (isRefinement = false) => {
    setLoading(true);
    try {
      if (activeTab === 'meal') {
        const result = await analyzeMeal({
          description,
          photoDataUri: image || undefined,
          refinement: isRefinement ? refinement : undefined,
        });
        setMealResult(result);
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
    setIsSuccess(false); setWater(''); setWeight(''); setSteps('');
    stopCamera();
  };

  const inputClasses = "h-16 rounded-[1.5rem] bg-primary/5 border-none font-black text-foreground text-xl placeholder:text-muted-foreground/30 focus:ring-8 focus:ring-primary/5 transition-all px-8";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) reset(); }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[700px] rounded-[4rem] p-0 overflow-hidden border-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)]">
        <DialogHeader className="p-12 bg-primary text-white">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-4xl font-black tracking-tighter leading-none">Bio-Центр</DialogTitle>
              <p className="text-white/60 font-medium text-sm">Персональный биометрический хаб</p>
            </div>
            <Badge className="bg-white/10 text-white border-none px-6 py-3 rounded-2xl flex gap-3 font-black backdrop-blur-xl">
              <CalendarIcon className="h-5 w-5" /> {format(selectedDate, 'd MMMM', { locale: ru })}
            </Badge>
          </div>
        </DialogHeader>
        
        <div className="p-12 space-y-10">
          {!mealResult && !isSuccess ? (
            <Tabs defaultValue="meal" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 rounded-[2rem] h-18 bg-muted/50 p-2 mb-12">
                <TabsTrigger value="meal" className="rounded-[1.5rem] font-black gap-2 text-[10px] uppercase tracking-[0.2em] transition-all"><Utensils className="h-4 w-4" /> Еда</TabsTrigger>
                <TabsTrigger value="fasting" className="rounded-[1.5rem] font-black gap-2 text-[10px] uppercase tracking-[0.2em] transition-all"><Timer className="h-4 w-4" /> Фаст</TabsTrigger>
                <TabsTrigger value="metrics" className="rounded-[1.5rem] font-black gap-2 text-[10px] uppercase tracking-[0.2em] transition-all"><Scale className="h-4 w-4" /> Тело</TabsTrigger>
                <TabsTrigger value="labs" className="rounded-[1.5rem] font-black gap-2 text-[10px] uppercase tracking-[0.2em] transition-all"><FlaskConical className="h-4 w-4" /> Лаб</TabsTrigger>
              </TabsList>

              <TabsContent value="meal" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 outline-none">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground px-2">Описание или контекст</label>
                  <Textarea 
                    placeholder="Что у вас на тарелке? Опишите или добавьте фото для AI-анализа..." 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    className="min-h-[180px] rounded-[2.5rem] bg-primary/5 border-none p-10 text-xl font-medium resize-none placeholder:text-muted-foreground/30 focus:ring-8 focus:ring-primary/5 transition-all" 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <Button variant="outline" className="h-32 rounded-[3rem] border-dashed border-3 flex flex-col gap-3 hover:bg-primary/5 hover:border-primary/50 transition-all group" onClick={startCamera}>
                    <Camera className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                    <span className="text-[11px] font-black uppercase tracking-widest">Камера</span>
                  </Button>
                  <label className="cursor-pointer">
                    <div className="h-32 rounded-[3rem] border-dashed border-3 flex flex-col gap-3 items-center justify-center hover:bg-primary/5 hover:border-primary/50 transition-all group">
                      <Upload className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                      <span className="text-[11px] font-black uppercase tracking-widest">Файл</span>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
                
                {showCamera && (
                  <div className="relative rounded-[3rem] overflow-hidden bg-black aspect-video shadow-2xl animate-in zoom-in duration-500">
                    <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                    <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-6">
                      <Button onClick={capturePhoto} className="rounded-full w-20 h-20 bg-white text-primary hover:scale-110 transition-all shadow-2xl"><Camera className="h-10 w-10" /></Button>
                      <Button onClick={stopCamera} variant="destructive" className="rounded-full w-20 h-20 shadow-2xl"><X className="h-10 w-10" /></Button>
                    </div>
                  </div>
                )}
                
                {image && !showCamera && (
                  <div className="relative rounded-[3rem] overflow-hidden group shadow-2xl border-4 border-white animate-in zoom-in duration-500">
                    <img src={image} className="w-full aspect-video object-cover" />
                    <Button variant="destructive" size="icon" className="absolute top-6 right-6 rounded-full opacity-0 group-hover:opacity-100 transition-all" onClick={() => setImage(null)}><X className="h-5 w-5" /></Button>
                  </div>
                )}
                
                <Button className="w-full h-24 rounded-[2.5rem] text-2xl font-black bg-primary shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all" onClick={() => handleSubmit(false)} disabled={loading}>
                  {loading ? <Loader2 className="mr-4 h-10 w-10 animate-spin" /> : <Sparkles className="mr-4 h-10 w-10 text-accent" />} Начать AI-анализ
                </Button>
              </TabsContent>

              <TabsContent value="fasting" className="space-y-10 animate-in fade-in duration-700 outline-none">
                 <div className="p-12 bg-indigo-50/50 rounded-[4rem] text-center space-y-8 border border-indigo-100">
                    <div className="relative mx-auto w-32 h-32">
                       <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping" />
                       <div className="relative w-full h-full bg-indigo-600 rounded-full flex items-center justify-center shadow-2xl shadow-indigo-600/30">
                          <Timer className="h-16 w-16 text-white" />
                       </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-3xl font-black text-indigo-950">Интервальное окно</h4>
                      <p className="text-indigo-600/60 font-medium text-lg max-w-sm mx-auto">ИИ оптимизирует ваш метаболизм в реальном времени во время голодания.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-6 pt-4">
                       <Button className="h-20 rounded-[1.75rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xl shadow-xl shadow-indigo-600/20">Начать</Button>
                       <Button variant="outline" className="h-20 rounded-[1.75rem] border-indigo-200 text-indigo-600 font-black text-xl hover:bg-indigo-50">Пауза</Button>
                    </div>
                 </div>
              </TabsContent>

              <TabsContent value="metrics" className="space-y-10 animate-in fade-in duration-700 outline-none">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-muted-foreground flex gap-3 px-2"><Scale className="h-4 w-4" /> Текущий вес (кг)</label>
                      <Input placeholder="0.0" value={weight} onChange={e => setWeight(e.target.value)} type="number" className={inputClasses} />
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-muted-foreground flex gap-3 px-2"><Droplet className="h-4 w-4" /> Вода (мл)</label>
                      <Input placeholder="250" value={water} onChange={e => setWater(e.target.value)} type="number" className={inputClasses} />
                   </div>
                   <div className="space-y-3 col-span-full">
                      <label className="text-[10px] font-black uppercase text-muted-foreground flex gap-3 px-2"><Footprints className="h-4 w-4" /> Шаги за сегодня</label>
                      <Input placeholder="10,000" value={steps} onChange={e => setSteps(e.target.value)} type="number" className={inputClasses} />
                   </div>
                </div>
                <Button className="w-full h-24 rounded-[2.5rem] text-2xl font-black bg-primary shadow-2xl shadow-primary/30" onClick={() => handleSubmit(false)}>Синхронизировать Bio-Hub</Button>
              </TabsContent>

              <TabsContent value="labs" className="space-y-10 animate-in fade-in duration-700 outline-none">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-muted-foreground flex gap-3 px-2">Результаты обследования</label>
                    <Textarea 
                       placeholder="Введите данные анализов или жалобы для анализа ИИ-специалистом..." 
                       className="min-h-[250px] rounded-[3rem] bg-primary/5 border-none p-10 text-xl font-medium resize-none placeholder:text-muted-foreground/30 focus:ring-8 focus:ring-primary/5 transition-all" 
                    />
                 </div>
                 <Button className="w-full h-24 rounded-[2.5rem] text-2xl font-black bg-primary shadow-2xl shadow-primary/30" onClick={() => handleSubmit(false)}>Добавить в мед-карту</Button>
              </TabsContent>
            </Tabs>
          ) : mealResult ? (
            <div className="space-y-12 animate-in zoom-in duration-700">
              <div className="text-center space-y-4">
                <Badge className="bg-primary/10 text-primary border-none px-8 py-3 rounded-2xl font-black uppercase tracking-[0.4em] text-[11px]">AI Scan Complete</Badge>
                <h3 className="text-5xl font-black tracking-tighter leading-none">{mealResult.mealName}</h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                 {[
                   { label: 'Ккал', val: mealResult.calories, color: 'text-primary', bg: 'bg-primary/5' },
                   { label: 'Белки', val: mealResult.protein, color: 'text-secondary', bg: 'bg-secondary/10' },
                   { label: 'Жиры', val: mealResult.fat, color: 'text-accent-foreground', bg: 'bg-accent/10' },
                   { label: 'Углеводы', val: mealResult.carbs, color: 'text-muted-foreground', bg: 'bg-muted/50' }
                 ].map((stat, i) => (
                   <div key={i} className={cn("p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center", stat.bg)}>
                     <p className={cn("text-3xl font-black", stat.color)}>{stat.val}</p>
                     <p className="text-[11px] font-black uppercase tracking-widest opacity-50 mt-1">{stat.label}</p>
                   </div>
                 ))}
              </div>

              <div className="bg-muted/30 p-10 rounded-[3rem] border-l-8 border-primary relative overflow-hidden">
                <Brain className="absolute -right-8 -top-8 h-32 w-32 text-primary/5 rotate-12" />
                <p className="text-xl font-medium italic text-foreground/80 leading-relaxed relative z-10">"{mealResult.analysis}"</p>
              </div>

              <div className="flex gap-4">
                <Button className="flex-1 h-20 rounded-[1.75rem] font-black text-xl bg-primary shadow-xl" onClick={() => setIsOpen(false)}>Подтвердить и сохранить</Button>
                <Button variant="outline" className="h-20 w-20 rounded-[1.75rem] border-muted bg-muted/20" onClick={reset}><RefreshCw className="h-8 w-8 text-muted-foreground" /></Button>
              </div>
            </div>
          ) : (
            <div className="py-24 flex flex-col items-center text-center space-y-8 animate-in zoom-in duration-700">
              <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center relative">
                 <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                 <CheckCircle2 className="h-16 w-16 text-primary relative z-10" />
              </div>
              <div className="space-y-3">
                <h3 className="text-4xl font-black tracking-tight">Bio-Hub Синхронизирован</h3>
                <p className="text-muted-foreground font-medium text-xl max-w-sm">ИИ обновил ваш Bio-Score и план питания на основе новых данных.</p>
              </div>
              <Button className="w-72 h-20 rounded-[1.75rem] font-black text-2xl bg-primary shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all" onClick={reset}>Продолжить</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
