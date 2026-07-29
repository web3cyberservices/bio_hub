import { Shield, Zap, ArrowRight, Lock, Globe, Server, Activity } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="pb-20">
      <section className="container mx-auto px-6 pt-32 pb-40 relative overflow-hidden text-center">
        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-sm border border-primary/30 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Система готова к приему трафика
        </div>
        
        <h1 className="text-6xl md:text-[120px] font-black tracking-tighter mb-10 uppercase leading-[0.85] text-gradient animate-in fade-in zoom-in-95 duration-1000">
          Данные <br /> <span className="text-primary">без границ</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-16 font-medium leading-relaxed uppercase tracking-tight">
          CyberLog — промышленная платформа логирования. Принимайте терабайты телеметрии в секунду через оптимизированный gRPC-пайплайн с задержкой менее 5мс.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          <Link href="/api-docs" className="w-full sm:w-auto bg-primary text-primary-foreground px-10 py-5 rounded-sm font-black uppercase tracking-[0.2em] text-[11px] hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3 shadow-[0_0_50px_-12px_rgba(37,99,235,0.5)]">
            Развернуть API <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/pricing" className="w-full sm:w-auto border border-white/10 bg-white/5 px-10 py-5 rounded-sm font-black uppercase tracking-[0.2em] text-[11px] hover:bg-white/10 transition-all text-center">
            Тарифные планы
          </Link>
        </div>
      </section>

      <section className="border-y border-white/5 bg-white/[0.02] py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { label: 'Задержка приема', value: '< 5мс' },
              { label: 'Пропускная способность', value: '15Tb/s' },
              { label: 'Доступность узлов', value: '99.999%' },
              { label: 'Глобальные регионы', value: '24/7' },
            ].map((stat) => (
              <div key={stat.label} className="group relative">
                <div className="text-4xl md:text-5xl font-black text-white mb-3 group-hover:text-primary transition-colors tracking-tighter">{stat.value}</div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-black border-l-2 border-primary/30 pl-4">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-40">
        <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-6 leading-none">Технологическое превосходство</h2>
            <p className="text-muted-foreground font-medium uppercase text-xs tracking-widest leading-loose">
              Мы переосмыслили способ работы с логами для Enterprise-сегмента, убрав все лишнее и сосредоточившись на скорости и безопасности.
            </p>
          </div>
          <div className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-2 flex items-center gap-3">
            <Activity className="w-4 h-4" /> Технические спецификации
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-1px bg-white/5 border border-white/5 rounded-sm overflow-hidden shadow-2xl">
          <div className="p-12 bg-background space-y-8 hover:bg-white/[0.02] transition-colors group">
            <Zap className="w-12 h-12 text-primary group-hover:scale-110 transition-transform" />
            <div className="space-y-4">
              <h3 className="text-xl font-black uppercase tracking-tight">Экстремальная скорость</h3>
              <p className="text-xs text-muted-foreground leading-loose font-medium uppercase tracking-wider">
                Использование gRPC и Protobuf позволяет сократить размер пакетов на 60% и увеличить скорость парсинга в 10 раз по сравнению с JSON.
              </p>
            </div>
          </div>
          <div className="p-12 bg-background space-y-8 hover:bg-white/[0.02] transition-colors group">
            <Lock className="w-12 h-12 text-primary group-hover:scale-110 transition-transform" />
            <div className="space-y-4">
              <h3 className="text-xl font-black uppercase tracking-tight">Безопасность данных</h3>
              <p className="text-xs text-muted-foreground leading-loose font-medium uppercase tracking-wider">
                Шифрование TLS 1.3 на всех этапах передачи. Поддержка аппаратных ключей и mTLS для строгой аутентификации устройств.
              </p>
            </div>
          </div>
          <div className="p-12 bg-background space-y-8 hover:bg-white/[0.02] transition-colors group">
            <Server className="w-12 h-12 text-primary group-hover:scale-110 transition-transform" />
            <div className="space-y-4">
              <h3 className="text-xl font-black uppercase tracking-tight">Масштабируемость</h3>
              <p className="text-xs text-muted-foreground leading-loose font-medium uppercase tracking-wider">
                Автоматическое распределение нагрузки между региональными узлами. Ваша инфраструктура растет вместе с вашим бизнесом.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 pb-40">
        <div className="glass-panel p-16 md:p-24 rounded-sm text-center relative overflow-hidden border-primary/20">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-right from-transparent via-primary to-transparent" />
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-8 leading-none">Готовы к интеграции?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-12 font-medium uppercase text-xs tracking-[0.2em] leading-loose">
            Начните использовать CyberLog сегодня и ощутите разницу в производительности вашей системы мониторинга.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button className="w-full sm:w-auto bg-white text-black px-12 py-5 rounded-sm font-black uppercase tracking-[0.2em] text-[11px] hover:bg-primary hover:text-white transition-all">
              Связаться с отделом продаж
            </button>
            <button className="w-full sm:w-auto border border-white/10 bg-white/5 px-12 py-5 rounded-sm font-black uppercase tracking-[0.2em] text-[11px] hover:bg-white/10 transition-all">
              Попробовать бесплатно
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}