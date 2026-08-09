
import { Search, Shield, Database, Globe } from 'lucide-react';

export default function OsintPage() {
  return (
    <div className="min-h-screen bg-grid py-20 md:py-32">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-16 border-b border-white/10 pb-12">
          <div className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Департамент анализа данных</div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-6">Агрегация данных и OSINT</h1>
          <p className="text-[11px] text-muted-foreground font-bold tracking-[0.2em] max-w-2xl leading-relaxed">
            Профессиональные решения по сбору и анализу информации из открытых источников для оценки контрагентов и мониторинга цифровых рисков.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="p-8 border border-white/10 bg-black">
              <div className="flex items-center gap-4 mb-6">
                <Search className="w-6 h-6 text-blue-500" />
                <h3 className="text-lg font-black text-white">Глубокий технический поиск</h3>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed font-bold tracking-wider mb-6">
                Автоматизированный сбор данных по утечкам, упоминаниям в дарквебе и подозрительной активности, связанной с вашей ИТ-инфраструктурой.
              </p>
              <ul className="text-[9px] font-mono text-white/40 space-y-2">
                <li>// Scan frequency: 24/7 Real-time</li>
                <li>// Data sources: Indexing 10k+ nodes</li>
              </ul>
            </div>
            
            <div className="p-8 border border-white/10 bg-black">
              <div className="flex items-center gap-4 mb-6">
                <Shield className="w-6 h-6 text-blue-500" />
                <h3 className="text-lg font-black text-white">Оценка рисков контрагентов</h3>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed font-bold tracking-wider">
                Проверка деловой репутации и связей в рамках комплаенс-процедур. Анализ соответствия требованиям 115-ФЗ.
              </p>
            </div>
          </div>

          <aside className="space-y-8">
            <div className="bg-blue-500/5 border border-blue-500/10 p-8">
              <h4 className="technical-label mb-4 text-white">Регламент обработки</h4>
              <p className="text-[10px] text-muted-foreground leading-relaxed font-bold tracking-widest">
                Все процедуры OSINT проводятся в строгом соответствии с ФЗ-152 «О персональных данных». Мы не используем запрещенные методы получения информации.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
