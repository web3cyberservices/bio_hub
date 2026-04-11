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
  Sparkles, 
  Bot, 
  User, 
  Maximize2, 
  Minimize2,
  Activity
} from 'lucide-react';
import { chatWithSpecialist, AISpecialistChatOutput } from '@/ai/flows/ai-specialist-chat';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUser, useFirestore, useDoc } from '@/firebase';
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
  
  const userDocRef = user && firestore ? doc(firestore, 'users', user.uid) : null;
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
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full bg-primary shadow-2xl hover:scale-110 transition-all z-50"
      >
        <MessageSquare className="h-7 w-7 text-white" />
      </Button>
    );
  }

  return (
    <Card className={cn(
      "fixed bottom-6 right-6 z-50 overflow-hidden flex flex-col transition-all duration-500 shadow-2xl border-none bg-white/95 backdrop-blur-xl rounded-[2.5rem]",
      isMinimized ? "h-20 w-80" : "h-[600px] w-[90vw] md:w-[450px]"
    )}>
      <div className="bg-primary p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="h-5 w-5 text-white" />
          <div>
            <h3 className="text-white font-black text-sm tracking-tight">ИИ-Специалист</h3>
            <Badge variant="outline" className="border-white/30 text-white/80 text-[8px] uppercase tracking-widest px-2 py-0">Online</Badge>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-white/70" onClick={() => setIsMinimized(!isMinimized)}>
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-white/70" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {messages.map((m, i) => (
                <div key={i} className={cn("flex gap-3", m.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", m.role === 'user' ? "bg-primary text-white" : "bg-muted text-primary")}>
                    {m.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className={cn("max-w-[80%] p-4 rounded-2xl text-sm font-medium", m.role === 'user' ? "bg-primary/10 rounded-tr-none" : "bg-muted/50 rounded-tl-none")}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && <Loader2 className="h-6 w-6 animate-spin text-primary opacity-20" />}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
          <div className="p-6 bg-muted/20 border-t">
            <div className="relative flex items-center">
              <Input
                placeholder="Задайте вопрос..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="h-14 rounded-2xl bg-white border-none pr-14 shadow-inner"
              />
              <Button size="icon" onClick={handleSend} disabled={loading || !input.trim()} className="absolute right-2 h-10 w-10 bg-primary"><Send className="h-4 w-4 text-white" /></Button>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
