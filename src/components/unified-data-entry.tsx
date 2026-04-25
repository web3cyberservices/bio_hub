'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Camera, Upload, Sparkles, X, Loader2, Activity, FlaskConical, 
  CheckCircle2, Zap, HeartPulse, Smartphone, Mic, Utensils, Scale, Smile
} from 'lucide-react';
import { analyzeMeal, AnalyzeMealOutput } from '@/ai/flows/analyze-meal';
import { analyzeLabResults, AnalyzeLabOutput } from '@/ai/flows/analyze-lab-results';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { syncGoogleFitData } from '@/app/actions/sync-google-fit';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const [showCamera, setShowCamera] = useState(false);
  const [mealResult, setMealResult] = useState<AnalyzeMealOutput | null>(null);
  const [labResult, setLabResult] = useState<AnalyzeLabOutput | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [recordingField, setRecordingField] = useState<string | null>(null);
  
  const [water, setWater] = useState('');
  const [weight, setWeight] = useState('');
  const [steps, setSteps] = useState('');
  const [sleep, setSleep] = useState('');
  const [mood, setMood] = useState('');
  const [energy, setEnergy] = useState(50);

  // Состояние цикла (только для женщин)
  const [isCycleActive, setIsCycleActive] = useState(false);
  const [cycleIntensity, setCycleIntensity] = useState('medium');
  const [cycleSymptoms, setCycleSymptoms] = useState('');

  const userDocRef = useMemoFirebase(() => user ? doc(firestore!, 'users', user.uid) : null, [user, firestore]);
  const { data: userData } = useDoc<any>(userDocRef);
  const isFemale = String(userData?.gender || '').toLowerCase() === 'женский';

  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const startVoiceInput = (fieldName: string, setter: (val: string) => void) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = 'ru-RU';
    recognition.onstart = () => setRecordingField(fieldName);
    recognition.onend = () => setRecordingField(null);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setter(transcript);
    };
    recognition.start();
  };

  const handleSmartSync = async () => {
    const token = sessionStorage.getItem('google_fit_token');
    if (!token) {
      toast({ variant: 'destructive', title: 'Нужна авторизация Google' });
      return;
    }
    setSyncing(true);
    try {
      const fitData = await syncGoogleFitData(token);
      setSteps(fitData.steps.toString());
      setSleep(fitData.sleepHours.toString());
      toast({ title: 'Google Fit синхронизирован' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Ошибка синхронизации' });
    } finally {
      setSyncing(false);
    }
  };

  const handleAnalyze = async () => {
    if (!firestore || !user) return;
    setLoading(true);
    try {
      if (activeTab === 'meal') {
        const result = await analyzeMeal({ description, photoDataUri: image || undefined });
        setMealResult(result);
      } else if (activeTab === 'labs') {
        const result = await analyzeLabResults({ photoDataUri: image!, userContext: { age: userData?.age, gender: userData?.gender } });
        setLabResult(result);
      }
    } catch (e) {
      toast({ variant: 'destructive', title: 'Ошибка ИИ' });
    } finally {
      setLoading(false);
    }
  };

  const handleDailyLogSubmit = async () => {
    if (!firestore || !user) return;
    setLoading(true);
    try {
      const dateKey = format(selectedDate, 'yyyy-MM-dd');
      await setDoc(doc(firestore, 'users', user.uid, 'dailyLogs', dateKey), {
        date: dateKey,
        water: water ? Number(water) : undefined,
        weight: weight ? Number(weight) : undefined,
        steps: steps ? Number(steps) : undefined,
        sleepDurationHours: sleep ? Number(sleep) : undefined,
        mood: mood || undefined,
        energy: energy,
        cycle: isCycleActive ? { intensity: cycleIntensity, symptoms: cycleSymptoms } : null,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      setIsSuccess(true);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Ошибка' });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setDescription(''); setImage(null); setMealResult(null); setLabResult(null);
    setIsSuccess(false); setWater(''); setWeight(''); setSteps(''); setSleep(''); setMood(''); setEnergy(50);
    setIsCycleActive(false); setCycleSymptoms('');
  };

  const inputClasses = "h-14 md:h-18 rounded-2xl bg-white/5 border border-white/10 font-black text-white text-xl pr-14";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) reset(); }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-[95vw] md:max-w-[700px] rounded-[2.5rem] p-0 overflow-hidden border border-blue-900/30 shadow-2xl z-[1001] bg-[#010411]">
        <DialogHeader className="p-6 md:p-8 bg-primary text-white shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-[#00ffff]/80 opacity-90" />
          <div className="relative z-10">
            <DialogTitle className="text-xl md:text-3xl font-black uppercase text-slate-950">Bio-Синхронизация</DialogTitle>
            <p className="text-slate-950/60 font-black uppercase text-[10px] tracking-widest">{format(selectedDate, 'd MMMM', { locale: ru })}</p>
          </div>
          <Zap className="absolute -right-6 -bottom-6 h-24 w-24 text-slate-950/10 rotate-12" />
        </DialogHeader>
        
        <div className="p-6 md:p-10 space-y-6 overflow-y-auto no-scrollbar bg-blue-950/40">
          {!mealResult && !labResult && !isSuccess ? (
            <Tabs defaultValue="meal" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className={cn("grid w-full rounded-2xl h-14 bg-white/5 mb-8", isFemale ? "grid-cols-5" : "grid-cols-4")}>
                <TabsTrigger value="meal" className="font-black text-[9px] uppercase"><Utensils className="h-3 w-3 mr-1" /> ЕДА</TabsTrigger>
                <TabsTrigger value="metrics" className="font-black text-[9px] uppercase"><Scale className="h-3 w-3 mr-1" /> ТЕЛО</TabsTrigger>
                {isFemale && <TabsTrigger value="cycle" className="font-black text-[9px] uppercase"><HeartPulse className="h-3 w-3 mr-1" /> ЦИКЛ</TabsTrigger>}
                <TabsTrigger value="labs" className="font-black text-[9px] uppercase"><FlaskConical className="h-3 w-3 mr-1" /> ЛАБ</TabsTrigger>
              </TabsList>

              <TabsContent value="meal" className="space-y-6">
                <div className="relative">
                  <Textarea placeholder="Что вы съели?" value={description} onChange={e => setDescription(e.target.value)} className="min-h-[150px] rounded-3xl bg-white/5 border-white/10 p-6 text-xl font-bold text-white shadow-inner" />
                  <Button type="button" variant="ghost" size="icon" onClick={() => startVoiceInput('description', setDescription)} className={cn("absolute right-4 top-4 h-10 w-10", recordingField === 'description' && "bg-red-500 animate-pulse")}><Mic className="h-5 w-5" /></Button>
                </div>
                <Button className="w-full h-16 rounded-2xl bg-primary text-slate-950 font-black text-xl" onClick={handleAnalyze} disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : 'РАСПОЗНАТЬ ИИ'}</Button>
              </TabsContent>

              <TabsContent value="metrics" className="space-y-6">
                <div className="bg-primary/10 rounded-2xl p-6 border border-primary/20 flex items-center justify-between"><span className="font-black text-sm uppercase">Smart Sync</span><Button variant="ghost" size="sm" onClick={handleSmartSync} disabled={syncing} className="bg-primary text-slate-950 font-black">ОБНОВИТЬ</Button></div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="relative"><Input placeholder="Вес" value={weight} onChange={e => setWeight(e.target.value)} className={inputClasses} /><Button variant="ghost" size="icon" onClick={() => startVoiceInput('weight', setWeight)} className="absolute right-2 top-1/2 -translate-y-1/2"><Mic className="h-4 w-4" /></Button></div>
                   <div className="relative"><Input placeholder="Вода" value={water} onChange={e => setWater(e.target.value)} className={inputClasses} /><Button variant="ghost" size="icon" onClick={() => startVoiceInput('water', setWater)} className="absolute right-2 top-1/2 -translate-y-1/2"><Mic className="h-4 w-4" /></Button></div>
                </div>
                <Button className="w-full h-16 rounded-2xl bg-primary text-slate-950 font-black" onClick={handleDailyLogSubmit}>СОХРАНИТЬ МЕТРИКИ</Button>
              </TabsContent>

              {isFemale && (
                <TabsContent value="cycle" className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                   <div className="bg-pink-500/10 border border-pink-500/30 rounded-3xl p-8 space-y-6">
                      <div className="flex items-center justify-between">
                         <h4 className="text-xl font-black uppercase text-pink-400">Менструация</h4>
                         <Button onClick={() => setIsCycleActive(!isCycleActive)} variant={isCycleActive ? "default" : "outline"} className={cn("rounded-xl", isCycleActive ? "bg-pink-500" : "border-pink-500/30")}>{isCycleActive ? 'День цикла' : 'Отметить начало'}</Button>
                      </div>
                      {isCycleActive && (
                        <div className="space-y-6 pt-4 border-t border-pink-500/10">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-pink-400/60">Интенсивность</label>
                              <Select value={cycleIntensity} onValueChange={setCycleIntensity}>
                                 <SelectTrigger className="h-14 rounded-xl bg-white/5 border-pink-500/20 text-white"><SelectValue /></SelectTrigger>
                                 <SelectContent><SelectItem value="low">Легкая</SelectItem><SelectItem value="medium">Средняя</SelectItem><SelectItem value="high">Сильная</SelectItem></SelectContent>
                              </Select>
                           </div>
                           <div className="relative">
                              <Input placeholder="Симптомы..." value={cycleSymptoms} onChange={e => setCycleSymptoms(e.target.value)} className="h-14 rounded-xl bg-white/5 border-pink-500/20 text-white pr-14" />
                              <Button type="button" variant="ghost" size="icon" onClick={() => startVoiceInput('cycleSymptoms', setCycleSymptoms)} className="absolute right-2 top-1/2 -translate-y-1/2"><Mic className="h-4 w-4 text-pink-400" /></Button>
                           </div>
                        </div>
                      )}
                   </div>
                   <Button className="w-full h-16 rounded-2xl bg-primary text-slate-950 font-black" onClick={handleDailyLogSubmit}>СОХРАНИТЬ ДАННЫЕ ЦИКЛА</Button>
                </TabsContent>
              )}

              <TabsContent value="labs" className="space-y-6">
                <label className="cursor-pointer"><div className="h-32 rounded-3xl border-dashed border-2 border-white/10 flex flex-col items-center justify-center bg-white/5 text-white"><Upload className="h-8 w-8 text-primary mb-2" /><span className="text-xs font-black">ЗАГРУЗИТЬ АНАЛИЗ</span></div><input type="file" className="hidden" onChange={e => { const r = new FileReader(); r.onloadend = () => setImage(r.result as string); r.readAsDataURL(e.target.files![0]); }} /></label>
                {image && <img src={image} className="rounded-2xl aspect-video object-cover" alt="Lab result" />}
                <Button className="w-full h-16 rounded-2xl bg-primary text-slate-950 font-black" onClick={handleAnalyze} disabled={!image || loading}>АНАЛИЗИРОВАТЬ ЛАБ</Button>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="py-12 flex flex-col items-center text-center space-y-6">
              <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(0,255,255,0.4)]"><CheckCircle2 className="h-12 w-12 text-slate-950" /></div>
              <h3 className="text-3xl font-black text-white uppercase">Синхронизировано</h3>
              <Button className="w-56 h-14 rounded-2xl font-black bg-primary text-slate-950" onClick={reset}>ОТЛИЧНО</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
