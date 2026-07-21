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
    <div className="min-h-screen bg-[#02040a] flex flex-col items-center justify-center p-6">
      {/* Background Decor */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="glass-card border-white/5 shadow-2xl overflow-hidden rounded-[2rem]">
          <CardHeader className="space-y-4 text-center pt-10 pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-3xl font-black tracking-tight text-white uppercase italic">
                VPN <span className="text-cyan-400">PRO</span>
              </CardTitle>
              <p className="text-slate-500 text-[10px] font-bold tracking-[0.3em] uppercase mt-1">
                Secure Enterprise Tunneling
              </p>
            </div>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 px-8">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  name="username"
                  placeholder="Username"
                  required
                  className="h-14 pl-12 bg-black/20 border-white/5 rounded-xl text-white placeholder:text-slate-600 focus:border-cyan-500/50 transition-all"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  name="password"
                  type="password"
                  placeholder="Password"
                  required
                  className="h-14 pl-12 bg-black/20 border-white/5 rounded-xl text-white placeholder:text-slate-600 focus:border-cyan-500/50 transition-all"
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4 px-8 pb-10 pt-4">
              <Button 
                type="submit" 
                className="w-full h-14 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-xl shadow-cyan-500/10 transition-all active:scale-95"
                disabled={loading}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : isLogin ? (
                  <><LogIn className="w-4 h-4 mr-2"/> Login to Secure</>
                ) : (
                  <><UserPlus className="w-4 h-4 mr-2"/> Create Account</>
                )}
              </Button>
              <button
                type="button"
                className="text-slate-500 hover:text-cyan-400 text-xs font-bold transition-colors uppercase tracking-widest"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
              </button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}