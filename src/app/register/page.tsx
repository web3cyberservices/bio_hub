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
import { doc, setDoc } from 'firebase/firestore';
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
    if (!auth || !firestore) return;
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
        updatedAt: new Date().toISOString(),
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
    if (!auth || !firestore) return;
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      // Запрашиваем области доступа для Google Fit / Health Connect
      provider.addScope('https://www.googleapis.com/auth/fitness.activity.read');
      provider.addScope('https://www.googleapis.com/auth/fitness.body.read');
      provider.addScope('https://www.googleapis.com/auth/fitness.sleep.read');
      provider.setCustomParameters({ prompt: 'select_account' });

      const userCredential = await signInWithPopup(auth, provider);
      const googleUser = userCredential.user;

      // Извлекаем токен доступа для фоновой синхронизации данных здоровья
      const credential = GoogleAuthProvider.credentialFromResult(userCredential);
      if (credential?.accessToken) {
        sessionStorage.setItem('google_fit_token', credential.accessToken);
      }

      const userDocRef = doc(firestore, 'users', googleUser.uid);
      
      // Разбираем имя для создания качественного профиля
      const fullName = googleUser.displayName || googleUser.email?.split('@')[0] || 'Пользователь';
      const firstName = fullName.split(' ')[0];
      const lastName = fullName.split(' ').slice(1).join(' ') || '';

      // Обновляем данные пользователя при каждом входе
      await setDoc(userDocRef, {
        uid: googleUser.uid,
        id: googleUser.uid,
        email: googleUser.email,
        displayName: fullName,
        firstName,
        lastName,
        photoUrl: googleUser.photoURL || '',
        profileType: 'user',
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      toast({ title: 'Вход через Google выполнен' });
      // Перенаправление произойдет автоматически через useEffect
    } catch (error: any) {
      console.error("Google Auth Error:", error);
      let errorMsg = 'Не удалось завершить вход через Google.';
      if (error.code === 'auth/popup-closed-by-user') errorMsg = 'Окно входа было закрыто.';
      
      toast({
        variant: 'destructive',
        title: 'Ошибка авторизации',
        description: errorMsg,
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
                type="button"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <img src="https://www.gstatic.com/firebase/explore/images/goog-logo.svg" className="h-4 w-4" alt="Google" />}
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
