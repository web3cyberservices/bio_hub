'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Mic, Upload, Sparkles, X, Loader2, Activity, FlaskConical, Stethoscope, CheckCircle2 } from 'lucide-react';
import { analyzeMeal, AnalyzeMealOutput } from '@/ai/flows/analyze-meal';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

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
  const [isListening, setIsListening] = useState(false);
  const [mealResult, setMealResult] = useState<AnalyzeMealOutput | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  
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
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Доступ к камере отклонен',
        description: 'Пожалуйста, разрешите доступ к камере.',
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

  const toggleVoiceRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({
        variant: 'destructive',
        title: 'Не поддерживается',
        description: 'Ваш браузер не поддерживает голосовой ввод.',
      });
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ru-RU';
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setDescription(prev => prev ? `${prev} ${transcript}` : transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
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
        // Для анализов и заболеваний просто имитируем успех в прототипе
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
      <DialogContent className="sm:max-w-[600px] rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-10 bg-primary text-white">
          <DialogTitle className="text-3xl font-black tracking-tight">Добавить данные</DialogTitle>
        </DialogHeader>
        
        <div className="p-8 space-y-6">
          {!mealResult && !isSuccess ? (
            <>
              <Tabs defaultValue="meal" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 rounded-2xl h-14 bg-muted/50 p-1">
                  <TabsTrigger value="meal" className="rounded-xl font-bold gap-2"><Activity className="h-4 w-4" /> Еда</TabsTrigger>
                  <TabsTrigger value="labs" className="rounded-xl font-bold gap-2"><FlaskConical className="h-4 w-4" /> Анализы</TabsTrigger>
                  <TabsTrigger value="health" className="rounded-xl font-bold gap-2"><Stethoscope className="h-4 w-4" /> Жалобы</TabsTrigger>
                </TabsList>
                
                <div className="mt-8 space-y-6">
                  <div className="relative">
                    <Textarea
                      placeholder={
                        activeTab === 'meal' ? "Что вы съели? Например: Омлет с сыром и кофе" :
                        activeTab === 'labs' ? "Введите результаты анализов или загрузите фото документа" :
                        "Опишите ваши симптомы, заболевания или жалобы"
                      }
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="min-h-[150px] rounded-3xl bg-muted/30 border-none p-6 text-lg font-medium resize-none focus-visible:ring-primary/20"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "absolute bottom-4 right-4 h-12 w-12 rounded-full transition-all shadow-md",
                        isListening ? "bg-destructive text-white animate-pulse" : "bg-white text-primary hover:bg-primary hover:text-white"
                      )}
                      onClick={toggleVoiceRecognition}
                    >
                      <Mic className="h-6 w-6" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      className="h-28 rounded-[2rem] border-dashed border-2 flex flex-col gap-2 hover:bg-primary/5 hover:border-primary transition-all group"
                      onClick={startCamera}
                    >
                      <Camera className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Камера</span>
                    </Button>
                    <label className="cursor-pointer">
                      <div className="h-28 rounded-[2rem] border-dashed border-2 flex flex-col gap-2 items-center justify-center hover:bg-primary/5 hover:border-primary transition-all group">
                        <Upload className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Файл</span>
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                    </label>
                  </div>

                  {showCamera && (
                    <div className="relative rounded-[2.5rem] overflow-hidden bg-black aspect-video shadow-2xl">
                      <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
                        <Button onClick={capturePhoto} className="rounded-full w-14 h-14 bg-white text-primary hover:bg-white/90 shadow-xl">
                          <Camera className="h-7 w-7" />
                        </Button>
                        <Button onClick={stopCamera} variant="destructive" className="rounded-full w-14 h-14 shadow-xl">
                          <X className="h-7 w-7" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {image && !showCamera && (
                    <div className="relative rounded-[2.5rem] overflow-hidden group shadow-lg">
                      <img src={image} alt="Preview" className="w-full aspect-video object-cover" />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-4 right-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setImage(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  <Button
                    className="w-full h-20 rounded-[1.75rem] text-2xl font-black bg-primary shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-3 h-8 w-8 animate-spin" />
                        Обработка...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-3 h-8 w-8" />
                        Добавить данные
                      </>
                    )}
                  </Button>
                </div>
              </Tabs>
            </>
          ) : mealResult ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center space-y-2">
                <Badge className="bg-primary/10 text-primary border-none px-6 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px]">ИИ Проанализировал</Badge>
                <h3 className="text-4xl font-black tracking-tight">{mealResult.mealName}</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 {[
                   { label: 'Ккал', val: mealResult.calories, unit: '', icon: Activity, bg: 'bg-primary/5', text: 'text-primary' },
                   { label: 'Белки', val: mealResult.protein, unit: 'г', icon: Sparkles, bg: 'bg-secondary/10', text: 'text-secondary' },
                   { label: 'Жиры', val: mealResult.fat, unit: 'г', icon: Sparkles, bg: 'bg-accent/20', text: 'text-accent-foreground' },
                   { label: 'Углеводы', val: mealResult.carbs, unit: 'г', icon: Sparkles, bg: 'bg-muted', text: 'text-muted-foreground' }
                 ].map((stat, i) => (
                   <div key={i} className={cn("p-6 rounded-[2rem] flex flex-col items-center justify-center text-center", stat.bg)}>
                     <p className="text-3xl font-black">{stat.val}{stat.unit}</p>
                     <p className="text-[11px] font-bold uppercase tracking-widest opacity-70">{stat.label}</p>
                   </div>
                 ))}
              </div>
              <div className="bg-muted/50 p-8 rounded-[2.5rem] italic text-lg leading-relaxed text-foreground/80">
                "{mealResult.analysis}"
              </div>
              <Button className="w-full h-18 rounded-2xl font-black text-xl" onClick={reset}>Добавить еще</Button>
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center text-center space-y-6 animate-in zoom-in duration-500">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-12 w-12 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black">Данные приняты!</h3>
                <p className="text-muted-foreground font-medium">Ваш план здоровья будет обновлен с учетом новой информации.</p>
              </div>
              <Button className="w-64 h-16 rounded-2xl font-bold text-lg mt-6" onClick={reset}>Отлично</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
