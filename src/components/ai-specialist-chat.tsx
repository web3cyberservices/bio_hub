'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { 
  MessageSquare, 
  Send, 
  X, 
  Loader2, 
  Bot, 
  User, 
  Maximize2, 
  Minimize2,
  Activity
} from 'lucide-react';
import { chatWithSpecialist } from '@/ai/flows/ai-specialist-chat';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

interface Message {
  role: 'user' | 'model';
  content: string;
}

export function AISpecialistChat() {
  const { user } = useUser();
  const { firestore } = useFirestore();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: 'Здравствуйте! Я ваш ИИ-специалист PRO Себя. Чем я могу помочь вам в оптимизации вашего здоровья сегодня?' }
  ]);
  
  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore || user.uid === 'public-user') return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userData } = useDoc<any>(userDocRef);

  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const response = await chatWithSpecialist({
        message: userMessage,
        history: history,
        userContext: userData ? {
          healthGoal: userData.healthGoal,
          weight: userData.weight,
          activityLevel: userData.activityLevel,
        } : undefined
      });
      
      setMessages(prev => [...prev, { role: 'model', content: response.text }]);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка связи',
        description: 'Специалист временно недоступен.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 md:bottom-32 right-6 h-14 w-14 md:h-16 md:w-16 rounded-full bg-primary shadow-[0_20px_50px_rgba(45,122,77,0.4)] hover:scale-110 transition-all z-[110] border-4 border-white"
      >
        <MessageSquare className="h-6 w-6 md:h-7 md:w-7 text-white" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4 md:h-5 md:w-5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 md:h-5 md:w-5 bg-accent"></span>
        </span>
      </Button>
    );
  }

  return (
    <Card className={cn(
      "fixed bottom-24 md:bottom-32 right-4 md:right-6 z-[120] overflow-hidden flex flex-col transition-all duration-500 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border-none bg-white/95 backdrop-blur-xl rounded-[2.5rem]",
      isMinimized 
        ? "h-16 md:h-20 w-64 md:w-80" 
        : "h-[500px] md:h-[600px] max-h-[calc(100vh-160px)] w-[calc(100vw-32px)] md:w-[450px]"
    )}>
      <div className="bg-primary p-4 md:p-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Activity className="h-4 w-4 md:h-5 md:w-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-black text-xs md:text-sm tracking-tight">ИИ-Специалист</h3>
            <Badge variant="outline" className="border-white/30 text-white/80 text-[7px] md:text-[8px] uppercase tracking-widest px-2 py-0">Online</Badge>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:bg-white/10" onClick={() => setIsMinimized(!isMinimized)}>
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:bg-white/10" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <ScrollArea className="flex-1 p-4 md:p-6">
            <div className="space-y-4 md:space-y-6">
              {messages.map((m, i) => (
                <div key={i} className={cn("flex gap-2 md:gap-3", m.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                  <div className={cn("w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm", m.role === 'user' ? "bg-primary text-white" : "bg-muted text-primary")}>
                    {m.role === 'user' ? <User className="h-3 w-3 md:h-4 md:w-4" /> : <Bot className="h-3 w-3 md:h-4 md:w-4" />}
                  </div>
                  <div className={cn("max-w-[85%] p-3 md:p-4 rounded-2xl text-xs md:text-sm font-medium shadow-sm leading-relaxed", m.role === 'user' ? "bg-primary text-white rounded-tr-none" : "bg-muted/50 text-foreground rounded-tl-none")}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary animate-pulse" />
                  </div>
                  <div className="bg-muted/30 p-3 md:p-4 rounded-2xl">
                    <Loader2 className="h-4 w-4 animate-spin text-primary opacity-40" />
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
          <div className="p-4 md:p-6 bg-muted/20 border-t shrink-0">
            <div className="relative flex items-center">
              <Input
                placeholder="Ваш вопрос..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="h-12 md:h-14 rounded-2xl bg-white border-none pr-12 md:pr-14 shadow-inner text-xs md:text-sm font-medium"
              />
              <Button size="icon" onClick={handleSend} disabled={loading || !input.trim()} className="absolute right-2 h-8 w-8 md:h-10 md:w-10 bg-primary shadow-lg shadow-primary/20"><Send className="h-3 w-3 md:h-4 md:w-4 text-white" /></Button>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}