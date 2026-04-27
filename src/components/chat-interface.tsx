'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, Loader2, MessageSquare, 
  Sparkles, ArrowLeft, Bell
} from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, addDoc, doc, updateDoc, where, limit } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { AISpecialistChat } from './ai-specialist-chat';
import { sendAppNotification } from '@/app/actions/notifications';

interface ChatInterfaceProps {
  initialSpecialistId?: string | null;
}

export function ChatInterface({ initialSpecialistId }: ChatInterfaceProps) {
  const { user } = useUser();
  const { firestore } = useFirestore();
  const { toast } = useToast();
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [showAIChat, setShowAIChat] = useState(false);
  const [message, setMessage] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const chatsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid || user.uid === 'public-user') return null;
    return query(collection(firestore, 'chats'), where('participants', 'array-contains', user.uid), limit(20));
  }, [firestore, user?.uid]);

  const { data: chats, isLoading: chatsLoading } = useCollection<any>(chatsQuery);

  useEffect(() => {
    if (chats && initialSpecialistId) {
      const targetChat = chats.find(c => c.participants.includes(initialSpecialistId));
      if (targetChat) {
        setActiveChatId(targetChat.id);
        setShowAIChat(false);
      }
    }
  }, [chats, initialSpecialistId]);

  const messagesQuery = useMemoFirebase(() => {
    if (!firestore || !activeChatId) return null;
    return query(collection(firestore, 'chats', activeChatId, 'messages'), limit(100));
  }, [firestore, activeChatId]);

  const { data: messages } = useCollection<any>(messagesQuery);
  const activeChat = chats?.find(c => c.id === activeChatId);
  const otherParticipantId = activeChat?.participants?.find((id: string) => id !== user?.uid);
  const otherParticipant = activeChat?.participantDetails?.[otherParticipantId];

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!message.trim() || !activeChatId || !user?.uid || !firestore) return;
    const currentMsg = message.trim();
    setMessage('');
    try {
      if (editingMessageId) {
        await updateDoc(doc(firestore, 'chats', activeChatId, 'messages', editingMessageId), { text: currentMsg, editedAt: new Date().toISOString(), isEdited: true });
        setEditingMessageId(null);
      } else {
        await addDoc(collection(firestore, 'chats', activeChatId, 'messages'), { senderId: user.uid, text: currentMsg, createdAt: new Date().toISOString() });
        await updateDoc(doc(firestore, 'chats', activeChatId), { lastMessage: currentMsg, updatedAt: new Date().toISOString() });
        
        // Отправка уведомления (Telegram + Браузер)
        if (otherParticipantId) {
          sendAppNotification({
            userId: otherParticipantId,
            title: `Новое сообщение от ${(user as any).displayName || 'Пользователя'}`,
            message: currentMsg,
            type: 'message'
          });
        }
      }
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Ошибка отправки', description: 'Не удалось отправить сообщение.' });
      setMessage(currentMsg);
    }
  };

  const handleOpenAIChat = () => { setShowAIChat(true); setActiveChatId(null); };
  const handleSelectRegularChat = (id: string) => { 
    setActiveChatId(id); 
    setShowAIChat(false);
    requestNotificationPermission();
  };

  if (chatsLoading) return <div className="flex h-[600px] items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" /></div>;

  const sortedMessages = messages ? [...messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) : [];

  return (
    <div className="flex h-[70vh] md:h-[750px] bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden">
      <div className={cn("w-full md:w-80 border-r border-white/10 bg-black/40 flex flex-col transition-all", (activeChatId || showAIChat) ? "hidden md:flex" : "flex")}>
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-xl font-black text-white uppercase">Чаты</h2>
          <Button variant="ghost" size="icon" onClick={requestNotificationPermission} className="text-white/20 hover:text-primary"><Bell className="h-4 w-4" /></Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-2">
            <button onClick={handleOpenAIChat} className={cn("w-full p-4 rounded-[1.5rem] flex items-center gap-4 transition-all", showAIChat ? "bg-primary text-slate-950" : "bg-primary/5 text-primary")}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center border bg-primary/20 border-primary/20"><Sparkles className="h-6 w-6" /></div>
              <div className="flex-1 text-left"><p className="font-black text-sm uppercase">ИИ-Консультант</p></div>
            </button>
            {chats?.map((chat) => {
              const oId = chat.participants.find((id: string) => id !== user?.uid);
              const oDetails = chat.participantDetails?.[oId];
              return (
                <button key={chat.id} onClick={() => handleSelectRegularChat(chat.id)} className={cn("w-full p-4 rounded-[1.5rem] flex items-center gap-4 transition-all hover:bg-white/5", activeChatId === chat.id ? "bg-white/10" : "opacity-60")}>
                  <Avatar className="h-12 w-12 rounded-2xl"><AvatarImage src={oDetails?.photo} /><AvatarFallback>{oDetails?.name?.charAt(0)}</AvatarFallback></Avatar>
                  <div className="flex-1 text-left truncate"><p className="font-black text-sm text-white">{oDetails?.name || 'Специалист'}</p><p className="text-[11px] text-white/40 truncate">{chat.lastMessage}</p></div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>
      <div className={cn("flex-1 flex flex-col bg-black/20", (!activeChatId && !showAIChat) ? "hidden md:flex items-center justify-center" : "flex")}>
        {showAIChat ? <AISpecialistChat onBack={() => setShowAIChat(false)} /> : activeChatId ? (
          <>
            <div className="p-4 md:p-6 bg-white/5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setActiveChatId(null)}><ArrowLeft className="h-4 w-4" /></Button>
                <Avatar className="h-10 w-10"><AvatarImage src={otherParticipant?.photo} /><AvatarFallback>{otherParticipant?.name?.charAt(0)}</AvatarFallback></Avatar>
                <div><h3 className="font-black text-white">{otherParticipant?.name}</h3></div>
              </div>
            </div>
            <ScrollArea className="flex-1 p-6 md:p-10">
              <div className="space-y-6">
                {sortedMessages.map((m) => (
                  <div key={m.id} className={cn("flex flex-col", m.senderId === user?.uid ? "items-end" : "items-start")}>
                    <div className={cn("p-4 rounded-[1.8rem] text-sm max-w-[85%]", m.senderId === user?.uid ? "bg-primary text-slate-950 rounded-tr-none" : "bg-white/5 text-white/90 rounded-tl-none")}>
                      {m.text}
                    </div>
                  </div>
                ))}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>
            <form onSubmit={handleSendMessage} className="p-4 md:p-8 border-t border-white/5 flex gap-4">
              <Input placeholder="Напишите сообщение..." value={message} onChange={e => setMessage(e.target.value)} className="h-14 rounded-2xl bg-white/5 border-none text-white" />
              <Button type="submit" disabled={!message.trim()} className="h-14 w-14 rounded-2xl bg-primary shadow-xl shrink-0"><Send className="h-5 w-5 text-slate-950" /></Button>
            </form>
          </>
        ) : <div className="text-center opacity-20"><MessageSquare className="h-16 w-16 mx-auto mb-4" /><p className="font-black uppercase tracking-widest">Выберите диалог</p></div>}
      </div>
    </div>
  );
}
