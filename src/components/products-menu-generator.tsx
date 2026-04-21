'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Sparkles, Camera, Upload, Loader2, X, 
  ShoppingBasket, Utensils, Zap, Flame, Droplet 
} from 'lucide-react';
import { generateMenuFromProducts } from '@/ai/flows/generate-menu-from-products';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

export function ProductsMenuGenerator() {
  const { user } = useUser();
  const { firestore } = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
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
      setImage(canvas.toDataURL('image/jpeg'));
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(t => t.stop());
      setShowCamera(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!products && !image) {
      toast({ variant: 'destructive', title: 'Данные не введены', description: 'Напишите список или добавьте фото.' });
      return;
    }

    setLoading(true);
    try {
      const menu = await generateMenuFromProducts({
        products: products || undefined,
        photoDataUri: image || undefined,
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
           <Button variant="ghost" onClick={() => setResults(null)} className="rounded-xl text-primary font-black uppercase text-[10px]">Изменить продукты</Button>
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
    <Card className="premium-card overflow-hidden border-none bg-white/60 backdrop-blur-md max-w-2xl mx-auto">
      <div className="p-8 md:p-12 space-y-10">
        <div className="text-center space-y-2">
           <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShoppingBasket className="h-8 w-8 text-primary" />
           </div>
           <h3 className="text-3xl font-black tracking-tight">Что у вас есть?</h3>
           <p className="text-muted-foreground font-medium text-sm">Перечислите продукты или сфотографируйте содержимое холодильника — ИИ предложит лучшие рецепты.</p>
        </div>

        <div className="space-y-6">
           <Textarea 
             placeholder="Например: Куриное филе, шпинат, яйца, творог..."
             value={products}
             onChange={e => setProducts(e.target.value)}
             className="min-h-[120px] rounded-2xl bg-primary/5 border-none p-6 font-medium text-lg shadow-inner resize-none"
           />

           <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-20 rounded-2xl border-dashed border-2 flex flex-col gap-2 hover:bg-primary/5 transition-all" onClick={startCamera}>
                <Camera className="h-5 w-5 text-primary" /><span className="text-[9px] font-black">КАМЕРА</span>
              </Button>
              <label className="cursor-pointer">
                <div className="h-20 rounded-2xl border-dashed border-2 flex flex-col gap-2 items-center justify-center hover:bg-primary/5 transition-all">
                  <Upload className="h-5 w-5 text-primary" /><span className="text-[9px] font-black">ФАЙЛ</span>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              </label>
           </div>

           {showCamera && (
             <div className="relative rounded-2xl overflow-hidden bg-black aspect-video shadow-2xl">
                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                   <Button onClick={capturePhoto} className="rounded-full w-12 h-12 bg-white text-primary"><Camera className="h-6 w-6" /></Button>
                   <Button onClick={() => setShowCamera(false)} variant="destructive" className="rounded-full w-12 h-12"><X className="h-6 w-6" /></Button>
                </div>
             </div>
           )}

           {image && !showCamera && (
             <div className="relative rounded-2xl overflow-hidden aspect-video border-4 border-white shadow-lg">
                <img src={image} alt="Preview" className="w-full h-full object-cover" />
                <Button variant="destructive" size="icon" className="absolute top-2 right-2 rounded-full h-8 w-8" onClick={() => setImage(null)}><X className="h-4 w-4" /></Button>
             </div>
           )}

           <Button 
             className="w-full h-16 md:h-20 rounded-2xl md:rounded-[2rem] text-xl font-black bg-primary shadow-xl shadow-primary/20"
             onClick={handleSubmit}
             disabled={loading}
           >
             {loading ? <Loader2 className="animate-spin h-6 w-6" /> : <><Sparkles className="mr-3 h-6 w-6 text-accent" /> СОСТАВИТЬ МЕНЮ</>}
           </Button>
        </div>
      </div>
    </Card>
  );
}
