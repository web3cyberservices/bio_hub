'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Sparkles, Camera, Upload, Loader2, X, 
  ShoppingBasket, Utensils, Zap, Flame, Droplet,
  ScanBarcode, Plus, Trash2, CookingPot, Mic
} from 'lucide-react';
import { generateMenuFromProducts } from '@/ai/flows/generate-menu-from-products';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { BarcodeScannerDialog } from './barcode-scanner-dialog';

export function ProductsMenuGenerator() {
  const { user } = useUser();
  const { firestore } = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState('');
  const [scannedProducts, setScannedProducts] = useState<any[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore || user.uid === 'public-user') return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userData } = useDoc<any>(userDocRef);

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (e) {
      toast({ variant: 'destructive', title: 'Ошибка камеры', description: 'Нет доступа.' });
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      const dataUri = canvas.toDataURL('image/jpeg');
      setImages(prev => [...prev, dataUri]);
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(t => t.stop());
      setShowCamera(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setImages(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const startVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Ваш браузер не поддерживает голосовой ввод.' });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ru-RU';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setProducts(prev => prev + (prev ? ', ' : '') + transcript);
      toast({ title: 'Голос распознан' });
    };
    recognition.start();
  };

  const handleBarcodeScan = (product: any) => {
    setScannedProducts(prev => [...prev, product]);
    toast({ title: 'Продукт добавлен', description: `${product.name} теперь в списке.` });
  };

  const removeScannedProduct = (index: number) => {
    setScannedProducts(prev => prev.filter((_, i) => i !== index));
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const allProductsText = [
      products,
      ...scannedProducts.map(p => p.name)
    ].filter(Boolean).join(', ');

    if (!allProductsText && images.length === 0) {
      toast({ variant: 'destructive', title: 'Данные не введены', description: 'Напишите список, отсканируйте штрих-код или добавьте фото.' });
      return;
    }

    setLoading(true);
    try {
      const menu = await generateMenuFromProducts({
        products: allProductsText || undefined,
        photoDataUris: images.length > 0 ? images : undefined,
        userContext: {
          healthGoal: userData?.healthGoal,
          dislikedFoods: userData?.dislikedFoods
        }
      });
      setResults(menu);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Ошибка ИИ', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (results) {
    return (
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
        <div className="flex items-center justify-between px-2">
           <h3 className="text-2xl font-black tracking-tight text-white uppercase">ИИ-Решения</h3>
           <Button variant="ghost" onClick={() => setResults(null)} className="rounded-xl text-primary font-black uppercase text-[10px]">Изменить выбор</Button>
        </div>
        <div className="grid grid-cols-1 gap-6">
           {results.map((meal, i) => (
             <Card key={i} className="cyber-card overflow-hidden border-none flex flex-col md:flex-row bg-white/5 backdrop-blur-xl">
                <div className="relative w-full md:w-64 h-48 md:h-auto shrink-0">
                   <Image src={meal.imageUrl} alt={meal.name} fill className="object-cover" unoptimized />
                   <Badge className="absolute top-4 left-4 bg-primary text-slate-950 border-none font-black text-[9px] uppercase px-3">{meal.time}</Badge>
                </div>
                <CardContent className="p-8 flex-1 space-y-6">
                   <div className="flex justify-between items-start">
                      <div>
                         <h4 className="text-2xl font-black tracking-tight text-white uppercase">{meal.name}</h4>
                         <p className="text-white/50 text-sm font-medium italic mt-1 leading-relaxed">{meal.description}</p>
                      </div>
                      <div className="text-right">
                         <p className="text-3xl font-black text-primary drop-shadow-[0_0_10px_rgba(0,255,255,0.3)]">{meal.calories}</p>
                         <p className="text-[8px] font-black uppercase text-white/30 tracking-widest mt-1">Ккал</p>
                      </div>
                   </div>
                   <div className="flex flex-wrap gap-2">
                      {meal.components.map((c: any, ci: number) => (
                        <Badge key={ci} variant="outline" className="rounded-xl border-primary/10 bg-primary/5 text-primary text-[10px] py-1.5 px-4 font-bold">
                           {c.ingredient} ({c.weight})
                        </Badge>
                      ))}
                   </div>
                   <div className="flex items-center gap-6 pt-6 border-t border-white/5 text-[10px] font-black uppercase tracking-widest text-white/40">
                      <div className="flex items-center gap-2"><Flame className="h-3.5 w-3.5 text-orange-500" /> Б: {meal.protein}г</div>
                      <div className="flex items-center gap-2"><Droplet className="h-3.5 w-3.5 text-yellow-500" /> Ж: {meal.fat}г</div>
                      <div className="flex items-center gap-2"><Zap className="h-3.5 w-3.5 text-primary" /> У: {meal.carbs}г</div>
                   </div>
                </CardContent>
             </Card>
           ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-transparent max-w-4xl mx-auto pb-10">
      <div className="space-y-10">
        <div className="text-center space-y-3">
           <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-4 border border-primary/20 shadow-inner">
              <ShoppingBasket className="h-10 w-10 text-primary" />
           </div>
           <h3 className="text-3xl font-black tracking-tighter text-white uppercase">Ваш холодильник</h3>
           <p className="text-white/40 font-medium text-sm tracking-wide uppercase text-[10px]">Впишите голосом или сфотографируйте продукты</p>
        </div>

        <div className="space-y-8">
           <div className="relative group">
              <Textarea 
                placeholder="Напишите список продуктов через запятую..."
                value={products}
                onChange={e => setProducts(e.target.value)}
                className="min-h-[140px] rounded-[2rem] bg-white/5 border-white/10 p-8 font-bold text-xl text-white shadow-inner resize-none focus:ring-4 focus:ring-primary/5 transition-all pr-16"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                 <button 
                    onClick={startVoiceInput}
                    className={cn(
                      "h-14 w-14 rounded-full shadow-2xl flex items-center justify-center transition-all",
                      isListening ? "bg-red-500 text-white animate-pulse" : "bg-white/10 text-primary hover:bg-white/20"
                    )} 
                 >
                    <Mic className="h-6 w-6" />
                 </button>
              </div>
           </div>

           {scannedProducts.length > 0 && (
              <div className="space-y-4 animate-in slide-in-from-top-2 duration-300 px-2">
                 <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/60">Отсканировано ({scannedProducts.length})</label>
                    <Button variant="ghost" size="sm" onClick={() => setScannedProducts([])} className="h-6 text-[8px] font-black uppercase text-destructive hover:bg-destructive/10">Очистить</Button>
                 </div>
                 <div className="flex flex-wrap gap-2">
                    {scannedProducts.map((p, i) => (
                       <Badge key={i} className="pl-4 pr-1 py-1 h-12 rounded-2xl bg-primary text-slate-950 font-black border-none gap-2 text-xs shadow-xl">
                          {p.name}
                          <button onClick={() => removeScannedProduct(i)} className="h-8 w-8 rounded-xl hover:bg-black/10 flex items-center justify-center">
                             <X className="h-4 w-4" />
                          </button>
                       </Badge>
                    ))}
                 </div>
              </div>
           )}

           <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              <Button variant="outline" className="h-24 md:h-28 rounded-[2rem] border-dashed border-2 border-white/10 bg-white/5 flex flex-col gap-3 hover:border-primary/40 hover:bg-primary/5 transition-all group" onClick={() => setIsScannerOpen(true)}>
                <ScanBarcode className="h-7 w-7 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/50 group-hover:text-primary">Штрих-код</span>
              </Button>
              <Button variant="outline" className="h-24 md:h-28 rounded-[2rem] border-dashed border-2 border-white/10 bg-white/5 flex flex-col gap-3 hover:border-primary/40 hover:bg-primary/5 transition-all group" onClick={startCamera}>
                <Camera className="h-7 w-7 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/50 group-hover:text-primary">Фото еды</span>
              </Button>
              <label className="cursor-pointer col-span-2 md:col-span-1">
                <div className="h-24 md:h-28 rounded-[2rem] border-dashed border-2 border-white/10 bg-white/5 flex flex-col gap-3 items-center justify-center hover:border-primary/40 hover:bg-primary/5 transition-all group">
                  <Upload className="h-7 w-7 text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/50 group-hover:text-primary">Файлы</span>
                </div>
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileUpload} />
              </label>
           </div>

           {showCamera && (
             <div className="relative rounded-[2.5rem] overflow-hidden bg-black aspect-video shadow-2xl border-4 border-white/5">
                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-6">
                   <button onClick={capturePhoto} className="rounded-full h-16 w-16 bg-white text-primary shadow-xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center"><Camera className="h-8 w-8" /></button>
                   <button onClick={() => setShowCamera(false)} className="rounded-full h-16 w-16 bg-red-500 text-white shadow-xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center"><X className="h-8 w-8" /></button>
                </div>
             </div>
           )}

           {images.length > 0 && !showCamera && (
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 animate-in fade-in duration-500">
                {images.map((img, i) => (
                  <div key={i} className="relative rounded-3xl overflow-hidden aspect-square border-4 border-white/5 shadow-2xl group">
                    <img src={img} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                    <button 
                      onClick={() => removeImage(i)}
                      className="absolute top-3 right-3 rounded-xl h-10 w-10 bg-red-500 text-white shadow-xl opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ))}
             </div>
           )}

           <Button 
             className="w-full h-20 md:h-24 rounded-[2.5rem] text-xl md:text-2xl font-black bg-primary text-slate-950 shadow-[0_20px_50px_rgba(0,255,255,0.2)] hover:scale-[1.02] active:scale-95 transition-all border-4 border-white/10"
             onClick={handleSubmit}
             disabled={loading}
           >
             {loading ? <Loader2 className="animate-spin h-8 w-8" /> : <><Sparkles className="mr-3 h-8 w-8 animate-pulse text-white/50" /> СОСТАВИТЬ МЕНЮ</>}
           </Button>
        </div>
      </div>

      <BarcodeScannerDialog 
        open={isScannerOpen} 
        onOpenChange={setIsScannerOpen} 
        onScan={handleBarcodeScan} 
      />
    </div>
  );
}
