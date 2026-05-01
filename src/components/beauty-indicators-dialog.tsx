'use client';

import { useState } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { 
  Sparkles, Scissors, Fingerprint, Smile, 
  Stethoscope, Info, Camera, Upload, X, 
  Loader2, Droplets, Sun, Zap, AlertCircle, CheckCircle2,
  CalendarDays, HeartPulse, Mic
} from 'lucide-react';
import { analyzeBeauty } from '@/ai/flows/analyze-beauty';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export function BeautyIndicatorsDialog() {
  const { user } = useUser();
  const { firestore } = useFirestore();
  const { toast } = useToast();
  
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('hair');
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore || user.uid === 'public-user') return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userData } = useDoc<any>(userDocRef);

  // Исправленный расчет возраста из формата ДД.ММ.ГГГГ
  const calculateAge = (birthDateStr: string) => {
    if (!birthDateStr) return undefined;
    try {
      const parts = birthDateStr.split('.');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        const birthDate = new Date(year, month, day);
        if (!isNaN(birthDate.getTime())) {
          let age = new Date().getFullYear() - birthDate.getFullYear();
          const m = new Date().getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && new Date().getDate() < birthDate.getDate())) {
            age--;
          }
          return age;
        }
      }
      return undefined;
    } catch (e) {
      return undefined;
    }
  };

  const handleAnalyze = async () => {
    if (!description && !image) {
      toast({ 
        variant: 'destructive', 
        title: 'Данные не введены', 
        description: 'Пожалуйста, опишите проблему или прикрепите фотографию для анализа.' 
      });
      return;
    }

    setLoading(true);
    try {
      const age = calculateAge(userData?.birthDate);
      
      const analysis = await analyzeBeauty({
        category: activeTab as any,
        description: description || undefined,
        photoDataUri: image || undefined,
        userContext: {
          age: age,
          healthGoal: userData?.healthGoal
        }
      });
      
      if (analysis) {
        setResult(analysis);
      } else {
        throw new Error('ИИ не вернул результат.');
      }
    } catch (e: any) {
      console.error("Beauty Analysis Error:", e);
      toast({ 
        variant: 'destructive', 
        title: 'Ошибка ИИ', 
        description: e.message || 'Не удалось провести анализ.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const reset = () => {
    setDescription('');
    setImage(null);
    setResult(null);
  };

  const categories = [
    { id: 'hair', label: 'Волосы', icon: Scissors, color: 'text-orange-400' },
    { id: 'nails', label: 'Ногти', icon: Fingerprint, color: 'text-pink-400' },
    { id: 'skin', label: 'Кожа', icon: Droplets, color: 'text-cyan-400' },
    { id: 'teeth', label: 'Зубы', icon: Smile, color: 'text-white' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) reset(); }}>
      <DialogTrigger asChild>
        <button className="h-10 px-4 md:px-6 rounded-full border border-pink-500/20 bg-pink-500/5 text-pink-500 font-black uppercase text-[10px] flex items-center gap-2 shadow-lg shadow-pink-500/5 hover:bg-pink-500/10 transition-all">
          <Sparkles className="h-4 w-4 animate-pulse" />
          <span className="hidden sm:inline">Бьюти показатели</span>
          <span className="sm:hidden">Бьюти</span>
        </button>
      </DialogTrigger>
      <DialogContent className="w-[98vw] md:max-w-[750px] rounded-[2.5rem] md:rounded-[3.5rem] p-0 overflow-hidden border-none shadow-2xl z-[1100] bg-[#010411]">
        <DialogHeader className="p-8 md:p-10 bg-gradient-to-br from-pink-600 to-purple-600 text-white shrink-0 relative overflow-hidden">
          <div className="relative z-10">
            <DialogTitle className="text-2xl md:text-4xl font-black uppercase tracking-tighter">Bio-Beauty Hub</DialogTitle>
            <p className="text-white/60 font-black uppercase text-[10px] tracking-widest mt-1">Интеллектуальный анализатор эстетики</p>
          </div>
        </DialogHeader>

        <Tabs defaultValue="hair" value={activeTab} onValueChange={(v) => { setActiveTab(v); reset(); }} className="w-full">
          <TabsList className="grid w-full h-14 bg-white/5 border-b border-white/5 rounded-none grid-cols-4 p-0">
            {categories.map(cat => (
              <TabsTrigger 
                key={cat.id} 
                value={cat.id} 
                className="rounded-none font-black text-[9px] uppercase tracking-widest data-[state=active]:bg-white/5 data-[state=active]:text-pink-500"
              >
                <cat.icon className={cn("h-4 w-4 mr-2", cat.color)} />
                <span className="hidden sm:inline">{cat.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <ScrollArea className="h-[60vh]">
            <div className="p-6 md:p-10 space-y-8 bg-blue-950/20 backdrop-blur-3xl min-h-[400px]">
              {!result ? (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <Textarea 
                    placeholder="Напишите здесь описание или прикрепите фото ниже..." 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[150px] rounded-3xl bg-white/5 border-white/10 p-6 text-lg font-medium text-white shadow-inner resize-none"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="cursor-pointer">
                      <div className="h-32 rounded-3xl border-dashed border-2 border-white/10 bg-white/5 flex flex-col items-center justify-center hover:border-pink-500/50 transition-all text-white/40">
                        {image ? <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-2" /> : <Camera className="h-8 w-8 text-pink-500 mb-2" />}
                        <span className="text-[10px] font-black uppercase">{image ? 'Фото добавлено' : 'Сделать фото / Состав'}</span>
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                    </label>
                    <div className="bg-white/5 rounded-3xl p-6 border border-white/10 flex items-center justify-center">
                       <p className="text-[10px] font-bold text-white/40 leading-tight uppercase text-center">
                         ИИ проанализирует изображение и свяжет внешние признаки с дефицитами.
                       </p>
                    </div>
                  </div>

                  <Button 
                    className="w-full h-18 rounded-3xl bg-pink-500 text-white font-black text-xl shadow-xl hover:scale-[1.02] transition-all"
                    onClick={handleAnalyze}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="animate-spin h-6 w-6" /> : <><Sparkles className="mr-3 h-6 w-6" /> ЗАПУСТИТЬ АНАЛИЗ</>}
                  </Button>
                </div>
              ) : (
                <div className="space-y-8 animate-in zoom-in-95 duration-500">
                   <div className="bg-pink-500/10 border border-pink-500/20 rounded-[2rem] p-8 space-y-4">
                      <h4 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2"><Zap className="h-5 w-5 text-pink-500" /> Анализ ИИ</h4>
                      <p className="text-sm md:text-base font-medium leading-relaxed text-white/80 italic">"{result.analysis}"</p>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                         <h5 className="text-[10px] font-black uppercase text-pink-400 px-2 tracking-widest flex items-center gap-2"><Stethoscope className="h-3 w-3" /> Проверить</h5>
                         <div className="space-y-2">
                            {result.suggestedChecks?.map((item: string, i: number) => (
                               <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center gap-3">
                                  <div className="h-2 w-2 rounded-full bg-pink-500" />
                                  <span className="text-sm font-bold text-white/90">{item}</span>
                               </div>
                            ))}
                         </div>
                      </div>
                      <div className="space-y-4">
                         <h5 className="text-[10px] font-black uppercase text-emerald-400 px-2 tracking-widest flex items-center gap-2"><CheckCircle2 className="h-3 w-3" /> Советы</h5>
                         <div className="space-y-2">
                            {result.recommendations?.map((item: string, i: number) => (
                               <div key={i} className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-2xl flex items-center gap-3">
                                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                  <span className="text-xs font-medium text-white/80 leading-snug">{item}</span>
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>

                   <Button className="w-full h-14 rounded-2xl bg-pink-500 font-black text-white" onClick={() => setResult(null)}>НОВЫЙ АНАЛИЗ</Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
