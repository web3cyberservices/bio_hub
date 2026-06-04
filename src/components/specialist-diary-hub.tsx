
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BookOpen, FileText, Plus, Search, 
  ShieldCheck, Loader2, User, ChevronRight,
  Database, Zap, X, Trash2, Folder, FolderOpen,
  File, RefreshCw, Info, AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { get as getInIdb, set as setInIdb } from 'idb-keyval';

interface FileNode {
  name: string;
  kind: 'file' | 'directory';
  handle: FileSystemFileHandle | FileSystemDirectoryHandle;
  children?: FileNode[];
  isOpen?: boolean;
}

export function SpecialistDiaryHub() {
  const { user } = useUser();
  const { firestore } = useFirestore();
  const { toast } = useToast();
  
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [rootHandle, setRootHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [activeTab, setActiveTab] = useState<'chat' | 'notes'>('chat');
  const [loading, setLoading] = useState(false);
  const [isFileSystemSupported, setIsFileSystemSupported] = useState(true);

  // Получаем список пациентов врача из Firestore
  const patientsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'users'), where('sharedWith', 'array-contains', user.uid));
  }, [firestore, user?.uid]);

  const { data: patients, isLoading: patientsLoading } = useCollection<any>(patientsQuery);
  const selectedPatient = patients?.find(p => p.id === selectedPatientId);

  useEffect(() => {
    setIsFileSystemSupported(typeof window !== 'undefined' && 'showDirectoryPicker' in window);
    checkPersistedFolder();
  }, []);

  const checkPersistedFolder = async () => {
    try {
      const handle = await getInIdb('specialist_diary_root_handle');
      if (handle) {
        // Проверяем права (браузер сбрасывает их после перезагрузки)
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
    if (!isFileSystemSupported) return;
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

  const toggleFolder = async (node: FileNode) => {
    if (node.kind !== 'directory') return;
    
    const newTree = [...fileTree];
    const updateNode = (list: FileNode[]): boolean => {
      for (let i = 0; i < list.length; i++) {
        if (list[i].handle === node.handle) {
          list[i].isOpen = !list[i].isOpen;
          if (list[i].isOpen && !list[i].children) {
            scanDirectory(list[i].handle as FileSystemDirectoryHandle).then(children => {
              list[i].children = children;
              setFileTree([...newTree]);
            });
          }
          return true;
        }
        if (list[i].children && updateNode(list[i].children!)) return true;
      }
      return false;
    };
    updateNode(newTree);
    setFileTree(newTree);
  };

  if (patientsLoading) return <div className="flex h-screen items-center justify-center bg-black"><Loader2 className="animate-spin h-12 w-12 text-primary opacity-20" /></div>;

  return (
    <div className="flex h-[calc(100vh-120px)] bg-[#010411] text-white rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl">
      {/* ЛЕВАЯ ПАНЕЛЬ */}
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
          <div className="p-4 space-y-8 pb-20">
            {/* Список пациентов */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-white/30 px-2 tracking-widest">Выбор пациента</label>
              <div className="space-y-1">
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
                {(!patients || patients.length === 0) && (
                  <div className="p-4 text-center border border-white/5 rounded-2xl opacity-30">
                    <p className="text-[10px] font-black uppercase tracking-widest">Пациенты не найдены</p>
                  </div>
                )}
              </div>
            </div>

            {/* Проводник знаний (Локальные файлы) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <label className="text-[10px] font-black uppercase text-white/30 tracking-widest">Проводник знаний</label>
                {rootHandle && (
                  <button onClick={handleSelectRootFolder} className="text-white/20 hover:text-primary transition-colors">
                    <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
                  </button>
                )}
              </div>

              {!rootHandle ? (
                <div className="p-4 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 flex flex-col items-center gap-3 text-center">
                   <Folder className="h-8 w-8 text-primary/60" />
                   <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase text-white">Локальная база</p>
                      <p className="text-[8px] text-white/40 uppercase leading-relaxed">Выберите папку с медицинскими записями на вашем ПК</p>
                   </div>
                   <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSelectRootFolder} 
                    disabled={!isFileSystemSupported}
                    className="w-full h-10 rounded-xl bg-primary text-slate-950 border-none font-black text-[9px] uppercase tracking-widest"
                   >
                     {isFileSystemSupported ? 'ВЫБРАТЬ ПАПКУ' : 'НЕДОСТУПНО'}
                   </Button>
                   {!isFileSystemSupported && <p className="text-[7px] text-red-400 font-bold uppercase">Требуется Chrome/Edge на десктопе</p>}
                </div>
              ) : (
                <div className="space-y-1 animate-in fade-in duration-500">
                  <div className="px-2 py-1 flex items-center gap-2 text-primary font-black uppercase text-[10px] truncate mb-2">
                     <FolderOpen className="h-3.5 w-3.5" /> {rootHandle.name}
                  </div>
                  <div className="space-y-0.5">
                    {fileTree.map((node, i) => (
                      <TreeNode key={i} node={node} onToggle={toggleFolder} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* ПРАВАЯ ПАНЕЛЬ */}
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
                            ИИ готов анализировать локальные файлы для пациента <strong>{selectedPatient?.firstName}</strong>. 
                            Выберите файлы слева, чтобы они стали частью контекста.
                          </p>
                          {!rootHandle && (
                            <div className="flex items-center gap-3 text-orange-400/60 bg-orange-400/5 p-3 rounded-xl border border-orange-400/10">
                               <AlertTriangle className="h-4 w-4 shrink-0" />
                               <span className="text-[9px] font-black uppercase">Локальная база знаний не подключена</span>
                            </div>
                          )}
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

function TreeNode({ node, onToggle, level = 0 }: { node: FileNode, onToggle: (node: FileNode) => void, level?: number }) {
  return (
    <div className="flex flex-col">
      <button 
        onClick={() => onToggle(node)}
        className={cn(
          "flex items-center gap-2 py-1.5 px-2 rounded-lg transition-all hover:bg-white/5 text-left group",
          node.kind === 'directory' ? "text-white/60" : "text-white/40"
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        {node.kind === 'directory' ? (
          node.isOpen ? <FolderOpen className="h-3.5 w-3.5 text-primary/60" /> : <Folder className="h-3.5 w-3.5 text-primary/40" />
        ) : (
          <File className="h-3.5 w-3.5 text-white/20 group-hover:text-primary/40 transition-colors" />
        )}
        <span className="text-[11px] font-medium truncate">{node.name}</span>
      </button>
      {node.isOpen && node.children && (
        <div className="flex flex-col">
          {node.children.map((child, i) => (
            <TreeNode key={i} node={child} onToggle={onToggle} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function Badge({ children, variant, className }: any) {
  return <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 font-bold", className)}>{children}</span>;
}

