
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X, Smartphone, Zap } from 'lucide-react';

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Скрываем если уже установлено
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsVisible(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[400] w-[90vw] max-w-md animate-in slide-in-from-top-4 duration-500">
      <div className="bg-primary/95 backdrop-blur-xl border border-white/20 p-4 rounded-[2rem] shadow-2xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-950 rounded-xl flex items-center justify-center">
            <Smartphone className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-950 leading-none">Установите BioHub</p>
            <p className="text-[8px] font-bold text-slate-950/60 uppercase tracking-widest mt-1">Работает без интернета</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            onClick={handleInstall}
            className="h-10 px-4 bg-slate-950 text-primary rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-slate-900"
          >
            <Download className="h-3 w-3 mr-2" /> СКАЧАТЬ
          </Button>
          <button 
            onClick={() => setIsVisible(false)}
            className="p-2 text-slate-950/40 hover:text-slate-950"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
