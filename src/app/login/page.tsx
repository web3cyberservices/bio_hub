'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NavBar } from '@/components/nav-bar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Activity, Loader2, LogIn, Sparkles } from 'lucide-react';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { auth } = useAuth();
  const { firestore } = useFirestore();
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!userLoading && user) {
      router.push('/dashboard');
    }
  }, [user, userLoading, router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Сервис авторизации не настроен. Нажмите "Connect to Firebase" в Studio.',
      });
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: 'Успешный вход' });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Ошибка входа',
        description: 'Неверный email или пароль.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async () => {
    if (!auth || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Подключите проект через кнопку "Connect to Firebase" в Studio.',
      });
      return;
    }
    
    setLoading(true);
    try {
      const userCredential = await signInAnonymously(auth);
      const testUser = userCredential.user;

      const userDocRef = doc(firestore, 'users', testUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          uid: testUser.uid,
          profileType: 'user',
          createdAt: new Date().toISOString(),
          displayName: 'Тестовый Пользователь',
        }, { merge: true });
      }

      toast({ title: 'Вход выполнен' });
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Убедитесь, что анонимная авторизация включена в консоли Firebase.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (userLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F0F7F2]">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F0F7F2]">
      <NavBar />
      <main className="flex flex-1 items-center justify-center p-4">
        <Card className="mx-auto w-full max-w-md premium-card border-none shadow-2xl overflow-hidden">
          <CardHeader className="space-y-2 text-center bg-primary text-white p-8">
            <div className="flex justify-center mb-2">
              <div className="rounded-2xl bg-white p-3 shadow-xl">
                <Activity className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl font-black tracking-tighter">Вход в PRO Себя</CardTitle>
            <CardDescription className="text-white/70 font-medium text-xs">
              Ваш персональный биометрический хаб
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <Button 
              className="w-full h-16 rounded-2xl bg-foreground text-white font-black uppercase tracking-widest text-[11px] gap-3"
              onClick={handleQuickLogin}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5 text-accent" />}
              Тестовый вход (Быстрый)
            </Button>
            
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                <span className="bg-white px-4 text-muted-foreground/60">Или почта</span>
              </div>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl"
                  required
                />
              </div>
              <Button 
                className="w-full h-14 bg-primary hover:bg-primary/90 rounded-xl font-black shadow-xl" 
                type="submit"
                disabled={loading}
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <div className="flex items-center"><LogIn className="h-5 w-5 mr-2" /> Войти</div>}
              </Button>
            </form>
            
            <div className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Нет аккаунта?{' '}
              <Link href="/register" className="text-primary hover:underline font-black">
                Создать
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
