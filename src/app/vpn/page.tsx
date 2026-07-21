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
      <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-black/10 blur-[150px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-cyan-900/20 blur-[150px] rounded-full" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-sm relative z-10"
      >
        <Card className="glass-panel rounded-[2.5rem] border-white/5 overflow-hidden shadow-2xl">
          <CardHeader className="space-y-6 text-center pt-10 pb-6">
            <div className="flex justify-center relative">
              <div className="absolute inset-0 bg-cyan-400/10 blur-2xl rounded-full scale-125" />
              <div className="relative w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg border border-white/10">
                <Shield className="w-10 h-10 text-white" />
              </div>
            </div>
            
            <div className="space-y-2">
              <CardTitle className="brand-title text-2xl justify-center text-white">
                CYBER<span className="text-cyan-400">ARMOR</span>
              </CardTitle>
              <div className="flex items-center justify-center space-x-2 text-white/20">
                <div className="h-[1px] w-4 bg-white/5" />
                <p className="text-[9px] font-black tracking-[0.4em] uppercase">Private Terminal</p>
                <div className="h-[1px] w-4 bg-white/5" />
              </div>
            </div>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5 px-8 md:px-10">
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within:text-cyan-400 transition-colors" />
                <Input
                  name="username"
                  placeholder="USERNAME"
                  required
                  autoComplete="username"
                  className="h-14 pl-12 bg-black/40 border-white/5 rounded-2xl text-white placeholder:text-white/10 focus:border-cyan-400/20 outline-none transition-all font-bold tracking-widest text-sm shadow-inner"
                />
              </div>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within:text-cyan-400 transition-colors" />
                <Input
                  name="password"
                  type="password"
                  placeholder="PASSWORD"
                  required
                  autoComplete="current-password"
                  className="h-14 pl-12 bg-black/40 border-white/5 rounded-2xl text-white placeholder:text-white/10 focus:border-cyan-400/20 outline-none transition-all font-bold tracking-widest text-sm shadow-inner"
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-6 px-8 md:px-10 pb-12 pt-6">
              <Button 
                type="submit" 
                className="w-full h-14 bg-[#5fad86] hover:bg-[#5fad86]/90 text-[#0a1410] font-black rounded-2xl shadow-xl transition-all active:scale-95 text-sm tracking-[0.1em] uppercase cyber-button"
                disabled={loading}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-[#0a1410]/20 border-t-[#0a1410] rounded-full animate-spin" />
                ) : isLogin ? (
                  <><LogIn className="w-4 h-4 mr-2"/> Access</>
                ) : (
                  <><UserPlus className="w-4 h-4 mr-2"/> Create</>
                )}
              </Button>
              
              <button
                type="button"
                className="text-white/20 hover:text-cyan-400 text-[9px] font-black transition-all uppercase tracking-[0.3em] flex items-center justify-center gap-2 group"
                onClick={() => setIsLogin(!isLogin)}
              >
                <div className="h-[1px] w-3 bg-white/5 group-hover:bg-cyan-400/20" />
                {isLogin ? "New Identity" : "Terminal Login"}
                <div className="h-[1px] w-3 bg-white/5 group-hover:bg-cyan-400/20" />
              </button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
