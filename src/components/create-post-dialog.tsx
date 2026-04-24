
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Plus, Loader2, ImageIcon, Sparkles, Image as ImageIconLucide, Mic } from 'lucide-react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export function CreatePostDialog() {
  const { user } = useUser();
  const { firestore } = useFirestore();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore || user.uid === 'public-user') return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userData } = useDoc<any>(userDocRef);

  const startVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Ваш браузер не поддерживает голосовой ввод.' });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ru-RU';
    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setContent(prev => (prev ? prev + ' ' : '') + transcript);
      toast({ title: 'Голос распознан' });
    };
    recognition.start();
  };

  const handleSubmit = async () => {
    if (!firestore || !user || !content.trim()) return;

    setLoading(true);
    try {
      await addDoc(collection(firestore, 'posts'), {
        authorId: user.uid,
        authorName: (userData?.firstName || 'Эксперт') + (userData?.lastName ? ` ${userData.lastName}` : ''),
        authorRole: userData?.specialization || 'Эксперт',
        authorPhoto: userData?.photoUrl || '',
        content,
        imageUrl: imageUrl || null,
        likes: 0,
        likedBy: [],
        createdAt: new Date().toISOString()
      });

      toast({ title: 'Опубликовано', description: 'Ваш пост успешно добавлен в ленту.' });
      setIsOpen(false);
      setContent('');
      setImageUrl('');
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Ошибка публикации', description: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-2xl bg-primary text-slate-950 gap-2 h-12 px-6 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4" /> Новый пост
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] p-0 overflow-hidden border border-blue-900/30 shadow-2xl bg-[#010411]">
        <DialogHeader className="p-8 bg-primary text-white relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-[#00ffff]/80 opacity-90" />
          <DialogTitle className="text-2xl font-black flex items-center gap-2 relative z-10 text-slate-950">
            <Sparkles className="h-6 w-6 text-slate-950/60" /> Создать публикацию
          </DialogTitle>
        </DialogHeader>
        <div className="p-8 space-y-6 bg-blue-950/40 backdrop-blur-3xl">
          <div className="space-y-4 relative">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/30 px-2">Текст сообщения</label>
            <div className="relative">
              <Textarea 
                placeholder="Поделитесь знаниями или советом..." 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[150px] rounded-2xl bg-slate-200/10 border border-white/10 p-6 text-lg font-medium resize-none shadow-inner pr-14 text-white placeholder:text-white/20"
              />
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                onClick={startVoiceInput}
                className={cn(
                  "absolute right-3 top-3 h-10 w-10 rounded-full shadow-lg transition-all",
                  isRecording ? "bg-red-500 text-white animate-pulse" : "bg-white/10 text-primary"
                )}
              >
                <Mic className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
             <label className="text-[10px] font-black uppercase tracking-widest text-white/30 px-2 flex items-center gap-2">
                <ImageIconLucide className="h-3 w-3 text-primary" /> Ссылка на изображение (опционально)
             </label>
             <Input 
               placeholder="https://images.unsplash.com/..." 
               value={imageUrl}
               onChange={(e) => setImageUrl(e.target.value)}
               className="h-14 rounded-2xl bg-slate-200/10 border border-white/10 px-6 font-bold text-white placeholder:text-white/20 shadow-inner"
             />
          </div>

          {imageUrl && (
            <div className="relative aspect-video rounded-2xl overflow-hidden border-4 border-white/10 shadow-lg">
               <Image src={imageUrl} alt="Preview" fill className="object-cover" unoptimized />
            </div>
          )}
        </div>
        <DialogFooter className="p-8 bg-blue-950/60 border-t border-white/5 flex flex-col sm:flex-row gap-4">
           <Button variant="ghost" onClick={() => setIsOpen(false)} className="rounded-xl font-bold text-white/60">Отмена</Button>
           <Button 
             onClick={handleSubmit} 
             disabled={loading || !content.trim()} 
             className="rounded-xl bg-primary text-slate-950 px-8 font-black shadow-xl"
           >
              {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Опубликовать"}
           </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
