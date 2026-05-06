'use client';

import { useState } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogTrigger, DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Calculator, Activity, AlertCircle, Save, 
  Loader2, CheckCircle2, FlaskConical, Info,
  TrendingDown, TrendingUp
} from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

export function MedicalCalculatorDialog() {
  const { user } = useUser();
  const { firestore } = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Входные данные
  const [rbc, setRbc] = useState(''); // Эритроциты (10¹²/л)
  const [hb, setHb] = useState('');   // Гемоглобин (г/л)
  const [mcv, setMcv] = useState(''); // Средний объем эритроцита (фл)
  const [mch, setMch] = useState(''); // Среднее содержание Hb в эритроците (пг)
  const [rdw, setRdw] = useState(''); // Ширина распределения эритроцитов (%)

  const [results, setResults] = useState<any | null>(null);

  const calculateIndices = async () => {
    const R = parseFloat(rbc);
    const H_raw = parseFloat(hb);
    const V = parseFloat(mcv);
    const M = parseFloat(mch);
    const Dw = parseFloat(rdw);

    if (!R || !H_raw || !V || !M || !Dw) {
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Заполните все поля для точного расчета.' });
      return;
    }

    // Для формул England & Fraser и Green & King нужен Hb в г/дл
    // Если введено > 30, считаем что это г/л и конвертируем
    const H_dl = H_raw > 30 ? H_raw / 10 : H_raw;

    const indices = [
      {
        name: 'Mentzer Index',
        value: (V / R).toFixed(2),
        formula: 'MCV / RBC',
        interpretation: (V / R) < 13 ? 'Талассемия' : 'ЖДА',
        isThal: (V / R) < 13,
        threshold: 'Порог: < 13'
      },
      {
        name: 'Ehsani Index',
        value: (V - (10 * R)).toFixed(2),
        formula: 'MCV - 10*RBC',
        interpretation: (V - (10 * R)) < 15 ? 'Талассемия' : 'ЖДА',
        isThal: (V - (10 * R)) < 15,
        threshold: 'Порог: < 15'
      },
      {
        name: 'England & Fraser',
        value: (V - R - (5 * H_dl) - 3.4).toFixed(2),
        formula: 'MCV - RBC - (5*Hb) - 3.4',
        interpretation: (V - R - (5 * H_dl) - 3.4) < 0 ? 'Талассемия' : 'ЖДА',
        isThal: (V - R - (5 * H_dl) - 3.4) < 0,
        threshold: 'Порог: < 0'
      },
      {
        name: 'Green & King',
        value: ((V * V * Dw) / (H_dl * 100)).toFixed(2),
        formula: '(MCV² * RDW) / (Hb * 100)',
        interpretation: ((V * V * Dw) / (H_dl * 100)) < 65 ? 'Талассемия' : 'ЖДА',
        isThal: ((V * V * Dw) / (H_dl * 100)) < 65,
        threshold: 'Порог: < 65'
      },
      {
        name: 'Ricerca Index',
        value: (Dw / R).toFixed(2),
        formula: 'RDW / RBC',
        interpretation: (Dw / R) < 3.3 ? 'Талассемия' : 'ЖДА',
        isThal: (Dw / R) < 3.3,
        threshold: 'Порог: < 3.3'
      },
      {
        name: 'Shine & Lal',
        value: ((V * V * M) / 100).toFixed(2),
        formula: '(MCV² * MCH) / 100',
        interpretation: ((V * V * M) / 100) < 1530 ? 'Талассемия' : 'ЖДА',
        isThal: ((V * V * M) / 100) < 1530,
        threshold: 'Порог: < 1530'
      }
    ];

    setResults(indices);

    // Логирование в Firestore для специалистов
    if (firestore && user?.uid && user.uid !== 'public-user') {
      setLoading(true);
      try {
        await addDoc(collection(firestore, 'calculator_logs'), {
          specialistId: user.uid,
          inputs: { rbc: R, hb: H_raw, mcv: V, mch: M, rdw: Dw },
          results: indices.map(idx => ({ name: idx.name, value: idx.value, interpretation: idx.interpretation })),
          timestamp: serverTimestamp()
        });
      } catch (e) {
        console.error("Log error:", e);
      } finally {
        setLoading(false);
      }
    }
  };

  const reset = () => {
    setRbc(''); setHb(''); setMcv(''); setMch(''); setRdw('');
    setResults(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) reset(); }}>
      <DialogTrigger asChild>
        <button className="h-10 px-3 md:px-6 rounded-full border border-primary/20 bg-primary/5 text-primary font-black uppercase text-[10px] flex items-center gap-2 shadow-lg hover:bg-primary/10 transition-all">
          <Calculator className="h-4 w-4" />
          <span className="hidden sm:inline">Диагностика Анемии</span>
          <span className="sm:hidden">Кальк</span>
        </button>
      </DialogTrigger>
      <DialogContent className="w-[98vw] md:max-w-[700px] rounded-[2.5rem] md:rounded-[3.5rem] p-0 overflow-hidden border-none shadow-2xl z-[1100] bg-[#010411]">
        <DialogHeader className="p-8 md:p-10 bg-primary text-slate-950 shrink-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-[#00ffff]/80 opacity-95" />
          <div className="relative z-10">
            <DialogTitle className="text-2xl md:text-3xl font-black uppercase tracking-tighter">Диф. диагностика</DialogTitle>
            <p className="text-slate-950/60 font-black uppercase text-[10px] tracking-widest mt-1">ЖДА vs ТАЛАССЕМИЯ (6 Индексов)</p>
          </div>
          <Calculator className="absolute -right-8 -bottom-8 h-32 w-32 text-slate-950/10 rotate-12" />
        </DialogHeader>

        <ScrollArea className="max-h-[75vh]">
          <div className="p-6 md:p-10 space-y-8 bg-blue-950/40 backdrop-blur-3xl">
            {!results ? (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="grid grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-white/40 px-2">RBC (Эритроциты, 10¹²/л)</Label>
                    <Input type="number" step="0.01" placeholder="4.5" value={rbc} onChange={e => setRbc(e.target.value)} className="h-14 bg-white/5 border-white/10 rounded-2xl font-bold text-lg text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-white/40 px-2">Hb (Гемоглобин, г/л)</Label>
                    <Input type="number" step="0.1" placeholder="120" value={hb} onChange={e => setHb(e.target.value)} className="h-14 bg-white/5 border-white/10 rounded-2xl font-bold text-lg text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-white/40 px-2">MCV (фл)</Label>
                    <Input type="number" step="0.1" placeholder="80" value={mcv} onChange={e => setMcv(e.target.value)} className="h-14 bg-white/5 border-white/10 rounded-2xl font-bold text-lg text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-white/40 px-2">MCH (пг)</Label>
                    <Input type="number" step="0.1" placeholder="27" value={mch} onChange={e => setMch(e.target.value)} className="h-14 bg-white/5 border-white/10 rounded-2xl font-bold text-lg text-white" />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label className="text-[10px] font-black uppercase text-white/40 px-2">RDW (%)</Label>
                    <Input type="number" step="0.1" placeholder="14" value={rdw} onChange={e => setRdw(e.target.value)} className="h-14 bg-white/5 border-white/10 rounded-2xl font-bold text-lg text-white" />
                  </div>
                </div>
                <Button 
                  onClick={calculateIndices} 
                  disabled={loading}
                  className="w-full h-18 rounded-3xl bg-primary text-slate-950 font-black text-xl shadow-[0_15px_40px_rgba(0,255,255,0.2)] hover:scale-[1.02] active:scale-95 transition-all"
                >
                  {loading ? <Loader2 className="animate-spin h-6 w-6" /> : "РАССЧИТАТЬ ИНДЕКСЫ"}
                </Button>
              </div>
            ) : (
              <div className="space-y-6 animate-in zoom-in-95 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.map((idx: any, i: number) => (
                    <div key={i} className="bg-white/5 border border-white/5 p-5 rounded-[1.5rem] flex flex-col gap-3 relative overflow-hidden group">
                       <div className="flex justify-between items-start relative z-10">
                          <p className="text-[9px] font-black uppercase text-white/30 tracking-widest">{idx.name}</p>
                          <p className="text-2xl font-black text-white">{idx.value}</p>
                       </div>
                       <div className={cn(
                         "p-2 rounded-xl text-center font-black uppercase text-[10px] transition-all relative z-10",
                         idx.isThal ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                       )}>
                         {idx.interpretation}
                       </div>
                       <div className="flex justify-between items-center mt-1 relative z-10">
                          <p className="text-[7px] font-bold text-white/10 uppercase italic group-hover:text-white/20 transition-colors">Formula: {idx.formula}</p>
                          <p className="text-[7px] font-black text-white/40 uppercase">{idx.threshold}</p>
                       </div>
                       {idx.isThal ? <TrendingDown className="absolute -right-2 -bottom-2 h-12 w-12 text-orange-500/5 -rotate-12" /> : <TrendingUp className="absolute -right-2 -bottom-2 h-12 w-12 text-emerald-500/5 -rotate-12" />}
                    </div>
                  ))}
                </div>

                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex items-start gap-4">
                   <AlertCircle className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                   <p className="text-[9px] font-bold text-white/40 leading-relaxed uppercase tracking-wider">
                     ВНИМАНИЕ: Все индексы являются расчетными и носят вспомогательный характер. Окончательный диагноз устанавливается на основе электрофореза гемоглобина и уровня ферритина.
                   </p>
                </div>

                <Button variant="outline" className="w-full h-14 rounded-2xl border-white/10 text-white font-black uppercase text-xs" onClick={() => setResults(null)}>НОВЫЙ РАСЧЕТ</Button>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="p-4 bg-black/40 border-t border-white/5">
           <p className="w-full text-center text-[8px] font-black text-white/20 uppercase tracking-[0.5em]">Diagnostic Protocol Verified (Final v2)</p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
