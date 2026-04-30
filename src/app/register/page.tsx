'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NavBar } from '@/components/nav-bar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Sparkles, Loader2, UserPlus, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { QuickTestButton } from '@/components/quick-test-button';
import { LegalDialogs } from '@/components/legal-dialogs';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Состояния для политик безопасности
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptData, setAcceptData] = useState(false);
  const [acceptAI, setAcceptAI] = useState(false);

  const allAccepted = acceptTerms && acceptData && acceptAI;
  
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
    if (!auth || !firestore || loading || !allAccepted) return;
    
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
        agreementsAccepted: true,
        agreementsDate: new Date().toISOString(),
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
    if (loading || !auth || !firestore) return;
    if (!allAccepted) {
      toast({
        variant: 'destructive',
        title: 'Требуется согласие',
        description: 'Пожалуйста, примите условия использования для входа через Google.',
      });
      return;
    }

    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/fitness.activity.read');
      provider.addScope('https://www.googleapis.com/auth/fitness.body.read');
      provider.addScope('https://www.googleapis.com/auth/fitness.sleep.read');
      provider.setCustomParameters({ prompt: 'select_account' });

      const userCredential = await signInWithPopup(auth, provider);
      const googleUser = userCredential.user;

      const credential = GoogleAuthProvider.credentialFromResult(userCredential);
      if (credential?.accessToken) {
        sessionStorage.setItem('google_fit_token', credential.accessToken);
      }

      const userDocRef = doc(firestore, 'users', googleUser.uid);
      const fullName = googleUser.displayName || googleUser.email?.split('@')[0] || 'Пользователь';
      const firstName = fullName.split(' ')[0];
      const lastName = fullName.split(' ').slice(1).join(' ') || '';

      await setDoc(userDocRef, {
        uid: googleUser.uid,
        id: googleUser.uid,
        email: googleUser.email,
        displayName: fullName,
        firstName,
        lastName,
        photoUrl: googleUser.photoURL || '',
        profileType: 'user',
        agreementsAccepted: true,
        agreementsDate: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      toast({ title: 'Вход через Google выполнен' });
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        setLoading(false);
        return;
      }
      toast({ variant: 'destructive', title: 'Ошибка авторизации', description: 'Не удалось войти через Google.' });
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
      <main className="flex flex-1 items-center justify-center p-4 pt-24 pb-12">
        <Card className="mx-auto w-full max-w-md premium-card border border-blue-900/30 shadow-2xl overflow-hidden bg-blue-950/40 backdrop-blur-xl">
          <CardHeader className="space-y-2 text-center bg-primary text-slate-950 p-8">
            <div className="flex justify-center mb-2">
              <div className="rounded-2xl bg-white p-3 shadow-xl">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl font-black tracking-tighter uppercase">Регистрация</CardTitle>
            <CardDescription className="text-slate-950/70 font-black uppercase text-[10px] tracking-widest">
              Безопасный биометрический хаб PRO Себя
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline"
                className={`h-14 rounded-xl border-2 border-white/10 bg-white/5 font-black uppercase tracking-widest text-[10px] gap-2 transition-all ${!allAccepted ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:bg-white/10 text-white'}`}
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

            <form onSubmit={handleRegister} className="space-y-6">
              <div className="grid gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="name" className="text-white/50 uppercase text-[9px] font-black px-1">Имя</Label>
                  <Input id="name" placeholder="Ваше имя" value={name} onChange={(e) => setName(e.target.value)} className="h-12 rounded-xl bg-slate-200/10 border-white/10 text-white" required />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="email" className="text-white/50 uppercase text-[9px] font-black px-1">Email</Label>
                  <Input id="email" type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 rounded-xl bg-slate-200/10 border-white/10 text-white" required />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="password" className="text-white/50 uppercase text-[9px] font-black px-1">Пароль</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 rounded-xl bg-slate-200/10 border-white/10 text-white" required />
                </div>
              </div>

              {/* ПОЛИТИКИ БЕЗОПАСНОСТИ */}
              <div className="space-y-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="flex items-start gap-3">
                  <Checkbox id="terms" checked={acceptTerms} onCheckedChange={(v) => setAcceptTerms(!!v)} className="mt-1 border-primary/40 data-[state=checked]:bg-primary" />
                  <label htmlFor="terms" className="text-[10px] leading-tight text-white/50 font-bold uppercase tracking-tight cursor-pointer">
                    Я принимаю <LegalDialogs type="eula" /> и <LegalDialogs type="privacy" />
                  </label>
                </div>
                <div className="flex items-start gap-3">
                  <Checkbox id="data" checked={acceptData} onCheckedChange={(v) => setAcceptData(!!v)} className="mt-1 border-primary/40 data-[state=checked]:bg-primary" />
                  <label htmlFor="data" className="text-[10px] leading-tight text-white/50 font-bold uppercase tracking-tight cursor-pointer">
                    Даю согласие на <LegalDialogs type="data" />
                  </label>
                </div>
                <div className="flex items-start gap-3">
                  <Checkbox id="ai" checked={acceptAI} onCheckedChange={(v) => setAcceptAI(!!v)} className="mt-1 border-primary/40 data-[state=checked]:bg-primary" />
                  <label htmlFor="ai" className="text-[10px] leading-tight text-white/50 font-bold uppercase tracking-tight cursor-pointer">
                    ИИ-рекомендации не являются мед. диагнозом
                  </label>
                </div>
              </div>

              <Button 
                className={`w-full h-14 rounded-xl font-black text-slate-950 shadow-xl transition-all ${!allAccepted ? 'bg-white/10 text-white/20' : 'bg-primary hover:bg-primary/90'}`} 
                type="submit"
                disabled={loading || !allAccepted}
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <div className="flex items-center"><UserPlus className="h-5 w-5 mr-2" /> СОЗДАТЬ ID</div>}
              </Button>
            </form>

            {!allAccepted && (
              <div className="flex items-center justify-center gap-2 text-primary/40 animate-pulse">
                <ShieldAlert className="h-3 w-3" />
                <span className="text-[8px] font-black uppercase tracking-widest">Требуется принятие условий</span>
              </div>
            )}

            <div className="text-center text-[10px] font-bold text-white/40 uppercase tracking-widest pt-2">
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
