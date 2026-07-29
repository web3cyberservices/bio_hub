import { Terminal, ShieldCheck, Zap, Code, Database, Cpu, Layers } from 'lucide-react';

export default function ApiDocsPage() {
  return (
    <div className="py-32 container mx-auto px-6 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-24 border-b border-white/5 pb-16">
        <div className="flex items-center gap-6 text-white">
          <Terminal className="w-16 h-16 text-primary" />
          <div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none">Техническое API</h1>
            <p className="text-primary text-[10px] uppercase tracking-[0.4em] mt-4 font-black">Протокол приема больших данных V2.0</p>
          </div>
        </div>
        <div className="bg-white/5 border border-white/5 px-6 py-4">
          <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Статус документа</div>
          <div className="text-[10px] font-black text-green-500 uppercase tracking-widest flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Актуально (Enterprise SDK)
          </div>
        </div>
      </div>
      
      <div className="grid md:grid-cols-12 gap-16">
        <div className="md:col-span-4 space-y-8 sticky top-32 h-fit">
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Протоколы</h4>
            <nav className="flex flex-col gap-4 text-[11px] font-bold text-muted-foreground">
              <a href="#clickstream" className="hover:text-primary border-l-2 border-transparent hover:border-primary pl-4 transition-all">Кликстрим (Events)</a>
              <a href="#transactions" className="hover:text-primary border-l-2 border-transparent hover:border-primary pl-4 transition-all">Транзакции (Atomic)</a>
              <a href="#logs" className="hover:text-primary border-l-2 border-transparent hover:border-primary pl-4 transition-all">Логи приложений</a>
            </nav>
          </div>
          <div className="p-6 bg-primary/5 border border-primary/20 space-y-4">
            <div className="flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest">
              <Layers className="w-4 h-4" /> Бинарный поток
            </div>
            <p className="text-[11px] text-muted-foreground font-bold leading-relaxed">
              Все данные должны передаваться через gRPC для обеспечения максимальной плотности упаковки.
            </p>
          </div>
        </div>

        <div className="md:col-span-8 space-y-24">
          <section id="clickstream">
            <h2 className="text-3xl font-black mb-8 text-white flex items-center gap-4 tracking-tighter">
              <Zap className="w-8 h-8 text-primary" /> 1.0 Кликстрим
            </h2>
            <p className="text-muted-foreground text-sm font-medium leading-loose mb-8">
              Для анализа поведения пользователей в реальном времени используйте сервис <code className="text-primary tracking-normal font-mono bg-white/5 px-2">ClickstreamService</code>.
            </p>
            <div className="bg-black border border-white/10 p-8 font-mono text-xs text-white overflow-x-auto">
              <pre className="leading-relaxed">
                <span className="text-primary">message</span> UserEvent &#123;<br/>
                &nbsp;&nbsp;string <span className="text-white">user_id</span> = 1;<br/>
                &nbsp;&nbsp;string <span className="text-white">event_type</span> = 2; <span className="text-muted-foreground">// click, view, scroll</span><br/>
                &nbsp;&nbsp;map&lt;string, string&gt; <span className="text-white">metadata</span> = 3;<br/>
                &nbsp;&nbsp;int64 <span className="text-white">timestamp_ms</span> = 4;<br/>
                &#125;
              </pre>
            </div>
          </section>

          <section id="transactions">
            <h2 className="text-3xl font-black mb-8 text-white flex items-center gap-4 tracking-tighter">
              <Database className="w-8 h-8 text-primary" /> 2.0 Транзакции
            </h2>
            <p className="text-muted-foreground text-sm font-medium leading-loose mb-8">
              Запись финансовых событий с гарантией доставки Exactly-once.
            </p>
            <div className="bg-black border border-white/10 p-8 font-mono text-xs text-white overflow-x-auto">
              <pre className="leading-relaxed">
                <span className="text-primary">service</span> TransactionLedger &#123;<br/>
                &nbsp;&nbsp;<span className="text-primary">rpc</span> Commit(Transaction) <span className="text-primary">returns</span> (Ack) &#123;&#125;<br/>
                &#125;
              </pre>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
