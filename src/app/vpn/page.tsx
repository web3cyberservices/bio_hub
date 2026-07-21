'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { vpnLogin, vpnRegister } from '@/actions/vpn-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Shield, UserPlus, LogIn, Lock, User, Globe, Zap } from 'lucide-react';
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
    <div className="min-h-screen bg-[#5fad86] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Premium Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-black/20 blur-[180px] rounded-full" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-cyan-950/30 blur-[180px] rounded-full" />
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="glass-panel rounded-[3.5rem] border-white/10 overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]">
          <CardHeader className="space-y-8 text-center pt-16 pb-8">
            <div className="flex justify-center relative">
              <div className="absolute inset-0 bg-cyan-400/20 blur-3xl rounded-full scale-150 animate-pulse" />
              <div className="relative w-28 h-28 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-[2.5rem] flex items-center justify-center shadow-[0_0_50px_rgba(34,211,238,0.4)] border border-white/20">
                <Shield className="w-14 h-14 text-white" />
              </div>
            </div>
            
            <div className="space-y-4">
              <CardTitle className="brand-title text-4xl justify-center text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                CYBER<span className="text-cyan-400">ARMOR</span>
              </CardTitle>
              <div className="flex items-center justify-center space-x-3 text-white/40">
                <div className="h-[1px] w-8 bg-white/10" />
                <p className="text-[10px] font-black tracking-[0.6em] uppercase">Private Security</p>
                <div className="h-[1px] w-8 bg-white/10" />
              </div>
            </div>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-7 px-12">
              <div className="relative group">
                <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-cyan-400 transition-colors" />
                <Input
                  name="username"
                  placeholder="USERNAME"
                  required
                  autoComplete="username"
                  className="h-18 pl-16 bg-black/60 border-white/5 rounded-3xl text-white placeholder:text-white/10 focus:border-cyan-400/30 outline-none transition-all font-bold tracking-widest text-base shadow-inner"
                />
              </div>
              <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-cyan-400 transition-colors" />
                <Input
                  name="password"
                  type="password"
                  placeholder="PASSWORD"
                  required
                  autoComplete="current-password"
                  className="h-18 pl-16 bg-black/60 border-white/5 rounded-3xl text-white placeholder:text-white/10 focus:border-cyan-400/30 outline-none transition-all font-bold tracking-widest text-base shadow-inner"
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-10 px-12 pb-20 pt-10">
              <Button 
                type="submit" 
                className="w-full h-18 bg-[#5fad86] hover:bg-[#5fad86]/90 text-[#0a1410] font-black rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.4)] hover:shadow-[0_20px_50px_rgba(95,173,134,0.3)] transition-all active:scale-95 text-base tracking-[0.2em] uppercase cyber-button"
                disabled={loading}
              >
                {loading ? (
                  <div className="w-7 h-7 border-4 border-[#0a1410]/20 border-t-[#0a1410] rounded-full animate-spin" />
                ) : isLogin ? (
                  <><LogIn className="w-5 h-5 mr-4"/> Access Terminal</>
                ) : (
                  <><UserPlus className="w-5 h-5 mr-4"/> Create Identity</>
                )}
              </Button>
              
              <button
                type="button"
                className="text-white/30 hover:text-cyan-400 text-[11px] font-black transition-all uppercase tracking-[0.4em] group flex items-center justify-center gap-2"
                onClick={() => setIsLogin(!isLogin)}
              >
                <div className="h-[1px] w-4 bg-white/10 group-hover:bg-cyan-400/30 transition-colors" />
                {isLogin ? "Register Identity" : "Return to Terminal"}
                <div className="h-[1px] w-4 bg-white/10 group-hover:bg-cyan-400/30 transition-colors" />
              </button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
