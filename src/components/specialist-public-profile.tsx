
'use client';

import { useState, useMemo } from 'react';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where, orderBy, updateDoc, arrayUnion, arrayRemove, addDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  ArrowLeft, Star, MessageSquare, Users, BookOpen, 
  ThumbsUp, Calendar, Heart, Share2, Send, Loader2, Plus
} from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface SpecialistPublicProfileProps {
  specialistId: string;
  onBack: () => void;
  onStartChat: (id: string, name: string, photo: string) => void;
}

export function SpecialistPublicProfile({ specialistId, onBack, onStartChat }: SpecialistPublicProfileProps) {
  const { user } = useUser();
  const { firestore } = useFirestore();
  const { toast } = useToast();
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const specRef = useMemoFirebase(() => {
    if (!firestore || !specialistId) return null;
    return doc(firestore, 'users', specialistId);
  }, [firestore, specialistId]);

  const postsQuery = useMemoFirebase(() => {
    if (!firestore || !specialistId) return null;
    return query(
      collection(firestore, 'posts'),
      where('authorId', '==', specialistId)
    );
  }, [firestore, specialistId]);

  const reviewsQuery = useMemoFirebase(() => {
    if (!firestore || !specialistId) return null;
    return query(
      collection(firestore, 'users', specialistId, 'reviews'),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, specialistId]);

  const { data: specData, isLoading: specLoading } = useDoc<any>(specRef);
  const { data: specPosts } = useCollection<any>(postsQuery);
  const { data: specReviews } = useCollection<any>(reviewsQuery);

  const isFollowing = specData?.followers?.includes(user?.uid);

  const handleToggleFollow = () => {
    if (!user || !firestore || !specRef) return;
    
    const data = {
      followers: isFollowing ? arrayRemove(user.uid) : arrayUnion(user.uid)
    };

    updateDoc(specRef, data).then(() => {
      toast({ 
        title: isFollowing ? 'Подписка отменена' : 'Вы подписались!',
        description: isFollowing ? `Вы больше не следите за обновлениями ${specData?.firstName}.` : `Теперь вы будете видеть новые посты ${specData?.firstName} первыми.`
      });
    });
  };

  const handleSubmitReview = async () => {
    if (!user || !firestore || !reviewText.trim()) return;

    setIsSubmittingReview(true);
    try {
      const reviewData = {
        authorId: user.uid,
        authorName: (user as any).displayName || 'Пользователь',
        rating: reviewRating,
        comment: reviewText.trim(),
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(firestore, 'users', specialistId, 'reviews'), reviewData);
      
      // Обновляем средний рейтинг (упрощенно)
      const newRating = specReviews 
        ? ((specReviews.reduce((acc, r) => acc + r.rating, 0) + reviewRating) / (specReviews.length + 1)).toFixed(1)
        : reviewRating;
      
      updateDoc(specRef!, { rating: Number(newRating) });

      setReviewText('');
      setReviewRating(5);
      toast({ title: 'Отзыв опубликован', description: 'Спасибо за вашу оценку!' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Не удалось отправить отзыв.' });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (specLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <Button variant="ghost" onClick={onBack} className="rounded-full gap-2 text-muted-foreground hover:text-primary transition-all">
        <ArrowLeft className="h-4 w-4" /> Назад к ленте
      </Button>

      <Card className="premium-card overflow-hidden border-none shadow-2xl bg-white/80 backdrop-blur-xl">
        <div className="relative h-48 md:h-64 bg-primary/10 overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/5" />
           <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-primary/5 rounded-full blur-[100px]" />
        </div>
        <CardContent className="px-8 md:px-12 pb-12 relative">
          <div className="flex flex-col md:flex-row gap-8 items-end -mt-16 md:-mt-20">
            <div className="relative">
               <Avatar className="h-32 w-32 md:h-44 md:w-44 border-8 border-white shadow-2xl rounded-[2.5rem]">
                  <AvatarImage src={specData?.photoUrl} className="object-cover" />
                  <AvatarFallback className="bg-primary/5 text-primary text-4xl font-black">{specData?.firstName?.charAt(0)}</AvatarFallback>
               </Avatar>
               <div className="absolute -bottom-2 -right-2 bg-accent text-white p-3 rounded-2xl shadow-lg border-4 border-white">
                  <Star className="h-6 w-6 fill-white" />
               </div>
            </div>
            <div className="flex-1 space-y-2 text-center md:text-left">
               <h2 className="text-3xl md:text-5xl font-black tracking-tighter">{specData?.firstName} {specData?.lastName}</h2>
               <div className="flex flex-wrap justify-center md:justify-start items-center gap-4">
                  <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary font-black uppercase tracking-widest text-[10px] px-4 py-1.5 rounded-xl">
                     {specData?.specialization || 'Эксперт'}
                  </Badge>
                  <div className="flex items-center gap-1.5 text-accent font-black">
                     <Star className="h-4 w-4 fill-accent" />
                     <span>{specData?.rating || '5.0'}</span>
                     <span className="text-muted-foreground font-medium text-xs">({specReviews?.length || 0} отзывов)</span>
                  </div>
               </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
               <Button 
                  onClick={handleToggleFollow}
                  className={cn(
                    "flex-1 md:flex-none rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-[10px] shadow-xl transition-all",
                    isFollowing ? "bg-muted text-muted-foreground hover:bg-muted/80" : "bg-primary hover:bg-primary/90"
                  )}
               >
                  {isFollowing ? "Вы подписаны" : <><Plus className="h-4 w-4 mr-2" /> Подписаться</>}
               </Button>
               <Button 
                  onClick={() => onStartChat(specialistId, specData?.firstName, specData?.photoUrl)}
                  variant="outline" 
                  className="flex-1 md:flex-none rounded-2xl h-14 px-8 font-black border-2 border-primary/20 text-primary hover:bg-primary/5"
               >
                  <MessageSquare className="h-4 w-4 mr-2" /> Написать
               </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-12">
            <div className="lg:col-span-4 space-y-10">
               <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 flex items-center gap-2">
                     <Users className="h-3 w-3" /> О специалисте
                  </h4>
                  <p className="text-sm font-medium leading-relaxed text-foreground/70">
                    {specData?.bio || 'Этот специалист пока не добавил описание своей деятельности.'}
                  </p>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 text-center">
                     <p className="text-2xl font-black text-primary">{specData?.followers?.length || 0}</p>
                     <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60">Подписчиков</p>
                  </div>
                  <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 text-center">
                     <p className="text-2xl font-black text-primary">{specPosts?.length || 0}</p>
                     <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60">Публикаций</p>
                  </div>
               </div>
               
               <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 flex items-center gap-2">
                     <Star className="h-3 w-3" /> Отзывы
                  </h4>
                  
                  <div className="space-y-4">
                     {specReviews?.map((review) => (
                        <div key={review.id} className="p-5 bg-white border rounded-3xl space-y-2 shadow-sm">
                           <div className="flex justify-between items-center">
                              <p className="font-black text-xs">{review.authorName}</p>
                              <div className="flex gap-0.5">
                                 {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} className={cn("h-2.5 w-2.5", i < review.rating ? "fill-accent text-accent" : "text-muted/20")} />
                                 ))}
                              </div>
                           </div>
                           <p className="text-xs text-muted-foreground leading-relaxed italic">"{review.comment}"</p>
                           <p className="text-[8px] font-bold text-muted-foreground/30 uppercase">{format(new Date(review.createdAt), 'd MMM yyyy', { locale: ru })}</p>
                        </div>
                     ))}
                     {(!specReviews || specReviews.length === 0) && (
                        <p className="text-center py-10 text-xs text-muted-foreground/40 font-medium">Отзывов пока нет</p>
                     )}
                  </div>

                  <div className="bg-primary/5 p-6 rounded-[2rem] border border-primary/10 space-y-4">
                     <h5 className="text-[10px] font-black uppercase tracking-widest text-primary">Оставить отзыв</h5>
                     <div className="flex justify-center gap-2 py-2">
                        {[1,2,3,4,5].map((star) => (
                           <button key={star} onClick={() => setReviewRating(star)} className="transition-transform hover:scale-110 active:scale-95">
                              <Star className={cn("h-6 w-6 transition-colors", star <= reviewRating ? "fill-accent text-accent" : "text-muted-foreground/20")} />
                           </button>
                        ))}
                     </div>
                     <Textarea 
                        placeholder="Поделитесь вашим мнением..." 
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        className="bg-white rounded-xl border-none shadow-inner text-xs min-h-[80px]"
                     />
                     <Button 
                        onClick={handleSubmitReview}
                        disabled={isSubmittingReview || !reviewText.trim()}
                        className="w-full rounded-xl bg-primary h-12 font-black text-[10px] uppercase tracking-widest"
                     >
                        {isSubmittingReview ? <Loader2 className="h-4 w-4 animate-spin" /> : "Отправить"}
                     </Button>
                  </div>
               </div>
            </div>

            <div className="lg:col-span-8 space-y-8">
               <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 flex items-center gap-2 px-2">
                  <BookOpen className="h-3 w-3" /> Публикации
               </h4>
               
               <div className="space-y-8">
                  {specPosts?.map((post) => (
                     <Card key={post.id} className="premium-card overflow-hidden border-none shadow-xl bg-white transition-all hover:scale-[1.01]">
                        <div className="p-8 space-y-6">
                           <div className="flex justify-between items-start">
                              <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">
                                 {format(new Date(post.createdAt), 'd MMMM yyyy, HH:mm', { locale: ru })}
                              </p>
                              <Badge variant="outline" className="text-[9px] border-primary/10 text-primary/60">{post.likes || 0} Лайков</Badge>
                           </div>
                           <p className="text-lg font-medium leading-relaxed">{post.content}</p>
                           {post.imageUrl && (
                              <div className="relative aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white">
                                 <Image src={post.imageUrl} alt="Post" fill className="object-cover" />
                              </div>
                           )}
                           <div className="flex items-center gap-6 pt-4 border-t">
                              <Button variant="ghost" className="rounded-full px-6 gap-2 text-muted-foreground">
                                 <ThumbsUp className="h-4 w-4" /> 
                                 <span className="font-black text-xs">{post.likes || 0}</span>
                              </Button>
                              <Button variant="ghost" className="rounded-full px-6 gap-2 text-muted-foreground">
                                 <Share2 className="h-4 w-4" />
                              </Button>
                           </div>
                        </div>
                     </Card>
                  ))}
                  {(!specPosts || specPosts.length === 0) && (
                     <div className="py-20 text-center space-y-4 opacity-20">
                        <BookOpen className="h-16 w-16 mx-auto" />
                        <p className="font-black uppercase tracking-widest text-sm">У этого автора пока нет постов</p>
                     </div>
                  )}
               </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
