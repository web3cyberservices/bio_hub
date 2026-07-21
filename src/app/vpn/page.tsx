
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { vpnLogin, vpnRegister } from '@/actions/vpn-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, UserPlus, LogIn } from 'lucide-react';

export default function VpnAuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    const result = isLogin ? await vpnLogin(formData) : await vpnRegister(formData);

    if (result?.error) {
      toast({ title: "Ошибка", description: result.error, variant: "destructive" });
    } else {
      if (isLogin) {
        router.push('/vpn/dashboard');
      } else {
        toast({ title: "Успех", description: "Регистрация прошла успешно. Теперь войдите." });
        setIsLogin(true);
      }
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-900 border-slate-800 text-slate-100 shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-cyan-500/10 rounded-full">
              <ShieldCheck className="w-10 h-10 text-cyan-500" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            VPN Management Panel
          </CardTitle>
          <p className="text-sm text-slate-400">
            {isLogin ? "Войдите в свой аккаунт" : "Создайте новый аккаунт"}
          </p>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                name="username"
                placeholder="Имя пользователя"
                required
                className="bg-slate-950 border-slate-800 focus:ring-cyan-500"
              />
            </div>
            <div className="space-y-2">
              <Input
                name="password"
                type="password"
                placeholder="Пароль"
                required
                className="bg-slate-950 border-slate-800 focus:ring-cyan-500"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold"
              disabled={loading}
            >
              {loading ? "Загрузка..." : isLogin ? <><LogIn className="w-4 h-4 mr-2"/> Войти</> : <><UserPlus className="w-4 h-4 mr-2"/> Создать аккаунт</>}
            </Button>
            <Button
              type="button"
              variant="link"
              className="text-cyan-500 hover:text-cyan-400 text-sm"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Нет аккаунта? Зарегистрироваться" : "Уже есть аккаунт? Войти"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
