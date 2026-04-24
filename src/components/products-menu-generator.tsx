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
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center justify-between">
           <h3 className="text-2xl font-black tracking-tight">Решения из ваших продуктов</h3>
           <Button variant="ghost" onClick={() => setResults(null)} className="rounded-xl text-primary font-black uppercase text-[10px]">Изменить выбор</Button>
        </div>
        <div className="grid grid-cols-1 gap-8">
           {results.map((meal, i) => (
             <Card key={i} className="premium-card overflow-hidden border-none flex flex-col md:flex-row">
                <div className="relative w-full md:w-64 h-48 md:h-auto shrink-0">
                   <Image src={meal.imageUrl} alt={meal.name} fill className="object-cover" unoptimized />
                   <Badge className="absolute top-4 left-4 bg-primary text-white border-none font-black text-[9px]">{meal.time}</Badge>
                </div>
                <CardContent className="p-8 flex-1 space-y-6">
                   <div className="flex justify-between items-start">
                      <div>
                         <h4 className="text-2xl font-black tracking-tight">{meal.name}</h4>
                         <p className="text-muted-foreground text-sm font-medium italic mt-1">{meal.description}</p>
                      </div>
                      <div className="text-right">
                         <p className="text-3xl font-black text-primary">{meal.calories}</p>
                         <p className="text-[8px] font-black uppercase text-muted-foreground opacity-40">Ккал</p>
                      </div>
                   </div>
                   <div className="flex flex-wrap gap-2">
                      {meal.components.map((c: any, ci: number) => (
                        <Badge key={ci} variant="outline" className="rounded-lg border-primary/10 bg-primary/5 text-primary text-[10px] py-1 px-3">
                           {c.ingredient} ({c.weight})
                        </Badge>
                      ))}
                   </div>
                   <div className="flex items-center gap-6 pt-4 border-t text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">
                      <div className="flex items-center gap-1.5"><Flame className="h-3 w-3 text-orange-500" /> Б: {meal.protein}г</div>
                      <div className="flex items-center gap-1.5"><Droplet className="h-3 w-3 text-yellow-500" /> Ж: {meal.fat}г</div>
                      <div className="flex items-center gap-1.5"><Zap className="h-3 w-3 text-primary" /> У: {meal.carbs}г</div>
                   </div>
                </CardContent>
             </Card>
           ))}
        </div>
      </div>
    );
  }

  return (
    <Card className="premium-card overflow-hidden border-none bg-white/60 backdrop-blur-md max-w-3xl mx-auto">
      <div className="p-8 md:p-12 space-y-10">
        <div className="text-center space-y-2">
           <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShoppingBasket className="h-8 w-8 text-primary" />
           </div>
           <h3 className="text-3xl font-black tracking-tight">Создать из продуктов</h3>
           <p className="text-muted-foreground font-medium text-sm">Впишите голосом, текстом или сфотографируйте холодильник.</p>
        </div>

        <div className="space-y-8">
           <div className="relative group">
              <Textarea 
                placeholder="Впишите продукты здесь..."
                value={products}
                onChange={e => setProducts(e.target.value)}
                className="min-h-[120px] rounded-3xl bg-primary/5 border-none p-6 font-medium text-lg shadow-inner resize-none focus:ring-4 focus:ring-primary/5 transition-all pr-16"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                 <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn(
                      "h-12 w-12 rounded-full shadow-lg transition-all",
                      isListening ? "bg-red-500 text-white animate-pulse" : "bg-white text-primary"
                    )} 
                    onClick={startVoiceInput}
                 >
                    <Mic className="h-5 w-5" />
                 </Button>
              </div>
           </div>

           {scannedProducts.length > 0 && (
              <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                 <div className="flex items-center justify-between px-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary">Отсканировано ({scannedProducts.length})</label>
                    <Button variant="ghost" size="sm" onClick={() => setScannedProducts([])} className="h-6 text-[8px] font-black uppercase text-destructive">Очистить</Button>
                 </div>
                 <div className="flex flex-wrap gap-2">
                    {scannedProducts.map((p, i) => (
                       <Badge key={i} className="pl-4 pr-1 py-1 h-10 rounded-xl bg-primary text-white font-black border-none gap-2 text-xs shadow-md">
                          {p.name}
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-black/10 text-white" onClick={() => removeScannedProduct(i)}>
                             <X className="h-3 w-3" />
                          </Button>
                       </Badge>
                    ))}
                 </div>
              </div>
           )}

           <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-20 md:h-24 rounded-3xl border-dashed border-2 flex flex-col gap-2 hover:bg-primary/5 transition-all group" onClick={() => setIsScannerOpen(true)}>
                <ScanBarcode className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-[9px] font-black uppercase tracking-widest">ШТРИХ-КОД</span>
              </Button>
              <Button variant="outline" className="h-20 md:h-24 rounded-3xl border-dashed border-2 flex flex-col gap-2 hover:bg-primary/5 transition-all group" onClick={startCamera}>
                <Camera className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-[9px] font-black uppercase tracking-widest">ФОТО ЕДЫ</span>
              </Button>
              <label className="cursor-pointer col-span-2 md:col-span-1">
                <div className="h-20 md:h-24 rounded-3xl border-dashed border-2 flex flex-col gap-2 items-center justify-center hover:bg-primary/5 transition-all group">
                  <Upload className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] font-black uppercase tracking-widest">ФАЙЛЫ</span>
                </div>
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileUpload} />
              </label>
           </div>

           {showCamera && (
             <div className="relative rounded-3xl overflow-hidden bg-black aspect-video shadow-2xl">
                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
                   <Button onClick={capturePhoto} className="rounded-full w-14 h-14 bg-white text-primary shadow-xl"><Camera className="h-7 w-7" /></Button>
                   <Button onClick={() => setShowCamera(false)} variant="destructive" className="rounded-full w-14 h-14 shadow-xl"><X className="h-7 w-7" /></Button>
                </div>
             </div>
           )}

           {images.length > 0 && !showCamera && (
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 animate-in fade-in duration-500">
                {images.map((img, i) => (
                  <div key={i} className="relative rounded-2xl overflow-hidden aspect-square border-4 border-white shadow-lg group">
                    <img src={img} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="absolute top-2 right-2 rounded-full h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" 
                      onClick={() => removeImage(i)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
             </div>
           )}

           <Button 
             className="w-full h-16 md:h-24 rounded-3xl md:rounded-[2.5rem] text-xl md:text-2xl font-black bg-primary shadow-[0_20px_50px_rgba(45,122,77,0.3)] hover:scale-[1.02] transition-all"
             onClick={handleSubmit}
             disabled={loading}
           >
             {loading ? <Loader2 className="animate-spin h-8 w-8" /> : <><Sparkles className="mr-3 h-7 w-7 text-accent animate-pulse" /> СОСТАВИТЬ МЕНЮ</>}
           </Button>
        </div>
      </div>

      <BarcodeScannerDialog 
        open={isScannerOpen} 
        onOpenChange={setIsScannerOpen} 
        onScan={handleBarcodeScan} 
      />
    </Card>
  );
}
