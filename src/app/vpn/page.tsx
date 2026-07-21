'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { vpnLogin } from '@/actions/vpn-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, LogIn, Lock, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export default function VpnAuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const username = (formData.get('username') as string || '').toLowerCase().trim();
    const password = formData.get('password') as string;

    // Для регистрации используем новый API с поддержкой Telegram
    if (!isLogin) {
      const tg = (window as any).Telegram?.WebApp;
      const initData = tg?.initData;

      if (!initData && process.env.NODE_ENV === 'production') {
        toast({ 
          title: "Доступ ограничен", 
          description: "Регистрация доступна только через Telegram!", 
          variant: "destructive" 
        });
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password, initData }),
        });
        const result = await res.json();

        if (!res.ok) {
          toast({ title: "Ошибка регистрации", description: result.error, variant: "destructive" });
        } else {
          toast({ title: "Успех", description: "Аккаунт создан. Войдите в сеть." });
          setIsLogin(true);
        }
      } catch (err) {
        toast({ title: "Ошибка сети", description: "Не удалось связаться с сервером", variant: "destructive" });
      }
    } else {
      // Для логина оставляем стандартный Server Action
      const result = await vpnLogin(formData);
      if (result?.error) {
        toast({ title: "Ошибка доступа", description: result.error, variant: "destructive" });
      } else {
        router.push('/dashboard');
      }
    }
    setLoading(false);
  }

  return (
    <div className="h-screen bg-[#5fad86] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-black/10 blur-[180px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-white/5 blur-[150px] rounded-full" />
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
        className="w-full max-w-[380px] relative z-10"
      >
        <Card className="glass-panel rounded-[3rem] border-white/5 overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)]">
          <CardHeader className="space-y-4 text-center pt-8 pb-4">
            <div className="flex justify-center relative">
              <motion.div 
                animate={{ 
                  filter: [
                    'drop-shadow(0 0 10px rgba(95, 173, 134, 0.2))',
                    'drop-shadow(0 0 25px rgba(95, 173, 134, 0.4))',
                    'drop-shadow(0 0 10px rgba(95, 173, 134, 0.2))'
                  ]
                }}
                transition={{ duration: 5, repeat: Infinity }}
                className="relative w-24 h-24"
              >
                 <Image 
                   src="/fonts/logo512x512.png" 
                   alt="Logo" 
                   fill 
                   className="object-contain" 
                   priority 
                 />
              </motion.div>
            </div>
            
            <div className="space-y-1">
              <CardTitle className="brand-title text-xl justify-center text-white tracking-[0.7em]">
                CYBER<span className="text-[#5fad86]">ARMOR</span>
              </CardTitle>
              <p className="text-[10px] font-black tracking-[0.5em] uppercase text-white">ПРИВАТНЫЙ ТЕРМИНАЛ</p>
            </div>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-3 px-8 pb-4">
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                  <User className="w-4 h-4 text-[#5fad86] opacity-60 group-focus-within:opacity-100 transition-opacity" />
                </div>
                <Input
                  name="username"
                  placeholder="ЛОГИН"
                  required
                  autoComplete="username"
                  className="h-12 pl-12 bg-black/60 border-white/5 rounded-[1.25rem] text-[#5fad86] placeholder:text-[#5fad86] focus:border-[#5fad86]/30 focus:ring-0 outline-none transition-all font-black tracking-[0.2em] text-[11px]"
                />
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                  <Lock className="w-4 h-4 text-[#5fad86] opacity-60 group-focus-within:opacity-100 transition-opacity" />
                </div>
                <Input
                  name="password"
                  type="password"
                  placeholder="ПАРОЛЬ"
                  required
                  autoComplete="current-password"
                  className="h-12 pl-12 bg-black/60 border-white/5 rounded-[1.25rem] text-[#5fad86] placeholder:text-[#5fad86] focus:border-[#5fad86]/30 focus:ring-0 outline-none transition-all font-black tracking-[0.2em] text-[11px]"
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-6 px-8 pb-8">
              <Button 
                type="submit" 
                className="w-full h-12 btn-cyber-primary rounded-[1.25rem] text-[11px]"
                disabled={loading}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : isLogin ? (
                  <><LogIn className="w-4 h-4 mr-2"/> ВОЙТИ В СЕТЬ</>
                ) : (
                  <><UserPlus className="w-4 h-4 mr-2"/> СОЗДАТЬ АККАУНТ</>
                )}
              </Button>
              
              <button
                type="button"
                className="text-white hover:text-white/80 text-[12px] font-black transition-all uppercase tracking-[0.5em] flex items-center justify-center gap-3 group w-full"
                onClick={() => setIsLogin(!isLogin)}
              >
                <div className="h-[1px] flex-1 bg-white/20 group-hover:bg-white/40 transition-all" />
                {isLogin ? "РЕГИСТРАЦИЯ" : "ВХОД"}
                <div className="h-[1px] flex-1 bg-white/20 group-hover:bg-white/40 transition-all" />
              </button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
