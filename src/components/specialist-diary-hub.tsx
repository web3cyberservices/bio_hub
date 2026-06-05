'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { 
  BookOpen, FileText, ShieldCheck, Loader2, RefreshCw, 
  Database, Zap, Folder, FolderOpen,
  File, Save, Bot, MessageSquare, Cpu, Send, User,
  Play, Pause, Mic, Music, Film, AlertTriangle, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { get as getInIdb, set as setInIdb } from 'idb-keyval';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  type: 'text' | 'audio' | 'video';
  mimeType: string;
  blobUrl?: string;
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
  const [transcribing, setTranscribing] = useState(false);
  const [aiSidebarTab, setAiSidebarTab] = useState<'chat' | 'models'>('chat');
  const [isFileSystemSupported, setIsFileSystemSupported] = useState(true);

  const [aiInput, setAiInput] = useState('');
  const [diaryChat, setDiaryChat] = useState<any[]>([
    { role: 'assistant', text: 'Я ваш ИИ-ассистент по локальным записям.' }
  ]);
  const [aiLoading, setAiLoading] = useState(false);
  
  const mediaRef = useRef<HTMLAudioElement | HTMLVideoElement>(null);

  const patientsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid || user.uid === 'public-user') return null;
    return query(collection(firestore, 'users'), where('sharedWith', 'array-contains', user.uid));
  }, [firestore, user?.uid]);

  const { data: patients, isLoading: patientsLoading } = useCollection<any>(patientsQuery);
  const selectedPatient = patients?.find(p => p.id === selectedPatientId);

  useEffect(() => {
    const isSupported = typeof window !== 'undefined' && 'showDirectoryPicker' in window;
    setIsFileSystemSupported(isSupported);
    if (isSupported) checkPersistedFolder();
  }, []);

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
    } catch (err) {}
  };

  const refreshFileTree = async (handle: FileSystemDirectoryHandle) => {
    setLoading(true);
    try {
      const nodes = await scanDirectory(handle);
      setFileTree(nodes);
    } catch (err) {
    } finally { setLoading(false); }
  };

  const handleRefreshOnly = () => {
    if (rootHandle) refreshFileTree(rootHandle);
  };

  const scanDirectory = async (handle: FileSystemDirectoryHandle): Promise<FileNode[]> => {
    const nodes: FileNode[] = [];
    for await (const entry of (handle as any).values()) {
      nodes.push({ name: entry.name, kind: entry.kind, handle: entry, isOpen: false });
    }
    return nodes.sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === 'directory' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  };

  const handleSelectRootFolder = async () => {
    if (!isFileSystemSupported) {
      toast({ variant: 'destructive', title: 'Safari не поддерживается', description: 'Используйте Chrome или Edge.' });
      return;
    }
    try {
      const handle = await (window as any).showDirectoryPicker({ mode: 'readwrite' });
      await setInIdb('specialist_diary_root_handle', handle);
      setRootHandle(handle);
      refreshFileTree(handle);
    } catch (err: any) {
      if (err.name !== 'AbortError') toast({ variant: 'destructive', title: 'Ошибка доступа' });
    }
  };

  const getFileType = (name: string): 'text' | 'audio' | 'video' => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (['mp3', 'wav', 'm4a', 'ogg', 'aac', 'flac'].includes(ext!)) return 'audio';
    if (['mp4', 'webm', 'mov', 'mkv', 'avi'].includes(ext!)) return 'video';
    return 'text';
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
        const type = getFileType(node.name);
        
        if (type === 'text') {
          const content = await file.text();
          setActiveFile({ name: node.name, content, originalContent: content, handle: fileHandle, isDirty: false, type: 'text', mimeType: file.type });
        } else {
          const blobUrl = URL.createObjectURL(file);
          setActiveFile({ name: node.name, content: '', originalContent: '', handle: fileHandle, isDirty: false, type, mimeType: file.type, blobUrl });
        }
      } catch (e) {
        toast({ variant: 'destructive', title: 'Ошибка файла' });
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
      toast({ title: 'Файл сохранен' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Ошибка сохранения' });
    } finally { setSaveLoading(false); }
  };

  const handleTranscription = async () => {
    if (!activeFile?.blobUrl || transcribing) return;
    setTranscribing(true);
    try {
      const { transcribeMedia } = await import('@/ai/flows/transcribe-media');
      const file = await activeFile.handle.getFile();
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const text = await transcribeMedia({ mediaDataUri: base64, mimeType: activeFile.mimeType });
        setActiveFile(prev => prev ? { ...prev, content: prev.content + '\n\n[AI TRANSCRIPTION]:\n' + text, isDirty: true, type: 'text' } : null);
        toast({ title: 'Транскрибация завершена' });
      };
      reader.readAsDataURL(file);
    } catch (error) { 
      console.error(error);
      toast({ variant: 'destructive', title: 'Ошибка ИИ' }); 
    } finally { setTranscribing(false); }
  };

  const handleSendAiQuery = async () => {
    if (!aiInput.trim() || aiLoading) return;
    const msg = aiInput.trim();
    setAiInput('');
    setDiaryChat(p => [...p, { role: 'user', text: msg }]);
    setAiLoading(true);
    try {
      const { chatWithSpecialist } = await import('@/ai/flows/ai-specialist-chat');
      const res = await chatWithSpecialist({ message: msg, history: diaryChat.map(m => ({ role: m.role === 'user' ? 'user' : 'model', content: m.text })) });
      setDiaryChat(p => [...p, { role: 'assistant', text: res.text }]);
    } catch (error) { toast({ variant: 'destructive', title: 'Ошибка ИИ' }); } finally { setAiLoading(false); }
  };

  return (
    <div className="flex h-full bg-[#010411] text-white overflow-hidden border-t border-white/5 relative">
      <div className="w-72 border-r border-white/5 flex flex-col bg-black/40 shrink-0">
        <div className="p-6 border-b border-white/5 space-y-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30"><BookOpen className="h-5 w-5 text-primary" /></div>
             <h2 className="text-lg font-black uppercase tracking-tight">Дневник</h2>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-xl flex items-center gap-2">
             <ShieldCheck className="h-3 w-3 text-emerald-400" />
             <span className="text-[7px] font-black uppercase text-emerald-400/80 tracking-widest">Local Mode Active</span>
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-8 pb-20">
            <div className="space-y-1">
               <label className="text-[10px] font-black uppercase text-white/30 px-2 tracking-widest">Пациенты</label>
               {patients?.map((p: any) => (
                 <button key={p.id} onClick={() => setSelectedPatientId(p.id)} className={cn("w-full p-2.5 rounded-xl flex items-center gap-3 transition-all", selectedPatientId === p.id ? "bg-primary text-slate-950 shadow-lg" : "hover:bg-white/5")}>
                    <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center font-black text-[10px]">{p.firstName?.charAt(0)}</div>
                    <span className="flex-1 text-left text-xs font-bold truncate">{p.firstName}</span>
                 </button>
               ))}
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <label className="text-[10px] font-black uppercase text-white/30 tracking-widest">Локальные файлы</label>
                {rootHandle && <button onClick={handleRefreshOnly} className="text-white/20 hover:text-primary transition-colors"><RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} /></button>}
              </div>
              {!rootHandle ? <Button variant="outline" size="sm" onClick={handleSelectRootFolder} className="w-full h-10 rounded-xl bg-primary text-slate-950 border-none font-black text-[9px] uppercase tracking-widest">ОТКРЫТЬ ПАПКУ</Button> : (
                <div className="space-y-0.5">
                  <div className="px-2 py-1 flex items-center gap-2 text-primary font-black uppercase text-[9px] truncate mb-2"><FolderOpen className="h-3 w-3" /> {rootHandle.name}</div>
                  {fileTree.map((node, i) => (
                    <div key={i} className="px-2 py-1 flex items-center gap-2 text-xs font-bold cursor-pointer hover:bg-white/5 rounded-lg group" onClick={() => toggleFolderOrOpenFile(node)}>
                      {node.kind === 'directory' ? <Folder className="h-3.5 w-3.5 text-primary" /> : <File className="h-3.5 w-3.5 text-white/20 group-hover:text-primary/40" />} 
                      <span className="truncate">{node.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col min-w-0 bg-black/20">
        {!activeFile ? (
          <div className="flex-1 flex flex-col items-center justify-center opacity-20 space-y-6">
             <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                <Database className="h-24 w-24 relative z-10 text-primary" />
             </div>
             <p className="font-black uppercase tracking-[0.4em] text-white">Knowledge Workspace</p>
          </div>
        ) : (
          <>
            <div className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-black/40 shrink-0">
               <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                     {activeFile.type === 'text' ? <FileText className="h-4 w-4 text-primary" /> : activeFile.type === 'audio' ? <Music className="h-4 w-4 text-primary" /> : <Film className="h-4 w-4 text-primary" />}
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-white uppercase truncate max-w-[200px]">{activeFile.name}</h3>
                    {activeFile.isDirty && <span className="text-[8px] font-black text-orange-400 uppercase tracking-widest ml-2">● Edited</span>}
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  {activeFile.type !== 'text' && <Button onClick={handleTranscription} disabled={transcribing} className="h-9 rounded-xl px-4 bg-primary/10 text-primary border border-primary/30 font-black text-[10px] uppercase gap-2">{transcribing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Mic className="h-3 w-3" />} В ТЕКСТ</Button>}
                  <Button onClick={handleSaveFile} disabled={!activeFile.isDirty || saveLoading} className={cn("h-9 rounded-xl px-6 font-black text-[10px] uppercase shadow-lg", activeFile.isDirty ? "bg-primary text-slate-950 shadow-primary/20" : "bg-white/5 text-white/20")}>СОХРАНИТЬ</Button>
               </div>
            </div>
            <div className="flex-1 relative overflow-hidden bg-[#010411]">
               {activeFile.type === 'text' ? (
                 <textarea value={activeFile.content} onChange={(e) => setActiveFile({ ...activeFile, content: e.target.value, isDirty: e.target.value !== activeFile.originalContent })} className="w-full h-full p-10 bg-transparent border-none text-lg font-medium text-white/80 resize-none focus:ring-0 outline-none leading-relaxed" spellCheck={false} />
               ) : (
                 <div className="w-full h-full flex flex-col items-center justify-center p-10 space-y-10">
                    <div className="w-48 h-48 rounded-[2.5rem] border-4 border-primary/20 flex items-center justify-center bg-black/60 shadow-2xl relative overflow-hidden">
                       {activeFile.type === 'audio' ? <Music className="h-24 w-24 text-primary/40 animate-pulse" /> : <video src={activeFile.blobUrl} className="w-full h-full object-cover" controls={false} ref={mediaRef as any} />}
                    </div>
                    <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 w-full max-w-xl flex flex-col items-center gap-6 shadow-inner">
                       {activeFile.type === 'audio' ? <audio src={activeFile.blobUrl} controls className="w-full h-12 filter invert brightness-100" /> : (
                         <div className="flex gap-6"><Button onClick={() => mediaRef.current?.play()} className="rounded-2xl h-14 w-14 bg-primary text-slate-950 shadow-lg"><Play className="fill-current" /></Button><Button onClick={() => mediaRef.current?.pause()} className="rounded-2xl h-14 w-14 bg-white/10 text-white"><Pause className="fill-current" /></Button></div>
                       )}
                       <p className="text-[10px] font-black uppercase text-white/20 tracking-[0.3em]">Player Core v2.0</p>
                    </div>
                 </div>
               )}
            </div>
          </>
        )}
      </div>

      <div className="w-80 border-l border-white/5 flex flex-col bg-black/40 shrink-0">
        <Tabs value={aiSidebarTab} onValueChange={(v: any) => setAiSidebarTab(v)} className="flex flex-col h-full">
           <div className="p-4 border-b border-white/5"><TabsList className="bg-white/5 w-full grid grid-cols-2 rounded-xl border border-white/10 p-1"><TabsTrigger value="chat" className="rounded-lg font-black text-[9px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-slate-950">Анализ</TabsTrigger><TabsTrigger value="models" className="rounded-lg font-black text-[9px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-slate-950">Модели</TabsTrigger></TabsList></div>
           <ScrollArea className="flex-1">
              <TabsContent value="chat" className="space-y-6 p-5">
                 {diaryChat.map((m, i) => (
                   <div key={i} className={cn("p-4 rounded-2xl text-xs leading-relaxed border", m.role === 'user' ? "bg-primary/10 text-primary border-primary/20 ml-4" : "bg-white/5 text-white/70 border-white/5 mr-4")}>
                      <div className="flex items-center gap-2 mb-2 opacity-40">
                         {m.role === 'user' ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                         <span className="text-[8px] font-black uppercase">{m.role === 'user' ? 'Вы' : 'ИИ'}</span>
                      </div>
                      {m.text}
                   </div>
                 ))}
                 {aiLoading && (
                   <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl animate-pulse border border-white/5">
                      <Loader2 className="h-3 w-3 animate-spin text-primary" />
                      <span className="text-[10px] font-black text-primary/40 uppercase">Анализ записей...</span>
                   </div>
                 )}
              </TabsContent>
              <TabsContent value="models" className="p-5">
                 <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl flex items-center justify-between">
                    <div>
                       <p className="text-sm font-black text-white">BioGemini 2.5</p>
                       <p className="text-[8px] font-bold text-primary uppercase mt-0.5">Neural Engine Active</p>
                    </div>
                    <Zap className="h-5 w-5 text-primary animate-pulse" />
                 </div>
              </TabsContent>
           </ScrollArea>
           <div className="p-4 bg-black/40 border-t border-white/5">
              <div className="relative">
                <textarea 
                  rows={2} 
                  value={aiInput} 
                  onChange={(e) => setAiInput(e.target.value)} 
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendAiQuery(); } }}
                  placeholder="Спросить ИИ о записях..." 
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-medium text-white outline-none pr-10 resize-none shadow-inner" 
                />
                <button 
                  onClick={handleSendAiQuery} 
                  disabled={aiLoading || !aiInput.trim()} 
                  className="absolute right-2 bottom-3 h-8 w-8 bg-primary rounded-lg flex items-center justify-center transition-all disabled:opacity-20 active:scale-90"
                >
                  <Send className="h-4 w-4 text-slate-950" />
                </button>
              </div>
           </div>
        </Tabs>
      </div>
    </div>
  );
}