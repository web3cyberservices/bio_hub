'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NavBar } from '@/components/nav-bar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, Loader2, UserPlus } from 'lucide-react';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { QuickTestButton } from '@/components/quick-test-button';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { auth } = useAuth();
  const { firestore } = useFirestore();
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!userLoading && user && user.uid !== 'public-user') {
      router.replace('/dashboard');
    }
  }, [user, userLoading, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Сервисы Firebase недоступны.',
      });
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      await setDoc(doc(firestore, 'users', newUser.uid), {
        uid: newUser.uid,
        id: newUser.uid,
        displayName: name,
        firstName: name,
        email: email,
        profileType: 'user',
        createdAt: new Date().toISOString(),
      }, { merge: true });

      toast({ title: 'Регистрация успешна' });
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

  const handleGoogleLogin = async () => {
    if (!auth || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Сервисы Firebase не инициализированы.',
      });
      return;
    }
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      // Добавляем те же доступы, что и на странице входа
      provider.addScope('https://www.googleapis.com/auth/fitness.activity.read');
      provider.addScope('https://www.googleapis.com/auth/fitness.body.read');
      provider.addScope('https://www.googleapis.com/auth/fitness.sleep.read');

      const userCredential = await signInWithPopup(auth, provider);
      const googleUser = userCredential.user;

      // Сохраняем токен
      const credential = GoogleAuthProvider.credentialFromResult(userCredential);
      if (credential?.accessToken) {
        sessionStorage.setItem('google_fit_token', credential.accessToken);
      }

      const userDocRef = doc(firestore, 'users', googleUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          uid: googleUser.uid,
          id: googleUser.uid,
          email: googleUser.email,
          displayName: googleUser.displayName,
          firstName: googleUser.displayName?.split(' ')[0] || googleUser.displayName,
          lastName: googleUser.displayName?.split(' ')[1] || '',
          photoUrl: googleUser.photoURL || '',
          profileType: 'user',
          createdAt: new Date().toISOString(),
        }, { merge: true });
      }
      toast({ title: 'Вход через Google выполнен' });
    } catch (error: any) {
      console.error("Google Auth Error:", error);
      toast({
        variant: 'destructive',
        title: 'Ошибка Google входа',
        description: 'Не удалось завершить регистрацию через Google.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (userLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#000000]">
      <NavBar />
      <main className="flex flex-1 items-center justify-center p-4">
        <Card className="mx-auto w-full max-w-md premium-card border border-blue-900/30 shadow-2xl overflow-hidden bg-blue-950/40 backdrop-blur-xl">
          <CardHeader className="space-y-2 text-center bg-primary text-slate-950 p-8">
            <div className="flex justify-center mb-2">
              <div className="rounded-2xl bg-white p-3 shadow-xl">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl font-black tracking-tighter uppercase">Регистрация</CardTitle>
            <CardDescription className="text-slate-950/70 font-black uppercase text-[10px] tracking-widest">
              Присоединяйтесь к Bio-хабу PRO Себя
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline"
                className="h-14 rounded-xl border-2 border-white/10 bg-white/5 font-black uppercase tracking-widest text-[10px] gap-2 hover:bg-white/10 text-white"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
                Google
              </Button>
              <QuickTestButton />
            </div>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10" /></div>
              <div className="relative flex justify-center text-[9px] font-black uppercase tracking-widest">
                <span className="bg-[#0c1221] px-4 text-white/30">Или регистрация</span>
              </div>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="name" className="text-white/50 uppercase text-[9px] font-black px-1">Имя</Label>
                  <Input 
                    id="name" 
                    placeholder="Ваше имя" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 rounded-xl bg-slate-200/10 border-white/10 text-white"
                    required
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="email" className="text-white/50 uppercase text-[9px] font-black px-1">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 rounded-xl bg-slate-200/10 border-white/10 text-white"
                    required
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="password" className="text-white/50 uppercase text-[9px] font-black px-1">Пароль</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 rounded-xl bg-slate-200/10 border-white/10 text-white"
                    required
                  />
                </div>
              </div>
              <Button 
                className="w-full h-14 bg-primary hover:bg-primary/90 rounded-xl font-black text-slate-950 shadow-xl mt-2" 
                type="submit"
                disabled={loading}
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <div className="flex items-center"><UserPlus className="h-5 w-5 mr-2" /> СОЗДАТЬ АККАУНТ</div>}
              </Button>
            </form>

            <div className="text-center text-[10px] font-bold text-white/40 uppercase tracking-widest">
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