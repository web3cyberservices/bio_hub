'use client';

import { useState } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Plus, Trash2, Loader2, Utensils, Flame, 
  Beef, Droplet, Zap, Save, Calendar, Mic, Sparkles,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { analyzeMeal } from '@/ai/flows/analyze-meal';
import { ProductsMenuGenerator } from './products-menu-generator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PersonalMealPlanProps {
  selectedDate: Date;
  patientId?: string; // ID пациента для работы специалиста
}

export function PersonalMealPlan({ selectedDate, patientId }: PersonalMealPlanProps) {
  const { user } = useUser();
  const { firestore } = useFirestore();
  const { toast } = useToast();
  
  const [isAddingOpen, setIsAddingOpen] = useState(false);
  const [isScanningOpen, setIsScanningOpen] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const [name, setName] = useState('');
  const [time, setTime] = useState('Завтрак');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [fat, setFat] = useState('');
  const [carbs, setCarbs] = useState('');

  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  const effectiveUid = patientId || user?.uid;

  const startVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Браузер не поддерживает голосовой ввод.' });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ru-RU';
    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setName(transcript);
      handleAiCalculate(transcript);
      toast({ title: 'Голос распознан' });
    };
    recognition.start();
  };

  const handleAiCalculate = async (targetName?: string) => {
    const nameToAnalyze = targetName || name;
    if (!nameToAnalyze.trim() || isCalculating) return;

    setIsCalculating(true);
    try {
      const result = await analyzeMeal({ description: nameToAnalyze });
      if (result) {
        setCalories(result.calories.toString());
        setProtein(result.protein.toString());
        setFat(result.fat.toString());
        setCarbs(result.carbs.toString());
        toast({ 
          title: 'ИИ рассчитал состав', 
          description: `Данные подобраны для: ${result.mealName}` 
        });
      }
    } catch (error) {
      console.error('AI calculation error:', error);
      toast({ variant: 'destructive', title: 'Ошибка ИИ', description: 'Не удалось рассчитать КБЖУ.' });
    } finally {
      setIsCalculating(false);
    }
  };

  const mealsQuery = useMemoFirebase(() => {
    if (!firestore || !effectiveUid) return null;
    return query(
      collection(firestore, 'users', effectiveUid, 'personalMeals'),
      where('date', '==', dateKey)
    );
  }, [firestore, effectiveUid, dateKey]);

  const { data: meals, isLoading: mealsLoading } = useCollection<any>(mealsQuery);

  const handleAddMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !name || !effectiveUid) {
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Введите название блюда.' });
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(firestore, 'users', effectiveUid, 'personalMeals'), {
        date: dateKey,
        name,
        time,
        calories: Number(calories) || 0,
        protein: Number(protein) || 0,
        fat: Number(fat) || 0,
        carbs: Number(carbs) || 0,
        assignedBy: patientId ? user?.uid : null, // Пометка, что назначено специалистом
        createdAt: new Date().toISOString()
      });

      toast({ title: patientId ? 'План обновлен' : 'Блюдо добавлено' });
      setName(''); setCalories(''); setProtein(''); setFat(''); setCarbs('');
      setIsAddingOpen(false);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Ошибка сохранения' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMeal = async (id: string) => {
    if (!firestore || !effectiveUid) return;
    try {
      await deleteDoc(doc(firestore, 'users', effectiveUid, 'personalMeals', id));
      toast({ title: 'Удалено' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Ошибка' });
    }
  };

  const totalCalories = meals?.reduce((acc, m) => acc + (m.calories || 0), 0) || 0;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 flex flex-col">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 px-4">
        <div className="space-y-0.5">
          <h3 className="text-3xl font-black tracking-tighter text-white uppercase leading-none">
            {patientId ? 'План питания пациента' : 'Свой план'}
          </h3>
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest opacity-60">{format(selectedDate, 'd MMMM', { locale: ru })}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md px-4 md:px-6 py-2.5 rounded-[2rem] border border-white/5 shadow-sm flex items-center gap-3 md:gap-4">
           <div className="text-center shrink-0">
              <p className="text-[7px] font-black uppercase text-white/40">Итого ккал</p>
              <p className="text-xl font-black text-primary leading-none">{totalCalories}</p>
           </div>
           <div className="w-px h-8 bg-white/10 shrink-0" />
           <div className="flex items-center gap-2">
              
              {!patientId && (
                <Dialog open={isScanningOpen} onOpenChange={setIsScanningOpen}>
                  <DialogTrigger asChild>
                    <button className="rounded-xl h-10 px-4 bg-primary/20 text-primary border border-primary/30 font-black uppercase text-[10px] flex items-center gap-2 hover:bg-primary/30 transition-all active:scale-95">
                      <Sparkles className="h-3.5 w-3.5 animate-pulse" /> Скан
                    </button>
                  </DialogTrigger>
                  <DialogContent className="w-[98vw] md:max-w-4xl rounded-[2.5rem] md:rounded-[3.5rem] p-0 overflow-hidden border-none shadow-2xl z-[1100] bg-[#010411]">
                    <DialogHeader className="p-8 md:p-10 bg-primary text-white shrink-0 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-[#00ffff]/80 opacity-95" />
                      <div className="relative z-10">
                        <DialogTitle className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-slate-950">Neuro-Scanner 4.0</DialogTitle>
                        <p className="text-slate-950/60 font-black uppercase text-[10px] tracking-widest mt-1">Определение КБЖУ по фото и описанию</p>
                      </div>
                      <Sparkles className="absolute -right-8 -bottom-8 h-32 w-32 text-slate-950/10 rotate-12" />
                    </DialogHeader>
                    <ScrollArea className="max-h-[75vh]">
                      <div className="p-4 md:p-8">
                        <ProductsMenuGenerator />
                      </div>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              )}

              <Dialog open={isAddingOpen} onOpenChange={setIsAddingOpen}>
                <DialogTrigger asChild>
                  <button className="rounded-xl h-10 px-4 bg-primary text-slate-950 font-black uppercase text-[10px] flex items-center gap-2 hover:shadow-[0_0_15px_rgba(0,255,255,0.4)] transition-all active:scale-95 shadow-lg shadow-primary/10">
                    <Plus className="h-4 w-4 stroke-[3px]" /> {patientId ? 'Назначить' : 'Добавить'}
                  </button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] md:max-w-[600px] rounded-[2.5rem] md:rounded-[3.5rem] p-0 overflow-hidden border-none shadow-2xl z-[1100] bg-[#010411]">
                  <DialogHeader className="p-8 md:p-10 bg-primary text-white shrink-0 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-[#00ffff]/80 opacity-95" />
                    <div className="relative z-10">
                      <DialogTitle className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-slate-950">
                        {patientId ? 'Назначение питания' : 'Новое блюдо'}
                      </DialogTitle>
                      <p className="text-slate-950/60 font-black uppercase text-[10px] tracking-widest mt-1">
                        {patientId ? 'Добавление в план пациента' : 'Ручной ввод с поддержкой ИИ'}
                      </p>
                    </div>
                    <Utensils className="absolute -right-8 -bottom-8 h-32 w-32 text-slate-950/10 rotate-12" />
                  </DialogHeader>
                  <div className="p-6 md:p-10 space-y-8 bg-blue-950/40 backdrop-blur-3xl">
                     <form onSubmit={handleAddMeal} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                           <div className="space-y-2 relative">
                              <label className="text-[10px] font-black uppercase tracking-widest text-white/50 px-2">Блюдо или продукт</label>
                              <div className="relative">
                               <Input 
                                 placeholder="Напр: Салат с авокадо и лососем" 
                                 value={name} 
                                 onChange={e => setName(e.target.value)} 
                                 className="h-16 rounded-2xl bg-white/5 border-white/10 font-bold pr-28 text-white placeholder:text-white/20 shadow-inner text-lg" 
                                 required 
                               />
                               <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                 <Button 
                                   type="button" 
                                   variant="ghost" 
                                   size="icon" 
                                   onClick={() => handleAiCalculate()}
                                   disabled={isCalculating || !name.trim()}
                                   className={cn(
                                     "h-12 w-12 rounded-full transition-all",
                                     isCalculating ? "bg-primary/20 text-primary animate-spin" : "text-primary hover:bg-white/10"
                                   )}
                                 >
                                   {isCalculating ? <Loader2 className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
                                 </Button>
                                 <button 
                                   type="button"
                                   onClick={startVoiceInput}
                                   className={cn(
                                     "h-12 w-12 rounded-full flex items-center justify-center transition-all",
                                     isRecording ? "bg-red-500 text-white animate-pulse" : "bg-white/10 text-primary hover:bg-white/20"
                                   )}
                                 >
                                   <Mic className="h-5 w-5" />
                                 </button>
                               </div>
                              </div>
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-white/50 px-2">Прием пищи</label>
                              <Select value={time} onValueChange={setTime}>
                                 <SelectTrigger className="h-16 rounded-2xl bg-white/5 border-white/10 font-bold text-white shadow-inner text-lg">
                                    <SelectValue />
                                 </SelectTrigger>
                                 <SelectContent className="rounded-xl bg-slate-950 border-white/10 text-white">
                                    <SelectItem value="Завтрак">🍳 Завтрак</SelectItem>
                                    <SelectItem value="Обед">🥗 Обед</SelectItem>
                                    <SelectItem value="Ужин">🥩 Ужин</SelectItem>
                                    <SelectItem value="Перекус">🍎 Перекус</SelectItem>
                                 </SelectContent>
                              </Select>
                           </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                           {[
                             { l: 'Ккал', v: calories, s: setCalories, i: Flame, c: 'text-orange-500' },
                             { l: 'Белки', v: protein, s: setProtein, i: Beef, c: 'text-red-400' },
                             { l: 'Жиры', v: fat, s: setFat, i: Droplet, c: 'text-yellow-500' },
                             { l: 'Углеводы', v: carbs, s: setCarbs, i: Zap, c: 'text-primary' }
                           ].map((m, i) => (
                              <div key={i} className="space-y-2">
                                 <label className="text-[8px] font-black uppercase tracking-widest text-white/40 px-2 flex items-center gap-1">
                                   <m.i className={cn("h-2.5 w-2.5", m.c)} /> {m.l}
                                 </label>
                                 <Input 
                                   type="number" 
                                   placeholder="0" 
                                   value={m.v} 
                                   onChange={e => m.s(e.target.value)} 
                                   className={cn(
                                     "h-14 rounded-2xl bg-white/5 border-white/10 font-black text-center text-white shadow-inner text-xl",
                                     isCalculating && "animate-pulse opacity-50"
                                   )} 
                                 />
                              </div>
                           ))}
                        </div>

                        <div className="flex gap-4 pt-4">
                           <Button type="button" variant="ghost" onClick={() => setIsAddingOpen(false)} className="flex-1 h-16 rounded-2xl font-bold text-white/40 hover:text-white transition-colors">Отмена</Button>
                           <Button type="submit" disabled={loading} className="flex-[2] h-16 rounded-2xl bg-primary font-black text-slate-950 shadow-[0_15px_40px_rgba(0,255,255,0.2)] hover:scale-[1.02] active:scale-95 transition-all text-xl">
                              {loading ? <Loader2 className="animate-spin h-6 w-6" /> : <><Save className="mr-2 h-6 w-6" /> {patientId ? 'НАЗНАЧИТЬ' : 'СОХРАНИТЬ'}</>}
                           </Button>
                        </div>
                     </form>
                  </div>
                </DialogContent>
              </Dialog>
           </div>
        </div>
      </div>

      <div className="space-y-4 px-4">
         {mealsLoading ? (
            <div className="py-24 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto opacity-20" />
            </div>
         ) : meals && meals.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
               {meals.map((meal) => (
                  <Card key={meal.id} className="cyber-card p-6 border-none flex items-center justify-between group bg-blue-950/40">
                     <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                           <Utensils className="h-6 w-6" />
                        </div>
                        <div>
                           <div className="flex items-center gap-2">
                              <h4 className="font-black text-lg text-white leading-tight uppercase tracking-tight">{meal.name}</h4>
                              <Badge variant="outline" className="bg-primary/5 border-none text-[8px] uppercase tracking-widest text-primary/60">{meal.time}</Badge>
                              {meal.assignedBy && <Badge className="bg-emerald-500/20 text-emerald-400 border-none text-[7px] uppercase font-black">Назначено экспертом</Badge>}
                           </div>
                           <div className="flex flex-wrap items-center gap-4 mt-1.5 text-[10px] font-black uppercase text-white/40">
                              <span className="flex items-center gap-1"><Flame className="h-3 w-3 text-orange-500" /> {meal.calories} Ккал</span>
                              <span className="flex items-center gap-1"><Beef className="h-3 w-3 text-red-400" /> Б:{meal.protein}г</span>
                              <span className="flex items-center gap-1"><Droplet className="h-3 w-3 text-yellow-500" /> Ж:{meal.fat}г</span>
                              <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-primary" /> У:{meal.carbs}г</span>
                           </div>
                        </div>
                     </div>
                     <Button variant="ghost" size="icon" onClick={() => handleDeleteMeal(meal.id)} className="rounded-xl h-10 w-10 text-white/20 hover:text-destructive hover:bg-destructive/5 transition-all">
                        <Trash2 className="h-5 w-5" />
                     </Button>
                  </Card>
               ))}
            </div>
         ) : (
            <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.03] space-y-4 shadow-inner">
               <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto border border-white/5">
                  <Calendar className="h-8 w-8 text-primary/20" />
               </div>
               <p className="text-xl font-black text-white/40 uppercase tracking-tight">
                 {patientId ? 'План пациента не заполнен' : 'Ваш био-лог пуст'}
               </p>
               <div className="flex justify-center gap-3">
                  <Button variant="outline" onClick={() => setIsAddingOpen(true)} className="rounded-xl border-primary/20 text-primary h-12 px-8 font-black uppercase text-[10px] hover:bg-primary/5">
                    {patientId ? 'Назначить питание' : 'Добавить вручную'}
                  </Button>
               </div>
            </div>
         )}
      </div>
    </div>
  );
}
