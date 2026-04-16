'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Camera, Upload, Sparkles, X, Loader2, Activity, FlaskConical, 
  CheckCircle2, Watch, Trophy, Timer, Zap, Heart, 
  Calendar as CalendarIcon, Footprints, Moon, RefreshCw, 
  MessageSquare, GraduationCap, Droplet, Scale, Flame
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

  const inputClasses = "h-14 rounded-xl bg-primary/5 border-none font-bold text-foreground text-lg placeholder:text-muted-foreground/40 focus:ring-4 focus:ring-primary/10 transition-all";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) reset(); }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-10 bg-primary text-white">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-3xl font-black tracking-tight leading-none">Bio-Центр</DialogTitle>
            <Badge className="bg-white/20 text-white border-none px-4 py-2 rounded-xl flex gap-2 font-bold backdrop-blur-md">
              <CalendarIcon className="h-4 w-4" /> {format(selectedDate, 'd MMMM', { locale: ru })}
            </Badge>
          </div>
        </DialogHeader>
        
        <div className="p-8 space-y-6">
          {!mealResult && !isSuccess ? (
            <Tabs defaultValue="meal" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 rounded-2xl h-14 bg-muted/50 p-1 mb-8">
                <TabsTrigger value="meal" className="rounded-xl font-bold gap-2 text-[10px] uppercase tracking-widest transition-all"><Activity className="h-4 w-4" /> Еда</TabsTrigger>
                <TabsTrigger value="fasting" className="rounded-xl font-bold gap-2 text-[10px] uppercase tracking-widest transition-all"><Timer className="h-4 w-4" /> Голодание</TabsTrigger>
                <TabsTrigger value="metrics" className="rounded-xl font-bold gap-2 text-[10px] uppercase tracking-widest transition-all"><Scale className="h-4 w-4" /> Замеры</TabsTrigger>
                <TabsTrigger value="labs" className="rounded-xl font-bold gap-2 text-[10px] uppercase tracking-widest transition-all"><FlaskConical className="h-4 w-4" /> Анализы</TabsTrigger>
              </TabsList>

              <TabsContent value="meal" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <Textarea 
                  placeholder="Что вы съели? Опишите словами или добавьте фото для мгновенного AI анализа..." 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  className="min-h-[150px] rounded-3xl bg-primary/5 border-none p-6 text-lg font-medium resize-none placeholder:text-muted-foreground/40 focus:ring-4 focus:ring-primary/10 transition-all" 
                />
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="h-24 rounded-[2rem] border-dashed border-2 flex flex-col gap-2 hover:bg-primary/5 transition-all" onClick={startCamera}>
                    <Camera className="h-7 w-7 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Камера</span>
                  </Button>
                  <label className="cursor-pointer">
                    <div className="h-24 rounded-[2rem] border-dashed border-2 flex flex-col gap-2 items-center justify-center hover:bg-primary/5 transition-all">
                      <Upload className="h-7 w-7 text-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Файл</span>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
                {showCamera && (
                  <div className="relative rounded-[2.5rem] overflow-hidden bg-black aspect-video shadow-2xl">
                    <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                    <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
                      <Button onClick={capturePhoto} className="rounded-full w-14 h-14 bg-white text-primary hover:scale-110 transition-all shadow-xl"><Camera className="h-7 w-7" /></Button>
                      <Button onClick={stopCamera} variant="destructive" className="rounded-full w-14 h-14 shadow-xl"><X className="h-7 w-7" /></Button>
                    </div>
                  </div>
                )}
                {image && !showCamera && <img src={image} className="rounded-[2.5rem] w-full aspect-video object-cover shadow-xl border-4 border-white" />}
                <Button className="w-full h-20 rounded-[1.75rem] text-2xl font-black bg-primary shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all" onClick={() => handleSubmit(false)} disabled={loading}>
                  {loading ? <Loader2 className="mr-3 h-8 w-8 animate-spin" /> : <Sparkles className="mr-3 h-8 w-8" />} Распознать AI
                </Button>
              </TabsContent>

              <TabsContent value="fasting" className="space-y-8 animate-in fade-in duration-500">
                 <div className="p-8 bg-indigo-50 rounded-[2.5rem] text-center space-y-4">
                    <Timer className="h-12 w-12 text-indigo-500 mx-auto" />
                    <h4 className="text-2xl font-black text-indigo-900">Интервальное голодание</h4>
                    <p className="text-indigo-600/70 font-medium">Запустите таймер, чтобы ИИ оптимизировал ваш метаболизм.</p>
                    <div className="grid grid-cols-2 gap-4 pt-4">
                       <Button className="h-16 rounded-2xl bg-indigo-500 text-white font-black text-lg">Начать окно</Button>
                       <Button variant="outline" className="h-16 rounded-2xl border-indigo-200 text-indigo-500 font-black text-lg">Завершить</Button>
                    </div>
                 </div>
              </TabsContent>

              <TabsContent value="metrics" className="space-y-6 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-muted-foreground flex gap-2"><Scale className="h-3 w-3" /> Вес (кг)</label>
                      <Input placeholder="0.0" value={weight} onChange={e => setWeight(e.target.value)} type="number" className={inputClasses} />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-muted-foreground flex gap-2"><Droplet className="h-3 w-3" /> Вода (мл)</label>
                      <Input placeholder="250" value={water} onChange={e => setWater(e.target.value)} type="number" className={inputClasses} />
                   </div>
                   <div className="space-y-2 col-span-full">
                      <label className="text-[10px] font-black uppercase text-muted-foreground flex gap-2"><Footprints className="h-3 w-3" /> Шаги</label>
                      <Input placeholder="0" value={steps} onChange={e => setSteps(e.target.value)} type="number" className={inputClasses} />
                   </div>
                </div>
                <Button className="w-full h-20 rounded-[1.75rem] text-2xl font-black bg-primary shadow-xl shadow-primary/20" onClick={() => handleSubmit(false)}>Сохранить замеры</Button>
              </TabsContent>

              <TabsContent value="labs" className="space-y-6 animate-in fade-in duration-500">
                 <Textarea 
                    placeholder="Введите данные анализов текстом или прикрепите фото бланка во вкладке 'Еда' для анализа..." 
                    className="min-h-[200px] rounded-3xl bg-primary/5 border-none p-6 text-lg font-medium resize-none" 
                 />
                 <Button className="w-full h-20 rounded-[1.75rem] text-2xl font-black bg-primary shadow-xl shadow-primary/20" onClick={() => handleSubmit(false)}>Добавить в мед-карту</Button>
              </TabsContent>
            </Tabs>
          ) : mealResult ? (
            <div className="space-y-8 animate-in zoom-in duration-500">
              <div className="text-center space-y-2">
                <Badge className="bg-primary/10 text-primary border-none px-6 py-2 rounded-full font-black uppercase tracking-widest text-[10px]">AI Bio-Scanner 4.0</Badge>
                <h3 className="text-4xl font-black tracking-tight">{mealResult.mealName}</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 {[
                   { label: 'Ккал', val: mealResult.calories, color: 'text-primary', bg: 'bg-primary/5' },
                   { label: 'Белки', val: mealResult.protein, color: 'text-secondary', bg: 'bg-secondary/10' },
                   { label: 'Жиры', val: mealResult.fat, color: 'text-accent-foreground', bg: 'bg-accent/10' },
                   { label: 'Углеводы', val: mealResult.carbs, color: 'text-muted-foreground', bg: 'bg-muted' }
                 ].map((stat, i) => (
                   <div key={i} className={cn("p-6 rounded-[2rem] flex flex-col items-center justify-center text-center", stat.bg)}>
                     <p className={cn("text-3xl font-black", stat.color)}>{stat.val}</p>
                     <p className="text-[11px] font-bold uppercase tracking-widest opacity-60">{stat.label}</p>
                   </div>
                 ))}
              </div>
              <div className="bg-muted/30 p-6 rounded-[2rem] border-l-4 border-primary">
                <p className="text-sm font-medium italic text-foreground/80 leading-relaxed">"{mealResult.analysis}"</p>
              </div>
              <Button className="w-full h-18 rounded-2xl font-black text-xl bg-muted text-foreground hover:bg-muted/80" onClick={reset}>Добавить еще</Button>
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center text-center space-y-6 animate-in zoom-in duration-500">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center"><CheckCircle2 className="h-12 w-12 text-primary" /></div>
              <h3 className="text-3xl font-black">Данные обновлены!</h3>
              <p className="text-muted-foreground font-medium max-w-xs">Ваш Bio-Hub синхронизирован. ИИ пересчитает Bio-Score и рекомендации.</p>
              <Button className="w-64 h-16 rounded-2xl font-black text-lg bg-primary shadow-xl shadow-primary/20" onClick={reset}>Готово</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}