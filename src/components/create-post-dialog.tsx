
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Plus, Loader2, ImageIcon, Sparkles, Image as ImageIconLucide } from 'lucide-react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

export function CreatePostDialog() {
  const { user } = useUser();
  const { firestore } = useFirestore();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore || user.uid === 'public-user') return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userData } = useDoc<any>(userDocRef);

  const handleSubmit = async () => {
    if (!firestore || !user || !content.trim()) return;

    setLoading(true);
    try {
      await addDoc(collection(firestore, 'posts'), {
        authorId: user.uid,
        authorName: userData?.firstName + (userData?.lastName ? ` ${userData.lastName}` : '') || 'Специалист',
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
        <Button className="rounded-2xl bg-primary gap-2 h-12 px-6 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4" /> Новый пост
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-8 bg-primary text-white">
          <DialogTitle className="text-2xl font-black flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-accent" /> Создать публикацию
          </DialogTitle>
        </DialogHeader>
        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">Текст сообщения</label>
            <Textarea 
              placeholder="Поделитесь знаниями или советом..." 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[150px] rounded-2xl bg-[#E8F5EE] border-none p-6 text-lg font-medium resize-none shadow-inner"
            />
          </div>
          
          <div className="space-y-4">
             <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2 flex items-center gap-2">
                <ImageIconLucide className="h-3 w-3" /> Ссылка на изображение (опционально)
             </label>
             <Input 
               placeholder="https://images.unsplash.com/..." 
               value={imageUrl}
               onChange={(e) => setImageUrl(e.target.value)}
               className="h-14 rounded-2xl bg-[#E8F5EE] border-none px-6 font-bold"
             />
          </div>

          {imageUrl && (
            <div className="relative aspect-video rounded-2xl overflow-hidden border-4 border-white shadow-lg">
               <Image src={imageUrl} alt="Preview" fill className="object-cover" />
            </div>
          )}
        </div>
        <DialogFooter className="p-8 bg-muted/20 border-t flex flex-col sm:flex-row gap-4">
           <Button variant="ghost" onClick={() => setIsOpen(false)} className="rounded-xl font-bold">Отмена</Button>
           <Button 
             onClick={handleSubmit} 
             disabled={loading || !content.trim()} 
             className="rounded-xl bg-primary px-8 font-black shadow-xl"
           >
              {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Опубликовать"}
           </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
