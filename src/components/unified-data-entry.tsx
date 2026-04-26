'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Camera, Upload, Sparkles, X, Loader2, Activity, FlaskConical, 
  CheckCircle2, Zap, HeartPulse, Mic, Utensils, Scale, Smile,
  Battery, Brain, Heart, Sun, Moon
} from 'lucide-react';
import { analyzeMeal, AnalyzeMealOutput } from '@/ai/flows/analyze-meal';
import { analyzeLabResults, AnalyzeLabOutput } from '@/ai/flows/analyze-lab-results';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { syncGoogleFitData } from '@/app/actions/sync-google-fit';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const [image, setImage] = useState<string | null>(null);
  const [mealResult, setMealResult] = useState<AnalyzeMealOutput | null>(null);
  const [labResult, setLabResult] = useState<AnalyzeLabOutput | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [recordingField, setRecordingField] = useState<string | null>(null);
  
  const [water, setWater] = useState('');
  const [weight, setWeight] = useState('');
  const [steps, setSteps] = useState('');
  const [sleep, setSleep] = useState('');
  const [mood, setMood] = useState('Спокойствие');
  const [energy, setEnergy] = useState([50]);

  const userDocRef = useMemoFirebase(() => user?.uid ? doc(firestore!, 'users', user.uid) : null, [user?.uid, firestore]);
  const { data: userData } = useDoc<any>(userDocRef);

  const { toast } = useToast();

  const handleDailyLogSubmit = async () => {
    if (!firestore || !user?.uid) return;
    setLoading(true);
    try {
      const dateKey = format(selectedDate, 'yyyy-MM-dd');
      const docRef = doc(firestore, 'users', user.uid, 'dailyLogs', dateKey);
      
      const logData: any = {
        date: dateKey,
        updatedAt: serverTimestamp(),
        timestamp: Timestamp.fromDate(selectedDate)
      };

      if (water) logData.water = Number(water);
      if (weight) logData.weight = Number(weight);
      if (steps) logData.steps = Number(steps);
      if (sleep) logData.sleepDurationHours = Number(sleep);
      logData.mood = mood;
      logData.energy = energy[0];

      await setDoc(docRef, logData, { merge: true });
      
      setIsSuccess(true);
      toast({ title: 'Данные обновлены' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Ошибка сохранения', description: e.message });
    } finally {
      setLoading(false);
    }
  };

  const startVoiceInput = (fieldName: string, setter: (val: string) => void) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = 'ru-RU';
    recognition.onstart = () => setRecordingField(fieldName);
    recognition.onend = () => setRecordingField(null);
    recognition.onresult = (event: any) => setter(event.results[0][0].transcript);
    recognition.start();
  };

  const handleAnalyze = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      if (activeTab === 'meal') {
        const result = await analyzeMeal({ description, photoDataUri: image || undefined });
        setMealResult(result);
      } else if (activeTab === 'labs') {
        const result = await analyzeLabResults({ photoDataUri: image!, userContext: { age: userData?.age, gender: userData?.gender } });
        setLabResult(result);
      }
    } catch (e: any) { toast({ variant: 'destructive', title: 'Ошибка ИИ', description: e.message }); } finally { setLoading(false); }
  };

  const reset = () => {
    setDescription(''); setImage(null); setMealResult(null); setLabResult(null); setIsSuccess(false);
    setWater(''); setWeight(''); setSteps(''); setSleep('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) reset(); }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-[98vw] md:max-w-[750px] rounded-[2.5rem] md:rounded-[3.5rem] p-0 overflow-hidden border border-white/10 shadow-2xl z-[1100] bg-[#010411]">
        <DialogHeader className="p-8 md:p-10 bg-primary text-white shrink-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-[#00ffff]/80 opacity-95" />
          <div className="relative z-10">
            <DialogTitle className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-slate-950">Bio-Синхронизация</DialogTitle>
            <p className="text-slate-950/60 font-black uppercase text-[10px] md:text-xs tracking-[0.3em] mt-1">{format(selectedDate, 'd MMMM yyyy', { locale: ru })}</p>
          </div>
          <Zap className="absolute -right-8 -bottom-8 h-32 w-32 text-slate-950/10 rotate-12" />
        </DialogHeader>
        
        <ScrollArea className="h-[70vh]">
          <div className="p-4 md:p-12 space-y-8 bg-blue-950/40 backdrop-blur-3xl min-h-[500px]">
            {!mealResult && !labResult && !isSuccess ? (
              <Tabs defaultValue="meal" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full rounded-2xl md:rounded-3xl h-16 bg-white/5 border border-white/5 p-1 mb-8 grid-cols-4">
                  <TabsTrigger value="meal" className="font-black text-[7px] md:text-[10px] uppercase tracking-tighter gap-1 md:gap-2 data-[state=active]:bg-primary data-[state=active]:text-slate-950"><Utensils className="h-3 w-3 md:h-3.5 md:w-3.5" /> <span className="hidden sm:inline">ЕДА</span></TabsTrigger>
                  <TabsTrigger value="metrics" className="font-black text-[7px] md:text-[10px] uppercase tracking-tighter gap-1 md:gap-2 data-[state=active]:bg-primary data-[state=active]:text-slate-950"><Scale className="h-3 w-3 md:h-3.5 md:w-3.5" /> <span className="hidden sm:inline">ТЕЛО</span></TabsTrigger>
                  <TabsTrigger value="spirit" className="font-black text-[7px] md:text-[10px] uppercase tracking-tighter gap-1 md:gap-2 data-[state=active]:bg-primary data-[state=active]:text-slate-950"><Smile className="h-3 w-3 md:h-3.5 md:w-3.5" /> <span className="hidden sm:inline">ДУХ</span></TabsTrigger>
                  <TabsTrigger value="labs" className="font-black text-[7px] md:text-[10px] uppercase tracking-tighter gap-1 md:gap-2 data-[state=active]:bg-primary data-[state=active]:text-slate-950"><FlaskConical className="h-3 w-3 md:h-3.5 md:w-3.5" /> <span className="hidden sm:inline">ЛАБ</span></TabsTrigger>
                </TabsList>

                <TabsContent value="meal" className="space-y-6 outline-none">
                  <div className="relative"><Textarea placeholder="Опишите ваш прием пищи..." value={description} onChange={e => setDescription(e.target.value)} className="min-h-[180px] rounded-[2rem] bg-white/5 border border-white/10 p-8 text-xl font-bold text-white shadow-inner resize-none" /><Button type="button" variant="ghost" size="icon" onClick={() => startVoiceInput('description', setDescription)} className={cn("absolute right-6 top-6 h-12 w-12 rounded-full", recordingField === 'description' && "bg-red-500 animate-pulse")}><Mic className="h-6 w-6" /></Button></div>
                  <Button className="w-full h-20 rounded-3xl bg-primary text-slate-950 font-black text-xl shadow-xl" onClick={handleAnalyze} disabled={loading || (!description && !image)}>{loading ? <Loader2 className="animate-spin h-6 w-6" /> : <><Sparkles className="h-6 w-6 mr-3" /> РАСПОЗНАТЬ ИИ</>}</Button>
                </TabsContent>

                <TabsContent value="metrics" className="space-y-8 outline-none">
                  <div className="grid grid-cols-2 gap-4 md:gap-6">
                     <div className="space-y-2"><label className="text-[10px] font-black uppercase text-white/30 px-2">Текущий вес (кг)</label><Input placeholder="0.0" value={weight} onChange={e => setWeight(e.target.value)} className="h-16 rounded-2xl bg-white/5 border-white/10 font-black text-2xl text-center text-white" /></div>
                     <div className="space-y-2"><label className="text-[10px] font-black uppercase text-white/30 px-2">Вода (мл)</label><Input placeholder="0" value={water} onChange={e => setWater(e.target.value)} className="h-16 rounded-2xl bg-white/5 border-white/10 font-black text-2xl text-center text-white" /></div>
                     <div className="space-y-2"><label className="text-[10px] font-black uppercase text-white/30 px-2">Шаги</label><Input placeholder="0" value={steps} onChange={e => setSteps(e.target.value)} className="h-16 rounded-2xl bg-white/5 border-white/10 font-black text-2xl text-center text-white" /></div>
                     <div className="space-y-2"><label className="text-[10px] font-black uppercase text-white/30 px-2">Сон (часов)</label><Input placeholder="0" value={sleep} onChange={e => setSleep(e.target.value)} className="h-16 rounded-2xl bg-white/5 border-white/10 font-black text-2xl text-center text-white" /></div>
                  </div>
                  <Button className="w-full h-20 rounded-3xl bg-primary text-slate-950 font-black text-xl shadow-xl" onClick={handleDailyLogSubmit} disabled={loading}>СОХРАНИТЬ МЕТРИКИ</Button>
                </TabsContent>

                <TabsContent value="spirit" className="space-y-10 outline-none">
                   <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 space-y-10">
                      <div className="space-y-4"><div className="flex justify-between items-center"><label className="text-[10px] font-black uppercase text-white/40 tracking-widest flex items-center gap-2"><Zap className="h-3 w-3" /> Уровень энергии</label><span className="text-2xl font-black text-primary">{energy[0]}%</span></div><Slider value={energy} onValueChange={setEnergy} max={100} step={1} className="py-4" /></div>
                      <div className="space-y-4"><label className="text-[10px] font-black uppercase text-white/40 tracking-widest flex items-center gap-2"><Brain className="h-3 w-3" /> Настроение</label><Select value={mood} onValueChange={setMood}><SelectTrigger className="h-16 rounded-2xl bg-black/40 border-white/10 text-xl font-bold text-white px-6"><SelectValue /></SelectTrigger><SelectContent className="bg-slate-900 border-white/10 text-white rounded-xl"><SelectItem value="Счастлив">🚀 Счастлив</SelectItem><SelectItem value="Спокойствие">🧘 Спокоен</SelectItem><SelectItem value="Усталость">🔋 Устал</SelectItem><SelectItem value="Стресс">⚡ Стресс</SelectItem></SelectContent></Select></div>
                   </div>
                   <Button className="w-full h-20 rounded-3xl bg-primary text-slate-950 font-black text-xl shadow-xl" onClick={handleDailyLogSubmit} disabled={loading}>СОХРАНИТЬ СОСТОЯНИЕ</Button>
                </TabsContent>

                <TabsContent value="labs" className="space-y-6 outline-none">
                  <label className="cursor-pointer group"><div className="h-48 rounded-[2.5rem] border-dashed border-2 border-white/10 flex flex-col items-center justify-center bg-white/5 hover:border-primary/40 transition-all text-white"><Upload className="h-12 w-12 text-primary mb-3" /><span className="text-sm font-black uppercase tracking-widest text-white/60">ЗАГРУЗИТЬ СКАН АНАЛИЗА</span></div><input type="file" className="hidden" accept="image/*" onChange={e => { const r = new FileReader(); r.onloadend = () => setImage(r.result as string); r.readAsDataURL(e.target.files![0]); }} /></label>
                  {image && <div className="relative rounded-3xl overflow-hidden aspect-video border-4 border-white/5"><img src={image} className="w-full h-full object-cover" alt="Preview" /><Button variant="destructive" size="icon" className="absolute top-4 right-4 rounded-full" onClick={() => setImage(null)}><X className="h-5 w-5" /></Button></div>}
                  <Button className="w-full h-20 rounded-3xl bg-primary text-slate-950 font-black text-xl shadow-xl" onClick={handleAnalyze} disabled={!image || loading}>{loading ? <Loader2 className="animate-spin h-6 w-6" /> : <><Activity className="h-6 w-6 mr-3" /> АНАЛИЗИРОВАТЬ ЛАБ</>}</Button>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="py-20 flex flex-col items-center text-center space-y-8 animate-in zoom-in duration-500">
                <div className="w-28 h-28 bg-primary rounded-[2rem] flex items-center justify-center shadow-[0_0_60px_rgba(0,255,255,0.5)]"><CheckCircle2 className="h-14 w-14 text-slate-950" /></div>
                <h3 className="text-4xl font-black text-white uppercase tracking-tighter">Синхронизировано</h3>
                <Button className="w-64 h-16 rounded-2xl font-black bg-primary text-slate-950 text-lg shadow-xl" onClick={reset}>ОТЛИЧНО</Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
