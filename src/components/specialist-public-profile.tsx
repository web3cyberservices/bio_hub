'use client';

import { useState } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query, where, updateDoc, arrayUnion, arrayRemove, addDoc, getDocs } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Star, Share2, Loader2, ShieldCheck, ShieldAlert, Zap } from 'lucide-react';
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

  const specRef = useMemoFirebase(() => (!firestore || !specialistId) ? null : doc(firestore, 'users', specialistId), [firestore, specialistId]);
  const userRef = useMemoFirebase(() => (!firestore || !user?.uid || user.uid === 'public-user') ? null : doc(firestore, 'users', user.uid), [firestore, user?.uid]);
  const postsQuery = useMemoFirebase(() => (!firestore || !specialistId) ? null : query(collection(firestore, 'posts'), where('authorId', '==', specialistId)), [firestore, specialistId]);

  const { data: specData, isLoading: specLoading } = useDoc<any>(specRef);
  const { data: currentUserData } = useDoc<any>(userRef);
  const { data: specPosts } = useCollection<any>(postsQuery);

  const isFollowing = specData?.followers?.includes(user?.uid);
  const isDataShared = currentUserData?.sharedWith?.includes(specialistId);

  const handleCopyLink = async () => {
    const link = typeof window !== 'undefined' ? `${window.location.origin}/specialist/${specialistId}` : '';
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(link);
      } else {
        const t = document.createElement("textarea"); t.value = link; document.body.appendChild(t); t.select(); document.execCommand('copy'); document.body.removeChild(t);
      }
      toast({ title: 'Ссылка скопирована' });
    } catch (e) {
      toast({ title: 'Копирование ограничено', variant: 'destructive' });
    }
  };

  const handleCreateChat = async () => {
    if (!user?.uid || user.uid === 'public-user' || !firestore || !specData) return;
    try {
      const q = query(collection(firestore, 'chats'), where('participants', 'array-contains', user.uid));
      const snap = await getDocs(q);
      let existing = snap.docs.find(d => d.data().participants.includes(specialistId));
      if (!existing) {
        const res = await addDoc(collection(firestore, 'chats'), {
          participants: [user.uid, specialistId],
          participantDetails: {
            [user.uid]: { name: (user as any).displayName || 'Пользователь', photo: (user as any).photoURL || '' },
            [specialistId]: { name: specData.firstName || 'Специалист', photo: specData.photoUrl || '' }
          },
          unreadCount: { [user.uid]: 0, [specialistId]: 0 },
          lastMessage: 'Начат новый диалог.',
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        });
        onStartChat(res.id, specData.firstName, specData.photoUrl);
      } else {
        onStartChat(existing.id, specData.firstName, specData.photoUrl);
      }
    } catch (e) { toast({ variant: 'destructive', title: 'Ошибка чата' }); }
  };

  if (specLoading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex items-center justify-between px-2">
        <Button variant="ghost" onClick={onBack} className="text-white/40 hover:text-primary"><ArrowLeft className="h-4 w-4 mr-2" /> Назад</Button>
        <Button variant="ghost" onClick={handleCopyLink} className="text-primary uppercase font-black text-[10px]"><Share2 className="h-4 w-4 mr-2" /> Поделиться</Button>
      </div>

      <Card className="premium-card overflow-hidden border-none shadow-2xl bg-blue-950/40 backdrop-blur-xl">
        <div className="relative h-48 md:h-64 bg-primary/10 overflow-hidden"><div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/5" /></div>
        <CardContent className="px-8 md:px-12 pb-12 relative">
          <div className="flex flex-col md:flex-row gap-8 items-end -mt-16 md:-mt-20">
            <Avatar className="h-32 w-32 md:h-44 md:w-44 border-8 border-black shadow-2xl rounded-[2.5rem]"><AvatarImage src={specData?.photoUrl} className="object-cover" /><AvatarFallback className="bg-primary/5 text-primary text-4xl font-black">{specData?.firstName?.charAt(0)}</AvatarFallback></Avatar>
            <div className="flex-1 text-center md:text-left"><h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white uppercase">{specData?.firstName} {specData?.lastName}</h2><div className="flex flex-wrap justify-center md:justify-start items-center gap-4 mt-2"><Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary text-[10px] px-4 py-1.5 rounded-xl uppercase">{specData?.specialization || 'Эксперт BioTech'}</Badge><div className="flex items-center gap-1.5 text-accent font-black"><Star className="h-4 w-4 fill-accent" /><span>5.0</span></div></div></div>
            <div className="flex flex-col gap-3 w-full md:w-auto">
               <div className="flex gap-3">
                  <Button onClick={() => updateDoc(specRef!, { followers: isFollowing ? arrayRemove(user!.uid) : arrayUnion(user!.uid) })} className={cn("flex-1 md:flex-none rounded-2xl h-14 px-8 font-black uppercase text-[10px] shadow-xl", isFollowing ? "bg-white/10 text-white/40" : "bg-primary text-slate-950")}>{isFollowing ? "Вы подписаны" : "Подписаться"}</Button>
                  <Button onClick={handleCreateChat} variant="outline" className="flex-1 md:flex-none rounded-2xl h-14 px-8 font-black border-2 border-primary/20 text-primary uppercase">Чат</Button>
               </div>
               {user?.uid && user.uid !== 'public-user' && (
                 <div className="flex flex-col gap-3">
                    <PatientBookingDialog specialistId={specialistId} specialistName={specData?.firstName || 'Эксперт'} />
                    <Button onClick={async () => { setSharingLoading(true); try { await updateDoc(userRef!, { sharedWith: isDataShared ? arrayRemove(specialistId) : arrayUnion(specialistId) }); toast({ title: isDataShared ? 'Доступ отозван' : 'Доступ предоставлен' }); } finally { setSharingLoading(false); } }} disabled={sharingLoading} variant={isDataShared ? "destructive" : "secondary"} className="w-full rounded-2xl h-14 font-black uppercase tracking-widest text-[9px] gap-2 shadow-lg">{sharingLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : isDataShared ? <><ShieldAlert className="h-4 w-4" /> Отозвать доступ</> : <><ShieldCheck className="h-4 w-4" /> Предоставить данные</>}</Button>
                 </div>
               )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-8 px-4">
         <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Публикации</h4>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {specPosts?.map((post) => (
               <Card key={post.id} className="cyber-card overflow-hidden border-none shadow-xl bg-white/5 p-8 space-y-6">
                  <p className="text-lg font-medium leading-relaxed text-white/90">{post.content}</p>
                  {post.imageUrl && <div className="relative aspect-video rounded-[2.5rem] overflow-hidden border-4 border-white/5 shadow-2xl"><Image src={post.imageUrl} alt="Post" fill className="object-cover" unoptimized /></div>}
               </Card>
            ))}
         </div>
      </div>
    </div>
  );
}
