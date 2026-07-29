import { Terminal, ShieldCheck, Zap, Code, Database, Cpu } from 'lucide-react';

export default function ApiDocsPage() {
  return (
    <div className="py-32 container mx-auto px-6 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-24 border-b border-white/5 pb-16">
        <div className="flex items-center gap-6 text-white">
          <Terminal className="w-16 h-16 text-primary" />
          <div>
            <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-none">Техническое API</h1>
            <p className="text-primary text-[10px] uppercase tracking-[0.4em] mt-4 font-black">Протокол приема данных V1.0</p>
          </div>
        </div>
        <div className="bg-white/5 border border-white/5 px-6 py-4 rounded-sm">
          <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Статус документа</div>
          <div className="text-[10px] font-black text-green-500 uppercase tracking-widest flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Актуально (Версия 1.0.4)
          </div>
        </div>
      </div>
      
      <div className="grid md:grid-cols-12 gap-16">
        <div className="md:col-span-4 space-y-8 sticky top-32 h-fit">
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Содержание</h4>
            <nav className="flex flex-col gap-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <a href="#auth" className="hover:text-primary border-l-2 border-transparent hover:border-primary pl-4 transition-all">Аутентификация</a>
              <a href="#endpoint" className="hover:text-primary border-l-2 border-transparent hover:border-primary pl-4 transition-all">Конечная точка приема</a>
              <a href="#protocol" className="hover:text-primary border-l-2 border-transparent hover:border-primary pl-4 transition-all">Спецификация gRPC</a>
            </nav>
          </div>
          <div className="p-6 bg-primary/5 border border-primary/20 rounded-sm space-y-4">
            <div className="flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest">
              <Cpu className="w-4 h-4" /> Производительность
            </div>
            <p className="text-[9px] text-muted-foreground font-bold leading-relaxed uppercase tracking-widest">
              Для достижения минимальной задержки рекомендуется использовать keep-alive HTTP/2 соединения.
            </p>
          </div>
        </div>

        <div className="md:col-span-8 space-y-24">
          <section id="auth">
            <h2 className="text-3xl font-black mb-8 text-white flex items-center gap-4 uppercase tracking-tighter">
              <ShieldCheck className="w-8 h-8 text-primary" /> 1.0 Аутентификация
            </h2>
            <div className="space-y-6">
              <p className="text-muted-foreground leading-relaxed text-sm font-medium uppercase tracking-wide">
                Все запросы к пайплайну приема данных должны содержать заголовок <code className="bg-white/10 px-2 py-1 rounded text-primary lowercase tracking-normal">Authorization</code>.
              </p>
              <div className="bg-black border border-white/10 p-8 font-mono text-xs rounded-sm shadow-2xl relative text-white overflow-x-auto">
                <div className="flex gap-4">
                  <span className="text-primary font-bold">Authorization:</span>
                  <span className="text-muted-foreground tracking-widest">Bearer YOUR_INGESTION_KEY</span>
                </div>
              </div>
            </div>
          </section>

          <section id="endpoint">
            <h2 className="text-3xl font-black mb-8 text-white flex items-center gap-4 uppercase tracking-tighter">
              <Zap className="w-8 h-8 text-primary" /> 2.0 Эндпоинт приема
            </h2>
            <div className="border border-white/10 rounded-sm overflow-hidden bg-white/[0.02] shadow-2xl text-white">
              <div className="bg-white/5 p-6 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black bg-primary text-background px-3 py-1 rounded-sm uppercase tracking-widest">POST</span>
                  <code className="text-sm font-mono tracking-tighter">/api/v1/collect</code>
                </div>
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Протокол: gRPC / HTTP/2</span>
              </div>
              <div className="p-10 space-y-10">
                <p className="text-sm leading-relaxed text-muted-foreground font-medium uppercase tracking-wide">
                  Высокопроизводительный эндпоинт для приема бинарной телеметрии. Требует установленного HTTP/2 соединения для поддержки стриминга.
                </p>
                
                <div className="grid md:grid-cols-2 gap-12 border-t border-white/5 pt-10">
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-6 text-primary">Необходимые заголовки</h4>
                    <ul className="text-[10px] space-y-4 font-black uppercase tracking-widest">
                      <li className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-muted-foreground">Content-Type:</span>
                        <span className="text-white">application/grpc</span>
                      </li>
                      <li className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-muted-foreground">Accept:</span>
                        <span className="text-white">application/grpc</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-6 text-primary">Ожидаемый ответ</h4>
                    <ul className="text-[10px] space-y-4 font-black uppercase tracking-widest">
                      <li className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-muted-foreground">HTTP Status:</span>
                        <span className="text-green-500">200 OK</span>
                      </li>
                      <li className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-muted-foreground">grpc-status:</span>
                        <span className="text-green-500">0</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="protocol">
            <h2 className="text-3xl font-black mb-8 text-white flex items-center gap-4 uppercase tracking-tighter">
              <Code className="w-8 h-8 text-primary" /> 3.0 Определение Protobuf
            </h2>
            <div className="space-y-6">
              <p className="text-muted-foreground leading-relaxed text-sm font-medium uppercase tracking-wide">
                Ниже приведено определение сервиса для генерации клиентских библиотек (SDK).
              </p>
              <div className="bg-black border border-white/10 p-8 font-mono text-xs rounded-sm shadow-2xl text-white overflow-x-auto">
                <pre className="leading-relaxed text-muted-foreground">
                  <span className="text-primary">syntax</span> = "proto3";<br/>
                  <br/>
                  <span className="text-primary">service</span> TelemetryService &#123;<br/>
                  &nbsp;&nbsp;<span className="text-primary">rpc</span> Collect(LogEntry) <span className="text-primary">returns</span> (LogResult) &#123;&#125;<br/>
                  &#125;<br/>
                  <br/>
                  <span className="text-primary">message</span> LogEntry &#123;<br/>
                  &nbsp;&nbsp;string <span className="text-white">source</span> = 1;<br/>
                  &nbsp;&nbsp;string <span className="text-white">payload</span> = 2;<br/>
                  &nbsp;&nbsp;int64 <span className="text-white">timestamp</span> = 3;<br/>
                  &#125;
                </pre>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}