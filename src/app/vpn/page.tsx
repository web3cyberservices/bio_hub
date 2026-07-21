'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { vpnLogin, vpnRegister } from '@/actions/vpn-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Shield, UserPlus, LogIn, Lock, User, Globe } from 'lucide-react';
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
          description: "Аккаунт создан. Пожалуйста, войдите." 
        });
        setIsLogin(true);
      }
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#02040a] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="bg-[#0f172a]/60 backdrop-blur-3xl border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden">
          <CardHeader className="space-y-6 text-center pt-12 pb-8">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-lg shadow-cyan-500/20 rotate-3">
                <Shield className="w-10 h-10 text-white -rotate-3" />
              </div>
            </div>
            
            <div className="space-y-2">
              <CardTitle className="text-4xl font-black tracking-tight text-white italic uppercase">
                VPN <span className="text-cyan-400">PRO</span>
              </CardTitle>
              <div className="flex items-center justify-center space-x-2 text-slate-500">
                <Globe className="w-3 h-3" />
                <p className="text-[10px] font-bold tracking-[0.3em] uppercase">Премиальный доступ к сети</p>
              </div>
            </div>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5 px-8">
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-cyan-400" />
                <Input
                  name="username"
                  placeholder="Имя пользователя"
                  required
                  className="h-14 pl-12 bg-white/5 border-white/5 rounded-2xl text-white placeholder:text-slate-600 focus:bg-white/10 outline-none transition-all"
                />
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-cyan-400" />
                <Input
                  name="password"
                  type="password"
                  placeholder="Пароль"
                  required
                  className="h-14 pl-12 bg-white/5 border-white/5 rounded-2xl text-white placeholder:text-slate-600 focus:bg-white/10 outline-none transition-all"
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-6 px-8 pb-12 pt-6">
              <Button 
                type="submit" 
                className="w-full h-14 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-2xl cyber-button shadow-lg shadow-cyan-950/40"
                disabled={loading}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : isLogin ? (
                  <><LogIn className="w-4 h-4 mr-2"/> Подключиться к сети</>
                ) : (
                  <><UserPlus className="w-4 h-4 mr-2"/> Создать аккаунт</>
                )}
              </Button>
              
              <button
                type="button"
                className="text-slate-500 hover:text-cyan-400 text-xs font-bold transition-colors uppercase tracking-widest"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? "Новый пользователь? Регистрация" : "Есть доступ? Войти"}
              </button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
