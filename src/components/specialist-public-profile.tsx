'use client';

import { useState } from 'react';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where, updateDoc, arrayUnion, arrayRemove, addDoc, getDocs } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  ArrowLeft, Star, BookOpen, 
  Share2, Loader2, Instagram, ShieldCheck, ShieldAlert
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { PatientBookingDialog } from './patient-booking-dialog';

interface SpecialistPublicProfileProps {
  specialistId: string;
  onBack?: () => void;
  onStartChat: (id: string, name: string, photo: string) => void;
}

export function SpecialistPublicProfile({ specialistId, onBack, onStartChat }: SpecialistPublicProfileProps) {
  const { user } = useUser();
  const { firestore } = useFirestore();
  const { toast } = useToast();
  const [sharingLoading, setSharingLoading] = useState(false);

  const specRef = useMemoFirebase(() => {
    if (!firestore || !specialistId) return null;
    return doc(firestore, 'users', specialistId);
  }, [firestore, specialistId]);

  const userRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid || user.uid === 'public-user') return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const postsQuery = useMemoFirebase(() => {
    if (!firestore || !specialistId) return null;
    return query(
      collection(firestore, 'posts'),
      where('authorId', '==', specialistId)
    );
  }, [firestore, specialistId]);

  const { data: specData, isLoading: specLoading } = useDoc<any>(specRef);
  const { data: currentUserData } = useDoc<any>(userRef);
  const { data: specPosts } = useCollection<any>(postsQuery);

  const isFollowing = specData?.followers?.includes(user?.uid);
  const isDataShared = currentUserData?.sharedWith?.includes(specialistId);

  const handleToggleFollow = () => {
    if (!user || user.uid === 'public-user' || !firestore || !specRef) {
      toast({ variant: 'destructive', title: 'Вход не выполнен', description: 'Подписка доступна только зарегистрированным пользователям.' });
      return;
    }
    const data = { followers: isFollowing ? arrayRemove(user.uid) : arrayUnion(user.uid) };
    updateDoc(specRef, data).then(() => {
      toast({ title: isFollowing ? 'Подписка отменена' : 'Вы подписались!' });
    });
  };

  const handleToggleShareData = async () => {
    if (!user || user.uid === 'public-user' || !firestore || !userRef) return;
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

  const handleCopyLink = () => {
    const link = `https://t.me/web3cyberservices_bot/app?startapp=${specialistId}`;
    navigator.clipboard.writeText(link).then(() => {
      toast({ title: 'Ссылка скопирована', description: 'Прямая ссылка на профиль готова для отправки.' });
    });
  };

  const handleCreateChat = async () => {
    if (!user || user.uid === 'public-user' || !firestore || !specData) return;
    try {
      const chatsQuery = query(collection(firestore, 'chats'), where('participants', 'array-contains', user.uid));
      const querySnapshot = await getDocs(chatsQuery);
      let existingChat = null;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.participants.includes(specialistId)) existingChat = { id: doc.id, ...data };
      });
      if (!existingChat) {
        const res = await addDoc(collection(firestore, 'chats'), {
          participants: [user.uid, specialistId],
          participantDetails: {
            [user.uid]: { name: (user as any).displayName || 'Пользователь', photo: (user as any).photoURL || (user as any).photoUrl || '' },
            [specialistId]: { name: specData.firstName || 'Специалист', photo: specData.photoUrl || '' }
          },
          unreadCount: {
            [user.uid]: 0,
            [specialistId]: 0
          },
          lastMessage: 'Начат новый диалог со специалистом.',
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        });
        onStartChat(res.id, specData.firstName, specData.photoUrl);
      } else {
        onStartChat(existingChat.id, specData.firstName, specData.photoUrl);
      }
    } catch (e) { toast({ variant: 'destructive', title: 'Ошибка чата' }); }
  };

  if (specLoading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex items-center justify-between px-2">
        <Button variant="ghost" onClick={onBack} className="rounded-full gap-2 text-white/40 hover:text-primary transition-all">
          <ArrowLeft className="h-4 w-4" /> Назад
        </Button>
        <Button variant="ghost" onClick={handleCopyLink} className="rounded-xl gap-2 text-primary hover:bg-primary/5 transition-all uppercase font-black text-[10px]">
          <Share2 className="h-4 w-4" /> Поделиться профилем
        </Button>
      </div>

      <Card className="premium-card overflow-hidden border-none shadow-2xl bg-blue-950/40 backdrop-blur-xl">
        <div className="relative h-48 md:h-64 bg-primary/10 overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/5" />
        </div>
        <CardContent className="px-8 md:px-12 pb-12 relative">
          <div className="flex flex-col md:flex-row gap-8 items-end -mt-16 md:-mt-20">
            <div className="relative">
               <Avatar className="h-32 w-32 md:h-44 md:w-44 border-8 border-black shadow-2xl rounded-[2.5rem]">
                  <AvatarImage src={specData?.photoUrl} className="object-cover" />
                  <AvatarFallback className="bg-primary/5 text-primary text-4xl font-black">{specData?.firstName?.charAt(0)}</AvatarFallback>
               </Avatar>
               {specData?.instagramUrl && (
                 <a href={specData.instagramUrl} target="_blank" rel="noreferrer" className="absolute -bottom-2 -left-2 bg-[#E1306C] text-white p-3 rounded-2xl shadow-lg border-4 border-black hover:scale-110 transition-transform">
                    <Instagram className="h-6 w-6" />
                 </a>
               )}
            </div>
            <div className="flex-1 space-y-2 text-center md:text-left">
               <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white uppercase">{specData?.firstName} {specData?.lastName}</h2>
               <div className="flex flex-wrap justify-center md:justify-start items-center gap-4">
                  <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary font-black uppercase tracking-widest text-[10px] px-4 py-1.5 rounded-xl">
                     {specData?.specialization || 'Эксперт BioTech'}
                  </Badge>
                  <div className="flex items-center gap-1.5 text-accent font-black">
                     <Star className="h-4 w-4 fill-accent" />
                     <span>{specData?.rating || '5.0'}</span>
                  </div>
               </div>
            </div>
            <div className="flex flex-col gap-3 w-full md:w-auto">
               <div className="flex gap-3">
                  <Button onClick={handleToggleFollow} className={cn("flex-1 md:flex-none rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-[10px] shadow-xl", isFollowing ? "bg-white/10 text-white/40" : "bg-primary text-slate-950")}>
                    {isFollowing ? "Вы подписаны" : "Подписаться"}
                  </Button>
                  <Button onClick={handleCreateChat} variant="outline" className="flex-1 md:flex-none rounded-2xl h-14 px-8 font-black border-2 border-primary/20 text-primary hover:bg-primary/5 uppercase">
                    Чат
                  </Button>
               </div>
               
               {user?.uid && user.uid !== 'public-user' && (
                 <div className="flex flex-col gap-3">
                    <PatientBookingDialog specialistId={specialistId} specialistName={specData?.firstName || 'Эксперт'} />
                    <Button 
                      onClick={handleToggleShareData} 
                      disabled={sharingLoading}
                      variant={isDataShared ? "destructive" : "secondary"}
                      className="w-full rounded-2xl h-14 font-black uppercase tracking-widest text-[9px] gap-2 shadow-lg"
                    >
                      {sharingLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : isDataShared ? <><ShieldAlert className="h-4 w-4" /> Отозвать доступ к данным</> : <><ShieldCheck className="h-4 w-4" /> Предоставить личные данные</>}
                    </Button>
                 </div>
               )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-12">
            <div className="lg:col-span-4 space-y-10">
               <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 flex items-center gap-2">О специалисте</h4>
                  <p className="text-sm font-medium leading-relaxed text-white/70">{specData?.bio || 'Описание отсутствует.'}</p>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 text-center">
                     <p className="text-2xl font-black text-primary">{specData?.followers?.length || 0}</p>
                     <p className="text-[8px] font-black uppercase tracking-widest text-white/30">Подписчиков</p>
                  </div>
                  <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 text-center">
                     <p className="text-2xl font-black text-primary">{specPosts?.length || 0}</p>
                     <p className="text-[8px] font-black uppercase tracking-widest text-white/30">Постов</p>
                  </div>
               </div>
            </div>

            <div className="lg:col-span-8 space-y-8">
               <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 px-2">Публикации</h4>
               <div className="space-y-8">
                  {specPosts?.map((post) => (
                     <Card key={post.id} className="cyber-card overflow-hidden border-none shadow-xl bg-white/5 p-8 space-y-6">
                        <p className="text-lg font-medium leading-relaxed text-white/90">{post.content}</p>
                        {post.imageUrl && <div className="relative aspect-video rounded-[2.5rem] overflow-hidden border-4 border-white/5 shadow-2xl"><Image src={post.imageUrl} alt="Post" fill className="object-cover" unoptimized /></div>}
                     </Card>
                  ))}
                  {(!specPosts || specPosts.length === 0) && (
                    <div className="py-20 text-center opacity-20">
                      <BookOpen className="h-12 w-12 mx-auto text-white" />
                      <p className="text-xs font-black uppercase tracking-widest mt-4">Публикаций пока нет</p>
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
