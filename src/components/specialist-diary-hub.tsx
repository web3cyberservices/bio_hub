
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BookOpen, FileText, Plus, Search, 
  ShieldCheck, Loader2, User, ChevronRight,
  Database, Zap, X, Trash2, Folder, FolderOpen,
  File, RefreshCw, Info, AlertTriangle, Save,
  ArrowLeft, Bot, Settings, Download, Monitor,
  Cpu, Terminal, MessageSquare, Sparkles, Send
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { get as getInIdb, set as setInIdb } from 'idb-keyval';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Интерфейсы для работы с файловой системой
interface FileNode {
  name: string;
  kind: 'file' | 'directory';
  handle: FileSystemFileHandle | FileSystemDirectoryHandle;
  children?: FileNode[];
  isOpen?: boolean;
}

interface ActiveFile {
  name: string;
  content: string;
  originalContent: string;
  handle: FileSystemFileHandle;
  isDirty: boolean;
}

interface ChatMessage {
  role: 'assistant' | 'user';
  text: string;
}

export function SpecialistDiaryHub() {
  const { user } = useUser();
  const { firestore } = useFirestore();
  const { toast } = useToast();
  
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [rootHandle, setRootHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [activeFile, setActiveFile] = useState<ActiveFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [aiSidebarTab, setAiSidebarTab] = useState<'chat' | 'models'>('chat');
  const [isFileSystemSupported, setIsFileSystemSupported] = useState(true);

  // Состояния для ИИ-чата в дневнике
  const [aiInput, setAiInput] = useState('');
  const [diaryChat, setDiaryChat] = useState<ChatMessage[]>([
    { role: 'assistant', text: 'Я ваш локальный ассистент. Могу помочь проанализировать открытый файл или записи о пациенте.' }
  ]);
  const [aiLoading, setAiLoading] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const [availableModels] = useState([
    { id: 'biogemini-local', name: 'BioGemini 2.0 (Local)', size: '2.4 GB', status: 'installed', type: 'Clinical' },
    { id: 'llama-3-med', name: 'Llama 3 Med-7B', size: '4.8 GB', status: 'available', type: 'General' },
    { id: 'mistral-medical', name: 'Mistral-ORpo-Med', size: '3.9 GB', status: 'available', type: 'Analysis' },
  ]);

  const patientsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid || user.uid === 'public-user') return null;
    return query(collection(firestore, 'users'), where('sharedWith', 'array-contains', user.uid));
  }, [firestore, user?.uid]);

  const { data: patients, isLoading: patientsLoading } = useCollection<any>(patientsQuery);
  const selectedPatient = patients?.find(p => p.id === selectedPatientId);

  useEffect(() => {
    setIsFileSystemSupported(typeof window !== 'undefined' && 'showDirectoryPicker' in window);
    checkPersistedFolder();
  }, []);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [diaryChat, aiLoading]);

  const checkPersistedFolder = async () => {
    try {
      const handle = await getInIdb('specialist_diary_root_handle');
      if (handle) {
        const options = { mode: 'readwrite' };
        if ((await (handle as any).queryPermission(options)) === 'granted') {
          setRootHandle(handle);
          refreshFileTree(handle);
        }
      }
    } catch (err) {
      console.error("IDB Error:", err);
    }
  };

  const refreshFileTree = async (handle: FileSystemDirectoryHandle) => {
    setLoading(true);
    try {
      const nodes = await scanDirectory(handle);
      setFileTree(nodes);
    } catch (err) {
      console.error("Scan error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshOnly = () => {
    if (rootHandle) refreshFileTree(rootHandle);
  };

  const scanDirectory = async (handle: FileSystemDirectoryHandle): Promise<FileNode[]> => {
    const nodes: FileNode[] = [];
    for await (const entry of (handle as any).values()) {
      nodes.push({
        name: entry.name,
        kind: entry.kind,
        handle: entry,
        isOpen: false
      });
    }
    return nodes.sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === 'directory' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  };

  const handleSelectRootFolder = async () => {
    if (!isFileSystemSupported) {
      toast({ variant: 'destructive', title: 'Не поддерживается', description: 'Ваш браузер не поддерживает File System Access API.' });
      return;
    }
    try {
      const handle = await (window as any).showDirectoryPicker({ mode: 'readwrite' });
      await setInIdb('specialist_diary_root_handle', handle);
      setRootHandle(handle);
      refreshFileTree(handle);
      toast({ title: 'Папка подключена', description: `Проводник знаний: ${handle.name}` });
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        toast({ variant: 'destructive', title: 'Ошибка доступа', description: 'Не удалось открыть папку.' });
      }
    }
  };

  const toggleFolderOrOpenFile = async (node: FileNode) => {
    if (node.kind === 'directory') {
      const updateTreeRecursively = async (nodes: FileNode[]): Promise<FileNode[]> => {
        return Promise.all(nodes.map(async (n) => {
          if (n.handle === node.handle) {
            const isOpen = !n.isOpen;
            let children = n.children;
            if (isOpen && !children) {
              children = await scanDirectory(n.handle as FileSystemDirectoryHandle);
            }
            return { ...n, isOpen, children };
          }
          if (n.children) {
            return { ...n, children: await updateTreeRecursively(n.children) };
          }
          return n;
        }));
      };
      const newTree = await updateTreeRecursively(fileTree);
      setFileTree(newTree);
    } else {
      try {
        const fileHandle = node.handle as FileSystemFileHandle;
        const file = await fileHandle.getFile();
        const content = await file.text();
        setActiveFile({
          name: node.name,
          content,
          originalContent: content,
          handle: fileHandle,
          isDirty: false
        });
      } catch (e) {
        toast({ variant: 'destructive', title: 'Ошибка файла', description: 'Не удалось прочитать содержимое.' });
      }
    }
  };

  const handleSaveFile = async () => {
    if (!activeFile || !activeFile.isDirty) return;
    setSaveLoading(true);
    try {
      const writable = await (activeFile.handle as any).createWritable();
      await writable.write(activeFile.content);
      await writable.close();
      setActiveFile({ ...activeFile, originalContent: activeFile.content, isDirty: false });
      toast({ title: 'Файл сохранен', description: `Изменения в ${activeFile.name} записаны на диск.` });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Ошибка сохранения', description: 'Проверьте права доступа к папке.' });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSendAiQuery = async () => {
    if (!aiInput.trim() || aiLoading) return;

    const userMsg = aiInput.trim();
    setAiInput('');
    setDiaryChat(prev => [...prev, { role: 'user', text: userMsg }]);
    setAiLoading(true);

    try {
      // Динамический импорт для предотвращения HMR ошибок при инициализации
      const { chatWithSpecialist } = await import('@/ai/flows/ai-specialist-chat');
      
      const response = await chatWithSpecialist({
        message: userMsg,
        history: diaryChat.map(m => ({ role: m.role === 'user' ? 'user' : 'model', content: m.text })),
        userContext: selectedPatient ? {
          firstName: selectedPatient.firstName,
          healthGoal: selectedPatient.healthGoal,
          weight: selectedPatient.weight,
        } : undefined,
        fileContext: activeFile ? `Содержимое файла ${activeFile.name}: ${activeFile.content.slice(0, 2000)}` : undefined
      });

      setDiaryChat(prev => [...prev, { role: 'assistant', text: response.text }]);
    } catch (error: any) {
      console.error("Diary AI Error:", error);
      toast({ variant: 'destructive', title: 'Ошибка ИИ', description: 'Не удалось получить ответ от ассистента.' });
    } finally {
      setAiLoading(false);
    }
  };

  if (patientsLoading) return <div className="flex h-screen items-center justify-center bg-black"><Loader2 className="animate-spin h-12 w-12 text-primary opacity-20" /></div>;

  return (
    <div className="flex h-[calc(100vh-120px)] bg-[#010411] text-white rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl relative">
      {/* ЛЕВАЯ ПАНЕЛЬ */}
      <div className="w-72 border-r border-white/5 flex flex-col bg-black/40 shrink-0">
        <div className="p-6 border-b border-white/5 space-y-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                <BookOpen className="h-5 w-5 text-primary" />
             </div>
             <h2 className="text-lg font-black uppercase tracking-tight">Дневник</h2>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-xl flex items-center gap-2">
             <ShieldCheck className="h-3 w-3 text-emerald-400" />
             <span className="text-[7px] font-black uppercase text-emerald-400/80 tracking-widest">Local Mode Active</span>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-8 pb-20">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-white/30 px-2 tracking-widest">Пациенты</label>
              <div className="space-y-1">
                {patients?.map((p: any) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPatientId(p.id)}
                    className={cn(
                      "w-full p-2.5 rounded-xl flex items-center gap-3 transition-all",
                      selectedPatientId === p.id ? "bg-primary text-slate-950 shadow-lg" : "hover:bg-white/5"
                    )}
                  >
                    <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center uppercase font-black text-[10px]">
                      {p.firstName?.charAt(0)}
                    </div>
                    <span className="flex-1 text-left text-xs font-bold truncate">{p.firstName}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <label className="text-[10px] font-black uppercase text-white/30 tracking-widest">Локальные файлы</label>
                {rootHandle && (
                  <button onClick={handleRefreshOnly} className="text-white/20 hover:text-primary transition-colors">
                    <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
                  </button>
                )}
              </div>

              {!rootHandle ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSelectRootFolder} 
                  className="w-full h-10 rounded-xl bg-primary text-slate-950 border-none font-black text-[9px] uppercase tracking-widest"
                >
                  ОТКРЫТЬ ПАПКУ
                </Button>
              ) : (
                <div className="space-y-0.5 animate-in fade-in duration-500">
                  <div className="px-2 py-1 flex items-center gap-2 text-primary font-black uppercase text-[9px] truncate mb-2">
                     <FolderOpen className="h-3 w-3" /> {rootHandle.name}
                  </div>
                  {fileTree.map((node, i) => (
                    <TreeNode key={i} node={node} onToggle={toggleFolderOrOpenFile} activeFileName={activeFile?.name} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* ЦЕНТРАЛЬНАЯ ПАНЕЛЬ */}
      <div className="flex-1 flex flex-col min-w-0 bg-black/20">
        {!activeFile ? (
          <div className="flex-1 flex flex-col items-center justify-center opacity-20 space-y-6">
             <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                <Database className="h-24 w-24 relative z-10" />
             </div>
             <div className="text-center space-y-2">
                <p className="font-black uppercase tracking-[0.4em] text-lg">Knowledge Workspace</p>
                <p className="text-xs font-bold uppercase tracking-widest">Выберите файл для редактирования</p>
             </div>
          </div>
        ) : (
          <>
            <div className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-black/40 shrink-0">
               <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                     <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-white uppercase tracking-tight truncate max-w-[200px]">{activeFile.name}</h3>
                    {activeFile.isDirty && <span className="text-[8px] font-black text-orange-400 uppercase tracking-widest">● Не сохранено</span>}
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <Button 
                    onClick={handleSaveFile} 
                    disabled={!activeFile.isDirty || saveLoading}
                    className={cn(
                      "h-9 rounded-xl px-6 font-black text-[10px] uppercase transition-all shadow-lg",
                      activeFile.isDirty ? "bg-primary text-slate-950 shadow-primary/20" : "bg-white/5 text-white/20"
                    )}
                  >
                    {saveLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Save className="h-3 w-3 mr-2" /> СОХРАНИТЬ</>}
                  </Button>
               </div>
            </div>

            <div className="flex-1 relative overflow-hidden bg-[#010411]">
               <textarea 
                value={activeFile.content}
                onChange={(e) => setActiveFile({ ...activeFile, content: e.target.value, isDirty: e.target.value !== activeFile.originalContent })}
                className="w-full h-full p-10 bg-transparent border-none text-base md:text-lg font-medium text-white/80 resize-none focus:ring-0 leading-relaxed outline-none scrollbar-hide"
                spellCheck={false}
               />
            </div>
          </>
        )}
      </div>

      {/* ПРАВАЯ ПАНЕЛЬ */}
      <div className="w-80 border-l border-white/5 flex flex-col bg-black/40 shrink-0">
        <Tabs value={aiSidebarTab} onValueChange={(v: any) => setAiSidebarTab(v)} className="flex flex-col h-full">
           <div className="p-4 border-b border-white/5 flex justify-center">
              <TabsList className="bg-white/5 border border-white/10 rounded-xl h-10 p-1 w-full grid grid-cols-2">
                 <TabsTrigger value="chat" className="rounded-lg font-black text-[9px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-slate-950">
                    <MessageSquare className="h-3 w-3 mr-1.5" /> Анализ
                 </TabsTrigger>
                 <TabsTrigger value="models" className="rounded-lg font-black text-[9px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-slate-950">
                    <Cpu className="h-3 w-3 mr-1.5" /> Модели
                 </TabsTrigger>
              </TabsList>
           </div>

           <div className="flex-1 min-h-0 overflow-hidden">
              <TabsContent value="chat" className="h-full m-0 p-0 flex flex-col outline-none">
                 <ScrollArea className="flex-1 p-5">
                    <div className="space-y-6">
                       {diaryChat.map((msg, i) => (
                         <div key={i} className={cn("p-4 rounded-2xl text-xs leading-relaxed", msg.role === 'user' ? "bg-primary/10 text-primary ml-4" : "bg-white/5 text-white/70 mr-4")}>
                            <div className="flex items-center gap-2 mb-2 opacity-40">
                               {msg.role === 'user' ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                               <span className="text-[8px] font-black uppercase">{msg.role === 'user' ? 'Вы' : 'ИИ'}</span>
                            </div>
                            {msg.text}
                         </div>
                       ))}
                       {aiLoading && (
                         <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl animate-pulse">
                            <Loader2 className="h-3 w-3 animate-spin text-primary" />
                            <span className="text-[10px] font-black text-primary/40 uppercase">Анализ...</span>
                         </div>
                       )}
                       <div ref={chatScrollRef} />
                    </div>
                 </ScrollArea>
                 
                 <div className="p-4 bg-black/40 border-t border-white/5">
                    <div className="relative">
                       <textarea 
                         rows={3}
                         value={aiInput}
                         onChange={(e) => setAiInput(e.target.value)}
                         onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleDiaryChatSend())}
                         placeholder="Спросить ИИ о записях..." 
                         className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-medium text-white placeholder:text-white/20 resize-none focus:ring-2 focus:ring-primary/20 outline-none pr-10"
                       />
                       <button 
                        onClick={handleSendAiQuery}
                        disabled={aiLoading || !aiInput.trim()}
                        className="absolute right-2 bottom-3 h-8 w-8 bg-primary rounded-lg flex items-center justify-center shadow-lg hover:scale-110 transition-all disabled:opacity-20"
                       >
                          <Send className="h-4 w-4 text-slate-950" />
                       </button>
                    </div>
                 </div>
              </TabsContent>

              <TabsContent value="models" className="h-full m-0 p-5 overflow-y-auto outline-none">
                 <div className="space-y-6 pb-20">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-white/40 px-1 tracking-widest">Активная модель</label>
                       <div className="bg-primary/10 border border-primary/30 p-4 rounded-xl flex items-center justify-between shadow-lg">
                          <div className="space-y-1">
                             <p className="text-sm font-black text-white">BioGemini 2.0</p>
                             <p className="text-[8px] font-bold text-primary uppercase">Installed & Optimized</p>
                          </div>
                          <Zap className="h-5 w-5 text-primary animate-pulse" />
                       </div>
                    </div>
                    {/* Список моделей... */}
                 </div>
              </TabsContent>
           </div>
        </Tabs>
      </div>
    </div>
  );
}

function TreeNode({ node, onToggle, level = 0, activeFileName }: { node: FileNode, onToggle: (node: FileNode) => void, level?: number, activeFileName?: string }) {
  const isActive = activeFileName === node.name;

  return (
    <div className="flex flex-col">
      <button 
        onClick={() => onToggle(node)}
        className={cn(
          "flex items-center gap-2 py-1.5 px-2 rounded-lg transition-all text-left group",
          isActive ? "bg-primary/20 text-primary border border-primary/30" : "hover:bg-white/5 text-white/40"
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        {node.kind === 'directory' ? (
          node.isOpen ? <FolderOpen className="h-3.5 w-3.5 text-primary/60" /> : <Folder className="h-3.5 w-3.5 text-primary/40" />
        ) : (
          <File className={cn("h-3.5 w-3.5", isActive ? "text-primary" : "text-white/20 group-hover:text-primary/40")} />
        )}
        <span className={cn("text-[11px] font-medium truncate", isActive && "font-black")}>{node.name}</span>
      </button>
      {node.isOpen && node.children && (
        <div className="flex flex-col">
          {node.children.map((child, i) => (
            <TreeNode key={i} node={child} onToggle={onToggle} level={level + 1} activeFileName={activeFileName} />
          ))}
        </div>
      )}
    </div>
  );
}

