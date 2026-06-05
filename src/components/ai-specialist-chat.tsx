'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  MessageSquare, 
  Send, 
  Loader2, 
  Bot, 
  User, 
  Activity,
  Mic,
  ArrowLeft
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

interface Message {
  role: 'user' | 'model';
  content: string;
}

interface AISpecialistChatProps {
  onBack?: () => void;
  className?: string;
}

export function AISpecialistChat({ onBack, className }: AISpecialistChatProps) {
  const { user } = useUser();
  const { firestore } = useFirestore();
  const [isRecording, setIsRecording] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: 'Здравствуйте! Я ваш ИИ-специалист Bio Hub Pro. Чем я могу помочь вам сегодня?' }
  ]);
  
  const userDocRef = useMemoFirebase(() => {
    if (!user?.uid || !firestore || user.uid === 'public-user') return null;
    return doc(firestore, 'users', user.uid);
  }, [user?.uid, firestore]);

  const { data: userData } = useDoc<any>(userDocRef);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

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
      setInput(prev => (prev ? prev + ' ' : '') + transcript);
    };
    recognition.start();
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      // ДИНАМИЧЕСКИЙ ИМПОРТ: Разрывает круговую зависимость для Turbopack
      const { chatWithSpecialist } = await import('@/ai/flows/ai-specialist-chat');
      
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const response = await chatWithSpecialist({
        message: userMessage,
        history: history,
        userContext: userData ? {
          firstName: userData.firstName || 'Пациент',
          healthGoal: userData.healthGoal,
          weight: userData.weight,
        } : undefined
      });
      
      setMessages(prev => [...prev, { role: 'model', content: response.text }]);
    } catch (error: any) {
      console.error("AI Chat Error:", error);
      toast({
        variant: 'destructive',
        title: 'Ошибка ИИ',
        description: 'Не удалось получить ответ от ассистента.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col h-full bg-transparent relative overflow-hidden", className)}>
      <div className="p-4 md:p-6 bg-primary/10 border-b border-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          {onBack && <Button variant="ghost" size="icon" className="md:hidden h-8 w-8 text-primary" onClick={onBack}><ArrowLeft className="h-4 w-4" /></Button>}
          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30"><Activity className="h-5 w-5 text-primary" /></div>
          <div>
            <h3 className="text-white font-black text-sm md:text-base tracking-tight uppercase">ИИ-Специалист PRO</h3>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[8px] md:text-[10px] font-bold text-primary/60 uppercase tracking-widest">Active Intelligence</span>
            </div>
          </div>
        </div>
      </div>
      <ScrollArea className="flex-1 p-6 md:p-10">
        <div className="space-y-6 md:space-y-8 pb-20">
          {messages.map((m, i) => (
            <div key={i} className={cn("flex flex-col gap-2", m.role === 'user' ? "items-end" : "items-start")}>
              <div className={cn("p-4 md:p-6 rounded-[1.8rem] text-sm md:text-base font-medium shadow-lg transition-all relative max-w-[85%] md:max-w-[75%]", m.role === 'user' ? "bg-primary text-slate-950 rounded-tr-none" : "bg-white/5 text-white/90 rounded-tl-none border border-white/10 backdrop-blur-sm")}>
                <div className="flex items-center gap-2 mb-2 opacity-40">
                  {m.role === 'user' ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                  <span className="text-[8px] font-black uppercase tracking-widest">{m.role === 'user' ? 'Вы' : 'ИИ Помощник'}</span>
                </div>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex flex-col items-start gap-2">
              <div className="bg-white/5 p-4 md:p-6 rounded-[1.8rem] rounded-tl-none border border-white/10 flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-xs font-black uppercase tracking-widest text-primary/40 animate-pulse">Генерация ответа...</span>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>
      <div className="p-4 md:p-8 bg-black/20 border-t border-white/5 shrink-0">
        <div className="relative flex items-center gap-4">
          <div className="relative flex-1">
            <Input 
              placeholder="Напишите сообщение..." 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
              className="h-14 md:h-16 rounded-2xl md:rounded-[2rem] bg-primary/10 border-none px-6 md:px-8 font-bold text-white placeholder:text-white/20 focus-visible:ring-4 focus-visible:ring-primary/5 shadow-inner pr-24 md:pr-32" 
            />
            <div className="absolute right-12 md:right-16 top-1/2 -translate-y-1/2">
              <Button type="button" variant="ghost" size="icon" onClick={startVoiceInput} className={cn("h-10 w-10 md:h-12 md:w-12 rounded-full transition-all", isRecording ? "bg-red-500 text-white animate-pulse" : "bg-white/10 text-primary")}>
                <Mic className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </div>
          </div>
          <Button size="icon" onClick={handleSend} disabled={loading || !input.trim()} className="h-14 md:h-16 w-14 md:w-16 rounded-xl md:rounded-[2rem] bg-primary shadow-xl shadow-primary/20 shrink-0">
            <Send className="h-5 w-5 md:h-6 md:w-6 text-slate-950" />
          </Button>
        </div>
      </div>
    </div>
  );
}