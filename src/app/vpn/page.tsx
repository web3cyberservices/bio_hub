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
        className="w-full max-w-[380px] relative z-10"
      >
        <Card className="glass-panel rounded-[3rem] border-white/5 overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)]">
          <CardHeader className="space-y-6 text-center pt-10 pb-4">
            <div className="flex justify-center relative">
              <motion.div 
                animate={{ 
                  filter: [
                    'drop-shadow(0 0 10px rgba(95, 173, 134, 0.3))',
                    'drop-shadow(0 0 25px rgba(95, 173, 134, 0.5))',
                    'drop-shadow(0 0 10px rgba(95, 173, 134, 0.3))'
                  ]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="relative w-36 h-36"
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
            
            <div className="space-y-2">
              <CardTitle className="brand-title text-xl justify-center text-white tracking-[0.7em]">
                CYBER<span className="text-[#5fad86]">ARMOR</span>
              </CardTitle>
              <p className="text-[8px] font-black tracking-[0.4em] uppercase text-white/25">Terminal Access v2.4</p>
            </div>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-3 px-8 pb-4">
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                  <User className="w-4 h-4 text-[#5fad86]/70 group-focus-within:text-[#5fad86] transition-colors" />
                </div>
                <Input
                  name="username"
                  placeholder="ЛОГИН"
                  required
                  autoComplete="username"
                  className="h-12 pl-11 bg-black/40 border-white/5 rounded-2xl text-[#5fad86] placeholder:text-[#5fad86]/20 focus:border-[#5fad86]/30 focus:ring-0 outline-none transition-all font-black tracking-[0.15em] text-[10px]"
                />
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                  <Lock className="w-4 h-4 text-[#5fad86]/70 group-focus-within:text-[#5fad86] transition-colors" />
                </div>
                <Input
                  name="password"
                  type="password"
                  placeholder="ПАРОЛЬ"
                  required
                  autoComplete="current-password"
                  className="h-12 pl-11 bg-black/40 border-white/5 rounded-2xl text-[#5fad86] placeholder:text-[#5fad86]/20 focus:border-[#5fad86]/30 focus:ring-0 outline-none transition-all font-black tracking-[0.15em] text-[10px]"
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-6 px-8 pb-10">
              <Button 
                type="submit" 
                className="w-full h-12 btn-cyber-primary rounded-2xl text-[10px]"
                disabled={loading}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : isLogin ? (
                  <><LogIn className="w-4 h-4 mr-2"/> Войти</>
                ) : (
                  <><UserPlus className="w-4 h-4 mr-2"/> Создать</>
                )}
              </Button>
              
              <button
                type="button"
                className="text-white/20 hover:text-[#5fad86] text-[8px] font-black transition-all uppercase tracking-[0.3em] flex items-center justify-center gap-2 group"
                onClick={() => setIsLogin(!isLogin)}
              >
                <div className="h-[1px] w-4 bg-white/5" />
                {isLogin ? "РЕГИСТРАЦИЯ" : "ВХОД В ТЕРМИНАЛ"}
                <div className="h-[1px] w-4 bg-white/5" />
              </button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}