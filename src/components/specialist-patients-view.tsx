'use client';

import { useState, useMemo } from 'react';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, query, where, addDoc, getDocs, doc } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, Search, MessageSquare, Activity, 
  ArrowUpRight, UserCheck, Loader2, ArrowLeft
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { PatientDataViewer } from './patient-data-viewer';
import { useToast } from '@/hooks/use-toast';

interface SpecialistPatientsViewProps {
  onStartChat?: (id: string) => void;
}

export function SpecialistPatientsView({ onStartChat }: SpecialistPatientsViewProps) {
  const { user } = useUser();
  const { firestore } = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchText] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [chatLoading, setChatLoading] = useState(false);

  // Данные текущего врача
  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid || user.uid === 'public-user') return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: userData } = useDoc<any>(userDocRef);

  // Запрос на поиск пользователей, которые поделились данными с этим специалистом
  const patientsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid || user.uid === 'public-user') return null;
    return query(
      collection(firestore, 'users'),
      where('sharedWith', 'array-contains', user.uid)
    );
  }, [firestore, user?.uid]);

  const { data: patients, isLoading } = useCollection<any>(patientsQuery);

  const filteredPatients = useMemo(() => {
    if (!patients) return [];
    return patients.filter(p => 
      p.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [patients, searchTerm]);

  const handleStartChat = async (patient: any) => {
    if (!user || !firestore || !userData || !patient) return;
    
    setChatLoading(true);
    try {
      // Проверяем, существует ли уже чат
      const chatsQuery = query(
        collection(firestore, 'chats'),
        where('participants', 'array-contains', user.uid)
      );
      const querySnapshot = await getDocs(chatsQuery);
      let existingChat = null;
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.participants.includes(patient.id)) {
          existingChat = { id: doc.id, ...data };
        }
      });

      if (!existingChat) {
        await addDoc(collection(firestore, 'chats'), {
          participants: [user.uid, patient.id],
          participantDetails: {
            [user.uid]: { name: userData.firstName || 'Специалист', photo: userData.photoUrl || '' },
            [patient.id]: { name: (patient.firstName + ' ' + (patient.lastName || '')).trim(), photo: patient.photoUrl || '' }
          },
          lastMessage: 'Начат диалог со специалистом.',
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        });
      }
      
      onStartChat?.(patient.id);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Ошибка чата', description: 'Не удалось инициализировать переписку.' });
    } finally {
      setChatLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center space-y-4">
           <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto opacity-20" />
           <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">Синхронизация списка пациентов...</p>
        </div>
      </div>
    );
  }

  if (selectedPatient) {
    return (
      <div className="animate-in fade-in duration-500">
        <div className="max-w-6xl mx-auto px-4 mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setSelectedPatient(null)} 
            className="rounded-xl gap-2 text-white/40 hover:text-primary transition-all"
          >
            <ArrowLeft className="h-4 w-4" /> Вернуться к списку
          </Button>
        </div>
        <PatientDataViewer 
          patient={selectedPatient} 
          onStartChat={(id) => handleStartChat(selectedPatient)} 
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500 pb-32 pt-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4">
        <div className="text-center md:text-left">
           <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase leading-none">Пациенты</h2>
           <p className="text-primary/60 font-black uppercase text-[10px] tracking-[0.3em] mt-2">Bio-Tech Client Management</p>
        </div>
        <div className="relative w-full md:w-96">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20" />
           <Input 
             placeholder="Поиск по имени или email..." 
             className="h-14 rounded-2xl bg-blue-950/40 border-white/10 pl-12 text-white font-bold shadow-inner placeholder:text-white/20 focus:ring-4 focus:ring-primary/5"
             value={searchTerm}
             onChange={e => setSearchText(e.target.value)}
           />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
        {filteredPatients.map((patient) => (
          <Card key={patient.id} className="cyber-card group overflow-hidden border-none bg-blue-950/40 backdrop-blur-xl transition-all hover:translate-y-[-4px]">
             <CardContent className="p-0">
                <div className="p-6 space-y-6">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="relative">
                            <Avatar className="h-16 w-16 border-2 border-primary/20 rounded-2xl group-hover:border-primary transition-colors shadow-lg">
                               <AvatarImage src={patient.photoUrl} className="object-cover" />
                               <AvatarFallback className="bg-primary/5 text-primary text-xl font-black">{patient.firstName?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-emerald-500 rounded-full border-2 border-black animate-pulse" />
                         </div>
                         <div>
                            <h3 className="font-black text-white text-lg leading-tight uppercase truncate max-w-[150px]">{patient.firstName} {patient.lastName}</h3>
                            <Badge variant="outline" className="mt-1 bg-primary/5 border-primary/20 text-primary text-[8px] font-black uppercase tracking-widest">
                               Bio-Access: Active
                            </Badge>
                         </div>
                      </div>
                      <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 bg-white/5 text-white/20 hover:text-primary transition-all" onClick={() => setSelectedPatient(patient)}>
                         <ArrowUpRight className="h-5 w-5" />
                      </Button>
                   </div>

                   <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-1 shadow-inner">
                         <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Параметры</p>
                         <p className="text-xs font-bold text-white">{patient.weight || '—'} кг / {patient.height || '—'} см</p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-1 shadow-inner">
                         <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Цель</p>
                         <p className="text-[10px] font-bold text-primary truncate uppercase tracking-tight">{patient.healthGoal || 'Не указана'}</p>
                      </div>
                   </div>
                </div>

                <div className="bg-primary p-2 flex items-center justify-between">
                   <div className="flex items-center gap-4 px-4">
                      <div 
                        className="flex items-center gap-1.5 opacity-60 hover:opacity-100 cursor-pointer transition-opacity"
                        onClick={() => handleStartChat(patient)}
                      >
                         <MessageSquare className="h-3.5 w-3.5 text-slate-950" />
                         <span className="text-[9px] font-black text-slate-950 uppercase tracking-tight">Чат</span>
                      </div>
                      <div className="flex items-center gap-1.5 opacity-60 hover:opacity-100 cursor-pointer transition-opacity" onClick={() => setSelectedPatient(patient)}>
                         <Activity className="h-3.5 w-3.5 text-slate-950" />
                         <span className="text-[9px] font-black text-slate-950 uppercase tracking-tight">Данные</span>
                      </div>
                   </div>
                   <Button 
                    className="h-9 rounded-xl bg-slate-950 text-white hover:bg-slate-900 font-black text-[9px] uppercase tracking-widest shadow-xl"
                    onClick={() => setSelectedPatient(patient)}
                   >
                      Открыть карту
                   </Button>
                </div>
             </CardContent>
          </Card>
        ))}

        {filteredPatients.length === 0 && (
          <div className="col-span-full py-24 text-center space-y-8 bg-white/[0.03] border-2 border-dashed border-white/5 rounded-[3rem] animate-in zoom-in-95 duration-500">
             <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto border border-primary/10">
                <Users className="h-12 w-12 text-primary/20" />
             </div>
             <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-2xl font-black text-white/40 uppercase tracking-tight">Список пуст</h3>
                <p className="text-sm text-white/20 font-medium leading-relaxed">
                   Ваши клиенты появятся здесь сразу после того, как предоставят вам доступ к своим данным в своем профиле.
                </p>
             </div>
          </div>
        )}
      </div>

      <div className="px-4">
         <Card className="premium-card bg-gradient-to-br from-blue-600/10 to-indigo-950/40 border-blue-500/20 shadow-2xl p-10 md:p-14 rounded-[3rem] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -z-10" />
            <div className="flex flex-col md:flex-row items-center gap-10">
               <div className="w-24 h-24 bg-primary rounded-[2rem] flex items-center justify-center shrink-0 shadow-[0_0_50px_rgba(0,255,255,0.4)] rotate-3">
                  <UserCheck className="h-12 w-12 text-slate-950" />
               </div>
               <div className="space-y-4 text-center md:text-left flex-1">
                  <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">Как получить доступ к пациенту?</h3>
                  <p className="text-white/50 font-medium leading-relaxed max-w-2xl text-sm md:text-base">
                     Чтобы начать мониторинг, пациент должен найти ваш профиль в <strong>Ленте</strong> и нажать кнопку <strong>«Предоставить личные данные»</strong>. 
                     Это даст вам право анализировать его рацион, показатели Apple Health/Google Fit и результаты лабораторных анализов.
                  </p>
                  <div className="flex justify-center md:justify-start gap-4">
                     <Badge className="bg-white/5 text-white/40 border-none font-bold px-4 py-1.5 rounded-lg uppercase text-[10px]">Privacy AES-512</Badge>
                     <Badge className="bg-white/5 text-white/40 border-none font-bold px-4 py-1.5 rounded-lg uppercase text-[10px]">Secure Data Sharing</Badge>
                  </div>
               </div>
            </div>
         </Card>
      </div>
    </div>
  );
}