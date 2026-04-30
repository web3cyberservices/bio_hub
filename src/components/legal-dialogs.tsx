'use client';

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShieldCheck, FileText, Lock, AlertTriangle } from 'lucide-react';

export function LegalDialogs({ type }: { type: 'eula' | 'privacy' | 'data' }) {
  const content = {
    eula: {
      title: 'Лицензионное соглашение (EULA)',
      icon: <FileText className="h-6 w-6 text-primary" />,
      text: `ПРОПРИЕТАРНАЯ ЛИЦЕНЗИЯ И УСЛОВИЯ ИСПОЛЬЗОВАНИЯ (EULA)
Версия 1.0.26-BY
© 2024 NEXT GEN BIOTECH LABS.

1. ОБЪЕКТ ИНТЕЛЛЕКТУАЛЬНОЙ СОБСТВЕННОСТИ
Данное ПО, включая исходный код, архитектуру базы данных "Bio-Hub", алгоритмы расчета биомаркеров и дизайн интерфейса, является объектом авторского права.

2. ПРЕДОСТАВЛЕНИЕ ПРАВ
Пользователю предоставляется неисключительное право на использование ПО в личных целях управления здоровьем. Любое коммерческое использование алгоритмов запрещено.

3. ОГРАНИЧЕНИЯ
Запрещается:
• Реверс-инжиниринг алгоритмов «био-скоринга».
• Копирование или тиражирование кода.
• Использование ПО для оказания платных услуг третьим лицам без согласия правообладателя.`
    },
    privacy: {
      title: 'Политика конфиденциальности',
      icon: <Lock className="h-6 w-6 text-primary" />,
      text: `ЗАЩИТА ДАННЫХ И КОНФИДЕНЦИАЛЬНОСТЬ

1. ТЕХНОЛОГИИ ЗАЩИТЫ
• Шифрование At-Rest: Google Cloud AES-256.
• Шифрование In-Transit: TLS 1.3.
• Клиентское шифрование: Данные о препаратах и анализах шифруются на устройстве пользователя.

2. СБОР ДАННЫХ
Мы собираем биометрические показатели (вес, рост, активность) и медицинские данные исключительно для работы ИИ-алгоритмов рекомендаций.

3. УДАЛЕНИЕ ДАННЫХ
Пользователь имеет право в любой момент запросить полное удаление своего аккаунта и всех связанных с ним биометрических архивов.`
    },
    data: {
      title: 'Обработка персональных данных',
      icon: <ShieldCheck className="h-6 w-6 text-primary" />,
      text: `СОГЛАСИЕ НА ОБРАБОТКУ И ТРАНСГРАНИЧНУЮ ПЕРЕДАЧУ

Согласно Закону Республики Беларусь № 99-З "О защите персональных данных":

1. ТРАНСГРАНИЧНАЯ ПЕРЕДАЧА
Используя приложение, вы подтверждаете согласие на передачу зашифрованных данных на серверы провайдера (Google Firebase) для обеспечения работы облачной синхронизации.

2. МЕДИЦИНСКАЯ ОГОВОРКА
Сервис PRO Себя использует искусственный интеллект для анализа данных. ИИ-рекомендации не являются постановкой диагноза и не заменяют очную консультацию врача.

3. ПРЕДОСТАВЛЕНИЕ ДОСТУПА
Предоставляя доступ специалисту (врачу/нутрициологу), вы добровольно открываете ему доступ к своему биометрическому профилю.`
    }
  }[type];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-primary hover:underline decoration-primary/30 underline-offset-4 font-bold">
          {content.title}
        </button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-[600px] rounded-[2rem] bg-[#010411] border border-white/10 p-0 overflow-hidden shadow-2xl z-[1500]">
        <DialogHeader className="p-8 bg-primary text-slate-950 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-[#00ffff]/80 opacity-90" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
              {content.icon}
            </div>
            <div>
              <DialogTitle className="text-2xl font-black uppercase tracking-tighter">{content.title}</DialogTitle>
              <p className="text-slate-950/60 font-black uppercase text-[10px] tracking-widest mt-1">Legal & Compliance Hub</p>
            </div>
          </div>
        </DialogHeader>
        <ScrollArea className="h-[50vh] p-8 bg-blue-950/40 backdrop-blur-3xl">
          <div className="whitespace-pre-wrap text-sm text-white/80 leading-relaxed font-medium">
            {content.text}
          </div>
          <div className="mt-8 p-6 rounded-2xl bg-primary/5 border border-primary/20 flex items-start gap-4">
             <AlertTriangle className="h-5 w-5 text-primary shrink-0" />
             <p className="text-[10px] font-bold text-white/50 uppercase leading-relaxed tracking-wider">
               Используя сервис PRO Себя, вы автоматически подтверждаете ознакомление с данными документами.
             </p>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
