'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Mic, Upload, Sparkles, X, Loader2, Activity, FlaskConical, Stethoscope, CheckCircle2, Watch, Smartphone, Bluetooth } from 'lucide-react';
import { analyzeMeal, AnalyzeMealOutput } from '@/ai/flows/analyze-meal';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface UnifiedDataEntryProps {
  children: React.ReactNode;
}

export function UnifiedDataEntry({ children }: UnifiedDataEntryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('meal');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [mealResult, setMealResult] = useState<AnalyzeMealOutput | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [connectingDevice, setConnectingDevice] = useState<string | null>(null);
  
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

  const connectDevice = async (name: string) => {
    setConnectingDevice(name);
    await new Promise(r => setTimeout(r, 2000));
    setConnectingDevice(null);
    toast({
      title: 'Устройство подключено',
      description: `${name} теперь синхронизируется с PRO Себя.`,
    });
  };

  const handleSubmit = async () => {
    if (!description && !image) {
      toast({
        variant: 'destructive',
        title: 'Пустое поле',
        description: 'Пожалуйста, добавьте текст или фото.',
      });
      return;
    }

    setLoading(true);
    try {
      if (activeTab === 'meal') {
        const result = await analyzeMeal({
          description,
          photoDataUri: image || undefined,
        });
        setMealResult(result);
      } else {
        await new Promise(r => setTimeout(r, 1500));
        setIsSuccess(true);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Не удалось обработать данные.',
      });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setDescription('');
    setImage(null);
    setMealResult(null);
    setIsSuccess(false);
    setHasCameraPermission(null);
    stopCamera();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) reset();
    }}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px] rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-10 bg-primary text-white">
          <DialogTitle className="text-3xl font-black tracking-tight">Центр данных</DialogTitle>
        </DialogHeader>
        
        <div className="p-8 space-y-6 max-h-[80vh] overflow-y-auto no-scrollbar">
          {!mealResult && !isSuccess ? (
            <>
              <Tabs defaultValue="meal" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 rounded-2xl h-14 bg-muted/50 p-1">
                  <TabsTrigger value="meal" className="rounded-xl font-bold gap-2 text-[11px]"><Activity className="h-4 w-4" /> Еда</TabsTrigger>
                  <TabsTrigger value="labs" className="rounded-xl font-bold gap-2 text-[11px]"><FlaskConical className="h-4 w-4" /> Анализы</TabsTrigger>
                  <TabsTrigger value="health" className="rounded-xl font-bold gap-2 text-[11px]"><Stethoscope className="h-4 w-4" /> Жалобы</TabsTrigger>
                  <TabsTrigger value="devices" className="rounded-xl font-bold gap-2 text-[11px]"><Watch className="h-4 w-4" /> Устройства</TabsTrigger>
                </TabsList>
                
                <TabsContent value="devices" className="mt-8 space-y-6 animate-in fade-in duration-300">
                  <div className="text-center space-y-2 mb-8">
                    <h4 className="text-xl font-black">Подключите ваши девайсы</h4>
                    <p className="text-sm text-muted-foreground font-medium">Для автоматического учета активности, пульса и сна</p>
                  </div>
                  
                  <div className="grid gap-4">
                    {[
                      { name: 'Apple Health', icon: Smartphone, color: 'bg-red-50 text-red-500' },
                      { name: 'Google Fit', icon: Activity, color: 'bg-blue-50 text-blue-500' },
                      { name: 'Garmin Connect', icon: Bluetooth, color: 'bg-blue-100 text-blue-800' },
                      { name: 'Oura Ring', icon: Watch, color: 'bg-neutral-100 text-neutral-800' }
                    ].map((device) => (
                      <div key={device.name} className="flex items-center justify-between p-5 rounded-3xl bg-white border border-muted hover:border-primary/30 transition-all group">
                        <div className="flex items-center gap-4">
                          <div className={cn("p-3 rounded-2xl", device.color)}>
                            <device.icon className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="font-bold text-lg">{device.name}</p>
                            <p className="text-xs text-muted-foreground">Синхронизация данных</p>
                          </div>
                        </div>
                        <Button 
                          variant={connectingDevice === device.name ? "ghost" : "outline"} 
                          className="rounded-xl font-bold px-6 border-2"
                          onClick={() => connectDevice(device.name)}
                          disabled={!!connectingDevice}
                        >
                          {connectingDevice === device.name ? <Loader2 className="h-4 w-4 animate-spin" /> : "Привязать"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="meal" className="mt-8 space-y-6">
                  <div className="relative">
                    <Textarea
                      placeholder="Что вы съели сегодня?"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="min-h-[150px] rounded-3xl bg-muted/30 border-none p-6 text-lg font-medium resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="h-28 rounded-[2rem] border-dashed border-2 flex flex-col gap-2" onClick={startCamera}>
                      <Camera className="h-8 w-8 text-primary" />
                      <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Камера</span>
                    </Button>
                    <label className="cursor-pointer">
                      <div className="h-28 rounded-[2rem] border-dashed border-2 flex flex-col gap-2 items-center justify-center">
                        <Upload className="h-8 w-8 text-primary" />
                        <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Загрузить</span>
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                    </label>
                  </div>
                  {showCamera && (
                    <div className="relative rounded-[2.5rem] overflow-hidden bg-black aspect-video">
                      <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
                        <Button onClick={capturePhoto} className="rounded-full w-14 h-14 bg-white text-primary"><Camera className="h-7 w-7" /></Button>
                        <Button onClick={stopCamera} variant="destructive" className="rounded-full w-14 h-14"><X className="h-7 w-7" /></Button>
                      </div>
                      {hasCameraPermission === false && (
                        <div className="absolute inset-0 flex items-center justify-center p-4 bg-black/80">
                           <Alert variant="destructive" className="border-none bg-transparent">
                              <AlertTitle className="text-white">Ошибка камеры</AlertTitle>
                              <AlertDescription className="text-white/80">Пожалуйста, разрешите доступ к камере в настройках.</AlertDescription>
                           </Alert>
                        </div>
                      )}
                    </div>
                  )}
                  {image && !showCamera && (
                    <img src={image} className="rounded-[2.5rem] w-full aspect-video object-cover" />
                  )}
                  <Button className="w-full h-20 rounded-[1.75rem] text-2xl font-black bg-primary" onClick={handleSubmit} disabled={loading}>
                    {loading ? <Loader2 className="mr-3 h-8 w-8 animate-spin" /> : <Sparkles className="mr-3 h-8 w-8" />}
                    Проанализировать
                  </Button>
                </TabsContent>

                <TabsContent value="labs" className="mt-8 space-y-6">
                  <Textarea placeholder="Введите результаты анализов (текстом или приложите фото)..." value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[150px] rounded-3xl bg-muted/30 border-none p-6" />
                  <Button className="w-full h-20 rounded-[1.75rem] text-2xl font-black bg-primary" onClick={handleSubmit} disabled={loading}>Сохранить</Button>
                </TabsContent>
                <TabsContent value="health" className="mt-8 space-y-6">
                  <Textarea placeholder="Опишите ваши жалобы или медицинские условия..." value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[150px] rounded-3xl bg-muted/30 border-none p-6" />
                  <Button className="w-full h-20 rounded-[1.75rem] text-2xl font-black bg-primary" onClick={handleSubmit} disabled={loading}>Отправить ИИ</Button>
                </TabsContent>
              </Tabs>
            </>
          ) : mealResult ? (
            <div className="space-y-8 animate-in fade-in duration-500">
               <div className="text-center space-y-2">
                <Badge className="bg-primary/10 text-primary border-none px-6 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px]">ИИ Проанализировал</Badge>
                <h3 className="text-4xl font-black tracking-tight">{mealResult.mealName}</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 {[
                   { label: 'Ккал', val: mealResult.calories, unit: '', bg: 'bg-primary/5' },
                   { label: 'Белки', val: mealResult.protein, unit: 'г', bg: 'bg-secondary/10' },
                   { label: 'Жиры', val: mealResult.fat, unit: 'г', bg: 'bg-accent/20' },
                   { label: 'Углеводы', val: mealResult.carbs, unit: 'г', bg: 'bg-muted' }
                 ].map((stat, i) => (
                   <div key={i} className={cn("p-6 rounded-[2rem] flex flex-col items-center justify-center text-center", stat.bg)}>
                     <p className="text-3xl font-black">{stat.val}{stat.unit}</p>
                     <p className="text-[11px] font-bold uppercase tracking-widest opacity-70">{stat.label}</p>
                   </div>
                 ))}
              </div>
              <div className="bg-muted/30 p-6 rounded-[2rem]">
                <p className="text-sm font-medium italic text-foreground/80 leading-relaxed">
                  "{mealResult.analysis}"
                </p>
              </div>
              <Button className="w-full h-18 rounded-2xl font-black text-xl" onClick={reset}>Закрыть</Button>
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center text-center space-y-6 animate-in zoom-in duration-500">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-3xl font-black">Данные обновлены!</h3>
              <p className="text-muted-foreground font-medium">Ваши показатели успешно сохранены и будут учтены ИИ.</p>
              <Button className="w-64 h-16 rounded-2xl font-bold text-lg" onClick={reset}>Понятно</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
