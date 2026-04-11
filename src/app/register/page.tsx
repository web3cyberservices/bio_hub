'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NavBar } from '@/components/nav-bar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Activity, Mail, Send, Zap, Loader2, Sparkles } from 'lucide-react';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signInAnonymously } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [profileType, setProfileType] = useState('user');
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
        profileType: profileType,
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

  const handleGoogleRegister = async () => {
    if (!auth || !firestore) return;
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await setDoc(doc(firestore, 'users', user.uid), {
        uid: user.uid,
        displayName: user.displayName || 'Пользователь',
        email: user.email,
        photoURL: user.photoURL,
        createdAt: new Date().toISOString(),
      }, { merge: true });

      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Ошибка Google Auth',
        description: error.message,
      });
    }
  };

  const handleMessengerMaxLogin = async () => {
    if (!auth) return;
    setLoading(true);
    try {
      await signInAnonymously(auth);
      toast({
        title: 'Вход выполнен',
        description: 'Вы вошли через Messenger Max',
      });
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Не удалось авторизоваться.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialStub = (name: string) => {
    toast({
      title: 'В разработке',
      description: `Регистрация через ${name} будет доступна в ближайшем обновлении.`,
    });
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
            <CardTitle className="text-3xl font-black tracking-tighter">Создать аккаунт</CardTitle>
            <CardDescription className="text-white/70 font-medium text-xs md:text-sm">
              Начните свой путь к Bio-оптимизации
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="h-14 rounded-2xl border-2 font-bold gap-2 hover:bg-primary/5 transition-all text-xs"
                onClick={handleGoogleRegister}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>
              <Button 
                variant="outline" 
                className="h-14 rounded-2xl border-2 font-bold gap-2 hover:bg-[#0088cc]/5 transition-all text-xs"
                onClick={() => handleSocialStub('Telegram')}
              >
                <Send className="h-5 w-5 text-[#0088cc]" />
                Telegram
              </Button>
            </div>

            <Button 
              className="w-full h-14 rounded-2xl bg-foreground text-white font-black uppercase tracking-widest text-[10px] gap-2 shadow-lg group transition-all active:scale-95"
              onClick={handleMessengerMaxLogin}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4 fill-white group-hover:animate-pulse" />} 
              Вход через Messenger Max
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                <span className="bg-white px-4 text-muted-foreground/60">Или по почте</span>
              </div>
            </div>

            <form onSubmit={handleRegister} className="space-y-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Тип профиля</Label>
                <RadioGroup defaultValue="user" value={profileType} onValueChange={setProfileType} className="flex gap-4">
                  <div className="flex items-center space-x-2 rounded-xl border-2 p-3 w-full cursor-pointer hover:bg-primary/5 transition-all">
                    <RadioGroupItem value="user" id="user" />
                    <Label htmlFor="user" className="cursor-pointer font-bold text-xs">Пользователь</Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-xl border-2 p-3 w-full cursor-pointer hover:bg-primary/5 transition-all">
                    <RadioGroupItem value="specialist" id="specialist" />
                    <Label htmlFor="specialist" className="cursor-pointer font-bold text-xs">Специалист</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Имя</Label>
                  <Input 
                    id="name" 
                    placeholder="Иван Иванов" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-14 rounded-xl border-2 focus:ring-primary/20"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-14 rounded-xl border-2 focus:ring-primary/20"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Пароль</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-14 rounded-xl border-2 focus:ring-primary/20"
                    required
                  />
                </div>
              </div>
              <Button 
                className="w-full h-16 text-lg bg-primary hover:bg-primary/90 rounded-2xl font-black shadow-xl shadow-primary/20 flex gap-2" 
                type="submit"
                disabled={loading}
              >
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                Зарегистрироваться
              </Button>
              <div className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Уже есть аккаунт?{' '}
                <Link href="/login" className="text-primary hover:underline font-black">
                  Войти
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
