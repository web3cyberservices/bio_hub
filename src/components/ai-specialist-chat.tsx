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

interface Message {
  role: 'user' | 'model';
  content: string;
}

export function AISpecialistChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: 'Здравствуйте! Я ваш ИИ-специалист PRO Себя. Чем я могу помочь вам в оптимизации вашего здоровья сегодня?' }
  ]);
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
      });
      
      setMessages(prev => [...prev, { role: 'model', content: response.text }]);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка связи',
        description: 'Специалист временно недоступен. Попробуйте позже.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full bg-primary shadow-2xl hover:scale-110 transition-all duration-300 z-50 group"
      >
        <MessageSquare className="h-7 w-7 text-white group-hover:rotate-12 transition-transform" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-white"></span>
        </span>
      </Button>
    );
  }

  return (
    <Card className={cn(
      "fixed bottom-6 right-6 z-50 overflow-hidden flex flex-col transition-all duration-500 shadow-[0_30px_90px_rgba(0,0,0,0.2)] border-none bg-white/90 backdrop-blur-2xl rounded-[2.5rem]",
      isMinimized ? "h-20 w-80" : "h-[600px] w-[90vw] md:w-[450px]"
    )}>
      {/* Header */}
      <div className="bg-primary p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-black text-sm tracking-tight leading-none">ИИ-Специалист</h3>
            <Badge variant="outline" className="mt-1 border-white/30 text-white/80 text-[8px] uppercase tracking-widest px-2 py-0">Online</Badge>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10" onClick={() => setIsMinimized(!isMinimized)}>
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {messages.map((m, i) => (
                <div key={i} className={cn(
                  "flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
                  m.role === 'user' ? "flex-row-reverse" : "flex-row"
                )}>
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    m.role === 'user' ? "bg-primary text-white" : "bg-muted text-primary"
                  )}>
                    {m.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className={cn(
                    "max-w-[80%] p-4 rounded-2xl text-sm font-medium leading-relaxed",
                    m.role === 'user' 
                      ? "bg-primary/10 text-foreground rounded-tr-none" 
                      : "bg-muted/50 text-foreground rounded-tl-none border border-muted"
                  )}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3 animate-pulse">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  </div>
                  <div className="bg-muted/50 p-4 rounded-2xl rounded-tl-none border border-muted">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-6 bg-muted/20 border-t border-muted">
            <div className="relative flex items-center">
              <Input
                placeholder="Задайте вопрос специалисту..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="h-14 rounded-2xl bg-white border-none pr-14 shadow-inner focus:ring-2 focus:ring-primary/20 font-medium"
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="absolute right-2 h-10 w-10 rounded-xl bg-primary shadow-lg hover:bg-primary/90 transition-all active:scale-90"
              >
                <Send className="h-4 w-4 text-white" />
              </Button>
            </div>
            <p className="text-[9px] text-muted-foreground mt-3 text-center uppercase tracking-widest font-black opacity-40">
              AI-специалист PRO Себя • Биометрический анализ v3.0
            </p>
          </div>
        </>
      )}
    </Card>
  );
}
