'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { vpnLogin, vpnRegister } from '@/actions/vpn-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Shield, UserPlus, LogIn, Lock, User } from 'lucide-react';
import { motion } from 'framer-motion';

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
          description: "Регистрация успешна. Войдите в аккаунт." 
        });
        setIsLogin(true);
      }
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#02040a] flex items-center justify-center p-6 selection:bg-cyan-500/30">
      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="glass-card border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden bg-slate-900/40">
          <CardHeader className="space-y-2 text-center pb-8 pt-10">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-cyan-500/20 rotate-6">
                <Shield className="w-10 h-10 text-white -rotate-6" />
              </div>
            </div>
            <CardTitle className="text-4xl font-black tracking-tighter italic text-white">
              VPN <span className="text-cyan-400">PRO</span>
            </CardTitle>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">
              {isLogin ? "Авторизация в системе" : "Создание нового профиля"}
            </p>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5 px-8">
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    name="username"
                    placeholder="Имя пользователя"
                    required
                    autoComplete="username"
                    className="h-14 pl-12 bg-black/40 border-white/5 rounded-2xl focus:ring-cyan-500 transition-all text-white text-sm font-medium"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    name="password"
                    type="password"
                    placeholder="Ваш пароль"
                    required
                    autoComplete="current-password"
                    className="h-14 pl-12 bg-black/40 border-white/5 rounded-2xl focus:ring-cyan-500 transition-all text-white text-sm font-medium"
                  />
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4 px-8 pb-10 pt-4">
              <Button 
                type="submit" 
                className="w-full h-14 bg-white text-black font-black rounded-2xl hover:bg-slate-200 transition-all active:scale-95 text-xs tracking-widest uppercase border-0"
                disabled={loading}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : isLogin ? (
                  <><LogIn className="w-4 h-4 mr-2"/> Войти в панель</>
                ) : (
                  <><UserPlus className="w-4 h-4 mr-2"/> Зарегистрироваться</>
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="text-slate-500 hover:text-white text-xs font-bold tracking-tighter hover:bg-transparent"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? "НЕТ АККАУНТА? РЕГИСТРАЦИЯ" : "УЖЕ ЕСТЬ АККАУНТ? ВОЙТИ"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}