'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { vpnLogin, vpnRegister } from '@/actions/vpn-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, LogIn, Lock, User } from 'lucide-react';
import { motion } from 'framer-motion';
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

    const result = isLogin ? await vpnLogin(formData) : await vpnRegister(formData);

    if (result?.error) {
      toast({ 
        title: "Ошибка доступа", 
        description: result.error, 
        variant: "destructive" 
      });
    } else {
      if (isLogin) {
        router.push('/dashboard');
      } else {
        toast({ 
          title: "Успех", 
          description: "Аккаунт создан. Используйте свои данные для входа." 
        });
        setIsLogin(true);
      }
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#5fad86] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-black/10 blur-[150px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-cyan-900/10 blur-[150px] rounded-full" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-[400px] relative z-10"
      >
        <Card className="glass-panel rounded-[3.5rem] border-white/5 overflow-hidden shadow-2xl">
          <CardHeader className="space-y-6 text-center pt-10 pb-6">
            <div className="flex justify-center relative">
              <div className="absolute inset-0 bg-[#5fad86]/10 blur-2xl rounded-full scale-125" />
              <div className="relative w-20 h-20 bg-black/40 rounded-2xl flex items-center justify-center shadow-lg border border-white/10 neon-glow">
                <div className="relative w-12 h-12">
                   <Image src="/fonts/logo512x512.png" alt="Logo" fill className="object-contain" priority />
                </div>
              </div>
            </div>
            
            <div className="space-y-1">
              <CardTitle className="brand-title text-2xl justify-center text-white tracking-[0.4em]">
                CYBER<span className="text-[#5fad86]">ARMOR</span>
              </CardTitle>
              <p className="text-[9px] font-black tracking-[0.5em] uppercase text-white/20">Приватный терминал</p>
            </div>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 px-10 pb-6">
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5fad86] transition-colors" />
                <Input
                  name="username"
                  placeholder="ЛОГИН"
                  required
                  autoComplete="username"
                  className="h-14 pl-12 bg-black/60 border-white/5 rounded-2xl text-[#5fad86] placeholder:text-[#5fad86]/30 focus:border-[#5fad86]/40 outline-none transition-all font-black tracking-widest text-[12px] shadow-inner"
                />
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5fad86] transition-colors" />
                <Input
                  name="password"
                  type="password"
                  placeholder="ПАРОЛЬ"
                  required
                  autoComplete="current-password"
                  className="h-14 pl-12 bg-black/60 border-white/5 rounded-2xl text-[#5fad86] placeholder:text-[#5fad86]/30 focus:border-[#5fad86]/40 outline-none transition-all font-black tracking-widest text-[12px] shadow-inner"
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-6 px-10 pb-12">
              <Button 
                type="submit" 
                className="w-full h-14 bg-[#5fad86] hover:bg-[#5fad86]/90 text-black font-black rounded-2xl shadow-[0_8px_20px_rgba(95,173,134,0.3)] transition-all active:scale-95 text-[11px] tracking-[0.3em] uppercase cyber-button"
                disabled={loading}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : isLogin ? (
                  <><LogIn className="w-4 h-4 mr-2"/> Войти</>
                ) : (
                  <><UserPlus className="w-4 h-4 mr-2"/> Создать</>
                )}
              </Button>
              
              <button
                type="button"
                className="text-white/20 hover:text-[#5fad86] text-[9px] font-black transition-all uppercase tracking-[0.4em] flex items-center justify-center gap-3 group"
                onClick={() => setIsLogin(!isLogin)}
              >
                <div className="h-[1px] w-4 bg-white/5 group-hover:bg-[#5fad86]/20" />
                {isLogin ? "РЕГИСТРАЦИЯ" : "ВХОД В ТЕРМИНАЛ"}
                <div className="h-[1px] w-4 bg-white/5 group-hover:bg-[#5fad86]/20" />
              </button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
