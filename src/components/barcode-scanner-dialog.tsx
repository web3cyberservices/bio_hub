
'use client';

import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScanBarcode, Camera, X, Loader2, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { analyzeMeal } from '@/ai/flows/analyze-meal';
import { Badge } from '@/components/ui/badge';

interface BarcodeScannerDialogProps {
  onScan: (product: { name: string; calories: number; protein: number; fat: number; carbs: number }) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BarcodeScannerDialog({ onScan, open, onOpenChange }: BarcodeScannerDialogProps) {
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const startCamera = async () => {
    setScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Ошибка камеры', description: 'Разрешите доступ к камере.' });
      setScanning(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setScanning(false);
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current) return;

    setLoading(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      const dataUri = canvas.toDataURL('image/jpeg');

      // Используем ИИ для "чтения" продукта со штрих-кода или упаковки
      const analysis = await analyzeMeal({
        description: "Identify this product from barcode or label and provide its Kcal and Macros per 100g",
        photoDataUri: dataUri
      });

      setResult(analysis);
      stopCamera();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Ошибка сканирования', description: 'Не удалось распознать штрих-код.' });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (result) {
      onScan({
        name: result.mealName,
        calories: result.calories,
        protein: result.protein,
        fat: result.fat,
        carbs: result.carbs
      });
      onOpenChange(false);
      setResult(null);
    }
  };

  useEffect(() => {
    if (open && !result) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl z-[1100]">
        <DialogHeader className="p-6 bg-primary text-white">
          <DialogTitle className="text-xl font-black flex items-center gap-2">
            <ScanBarcode className="h-6 w-6" /> Сканер штрих-кодов
          </DialogTitle>
        </DialogHeader>

        <div className="p-8 space-y-6">
          {scanning ? (
            <div className="relative rounded-3xl overflow-hidden bg-black aspect-square shadow-2xl">
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover opacity-80" />
              <div className="absolute inset-0 border-[3px] border-primary/50 m-12 rounded-2xl animate-pulse" />
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-bounce" />
              <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                <Button onClick={captureAndAnalyze} disabled={loading} className="rounded-full h-16 w-16 bg-white text-primary hover:bg-white/90 shadow-xl border-4 border-primary/20">
                  {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : <Camera className="h-8 w-8" />}
                </Button>
              </div>
            </div>
          ) : result ? (
            <div className="space-y-6 animate-in zoom-in-95 duration-300">
              <div className="text-center space-y-2">
                <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black uppercase px-3">Продукт распознан</Badge>
                <h3 className="text-2xl font-black">{result.mealName}</h3>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { l: 'Ккал', v: result.calories, c: 'bg-primary/5' },
                  { l: 'Б', v: result.protein, c: 'bg-orange-50' },
                  { l: 'Ж', v: result.fat, c: 'bg-yellow-50' },
                  { l: 'У', v: result.carbs, c: 'bg-indigo-50' }
                ].map((stat, i) => (
                  <div key={i} className={`${stat.c} p-3 rounded-2xl text-center`}>
                    <p className="text-lg font-black leading-none">{stat.v}</p>
                    <p className="text-[7px] font-black uppercase text-muted-foreground mt-1">{stat.l}</p>
                  </div>
                ))}
              </div>
              <div className="bg-muted/30 p-4 rounded-2xl text-xs italic text-muted-foreground">
                <AlertCircle className="h-3 w-3 inline mr-1 -mt-0.5" />
                Данные рассчитаны ИИ на основе визуального анализа упаковки.
              </div>
            </div>
          ) : (
            <div className="py-20 text-center space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto opacity-20" />
              <p className="font-black uppercase text-[10px] tracking-widest text-muted-foreground">Инициализация сканера...</p>
            </div>
          )}
        </div>

        <DialogFooter className="p-6 bg-muted/20 gap-3">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl font-bold">Отмена</Button>
          {result && (
            <Button onClick={handleConfirm} className="rounded-xl bg-primary px-8 font-black shadow-lg">
              <CheckCircle2 className="h-4 w-4 mr-2" /> Добавить в список
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
