
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { registerTenant } from '@/lib/actions/auth';
import { Shield, Terminal, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PortalPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (isLogin) {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('ОШИБКА АВТОРИЗАЦИИ: НЕВЕРНЫЕ ДАННЫЕ');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } else {
      const result = await registerTenant(formData);
      if (result.error) {
        setError(result.error.toUpperCase());
      } else {
        setSuccess('ТЕНАНТ УСПЕШНО СОЗДАН. ВОЙДИТЕ.');
        setIsLogin(true);
      }
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-grid">
      <div className="w-full max-w-sm ui-card p-8 bg-black/60 backdrop-blur-md">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
            <Shield className="w-4 h-4 text-black" />
          </div>
          <h1 className="text-sm font-black uppercase tracking-[0.3em]">Web3CyberServices</h1>
        </div>

        <div className="technical-label mb-6 text-center">
          {isLogin ? 'ВХОД В ПОРТАЛ УПРАВЛЕНИЯ' : 'РЕГИСТРАЦИЯ НОВОГО ТЕНАНТА'}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[9px] font-mono text-muted-foreground uppercase">EMAIL_ADDRESS</label>
            <input
              name="email"
              type="email"
              required
              className="w-full bg-white/5 border border-white/10 p-2 text-[11px] font-mono focus:border-blue-500 outline-none transition-colors"
              placeholder="root@enterprise.com"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-mono text-muted-foreground uppercase">ACCESS_KEY</label>
            <input
              name="password"
              type="password"
              required
              className="w-full bg-white/5 border border-white/10 p-2 text-[11px] font-mono focus:border-blue-500 outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-[9px] font-mono bg-red-500/5 p-2 border border-red-500/20">
              <AlertCircle className="w-3 h-3" /> {error}
            </div>
          )}
          
          {success && (
            <div className="flex items-center gap-2 text-green-500 text-[9px] font-mono bg-green-500/5 p-2 border border-green-500/20">
              <CheckCircle2 className="w-3 h-3" /> {success}
            </div>
          )}

          <button type="submit" className="w-full btn-enterprise py-3">
            {isLogin ? 'АВТОРИЗОВАТЬСЯ' : 'СОЗДАТЬ АККАУНТ'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-white/5 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-white transition-colors"
          >
            {isLogin ? 'НУЖЕН ДОСТУП? РЕГИСТРАЦИЯ' : 'УЖЕ ЕСТЬ ТЕНАНТ? ВХОД'}
          </button>
        </div>
      </div>
    </div>
  );
}
