'use client';

import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  History, FileText, Calendar, 
  ChevronRight, FlaskConical, Loader2,
  TrendingUp, TrendingDown, CheckCircle2,
  AlertCircle, ArrowLeft, Zap, Download, Database
} from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, where, orderBy, doc } from 'firebase/firestore';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { downloadLabResultsDocx } from '@/lib/docx-generator';
import { syncToObsidian } from '@/lib/obsidian-sync';

interface AnalysisHistoryDialogProps {
  children: React.ReactNode;
}

export function AnalysisHistoryDialog({ children }: AnalysisHistoryDialogProps) {
  const { user } = useUser();
  const { firestore } = useFirestore();
  const [selectedLab, setSelectedLab] = useState<any | null>(null);
  const [obsidianSyncing, setObsidianSyncing] = useState(false);

  const userDocRef = useMemoFirebase(() => user ? doc(firestore!, 'users', user.uid) : null, [user, firestore]);
  const { data: userData } = useDoc<any>(userDocRef);

  const labsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid || user.uid === 'public-user') return null;
    return query(
      collection(firestore, 'users', user.uid, 'labResults'),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, user?.uid]);

  const { data: labs, isLoading } = useCollection<any>(labsQuery);

  const safeFormatDate = (dateValue: any, formatStr: string = 'd MMM yyyy') => {
    if (!dateValue) return '—';
    try {
      const date = dateValue?.toDate ? dateValue.toDate() : new Date(dateValue);
      if (isNaN(date.getTime())) return '—';
      return format(date, formatStr, { locale: ru });
    } catch (e) {
      return '—';
    }
  };

  const handleDownload = (e: React.MouseEvent, lab: any) => {
    e.stopPropagation();
    downloadLabResultsDocx(lab);
  };

  const handleObsidianSync = async (e: React.MouseEvent, lab: any) => {
    e.stopPropagation();
    if (!userData?.obsidianConnected) return;

    setObsidianSyncing(true);
    try {
      const dateKey = safeFormatDate(lab.createdAt, 'yyyy-MM-dd');
      await syncToObsidian({
        type: 'lab',
        date: dateKey,
        payload: lab
      });
      // toast({ title: 'Синхронизировано с Obsidian' });
    } catch (err) {
      console.error(err);
    } finally {
      setObsidianSyncing(false);
    }
  };

  return (
    <Dialog onOpenChange={(open) => { if (!open) setSelectedLab(null); }}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="w-[95vw] md:max-w-[700px] rounded-[2rem] md:rounded-[3rem] p-0 overflow-hidden border border-white/10 shadow-2xl z-[1100] flex flex-col h-[85vh] md:h-[80vh] gap-0 bg-[#010411]">
        <DialogHeader className="p-6 md:p-8 bg-primary text-white shrink-0 relative border-b border-white/5">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-[#00ffff]/80 opacity-90" />
          <div className="relative z-10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {selectedLab && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 rounded-full text-slate-950 hover:bg-black/10"
                  onClick={() => setSelectedLab(null)}
                >
                  <ArrowLeft className="h-6 w-6" />
                </Button>
              )}
              <div>
                <DialogTitle className="text-xl md:text-3xl font-black tracking-tighter text-slate-950">
                  {selectedLab ? 'Детали анализа' : 'История анализов'}
                </DialogTitle>
                <p className="text-slate-950/60 text-[10px] md:text-sm font-black uppercase tracking-widest mt-0.5">
                  {selectedLab ? safeFormatDate(selectedLab.createdAt, 'd MMMM yyyy') : 'Ваш медицинский архив'}
                </p>
              </div>
            </div>
            {selectedLab && (
              <div className="flex gap-2">
                {userData?.obsidianConnected && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    disabled={obsidianSyncing}
                    onClick={(e) => handleObsidianSync(e, selectedLab)}
                    className="rounded-xl bg-slate-950/10 text-slate-950 hover:bg-black/10 border border-black/10 font-black uppercase text-[10px] gap-2"
                  >
                    <Database className={cn("h-3 w-3", obsidianSyncing && "animate-spin")} /> 
                    <span className="hidden sm:inline">В Obsidian</span>
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={(e) => handleDownload(e, selectedLab)}
                  className="rounded-xl bg-slate-950/10 text-slate-950 hover:bg-black/10 border border-black/10 font-black uppercase text-[10px] gap-2"
                >
                  <Download className="h-3 w-3" /> <span className="hidden sm:inline">Скачать DOCX</span>
                </Button>
              </div>
            )}
          </div>
          {!selectedLab && <History className="absolute -right-4 -bottom-4 h-24 w-24 text-slate-950/10 rotate-12" />}
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-hidden bg-[#010411]">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary opacity-50" />
              <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">Загрузка архива...</p>
            </div>
          ) : !selectedLab ? (
            <ScrollArea className="h-full">
              <div className="p-6 md:p-10 space-y-4">
                {labs?.map((lab) => (
                  <button
                    key={lab.id}
                    onClick={() => setSelectedLab(lab)}
                    className="w-full text-left group outline-none"
                  >
                    <Card className="p-6 border border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-xl transition-all flex items-center justify-between rounded-[1.5rem]">
                       <div className="flex items-center gap-6">
                          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform border border-primary/20">
                             <FlaskConical className="h-7 w-7" />
                          </div>
                          <div>
                             <h4 className="font-black text-lg text-white group-hover:text-primary transition-colors">Отчет от {safeFormatDate(lab.createdAt)}</h4>
                             <div className="flex items-center gap-3 mt-1">
                                <Badge variant="outline" className="text-[8px] border-primary/30 text-primary font-bold uppercase bg-primary/5">{lab.markers?.length || 0} маркеров</Badge>
                                <span className="text-[10px] text-white/40 font-medium truncate max-w-[200px]">{lab.summary?.slice(0, 50)}...</span>
                             </div>
                          </div>
                       </div>
                       <ChevronRight className="h-6 w-6 text-white/20 group-hover:text-primary transition-colors" />
                    </Card>
                  </button>
                ))}
                {(!labs || labs.length === 0) && (
                  <div className="py-20 text-center space-y-6 opacity-30">
                    <FileText className="h-20 w-20 mx-auto text-primary" />
                    <div className="space-y-1">
                       <p className="text-xl font-black uppercase tracking-tight text-white">Архив пуст</p>
                       <p className="text-sm font-medium text-white/60">Загрузите свой первый анализ в разделе «Bio-Синхронизация»</p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          ) : (
            <ScrollArea className="h-full">
              <div className="p-6 md:p-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                <div className="bg-primary/5 p-6 rounded-3xl border border-primary/20 shadow-inner">
                  <p className="text-sm md:text-base font-medium leading-relaxed text-white/80 italic">
                    "{selectedLab.summary}"
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/60 px-2 flex items-center gap-2">
                    <FlaskConical className="h-3 w-3" /> Обнаруженные биомаркеры
                  </h4>
                  <div className="grid gap-3">
                    {selectedLab.markers?.map((marker: any, i: number) => {
                      const isOffNorm = marker.status !== 'normal';
                      const cleanRange = marker.referenceRange ? marker.referenceRange.replace(/норма/gi, '').trim() : null;
                        
                      return (
                        <div key={i} className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-black text-sm text-white">{marker.name}</span>
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "text-[8px] h-4 px-1 border-none",
                                  marker.status === 'high' ? "bg-red-500/20 text-red-500" : 
                                  marker.status === 'low' ? "bg-yellow-500/20 text-yellow-500" : 
                                  "bg-emerald-500/20 text-emerald-400"
                                )}
                              >
                                {marker.status === 'normal' ? 'В НОРМЕ' : marker.status === 'high' ? 'ВЫШЕ НОРМЫ' : 'НИЖЕ НОРМЫ'}
                              </Badge>
                            </div>
                            <div className="mt-0.5">
                              <p className="text-[10px] text-white/40 font-medium">
                                {marker.interpretation}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex flex-col items-end">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                               <div className="flex flex-col items-end">
                                  <div className="flex items-center gap-1">
                                    <p className={cn("font-black text-base md:text-lg leading-none", isOffNorm ? "text-destructive" : "text-white")}>
                                      {marker.value}
                                    </p>
                                    {isOffNorm && (
                                      marker.status === 'high' ? <TrendingUp className="h-4 w-4 text-red-500" /> : <TrendingDown className="h-4 w-4 text-yellow-500" />
                                    )}
                                  </div>
                                  {isOffNorm && cleanRange && (
                                    <p className="text-[10px] md:text-[11px] font-bold text-destructive/80 mt-1 uppercase tracking-tight">
                                      (норма {cleanRange})
                                    </p>
                                  )}
                               </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/60 px-2 flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3" /> ИИ Рекомендации
                  </h4>
                  <div className="grid gap-3">
                    {selectedLab.recommendations?.map((rec: string, i: number) => (
                      <div key={i} className="flex gap-4 items-start p-5 bg-white/5 border border-white/5 rounded-[1.5rem] shadow-sm">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 border border-primary/20">
                          <Zap className="h-4 w-4 text-primary" />
                        </div>
                        <p className="text-xs md:text-sm font-medium leading-relaxed text-white/80">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex items-center gap-4">
                   <AlertCircle className="h-6 w-6 text-white/20 shrink-0" />
                   <p className="text-[9px] font-bold text-white/40 leading-snug uppercase tracking-wider">
                      Внимание: Данный отчет составлен ИИ и носит рекомендательный характер. Всегда консультируйтесь с врачом перед приемом препаратов.
                   </p>
                </div>
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
