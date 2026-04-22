
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
  ThumbsUp, Calendar, Heart, Share2, Send, Loader2, Plus, Mic, Instagram, ShieldCheck, ShieldAlert
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
  const [isRecording, setIsRecording] = useState(false);
  const [sharingLoading, setSharingLoading] = useState(false);

  const specRef = useMemoFirebase(() => {
    if (!firestore || !specialistId) return null;
    return doc(firestore, 'users', specialistId);
  }, [firestore, specialistId]);

  const userRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

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
  const { data: currentUserData } = useDoc<any>(userRef);
  const { data: specPosts } = useCollection<any>(postsQuery);
  const { data: specReviews } = useCollection<any>(reviewsQuery);

  const isFollowing = specData?.followers?.includes(user?.uid);
  const isDataShared = currentUserData?.sharedWith?.includes(specialistId);

  const startVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Браузер не поддерживает голосовой ввод.' });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ru-RU';
    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setReviewText(prev => (prev ? prev + ' ' : '') + transcript);
      toast({ title: 'Голос распознан' });
    };
    recognition.start();
  };

  const handleToggleFollow = () => {
    if (!user || !firestore || !specRef) return;
    const data = { followers: isFollowing ? arrayRemove(user.uid) : arrayUnion(user.uid) };
    updateDoc(specRef, data).then(() => {
      toast({ title: isFollowing ? 'Подписка отменена' : 'Вы подписались!' });
    });
  };

  const handleToggleShareData = async () => {
    if (!user || !firestore || !userRef) return;
    setSharingLoading(true);
    try {
      await updateDoc(userRef, {
        sharedWith: isDataShared ? arrayRemove(specialistId) : arrayUnion(specialistId)
      });
      toast({ 
        title: isDataShared ? 'Доступ отозван' : 'Доступ предоставлен', 
        description: isDataShared 
          ? `Специалист больше не видит ваши био-данные.` 
          : `Специалист теперь может анализировать ваши активности и анализы.` 
      });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Ошибка доступа' });
    } finally {
      setSharingLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!user || !firestore || !reviewText.trim()) return;
    setIsSubmittingReview(true);
    try {
      await addDoc(collection(firestore, 'users', specialistId, 'reviews'), {
        authorId: user.uid,
        authorName: (user as any).displayName || 'Пользователь',
        rating: reviewRating,
        comment: reviewText.trim(),
        createdAt: new Date().toISOString()
      });
      toast({ title: 'Отзыв опубликован' });
      setReviewText('');
    } catch (e) {
      toast({ variant: 'destructive', title: 'Ошибка' });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (specLoading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <Button variant="ghost" onClick={onBack} className="rounded-full gap-2 text-muted-foreground hover:text-primary transition-all">
        <ArrowLeft className="h-4 w-4" /> Назад к ленте
      </Button>

      <Card className="premium-card overflow-hidden border-none shadow-2xl bg-white/80 backdrop-blur-xl">
        <div className="relative h-48 md:h-64 bg-primary/10 overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/5" />
        </div>
        <CardContent className="px-8 md:px-12 pb-12 relative">
          <div className="flex flex-col md:flex-row gap-8 items-end -mt-16 md:-mt-20">
            <div className="relative">
               <Avatar className="h-32 w-32 md:h-44 md:w-44 border-8 border-white shadow-2xl rounded-[2.5rem]">
                  <AvatarImage src={specData?.photoUrl} className="object-cover" />
                  <AvatarFallback className="bg-primary/5 text-primary text-4xl font-black">{specData?.firstName?.charAt(0)}</AvatarFallback>
               </Avatar>
               {specData?.instagramUrl && (
                 <a href={specData.instagramUrl} target="_blank" rel="noreferrer" className="absolute -bottom-2 -left-2 bg-[#E1306C] text-white p-3 rounded-2xl shadow-lg border-4 border-white hover:scale-110 transition-transform">
                    <Instagram className="h-6 w-6" />
                 </a>
               )}
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
                  </div>
               </div>
            </div>
            <div className="flex flex-col gap-3 w-full md:w-auto">
               <div className="flex gap-3">
                  <Button onClick={handleToggleFollow} className={cn("flex-1 md:flex-none rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-[10px] shadow-xl", isFollowing ? "bg-muted text-muted-foreground" : "bg-primary")}>
                    {isFollowing ? "Вы подписаны" : "Подписаться"}
                  </Button>
                  <Button onClick={() => onStartChat(specialistId, specData?.firstName, specData?.photoUrl)} variant="outline" className="flex-1 md:flex-none rounded-2xl h-14 px-8 font-black border-2 border-primary/20 text-primary">
                    Написать
                  </Button>
               </div>
               
               {user?.uid !== 'public-user' && (
                  <Button 
                    onClick={handleToggleShareData} 
                    disabled={sharingLoading}
                    variant={isDataShared ? "destructive" : "secondary"}
                    className="w-full rounded-2xl h-14 font-black uppercase tracking-widest text-[9px] gap-2 shadow-lg"
                  >
                    {sharingLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : isDataShared ? <><ShieldAlert className="h-4 w-4" /> Отозвать доступ к данным</> : <><ShieldCheck className="h-4 w-4" /> Предоставить личные данные</>}
                  </Button>
               )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-12">
            <div className="lg:col-span-4 space-y-10">
               <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 flex items-center gap-2">О специалисте</h4>
                  <p className="text-sm font-medium leading-relaxed text-foreground/70">{specData?.bio || 'Описание отсутствует.'}</p>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 text-center">
                     <p className="text-2xl font-black text-primary">{specData?.followers?.length || 0}</p>
                     <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60">Подписчиков</p>
                  </div>
                  <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 text-center">
                     <p className="text-2xl font-black text-primary">{specPosts?.length || 0}</p>
                     <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60">Постов</p>
                  </div>
               </div>
            </div>

            <div className="lg:col-span-8 space-y-8">
               <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 px-2">Публикации</h4>
               <div className="space-y-8">
                  {specPosts?.map((post) => (
                     <Card key={post.id} className="premium-card overflow-hidden border-none shadow-xl bg-white p-8 space-y-6">
                        <p className="text-lg font-medium leading-relaxed">{post.content}</p>
                        {post.imageUrl && <div className="relative aspect-video rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl"><Image src={post.imageUrl} alt="Post" fill className="object-cover" /></div>}
                     </Card>
                  ))}
               </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
