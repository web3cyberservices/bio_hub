import { Terminal, ShieldCheck, Zap, Code, Database, Cpu, Layers, Binary } from 'lucide-react';

export default function ApiDocsPage() {
  return (
    <div className="py-32 container mx-auto px-6 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-24 border-b border-white/5 pb-16">
        <div className="flex items-center gap-6 text-white">
          <Terminal className="w-16 h-16 text-primary" />
          <div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none">High-Volume Ingestion</h1>
            <p className="text-primary text-[10px] uppercase tracking-[0.4em] mt-4 font-black">Спецификация протокола V2.4 (Binary gRPC)</p>
          </div>
        </div>
        <div className="bg-white/5 border border-white/5 px-6 py-4">
          <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Статус узла</div>
          <div className="text-[10px] font-black text-green-500 uppercase tracking-widest flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Кластер: Online
          </div>
        </div>
      </div>
      
      <div className="grid md:grid-cols-12 gap-16">
        <div className="md:col-span-4 space-y-8 sticky top-32 h-fit text-sm">
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Методы передачи</h4>
            <nav className="flex flex-col gap-4 text-[11px] font-bold text-muted-foreground">
              <a href="#grpc" className="hover:text-primary border-l-2 border-transparent hover:border-primary pl-4 transition-all">gRPC / HTTP/2 Multiplexing</a>
              <a href="#vless" className="hover:text-primary border-l-2 border-transparent hover:border-primary pl-4 transition-all">Secure Tunneling Interface</a>
              <a href="#sdk" className="hover:text-primary border-l-2 border-transparent hover:border-primary pl-4 transition-all">Native SDK Examples</a>
            </nav>
          </div>
          <div className="p-6 bg-primary/5 border border-primary/20 space-y-4 rounded-xl">
            <div className="flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest">
              <Binary className="w-4 h-4" /> Бинарный поток
            </div>
            <p className="text-[11px] text-muted-foreground font-bold leading-relaxed">
              Все эндпоинты требуют авторизации через X-Auth-Key. Неавторизованные gRPC-сессии сбрасываются уровнем L7.
            </p>
          </div>
        </div>

        <div className="md:col-span-8 space-y-24">
          <section id="grpc">
            <h2 className="text-3xl font-black mb-8 text-white flex items-center gap-4 tracking-tighter">
              <Zap className="w-8 h-8 text-primary" /> 1.0 gRPC Инжекция
            </h2>
            <p className="text-muted-foreground text-sm font-medium leading-loose mb-8 italic">
              Платформа использует мультиплексирование потоков поверх HTTP/2 для минимизации оверхеда при передаче миллионов событий.
            </p>
            <div className="bg-black border border-white/10 p-8 font-mono text-xs text-white overflow-x-auto rounded-xl">
              <div className="text-muted-foreground mb-4 font-sans text-[10px] uppercase font-black">Proto Definition</div>
              <pre className="leading-relaxed">
                <span className="text-primary">service</span> DataIngestion &#123;<br/>
                &nbsp;&nbsp;<span className="text-primary">rpc</span> StreamEvents(stream Event) <span className="text-primary">returns</span> (IngestionStatus) &#123;&#125;<br/>
                &nbsp;&nbsp;<span className="text-primary">rpc</span> GetMetricSummary(Filter) <span className="text-primary">returns</span> (Summary) &#123;&#125;<br/>
                &#125;<br/><br/>
                <span className="text-primary">message</span> Event &#123;<br/>
                &nbsp;&nbsp;bytes <span className="text-white">payload</span> = 1;<br/>
                &nbsp;&nbsp;map&lt;string, string&gt; <span className="text-white">tags</span> = 2;<br/>
                &nbsp;&nbsp;int64 <span className="text-white">ts</span> = 3;<br/>
                &#125;
              </pre>
            </div>
          </section>

          <section id="sdk">
            <h2 className="text-3xl font-black mb-8 text-white flex items-center gap-4 tracking-tighter">
              <Code className="w-8 h-8 text-primary" /> 2.0 Native SDK
            </h2>
            <div className="space-y-6">
              <div className="bg-white/5 border border-white/10 p-6 rounded-xl">
                <div className="text-[10px] font-black text-primary uppercase tracking-widest mb-4">Go (Enterprise Agent)</div>
                <pre className="font-mono text-[11px] text-white/70 overflow-x-auto">
{`conn, err := grpc.Dial("api.cyberlog.io:443", grpc.WithTransportCredentials(creds))
client := pb.NewDataIngestionClient(conn)
stream, _ := client.StreamEvents(context.Background())
stream.Send(&pb.Event{Payload: data})`}
                </pre>
              </div>

              <div className="bg-white/5 border border-white/10 p-6 rounded-xl">
                <div className="text-[10px] font-black text-primary uppercase tracking-widest mb-4">Rust (Zero-Copy)</div>
                <pre className="font-mono text-[11px] text-white/70 overflow-x-auto">
{`let channel = Channel::from_static("https://api.cyberlog.io")
    .connect().await?;
let mut client = DataIngestionClient::new(channel);
let request = tonic::Request::new(event_stream);`}
                </pre>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
