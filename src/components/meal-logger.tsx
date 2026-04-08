'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Camera, Upload, Send, Loader2, Sparkles, X, Beef, Wheat, Droplets, Activity } from 'lucide-react';
import { analyzeMeal, AnalyzeMealOutput } from '@/ai/flows/analyze-meal';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export function MealLogger() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeMealOutput | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setShowCamera(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setHasCameraPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Доступ к камере отклонен',
        description: 'Пожалуйста, разрешите доступ к камере в настройках браузера.',
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        setImage(canvas.toDataURL('image/jpeg'));
        stopCamera();
      }
    }
  };

  const handleSubmit = async () => {
    if (!description && !image) {
      toast({
        variant: 'destructive',
        title: 'Данные не введены',
        description: 'Опишите еду текстом или добавьте фото.',
      });
      return;
    }

    setLoading(true);
    try {
      const analysis = await analyzeMeal({
        description,
        photoDataUri: image || undefined,
      });
      setResult(analysis);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка анализа',
        description: 'Не удалось проанализировать блюдо. Попробуйте еще раз.',
      });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setDescription('');
    setImage(null);
    setResult(null);
    stopCamera();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) reset();
    }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="w-14 h-14 rounded-2xl bg-primary/10 text-primary hover:bg-primary/20 transition-all">
          <Camera className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-8 bg-primary text-white">
          <DialogTitle className="text-2xl font-black">Добавить прием пищи</DialogTitle>
        </DialogHeader>
        <div className="p-8 space-y-6 max-h-[80vh] overflow-y-auto no-scrollbar">
          {!result ? (
            <>
              <div className="space-y-4">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Описание или фото</label>
                <Input
                  placeholder="Что вы съели? Например: Омлет из 2 яиц с сыром"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-14 rounded-2xl bg-muted/30 border-none font-medium"
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="h-24 rounded-2xl border-dashed border-2 flex flex-col gap-2 hover:bg-primary/5 hover:border-primary/50 transition-all"
                    onClick={startCamera}
                  >
                    <Camera className="h-6 w-6 text-primary" />
                    <span className="text-xs font-bold uppercase">Камера</span>
                  </Button>
                  <label className="cursor-pointer">
                    <div className="h-24 rounded-2xl border-dashed border-2 flex flex-col gap-2 items-center justify-center hover:bg-primary/5 hover:border-primary/50 transition-all">
                      <Upload className="h-6 w-6 text-primary" />
                      <span className="text-xs font-bold uppercase">Загрузить</span>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>

                {showCamera && (
                  <div className="relative rounded-2xl overflow-hidden bg-black aspect-video">
                    <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                      <Button onClick={capturePhoto} className="rounded-full w-12 h-12 bg-white text-primary hover:bg-white/90">
                        <Camera className="h-6 w-6" />
                      </Button>
                      <Button onClick={stopCamera} variant="destructive" className="rounded-full w-12 h-12">
                        <X className="h-6 w-6" />
                      </Button>
                    </div>
                    {hasCameraPermission === false && (
                      <div className="absolute inset-0 flex items-center justify-center p-4 bg-black/80">
                         <Alert variant="destructive" className="border-none bg-transparent">
                            <AlertTitle className="text-white">Ошибка камеры</AlertTitle>
                            <AlertDescription className="text-white/80">Пожалуйста, разрешите доступ к камере.</AlertDescription>
                         </Alert>
                      </div>
                    )}
                  </div>
                )}

                {image && !showCamera && (
                  <div className="relative rounded-2xl overflow-hidden group">
                    <img src={image} alt="Preview" className="w-full aspect-video object-cover" />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setImage(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              <Button
                className="w-full h-16 rounded-2xl text-xl font-black bg-primary shadow-xl shadow-primary/20"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    Анализирую...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-6 w-6" />
                    Узнать состав
                  </>
                )}
              </Button>
            </>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center space-y-2">
                <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black uppercase tracking-widest px-4">Распознано ИИ</Badge>
                <h3 className="text-3xl font-black tracking-tight">{result.mealName}</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card className="border-none bg-primary/5 p-4 rounded-3xl flex flex-col items-center justify-center text-center">
                   <Activity className="h-5 w-5 text-primary mb-2" />
                   <p className="text-2xl font-black">{result.calories}</p>
                   <p className="text-[10px] font-bold text-muted-foreground uppercase">Ккал</p>
                </Card>
                <Card className="border-none bg-secondary/10 p-4 rounded-3xl flex flex-col items-center justify-center text-center">
                   <Beef className="h-5 w-5 text-secondary mb-2" />
                   <p className="text-2xl font-black">{result.protein}г</p>
                   <p className="text-[10px] font-bold text-muted-foreground uppercase">Белки</p>
                </Card>
                <Card className="border-none bg-accent/20 p-4 rounded-3xl flex flex-col items-center justify-center text-center">
                   <Droplets className="h-5 w-5 text-accent-foreground mb-2" />
                   <p className="text-2xl font-black">{result.fat}г</p>
                   <p className="text-[10px] font-bold text-muted-foreground uppercase">Жиры</p>
                </Card>
                <Card className="border-none bg-muted p-4 rounded-3xl flex flex-col items-center justify-center text-center">
                   <Wheat className="h-5 w-5 text-muted-foreground mb-2" />
                   <p className="text-2xl font-black">{result.carbs}г</p>
                   <p className="text-[10px] font-bold text-muted-foreground uppercase">Углеводы</p>
                </Card>
              </div>

              <div className="bg-muted/30 p-6 rounded-[2rem]">
                <p className="text-sm font-medium leading-relaxed italic text-foreground/80">
                  "{result.analysis}"
                </p>
              </div>

              <Button variant="outline" className="w-full h-14 rounded-2xl font-bold" onClick={() => setResult(null)}>
                Добавить еще
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
