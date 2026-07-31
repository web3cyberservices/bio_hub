
'use client';

import { 
  Settings, 
  Server, 
  Network, 
  ShieldCheck, 
  FileCode, 
  Lock,
  Terminal,
  Database,
  Globe,
  AlertCircle
} from 'lucide-react';

export default function ApiDocsPage() {
  return (
    <div className="py-12 md:py-24 container mx-auto px-4 md:px-6 max-w-6xl bg-grid">
      <div className="mb-16 border-b border-white/10 pb-12">
        <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase mb-4">Техническая документация</h1>
        <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.2em]">ОФИЦИАЛЬНАЯ СПЕЦИФИКАЦИЯ gRPC ТУННЕЛЕЙ И RPC-ЭНДПОИНТОВ.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-16">
          
          {/* 1. MEV Protection */}
          <section id="mev-protection" className="space-y-6">
            <div className="flex items-center gap-3 text-blue-500">
              <Lock className="w-5 h-5" />
              <h2 className="text-sm font-black uppercase tracking-[0.2em]">1. MEV ЗАЩИТА ЧЕРЕЗ ШИФРОВАННЫЕ ТУННЕЛИ</h2>
            </div>
            <div className="text-[10px] text-muted-foreground leading-relaxed space-y-4 font-bold uppercase tracking-wider">
              <p>
                ДЛЯ ПРЕДОТВРАЩЕНИЯ АНАЛИЗА ТРАНЗАКЦИЙ СТОРОННИМИ УЗЛАМИ (SNOOPING), ВСЕ КЛИЕНТЫ ОБЯЗАНЫ ИСПОЛЬЗОВАТЬ GRPC-ОБЕРТКУ WEB3CYBERSERVICES НАД HTTP/2.
              </p>
              <p>
                ДАННЫЙ МЕТОД ОБЕСПЕЧИВАЕТ СКВОЗНУЮ ИЗОЛЯЦИЮ ПОТОКА И МИНИМИЗИРУЕТ РИСК ВЫЯВЛЕНИЯ ВАШИХ ТОРГОВЫХ СТРАТЕГИЙ ЧЕРЕЗ МЕТАДАННЫЕ ТРАФИКА.
              </p>
            </div>
          </section>

          {/* 2. Routing */}
          <section id="routing" className="space-y-6">
            <div className="flex items-center gap-3 text-white">
              <Network className="w-5 h-5 text-blue-500" />
              <h2 className="text-sm font-black uppercase tracking-[0.2em]">2. ГЕО-ПОДДОМЕНЫ И МАРШРУТИЗАЦИЯ</h2>
            </div>
            <div className="bg-white/[0.02] border border-white/10 p-6 rounded-sm space-y-3 font-mono text-[9px]">
              <div className="flex justify-between items-center text-white/30 border-b border-white/5 pb-2 mb-2">
                <span>ЭНДПОИНТ</span>
                <span>НАЗНАЧЕНИЕ</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-400">eu-telemetry.web3cyberservices.xyz</span>
                <span className="text-white/60">ПРИЕМ ТЕЛЕМЕТРИИ (EU)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-400">eth-rpc.web3cyberservices.xyz</span>
                <span className="text-white/60">ETHEREUM JSON-RPC (VIP)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-400">mempool-b2b.web3cyberservices.xyz</span>
                <span className="text-white/60">BINARY MEMPOOL STREAM</span>
              </div>
            </div>
          </section>

          {/* 3. Port Allocation */}
          <section id="ports" className="space-y-6">
            <div className="flex items-center gap-3 text-white">
              <Settings className="w-5 h-5 text-blue-500" />
              <h2 className="text-sm font-black uppercase tracking-[0.2em]">3. РАСПРЕДЕЛЕНИЕ ПОРТОВ</h2>
            </div>
            <div className="overflow-x-auto border border-white/10">
              <table className="w-full text-left text-[9px] border-collapse">
                <thead>
                  <tr className="bg-white/5 text-muted-foreground font-black uppercase tracking-widest">
                    <th className="px-4 py-3">ПОРТ</th>
                    <th className="px-4 py-3">ПРОТОКОЛ / СЕРВИС</th>
                    <th className="px-4 py-3">УРОВЕНЬ ДОСТУПА</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 font-mono">
                  <tr>
                    <td className="px-4 py-3 text-white">443</td>
                    <td className="px-4 py-3">HTTPS / gRPC INGRESS</td>
                    <td className="px-4 py-3 text-green-500">PUBLIC/SSL</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-white">8545</td>
                    <td className="px-4 py-3">STANDARD HTTP-RPC</td>
                    <td className="px-4 py-3 text-blue-500">AUTH REQUIRED</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-white">8546</td>
                    <td className="px-4 py-3">SECURE WSS (EVENTS)</td>
                    <td className="px-4 py-3 text-blue-500">AUTH REQUIRED</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-white">10001-10007</td>
                    <td className="px-4 py-3">DIRECT TCP/gRPC SOCKETS</td>
                    <td className="px-4 py-3 text-red-500">VIP / BYPASS LB</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-white">9090</td>
                    <td className="px-4 py-3">HARDWARE TELEMETRY</td>
                    <td className="px-4 py-3 text-white/20">INTERNAL</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 4. API Spec */}
          <section id="api" className="space-y-6">
            <div className="flex items-center gap-3 text-white">
              <FileCode className="w-5 h-5 text-blue-500" />
              <h2 className="text-sm font-black uppercase tracking-[0.2em]">4. API ТЕЛЕМЕТРИИ: QUICK START</h2>
            </div>
            <div className="space-y-6">
              <div className="bg-black border border-white/10 rounded-sm overflow-hidden">
                <div className="bg-white/5 px-4 py-2 flex items-center justify-between border-b border-white/10">
                  <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Ingestion Endpoint</span>
                  <span className="text-[9px] font-mono text-blue-400">POST /api/v1/collect</span>
                </div>
                <div className="p-6 space-y-6">
                  <div className="space-y-2">
                    <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Протокол:</div>
                    <div className="text-[10px] font-mono text-white">Strict gRPC over HTTP/2</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Необходимые заголовки:</div>
                    <pre className="text-[9px] font-mono text-slate-300 bg-white/5 p-4 rounded-sm border border-white/5">
                      Content-Type: application/grpc{"\n"}
                      Authorization: Bearer &lt;tenant_token&gt;
                    </pre>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="text-[9px] font-black text-red-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5" /> ОШИБКИ АВТОРИЗАЦИИ
                    </div>
                    <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
                      В СЛУЧАЕ ОТСУТСТВИЯ ТОКЕНА ИЛИ НЕВЕРНОГО ФОРМАТА, СЕРВЕР ВЕРНЕТ HTTP 401 СЛЕДУЮЩЕЙ СТРУКТУРЫ:
                    </p>
                    <pre className="text-[9px] font-mono text-red-400 bg-red-500/5 p-4 border border-red-500/10">
{`{
  "error": "AUTH_FAILED",
  "message": "Missing Bearer token."
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>

        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white/[0.02] border border-white/10 p-8 sticky top-24">
            <h4 className="text-[9px] font-black text-blue-500 uppercase tracking-[0.3em] mb-8">Содержание</h4>
            <nav className="space-y-4">
              {[
                { label: 'Защита MEV', id: 'mev-protection' },
                { label: 'Маршрутизация', id: 'routing' },
                { label: 'Спецификация портов', id: 'ports' },
                { label: 'Telemetry API', id: 'api' }
              ].map((item) => (
                <a 
                  key={item.id}
                  href={`#${item.id}`}
                  className="block text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-white transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="mt-12 pt-12 border-t border-white/10">
              <div className="technical-label mb-4">Статус API</div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[9px] font-mono text-white">ALL SYSTEMS OPERATIONAL</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
