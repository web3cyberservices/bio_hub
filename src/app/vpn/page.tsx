'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { vpnLogin, vpnRegister } from '@/actions/vpn-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Shield, UserPlus, LogIn, Lock, User, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse delay-700" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="glass-panel rounded-[2.5rem] overflow-hidden border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <CardHeader className="space-y-6 text-center pt-12 pb-8">
            <div className="mx-auto relative">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-[0_10px_30px_rgba(6,182,212,0.3)] rotate-3">
                <Shield className="w-10 h-10 text-white -rotate-3" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 w-6 h-6 rounded-full border-4 border-[#02040a] flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
              </div>
            </div>
            
            <div className="space-y-2">
              <CardTitle className="text-4xl font-black tracking-tight text-white uppercase italic">
                VPN <span className="text-cyan-400">PRO</span>
              </CardTitle>
              <div className="flex items-center justify-center space-x-2 text-slate-500">
                <Globe className="w-3 h-3" />
                <p className="text-[10px] font-bold tracking-[0.3em] uppercase">Premium Network Access</p>
              </div>
            </div>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5 px-10">
              <div className="space-y-2">
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                  <Input
                    name="username"
                    placeholder="Username"
                    required
                    className="h-14 pl-12 bg-white/5 border-white/5 rounded-2xl text-white placeholder:text-slate-600 focus:bg-white/10 focus:border-cyan-500/50 transition-all outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                  <Input
                    name="password"
                    type="password"
                    placeholder="Password"
                    required
                    className="h-14 pl-12 bg-white/5 border-white/5 rounded-2xl text-white placeholder:text-slate-600 focus:bg-white/10 focus:border-cyan-500/50 transition-all outline-none"
                  />
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-6 px-10 pb-12 pt-6">
              <Button 
                type="submit" 
                className="w-full h-14 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-2xl shadow-lg shadow-cyan-950 transition-all cyber-button"
                disabled={loading}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : isLogin ? (
                  <><LogIn className="w-4 h-4 mr-2"/> Connect to Network</>
                ) : (
                  <><UserPlus className="w-4 h-4 mr-2"/> Initialize Account</>
                )}
              </Button>
              
              <button
                type="button"
                className="text-slate-500 hover:text-cyan-400 text-xs font-bold transition-colors uppercase tracking-[0.2em]"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? "New user? Create Access" : "Have access? Secure Login"}
              </button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}