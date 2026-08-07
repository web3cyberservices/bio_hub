
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { registerTenant } from '@/lib/actions/auth';
import { AlertCircle, CheckCircle2, Loader2, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function PortalPage() {
  const [mode, setMode] = useState<'auth' | 'provision'>('auth');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (mode === 'auth') {
      try {
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          setError('Ошибка авторизации: неверные учетные данные');
          setLoading(false);
        } else {
          router.push('/dashboard');
          setTimeout(() => {
            router.refresh();
          }, 500);
        }
      } catch (err) {
        setError('Ошибка сетевого шлюза (Error code: 502)');
        setLoading(false);
      }
    } else {
      try {
        const result = await registerTenant(formData);
        if (result.error) {
          setError(result.error);
          setLoading(false);
        } else {
          setSuccess('Профиль тенанта создан. Требуется авторизация.');
          setMode('auth');
          setLoading(false);
        }
      } catch (err) {
        setError('Ошибка регистрации в системе');
        setLoading(false);
      }
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-grid">
      <div className="w-full max-sm border border-white/10 bg-black p-8 rounded-sm">
        <div className="flex flex-col items-center gap-4 mb-8">
          <Image 
            src="/512logo.png" 
            alt="Web3CyberServices Logo" 
            width={48} 
            height={48} 
            className="rounded-sm opacity-90"
          />
          <h1 className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Provision Portal</h1>
        </div>

        <div className="text-[9px] font-mono text-blue-500 mb-8 text-center tracking-widest flex items-center justify-center gap-2">
          <Lock className="w-3 h-3" /> {mode === 'auth' ? 'System Auth Required' : 'New Tenant Provisioning'}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[9px] font-mono text-muted-foreground tracking-widest">Email Identifier</label>
            <input
              name="email"
              type="email"
              required
              className="w-full bg-white/5 border border-white/10 p-3 text-[11px] font-mono text-white focus:border-blue-500 outline-none transition-all"
              placeholder="admin@corp.internal"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-mono text-muted-foreground tracking-widest">Access Credentials</label>
            <input
              name="password"
              type="password"
              required
              className="w-full bg-white/5 border border-white/10 p-3 text-[11px] font-mono text-white focus:border-blue-500 outline-none transition-all"
              placeholder="••••••••••••"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-[9px] font-mono bg-red-500/5 p-3 border border-red-500/20">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
            </div>
          )}
          
          {success && (
            <div className="flex items-center gap-2 text-green-500 text-[9px] font-mono bg-green-500/5 p-3 border border-green-500/20">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> {success}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-enterprise py-4 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              mode === 'auth' ? 'Авторизоваться' : 'Зарегистрироваться'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <button
            onClick={() => {
              setMode(mode === 'auth' ? 'provision' : 'auth');
              setError('');
              setSuccess('');
            }}
            className="text-[9px] font-black tracking-[0.2em] text-muted-foreground hover:text-white transition-colors"
          >
            {mode === 'auth' ? '[ New Enrollment ]' : '[ Return to Login ]'}
          </button>
        </div>
      </div>
    </div>
  );
}
