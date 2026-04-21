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
    if (!auth) {
      toast({
        variant: 'destructive',
        title: 'Био-хаб не подключен',
        description: 'Пожалуйста, нажмите кнопку "Connect to Firebase" в верхней части Firebase Studio.',
      });
      return;
    }
    
    setLoading(true);
    try {
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;

      if (firestore) {
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          await setDoc(userDocRef, {
            uid: user.uid,
            profileType: 'user',
            createdAt: new Date().toISOString(),
            displayName: 'Тестовый Пользователь',
            firstName: 'Тестовый',
            lastName: 'Пользователь'
          }, { merge: true });
        }
      }

      toast({ title: 'Доступ разрешен', description: 'Добро пожаловать в Bio-хаб!' });
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        variant: 'destructive',
        title: 'Ошибка авторизации',
        description: 'Убедитесь, что в Firebase Console включен метод "Anonymous".',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      variant="outline"
      onClick={handleQuickTest}
      disabled={loading}
      className="h-14 w-full rounded-xl border-2 border-secondary/20 bg-secondary/5 text-secondary hover:bg-secondary/10 font-black uppercase tracking-widest text-[10px] gap-2 transition-all shadow-sm"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
      Тест
    </Button>
  );
}
