import { Terminal, ShieldCheck, Zap, Code, Database, Binary, FileJson, Settings } from 'lucide-react';

export default function ApiDocsPage() {
  return (
    <div className="py-32 container mx-auto px-6 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-24 border-b border-white/5 pb-16">
        <div className="flex items-center gap-6 text-white">
          <Terminal className="w-16 h-16 text-primary" />
          <div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none">Data Ingestion V2</h1>
            <p className="text-primary text-[10px] uppercase tracking-[0.4em] mt-4 font-black">High-Volume Binary Protocol (gRPC/HTTP2)</p>
          </div>
        </div>
      </div>
      
      <div className="grid md:grid-cols-12 gap-16">
        <div className="md:col-span-4 space-y-12 sticky top-32 h-fit">
          <section className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Методы интеграции</h4>
            <nav className="flex flex-col gap-4 text-[11px] font-bold text-muted-foreground">
              <a href="#otel" className="hover:text-primary border-l-2 border-transparent hover:border-primary pl-4 transition-all">OpenTelemetry Collector</a>
              <a href="#vector" className="hover:text-primary border-l-2 border-transparent hover:border-primary pl-4 transition-all">Vector (Datadog Agent)</a>
              <a href="#fluentd" className="hover:text-primary border-l-2 border-transparent hover:border-primary pl-4 transition-all">Fluentd / Logstash</a>
              <a href="#grpc" className="hover:text-primary border-l-2 border-transparent hover:border-primary pl-4 transition-all">Native gRPC Interface</a>
            </nav>
          </section>

          <div className="p-8 glass-card rounded-2xl border-primary/20 space-y-4">
            <div className="flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest">
              <Binary className="w-4 h-4" /> Сетевой стек
            </div>
            <p className="text-[11px] text-muted-foreground font-bold leading-relaxed">
              Платформа требует HTTP/2 для всех gRPC соединений. Трафик мультиплексируется через единый сокет для минимизации оверхеда при 1M+ RPS.
            </p>
          </div>
        </div>

        <div className="md:col-span-8 space-y-24">
          <section id="otel">
            <h2 className="text-3xl font-black mb-8 text-white flex items-center gap-4 tracking-tighter">
              <Settings className="w-8 h-8 text-primary" /> 1.0 OpenTelemetry (OTLP)
            </h2>
            <p className="text-muted-foreground text-sm font-medium leading-loose mb-6">
              Рекомендуемый способ для Kubernetes-кластеров. Настройте экспортер на наш gRPC эндпоинт.
            </p>
            <div className="bg-black border border-white/10 p-8 font-mono text-xs text-white/70 overflow-x-auto rounded-2xl">
              <div className="text-primary mb-4 font-sans text-[10px] uppercase font-black">otel-collector-config.yaml</div>
              <pre>{`exporters:
  otlp/cyberlog:
    endpoint: "api.cyberlog.io:443"
    tls:
      insecure: false
    headers:
      x-api-key: "\${CYBERLOG_API_KEY}"

service:
  pipelines:
    logs:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp/cyberlog]`}</pre>
            </div>
          </section>

          <section id="vector">
            <h2 className="text-3xl font-black mb-8 text-white flex items-center gap-4 tracking-tighter">
              <Zap className="w-8 h-8 text-primary" /> 2.0 Vector Sink
            </h2>
            <div className="bg-black border border-white/10 p-8 font-mono text-xs text-white/70 overflow-x-auto rounded-2xl">
              <div className="text-primary mb-4 font-sans text-[10px] uppercase font-black">vector.toml</div>
              <pre>{`[sinks.cyberlog_enterprise]
  type = "http"
  inputs = ["log_source"]
  uri = "https://api.cyberlog.io/api/v1/collect"
  compression = "gzip"
  method = "post"
  
  [sinks.cyberlog_enterprise.auth]
    type = "bearer"
    token = "\${AUTH_TOKEN}"`}</pre>
            </div>
          </section>

          <section id="grpc">
            <h2 className="text-3xl font-black mb-8 text-white flex items-center gap-4 tracking-tighter">
              <Code className="w-8 h-8 text-primary" /> 3.0 Native SDK
            </h2>
            <div className="space-y-6">
              <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                <div className="text-[10px] font-black text-primary uppercase tracking-widest mb-4">Go (High Performance)</div>
                <pre className="font-mono text-[11px] text-white/50">
{`conn, _ := grpc.Dial("api.cyberlog.io:443", grpc.WithTransportCredentials(creds))
client := pb.NewIngestionClient(conn)
stream, _ := client.StreamEvents(ctx)
stream.Send(&pb.Event{Payload: binaryData})`}
                </pre>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
