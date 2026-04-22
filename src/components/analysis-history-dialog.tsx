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
  AlertCircle, ArrowLeft, Zap, Download
} from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { downloadLabResultsDocx } from '@/lib/docx-generator';

interface AnalysisHistoryDialogProps {
  children: React.ReactNode;
}

export function AnalysisHistoryDialog({ children }: AnalysisHistoryDialogProps) {
  const { user } = useUser();
  const { firestore } = useFirestore();
  const [selectedLab, setSelectedLab] = useState<any | null>(null);

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

  return (
    <Dialog onOpenChange={(open) => { if (!open) setSelectedLab(null); }}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="w-[95vw] md:max-w-[700px] rounded-[2rem] md:rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl z-[1100] flex flex-col h-[85vh] md:h-[80vh] gap-0">
        <DialogHeader className="p-6 md:p-8 bg-primary text-white shrink-0 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-[#163D25] opacity-95" />
          <div className="relative z-10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {selectedLab && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 rounded-full text-white hover:bg-white/10"
                  onClick={() => setSelectedLab(null)}
                >
                  <ArrowLeft className="h-6 w-6" />
                </Button>
              )}
              <div>
                <DialogTitle className="text-xl md:text-3xl font-black tracking-tighter">
                  {selectedLab ? 'Детали анализа' : 'История анализов'}
                </DialogTitle>
                <p className="text-white/60 text-[10px] md:text-sm font-medium uppercase tracking-widest mt-0.5">
                  {selectedLab ? safeFormatDate(selectedLab.createdAt, 'd MMMM yyyy') : 'Ваш медицинский архив'}
                </p>
              </div>
            </div>
            {selectedLab && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={(e) => handleDownload(e, selectedLab)}
                className="rounded-xl bg-white/10 text-white hover:bg-white/20 border border-white/20 font-black uppercase text-[10px] gap-2"
              >
                <Download className="h-3 w-3" /> <span className="hidden sm:inline">Скачать DOCX</span>
              </Button>
            )}
          </div>
          {!selectedLab && <History className="absolute -right-4 -bottom-4 h-24 w-24 text-white/5 rotate-12" />}
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-hidden bg-[#F0F7F2]/50">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
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
                    <Card className="premium-card p-6 border-none shadow-md bg-white hover:shadow-xl transition-all flex items-center justify-between">
                       <div className="flex items-center gap-6">
                          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                             <FlaskConical className="h-7 w-7" />
                          </div>
                          <div>
                             <h4 className="font-black text-lg group-hover:text-primary transition-colors">Отчет от {safeFormatDate(lab.createdAt)}</h4>
                             <div className="flex items-center gap-3 mt-1">
                                <Badge variant="outline" className="text-[8px] border-primary/20 text-primary font-bold uppercase">{lab.markers?.length || 0} маркеров</Badge>
                                <span className="text-[10px] text-muted-foreground font-medium truncate max-w-[200px]">{lab.summary?.slice(0, 50)}...</span>
                             </div>
                          </div>
                       </div>
                       <ChevronRight className="h-6 w-6 text-primary/20 group-hover:text-primary transition-colors" />
                    </Card>
                  </button>
                ))}
                {(!labs || labs.length === 0) && (
                  <div className="py-20 text-center space-y-6 opacity-30">
                    <FileText className="h-20 w-20 mx-auto text-primary" />
                    <div className="space-y-1">
                       <p className="text-xl font-black uppercase tracking-tight">Архив пуст</p>
                       <p className="text-sm font-medium">Загрузите свой первый анализ в разделе «Bio-Синхронизация»</p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          ) : (
            <ScrollArea className="h-full">
              <div className="p-6 md:p-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 shadow-inner">
                  <p className="text-sm md:text-base font-medium leading-relaxed text-foreground/80 italic">
                    "{selectedLab.summary}"
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 px-2 flex items-center gap-2">
                    <FlaskConical className="h-3 w-3" /> Обнаруженные биомаркеры
                  </h4>
                  <div className="grid gap-3">
                    {selectedLab.markers?.map((marker: any, i: number) => {
                      const isOffNorm = marker.status !== 'normal';
                      const cleanRange = marker.referenceRange ? marker.referenceRange.replace(/норма/gi, '').trim() : null;
                        
                      return (
                        <div key={i} className="bg-white border rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-black text-sm">{marker.name}</span>
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "text-[8px] h-4 px-1 border-none",
                                  marker.status === 'high' ? "bg-red-100 text-red-600" : 
                                  marker.status === 'low' ? "bg-yellow-100 text-yellow-700" : 
                                  "bg-green-100 text-green-600"
                                )}
                              >
                                {marker.status === 'normal' ? 'В НОРМЕ' : marker.status === 'high' ? 'ВЫШЕ НОРМЫ' : 'НИЖЕ НОРМЫ'}
                              </Badge>
                            </div>
                            <div className="mt-0.5">
                              <p className="text-[10px] text-muted-foreground font-medium">
                                {marker.interpretation}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex flex-col items-end">
                            <div className="flex items-center justify-end gap-1.5">
                               <p className={cn("font-black text-base md:text-lg leading-none", isOffNorm && "text-destructive")}>
                                 {marker.value}
                               </p>
                               {isOffNorm && (
                                 marker.status === 'high' ? <TrendingUp className="h-4 w-4 text-red-500" /> : <TrendingDown className="h-4 w-4 text-yellow-500" />
                               )}
                            </div>
                            {isOffNorm && cleanRange && (
                              <p className="text-[10px] md:text-[11px] font-black text-muted-foreground/50 mt-1 uppercase tracking-tighter">
                                (норма {cleanRange})
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 px-2 flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3" /> ИИ Рекомендации
                  </h4>
                  <div className="grid gap-3">
                    {selectedLab.recommendations?.map((rec: string, i: number) => (
                      <div key={i} className="flex gap-4 items-start p-5 bg-white border border-primary/5 rounded-[1.5rem] shadow-sm">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Zap className="h-4 w-4 text-primary" />
                        </div>
                        <p className="text-xs md:text-sm font-medium leading-relaxed">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-muted/30 p-6 rounded-3xl border flex items-center gap-4">
                   <AlertCircle className="h-6 w-6 text-muted-foreground shrink-0" />
                   <p className="text-[9px] font-bold text-muted-foreground leading-snug uppercase tracking-wider">
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