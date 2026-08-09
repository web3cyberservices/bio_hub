
import { Terminal, Layers, Settings, ShieldCheck } from 'lucide-react';

export default function DevSecOpsPage() {
  return (
    <div className="min-h-screen bg-grid py-20 md:py-32">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-16 border-b border-white/10 pb-12">
          <div className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Департамент внедрения</div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-6">DevSecOps Консалтинг</h1>
          <p className="text-[11px] text-muted-foreground font-bold tracking-[0.2em] max-w-2xl leading-relaxed">
            Интеграция лучших практик безопасности в ваш цикл разработки и эксплуатации инфраструктуры.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-12">
            <section className="space-y-4">
              <h3 className="text-lg font-black text-white flex items-center gap-3">
                <Terminal className="w-5 h-5 text-blue-500" /> Автоматизация CI/CD
              </h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed font-bold tracking-wider">
                Внедрение инструментов автоматического сканирования кода (SAST/DAST) и управления секретами на всех этапах доставки ПО.
              </p>
            </section>
            
            <section className="space-y-4">
              <h3 className="text-lg font-black text-white flex items-center gap-3">
                <Layers className="w-5 h-5 text-blue-500" /> Infrastructure as Code (IaC)
              </h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed font-bold tracking-wider">
                Безопасное развертывание серверов через Terraform/Ansible с предустановленными политиками безопасности.
              </p>
            </section>
          </div>

          <aside>
            <div className="p-8 border border-white/10 bg-white/[0.01] sticky top-28">
              <h4 className="technical-label mb-6">Результаты внедрения</h4>
              <ul className="space-y-6">
                {[
                  "Сокращение времени Time-to-Market",
                  "Исключение утечек API-ключей",
                  "Снижение вероятности взлома на 90%",
                  "Автоматическая отчетность для ИБ"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span className="text-[10px] font-black tracking-widest">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
