
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BookOpen, FileText, Plus, Search, 
  ShieldCheck, Loader2, User, ChevronRight,
  Database, Zap, X, Trash2, Edit3, MessageSquare, Quote
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { 
  getSourcesLocal, 
  saveSourceLocal, 
  deleteSourceLocal, 
  updateSourceContent,
  DiarySource 
} from '@/lib/local-diary-storage';
import { AISpecialistChat } from './ai-specialist-chat';

export function SpecialistDiaryHub() {
  const { user } = useUser();
  const { firestore } = useFirestore();
  const { toast } = useToast();
  
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [sources, setSources] = useState<DiarySource[]>([]);
  const [isUploading, setIsAddingSource] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'notes'>('chat');
  const [loading, setLoading] = useState(false);

  // Получаем список пациентов врача из Firestore
  const patientsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'users'), where('sharedWith', 'array-contains', user.uid));
  }, [firestore, user?.uid]);

  const { data: patients, isLoading: patientsLoading } = useCollection<any>(patientsQuery);
  const selectedPatient = patients?.find(p => p.id === selectedPatientId);

  // Загрузка локальных источников при смене пациента
  useEffect(() => {
    if (selectedPatientId) {
      loadLocalData();
    }
  }, [selectedPatientId]);

  const loadLocalData = async () => {
    if (!selectedPatientId) return;
    const localSources = await getSourcesLocal(selectedPatientId);
    setSources(localSources);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedPatientId) return;

    setLoading(true);
    try {
      const text = await file.text(); // Упрощенно для TXT. Для PDF/DOCX нужны доп. библиотеки.
      const newSource: DiarySource = {
        id: Math.random().toString(36).substr(2, 9),
        patientId: selectedPatientId,
        name: file.name,
        content: text,
        type: file.name.endsWith('.pdf') ? 'pdf' : 'txt',
        createdAt: new Date().toISOString()
      };
      await saveSourceLocal(newSource);
      await loadLocalData();
      toast({ title: 'Файл загружен локально' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Ошибка загрузки' });
    } finally {
      setLoading(false);
      setIsAddingSource(false);
    }
  };

  const handleDeleteSource = async (id: string) => {
    await deleteSourceLocal(id);
    await loadLocalData();
    toast({ title: 'Источник удален' });
  };

  if (patientsLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-12 w-12 text-primary" /></div>;

  return (
    <div className="flex h-[calc(100vh-120px)] bg-[#010411] text-white rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl">
      {/* ЛЕВАЯ ПАНЕЛЬ: ПАЦИЕНТЫ И ИСТОЧНИКИ */}
      <div className="w-80 border-r border-white/5 flex flex-col bg-black/40">
        <div className="p-6 border-b border-white/5 space-y-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                <BookOpen className="h-5 w-5 text-primary" />
             </div>
             <h2 className="text-lg font-black uppercase tracking-tight">Дневник врача</h2>
          </div>
          
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-xl flex items-center gap-2">
             <ShieldCheck className="h-3 w-3 text-emerald-400" />
             <span className="text-[8px] font-black uppercase text-emerald-400/80 tracking-widest">Local Security Mode Active</span>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-8">
            {/* Список пациентов */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-white/30 px-2 tracking-widest">Пациенты</label>
              {patients?.map((p: any) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPatientId(p.id)}
                  className={cn(
                    "w-full p-3 rounded-2xl flex items-center gap-3 transition-all",
                    selectedPatientId === p.id ? "bg-primary text-slate-950 shadow-lg" : "hover:bg-white/5"
                  )}
                >
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center uppercase font-black text-xs">
                    {p.firstName?.charAt(0)}
                  </div>
                  <span className="flex-1 text-left text-sm font-bold truncate">{p.firstName} {p.lastName}</span>
                  {selectedPatientId === p.id && <ChevronRight className="h-4 w-4" />}
                </button>
              ))}
            </div>

            {/* Источники выбранного пациента */}
            {selectedPatientId && (
              <div className="space-y-4 animate-in fade-in duration-500">
                <div className="flex items-center justify-between px-2">
                  <label className="text-[10px] font-black uppercase text-white/30 tracking-widest">Источники ({sources.length})</label>
                  <button onClick={() => setIsAddingSource(true)} className="text-primary hover:text-white transition-colors">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                
                {isUploading && (
                  <div className="p-3 border-2 border-dashed border-primary/30 rounded-2xl bg-primary/5">
                    <label className="cursor-pointer flex flex-col items-center gap-2">
                      <Database className="h-6 w-6 text-primary/60" />
                      <span className="text-[9px] font-black uppercase text-primary">Выбрать PDF/TXT</span>
                      <input type="file" className="hidden" onChange={handleFileUpload} accept=".txt,.pdf,.docx" />
                    </label>
                  </div>
                )}

                <div className="space-y-2">
                  {sources.map(source => (
                    <div key={source.id} className="group p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                       <div className="flex items-center gap-3 truncate">
                          <FileText className="h-4 w-4 text-primary/40 shrink-0" />
                          <span className="text-[11px] font-medium truncate">{source.name}</span>
                       </div>
                       <button onClick={() => handleDeleteSource(source.id)} className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all">
                          <Trash2 className="h-3.5 w-3.5" />
                       </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* ПРАВАЯ ПАНЕЛЬ: ЧАТ И ЗАМЕТКИ */}
      <div className="flex-1 flex flex-col relative bg-black/20">
        {!selectedPatientId ? (
          <div className="flex-1 flex flex-col items-center justify-center opacity-20 space-y-4">
             <Database className="h-16 w-16" />
             <p className="font-black uppercase tracking-[0.3em]">Выберите пациента для начала работы</p>
          </div>
        ) : (
          <>
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                   <User className="h-6 w-6 text-white/40" />
                </div>
                <div>
                   <h3 className="font-black text-xl text-white uppercase tracking-tight">{selectedPatient?.firstName} {selectedPatient?.lastName}</h3>
                   <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Индивидуальный блокнот ИИ</p>
                </div>
              </div>
              <div className="flex bg-white/5 p-1 rounded-xl">
                 <button onClick={() => setActiveTab('chat')} className={cn("px-6 py-2 rounded-lg font-black text-[10px] uppercase transition-all", activeTab === 'chat' ? "bg-primary text-slate-950" : "text-white/40")}>Чат-анализ</button>
                 <button onClick={() => setActiveTab('notes')} className={cn("px-6 py-2 rounded-lg font-black text-[10px] uppercase transition-all", activeTab === 'notes' ? "bg-primary text-slate-950" : "text-white/40")}>Заметки</button>
              </div>
            </div>

            <div className="flex-1 relative overflow-hidden">
               {activeTab === 'chat' ? (
                 <div className="h-full flex flex-col">
                    <div className="flex-1 p-6 md:p-10 space-y-6 overflow-y-auto">
                       <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 max-w-2xl">
                          <p className="text-sm font-medium text-white/70 italic leading-relaxed">
                            Я проанализировал {sources.length} локальных файлов этого пациента. Задайте любой вопрос, и я найду ответы с указанием источников.
                          </p>
                          <div className="flex flex-wrap gap-2">
                             <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[9px] uppercase font-black px-3 py-1">Анализ симптомов</Badge>
                             <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[9px] uppercase font-black px-3 py-1">Сводка по анализам</Badge>
                             <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[9px] uppercase font-black px-3 py-1">Прогноз дефицитов</Badge>
                          </div>
                       </div>
                    </div>
                    
                    <div className="p-8 border-t border-white/5 bg-black/40">
                       <div className="relative max-w-4xl mx-auto">
                          <input 
                            placeholder={`Спросить о состоянии ${selectedPatient?.firstName}...`} 
                            className="w-full h-16 rounded-2xl bg-white/5 border-none px-8 font-bold text-white shadow-inner focus:ring-4 focus:ring-primary/10 transition-all pr-16"
                          />
                          <button className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 bg-primary rounded-xl flex items-center justify-center shadow-xl hover:scale-110 transition-all">
                             <Zap className="h-5 w-5 text-slate-950" />
                          </button>
                       </div>
                    </div>
                 </div>
               ) : (
                 <div className="h-full p-10 bg-[#010411]">
                    <textarea 
                      placeholder="Ваши врачебные заметки по пациенту..." 
                      className="w-full h-full bg-transparent border-none text-lg font-medium text-white/80 resize-none focus:ring-0 leading-relaxed"
                    />
                 </div>
               )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Badge({ children, variant, className }: any) {
  return <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 font-bold", className)}>{children}</span>;
}
