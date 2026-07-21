
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
      toast({ 
        title: "Ошибка", 
        description: result.error, 
        variant: "destructive" 
      });
    } else {
      if (isLogin) {
        router.push('/dashboard');
      } else {
        toast({ 
          title: "Успех", 
          description: "Регистрация прошла успешно. Теперь войдите." 
        });
        setIsLogin(true);
      }
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-border shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <ShieldCheck className="w-10 h-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            VPN PRO 2026
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {isLogin ? "Войдите в панель управления" : "Создайте новый аккаунт"}
          </p>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                name="username"
                placeholder="Имя пользователя"
                required
                autoComplete="username"
                className="bg-background border-input focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Input
                name="password"
                type="password"
                placeholder="Пароль"
                required
                autoComplete="current-password"
                className="bg-background border-input focus:ring-primary"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full font-semibold"
              disabled={loading}
            >
              {loading ? "Загрузка..." : isLogin ? <><LogIn className="w-4 h-4 mr-2"/> Войти</> : <><UserPlus className="w-4 h-4 mr-2"/> Создать</>}
            </Button>
            <Button
              type="button"
              variant="link"
              className="text-primary hover:text-primary/80 text-sm"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Нет аккаунта? Регистрация" : "Уже есть аккаунт? Войти"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
