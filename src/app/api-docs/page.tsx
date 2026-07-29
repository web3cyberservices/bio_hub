
'use client';

import { 
  Settings, 
  Server, 
  Network, 
  Cpu, 
  Terminal, 
  ShieldCheck, 
  Copy, 
  Check, 
  FileCode, 
  ArrowRight,
  Database,
  Globe
} from 'lucide-react';
import { useState } from 'react';

export default function ApiDocsPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="py-12 md:py-24 container mx-auto px-4 md:px-6 max-w-6xl overflow-x-hidden">
      <div className="mb-16 border-b border-white/5 pb-12">
        <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase mb-4">Техническая документация</h1>
        <p className="text-muted-foreground max-w-3xl text-[10px] md:text-xs font-bold uppercase tracking-widest leading-relaxed">
          ОФИЦИАЛЬНАЯ СПЕЦИФИКАЦИЯ ИНФРАСТРУКТУРЫ WEB3CYBERSERVICES.XYZ ДЛЯ КОРПОРАТИВНЫХ КЛИЕНТОВ.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-16">
          
          {/* 1. Обзор компании */}
          <section id="overview" className="space-y-6">
            <div className="flex items-center gap-3 text-white">
              <ShieldCheck className="w-5 h-5 text-blue-500" />
              <h2 className="text-sm font-black uppercase tracking-[0.2em]">1. Обзор компании и сервисов</h2>
            </div>
            <div className="text-[10px] text-muted-foreground leading-relaxed space-y-4 font-bold uppercase tracking-wider">
              <p>
                Web3CyberServices — премиальный провайдер выделенных bare-metal RPC узлов, стриминга мемпула с низкой задержкой и высокочастотной агрегации телеметрии. 
                Мы специализируемся на обслуживании количественных хедж-фондов и операторов HFT-ботов.
              </p>
              <p>
                Наша инфраструктура обрабатывает массивные непрерывные потоки зашифрованных бинарных данных 24/7 для поддержания блокчейн-консенсуса и исполнения торговых ордеров за миллисекунды.
              </p>
            </div>
          </section>

          {/* 2. Инфраструктура и Маршрутизация */}
          <section id="routing" className="space-y-6">
            <div className="flex items-center gap-3 text-white">
              <Network className="w-5 h-5 text-blue-500" />
              <h2 className="text-sm font-black uppercase tracking-[0.2em]">2. Архитектура маршрутизации</h2>
            </div>
            <div className="text-[10px] text-muted-foreground leading-relaxed space-y-4 font-bold uppercase tracking-wider">
              <p>
                Мы используем стратегию гео-маршрутизации и изоляции тенантов. Каждый премиум-клиент получает выделенные поддомены для предотвращения узких мест (bottlenecks) и изоляции сетевого трафика.
              </p>
            </div>
            <div className="bg-slate-900/50 border border-white/5 p-6 rounded-sm space-y-3 font-mono text-[10px]">
              <div className="flex justify-between items-center text-white/40 border-b border-white/5 pb-2 mb-2">
                <span>ПОДДОМЕН</span>
                <span>НАЗНАЧЕНИЕ</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-400">eu-telemetry.web3cyberservices.xyz</span>
                <span className="text-white/60">Прием телеметрии (EU)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-400">eth-rpc.web3cyberservices.xyz</span>
                <span className="text-white/60">Ethereum JSON-RPC (VIP)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-400">mempool-b2b.web3cyberservices.xyz</span>
                <span className="text-white/60">Binary Mempool Stream</span>
              </div>
            </div>
          </section>

          {/* 3. Сетевые Спецификации */}
          <section id="ports" className="space-y-6">
            <div className="flex items-center gap-3 text-white">
              <Settings className="w-5 h-5 text-blue-500" />
              <h2 className="text-sm font-black uppercase tracking-[0.2em]">3. Распределение портов</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[10px] border-collapse">
                <thead>
                  <tr className="bg-white/5 text-muted-foreground font-black uppercase tracking-widest border-b border-white/10">
                    <th className="px-4 py-3">ПОРТ</th>
                    <th className="px-4 py-3">ПРОТОКОЛ / СЕРВИС</th>
                    <th className="px-4 py-3">УРОВЕНЬ ДОСТУПА</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  <tr>
                    <td className="px-4 py-3 text-white">443</td>
                    <td className="px-4 py-3">HTTPS / gRPC Ingress</td>
                    <td className="px-4 py-3 text-green-500">PUBLIC/SSL</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-white">8545</td>
                    <td className="px-4 py-3">Standard HTTP-RPC</td>
                    <td className="px-4 py-3 text-blue-500">AUTH REQUIRED</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-white">8546</td>
                    <td className="px-4 py-3">Secure WSS (Events)</td>
                    <td className="px-4 py-3 text-blue-500">AUTH REQUIRED</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-white">10001-10007</td>
                    <td className="px-4 py-3">Direct TCP/gRPC Sockets</td>
                    <td className="px-4 py-3 text-red-500">VIP / BYPASS LB</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-white">9090</td>
                    <td className="px-4 py-3">Hardware Telemetry</td>
                    <td className="px-4 py-3 text-white/20">INTERNAL</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 4. API Документация */}
          <section id="api" className="space-y-6">
            <div className="flex items-center gap-3 text-white">
              <FileCode className="w-5 h-5 text-blue-500" />
              <h2 className="text-sm font-black uppercase tracking-[0.2em]">4. API Телеметрии: Quick Start</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-black border border-white/10 rounded-sm overflow-hidden">
                <div className="bg-white/5 px-4 py-2 flex items-center justify-between border-b border-white/5">
                  <span className="text-[9px] font-black text-white/40 uppercase">Ingestion Endpoint</span>
                  <span className="text-[9px] font-mono text-blue-400">POST /api/v1/collect</span>
                </div>
                <div className="p-6 space-y-6">
                  <div className="space-y-2">
                    <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Протокол:</div>
                    <div className="text-[11px] font-mono text-white">Strict gRPC over HTTP/2</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Необходимые заголовки:</div>
                    <pre className="text-[10px] font-mono text-slate-300 bg-white/5 p-3 rounded-sm">
                      Content-Type: application/grpc{"\n"}
                      Authorization: Bearer &lt;tenant_token&gt;
                    </pre>
                  </div>
                  <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-sm">
                    <div className="text-[9px] font-black text-red-400 uppercase mb-2">Важное примечание:</div>
                    <p className="text-[10px] text-red-400/80 font-bold uppercase leading-relaxed">
                      Стандартные HTTP-запросы или отсутствие токена будут отклонены с кодом 401 Unauthorized.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* Sidebar Navigation */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/40 border border-white/5 p-8 sticky top-24">
            <h4 className="text-[9px] font-black text-blue-500 uppercase tracking-[0.3em] mb-8">Содержание</h4>
            <nav className="space-y-4">
              {[
                { label: 'Обзор сервисов', id: 'overview' },
                { label: 'Маршрутизация', id: 'routing' },
                { label: 'Спецификация портов', id: 'ports' },
                { label: 'Telemetry API', id: 'api' }
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
            <div className="mt-12 pt-12 border-t border-white/5">
              <div className="technical-label mb-4">Статус сети</div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-mono text-white">ALL SYSTEMS OPERATIONAL</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
