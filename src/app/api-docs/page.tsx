
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
  AlertCircle,
  FileText
} from 'lucide-react';

export default function ApiDocsPage() {
  return (
    <div className="py-20 md:py-32 container mx-auto px-4 md:px-6 max-w-6xl bg-grid">
      <div className="mb-20 border-b border-white/10 pb-16">
        <h1 className="text-3xl md:text-6xl font-black tracking-tighter uppercase mb-6">ТЕХНИЧЕСКАЯ СПЕЦИФИКАЦИЯ</h1>
        <p className="text-muted-foreground text-[11px] font-bold uppercase tracking-[0.3em]">ОФИЦИАЛЬНОЕ РУКОВОДСТВО ПО ИНТЕГРАЦИИ gRPC ТУННЕЛЕЙ И RPC-ЭНДПОИНТОВ.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8 space-y-24">
          
          {/* Architecture Overview */}
          <section id="architecture" className="space-y-8">
            <div className="flex items-center gap-3 text-blue-500">
              <Server className="w-6 h-6" />
              <h2 className="text-sm font-black uppercase tracking-[0.3em]">1. АРХИТЕКТУРА ИЗОЛЯЦИИ ТЕНАНТОВ</h2>
            </div>
            <div className="text-[11px] text-muted-foreground leading-relaxed space-y-6 font-bold uppercase tracking-widest">
              <p>
                WEB3CYBERSERVICES ИСПОЛЬЗУЕТ МЕХАНИЗМ ГЕО-СПЕЦИФИЧНОЙ МАРШРУТИЗАЦИИ НА УРОВНЕ EDGE ДЛЯ ПРЕДОТВРАЩЕНИЯ "БУТЫЛОЧНЫХ ГОРЛЫШЕК".
                ВСЕ ПРЕМИУМ-КЛИЕНТЫ ПОЛУЧАЮТ ИЗОЛИРОВАННЫЕ GRPC-ПОТОКИ, ЧТО ИСКЛЮЧАЕТ ВЛИЯНИЕ ШУМНЫХ СОСЕДЕЙ (NOISY NEIGHBORS) НА ЗАДЕРЖКУ.
              </p>
              <div className="bg-white/[0.02] border border-white/10 p-8 space-y-6 font-mono">
                <div className="text-blue-500 mb-2">// Рекомендуемые библиотеки для подключения</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-white/5">
                    <div className="text-white mb-1">Golang</div>
                    <code className="text-[10px] text-white/40">google.golang.org/grpc</code>
                  </div>
                  <div className="p-4 border border-white/5">
                    <div className="text-white mb-1">Rust</div>
                    <code className="text-[10px] text-white/40">tonic = "0.10"</code>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Port Specification */}
          <section id="ports" className="space-y-8">
            <div className="flex items-center gap-3 text-white">
              <Settings className="w-6 h-6 text-blue-500" />
              <h2 className="text-sm font-black uppercase tracking-[0.3em]">2. РАСПРЕДЕЛЕНИЕ СЕТЕВЫХ ПОРТОВ</h2>
            </div>
            <div className="overflow-x-auto border border-white/10">
              <table className="w-full text-left text-[10px] border-collapse">
                <thead>
                  <tr className="bg-white/5 text-muted-foreground font-black uppercase tracking-widest">
                    <th className="px-6 py-4">ПОРТ</th>
                    <th className="px-6 py-4">ПРОТОКОЛ / СЕРВИС</th>
                    <th className="px-6 py-4">УРОВЕНЬ ДОСТУПА</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 font-mono">
                  <tr>
                    <td className="px-6 py-4 text-white">443</td>
                    <td className="px-6 py-4">HTTPS / gRPC INGRESS</td>
                    <td className="px-6 py-4 text-green-500">PUBLIC / LB</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-white">8545</td>
                    <td className="px-6 py-4">STANDARD HTTP-RPC</td>
                    <td className="px-6 py-4 text-blue-500">AUTH REQUIRED</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-white">8546</td>
                    <td className="px-6 py-4">SECURE WSS (EVENTS)</td>
                    <td className="px-6 py-4 text-blue-500">AUTH REQUIRED</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-white">10001-10007</td>
                    <td className="px-6 py-4">DIRECT gRPC SOCKETS</td>
                    <td className="px-6 py-4 text-red-500">VIP / BYPASS LB</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-white">9090</td>
                    <td className="px-6 py-4">HARDWARE TELEMETRY</td>
                    <td className="px-6 py-4 text-white/20">INTERNAL ONLY</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Telemetry Ingestion */}
          <section id="telemetry" className="space-y-8">
            <div className="flex items-center gap-3 text-white">
              <FileCode className="w-6 h-6 text-blue-500" />
              <h2 className="text-sm font-black uppercase tracking-[0.3em]">3. API ТЕЛЕМЕТРИИ: СТРУКТУРА ДАННЫХ</h2>
            </div>
            <div className="space-y-8">
              <div className="bg-black border border-white/10 rounded-sm overflow-hidden">
                <div className="bg-white/5 px-6 py-3 flex items-center justify-between border-b border-white/10">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Ingestion Endpoint</span>
                  <span className="text-[10px] font-mono text-blue-400">POST /api/v1/collect</span>
                </div>
                <div className="p-8 space-y-8 font-mono text-[11px]">
                  <div className="space-y-4">
                    <div className="text-white/60 uppercase text-[9px] tracking-widest">Необходимые заголовки:</div>
                    <pre className="bg-white/5 p-6 border border-white/5 text-slate-300">
                      Content-Type: application/grpc{"\n"}
                      Authorization: Bearer &lt;tenant_token&gt;
                    </pre>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="text-red-400 uppercase text-[9px] tracking-widest flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> ОБРАБОТКА ОШИБОК АВТОРИЗАЦИИ
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed font-bold uppercase tracking-widest">
                      СТРОГАЯ ПРОВЕРКА ТОКЕНОВ ВЫПОЛНЯЕТСЯ НА УРОВНЕ NGINX EDGE. В СЛУЧАЕ ОТСУТСТВИЯ BEARER-ТОКЕНА, 
                      СЕРВЕР НЕМЕДЛЕННО ОБРЫВАЕТ СОЕДИНЕНИЕ С КОДОМ HTTP 401.
                    </p>
                    <pre className="bg-red-500/5 p-6 border border-red-500/10 text-red-400">
{`{
  "error": "AUTH_FAILED",
  "message": "Missing or malformed Bearer token."
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>

        <aside className="lg:col-span-4">
          <div className="bg-white/[0.02] border border-white/10 p-10 sticky top-28 space-y-12">
            <div>
              <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-10">ДОКУМЕНТАЦИЯ</h4>
              <nav className="space-y-6">
                {[
                  { label: 'Архитектура', id: 'architecture' },
                  { label: 'Спецификация портов', id: 'ports' },
                  { label: 'Telemetry Ingestion', id: 'telemetry' }
                ].map((item) => (
                  <a 
                    key={item.id}
                    href={`#${item.id}`}
                    className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-white transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
            
            <div className="pt-10 border-t border-white/10">
              <div className="technical-label mb-6">Сетевой статус</div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-white/40 uppercase">Ingress</span>
                  <span className="text-[9px] text-green-500 font-mono">OK</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-white/40 uppercase">Mempool Stream</span>
                  <span className="text-[9px] text-green-500 font-mono">ACTIVE</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-white/40 uppercase">BGP Peer</span>
                  <span className="text-[9px] text-blue-500 font-mono">ESTABLISHED</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
