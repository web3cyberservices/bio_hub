"use client";

import { useState } from 'react';
import { 
  generatePersonalizedRecommendations,
  GenerateRecommendationsOutput 
} from '@/ai/flows/generate-personalized-recommendations';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Loader2, 
  Sparkles, 
  Zap,
  Activity,
  AlertCircle,
  ShieldCheck,
  UserCircle,
  Database
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';

interface RecommendationFormProps {
  onResult: (result: GenerateRecommendationsOutput) => void;
  selectedDate: Date;
}

export function RecommendationForm({ onResult, selectedDate }: RecommendationFormProps) {
  const { user } = useUser();
  const { firestore } = useFirestore();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore || user.uid === 'public-user') return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userData } = useDoc<any>(userDocRef);

  const calculateAge = (dob: string) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleSmartGenerate = async () => {
    if (!user || !firestore) return;
    
    // Проверка наличия данных в профиле
    if (!userData?.weight || !userData?.height || !userData?.birthDate) {
      toast({
        variant: 'destructive',
        title: 'Данные профиля неполны',
        description: 'Пожалуйста, заполните вес, рост и дату рождения в разделе Профиль для точного анализа.',
      });
      return;
    }

    setLoading(true);
    try {
      const age = calculateAge(userData.birthDate);
      
      const result = await generatePersonalizedRecommendations({
        weight: userData.weight,
        height: userData.height,
        gender: userData.gender || 'мужской',
        activityLevel: userData.activityLevel || 'moderate',
        healthGoal: userData.healthGoal || 'поддержать текущее состояние',
        smoking: userData.smoking || 'нет',
        alcohol: userData.alcohol || 'не употребляю',
        age,
        favoriteFoods: userData.favoriteFoods,
        dislikedFoods: userData.dislikedFoods,
        targetDate: selectedDate.toISOString(),
        deviceData: {
          steps: 0, // Эти данные подтянутся из dailyLogs в RecommendationDisplay
          avgHeartRate: 72,
          sleepDurationHours: 8,
          bloodPressure: '120/80',
        },
      });
      
      onResult(result);
    } catch (error: any) {
      toast({ 
        variant: 'destructive', 
        title: 'Ошибка анализа',
        description: error.message || 'Проверьте соединение с ИИ.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="cyber-card max-w-lg mx-auto overflow-hidden border-primary/20 bg-primary/5">
      <CardContent className="p-10 space-y-8 text-center">
        <div className="relative">
           <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
           <ShieldCheck className="h-16 w-16 text-primary mx-auto relative z-10" />
        </div>
        
        <div className="space-y-2">
           <h3 className="text-xl font-black tracking-tight text-white uppercase">Готов к инициализации</h3>
           <p className="text-xs text-primary/60 font-medium leading-relaxed">
             Система автоматически считала ваши биометрические данные из профиля. Мы готовы создать вашу цифровую копию.
           </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-left">
           <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <UserCircle className="h-4 w-4 text-primary/40 mb-2" />
              <p className="text-[8px] font-black uppercase text-white/40">Биометрия</p>
              <p className="text-xs font-bold text-white">{userData?.weight}кг / {userData?.height}см</p>
           </div>
           <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <Database className="h-4 w-4 text-primary/40 mb-2" />
              <p className="text-[8px] font-black uppercase text-white/40">Статус</p>
              <p className="text-xs font-bold text-primary">Активен</p>
           </div>
        </div>

        <Button 
          onClick={handleSmartGenerate} 
          disabled={loading} 
          className="w-full h-16 rounded-2xl bg-primary text-black font-black text-lg shadow-[0_0_30px_rgba(14,165,233,0.4)] hover:scale-105 transition-all"
        >
          {loading ? <Loader2 className="mr-3 animate-spin h-6 w-6" /> : <><Sparkles className="mr-3 h-6 w-6" /> СОЗДАТЬ ДВОЙНИКА</>}
        </Button>

        <p className="text-[8px] font-black uppercase tracking-widest text-white/20">
          Neural Sync Protocol Active v4.0.2
        </p>
      </CardContent>
    </Card>
  );
}
