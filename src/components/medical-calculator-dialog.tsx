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
  Loader2, CheckCircle2, FlaskConical,
  TrendingDown, TrendingUp,
  Percent, FileSearch, ShieldAlert, Zap
} from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface IndexResult {
  name: string;
  value: number;
  interpretation: 'Талассемия' | 'ЖДА';
  formula: string;
  threshold: string;
  isThal: boolean;
  sens: number;
  spec: number;
}

export function MedicalCalculatorDialog() {
  const { user } = useUser();
  const { firestore } = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const [rbc, setRbc] = useState('');
  const [hb, setHb] = useState('');
  const [mcv, setMcv] = useState('');
  const [mch, setMch] = useState('');
  const [rdw, setRdw] = useState('');
  const [microR, setMicroR] = useState('');
  const [hypoHe, setHypoHe] = useState('');
  const [hba2, setHba2] = useState('');
  const [hbf, setHbf] = useState('');

  const [results, setResults] = useState<{
    indices: IndexResult[];
    hplc: { evaluated: boolean; comment: string };
    probability: number;
    verdict: string;
  } | null>(null);

  const parseVal = (val: string) => parseFloat(val.replace(',', '.'));

  const calculateAll = async () => {
    try {
      const R = parseVal(rbc);
      const H_raw = parseVal(hb);
      const V = parseVal(mcv);
      const M = parseVal(mch);
      const Dw = parseVal(rdw);
      
      const MR = microR !== '' ? parseVal(microR) : undefined;
      const HH = hypoHe !== '' ? parseVal(hypoHe) : undefined;
      const A2 = hba2 !== '' ? parseVal(hba2) : undefined;
      const F = hbf !== '' ? parseVal(hbf) : undefined;

      if (isNaN(R) || isNaN(H_raw) || isNaN(V) || isNaN(M) || isNaN(Dw)) {
        toast({ 
          variant: 'destructive', 
          title: 'Данные не полны', 
          description: 'Пожалуйста, заполните основные поля: RBC, Hb, MCV, MCH и RDW.' 
        });
        return;
      }

      setLoading(true);

      const H_dl = H_raw > 30 ? H_raw / 10 : H_raw;
      
      const indices: IndexResult[] = [];

      // 1. Ehsani et al
      const ehsani = V - (10 * R);
      indices.push({
        name: "Ehsani et al",
        value: parseFloat(ehsani.toFixed(3)),
        interpretation: ehsani < 15 ? 'Талассемия' : 'ЖДА',
        isThal: ehsani < 15,
        formula: "MCV - (10 * RBC)",
        threshold: "< 15",
        sens: 87.2, spec: 88.9
      });

      // 2. England et al
      const england = V - R - (5 * H_dl) - 3.4;
      indices.push({
        name: "England et al",
        value: parseFloat(england.toFixed(3)),
        interpretation: england < 0 ? 'Талассемия' : 'ЖДА',
        isThal: england < 0,
        formula: "MCV - RBC - (5 * Hb/10) - 3.4",
        threshold: "< 0",
        sens: 78.6, spec: 98.4
      });

      // 3. Green and King
      const greenKing = (V * V * Dw) / (10 * H_dl);
      indices.push({
        name: "Green and King",
        value: parseFloat(greenKing.toFixed(3)),
        interpretation: greenKing < 65 ? 'Талассемия' : 'ЖДА',
        isThal: greenKing < 65,
        formula: "(MCV² * RDW) / (10 * Hb_gdl)",
        threshold: "< 65",
        sens: 91.0, spec: 99.1
      });

      // 4. Mentzer
      const mentzer = V / R;
      indices.push({
        name: "Mentzer",
        value: parseFloat(mentzer.toFixed(3)),
        interpretation: mentzer < 13 ? 'Талассемия' : 'ЖДА',
        isThal: mentzer < 13,
        formula: "MCV / RBC",
        threshold: "< 13",
        sens: 94.3, spec: 84.2
      });

      // 5. Ricerca et al
      const ricerca = Dw / R;
      indices.push({
        name: "Ricerca et al",
        value: parseFloat(ricerca.toFixed(3)),
        interpretation: ricerca < 4.4 ? 'Талассемия' : 'ЖДА',
        isThal: ricerca < 4.4,
        formula: "RDW / RBC",
        threshold: "< 4.4",
        sens: 100.0, spec: 13.7
      });

      // 6. Shine and Lal
      const shineLal = (V * V * M) / 100;
      indices.push({
        name: "Shine and Lal",
        value: parseFloat(shineLal.toFixed(3)),
        interpretation: shineLal < 1530 ? 'Талассемия' : 'ЖДА',
        isThal: shineLal < 1530,
        formula: "(MCV² * MCH) / 100",
        threshold: "< 1530",
        sens: 100.0, spec: 13.3
      });

      // 7. Sirdah et al
      const sirdah = V - R - (3 * H_dl);
      indices.push({
        name: "Sirdah et al",
        value: parseFloat(sirdah.toFixed(3)),
        interpretation: sirdah < 27 ? 'Талассемия' : 'ЖДА',
        isThal: sirdah < 27,
        formula: "MCV - RBC - (3 * Hb/10)",
        threshold: "< 27",
        sens: 81.3, spec: 97.9
      });

      // 8. Srivastava and Bevington
      const srivastava = M / R;
      indices.push({
        name: "Srivastava and Bevington",
        value: parseFloat(srivastava.toFixed(3)),
        interpretation: srivastava < 3.8 ? 'Талассемия' : 'ЖДА',
        isThal: srivastava < 3.8,
        formula: "MCH / RBC",
        threshold: "< 3.8",
        sens: 70.8, spec: 91.3
      });

      if (MR !== undefined && !isNaN(MR) && HH !== undefined && !isNaN(HH)) {
        // 9. M-H
        const mh = MR - HH;
        indices.push({
          name: "M-H",
          value: parseFloat(mh.toFixed(3)),
          interpretation: mh > 11.5 ? 'Талассемия' : 'ЖДА',
          isThal: mh > 11.5,
          formula: "MicroR - Hypo_He",
          threshold: "> 11.5",
          sens: 97.4, spec: 96.0
        });

        // 10. M-H-R (Индекс Уречаги)
        const mhr = MR - HH - Dw;
        indices.push({
          name: "M-H-R (Индекс Уречаги)",
          value: parseFloat(mhr.toFixed(3)),
          interpretation: mhr > -5.1 ? 'Талассемия' : 'ЖДА',
          isThal: mhr > -5.1,
          formula: "MicroR - Hypo_He - RDW",
          threshold: "> -5.1",
          sens: 98.1, spec: 97.1
        });
      }

      let hplcComment = "Данные ВЭЖХ не предоставлены.";
      let hplcAlert = false;
      if ((A2 !== undefined && !isNaN(A2)) || (F !== undefined && !isNaN(F))) {
        const a2Flag = A2 !== undefined && A2 > 3;
        const fFlag = F !== undefined && F > 2;
        if (a2Flag || fFlag) {
          hplcAlert = true;
          hplcComment = `Критическое повышение фракций (${a2Flag ? `HbA2: ${A2}%` : ''} ${fFlag ? `HbF: ${F}%` : ''}). Данная картина свидетельствует в пользу Бета-талассемии.`;
        } else {
          hplcComment = "Фракции HbA2 и HbF в пределах нормы. Риск Бета-талассемии низкий.";
        }
      }

      let thalVotes = 0;
      let totalVotes = 0;
      indices.forEach(idx => {
        const weight = (idx.sens + idx.spec) / 200;
        totalVotes += weight;
        if (idx.isThal) thalVotes += weight;
      });

      let prob = (thalVotes / totalVotes) * 100;
      if (hplcAlert) prob = Math.max(prob, 95);

      const verdict = prob > 65 ? "Талассемия" : (prob < 35 ? "Железодефицитная анемия (ЖДА)" : "Смешанный паттерн");

      const finalRes = {
        indices,
        hplc: { evaluated: hplcAlert, comment: hplcComment },
        probability: parseFloat(prob.toFixed(1)),
        verdict
      };

      setResults(finalRes);

      if (firestore && user?.uid && user.uid !== 'public-user') {
        await addDoc(collection(firestore, 'calculator_logs'), {
          specialistId: user.uid,
          inputs: { rbc: R, hb: H_raw, mcv: V, mch: M, rdw: Dw, microR: MR || null, hypoHe: HH || null, hba2: A2 || null, hbf: F || null },
          verdict,
          probability: prob,
          timestamp: serverTimestamp()
        });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Ошибка расчета' });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setRbc(''); setHb(''); setMcv(''); setMch(''); setRdw('');
    setMicroR(''); setHypoHe(''); setHba2(''); setHbf('');
    setResults(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) reset(); }}>
      <DialogTrigger asChild>
        <button className="h-10 px-3 md:px-6 rounded-full border border-primary/20 bg-primary/5 text-primary font-black uppercase text-[10px] flex items-center gap-2 shadow-lg hover:bg-primary/10 transition-all">
          <Calculator className="h-4 w-4" />
          <span>Калькулятор</span>
        </button>
      </DialogTrigger>
      <DialogContent className="w-[98vw] md:max-w-[850px] rounded-[2.5rem] md:rounded-[3.5rem] p-0 overflow-hidden border-none shadow-2xl z-[1100] bg-[#010411] flex flex-col h-[90vh] md:h-auto max-h-[92vh]">
        <DialogHeader className="p-6 md:p-10 bg-primary text-slate-950 shrink-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-[#00ffff]/80 opacity-95" />
          <div className="relative z-10">
            <DialogTitle className="text-2xl md:text-4xl font-black uppercase tracking-tighter">Калькулятор</DialogTitle>
            <p className="text-slate-950/60 font-black uppercase text-[10px] tracking-widest mt-1">Диф. диагностика: 10 Индексов + HPLC</p>
          </div>
          <FlaskConical className="absolute -right-8 -bottom-8 h-32 w-32 text-slate-950/10 rotate-12" />
        </DialogHeader>

        <div className="flex-1 overflow-y-auto bg-blue-950/40 backdrop-blur-3xl p-6 md:p-10 space-y-10 pb-32 no-scrollbar">
          {!results ? (
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase text-primary/60 px-2 flex items-center gap-2">
                  <Activity className="h-3 w-3" /> Базовые параметры (ОАК)
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="space-y-1">
                    <Label className="text-[8px] font-black uppercase text-white/30 ml-2">RBC (10¹²/л)</Label>
                    <Input type="text" placeholder="4.5" value={rbc} onChange={e => setRbc(e.target.value)} className="h-12 bg-white/5 border-white/10 rounded-xl font-bold text-white text-center" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[8px] font-black uppercase text-white/30 ml-2">Hb (г/л)</Label>
                    <Input type="text" placeholder="120" value={hb} onChange={e => setHb(e.target.value)} className="h-12 bg-white/5 border-white/10 rounded-xl font-bold text-white text-center" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[8px] font-black uppercase text-white/30 ml-2">MCV (фл)</Label>
                    <Input type="text" placeholder="80" value={mcv} onChange={e => setMcv(e.target.value)} className="h-12 bg-white/5 border-white/10 rounded-xl font-bold text-white text-center" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[8px] font-black uppercase text-white/30 ml-2">MCH (пг)</Label>
                    <Input type="text" placeholder="27" value={mch} onChange={e => setMch(e.target.value)} className="h-12 bg-white/5 border-white/10 rounded-xl font-bold text-white text-center" />
                  </div>
                  <div className="space-y-1 col-span-2 md:col-span-1">
                    <Label className="text-[8px] font-black uppercase text-white/30 ml-2">RDW (%)</Label>
                    <Input type="text" placeholder="14" value={rdw} onChange={e => setRdw(e.target.value)} className="h-12 bg-white/5 border-white/10 rounded-xl font-bold text-white text-center" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase text-[#00ffff]/60 px-2 flex items-center gap-2">
                  <Zap className="h-3 w-3 text-primary" /> Продвинутые маркеры
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-[8px] font-black uppercase text-white/30 ml-2">MicroR (%)</Label>
                    <Input type="text" placeholder="Опционально" value={microR} onChange={e => setMicroR(e.target.value)} className="h-14 bg-white/5 border-white/10 rounded-xl font-bold text-white text-center" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[8px] font-black uppercase text-white/30 ml-2">Hypo-He (%)</Label>
                    <Input type="text" placeholder="Опционально" value={hypoHe} onChange={e => setHypoHe(e.target.value)} className="h-14 bg-white/5 border-white/10 rounded-xl font-bold text-white text-center" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase text-emerald-400/60 px-2 flex items-center gap-2">
                  <FileSearch className="h-3 w-3" /> Данные ВЭЖХ (HPLC)
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-[8px] font-black uppercase text-white/30 ml-2">HbA2 (%)</Label>
                    <Input type="text" placeholder="Норма < 3%" value={hba2} onChange={e => setHba2(e.target.value)} className="h-14 bg-white/5 border-white/10 rounded-xl font-bold text-white text-center" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[8px] font-black uppercase text-white/30 ml-2">HbF (%)</Label>
                    <Input type="text" placeholder="Норма < 2%" value={hbf} onChange={e => setHbf(e.target.value)} className="h-14 bg-white/5 border-white/10 rounded-xl font-bold text-white text-center" />
                  </div>
                </div>
              </div>

              <Button 
                onClick={calculateAll} 
                disabled={loading}
                className="w-full h-20 rounded-[2rem] bg-primary text-slate-950 font-black text-2xl shadow-[0_20px_50px_rgba(0,255,255,0.2)] hover:scale-[1.01] active:scale-95 transition-all"
              >
                {loading ? <Loader2 className="animate-spin h-8 w-8" /> : "ЗАПУСТИТЬ АНАЛИЗ"}
              </Button>
            </div>
          ) : (
            <div className="space-y-10 animate-in zoom-in-95 duration-500 pb-10">
              <div className="p-8 border-none bg-primary/10 rounded-[2.5rem] relative overflow-hidden">
                 <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="relative shrink-0">
                       <div className="w-32 h-32 rounded-full border-4 border-primary/30 flex items-center justify-center">
                          <span className="text-4xl font-black text-white">{results.probability}%</span>
                       </div>
                       <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full -z-10 animate-pulse" />
                    </div>
                    <div className="text-center md:text-left space-y-2 flex-1">
                       <Badge className="bg-primary text-black font-black uppercase text-[10px] px-4">Вероятность</Badge>
                       <h3 className="text-3xl font-black text-white uppercase tracking-tighter leading-tight">{results.verdict}</h3>
                       <p className="text-sm text-white/60 font-medium leading-relaxed italic">Расчет произведен на основе 10 индексов с учетом их диагностической ценности.</p>
                    </div>
                 </div>
                 <Zap className="absolute -right-10 -bottom-10 h-40 w-40 text-primary/5 rotate-12" />
              </div>

              <div className="bg-white/5 border border-white/5 p-6 rounded-[2rem] flex items-start gap-4 shadow-inner">
                 <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border", results.hplc.evaluated ? "bg-red-500/20 border-red-500 text-red-500" : "bg-emerald-500/20 border-emerald-500 text-emerald-400")}>
                    <ShieldAlert className="h-6 w-6" />
                 </div>
                 <div className="space-y-1">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-white/30">Результат ВЭЖХ (HPLC)</h4>
                    <p className="text-sm font-bold text-white/90 leading-relaxed">{results.hplc.comment}</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.indices.map((idx, i) => (
                  <div key={i} className="bg-black/40 border border-white/5 p-5 rounded-[1.5rem] flex flex-col gap-3 group hover:border-primary/30 transition-all">
                    <div className="flex justify-between items-start">
                      <p className="text-[9px] font-black uppercase text-white/30 tracking-widest">{idx.name}</p>
                      <span className="text-2xl font-black text-white">{idx.value}</span>
                    </div>
                    <div className={cn(
                      "p-2 rounded-xl text-center font-black uppercase text-[10px] border",
                      idx.isThal ? "bg-orange-500/20 text-orange-400 border-orange-500/30" : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    )}>
                      {idx.interpretation}
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="outline" className="w-full h-14 rounded-2xl border-white/10 text-white font-black uppercase text-xs hover:bg-white/5" onClick={() => setResults(null)}>НОВЫЙ РАСЧЕТ</Button>
            </div>
          )}
        </div>

        <DialogFooter className="p-4 bg-black/40 border-t border-white/5 shrink-0">
           <p className="w-full text-center text-[8px] font-black text-white/20 uppercase tracking-[0.5em]">Hematology Core v4.0.26-BY</p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
