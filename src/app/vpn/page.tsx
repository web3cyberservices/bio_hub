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
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-black/10 blur-[150px] rounded-full" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-cyan-900/20 blur-[150px] rounded-full" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="glass-panel rounded-[3rem] border-white/5 overflow-hidden">
          <CardHeader className="space-y-6 text-center pt-14 pb-8">
            <div className="flex justify-center">
              <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-blue-700 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-black/40 border border-white/10">
                <Shield className="w-12 h-12 text-white" />
              </div>
            </div>
            
            <div className="space-y-3">
              <CardTitle className="brand-title text-4xl justify-center text-white">
                CYBER<span className="text-cyan-400">ARMOR</span>
              </CardTitle>
              <div className="flex items-center justify-center space-x-2 text-white/40">
                <Globe className="w-3 h-3" />
                <p className="text-[9px] font-black tracking-[0.5em] uppercase">Private Security Infrastructure</p>
              </div>
            </div>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6 px-10">
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-cyan-400 transition-colors" />
                <Input
                  name="username"
                  placeholder="USERNAME"
                  required
                  autoComplete="username"
                  className="h-16 pl-14 bg-black/40 border-white/5 rounded-2xl text-white placeholder:text-white/20 focus:bg-black/60 outline-none transition-all font-bold tracking-wider"
                />
              </div>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-cyan-400 transition-colors" />
                <Input
                  name="password"
                  type="password"
                  placeholder="PASSWORD"
                  required
                  autoComplete="current-password"
                  className="h-16 pl-14 bg-black/40 border-white/5 rounded-2xl text-white placeholder:text-white/20 focus:bg-black/60 outline-none transition-all font-bold tracking-wider"
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-8 px-10 pb-16 pt-8">
              <Button 
                type="submit" 
                className="w-full h-16 bg-[#5fad86] hover:bg-[#5fad86]/90 text-black font-black rounded-2xl shadow-xl shadow-black/40 transition-all active:scale-95 text-sm tracking-widest uppercase"
                disabled={loading}
              >
                {loading ? (
                  <div className="w-6 h-6 border-3 border-black/30 border-t-black rounded-full animate-spin" />
                ) : isLogin ? (
                  <><LogIn className="w-5 h-5 mr-3"/> Access Terminal</>
                ) : (
                  <><UserPlus className="w-5 h-5 mr-3"/> Create Identity</>
                )}
              </Button>
              
              <button
                type="button"
                className="text-white/40 hover:text-cyan-400 text-[10px] font-black transition-colors uppercase tracking-[0.3em]"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? "No Access? Register Identity" : "Identity Exists? Return"}
              </button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
