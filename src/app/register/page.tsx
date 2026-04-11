'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NavBar } from '@/components/nav-bar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Activity, User, GraduationCap, Loader2, Sparkles } from 'lucide-react';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signInAnonymously } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { auth } = useAuth();
  const { firestore } = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) return;
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(firestore, 'users', user.uid), {
        uid: user.uid,
        displayName: name,
        email: email,
        profileType: 'user',
        createdAt: new Date().toISOString(),
      });

      toast({
        title: 'Успешная регистрация',
        description: `Добро пожаловать, ${name}!`,
      });
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Ошибка регистрации',
        description: error.message,
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
        description: 'Сервисы Firebase еще не загружены.',
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
          profileType: role,
          createdAt: new Date().toISOString(),
          displayName: role === 'user' ? 'Тестовый Пользователь' : 'Тестовый Специалист',
        });
      }

      router.push('/dashboard');
      toast({
        title: 'Тестовый вход выполнен',
        description: `Вы вошли как ${role === 'user' ? 'пользователь' : 'специалист'}.`,
      });
    } catch (error: any) {
      console.error('Quick Login Error:', error);
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Не удалось выполнить быстрый вход. Убедитесь, что анонимная авторизация включена в консоли Firebase.',
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
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl font-black tracking-tighter">Присоединиться</CardTitle>
            <CardDescription className="text-white/70 font-medium text-xs md:text-sm">
              Начните свой путь к Bio-оптимизации
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
                Войти как пользователь
              </Button>
              <Button 
                variant="outline"
                className="w-full h-16 rounded-2xl border-2 border-foreground text-foreground font-black uppercase tracking-widest text-[11px] gap-3 shadow-sm hover:bg-foreground/5 transition-all"
                onClick={() => handleQuickLogin('specialist')}
                disabled={loading}
              >
                <GraduationCap className="h-5 w-5" /> 
                Войти как специалист
              </Button>
            </div>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                <span className="bg-white px-4 text-muted-foreground/60">Или регистрация</span>
              </div>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Имя</Label>
                  <Input 
                    id="name" 
                    placeholder="Иван Иванов" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 rounded-xl border-2 focus:ring-primary/20"
                    required
                  />
                </div>
                <div className="grid gap-1.5">
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
                <div className="grid gap-1.5">
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
              </div>
              <Button 
                className="w-full h-14 bg-primary hover:bg-primary/90 rounded-xl font-black shadow-xl shadow-primary/20 flex gap-2 mt-2" 
                type="submit"
                disabled={loading}
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                Создать аккаунт
              </Button>
            </form>

            <div className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Уже есть аккаунт?{' '}
              <Link href="/login" className="text-primary hover:underline font-black">
                Войти
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}