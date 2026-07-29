
import { Terminal, Shield, Zap, Database, ArrowRight, Code2 } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-grid">
      {/* Основной блок */}
      <section className="container mx-auto px-4 md:px-6 pt-16 md:pt-24 pb-16 max-w-6xl text-center">
        <h1 className="text-3xl md:text-6xl font-black tracking-tighter mb-6 text-white max-w-4xl mx-auto leading-[1.1] uppercase">
          ЕДИНЫЙ СЛОЙ ПРИЕМА ДЛЯ <span className="text-blue-500">КРИТИЧЕСКИ ВАЖНЫХ</span> ДАННЫХ.
        </h1>
        
        <p className="max-w-2xl mx-auto text-muted-foreground text-[10px] md:text-xs mb-10 leading-relaxed font-bold uppercase tracking-widest">
          ВЫСОКОПРОИЗВОДИТЕЛЬНАЯ ШИНА ДЛЯ СБОРА ЛОГОВ, МЕТРИК И ТРАССИРОВОК. 
          ПОДДЕРЖКА gRPC, OTLP И REST С ГАРАНТИРОВАННОЙ ДОСТАВКОЙ В РАСПРЕДЕЛЕННЫХ СЕТЯХ.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/dashboard" className="btn-enterprise">
            ЗАПУСТИТЬ КОНСОЛЬ <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
          <Link href="/api-docs" className="btn-outline flex items-center gap-2">
            <Code2 className="w-3.5 h-3.5" /> ДОКУМЕНТАЦИЯ
          </Link>
        </div>
      </section>

      {/* Сетка технических характеристик */}
      <section className="container mx-auto px-4 md:px-6 py-10 border-t border-white/5 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 border border-white/5">
          {[
            {
              title: "КОЛОНОЧНОЕ ХРАНИЛИЩЕ",
              desc: "НАТИВНАЯ ИНТЕГРАЦИЯ С CLICKHOUSE ДЛЯ АНАЛИТИЧЕСКИХ ЗАПРОСОВ ЗА МИЛЛИСЕКУНДЫ ПО МИЛЛИАРДАМ СТРОК."
            },
            {
              title: "АРХИТЕКТУРА ZERO-TRUST",
              desc: "СКВОЗНОЕ ШИФРОВАНИЕ TLS 1.3 С АППАРАТНОЙ ИЗОЛЯЦИЕЙ КЛЮЧЕЙ НА УРОВНЕ HSM УЗЛОВ."
            },
            {
              title: "НАТИВНЫЙ gRPC",
              desc: "ПОДДЕРЖКА БИНАРНЫХ ПРОТОКОЛОВ ДЛЯ МИНИМАЛЬНОЙ НАГРУЗКИ НА CPU И МУЛЬТИПЛЕКСИРОВАНИЯ ПОТОКОВ."
            }
          ].map((feature, i) => (
            <div key={i} className="bg-background p-8 space-y-4 transition-colors hover:bg-white/[0.02]">
              <h3 className="text-[11px] font-black text-white uppercase tracking-widest">{feature.title}</h3>
              <p className="text-[10px] text-muted-foreground leading-relaxed font-bold uppercase tracking-wider">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CLI Секция */}
      <section className="container mx-auto px-4 md:px-6 py-20 max-w-6xl">
        <div className="bg-[#0c0c0e] border border-white/5 p-6 md:p-12 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="max-w-xl text-center lg:text-left">
            <h2 className="text-lg md:text-xl font-black mb-4 uppercase tracking-tight">РАЗВЕРТЫВАНИЕ ЗА СЕКУНДЫ.</h2>
            <p className="text-[10px] text-muted-foreground mb-6 font-bold uppercase tracking-widest">
              УСТАНОВИТЕ АГЕНТ WEB3CYBERSERVICES НА ЛЮБУЮ LINUX СИСТЕМУ (x86_64/ARM64) ОДНОЙ КОМАНДОЙ.
            </p>
            <div className="bg-black p-4 rounded-sm border border-white/10 flex items-center justify-between group overflow-x-auto">
              <code className="text-[10px] font-mono text-blue-400 whitespace-nowrap">curl -sL https://pkg.web3cyberservices.xyz/install.sh | bash</code>
              <Terminal className="w-4 h-4 text-white/20 group-hover:text-white transition-colors cursor-pointer shrink-0 ml-4" />
            </div>
          </div>
          <div className="w-full lg:w-auto grid grid-cols-2 gap-4 shrink-0">
            <div className="p-5 border border-white/5 rounded-sm bg-white/[0.02]">
              <div className="technical-label">РАЗМЕР БИНАРНИКА</div>
              <div className="data-value mt-1 text-lg">12.4 MB</div>
            </div>
            <div className="p-5 border border-white/5 rounded-sm bg-white/[0.02]">
              <div className="technical-label">ПОТРЕБЛЕНИЕ ОЗУ</div>
              <div className="data-value mt-1 text-lg">&lt; 28 MB</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
