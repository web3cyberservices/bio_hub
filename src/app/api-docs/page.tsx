
import { Terminal, ShieldCheck, Zap } from 'lucide-react';

export default function ApiDocsPage() {
  return (
    <div className="py-24 container mx-auto px-4 max-w-4xl">
      <div className="flex items-center gap-4 mb-16 text-white">
        <Terminal className="w-12 h-12 text-primary" />
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter">Technical API</h1>
          <p className="text-muted-foreground text-[10px] uppercase tracking-widest mt-2 font-bold">Ingestion Protocol V1.0</p>
        </div>
      </div>
      
      <div className="space-y-20">
        <section>
          <h2 className="text-2xl font-bold mb-6 text-primary flex items-center gap-3">
            <ShieldCheck className="w-6 h-6" /> 1.0 Authentication
          </h2>
          <p className="text-muted-foreground mb-6 leading-relaxed text-sm">
            Все запросы к пайплайну приема данных должны содержать заголовок <code className="bg-white/10 px-2 py-1 rounded text-primary">Authorization</code>.
          </p>
          <div className="bg-black border border-white/5 p-6 font-mono text-xs rounded-sm shadow-2xl relative text-white">
            <span className="text-primary">Authorization:</span> Bearer YOUR_INGESTION_KEY
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6 text-primary flex items-center gap-3">
            <Zap className="w-6 h-6" /> 2.0 Ingestion Endpoint
          </h2>
          <div className="border border-white/5 rounded-sm overflow-hidden bg-white/5 shadow-2xl text-white">
            <div className="bg-white/10 p-5 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold bg-primary text-background px-2 py-1 rounded-sm">POST</span>
                <code className="text-sm font-mono tracking-tighter">/api/v1/collect</code>
              </div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Protocol: gRPC / HTTP/2</span>
            </div>
            <div className="p-8 space-y-8">
              <p className="text-sm leading-relaxed text-muted-foreground">Высокопроизводительный эндпоинт для приема бинарной телеметрии. Требует установленного HTTP/2 соединения для поддержки стриминга.</p>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest mb-3 text-white">Required Headers</h4>
                  <ul className="text-xs space-y-2 font-mono">
                    <li className="text-muted-foreground flex justify-between border-b border-white/5 pb-1">
                      <span>Content-Type:</span>
                      <span className="text-primary text-[10px]">application/grpc</span>
                    </li>
                    <li className="text-muted-foreground flex justify-between border-b border-white/5 pb-1">
                      <span>Accept:</span>
                      <span className="text-[10px]">application/grpc</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest mb-3 text-white">Expected Response</h4>
                  <ul className="text-xs space-y-2 font-mono">
                    <li className="text-muted-foreground flex justify-between border-b border-white/5 pb-1">
                      <span>HTTP Status:</span>
                      <span className="text-green-400">200 OK</span>
                    </li>
                    <li className="text-muted-foreground flex justify-between border-b border-white/5 pb-1">
                      <span>grpc-status:</span>
                      <span className="text-green-400">0</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
