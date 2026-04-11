'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NavBar } from '@/components/nav-bar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Activity, User, GraduationCap, Loader2, LogIn } from 'lucide-react';
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
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Сервис авторизации недоступен. Проверьте подключение к Firebase.',
      });
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: 'Успешный вход',
        description: 'Добро пожаловать в личный кабинет!',
      });
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

  const handleQuickLogin = async (role: 'user' | 'specialist') => {
    if (!auth || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Ошибка инициализации',
        description: 'Сервисы Firebase недоступны. Настройте проект в Studio.',
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
          profileType: role,
          createdAt: new Date().toISOString(),
          displayName: role === 'user' ? 'Тестовый Пользователь' : 'Тестовый Специалист',
        }, { merge: true });
      }

      toast({
        title: 'Тестовый вход выполнен',
        description: `Вы вошли как ${role === 'user' ? 'пользователь' : 'специалист'}.`,
      });
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Quick Login Error:', error);
      toast({
        variant: 'destructive',
        title: 'Ошибка входа',
        description: error.code === 'auth/operation-not-allowed' 
          ? 'Анонимная авторизация не включена в консоли Firebase.' 
          : 'Не удалось выполнить быстрый вход. Проверьте настройки.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F0F7F2]">
      <NavBar />
      <main className="flex flex-1 items-center justify-center p-4">
        <Card className="mx-auto w-full max-w-md premium-card border-none shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
          <CardHeader className="space-y-2 text-center bg-primary text-white p-8">
            <div className="flex justify-center mb-2">
              <div className="rounded-2xl bg-white p-3 shadow-xl">
                <Activity className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl font-black tracking-tighter">Вход в PRO Себя</CardTitle>
            <CardDescription className="text-white/70 font-medium text-xs md:text-sm">
              Ваш персональный биометрический хаб
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <Button 
                className="w-full h-16 rounded-2xl bg-foreground text-white font-black uppercase tracking-widest text-[11px] gap-3 shadow-lg hover:bg-foreground/90 transition-all border-b-4 border-black/20"
                onClick={() => handleQuickLogin('user')}
                disabled={loading}
              >
                <User className="h-5 w-5" /> 
                Тест: Войти как пользователь
              </Button>
              <Button 
                variant="outline"
                className="w-full h-16 rounded-2xl border-2 border-foreground text-foreground font-black uppercase tracking-widest text-[11px] gap-3 shadow-sm hover:bg-foreground/5 transition-all"
                onClick={() => handleQuickLogin('specialist')}
                disabled={loading}
              >
                <GraduationCap className="h-5 w-5" /> 
                Тест: Войти как специалист
              </Button>
            </div>
            
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                <span className="bg-white px-4 text-muted-foreground/60">Или стандартный вход</span>
              </div>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-xl border-2 focus:ring-primary/20"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Пароль</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl border-2 focus:ring-primary/20"
                  required
                />
              </div>
              <Button 
                className="w-full h-14 bg-primary hover:bg-primary/90 rounded-xl font-black shadow-xl shadow-primary/20 flex gap-2" 
                type="submit"
                disabled={loading}
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><LogIn className="h-5 w-5" /> Войти по почте</>}
              </Button>
            </form>
            
            <div className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Нет аккаунта?{' '}
              <Link href="/register" className="text-primary hover:underline font-black">
                Зарегистрироваться
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
