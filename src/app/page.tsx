
import { Terminal, Shield, Zap, Database, ArrowRight, Code2 } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-grid">
      {/* Hero Section */}
      <section className="container mx-auto px-4 md:px-6 pt-16 md:pt-24 pb-16 max-w-6xl text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm border border-white/10 bg-white/5 mb-8 mx-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[9px] font-mono text-blue-400 uppercase tracking-[0.2em] font-bold">v2.4.0 Промышленный релиз</span>
        </div>
        
        <h1 className="text-3xl md:text-6xl font-black tracking-tighter mb-6 text-white max-w-4xl mx-auto leading-[1.1] uppercase">
          Единый слой приема для <span className="text-blue-500">критически важных</span> данных.
        </h1>
        
        <p className="max-w-2xl mx-auto text-muted-foreground text-xs md:text-sm mb-10 leading-relaxed font-medium uppercase tracking-wide">
          Высокопроизводительная шина для сбора логов, метрик и трассировок. 
          Поддержка gRPC, OTLP и REST с гарантированной доставкой в распределенных сетях.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/dashboard" className="btn-enterprise">
            Запустить консоль <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
          <Link href="/api-docs" className="btn-outline flex items-center gap-2">
            <Code2 className="w-3.5 h-3.5" /> Документация
          </Link>
        </div>
      </section>

      {/* Technical Features Grid */}
      <section className="container mx-auto px-4 md:px-6 py-10 border-t border-white/5 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 border border-white/5">
          {[
            {
              icon: <Database className="w-4 h-4" />,
              title: "Колоночное хранилище",
              desc: "Нативная интеграция с ClickHouse для аналитических запросов за миллисекунды по миллиардам строк."
            },
            {
              icon: <Shield className="w-4 h-4" />,
              title: "Архитектура Zero-Trust",
              desc: "Сквозное шифрование TLS 1.3 с аппаратной изоляцией ключей на уровне HSM узлов."
            },
            {
              icon: <Zap className="w-4 h-4" />,
              title: "Нативный gRPC",
              desc: "Поддержка бинарных протоколов для минимальной нагрузки на CPU и мультиплексирования потоков."
            }
          ].map((feature, i) => (
            <div key={i} className="bg-background p-8 space-y-4 transition-colors hover:bg-white/[0.02]">
              <div className="text-blue-500 mb-2">{feature.icon}</div>
              <h3 className="text-[11px] font-black text-white uppercase tracking-widest">{feature.title}</h3>
              <p className="text-[10px] text-muted-foreground leading-relaxed font-medium uppercase tracking-wider">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CLI Section */}
      <section className="container mx-auto px-4 md:px-6 py-20 max-w-6xl">
        <div className="bg-[#0c0c0e] border border-white/5 p-6 md:p-12 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="max-w-xl text-center lg:text-left">
            <h2 className="text-lg md:text-xl font-black mb-4 uppercase tracking-tight">Развертывание за секунды.</h2>
            <p className="text-[10px] text-muted-foreground mb-6 font-bold uppercase tracking-widest">
              Установите агент Web3CyberServices на любую Linux систему (x86_64/ARM64) одной командой.
            </p>
            <div className="bg-black p-4 rounded-sm border border-white/10 flex items-center justify-between group overflow-x-auto">
              <code className="text-[10px] font-mono text-blue-400 whitespace-nowrap">curl -sL https://pkg.web3cyberservices.xyz/install.sh | bash</code>
              <Terminal className="w-4 h-4 text-white/20 group-hover:text-white transition-colors cursor-pointer shrink-0 ml-4" />
            </div>
          </div>
          <div className="w-full lg:w-auto grid grid-cols-2 gap-4 shrink-0">
            <div className="p-5 border border-white/5 rounded-sm bg-white/[0.02]">
              <div className="technical-label">Размер бинарника</div>
              <div className="data-value mt-1 text-lg">12.4 MB</div>
            </div>
            <div className="p-5 border border-white/5 rounded-sm bg-white/[0.02]">
              <div className="technical-label">Потребление ОЗУ</div>
              <div className="data-value mt-1 text-lg">&lt; 28 MB</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
