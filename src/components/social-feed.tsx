'use client';

import { useFirestore, useCollection, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ThumbsUp, MessageSquare, Share2, 
  Loader2, Sparkles, UserPlus, Zap, 
  TrendingUp, Globe
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { CreatePostDialog } from './create-post-dialog';
import { useToast } from '@/hooks/use-toast';

export function SocialFeed() {
  const { user } = useUser();
  const { firestore } = useFirestore();
  const { toast } = useToast();

  const postsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'posts'), orderBy('createdAt', 'desc'), limit(50));
  }, [firestore]);

  const { data: posts, isLoading } = useCollection<any>(postsQuery);

  const handleLike = async (postId: string, likedBy: string[]) => {
    if (!user || user.uid === 'public-user' || !firestore) {
      toast({ variant: 'destructive', title: 'Вход не выполнен' });
      return;
    }

    const isLiked = likedBy?.includes(user.uid);
    const postRef = doc(firestore, 'posts', postId);

    try {
      await updateDoc(postRef, {
        likedBy: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid),
        likes: isLiked ? (likedBy.length - 1) : (likedBy.length + 1)
      });
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-2">
         <div className="text-center md:text-left">
            <h2 className="text-4xl font-black tracking-tighter text-white uppercase leading-none">Лента Bio-Hub</h2>
            <p className="text-primary/60 font-black uppercase text-[10px] tracking-[0.3em] mt-2">Neural Expert Community</p>
         </div>
         <CreatePostDialog />
      </div>

      <div className="grid grid-cols-1 gap-8">
        {posts?.map((post) => (
          <Card key={post.id} className="cyber-card overflow-hidden border-none bg-blue-950/40 backdrop-blur-xl">
             <CardContent className="p-0">
                {/* Header */}
                <div className="p-6 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border-2 border-primary/20 rounded-xl">
                         <AvatarImage src={post.authorPhoto} className="object-cover" />
                         <AvatarFallback className="bg-primary/5 text-primary font-black uppercase">{post.authorName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                         <h4 className="font-black text-white text-base leading-tight uppercase">{post.authorName}</h4>
                         <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-[7px] border-primary/20 text-primary font-black uppercase tracking-widest px-2 py-0">
                               {post.authorRole || 'Эксперт'}
                            </Badge>
                            <span className="text-[9px] text-white/30 font-bold uppercase">
                               {post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ru }) : 'Недавно'}
                            </span>
                         </div>
                      </div>
                   </div>
                   <Button variant="ghost" size="icon" className="text-white/20 hover:text-primary"><Share2 className="h-4 w-4" /></Button>
                </div>

                {/* Content */}
                <div className="px-8 pb-6 space-y-6">
                   <p className="text-white/90 text-lg font-medium leading-relaxed">
                      {post.content}
                   </p>
                   
                   {post.imageUrl && (
                     <div className="relative aspect-video rounded-[2rem] overflow-hidden border-4 border-white/5 shadow-2xl group">
                        <Image src={post.imageUrl} alt="Post image" fill className="object-cover transition-transform duration-700 group-hover:scale-105" unoptimized />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                     </div>
                   )}
                </div>

                {/* Footer / Actions */}
                <div className="bg-white/5 p-4 flex items-center justify-between border-t border-white/5">
                   <div className="flex items-center gap-6 px-4">
                      <button 
                        onClick={() => handleLike(post.id, post.likedBy || [])}
                        className={cn(
                          "flex items-center gap-2 transition-all active:scale-90",
                          post.likedBy?.includes(user?.uid) ? "text-primary" : "text-white/30 hover:text-white/60"
                        )}
                      >
                         <ThumbsUp className={cn("h-5 w-5", post.likedBy?.includes(user?.uid) && "fill-current")} />
                         <span className="text-xs font-black">{post.likes || 0}</span>
                      </button>
                      <div className="flex items-center gap-2 text-white/30 hover:text-white/60 cursor-pointer transition-all">
                         <MessageSquare className="h-5 w-5" />
                         <span className="text-xs font-black">Обсудить</span>
                      </div>
                   </div>
                   <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase px-3 py-1">
                      <Globe className="h-2.5 w-2.5 mr-1" /> Public Protocol
                   </Badge>
                </div>
             </CardContent>
          </Card>
        ))}

        {posts?.length === 0 && (
           <div className="py-24 text-center space-y-8 bg-white/[0.03] border-2 border-dashed border-white/5 rounded-[3rem]">
              <Globe className="h-16 w-16 text-primary/20 mx-auto" />
              <div className="max-w-md mx-auto space-y-2">
                 <h3 className="text-2xl font-black text-white/40 uppercase">Лента пуста</h3>
                 <p className="text-sm text-white/20 font-medium">Будьте первым, кто поделится био-инсайтом в сообществе!</p>
              </div>
           </div>
        )}
      </div>
    </div>
  );
}
