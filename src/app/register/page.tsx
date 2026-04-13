'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NavBar } from '@/components/nav-bar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, Loader2, User, GraduationCap } from 'lucide-react';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
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
    if (!auth || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Сервисы Firebase недоступны. Подключите проект.',
      });
      return;
    }
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
      }, { merge: true });

      toast({ title: 'Регистрация успешна' });
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
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
        title: 'Ошибка',
        description: 'Подключите проект в Studio.',
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

      toast({ title: 'Вход выполнен' });
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Включите Anonymous Auth в консоли Firebase.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F0F7F2]">
      <NavBar />
      <main className="flex flex-1 items-center justify-center p-4">
        <Card className="mx-auto w-full max-w-md premium-card border-none shadow-2xl overflow-hidden">
          <CardHeader className="space-y-2 text-center bg-primary text-white p-8">
            <div className="flex justify-center mb-2">
              <div className="rounded-2xl bg-white p-3 shadow-xl">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl font-black tracking-tighter">Регистрация</CardTitle>
            <CardDescription className="text-white/70 font-medium text-xs">
              Присоединяйтесь к Bio-хабу PRO Себя
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
             <div className="grid grid-cols-1 gap-4">
              <Button 
                className="w-full h-16 rounded-2xl bg-foreground text-white font-black uppercase tracking-widest text-[11px] gap-3"
                onClick={() => handleQuickLogin('user')}
                disabled={loading}
              >
                <User className="h-5 w-5" /> 
                Тест: Как пользователь
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
                  <Label htmlFor="name">Имя</Label>
                  <Input 
                    id="name" 
                    placeholder="Имя" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 rounded-xl"
                    required
                  />
                </div>
                <div className="grid gap-1.5">
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
                <div className="grid gap-1.5">
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
              </div>
              <Button 
                className="w-full h-14 bg-primary hover:bg-primary/90 rounded-xl font-black shadow-xl mt-2" 
                type="submit"
                disabled={loading}
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <div className="flex items-center"><Sparkles className="h-5 w-5 mr-2" /> Создать аккаунт</div>}
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
