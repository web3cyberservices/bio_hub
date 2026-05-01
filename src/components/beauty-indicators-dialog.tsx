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
  CalendarDays, HeartPulse, Mic, ArrowLeft
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

  const calculateAge = (birthDateStr: string) => {
    if (!birthDateStr) return undefined;
    try {
      // Поддержка формата ДД.ММ.ГГГГ
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
        description: 'Пожалуйста, опишите состояние или прикрепите фото (например, состава шампуня или ногтей).' 
      });
      return;
    }

    setLoading(true);
    setResult(null);
    
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
      
      if (analysis && analysis.analysis) {
        setResult(analysis);
        toast({ title: 'Анализ завершен', description: 'ИИ сформировал отчет по бьюти-показателям.' });
      } else {
        throw new Error('ИИ не смог сформировать ответ. Попробуйте загрузить более четкое изображение.');
      }
    } catch (e: any) {
      console.error("Beauty Analysis Error:", e);
      toast({ 
        variant: 'destructive', 
        title: 'Ошибка анализа', 
        description: e.message || 'Не удалось провести анализ. Попробуйте еще раз позже.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({ variant: 'destructive', title: 'Файл слишком большой', description: 'Максимальный размер фото — 10МБ.' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null); // Сбрасываем старый результат при новом фото
      };
      reader.readAsDataURL(file);
    }
  };

  const reset = () => {
    setDescription('');
    setImage(null);
    setResult(null);
  };

  const categories = [
    { id: 'hair', label: 'Волосы', icon: Scissors, color: 'text-orange-400', desc: 'Анализ структуры и состава ухода' },
    { id: 'nails', label: 'Ногти', icon: Fingerprint, color: 'text-pink-400', desc: 'Маркер внутренних дефицитов' },
    { id: 'skin', label: 'Кожа', icon: Droplets, color: 'text-cyan-400', desc: 'Face Mapping и SPF ассистент' },
    { id: 'teeth', label: 'Зубы', icon: Smile, color: 'text-white', desc: 'Дентал-мониторинг эмали' },
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
      <DialogContent className="w-[98vw] md:max-w-[800px] rounded-[2.5rem] md:rounded-[3.5rem] p-0 overflow-hidden border-none shadow-2xl z-[1100] bg-[#010411]">
        <DialogHeader className="p-8 md:p-10 bg-gradient-to-br from-pink-600 to-purple-600 text-white shrink-0 relative overflow-hidden">
          <div className="relative z-10">
            <DialogTitle className="text-2xl md:text-4xl font-black uppercase tracking-tighter">Bio-Beauty Hub</DialogTitle>
            <p className="text-white/60 font-black uppercase text-[10px] tracking-widest mt-1">Интеллектуальная диагностика эстетики</p>
          </div>
        </DialogHeader>

        <Tabs defaultValue="hair" value={activeTab} onValueChange={(v) => { setActiveTab(v); reset(); }} className="w-full">
          <TabsList className="grid w-full h-14 bg-white/5 border-b border-white/5 rounded-none grid-cols-4 p-0">
            {categories.map(cat => (
              <TabsTrigger 
                key={cat.id} 
                value={cat.id} 
                className="rounded-none font-black text-[8px] md:text-[10px] uppercase tracking-widest data-[state=active]:bg-white/5 data-[state=active]:text-pink-500 transition-all"
              >
                <cat.icon className={cn("h-4 w-4 md:mr-2", cat.color)} />
                <span className="hidden sm:inline">{cat.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <ScrollArea className="h-[65vh]">
            <div className="p-6 md:p-10 space-y-8 bg-blue-950/20 backdrop-blur-3xl min-h-[400px]">
              {!result ? (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <div className="space-y-2">
                     <p className="text-[10px] font-black uppercase text-pink-400/60 px-2 tracking-widest">
                       {categories.find(c => c.id === activeTab)?.desc}
                     </p>
                     <Textarea 
                      placeholder={activeTab === 'hair' ? "Опишите состояние волос или прикрепите фото состава шампуня..." : "Опишите жалобы или прикрепите фото зоны (ногти, кожа, зубы)..."} 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="min-h-[150px] rounded-3xl bg-white/5 border-white/10 p-6 text-lg font-medium text-white shadow-inner resize-none focus:ring-4 focus:ring-pink-500/10 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="cursor-pointer group">
                      <div className="h-32 rounded-3xl border-dashed border-2 border-white/10 bg-white/5 flex flex-col items-center justify-center group-hover:border-pink-500/50 group-hover:bg-pink-500/5 transition-all text-white/40">
                        {image ? <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-2 animate-in zoom-in" /> : <Camera className="h-8 w-8 text-pink-500 mb-2 group-hover:scale-110 transition-transform" />}
                        <span className="text-[10px] font-black uppercase tracking-widest">{image ? 'Изображение готово' : 'Сделать фото / Состав'}</span>
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                    </label>
                    <div className="bg-white/5 rounded-3xl p-6 border border-white/10 flex items-center justify-center text-center">
                       <p className="text-[10px] font-bold text-white/40 leading-relaxed uppercase tracking-tight">
                         {activeTab === 'nails' ? 'Загрузите фото ногтей, чтобы ИИ проверил наличие волн или пятен.' : 
                          activeTab === 'hair' ? 'Прикрепите фото состава, чтобы проверить его на сульфаты и силиконы.' :
                          'ИИ проанализирует визуальные изменения и свяжет их с вашим рационом.'}
                       </p>
                    </div>
                  </div>

                  {image && (
                    <div className="relative rounded-3xl overflow-hidden aspect-video border-4 border-white/10 shadow-2xl animate-in fade-in duration-300">
                       <img src={image} alt="Preview" className="w-full h-full object-cover" />
                       <Button variant="destructive" size="icon" className="absolute top-4 right-4 rounded-full h-10 w-10 shadow-xl" onClick={() => setImage(null)}><X className="h-5 w-5" /></Button>
                    </div>
                  )}

                  <Button 
                    className="w-full h-20 rounded-3xl bg-pink-500 text-white font-black text-xl shadow-[0_15px_40px_rgba(236,72,153,0.3)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                    onClick={handleAnalyze}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="animate-spin h-8 w-8" /> : <><Sparkles className="mr-3 h-7 w-7" /> ЗАПУСТИТЬ ИИ-АНАЛИЗ</>}
                  </Button>
                </div>
              ) : (
                <div className="space-y-8 animate-in zoom-in-95 duration-500 pb-10">
                   <div className="bg-pink-500/10 border border-pink-500/20 rounded-[2.5rem] p-8 space-y-4 shadow-xl">
                      <h4 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                        <Zap className="h-5 w-5 text-pink-500" /> Анализ состояния
                      </h4>
                      <p className="text-sm md:text-lg font-medium leading-relaxed text-white/90 italic">"{result.analysis}"</p>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                         <h5 className="text-[10px] font-black uppercase text-pink-400 px-2 tracking-widest flex items-center gap-2">
                           <Stethoscope className="h-3 w-3" /> Что проверить
                         </h5>
                         <div className="space-y-3">
                            {result.suggestedChecks?.map((item: string, i: number) => (
                               <div key={i} className="bg-white/5 border border-white/5 p-5 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-colors">
                                  <div className="h-2.5 w-2.5 rounded-full bg-pink-500 shadow-[0_0_10px_#ec4899]" />
                                  <span className="text-sm font-black text-white/90 uppercase tracking-tight">{item}</span>
                               </div>
                            ))}
                         </div>
                      </div>
                      <div className="space-y-4">
                         <h5 className="text-[10px] font-black uppercase text-emerald-400 px-2 tracking-widest flex items-center gap-2">
                           <CheckCircle2 className="h-3 w-3" /> ИИ-Рекомендации
                         </h5>
                         <div className="space-y-3">
                            {result.recommendations?.map((item: string, i: number) => (
                               <div key={i} className="bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-2xl flex items-start gap-4">
                                  <div className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                  <span className="text-sm font-medium text-white/80 leading-relaxed">{item}</span>
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>

                   {result.specialistHint && (
                     <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-3xl flex items-center gap-4">
                        <Info className="h-6 w-6 text-blue-400 shrink-0" />
                        <p className="text-xs font-bold text-blue-100 uppercase tracking-tight">{result.specialistHint}</p>
                     </div>
                   )}

                   <Button 
                    className="w-full h-16 rounded-2xl bg-white/5 border border-white/10 font-black text-white hover:bg-white/10 transition-all uppercase tracking-widest text-xs" 
                    onClick={() => setResult(null)}
                   >
                     НОВЫЙ АНАЛИЗ
                   </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
