'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { vpnLogin, vpnRegister } from '@/actions/vpn-actions';
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
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-black/10 blur-[180px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-white/5 blur-[150px] rounded-full" />
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
        className="w-full max-w-[400px] relative z-10"
      >
        <Card className="glass-panel rounded-[3.5rem] border-white/5 overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)]">
          <CardHeader className="space-y-6 text-center pt-12 pb-6">
            <div className="flex justify-center relative">
              <motion.div 
                animate={{ 
                  filter: [
                    'drop-shadow(0 0 15px rgba(95, 173, 134, 0.2))',
                    'drop-shadow(0 0 35px rgba(95, 173, 134, 0.4))',
                    'drop-shadow(0 0 15px rgba(95, 173, 134, 0.2))'
                  ]
                }}
                transition={{ duration: 5, repeat: Infinity }}
                className="relative w-40 h-40"
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
            
            <div className="space-y-3">
              <CardTitle className="brand-title text-2xl justify-center text-white tracking-[0.7em]">
                CYBER<span className="text-[#5fad86]">ARMOR</span>
              </CardTitle>
              <p className="text-[10px] font-black tracking-[0.5em] uppercase text-white/90">ПРИВАТНЫЙ ТЕРМИНАЛ</p>
            </div>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 px-10 pb-6">
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                  <User className="w-4 h-4 text-[#5fad86] opacity-60 group-focus-within:opacity-100 transition-opacity" />
                </div>
                <Input
                  name="username"
                  placeholder="ЛОГИН"
                  required
                  autoComplete="username"
                  className="h-14 pl-12 bg-black/60 border-white/5 rounded-[1.25rem] text-[#5fad86] placeholder:text-[#5fad86] focus:border-[#5fad86]/30 focus:ring-0 outline-none transition-all font-black tracking-[0.2em] text-[11px]"
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
                  className="h-14 pl-12 bg-black/60 border-white/5 rounded-[1.25rem] text-[#5fad86] placeholder:text-[#5fad86] focus:border-[#5fad86]/30 focus:ring-0 outline-none transition-all font-black tracking-[0.2em] text-[11px]"
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-8 px-10 pb-12">
              <Button 
                type="submit" 
                className="w-full h-14 btn-cyber-primary rounded-[1.25rem] text-[11px]"
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
                className="text-white hover:text-white/80 text-[10px] font-black transition-all uppercase tracking-[0.4em] flex items-center justify-center gap-3 group"
                onClick={() => setIsLogin(!isLogin)}
              >
                <div className="h-[1px] w-6 bg-white/20 group-hover:w-8 transition-all" />
                {isLogin ? "РЕГИСТРАЦИЯ" : "ВХОД В ТЕРМИНАЛ"}
                <div className="h-[1px] w-6 bg-white/20 group-hover:w-8 transition-all" />
              </button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
