'use client';

import { useState } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogTrigger, DialogDescription
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { 
  Sparkles, Scissors, Fingerprint, Smile, 
  Stethoscope, Camera, X, 
  Loader2, Droplets, Zap, CheckCircle2,
  Mic
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

  const isMale = userData?.gender === 'мужской';
  const hubTitle = isMale ? 'Био-Эстетика' : 'Bio-Beauty Hub';
  const mainButtonLabel = isMale ? 'Эстетика' : 'Бьюти';

  const compressImage = (dataUri: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.5));
      };
      img.src = dataUri;
    });
  };

  const handleAnalyze = async () => {
    if (!description && !image) {
      toast({ 
        variant: 'destructive', 
        title: 'Данные не введены', 
        description: 'Опишите состояние или прикрепите фото.' 
      });
      return;
    }

    setLoading(true);
    setResult(null); 
    
    try {
      let finalImage = null;
      if (image) {
        finalImage = await compressImage(image);
      }

      const response = await analyzeBeauty({
        category: activeTab as any,
        description: description || undefined,
        photoDataUri: finalImage || undefined,
        userContext: { age: userData?.age, healthGoal: userData?.healthGoal }
      });
      
      if (response) {
        setResult(response);
        toast({ title: 'Анализ завершен' });
      }
    } catch (e: any) {
      console.error("Beauty analysis error:", e);
      toast({ 
        variant: 'destructive', 
        title: 'Ошибка анализа', 
        description: e.message || 'Сервер перегружен. Попробуйте еще раз с меньшим фото.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { 
        setImage(reader.result as string); 
        setResult(null); 
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
    { id: 'hair', label: 'Волосы', icon: Scissors, color: 'text-orange-400', desc: 'Анализ структуры волос или состава средств' },
    { id: 'nails', label: 'Ногти', icon: Fingerprint, color: isMale ? 'text-cyan-400' : 'text-pink-400', desc: 'Поиск визуальных маркеров дефицитов' },
    { id: 'skin', label: 'Кожа', icon: Droplets, color: 'text-cyan-400', desc: 'Диагностика текстуры и увлажненности' },
    { id: 'teeth', label: 'Зубы', icon: Smile, color: 'text-white', desc: 'Оценка прозрачности эмали и налета' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) reset(); }}>
      <DialogTrigger asChild>
        <button className={cn(
          "h-10 px-3 md:px-6 rounded-full border font-black uppercase text-[10px] flex items-center gap-2 shadow-lg transition-all",
          isMale 
            ? "border-cyan-500/20 bg-cyan-500/5 text-cyan-500 shadow-cyan-500/5 hover:bg-cyan-500/10" 
            : "border-pink-500/20 bg-pink-500/5 text-pink-500 shadow-pink-500/5 hover:bg-pink-500/10"
        )}>
          <Sparkles className="h-4 w-4 animate-pulse shrink-0" />
          <span>{mainButtonLabel}</span>
        </button>
      </DialogTrigger>
      <DialogContent className="w-[98vw] md:max-w-[800px] rounded-[2.5rem] md:rounded-[3.5rem] p-0 overflow-hidden border-none shadow-2xl z-[1100] bg-[#010411]">
        <DialogHeader className={cn(
          "p-6 md:p-10 text-white shrink-0",
          isMale ? "bg-gradient-to-br from-cyan-600 to-blue-700" : "bg-gradient-to-br from-pink-600 to-purple-600"
        )}>
          <DialogTitle className="text-2xl md:text-4xl font-black uppercase tracking-tighter">{hubTitle}</DialogTitle>
          <DialogDescription className="sr-only">ИИ-диагностика эстетических показателей.</DialogDescription>
          <p className="text-white/60 font-black uppercase text-[10px] tracking-widest mt-1">Holographic Beauty Scan</p>
        </DialogHeader>

        <Tabs defaultValue="hair" value={activeTab} onValueChange={(v) => { setActiveTab(v); reset(); }}>
          <TabsList className="grid w-full h-14 bg-white/5 border-b border-white/5 rounded-none grid-cols-4 p-0">
            {categories.map(cat => (
              <TabsTrigger key={cat.id} value={cat.id} className={cn(
                "rounded-none font-black text-[8px] md:text-[10px] uppercase tracking-widest data-[state=active]:bg-white/5",
                isMale ? "data-[state=active]:text-cyan-500" : "data-[state=active]:text-pink-500"
              )}>
                <cat.icon className={cn("h-4 w-4 md:mr-2", cat.color)} />
                <span className="hidden xs:inline">{cat.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="max-h-[60vh] overflow-y-auto">
            <div className="p-5 md:p-10 space-y-8 bg-blue-950/20 backdrop-blur-3xl min-h-[400px]">
              {!result ? (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <div className="space-y-2">
                     <p className={cn(
                       "text-[10px] font-black uppercase px-2 tracking-widest",
                       isMale ? "text-cyan-400/60" : "text-pink-400/60"
                     )}>{categories.find(c => c.id === activeTab)?.desc}</p>
                     <Textarea 
                      placeholder="Опишите симптомы или прикрепите фото..." 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="min-h-[120px] rounded-3xl bg-white/5 border-white/10 p-6 text-base font-medium text-white shadow-inner resize-none focus:ring-primary/10"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="cursor-pointer group">
                      <div className={cn(
                        "h-28 rounded-3xl border-dashed border-2 border-white/10 bg-white/5 flex flex-col items-center justify-center transition-all text-white/40",
                        isMale ? "group-hover:border-cyan-500/50" : "group-hover:border-pink-500/50"
                      )}>
                        {image ? <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-2" /> : <Camera className={cn("h-8 w-8 mb-2", isMale ? "text-cyan-500" : "text-pink-500")} />}
                        <span className="text-[10px] font-black uppercase tracking-widest">{image ? 'Фото готово' : 'Сделать фото'}</span>
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                    </label>
                    <div className="bg-white/5 rounded-3xl p-6 border border-white/10 flex flex-col justify-center gap-2">
                       <div className={cn("flex items-center gap-2", isMale ? "text-cyan-400" : "text-pink-400")}>
                          <Zap className="h-3 w-3" />
                          <span className="text-[9px] font-black uppercase">ИИ Алгоритм</span>
                       </div>
                       <p className="text-[9px] font-bold text-white/30 uppercase leading-relaxed tracking-tight">
                         Для анализа ногтей и кожи делайте четкие снимки при хорошем освещении.
                       </p>
                    </div>
                  </div>

                  {image && (
                    <div className="relative rounded-3xl overflow-hidden aspect-video border-4 border-white/10 shadow-2xl animate-in fade-in">
                       <img src={image} alt="Preview" className="w-full h-full object-cover" />
                       <Button variant="destructive" size="icon" className="absolute top-4 right-4 rounded-full h-10 w-10" onClick={() => setImage(null)}><X className="h-5 w-5" /></Button>
                    </div>
                  )}

                  <Button 
                    className={cn(
                      "w-full h-16 rounded-3xl text-white font-black text-lg shadow-xl transition-all",
                      isMale ? "bg-cyan-500 shadow-cyan-500/20" : "bg-pink-500 shadow-pink-500/20"
                    )}
                    onClick={handleAnalyze}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="animate-spin h-7 w-7" /> : <><Sparkles className="mr-2 h-6 w-6" /> НАЧАТЬ АНАЛИЗ</>}
                  </Button>
                </div>
              ) : (
                <div className="space-y-8 animate-in zoom-in-95 duration-500 pb-10">
                   <div className={cn(
                     "border rounded-[2rem] p-6 md:p-8 space-y-4",
                     isMale ? "bg-cyan-500/10 border-cyan-500/20" : "bg-pink-500/10 border-pink-500/20"
                   )}>
                      <h4 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2"><Zap className={cn("h-5 w-5", isMale ? "text-cyan-500" : "text-pink-500")} /> Заключение</h4>
                      <p className="text-sm md:text-lg font-medium leading-relaxed text-white/90 italic">"{result.analysis}"</p>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                         <h5 className={cn("text-[10px] font-black uppercase px-2 tracking-widest", isMale ? "text-cyan-400" : "text-pink-400")}>Рекомендовано проверить:</h5>
                         <div className="space-y-2">
                            {result.suggestedChecks?.map((item: string, i: number) => (
                               <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center gap-4">
                                  <div className={cn("h-2 w-2 rounded-full", isMale ? "bg-cyan-500" : "bg-pink-500")} />
                                  <span className="text-sm font-black text-white/90 uppercase tracking-tight">{item}</span>
                               </div>
                            ))}
                         </div>
                      </div>
                      <div className="space-y-4">
                         <h5 className="text-[10px] font-black uppercase text-emerald-400 px-2 tracking-widest">Советы:</h5>
                         <div className="space-y-2">
                            {result.recommendations?.map((item: string, i: number) => (
                               <div key={i} className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-2xl flex items-start gap-4">
                                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                  <span className="text-sm font-medium text-white/80 leading-relaxed">{item}</span>
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>

                   <div className="flex gap-4">
                      <Button className="flex-1 h-14 rounded-2xl bg-white/5 border border-white/10 font-black text-white uppercase text-[10px]" onClick={() => setResult(null)}>НОВЫЙ СКАН</Button>
                      <Button className={cn("flex-1 h-14 rounded-2xl text-white font-black uppercase text-[10px]", isMale ? "bg-cyan-500" : "bg-pink-500")} onClick={() => setIsOpen(false)}>ЗАКРЫТЬ</Button>
                   </div>
                </div>
              )}
            </div>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
