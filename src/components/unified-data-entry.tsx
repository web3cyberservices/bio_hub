'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Camera, Upload, Sparkles, X, Loader2, Activity, FlaskConical, 
  CheckCircle2, Zap, HeartPulse, Smartphone, Mic, Utensils, Scale, Smile,
  Battery, Brain, Heart, Frown, Thermometer, Ghost, Moon, Sun, 
  Wind, TrendingUp, ChevronDown
} from 'lucide-react';
import { analyzeMeal, AnalyzeMealOutput } from '@/ai/flows/analyze-meal';
import { analyzeLabResults, AnalyzeLabOutput } from '@/ai/flows/analyze-lab-results';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
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

  // Состояние цикла (Flo-style)
  const [isCycleActive, setIsCycleActive] = useState(false);
  const [isCycleStart, setIsCycleStart] = useState(false);
  const [isCycleEnd, setIsCycleEnd] = useState(false);
  const [cycleIntensity, setCycleIntensity] = useState('medium');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [energyStatus, setEnergyStatus] = useState('normal'); 
  const [cycleSymptomsText, setCycleSymptomsText] = useState('');

  const userDocRef = useMemoFirebase(() => user?.uid ? doc(firestore!, 'users', user.uid) : null, [user?.uid, firestore]);
  const { data: userData } = useDoc<any>(userDocRef);
  const isFemale = String(userData?.gender || '').toLowerCase().trim() === 'женский' || String(userData?.gender || '').toLowerCase().trim() === 'female';

  const { toast } = useToast();

  const startVoiceInput = (fieldName: string, setter: (val: string) => void) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Голосовой ввод не поддерживается.' });
      return;
    }
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
      toast({ variant: 'destructive', title: 'Нужна авторизация Google', description: 'Войдите заново через Google.' });
      return;
    }
    setSyncing(true);
    try {
      const fitData = await syncGoogleFitData(token);
      setSteps(fitData.steps.toString());
      setSleep(fitData.sleepHours.toString());
      toast({ title: 'Синхронизация завершена', description: 'Данные Google Fit подтянуты.' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Ошибка синхронизации' });
    } finally {
      setSyncing(false);
    }
  };

  const handleAnalyze = async () => {
    if (!firestore || !user?.uid) return;
    setLoading(true);
    try {
      if (activeTab === 'meal') {
        const result = await analyzeMeal({ description, photoDataUri: image || undefined });
        setMealResult(result);
      } else if (activeTab === 'labs') {
        if (!image) throw new Error('Загрузите фото анализа');
        const result = await analyzeLabResults({ 
          photoDataUri: image, 
          userContext: { age: userData?.age, gender: userData?.gender } 
        });
        setLabResult(result);
      }
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Ошибка ИИ', description: e.message });
    } finally {
      setLoading(false);
    }
  };

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleDailyLogSubmit = async () => {
    if (!firestore || !user?.uid) return;
    setLoading(true);
    try {
      const dateKey = format(selectedDate, 'yyyy-MM-dd');
      
      const logData: any = {
        date: dateKey,
        updatedAt: serverTimestamp()
      };

      if (water) logData.water = Number(water);
      if (weight) logData.weight = Number(weight);
      if (steps) logData.steps = Number(steps);
      if (sleep) logData.sleepDurationHours = Number(sleep);
      if (mood) logData.mood = mood;
      if (energy && energy.length > 0) logData.energy = energy[0];

      if (isCycleActive) {
        logData.cycle = {
          intensity: cycleIntensity,
          symptoms: selectedSymptoms,
          energyStatus: energyStatus,
          isStart: Boolean(isCycleStart),
          isEnd: Boolean(isCycleEnd),
          notes: cycleSymptomsText
        };
      }

      await setDoc(doc(firestore, 'users', user.uid, 'dailyLogs', dateKey), logData, { merge: true });
      
      setIsSuccess(true);
      toast({ title: 'Данные сохранены', description: 'Био-лог обновлен.' });
    } catch (e: any) {
      console.error("Save Daily Log Error:", e);
      toast({ variant: 'destructive', title: 'Ошибка сохранения', description: e.message });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setDescription(''); setImage(null); setMealResult(null); setLabResult(null);
    setIsSuccess(false); setWater(''); setWeight(''); setSteps(''); setSleep(''); 
    setMood('Спокойствие'); setEnergy([50]); setIsCycleActive(false); setCycleSymptomsText('');
    setSelectedSymptoms([]); setEnergyStatus('normal'); setIsCycleStart(false); setIsCycleEnd(false);
  };

  const physicalSymptoms = [
    { id: 'cramps', label: 'Тянущая боль', icon: Zap },
    { id: 'back_pain', label: 'Поясница', icon: Wind },
    { id: 'breasts', label: 'Грудь', icon: HeartPulse },
    { id: 'headache', label: 'Голова', icon: Brain },
    { id: 'acne', label: 'Акне', icon: Sparkles },
    { id: 'bloating', label: 'Вздутие', icon: Activity },
  ];

  const energyStates = [
    { id: 'energetic', label: 'Бодрое', icon: Sun, color: 'text-yellow-400' },
    { id: 'normal', label: 'Нормальное', icon: Smile, color: 'text-emerald-400' },
    { id: 'light_fatigue', label: 'Лёгкая усталость', icon: Battery, color: 'text-orange-400' },
    { id: 'fatigue', label: 'Усталость', icon: Moon, color: 'text-blue-400' },
  ];

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
                <TabsList className={cn(
                  "grid w-full rounded-2xl md:rounded-3xl h-16 bg-white/5 border border-white/5 p-1 mb-8",
                  isFemale ? "grid-cols-5" : "grid-cols-4"
                )}>
                  <TabsTrigger value="meal" className="font-black text-[7px] md:text-[10px] uppercase tracking-tighter gap-1 md:gap-2 data-[state=active]:bg-primary data-[state=active]:text-slate-950">
                    <Utensils className="h-3 w-3 md:h-3.5 md:w-3.5" /> <span className="hidden sm:inline">ЕДА</span>
                  </TabsTrigger>
                  <TabsTrigger value="metrics" className="font-black text-[7px] md:text-[10px] uppercase tracking-tighter gap-1 md:gap-2 data-[state=active]:bg-primary data-[state=active]:text-slate-950">
                    <Scale className="h-3 w-3 md:h-3.5 md:w-3.5" /> <span className="hidden sm:inline">ТЕЛО</span>
                  </TabsTrigger>
                  {isFemale && (
                    <TabsTrigger value="cycle" className="font-black text-[7px] md:text-[10px] uppercase tracking-tighter gap-1 md:gap-2 data-[state=active]:bg-pink-500 data-[state=active]:text-white">
                      <HeartPulse className="h-3 w-3 md:h-3.5 md:w-3.5" /> <span className="hidden sm:inline">ЦИКЛ</span>
                    </TabsTrigger>
                  )}
                  <TabsTrigger value="spirit" className="font-black text-[7px] md:text-[10px] uppercase tracking-tighter gap-1 md:gap-2 data-[state=active]:bg-primary data-[state=active]:text-slate-950">
                    <Smile className="h-3 w-3 md:h-3.5 md:w-3.5" /> <span className="hidden sm:inline">ДУХ</span>
                  </TabsTrigger>
                  <TabsTrigger value="labs" className="font-black text-[7px] md:text-[10px] uppercase tracking-tighter gap-1 md:gap-2 data-[state=active]:bg-primary data-[state=active]:text-slate-950">
                    <FlaskConical className="h-3 w-3 md:h-3.5 md:w-3.5" /> <span className="hidden sm:inline">ЛАБ</span>
                  </TabsTrigger>
                </TabsList>

                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <TabsContent value="meal" className="space-y-6 outline-none">
                    <div className="relative group">
                      <Textarea 
                        placeholder="Опишите ваш прием пищи или добавьте фото..." 
                        value={description} 
                        onChange={e => setDescription(e.target.value)} 
                        className="min-h-[180px] rounded-[2rem] bg-white/5 border border-white/10 p-8 text-xl font-bold text-white shadow-inner resize-none placeholder:text-white/20" 
                      />
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => startVoiceInput('description', setDescription)} 
                        className={cn(
                          "absolute right-6 top-6 h-12 w-12 rounded-full transition-all", 
                          recordingField === 'description' ? "bg-red-500 text-white animate-pulse" : "bg-white/10 text-primary hover:bg-white/20"
                        )}
                      >
                        <Mic className="h-6 w-6" />
                      </Button>
                    </div>
                    <Button 
                      className="w-full h-20 rounded-3xl bg-primary text-slate-950 font-black text-xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all" 
                      onClick={handleAnalyze} 
                      disabled={loading || (!description && !image)}
                    >
                      {loading ? <Loader2 className="animate-spin h-6 w-6" /> : <><Sparkles className="h-6 w-6 mr-3" /> РАСПОЗНАТЬ ИИ</>}
                    </Button>
                  </TabsContent>

                  <TabsContent value="metrics" className="space-y-8 outline-none">
                    <div className="bg-primary/10 rounded-[1.5rem] p-6 border border-primary/20 flex items-center justify-between">
                      <div>
                        <p className="font-black text-xs uppercase text-primary">Smart Health Sync</p>
                        <p className="text-[10px] text-primary/60 font-medium">Облачная синхронизация с Google Fit</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={handleSmartSync} disabled={syncing} className="bg-primary text-slate-950 font-black h-10 px-6 rounded-xl hover:bg-primary/80">
                        {syncing ? <Loader2 className="animate-spin h-4 w-4" /> : 'ОБНОВИТЬ'}
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 md:gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-white/30 px-2">Текущий вес (кг)</label>
                          <Input placeholder="0.0" value={weight} onChange={e => setWeight(e.target.value)} className="h-16 rounded-2xl bg-white/5 border-white/10 font-black text-2xl text-center text-white" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-white/30 px-2">Вода (мл)</label>
                          <Input placeholder="0" value={water} onChange={e => setWater(e.target.value)} className="h-16 rounded-2xl bg-white/5 border-white/10 font-black text-2xl text-center text-white" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-white/30 px-2">Шаги</label>
                          <Input placeholder="0" value={steps} onChange={e => setSteps(e.target.value)} className="h-16 rounded-2xl bg-white/5 border-white/10 font-black text-2xl text-center text-white" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-white/30 px-2">Сон (часов)</label>
                          <Input placeholder="0" value={sleep} onChange={e => setSleep(e.target.value)} className="h-16 rounded-2xl bg-white/5 border-white/10 font-black text-2xl text-center text-white" />
                       </div>
                    </div>
                    <Button className="w-full h-20 rounded-3xl bg-primary text-slate-950 font-black text-xl shadow-xl" onClick={handleDailyLogSubmit} disabled={loading}>СОХРАНИТЬ МЕТРИКИ</Button>
                  </TabsContent>

                  <TabsContent value="spirit" className="space-y-10 outline-none">
                     <div className="space-y-6">
                        <h4 className="text-sm font-black uppercase text-primary tracking-widest text-center">Самочувствие и Энергия</h4>
                        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 space-y-10 shadow-inner">
                           <div className="space-y-4">
                              <div className="flex justify-between items-center px-2">
                                 <label className="text-[10px] font-black uppercase text-white/40 tracking-widest flex items-center gap-2"><Zap className="h-3 w-3" /> Уровень энергии</label>
                                 <span className="text-2xl font-black text-primary">{energy[0]}%</span>
                              </div>
                              <Slider value={energy} onValueChange={setEnergy} max={100} step={1} className="py-4" />
                           </div>

                           <div className="space-y-4">
                              <label className="text-[10px] font-black uppercase text-white/40 tracking-widest px-2 flex items-center gap-2"><Brain className="h-3 w-3" /> Настроение</label>
                              <Select value={mood} onValueChange={setMood}>
                                 <SelectTrigger className="h-16 rounded-2xl bg-black/40 border-white/10 text-xl font-bold text-white px-6">
                                    <SelectValue />
                                 </SelectTrigger>
                                 <SelectContent className="bg-slate-900 border-white/10 text-white rounded-xl">
                                    <SelectItem value="Счастлив">🚀 Счастлив / Подъем</SelectItem>
                                    <SelectItem value="Спокойствие">🧘 Спокоен / Ровно</SelectItem>
                                    <SelectItem value="Усталость">🔋 Устал / Низкий заряд</SelectItem>
                                    <SelectItem value="Стресс">⚡ Стресс / Напряжение</SelectItem>
                                    <SelectItem value="Раздражение">💢 Раздражен</SelectItem>
                                 </SelectContent>
                              </Select>
                           </div>
                        </div>
                     </div>
                     <Button className="w-full h-20 rounded-3xl bg-primary text-slate-950 font-black text-xl shadow-xl" onClick={handleDailyLogSubmit} disabled={loading}>СОХРАНИТЬ СОСТОЯНИЕ</Button>
                  </TabsContent>

                  {isFemale && (
                    <TabsContent value="cycle" className="space-y-8 outline-none animate-in slide-in-from-right-4 duration-300">
                       <div className="bg-pink-500/5 border border-pink-500/20 rounded-[2.5rem] p-6 md:p-10 space-y-10 shadow-inner">
                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center border border-pink-500/20">
                                   <HeartPulse className="h-6 w-6 text-pink-400" />
                                </div>
                                <h4 className="text-xl font-black uppercase text-pink-400 tracking-tight">Цикл</h4>
                             </div>
                             <Button 
                               onClick={() => setIsCycleActive(!isCycleActive)} 
                               variant={isCycleActive ? "default" : "outline"} 
                               className={cn(
                                 "rounded-2xl h-12 px-6 font-black uppercase text-[10px] transition-all", 
                                 isCycleActive ? "bg-pink-500 text-white shadow-lg shadow-pink-500/20 border-none" : "border-pink-500/30 text-pink-400 hover:bg-pink-500/10"
                               )}
                             >
                               {isCycleActive ? 'День периода' : 'Отметить день'}
                             </Button>
                          </div>
                          
                          {isCycleActive && (
                            <div className="space-y-12 pt-8 border-t border-pink-500/10 animate-in fade-in duration-500 pb-10">
                               
                               <div className="space-y-4">
                                  <label className="text-[10px] font-black uppercase text-pink-400/60 px-2 tracking-widest text-center block">Границы периода</label>
                                  <div className="grid grid-cols-2 gap-4">
                                     <button 
                                       type="button"
                                       onClick={() => setIsCycleStart(!isCycleStart)}
                                       className={cn(
                                         "h-14 rounded-2xl font-black uppercase text-[10px] transition-all border-2 flex items-center justify-center gap-2",
                                         isCycleStart ? "bg-pink-600 border-pink-500 text-white shadow-xl" : "bg-white/5 border-white/5 text-white/30 hover:bg-white/10"
                                       )}
                                     >
                                        <TrendingUp className="h-4 w-4" /> {isCycleStart ? 'Начало отмечено' : 'Начало цикла'}
                                     </button>
                                     <button 
                                       type="button"
                                       onClick={() => setIsCycleEnd(!isCycleEnd)}
                                       className={cn(
                                         "h-14 rounded-2xl font-black uppercase text-[10px] transition-all border-2 flex items-center justify-center gap-2",
                                         isCycleEnd ? "bg-pink-600 border-pink-500 text-white shadow-xl" : "bg-white/5 border-white/5 text-white/30 hover:bg-white/10"
                                       )}
                                     >
                                        <CheckCircle2 className="h-4 w-4" /> {isCycleEnd ? 'Конец отмечен' : 'Конец цикла'}
                                     </button>
                                  </div>
                               </div>

                               <div className="space-y-4">
                                  <label className="text-[10px] font-black uppercase text-pink-400/60 px-2 tracking-widest text-center block">Ваше состояние</label>
                                  <div className="grid grid-cols-2 gap-3">
                                     {energyStates.map((s) => (
                                        <button 
                                          key={s.id} 
                                          type="button"
                                          onClick={() => setEnergyStatus(s.id)}
                                          className={cn(
                                            "flex items-center gap-3 p-4 rounded-2xl border-2 transition-all group",
                                            energyStatus === s.id
                                              ? "bg-pink-500/20 border-pink-500 text-pink-400"
                                              : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"
                                          )}
                                        >
                                           <s.icon className={cn("h-5 w-5", energyStatus === s.id ? s.color : "text-white/20")} />
                                           <span className="text-[9px] font-black uppercase leading-tight">{s.label}</span>
                                        </button>
                                     ))}
                                  </div>
                               </div>

                               <div className="space-y-4">
                                  <label className="text-[10px] font-black uppercase text-pink-400/60 px-2 tracking-widest text-center block">Интенсивность выделений</label>
                                  <div className="grid grid-cols-3 gap-3">
                                     {['low', 'medium', 'high'].map((val) => (
                                        <button 
                                          key={val} 
                                          type="button"
                                          onClick={() => setCycleIntensity(val)}
                                          className={cn(
                                            "h-14 rounded-xl font-black uppercase text-[9px] transition-all border-2",
                                            cycleIntensity === val 
                                              ? "bg-pink-500 border-pink-500 text-white shadow-lg" 
                                              : "bg-white/5 border-white/5 text-white/20 hover:bg-white/10"
                                          )}
                                        >
                                           {val === 'low' ? 'Легкая' : val === 'medium' ? 'Средняя' : 'Сильная'}
                                        </button>
                                     ))}
                                  </div>
                               </div>

                               <div className="space-y-4">
                                  <label className="text-[10px] font-black uppercase text-pink-400/60 px-2 tracking-widest text-center block">Физические симптомы</label>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                     {physicalSymptoms.map((s) => (
                                        <button 
                                          key={s.id} 
                                          type="button"
                                          onClick={() => toggleSymptom(s.id)}
                                          className={cn(
                                            "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all group",
                                            selectedSymptoms.includes(s.id)
                                              ? "bg-pink-500/20 border-pink-500 text-pink-400"
                                              : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"
                                          )}
                                        >
                                           <s.icon className={cn("h-6 w-6", selectedSymptoms.includes(s.id) ? "text-pink-400" : "text-white/20 group-hover:text-white/40")} />
                                           <span className="text-[8px] font-black uppercase leading-tight text-center">{s.label}</span>
                                        </button>
                                     ))}
                                  </div>
                               </div>

                               <div className="relative">
                                  <Textarea 
                                    placeholder="Дополнительные заметки..." 
                                    value={cycleSymptomsText} 
                                    onChange={e => setCycleSymptomsText(e.target.value)} 
                                    className="min-h-[120px] rounded-2xl bg-white/5 border-pink-500/20 text-white p-6 font-bold text-lg resize-none shadow-inner placeholder:text-white/10" 
                                  />
                                  <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => startVoiceInput('cycleSymptomsText', setCycleSymptomsText)} 
                                    className={cn(
                                      "absolute right-4 top-4 h-10 w-10 rounded-full",
                                      recordingField === 'cycleSymptomsText' ? "bg-red-500 text-white animate-pulse" : "bg-pink-500/10 text-pink-400 hover:bg-pink-500/20"
                                    )}
                                  >
                                    <Mic className="h-4 w-4" />
                                  </Button>
                               </div>
                            </div>
                          )}
                       </div>
                       <Button className="w-full h-20 rounded-3xl bg-pink-500 text-white font-black text-xl shadow-xl shadow-pink-500/20" onClick={handleDailyLogSubmit} disabled={loading}>
                          СОХРАНИТЬ ДАННЫЕ ЦИКЛА
                       </Button>
                    </TabsContent>
                  )}

                  <TabsContent value="labs" className="space-y-6 outline-none">
                    <div className="space-y-6">
                      <label className="cursor-pointer group">
                        <div className="h-48 rounded-[2.5rem] border-dashed border-2 border-white/10 flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 hover:border-primary/40 transition-all text-white group-hover:scale-[1.01]">
                          <Upload className="h-12 w-12 text-primary mb-3 group-hover:scale-110 transition-transform" />
                          <span className="text-sm font-black uppercase tracking-widest text-white/60">ЗАГРУЗИТЬ СКАН/ФОТО АНАЛИЗА</span>
                          <p className="text-[10px] text-white/20 mt-2 font-medium">JPG, PNG, PDF до 10 МБ</p>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={e => { const r = new FileReader(); r.onloadend = () => setImage(r.result as string); r.readAsDataURL(e.target.files![0]); }} />
                      </label>
                      {image && (
                        <div className="relative rounded-3xl overflow-hidden aspect-video border-4 border-white/5 shadow-2xl">
                           <img src={image} className="w-full h-full object-cover" alt="Lab result" />
                           <Button variant="destructive" size="icon" className="absolute top-4 right-4 rounded-full h-10 w-10" onClick={() => setImage(null)}><X className="h-5 w-5" /></Button>
                        </div>
                      )}
                    </div>
                    <Button 
                      className="w-full h-20 rounded-3xl bg-primary text-slate-950 font-black text-xl shadow-xl" 
                      onClick={handleAnalyze} 
                      disabled={!image || loading}
                    >
                      {loading ? <Loader2 className="animate-spin h-6 w-6" /> : <><Activity className="h-6 w-6 mr-3" /> АНАЛИЗИРОВАТЬ ЛАБ</>}
                    </Button>
                  </TabsContent>
                </div>
              </Tabs>
            ) : (
              <div className="py-20 flex flex-col items-center text-center space-y-8 animate-in zoom-in duration-500">
                <div className="w-28 h-28 bg-primary rounded-[2rem] flex items-center justify-center shadow-[0_0_60px_rgba(0,255,255,0.5)] rotate-3">
                  <CheckCircle2 className="h-14 w-14 text-slate-950" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-4xl font-black text-white uppercase tracking-tighter">Синхронизировано</h3>
                  <p className="text-white/40 font-black uppercase text-[10px] tracking-[0.4em]">Protocol Success: 100%</p>
                </div>
                <Button className="w-64 h-16 rounded-2xl font-black bg-primary text-slate-950 text-lg shadow-xl shadow-primary/10 hover:scale-105 transition-all" onClick={reset}>ОТЛИЧНО</Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}