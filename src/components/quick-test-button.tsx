'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { useAuth, useFirestore } from '@/firebase';
import { signInAnonymously } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export function QuickTestButton() {
  const [loading, setLoading] = useState(false);
  const { auth } = useAuth();
  const { firestore } = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const handleQuickTest = async () => {
    if (!auth || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Firebase не подключен',
        description: 'Нажмите кнопку "Connect to Firebase" в Studio.',
      });
      return;
    }
    
    setLoading(true);
    try {
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;

      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          uid: user.uid,
          profileType: 'user',
          createdAt: new Date().toISOString(),
          displayName: 'Тестовый Пользователь',
        }, { merge: true });
      }

      toast({ title: 'Вход выполнен', description: 'Добро пожаловать в Bio-хаб!' });
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Ошибка входа',
        description: 'Убедитесь, что Anonymous Auth включен в Firebase Console.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      size="lg" 
      onClick={handleQuickTest}
      disabled={loading}
      className="h-16 px-10 text-xl font-black rounded-3xl bg-secondary hover:bg-secondary/90 shadow-[0_20px_50px_rgba(249,115,22,0.3)] transition-all hover:scale-105 active:scale-95 group gap-3"
    >
      {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Sparkles className="h-6 w-6" />}
      Тестовый доступ
    </Button>
  );
}
