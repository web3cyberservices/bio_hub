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
  Footprints, Moon, RefreshCw, 
  Droplet, Scale, Utensils, Smile, Save, MessageSquare,
  AlertCircle, TrendingUp, TrendingDown, Smartphone, Mic, Download,
  Brain, HeartPulse
} from 'lucide-react';
import { analyzeMeal, AnalyzeMealOutput } from '@/ai/flows/analyze-meal';
import { analyzeLabResults, AnalyzeLabOutput } from '@/ai/flows/analyze-lab-results';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { syncGoogleFitData } from '@/app/actions/sync-google-fit';
import { downloadLabResultsDocx } from '@/lib/docx-generator';
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
  const [refinement, setRefinement] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [mealResult, setMealResult] = useState<AnalyzeMealOutput | null>(null);
  const [labResult, setLabResult] = useState<AnalyzeLabOutput | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [recordingField, setRecordingField] = useState<string | null>(null);
  
  const [editedMeal, setEditedMeal] = useState<AnalyzeMealOutput | null>(null);

  const [water, setWater] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [steps, setSteps] = useState<string>('');
  const [heartRate, setHeartRate] = useState<string>('');
  const [sleep, setSleep] = useState<string>('');
  const [mood, setMood] = useState<string>('');
  const [energy, setEnergy] = useState<number>(50);

  const [actName, setActName] = useState('');
  const [actDur, setActDur] = useState('');

  // Состояние для цикла (только для женщин)
  const [isCycleActive, setIsCycleActive] = useState(false);
  const [cycleIntensity, setCycleIntensity] = useState('medium');
  const [cycleSymptoms, setCycleSymptoms] = useState('');

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore || user.uid === 'public-user') return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userData } = useDoc<any>(userDocRef);
  const isFemale = String(userData?.gender || '').toLowerCase() === 'женский';

  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const startVoiceInput = (fieldName: string, setter: (val: string) => void) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Браузер не поддерживает голосовой ввод.' });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ru-RU';
    recognition.onstart = () => setRecordingField(fieldName);
    recognition.onend = () => setRecordingField(null);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setter(transcript);
      toast({ title: 'Голос распознан' });
    };
    recognition.start();
  };

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

  const handleSmartSync = async () => {
    if (!user || user.uid === 'public-user') {
      toast({ variant: 'destructive', title: 'Режим гостя', description: 'Синхронизация Google Fit доступна только после входа.' });
      return;
    }

    const token = sessionStorage.getItem('google_fit_token');
    if (!token) {
      toast({ 
        variant: 'destructive', 
        title: 'Нужна авторизация', 
        description: 'Пожалуйста, перезайдите через Google, чтобы дать разрешение на чтение биометрии.' 
      });
      return;
    }

    setSyncing(true);
    try {
      const fitData = await syncGoogleFitData(token);
      
      setSteps(fitData.steps.toString());
      setHeartRate(fitData.heartRate.toString());
      setSleep(fitData.sleepHours.toString());
      
      toast({
        title: 'Google Fit синхронизирован',
        description: `Импортировано: ${fitData.steps} шагов.`,
      });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Ошибка Google Fit', description: error.message });
    } finally {
      setSyncing(false);
    }
  };

  const saveMealToFirestore = async (data: AnalyzeMealOutput) => {
    if (!firestore || !user) return;
    setLoading(true);
    try {
      const dateKey = format(selectedDate, 'yyyy-MM-dd');
      await addDoc(collection(firestore, 'users', user.uid, 'personalMeals'), {
        date: dateKey,
        name: data.mealName,
        time: 'Обед', 
        calories: Number(data.calories) || 0,
        protein: Number(data.protein) || 0,
        fat: Number(data.fat) || 0,
        carbs: Number(data.carbs) || 0,
        createdAt: new Date().toISOString(),
        isAiGenerated: true
      });
      setIsSuccess(true);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Ошибка сохранения' });
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (isRefinement = false) => {
    if (!firestore || !user) return;
    setLoading(true);
    try {
      if (activeTab === 'meal') {
        const result = await analyzeMeal({ description, photoDataUri: image || undefined, refinement: isRefinement ? refinement : undefined });
        setMealResult(result);
        setEditedMeal(result);
      } else if (activeTab === 'labs') {
        const result = await analyzeLabResults({ photoDataUri: image!, userContext: userData ? { age: userData.age, gender: userData.gender } : undefined });
        setLabResult(result);
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Ошибка анализа ИИ', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDailyLogSubmit = async () => {
    if (!firestore || !user) return;
    setLoading(true);
    try {
      const dateKey = format(selectedDate, 'yyyy-MM-dd');
      const docRef = doc(firestore, 'users', user.uid, 'dailyLogs', dateKey);
      await setDoc(docRef, {
        date: dateKey,
        water: water ? Number(water) : undefined,
        weight: weight ? Number(weight) : undefined,
        steps: steps ? Number(steps) : undefined,
        avgHeartRate: heartRate ? Number(heartRate) : undefined,
        sleepDurationHours: sleep ? Number(sleep) : undefined,
        mood: mood || undefined,
        energy: energy,
        // Сохранение данных цикла
        cycle: isCycleActive ? { intensity: cycleIntensity, symptoms: cycleSymptoms } : null,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      setIsSuccess(true);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Ошибка' });
    } finally {
      setLoading(false);
    }
  };

  const handleActivitySubmit = async () => {
    if (!firestore || !user || !actName || !actDur) return;
    setLoading(true);
    try {
      const dateKey = format(selectedDate, 'yyyy-MM-dd');
      await addDoc(collection(firestore, 'users', user.uid, 'activities'), {
        date: dateKey,
        name: actName,
        duration: Number(actDur),
        calories: Math.round(Number(actDur) * 5),
        type: 'physical',
        createdAt: new Date().toISOString()
      });
      setIsSuccess(true);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Ошибка' });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setDescription(''); setRefinement(''); setImage(null); setMealResult(null); setEditedMeal(null); setLabResult(null);
    setIsSuccess(false); setWater(''); setWeight(''); setSteps(''); setHeartRate(''); setSleep(''); setMood(''); setEnergy(50);
    setActName(''); setActDur(''); setIsCycleActive(false); setCycleSymptoms('');
    stopCamera();
  };

  const VoiceBtn = ({ field, setter }: { field: string, setter: (v: string) => void }) => (
    <Button 
      type="button" 
      variant="ghost" 
      size="icon" 
      onClick={() => startVoiceInput(field, setter)}
      className={cn(
        "absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full shadow-sm transition-all z-10",
        recordingField === field ? "bg-red-500 text-white animate-pulse" : "bg-white/10 text-primary hover:bg-white/20"
      )}
    >
      <Mic className="h-4 w-4" />
    </Button>
  );

  const inputClasses = "h-14 md:h-18 rounded-2xl md:rounded-[2rem] bg-slate-200/10 border border-white/10 shadow-inner font-black text-white text-xl md:text-2xl placeholder:text-white/20 focus:ring-4 focus:ring-primary/10 transition-all px-6 md:px-8 pr-14";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) reset(); }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-[95vw] md:max-w-[700px] rounded-[2rem] md:rounded-[3rem] p-0 overflow-hidden border border-blue-900/30 shadow-2xl max-h-[90vh] flex flex-col z-[1001] bg-[#010411]">
        <DialogHeader className="p-5 md:p-8 bg-primary text-white relative overflow-hidden shrink-0 border-b border-white/5">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-[#00ffff]/80 opacity-90" />
          <div className="relative z-10 space-y-0.5">
            <DialogTitle className="text-xl md:text-3xl font-black tracking-tighter leading-none uppercase text-slate-950">Bio-Синхронизация</DialogTitle>
            <p className="text-slate-950/60 font-black uppercase text-[10px] md:text-sm tracking-widest">Показатели на {format(selectedDate, 'd MMMM', { locale: ru })}</p>
          </div>
          <Zap className="absolute -right-6 -bottom-6 h-24 w-24 text-slate-950/10 rotate-12" />
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 md:space-y-10 no-scrollbar bg-blue-950/40 backdrop-blur-3xl">
          {!mealResult && !labResult && !isSuccess ? (
            <Tabs defaultValue="meal" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className={cn("grid w-full rounded-[1.5rem] h-14 md:h-16 bg-white/5 p-1.5 mb-6 md:mb-10 shadow-inner", isFemale ? "grid-cols-6" : "grid-cols-5")}>
                <TabsTrigger value="meal" className="rounded-[1rem] font-black gap-1 text-[8px] md:text-[9px] uppercase tracking-widest flex-1 h-full data-[state=active]:bg-primary data-[state=active]:text-slate-950"><Utensils className="h-3 w-3" /> ЕДА</TabsTrigger>
                <TabsTrigger value="act" className="rounded-[1rem] font-black gap-1 text-[8px] md:text-[9px] uppercase tracking-widest flex-1 h-full data-[state=active]:bg-primary data-[state=active]:text-slate-950"><Zap className="h-3 w-3" /> АКТ</TabsTrigger>
                <TabsTrigger value="metrics" className="rounded-[1rem] font-black gap-1 text-[8px] md:text-[9px] uppercase tracking-widest flex-1 h-full data-[state=active]:bg-primary data-[state=active]:text-slate-950"><Scale className="h-3 w-3" /> ТЕЛО</TabsTrigger>
                <TabsTrigger value="feeling" className="rounded-[1rem] font-black gap-1 text-[8px] md:text-[9px] uppercase tracking-widest flex-1 h-full data-[state=active]:bg-primary data-[state=active]:text-slate-950"><Smile className="h-3 w-3" /> ДУХ</TabsTrigger>
                {isFemale && <TabsTrigger value="cycle" className="rounded-[1rem] font-black gap-1 text-[8px] md:text-[9px] uppercase tracking-widest flex-1 h-full data-[state=active]:bg-primary data-[state=active]:text-slate-950"><HeartPulse className="h-3 w-3" /> ЦИКЛ</TabsTrigger>}
                <TabsTrigger value="labs" className="rounded-[1rem] font-black gap-1 text-[8px] md:text-[9px] uppercase tracking-widest flex-1 h-full data-[state=active]:bg-primary data-[state=active]:text-slate-950"><FlaskConical className="h-3 w-3" /> ЛАБ</TabsTrigger>
              </TabsList>

              <TabsContent value="meal" className="space-y-6 outline-none">
                <div className="relative">
                  <Textarea 
                    placeholder="Что вы съели?" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    className="min-h-[120px] md:min-h-[180px] rounded-[1.5rem] md:rounded-[2rem] bg-slate-200/10 backdrop-blur-md border border-white/10 p-6 md:p-8 text-lg md:text-xl font-bold resize-none shadow-inner pr-16 text-white placeholder:text-white/20" 
                  />
                  <div className="absolute right-4 top-4">
                    <Button type="button" variant="ghost" size="icon" onClick={() => startVoiceInput('description', setDescription)} className={cn("h-12 w-12 rounded-full shadow-lg transition-all", recordingField === 'description' ? "bg-red-500 text-white animate-pulse" : "bg-white/10 text-primary")}><Mic className="h-5 w-5" /></Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4"><Button variant="outline" className="h-20 rounded-[1.5rem] border-dashed border-2 border-white/10 flex flex-col gap-2 bg-white/5 text-white" onClick={startCamera}><Camera className="h-5 w-5 text-primary" /><span className="text-[9px] font-black uppercase">КАМЕРА</span></Button><label className="cursor-pointer"><div className="h-20 rounded-[1.5rem] border-dashed border-2 border-white/10 flex flex-col gap-2 items-center justify-center bg-white/5 text-white"><Upload className="h-5 w-5 text-primary" /><span className="text-[9px] font-black uppercase">ФАЙЛ</span></div><input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} /></label></div>
                <Button className="w-full h-14 rounded-[1.5rem] text-lg font-black bg-primary text-slate-950" onClick={() => handleAnalyze()} disabled={loading}>{loading ? <Loader2 className="animate-spin h-6 w-6" /> : <><Sparkles className="mr-3 h-5 w-5" /> РАСПОЗНАТЬ</>}</Button>
              </TabsContent>

              <TabsContent value="act" className="space-y-6 outline-none text-white">
                 <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2 relative"><label className="text-[10px] font-black uppercase text-white/30 px-4">Активность</label><Input placeholder="Напр: Прогулка..." value={actName} onChange={e => setActName(e.target.value)} className={inputClasses} /><VoiceBtn field="actName" setter={setActName} /></div>
                    <div className="space-y-2 relative"><label className="text-[10px] font-black uppercase text-white/30 px-4">Длительность (мин)</label><Input type="number" placeholder="45" value={actDur} onChange={e => setActDur(e.target.value)} className={inputClasses} /><VoiceBtn field="actDur" setter={setActDur} /></div>
                    <Button className="w-full h-14 rounded-[1.5rem] text-lg font-black bg-primary text-slate-950" onClick={handleActivitySubmit} disabled={loading || !actName || !actDur}>ЗАПИСАТЬ</Button>
                 </div>
              </TabsContent>

              <TabsContent value="metrics" className="space-y-6 outline-none text-white">
                <div className="bg-primary/10 rounded-2xl p-6 border border-primary/20 flex items-center justify-between"><div className="flex items-center gap-2"><Smartphone className="h-5 w-5 text-primary" /><span className="text-sm font-black uppercase">Google Fit</span></div><Button variant="ghost" size="sm" className="h-8 bg-primary text-slate-950 font-black text-[9px]" onClick={handleSmartSync} disabled={syncing}>{syncing ? <Loader2 className="h-3 w-3 animate-spin" /> : "СИНХРОНИЗИРОВАТЬ"}</Button></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="relative"><Input placeholder="Вес (кг)" value={weight} onChange={e => setWeight(e.target.value)} type="number" className={inputClasses} /><VoiceBtn field="weight" setter={setWeight} /></div>
                   <div className="relative"><Input placeholder="Вода (мл)" value={water} onChange={e => setWater(e.target.value)} type="number" className={inputClasses} /><VoiceBtn field="water" setter={setWater} /></div>
                   <div className="relative"><Input placeholder="Шаги" value={steps} onChange={e => setSteps(e.target.value)} type="number" className={inputClasses} /><VoiceBtn field="steps" setter={setSteps} /></div>
                   <div className="relative"><Input placeholder="Сон (ч)" value={sleep} onChange={e => setSleep(e.target.value)} type="number" className={inputClasses} /><VoiceBtn field="sleep" setter={setSleep} /></div>
                </div>
                <Button className="w-full h-14 rounded-[1.5rem] bg-primary text-slate-950 font-black" onClick={handleDailyLogSubmit}>ОБНОВИТЬ</Button>
              </TabsContent>

              <TabsContent value="feeling" className="space-y-8 outline-none text-white">
                 <div className="grid grid-cols-2 gap-3">{['Счастлив', 'Спокоен', 'Устал', 'Раздражен'].map(m => <Button key={m} onClick={() => setMood(m)} variant={mood === m ? "default" : "outline"} className={cn("h-14 rounded-[1.2rem] font-black text-xs", mood === m ? "bg-primary text-slate-950" : "bg-white/5 text-white")}>{m}</Button>)}</div>
                 <div className="space-y-3"><label className="text-[10px] font-black uppercase text-white/40 flex justify-between"><span>Энергия</span><span>{energy}%</span></label><input type="range" className="w-full h-2 bg-white/5 rounded-full appearance-none accent-primary" value={energy} onChange={(e) => setEnergy(Number(e.target.value))} /></div>
                 <Button className="w-full h-14 rounded-[1.5rem] bg-primary text-slate-950 font-black" onClick={handleDailyLogSubmit}>СОХРАНИТЬ</Button>
              </TabsContent>

              {isFemale && (
                <TabsContent value="cycle" className="space-y-8 outline-none text-white animate-in slide-in-from-right-4 duration-300">
                   <div className="bg-pink-500/10 border border-pink-500/30 rounded-[2rem] p-8 space-y-6">
                      <div className="flex items-center justify-between">
                         <h4 className="text-xl font-black uppercase text-pink-400 flex items-center gap-2"><HeartPulse className="h-6 w-6" /> Трекер цикла</h4>
                         <Button onClick={() => setIsCycleActive(!isCycleActive)} variant={isCycleActive ? "default" : "outline"} className={cn("rounded-xl h-10 px-4", isCycleActive ? "bg-pink-500 text-white" : "border-pink-500/30 text-pink-400")}>{isCycleActive ? 'День менструации' : 'Отметить начало'}</Button>
                      </div>
                      
                      {isCycleActive && (
                        <div className="space-y-6 pt-4 border-t border-pink-500/10">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-pink-400/60 px-2">Интенсивность</label>
                              <Select value={cycleIntensity} onValueChange={setCycleIntensity}>
                                 <SelectTrigger className="h-14 rounded-xl bg-white/5 border-pink-500/20 text-white"><SelectValue /></SelectTrigger>
                                 <SelectContent><SelectItem value="low">Легкая</SelectItem><SelectItem value="medium">Средняя</SelectItem><SelectItem value="high">Сильная</SelectItem></SelectContent>
                              </Select>
                           </div>
                           <div className="space-y-2 relative">
                              <label className="text-[10px] font-black uppercase text-pink-400/60 px-2">Симптомы</label>
                              <Input placeholder="Напр: тянущие боли, ПМС..." value={cycleSymptoms} onChange={e => setCycleSymptoms(e.target.value)} className="h-14 rounded-xl bg-white/5 border-pink-500/20 text-white pr-14" />
                              <VoiceBtn field="cycleSymptoms" setter={setCycleSymptoms} />
                           </div>
                        </div>
                      )}
                      {!isCycleActive && <p className="text-xs text-white/40 font-medium italic">Нажмите кнопку выше, если сегодня первый или очередной день цикла.</p>}
                   </div>
                   <Button className="w-full h-14 rounded-[1.5rem] bg-primary text-slate-950 font-black" onClick={handleDailyLogSubmit} disabled={loading}>СОХРАНИТЬ ДАННЫЕ ЦИКЛА</Button>
                </TabsContent>
              )}

              <TabsContent value="labs" className="space-y-6 outline-none text-white">
                <div className="grid grid-cols-2 gap-4"><Button variant="outline" className="h-16 rounded-xl bg-white/5 border-white/10 text-white" onClick={startCamera}><Camera className="h-5 w-5 text-primary" /> Камера</Button><label className="cursor-pointer"><div className="h-16 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center gap-2 text-white"><Upload className="h-5 w-5 text-primary" /> Файл</div><input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} /></label></div>
                {image && <div className="relative rounded-2xl overflow-hidden aspect-video border-4 border-white/10"><img src={image} alt="Lab" className="w-full h-full object-cover" /><Button variant="destructive" size="icon" className="absolute top-2 right-2 h-8 w-8 rounded-full" onClick={() => setImage(null)}><X className="h-4 w-4" /></Button></div>}
                <Button className="w-full h-16 rounded-xl bg-primary text-slate-950 font-black" onClick={() => handleAnalyze()} disabled={loading || !image}>АНАЛИЗИРОВАТЬ</Button>
              </TabsContent>
            </Tabs>
          ) : mealResult && editedMeal && !isSuccess ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="text-center space-y-2"><Badge className="bg-primary/10 text-primary border-none text-[10px] font-black uppercase px-4">AI BioScan Result</Badge><div className="relative"><Input value={editedMeal.mealName} onChange={e => setEditedMeal({...editedMeal, mealName: e.target.value})} className="text-2xl font-black text-center border-white/10 bg-slate-200/10 rounded-2xl h-auto pr-12 text-white py-4 shadow-inner" /><VoiceBtn field="editedMealName" setter={(val) => setEditedMeal({...editedMeal, mealName: val})} /></div></div>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[{ l: 'Ккал', f: 'calories' }, { l: 'Белки', f: 'protein' }, { l: 'Жиры', f: 'fat' }, { l: 'Углеводы', f: 'carbs' }].map((s, i) => <div key={i} className="space-y-2"><label className="text-[9px] font-black uppercase text-white/40 text-center block">{s.l}</label><Input type="number" value={(editedMeal as any)[s.f]} onChange={e => setEditedMeal({...editedMeal, [s.f]: Number(e.target.value)})} className="h-14 rounded-2xl border text-center font-black text-xl text-white bg-slate-200/10" /></div>)}</div>
               <Button className="w-full h-16 rounded-[1.2rem] font-black text-lg bg-primary text-slate-950 shadow-xl" onClick={() => saveMealToFirestore(editedMeal)}>ПОДТВЕРДИТЬ И ЗАПИСАТЬ</Button>
            </div>
          ) : labResult && !isSuccess ? (
            <div className="space-y-8 animate-in fade-in duration-500 pb-10 text-white">
              <h3 className="text-2xl font-black uppercase">Результаты анализа</h3>
              <div className="bg-primary/5 p-6 rounded-3xl border border-primary/20"><p className="text-sm font-medium leading-relaxed text-white/80">{labResult.summary}</p></div>
              <Button className="w-full h-16 rounded-xl bg-primary text-slate-950 font-black" onClick={saveLabResultToFirestore}>СОХРАНИТЬ В ПРОФИЛЬ</Button>
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center text-center space-y-6 animate-in zoom-in duration-500"><div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(0,255,255,0.4)]"><CheckCircle2 className="h-12 w-12 text-slate-950" /></div><div className="space-y-2"><h3 className="text-3xl font-black text-white uppercase">Готово!</h3><p className="text-white/40 font-black uppercase text-[10px]">Данные успешно синхронизированы.</p></div><Button className="w-56 h-14 rounded-[1.2rem] font-black bg-primary text-slate-950" onClick={reset}>ОТЛИЧНО</Button></div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
