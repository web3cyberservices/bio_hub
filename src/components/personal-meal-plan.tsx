'use client';

import { useState } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, addDoc, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Plus, Trash2, Loader2, Utensils, Clock, Flame, 
  Beef, Droplet, Zap, Save, Calendar, Mic
} from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface PersonalMealPlanProps {
  selectedDate: Date;
}

export function PersonalMealPlan({ selectedDate }: PersonalMealPlanProps) {
  const { user } = useUser();
  const { firestore } = useFirestore();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const [name, setName] = useState('');
  const [time, setTime] = useState('Завтрак');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [fat, setFat] = useState('');
  const [carbs, setCarbs] = useState('');

  const dateKey = format(selectedDate, 'yyyy-MM-dd');

  const startVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Ваш браузер не поддерживает голосовой ввод.' });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ru-RU';
    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setName(transcript);
      toast({ title: 'Голос распознан' });
    };
    recognition.start();
  };

  const mealsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    
    return query(
      collection(firestore, 'users', user.uid, 'personalMeals'),
      where('date', '==', dateKey),
      orderBy('createdAt', 'asc')
    );
  }, [firestore, user?.uid, dateKey]);

  const { data: meals, isLoading: mealsLoading } = useCollection<any>(mealsQuery);

  const handleAddMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid || !firestore || !name) {
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Заполните название блюда' });
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(firestore, 'users', user.uid, 'personalMeals'), {
        date: dateKey,
        name,
        time,
        calories: Number(calories) || 0,
        protein: Number(protein) || 0,
        fat: Number(fat) || 0,
        carbs: Number(carbs) || 0,
        createdAt: new Date().toISOString()
      });

      toast({ title: 'Блюдо добавлено' });
      setName(''); setCalories(''); setProtein(''); setFat(''); setCarbs('');
      setIsAdding(false);
    } catch (error: any) {
      console.error("Add meal error:", error);
      toast({ variant: 'destructive', title: 'Ошибка сохранения', description: 'Не удалось сохранить блюдо.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMeal = async (id: string) => {
    if (!user?.uid || !firestore) return;
    try {
      await deleteDoc(doc(firestore, 'users', user.uid, 'personalMeals', id));
      toast({ title: 'Блюдо удалено' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Не удалось удалить блюдо.' });
    }
  };

  const totalCalories = meals?.reduce((acc, m) => acc + (m.calories || 0), 0) || 0;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-3xl font-black tracking-tighter text-foreground">Свой план</h3>
          <p className="text-muted-foreground text-sm font-medium">Ваш персональный рацион на {format(selectedDate, 'd MMMM', { locale: ru })}.</p>
        </div>
        <div className="bg-white/60 backdrop-blur-md px-6 py-3 rounded-2xl border shadow-sm flex items-center gap-4">
           <div className="text-center">
              <p className="text-[8px] font-black uppercase text-muted-foreground opacity-40">Итого ккал</p>
              <p className="text-xl font-black text-primary">{totalCalories}</p>
           </div>
           <div className="w-px h-8 bg-border" />
           <Button onClick={() => setIsAdding(!isAdding)} className="rounded-xl h-12 gap-2 bg-primary font-black shadow-lg">
             <Plus className="h-4 w-4" /> Добавить блюдо
           </Button>
        </div>
      </div>

      {isAdding && (
        <Card className="premium-card border-none bg-primary/5 shadow-xl animate-in zoom-in-95 duration-300">
           <CardContent className="p-8">
              <form onSubmit={handleAddMeal} className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 relative">
                       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">Название блюда</label>
                       <div className="relative">
                        <Input placeholder="Напр: Салат с тунцом" value={name} onChange={e => setName(e.target.value)} className="h-14 rounded-xl bg-white border-none shadow-inner font-bold pr-14" required />
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          onClick={startVoiceInput}
                          className={cn(
                            "absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full shadow-sm transition-all",
                            isRecording ? "bg-red-500 text-white animate-pulse" : "bg-primary/5 text-primary"
                          )}
                        >
                          <Mic className="h-4 w-4" />
                        </Button>
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">Прием пищи</label>
                       <Select value={time} onValueChange={setTime}>
                          <SelectTrigger className="h-14 rounded-xl bg-white border-none shadow-inner font-bold">
                             <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                             <SelectItem value="Завтрак">Завтрак</SelectItem>
                             <SelectItem value="Обед">Обед</SelectItem>
                             <SelectItem value="Ужин">Ужин</SelectItem>
                             <SelectItem value="Перекус">Перекус</SelectItem>
                          </SelectContent>
                       </Select>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[{ l: 'Ккал', v: calories, s: setCalories, i: Flame }, { l: 'Белки', v: protein, s: setProtein, i: Beef }, { l: 'Жиры', v: fat, s: setFat, i: Droplet }, { l: 'Углеводы', v: carbs, s: setCarbs, i: Zap }].map((m, i) => (
                       <div key={i} className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-2 flex items-center gap-1"><m.i className="h-2 w-2" /> {m.l}</label>
                          <Input type="number" placeholder="0" value={m.v} onChange={e => m.s(e.target.value)} className="h-14 rounded-xl bg-white border-none shadow-inner font-bold text-center" />
                       </div>
                    ))}
                 </div>
                 <div className="flex gap-4 pt-2">
                    <Button type="button" variant="ghost" onClick={() => setIsAdding(false)} className="flex-1 h-14 rounded-xl font-bold">Отмена</Button>
                    <Button type="submit" disabled={loading} className="flex-[2] h-14 rounded-xl bg-primary font-black shadow-xl">
                       {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <><Save className="mr-2 h-5 w-5" /> Сохранить в план</>}
                    </Button>
                 </div>
              </form>
           </CardContent>
        </Card>
      )}

      <div className="space-y-4">
         {mealsLoading ? (
            <div className="py-24 text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto opacity-20" />
              <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">Синхронизация списка...</p>
            </div>
         ) : meals && meals.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
               {meals.map((meal) => (
                  <Card key={meal.id} className="premium-card p-6 border-none flex items-center justify-between group">
                     <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                           <Utensils className="h-6 w-6" />
                        </div>
                        <div>
                           <div className="flex items-center gap-2">
                              <h4 className="font-black text-lg">{meal.name}</h4>
                              <Badge variant="outline" className="bg-primary/5 border-none text-[8px] uppercase tracking-widest">{meal.time}</Badge>
                           </div>
                           <div className="flex items-center gap-4 mt-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
                              <span className="flex items-center gap-1"><Flame className="h-3 w-3 text-orange-500" /> {meal.calories} Ккал</span>
                              <span className="flex items-center gap-1"><Beef className="h-3 w-3 text-red-400" /> Б:{meal.protein}г</span>
                              <span className="flex items-center gap-1"><Droplet className="h-3 w-3 text-yellow-500" /> Ж:{meal.fat}г</span>
                              <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-primary" /> У:{meal.carbs}г</span>
                           </div>
                        </div>
                     </div>
                     <Button variant="ghost" size="icon" onClick={() => handleDeleteMeal(meal.id)} className="rounded-xl h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all">
                        <Trash2 className="h-5 w-5" />
                     </Button>
                  </Card>
               ))}
            </div>
         ) : (
            <div className="py-24 text-center border-2 border-dashed border-primary/10 rounded-[2.5rem] bg-white/40 space-y-4">
               <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto">
                  <Calendar className="h-8 w-8 text-primary/20" />
               </div>
               <div className="space-y-1">
                  <p className="text-xl font-black text-foreground/40">Ваш план пока пуст</p>
                  <p className="text-xs text-muted-foreground/60 max-w-xs mx-auto">Добавляйте свои блюда и контролируйте калории в реальном времени.</p>
               </div>
               <Button variant="outline" onClick={() => setIsAdding(true)} className="rounded-xl border-primary/20 text-primary h-12 px-8 font-black">
                  <Plus className="h-4 w-4 mr-2" /> Добавить первое блюдо
               </Button>
            </div>
         )}
      </div>
    </div>
  );
}