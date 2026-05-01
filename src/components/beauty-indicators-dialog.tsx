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
  CalendarDays, HeartPulse
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
        const birthYear = parseInt(parts[2], 10);
        if (!isNaN(birthYear)) {
          return new Date().getFullYear() - birthYear;
        }
      }
      // Если формат ГГГГ-ММ-ДД
      const date = new Date(birthDateStr);
      if (!isNaN(date.getTime())) {
        return new Date().getFullYear() - date.getFullYear();
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
        throw new Error('ИИ не вернул результат. Попробуйте еще раз.');
      }
    } catch (e: any) {
      console.error("Beauty Analysis Error:", e);
      toast({ 
        variant: 'destructive', 
        title: 'Ошибка ИИ', 
        description: e.message || 'Не удалось провести анализ. Попробуйте сократить текст или сделать фото четче.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({ variant: 'destructive', title: 'Файл слишком большой', description: 'Максимальный размер фото - 10МБ.' });
        return;
      }
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
          <Sparkles className="absolute -right-8 -bottom-8 h-32 w-32 text-white/10 rotate-12" />
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
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-white/30 px-2 tracking-widest">
                      {activeTab === 'hair' && 'Опишите структуру волос или прикрепите состав шампуня'}
                      {activeTab === 'nails' && 'Опишите состояние (волны, пятна, ломкость) или фото ногтей'}
                      {activeTab === 'skin' && 'Укажите зоны высыпаний или уровень стянутости'}
                      {activeTab === 'teeth' && 'Отметьте чувствительность или состояние эмали'}
                    </label>
                    <Textarea 
                      placeholder="Начните вводить текст..." 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="min-h-[150px] rounded-3xl bg-white/5 border-white/10 p-6 text-lg font-medium text-white shadow-inner resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="cursor-pointer">
                      <div className="h-32 rounded-3xl border-dashed border-2 border-white/10 bg-white/5 flex flex-col items-center justify-center hover:border-pink-500/50 transition-all text-white/40">
                        {image ? <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-2" /> : <Camera className="h-8 w-8 text-pink-500 mb-2" />}
                        <span className="text-[10px] font-black uppercase">{image ? 'Фото добавлено' : 'Сделать фото / Состав'}</span>
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                    </label>
                    
                    <div className="bg-white/5 rounded-3xl p-6 border border-white/10 flex flex-col justify-center">
                       <div className="flex items-center gap-3">
                          <Info className="h-5 w-5 text-pink-500" />
                          <p className="text-[10px] font-bold text-white/60 leading-tight uppercase">
                            ИИ проанализирует фото и текст, связав внешние признаки с внутренними дефицитами.
                          </p>
                       </div>
                    </div>
                  </div>

                  <Button 
                    className="w-full h-18 rounded-3xl bg-pink-500 text-white font-black text-xl shadow-xl shadow-pink-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                    onClick={handleAnalyze}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="animate-spin h-6 w-6" /> : <><Sparkles className="mr-3 h-6 w-6" /> ЗАПУСТИТЬ АНАЛИЗ</>}
                  </Button>
                </div>
              ) : (
                <div className="space-y-8 animate-in zoom-in-95 duration-500">
                   <div className="bg-pink-500/10 border border-pink-500/20 rounded-[2rem] p-8 space-y-4">
                      <div className="flex items-center gap-3">
                         <Zap className="h-6 w-6 text-pink-500" />
                         <h4 className="text-xl font-black text-white uppercase tracking-tight">Био-Заключение</h4>
                      </div>
                      <p className="text-sm md:text-base font-medium leading-relaxed text-white/80 italic">
                        "{result.analysis}"
                      </p>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                         <h5 className="text-[10px] font-black uppercase text-pink-400 px-2 tracking-widest flex items-center gap-2">
                            <Stethoscope className="h-3 w-3" /> Проверить в организме
                         </h5>
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
                         <h5 className="text-[10px] font-black uppercase text-emerald-400 px-2 tracking-widest flex items-center gap-2">
                            <CheckCircle2 className="h-3 w-3" /> Рекомендации
                         </h5>
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

                   {result.specialistHint && (
                     <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-[1.5rem] flex items-start gap-4">
                        <AlertCircle className="h-6 w-6 text-blue-400 shrink-0" />
                        <p className="text-xs font-bold text-blue-100/70 leading-relaxed uppercase tracking-tight">
                           {result.specialistHint}
                        </p>
                     </div>
                   )}

                   <div className="flex gap-4">
                      <Button variant="outline" className="flex-1 h-14 rounded-2xl border-white/10 text-white/40 font-bold" onClick={() => setResult(null)}>НОВЫЙ ТЕСТ</Button>
                      <Button className="flex-1 h-14 rounded-2xl bg-pink-500 font-black text-white" onClick={() => setIsOpen(false)}>ПОНЯТНО</Button>
                   </div>
                </div>
              )}

              {/* ДОПОЛНИТЕЛЬНЫЕ ИНСТРУМЕНТЫ */}
              {!result && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/5">
                   {activeTab === 'nails' && (
                      <div className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-3">
                         <h5 className="text-[9px] font-black text-pink-500 uppercase flex items-center gap-2"><CalendarDays className="h-4 w-4" /> Маникюрный календарь</h5>
                         <p className="text-[11px] text-white/40 font-medium">Рекомендуется делать перерыв в гель-лаке каждые 3-4 месяца на 2 недели для восстановления ногтевой пластины.</p>
                      </div>
                   )}
                   {activeTab === 'skin' && (
                      <div className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-3">
                         <h5 className="text-[9px] font-black text-cyan-500 uppercase flex items-center gap-2"><Sun className="h-4 w-4" /> SPF Индикатор</h5>
                         <p className="text-[11px] text-white/40 font-medium">Для комбинированной кожи в вашем регионе сегодня рекомендован SPF 30+. Наносите за 20 минут до выхода.</p>
                      </div>
                   )}
                   {activeTab === 'teeth' && (
                      <div className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-3">
                         <h5 className="text-[9px] font-black text-white uppercase flex items-center gap-2"><HeartPulse className="h-4 w-4" /> Дневник чувствительности</h5>
                         <p className="text-[11px] text-white/40 font-medium">Если боль на холодное сохраняется более 3 дней, это может указывать на оголение шеек зубов. ИИ советует снизить потребление фруктовых соков.</p>
                      </div>
                   )}
                </div>
              )}
            </div>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
