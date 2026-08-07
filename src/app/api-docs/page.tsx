
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
  FileText,
  Cpu,
  Zap,
  Layers
} from 'lucide-react';

export default function ApiDocsPage() {
  return (
    <div className="py-20 md:py-32 container mx-auto px-4 md:px-6 max-w-6xl bg-grid min-h-screen">
      <div className="mb-20 border-b border-white/10 pb-16">
        <h1 className="text-3xl md:text-6xl font-black tracking-tighter mb-6">Техническая спецификация</h1>
        <p className="text-muted-foreground text-[11px] font-bold uppercase tracking-[0.3em]">Руководство по интеграции высоконагруженных gRPC-каналов и систем телеметрии.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8 space-y-32">
          
          {/* Architecture Overview */}
          <section id="architecture" className="space-y-8">
            <div className="flex items-center gap-3 text-blue-500">
              <Server className="w-6 h-6" />
              <h2 className="text-sm font-black uppercase tracking-[0.3em]">1. Архитектура изоляции тенантов</h2>
            </div>
            <div className="text-[11px] text-muted-foreground leading-relaxed space-y-6 font-bold tracking-widest">
              <p>
                Web3CyberServices использует механизм гео-специфичной маршрутизации на уровне Edge для предотвращения "бутылочных горлышек".
                Все премиум-клиенты получают изолированные gRPC-потоки, что исключает влияние шумных соседей (noisy neighbors) на задержку.
              </p>
              <div className="bg-white/[0.02] border border-white/10 p-8 space-y-6 font-mono">
                <div className="text-blue-500 mb-2">// Поддерживаемые стеки исполнения</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border border-white/5">
                    <div className="text-white mb-1 text-[10px]">Golang</div>
                    <code className="text-[9px] text-white/40">grpc-go v1.50+ / v1.62</code>
                  </div>
                  <div className="p-4 border border-white/5">
                    <div className="text-white mb-1 text-[10px]">Rust</div>
                    <code className="text-[9px] text-white/40">tonic 0.10 / 0.11</code>
                  </div>
                  <div className="p-4 border border-white/5">
                    <div className="text-white mb-1 text-[10px]">C++</div>
                    <code className="text-[9px] text-white/40">gRPC Core v1.48+</code>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Network Specification */}
          <section id="ports" className="space-y-8">
            <div className="flex items-center gap-3 text-white">
              <Settings className="w-6 h-6 text-blue-500" />
              <h2 className="text-sm font-black uppercase tracking-[0.3em]">2. Распределение сетевых портов</h2>
            </div>
            <div className="overflow-x-auto border border-white/10">
              <table className="w-full text-left text-[10px] border-collapse">
                <thead>
                  <tr className="bg-white/5 text-muted-foreground font-black tracking-widest">
                    <th className="px-6 py-4 border-r border-white/10">Порт</th>
                    <th className="px-6 py-4 border-r border-white/10">Протокол / Сервис</th>
                    <th className="px-6 py-4">Уровень доступа</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 font-mono">
                  <tr>
                    <td className="px-6 py-4 text-white border-r border-white/10">443</td>
                    <td className="px-6 py-4 border-r border-white/10">HTTPS / gRPC Ingress (LB)</td>
                    <td className="px-6 py-4 text-green-500">Public Edge</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-white border-r border-white/10">8545</td>
                    <td className="px-6 py-4 border-r border-white/10">Standard HTTP-RPC Gateway</td>
                    <td className="px-6 py-4 text-blue-500">Auth required</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-white border-r border-white/10">8546</td>
                    <td className="px-6 py-4 border-r border-white/10">Secure WSS Stream (Events)</td>
                    <td className="px-6 py-4 text-blue-500">Auth required</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-white border-r border-white/10">10001-10007</td>
                    <td className="px-6 py-4 border-r border-white/10">Direct gRPC Tunnels (Bypass)</td>
                    <td className="px-6 py-4 text-red-500 font-black tracking-tighter">VIP / Dedicated Only</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-white border-r border-white/10">9090</td>
                    <td className="px-6 py-4 border-r border-white/10">Infrastructure metrics</td>
                    <td className="px-6 py-4 text-white/20">Internal management</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[9px] text-muted-foreground font-bold tracking-widest leading-relaxed mt-4">
              * Использование портов 10001-10007 требует настройки выделенного IP в белом списке (whitelist) и mTLS-сертификата.
            </p>
          </section>

          {/* Protobuf Definition */}
          <section id="protobuf" className="space-y-8">
            <div className="flex items-center gap-3 text-white">
              <Zap className="w-6 h-6 text-blue-500" />
              <h2 className="text-sm font-black uppercase tracking-[0.3em]">3. Schema: Protobuf Definition</h2>
            </div>
            <div className="bg-black border border-white/10 p-8 font-mono text-[10px] space-y-4">
              <div className="text-blue-500 flex justify-between">
                <span>// telemetry.v1.proto</span>
                <span className="text-white/20">Confidential</span>
              </div>
              <pre className="text-slate-300 leading-relaxed overflow-x-auto">
{`syntax = "proto3";
package cyber.telemetry.v1;

service TelemetryIngestion {
  rpc StreamCollect (stream TelemetryBatch) returns (IngestionResponse);
  rpc GetNodeStats (NodeRequest) returns (NodeResponse);
}

message TelemetryBatch {
  string tenant_id = 1;
  uint64 timestamp = 2;
  repeated MetricData metrics = 3;
  bytes signature = 4; // RSA-4096 signature
}

message MetricData {
  string key = 1;
  bytes payload = 2; // AES-256 encrypted blob
  double latency_ns = 3;
}`}
              </pre>
            </div>
          </section>

          {/* Hardware Acceleration */}
          <section id="hardware" className="space-y-8">
            <div className="flex items-center gap-3 text-white">
              <Cpu className="w-6 h-6 text-blue-500" />
              <h2 className="text-sm font-black uppercase tracking-[0.3em]">4. Аппаратное ускорение (ASIC/FPGA)</h2>
            </div>
            <div className="text-[11px] text-muted-foreground leading-relaxed space-y-6 font-bold tracking-widest font-sans">
              <p>
                Данные проходят через выделенные карты сетевого ускорения (SmartNIC), что позволяет выполнять декапсуляцию пакетов на уровне железа.
                Это минимизирует дрожание (jitter) и обеспечивает стабильный p99 latency даже при пиковых нагрузках в 10+ Гбит/с.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-6 border border-white/10 bg-white/[0.02]">
                  <div className="technical-label mb-2 text-white/40">Технология разгрузки</div>
                  <div className="text-white font-black text-[12px]">FPGA / Xilinx Alveo</div>
                </div>
                <div className="p-6 border border-white/10 bg-white/[0.02]">
                  <div className="technical-label mb-2 text-white/40">Режим памяти</div>
                  <div className="text-white font-black text-[12px]">RDMA / Zero-Copy</div>
                </div>
              </div>
            </div>
          </section>

          {/* Data Localization */}
          <section id="compliance" className="space-y-8">
            <div className="flex items-center gap-3 text-white">
              <Globe className="w-6 h-6 text-blue-500" />
              <h2 className="text-sm font-black uppercase tracking-[0.3em]">5. Соответствие и локализация (ФЗ-152)</h2>
            </div>
            <div className="text-[11px] text-muted-foreground leading-relaxed space-y-6 font-bold tracking-widest font-sans">
              <p>
                В соответствии с законодательством РФ, все первичные логи авторизации и метаданные тенантов хранятся на серверных мощностях, 
                физически расположенных на территории Российской Федерации (MSK-IX / ЦОД NORD).
              </p>
              <ul className="list-disc pl-5 space-y-3 marker:text-blue-500">
                <li>Шифрование при хранении (AES-XTS)</li>
                <li>Ротация логов: 7 календарных дней</li>
                <li>Физический доступ: строго по регламенту Tier III</li>
              </ul>
            </div>
          </section>

        </div>

        <aside className="lg:col-span-4">
          <div className="bg-white/[0.02] border border-white/10 p-10 sticky top-28 space-y-12">
            <div>
              <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-10">Документация</h4>
              <nav className="space-y-6">
                {[
                  { label: 'Архитектура потока', id: 'architecture' },
                  { label: 'Сетевые порты', id: 'ports' },
                  { label: 'Protobuf Schema', id: 'protobuf' },
                  { label: 'Hardware Offloading', id: 'hardware' },
                  { label: 'Комплаенс РФ', id: 'compliance' }
                ].map((item) => (
                  <a 
                    key={item.id}
                    href={`#${item.id}`}
                    className="block text-[10px] font-black tracking-widest text-muted-foreground hover:text-white transition-colors flex items-center gap-3 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-blue-500 transition-colors" />
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
            
            <div className="pt-10 border-t border-white/10">
              <div className="technical-label mb-6">Сервисный статус</div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-white/40">Ingress Gateway</span>
                  <span className="text-[9px] text-green-500 font-mono font-black tracking-widest">Optimal</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-white/40">mTLS Auth Service</span>
                  <span className="text-[9px] text-green-500 font-mono font-black tracking-widest">Enabled</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-white/40">Backbone Latency</span>
                  <span className="text-[9px] text-blue-500 font-mono font-black tracking-widest">0.12ms</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-blue-500/5 border border-blue-500/10">
              <p className="text-[9px] text-blue-400 font-black leading-relaxed tracking-widest">
                Для получения доступа к Private API и протоколам mTLS, направьте запрос через тикет-систему личного кабинета.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
