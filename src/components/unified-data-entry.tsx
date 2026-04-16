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

  const inputClasses = "h-20 rounded-[2rem] bg-primary/5 border-none font-black text-foreground text-2xl placeholder:text-muted-foreground/20 focus:ring-[12px] focus:ring-primary/5 transition-all px-10 shadow-inner";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) reset(); }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[800px] rounded-[4.5rem] p-0 overflow-hidden border-none shadow-[0_60px_150px_-30px_rgba(0,0,0,0.4)] animate-in slide-in-from-bottom-20 duration-500">
        <DialogHeader className="p-14 bg-primary text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-[#1B4D31] opacity-90" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-2">
              <DialogTitle className="text-5xl font-black tracking-tighter leading-none">Bio-Центр</DialogTitle>
              <p className="text-white/60 font-medium text-lg">Единая точка входа ваших данных</p>
            </div>
            <Badge className="bg-white/10 text-white border border-white/20 px-8 py-4 rounded-[1.75rem] flex gap-4 font-black backdrop-blur-2xl text-[14px] shadow-2xl">
              <CalendarIcon className="h-6 w-6" /> {format(selectedDate, 'd MMMM', { locale: ru })}
            </Badge>
          </div>
          <Activity className="absolute -right-20 -bottom-20 h-64 w-64 text-white/5 rotate-12" />
        </DialogHeader>
        
        <div className="p-14 space-y-12">
          {!mealResult && !isSuccess ? (
            <Tabs defaultValue="meal" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 rounded-[2.5rem] h-20 bg-muted/50 p-2 mb-14">
                <TabsTrigger value="meal" className="rounded-[2rem] font-black gap-3 text-[11px] uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg"><Utensils className="h-5 w-5" /> Еда</TabsTrigger>
                <TabsTrigger value="fasting" className="rounded-[2rem] font-black gap-3 text-[11px] uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg"><Timer className="h-5 w-5" /> Фаст</TabsTrigger>
                <TabsTrigger value="metrics" className="rounded-[2rem] font-black gap-3 text-[11px] uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg"><Scale className="h-5 w-5" /> Тело</TabsTrigger>
                <TabsTrigger value="labs" className="rounded-[2rem] font-black gap-3 text-[11px] uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg"><FlaskConical className="h-5 w-5" /> Лаб</TabsTrigger>
              </TabsList>

              <TabsContent value="meal" className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 outline-none">
                <div className="space-y-6">
                  <label className="text-[12px] font-black uppercase tracking-[0.5em] text-muted-foreground/40 px-4">AI Scan Input</label>
                  <Textarea 
                    placeholder="Что вы съели? Опишите блюдо или добавьте фото для мгновенного анализа нутриентов..." 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    className="min-h-[220px] rounded-[3.5rem] bg-primary/5 border-none p-12 text-2xl font-medium resize-none placeholder:text-muted-foreground/20 focus:ring-[15px] focus:ring-primary/5 transition-all shadow-inner leading-relaxed" 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-8">
                  <Button variant="outline" className="h-40 rounded-[3.5rem] border-dashed border-4 border-muted/50 flex flex-col gap-4 hover:bg-primary/5 hover:border-primary/50 transition-all group" onClick={startCamera}>
                    <div className="w-16 h-16 bg-primary/10 rounded-[2rem] flex items-center justify-center group-hover:scale-110 transition-transform">
                       <Camera className="h-8 w-8 text-primary" />
                    </div>
                    <span className="text-[12px] font-black uppercase tracking-[0.3em] opacity-40">Камера</span>
                  </Button>
                  <label className="cursor-pointer">
                    <div className="h-40 rounded-[3.5rem] border-dashed border-4 border-muted/50 flex flex-col gap-4 items-center justify-center hover:bg-primary/5 hover:border-primary/50 transition-all group">
                      <div className="w-16 h-16 bg-primary/10 rounded-[2rem] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload className="h-8 w-8 text-primary" />
                      </div>
                      <span className="text-[12px] font-black uppercase tracking-[0.3em] opacity-40">Файл</span>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
                
                {showCamera && (
                  <div className="relative rounded-[4rem] overflow-hidden bg-black aspect-video shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] animate-in zoom-in duration-500">
                    <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                    <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-8">
                      <Button onClick={capturePhoto} className="rounded-full w-24 h-24 bg-white text-primary hover:scale-110 transition-all shadow-2xl"><Camera className="h-12 w-12" /></Button>
                      <Button onClick={stopCamera} variant="destructive" className="rounded-full w-24 h-24 shadow-2xl"><X className="h-12 w-12" /></Button>
                    </div>
                  </div>
                )}
                
                {image && !showCamera && (
                  <div className="relative rounded-[4rem] overflow-hidden group shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] border-8 border-white animate-in zoom-in duration-500">
                    <img src={image} className="w-full aspect-video object-cover" />
                    <Button variant="destructive" size="icon" className="absolute top-8 right-8 rounded-full opacity-0 group-hover:opacity-100 transition-all h-14 w-14 shadow-2xl" onClick={() => setImage(null)}><X className="h-6 w-6" /></Button>
                  </div>
                )}
                
                <Button className="w-full h-28 rounded-[3rem] text-3xl font-black bg-primary shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all" onClick={() => handleSubmit(false)} disabled={loading}>
                  {loading ? <Loader2 className="mr-6 h-12 w-12 animate-spin" /> : <Sparkles className="mr-6 h-12 w-12 text-accent" />} Начать AI-анализ
                </Button>
              </TabsContent>

              <TabsContent value="fasting" className="space-y-12 animate-in fade-in duration-700 outline-none">
                 <div className="p-16 bg-indigo-50/50 rounded-[5rem] text-center space-y-10 border border-indigo-100/50 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
                    <div className="relative mx-auto w-40 h-40">
                       <div className="absolute inset-0 bg-indigo-500/10 rounded-full animate-ping" />
                       <div className="relative w-full h-full bg-indigo-600 rounded-[3rem] flex items-center justify-center shadow-[0_30px_80px_-15px_rgba(79,70,229,0.5)] group">
                          <Timer className="h-20 w-20 text-white animate-pulse" />
                       </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-4xl font-black text-indigo-950 tracking-tighter">Интервальное окно</h4>
                      <p className="text-indigo-600/50 font-medium text-xl max-w-sm mx-auto leading-relaxed">ИИ оптимизирует ваш метаболизм в реальном времени во время голодания.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-8 pt-6">
                       <Button className="h-24 rounded-[2.5rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black text-2xl shadow-2xl shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95">Запустить</Button>
                       <Button variant="outline" className="h-24 rounded-[2.5rem] border-indigo-200 text-indigo-600 font-black text-2xl hover:bg-white shadow-sm">Пауза</Button>
                    </div>
                 </div>
              </TabsContent>

              <TabsContent value="metrics" className="space-y-12 animate-in fade-in duration-700 outline-none">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-4">
                      <label className="text-[12px] font-black uppercase tracking-[0.5em] text-muted-foreground/40 flex gap-4 px-4"><Scale className="h-4 w-4" /> Вес (кг)</label>
                      <Input placeholder="0.0" value={weight} onChange={e => setWeight(e.target.value)} type="number" className={inputClasses} />
                   </div>
                   <div className="space-y-4">
                      <label className="text-[12px] font-black uppercase tracking-[0.5em] text-muted-foreground/40 flex gap-4 px-4"><Droplet className="h-4 w-4" /> Вода (мл)</label>
                      <Input placeholder="250" value={water} onChange={e => setWater(e.target.value)} type="number" className={inputClasses} />
                   </div>
                   <div className="space-y-4 col-span-full">
                      <label className="text-[12px] font-black uppercase tracking-[0.5em] text-muted-foreground/40 flex gap-4 px-4"><Footprints className="h-4 w-4" /> Шаги за сегодня</label>
                      <Input placeholder="10,000" value={steps} onChange={e => setSteps(e.target.value)} type="number" className={inputClasses} />
                   </div>
                </div>
                <Button className="w-full h-28 rounded-[3.5rem] text-3xl font-black bg-primary shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02]" onClick={() => handleSubmit(false)}>Синхронизировать</Button>
              </TabsContent>

              <TabsContent value="labs" className="space-y-12 animate-in fade-in duration-700 outline-none">
                 <div className="space-y-4">
                    <label className="text-[12px] font-black uppercase tracking-[0.5em] text-muted-foreground/40 flex gap-4 px-4">AI Medical Analysis</label>
                    <Textarea 
                       placeholder="Введите данные анализов или жалобы для анализа ИИ-специалистом. Мы подготовим отчет по дефицитам..." 
                       className="min-h-[300px] rounded-[4rem] bg-primary/5 border-none p-14 text-2xl font-medium resize-none placeholder:text-muted-foreground/20 focus:ring-[15px] focus:ring-primary/5 transition-all shadow-inner leading-relaxed" 
                    />
                 </div>
                 <Button className="w-full h-28 rounded-[3.5rem] text-3xl font-black bg-primary shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02]" onClick={() => handleSubmit(false)}>Анализировать отчет</Button>
              </TabsContent>
            </Tabs>
          ) : mealResult ? (
            <div className="space-y-16 animate-in zoom-in duration-700">
              <div className="text-center space-y-6">
                <Badge className="bg-primary/10 text-primary border-none px-10 py-4 rounded-2xl font-black uppercase tracking-[0.5em] text-[12px] shadow-sm">AI BIO-SCAN SUCCESS</Badge>
                <h3 className="text-6xl md:text-8xl font-black tracking-tighter leading-none text-foreground">{mealResult.mealName}</h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                 {[
                   { label: 'Ккал', val: mealResult.calories, color: 'text-primary', bg: 'bg-primary/5' },
                   { label: 'Белки', val: mealResult.protein, color: 'text-secondary', bg: 'bg-secondary/10' },
                   { label: 'Жиры', val: mealResult.fat, color: 'text-accent-foreground', bg: 'bg-accent/10' },
                   { label: 'Карбо', val: mealResult.carbs, color: 'text-muted-foreground', bg: 'bg-muted/50' }
                 ].map((stat, i) => (
                   <div key={i} className={cn("p-10 rounded-[3rem] flex flex-col items-center justify-center text-center gap-1 shadow-inner", stat.bg)}>
                     <p className={cn("text-4xl font-black tracking-tighter leading-none", stat.color)}>{stat.val}</p>
                     <p className="text-[12px] font-black uppercase tracking-widest opacity-40 mt-2">{stat.label}</p>
                   </div>
                 ))}
              </div>

              <div className="bg-muted/30 p-12 rounded-[4rem] border-l-[12px] border-primary relative overflow-hidden group shadow-inner">
                <Brain className="absolute -right-12 -top-12 h-48 w-48 text-primary/5 rotate-12 group-hover:rotate-45 transition-transform duration-1000" />
                <p className="text-2xl font-medium italic text-foreground/80 leading-relaxed relative z-10">«{mealResult.analysis}»</p>
              </div>

              <div className="flex gap-6">
                <Button className="flex-1 h-24 rounded-[2.5rem] font-black text-2xl bg-primary shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02]" onClick={() => setIsOpen(false)}>Подтвердить и Сохранить</Button>
                <Button variant="outline" className="h-24 w-24 rounded-[2.5rem] border-muted bg-muted/20 hover:bg-white transition-all shadow-sm" onClick={reset}><RefreshCw className="h-10 w-10 text-muted-foreground" /></Button>
              </div>
            </div>
          ) : (
            <div className="py-32 flex flex-col items-center text-center space-y-12 animate-in zoom-in duration-700">
              <div className="w-48 h-48 bg-primary/10 rounded-full flex items-center justify-center relative">
                 <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                 <div className="relative w-full h-full bg-primary rounded-full flex items-center justify-center shadow-[0_40px_100px_-20px_rgba(45,122,77,0.5)]">
                    <CheckCircle2 className="h-24 w-24 text-white" />
                 </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-5xl font-black tracking-tighter leading-none">Био-Синхронизация</h3>
                <p className="text-muted-foreground font-medium text-2xl max-w-md mx-auto leading-relaxed">ИИ обновил ваш Bio-Score и план питания на основе новых данных.</p>
              </div>
              <Button className="w-80 h-24 rounded-[2.5rem] font-black text-2xl bg-primary shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all" onClick={reset}>Продолжить</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}