'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, Loader2, MessageSquare, 
  Search, Phone, Video, MoreVertical, CheckCheck, Activity, Bot,
  Pencil, Trash2, X, Check, Mic, Sparkles
} from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, addDoc, doc, updateDoc, where, limit, deleteDoc } from 'firebase/firestore';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';
import { AISpecialistChat } from './ai-specialist-chat';

export function ChatInterface() {
  const { user } = useUser();
  const { firestore } = useFirestore();
  const { toast } = useToast();
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [showAIChat, setShowAIChat] = useState(false);
  const [message, setMessage] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Список чатов пользователя
  const chatsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid || user.uid === 'public-user') return null;
    
    return query(
      collection(firestore, 'chats'),
      where('participants', 'array-contains', user.uid),
      limit(20)
    );
  }, [firestore, user?.uid]);

  const { data: chats, isLoading: chatsLoading } = useCollection<any>(chatsQuery);

  // Сообщения активного чата
  const messagesQuery = useMemoFirebase(() => {
    if (!firestore || !activeChatId) return null;
    return query(
      collection(firestore, 'chats', activeChatId, 'messages'),
      limit(100)
    );
  }, [firestore, activeChatId]);

  const { data: messages } = useCollection<any>(messagesQuery);

  const activeChat = chats?.find(c => c.id === activeChatId);
  const otherParticipantId = activeChat?.participants?.find((id: string) => id !== user?.uid);
  const otherParticipant = activeChat?.participantDetails?.[otherParticipantId];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

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
      setMessage(prev => (prev ? prev + ' ' : '') + transcript);
      toast({ title: 'Голос распознан' });
    };
    recognition.start();
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!message.trim() || !activeChatId || !user?.uid || !firestore) return;

    if (editingMessageId) {
      const msgRef = doc(firestore, 'chats', activeChatId, 'messages', editingMessageId);
      updateDocumentNonBlocking(msgRef, {
        text: message.trim(),
        editedAt: new Date().toISOString(),
        isEdited: true
      });
      setEditingMessageId(null);
      setMessage('');
      return;
    }

    const chatRef = doc(firestore, 'chats', activeChatId);
    const messagesRef = collection(chatRef, 'messages');

    const newMessage = {
      senderId: user.uid,
      text: message.trim(),
      createdAt: new Date().toISOString(),
    };

    addDoc(messagesRef, newMessage).catch(async (err) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: `${chatRef.path}/messages`,
        operation: 'create',
        requestResourceData: newMessage,
      }));
    });

    updateDoc(chatRef, {
      lastMessage: message.trim(),
      updatedAt: new Date().toISOString()
    }).catch(async (err) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: chatRef.path,
        operation: 'update',
        requestResourceData: { lastMessage: message.trim() },
      }));
    });

    setMessage('');
  };

  const handleStartEdit = (msg: any) => {
    setEditingMessageId(msg.id);
    setMessage(msg.text);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setMessage('');
  };

  const handleDeleteMessage = (msgId: string) => {
    if (!activeChatId || !firestore) return;
    const msgRef = doc(firestore, 'chats', activeChatId, 'messages', msgId);
    deleteDocumentNonBlocking(msgRef);
    toast({ title: 'Сообщение удалено' });
  };

  const handleOpenAIChat = () => {
    setShowAIChat(true);
    setActiveChatId(null);
  };

  const handleSelectRegularChat = (id: string) => {
    setActiveChatId(id);
    setShowAIChat(false);
  };

  if (chatsLoading) {
    return (
      <div className="flex h-[600px] items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto opacity-20" />
          <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">Загрузка диалогов...</p>
        </div>
      </div>
    );
  }

  const sortedChats = chats ? [...chats].sort((a, b) => {
    const timeA = new Date(a.updatedAt || 0).getTime();
    const timeB = new Date(b.updatedAt || 0).getTime();
    return timeB - timeA;
  }) : [];

  const sortedMessages = messages ? [...messages].sort((a, b) => {
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  }) : [];

  return (
    <div className="flex h-[70vh] md:h-[750px] bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden">
      <div className={cn(
        "w-full md:w-80 border-r border-white/10 bg-black/40 flex flex-col transition-all",
        (activeChatId || showAIChat) ? "hidden md:flex" : "flex"
      )}>
        <div className="p-6 border-b border-white/5 space-y-4">
          <h2 className="text-xl font-black tracking-tight text-white uppercase">Чаты</h2>
          <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
             <Input placeholder="Поиск..." className="pl-9 h-10 rounded-xl bg-white/5 border-none text-xs text-white" />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-2">
            {/* AI Specialist Pinned Entry */}
            <button
              onClick={handleOpenAIChat}
              className={cn(
                "w-full p-4 rounded-[1.5rem] flex items-center gap-4 transition-all group relative overflow-hidden",
                showAIChat ? "bg-primary text-slate-950 shadow-lg" : "bg-primary/5 hover:bg-primary/10 text-primary"
              )}
            >
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border transition-all", showAIChat ? "bg-white/20 border-white/30" : "bg-primary/20 border-primary/20")}>
                <Sparkles className={cn("h-6 w-6", showAIChat ? "text-white animate-pulse" : "text-primary")} />
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                   <p className="font-black text-sm truncate uppercase tracking-tight">ИИ-Консультант PRO</p>
                </div>
                <p className={cn("text-[10px] truncate font-bold uppercase tracking-widest", showAIChat ? "text-slate-950/60" : "text-primary/60")}>Мгновенная помощь</p>
              </div>
              {!showAIChat && <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary neo-glow" />}
            </button>

            <div className="h-px bg-white/5 my-2 mx-4" />

            {sortedChats.map((chat) => {
              const oId = chat.participants.find((id: string) => id !== user?.uid);
              const oDetails = chat.participantDetails?.[oId];
              const isSelected = activeChatId === chat.id;
              return (
                <button
                  key={chat.id}
                  onClick={() => handleSelectRegularChat(chat.id)}
                  className={cn(
                    "w-full p-4 rounded-[1.5rem] flex items-center gap-4 transition-all hover:bg-white/5",
                    isSelected ? "bg-white/10 shadow-xl border border-white/5" : "opacity-60"
                  )}
                >
                  <Avatar className="h-12 w-12 rounded-2xl border border-white/10">
                    <AvatarImage src={oDetails?.photo} />
                    <AvatarFallback className="bg-white/5 text-white font-bold">{oDetails?.name?.charAt(0) || '?'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                       <p className="font-black text-sm text-white truncate">{oDetails?.name || 'Специалист'}</p>
                       <span className="text-[8px] font-bold text-white/30 uppercase">{chat.updatedAt && format(new Date(chat.updatedAt), 'HH:mm')}</span>
                    </div>
                    <p className="text-[11px] text-white/40 truncate font-medium">{chat.lastMessage || 'Начните общение...'}</p>
                  </div>
                </button>
              );
            })}
            
            {(!sortedChats || sortedChats.length === 0) && !showAIChat && (
              <div className="p-10 text-center space-y-2 opacity-20">
                 <MessageSquare className="h-10 w-10 mx-auto text-white" />
                 <p className="text-[10px] font-black uppercase tracking-widest text-white">Список пуст</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <div className={cn(
        "flex-1 flex flex-col bg-black/20",
        (!activeChatId && !showAIChat) ? "hidden md:flex items-center justify-center" : "flex"
      )}>
        {showAIChat ? (
          <AISpecialistChat onBack={() => setShowAIChat(false)} />
        ) : activeChatId ? (
          <>
            <div className="p-4 md:p-6 bg-white/5 border-b border-white/5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="md:hidden h-8 w-8 text-white/40" onClick={() => setActiveChatId(null)}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Avatar className="h-10 w-10 md:h-12 md:w-12 rounded-xl border border-white/10">
                   <AvatarImage src={otherParticipant?.photo} />
                   <AvatarFallback className="bg-white/5 text-white font-bold">{otherParticipant?.name?.charAt(0) || '?'}</AvatarFallback>
                </Avatar>
                <div>
                   <h3 className="font-black text-sm md:text-base leading-none text-white">{otherParticipant?.name || 'Загрузка...'}</h3>
                   <div className="flex items-center gap-1.5 mt-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[8px] md:text-[10px] font-bold text-white/30 uppercase tracking-widest">В сети</span>
                   </div>
                </div>
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                 <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9 md:h-11 md:w-11 text-white/20"><Phone className="h-4 w-4 md:h-5 md:w-5" /></Button>
                 <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9 md:h-11 md:w-11 text-white/20"><Video className="h-4 w-4 md:h-5 md:w-5" /></Button>
                 <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9 md:h-11 md:w-11 text-white/20"><MoreVertical className="h-4 w-4 md:h-5 md:w-5" /></Button>
              </div>
            </div>

            <ScrollArea className="flex-1 p-6 md:p-10">
              <div className="space-y-6 md:space-y-8">
                {sortedMessages.map((m) => (
                  <div key={m.id} className={cn("flex flex-col gap-1.5", m.senderId === user?.uid ? "items-end" : "items-start")}>
                    <div className="flex items-center gap-2 max-w-[85%] md:max-w-[70%] group">
                      {m.senderId === user?.uid && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                           <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-white/20 hover:text-primary" onClick={() => handleStartEdit(m)}>
                              <Pencil className="h-3 w-3" />
                           </Button>
                           <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-white/20 hover:text-destructive" onClick={() => handleDeleteMessage(m.id)}>
                              <Trash2 className="h-3 w-3" />
                           </Button>
                        </div>
                      )}
                      <div className={cn(
                        "p-4 md:p-5 rounded-[1.8rem] text-sm font-medium shadow-lg transition-all relative",
                        m.senderId === user?.uid 
                          ? "bg-primary text-slate-950 rounded-tr-none" 
                          : "bg-white/5 text-white/90 rounded-tl-none border border-white/5 backdrop-blur-sm"
                      )}>
                        {m.text}
                        {m.isEdited && (
                          <span className="block text-[7px] md:text-[8px] opacity-40 mt-1 uppercase font-black">изменено</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-2">
                       <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">{format(new Date(m.createdAt), 'HH:mm')}</span>
                       {m.senderId === user?.uid && <CheckCheck className="h-3 w-3 text-primary/40" />}
                    </div>
                  </div>
                ))}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            <div className="p-4 md:p-8 bg-black/40 border-t border-white/5 shrink-0">
               {editingMessageId && (
                 <div className="mb-2 px-4 flex items-center justify-between bg-primary/10 py-2 rounded-xl border border-primary/20">
                   <p className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                     <Pencil className="h-3 w-3" /> Редактирование
                   </p>
                   <Button variant="ghost" size="icon" className="h-6 w-6 text-white/40" onClick={handleCancelEdit}>
                     <X className="h-3 w-3" />
                   </Button>
                 </div>
               )}
               <form onSubmit={handleSendMessage} className="relative flex items-center gap-4">
                  <div className="relative flex-1">
                    <Input 
                      placeholder={editingMessageId ? "Измените сообщение..." : "Напишите сообщение..."}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="h-14 md:h-16 rounded-2xl md:rounded-[2rem] bg-white/5 border-none px-6 md:px-8 font-bold text-sm text-white placeholder:text-white/20 focus-visible:ring-4 focus-visible:ring-primary/5 shadow-inner pr-24 md:pr-32"
                    />
                    <div className="absolute right-12 md:right-16 top-1/2 -translate-y-1/2">
                       <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          onClick={startVoiceInput}
                          className={cn(
                            "h-10 w-10 md:h-12 md:w-12 rounded-full transition-all",
                            isRecording ? "bg-red-500 text-white animate-pulse" : "bg-white/5 text-primary"
                          )}
                       >
                          <Mic className="h-4 w-4 md:h-5 md:w-5" />
                       </Button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    disabled={!message.trim()} 
                    className={cn(
                      "h-14 md:h-16 w-14 md:w-16 rounded-xl md:rounded-2xl shadow-2xl transition-transform hover:scale-105 shrink-0",
                      editingMessageId ? "bg-emerald-500" : "bg-primary"
                    )}
                  >
                     {editingMessageId ? <Check className="h-5 w-5 md:h-6 md:w-6 text-white" /> : <Send className="h-5 w-5 md:h-6 md:w-6 text-slate-950" />}
                  </Button>
               </form>
            </div>
          </>
        ) : (
          <div className="text-center space-y-6 opacity-20">
             <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto border border-primary/20">
                <Activity className="h-10 w-10 text-primary" />
             </div>
             <div className="space-y-1">
                <h3 className="text-2xl font-black tracking-tight text-white uppercase">Выберите диалог</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Или начните консультацию с ИИ</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
