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
    <div className="py-20 md:py-32 container mx-auto px-4 md:px-6 max-w-6xl bg-grid">
      <div className="mb-20 border-b border-white/10 pb-16">
        <h1 className="text-3xl md:text-6xl font-black tracking-tighter uppercase mb-6">ТЕХНИЧЕСКАЯ СПЕЦИФИКАЦИЯ</h1>
        <p className="text-muted-foreground text-[11px] font-bold uppercase tracking-[0.3em]">РУКОВОДСТВО ПО ИНТЕГРАЦИИ ВЫСОКОНАГРУЖЕННЫХ GRPC-КАНАЛОВ И СИСТЕМ ТЕЛЕМЕТРИИ.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8 space-y-32">
          
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
                <div className="text-blue-500 mb-2">// Поддерживаемые стеки исполнения</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border border-white/5">
                    <div className="text-white mb-1 uppercase text-[10px]">Golang</div>
                    <code className="text-[9px] text-white/40">grpc-go v1.50+ / v1.62</code>
                  </div>
                  <div className="p-4 border border-white/5">
                    <div className="text-white mb-1 uppercase text-[10px]">Rust</div>
                    <code className="text-[9px] text-white/40">tonic 0.10 / 0.11</code>
                  </div>
                  <div className="p-4 border border-white/5">
                    <div className="text-white mb-1 uppercase text-[10px]">C++</div>
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
              <h2 className="text-sm font-black uppercase tracking-[0.3em]">2. РАСПРЕДЕЛЕНИЕ СЕТЕВЫХ ПОРТОВ</h2>
            </div>
            <div className="overflow-x-auto border border-white/10">
              <table className="w-full text-left text-[10px] border-collapse">
                <thead>
                  <tr className="bg-white/5 text-muted-foreground font-black uppercase tracking-widest">
                    <th className="px-6 py-4 border-r border-white/10">ПОРТ</th>
                    <th className="px-6 py-4 border-r border-white/10">ПРОТОКОЛ / СЕРВИС</th>
                    <th className="px-6 py-4">УРОВЕНЬ ДОСТУПА</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 font-mono">
                  <tr>
                    <td className="px-6 py-4 text-white border-r border-white/10">443</td>
                    <td className="px-6 py-4 border-r border-white/10">HTTPS / gRPC INGRESS (LB)</td>
                    <td className="px-6 py-4 text-green-500">PUBLIC EDGE</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-white border-r border-white/10">8545</td>
                    <td className="px-6 py-4 border-r border-white/10">STANDARD HTTP-RPC GATEWAY</td>
                    <td className="px-6 py-4 text-blue-500">AUTH REQUIRED</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-white border-r border-white/10">8546</td>
                    <td className="px-6 py-4 border-r border-white/10">SECURE WSS STREAM (EVENTS)</td>
                    <td className="px-6 py-4 text-blue-500">AUTH REQUIRED</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-white border-r border-white/10">10001-10007</td>
                    <td className="px-6 py-4 border-r border-white/10">DIRECT gRPC TUNNELS (BYPASS)</td>
                    <td className="px-6 py-4 text-red-500 font-black tracking-tighter">VIP / DEDICATED ONLY</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-white border-r border-white/10">9090</td>
                    <td className="px-6 py-4 border-r border-white/10">INFRASTRUCTURE METRICS</td>
                    <td className="px-6 py-4 text-white/20 uppercase">INTERNAL MANAGEMENT</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest leading-relaxed mt-4">
              * ИСПОЛЬЗОВАНИЕ ПОРТОВ 10001-10007 ТРЕБУЕТ НАСТРОЙКИ ВЫДЕЛЕННОГО IP В БЕЛОМ СПИСКЕ (WHITELIST) И MTLS-СЕРТИФИКАТА.
            </p>
          </section>

          {/* Protobuf Definition */}
          <section id="protobuf" className="space-y-8">
            <div className="flex items-center gap-3 text-white">
              <Zap className="w-6 h-6 text-blue-500" />
              <h2 className="text-sm font-black uppercase tracking-[0.3em]">3. SCHEMA: PROTOBUF DEFINITION</h2>
            </div>
            <div className="bg-black border border-white/10 p-8 font-mono text-[10px] space-y-4">
              <div className="text-blue-500 flex justify-between">
                <span>// telemetry.v1.proto</span>
                <span className="text-white/20">CONFIDENTIAL</span>
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
              <h2 className="text-sm font-black uppercase tracking-[0.3em]">4. АППАРАТНОЕ УСКОРЕНИЕ (ASIC/FPGA)</h2>
            </div>
            <div className="text-[11px] text-muted-foreground leading-relaxed space-y-6 font-bold uppercase tracking-widest font-sans">
              <p>
                ДАННЫЕ ПРОХОДЯТ ЧЕРЕЗ ВЫДЕЛЕННЫЕ КАРТЫ СЕТЕВОГО УСКОРЕНИЯ (SMARTNIC), ЧТО ПОЗВОЛЯЕТ ВЫПОЛНЯТЬ ДЕКАПСУЛЯЦИЮ ПАКЕТОВ НА УРОВНЕ ЖЕЛЕЗА.
                ЭТО МИНИМИЗИРУЕТ ДРОЖАНИЕ (JITTER) И ОБЕСПЕЧИВАЕТ СТАБИЛЬНЫЙ P99 LATENCY ДАЖЕ ПРИ ПИКОВЫХ НАГРУЗКАХ В 10+ ГБИТ/С.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-6 border border-white/10 bg-white/[0.02]">
                  <div className="technical-label mb-2 text-white/40">Технология разгрузки</div>
                  <div className="text-white uppercase font-black text-[12px]">FPGA / Xilinx Alveo</div>
                </div>
                <div className="p-6 border border-white/10 bg-white/[0.02]">
                  <div className="technical-label mb-2 text-white/40">Режим памяти</div>
                  <div className="text-white uppercase font-black text-[12px]">RDMA / Zero-Copy</div>
                </div>
              </div>
            </div>
          </section>

          {/* Data Localization */}
          <section id="compliance" className="space-y-8">
            <div className="flex items-center gap-3 text-white">
              <Globe className="w-6 h-6 text-blue-500" />
              <h2 className="text-sm font-black uppercase tracking-[0.3em]">5. СООТВЕТСТВИЕ И ЛОКАЛИЗАЦИЯ (ФЗ-152)</h2>
            </div>
            <div className="text-[11px] text-muted-foreground leading-relaxed space-y-6 font-bold uppercase tracking-widest font-sans">
              <p>
                В СООТВЕТСТВИИ С ЗАКОНОДАТЕЛЬСТВОМ РФ, ВСЕ ПЕРВИЧНЫЕ ЛОГИ АВТОРИЗАЦИИ И МЕТАДАННЫЕ ТЕНАНТОВ ХРАНЯТСЯ НА СЕРВЕРНЫХ МОЩНОСТЯХ, 
                ФИЗИЧЕСКИ РАСПОЛОЖЕННЫХ НА ТЕРРИТОРИИ РОССИЙСКОЙ ФЕДЕРАЦИИ (MSK-IX / ЦОД NORD).
              </p>
              <ul className="list-disc pl-5 space-y-3 marker:text-blue-500">
                <li>ШИФРОВАНИЕ ПРИ ХРАНЕНИИ (AES-XTS)</li>
                <li>РОТАЦИЯ ЛОГОВ: 7 КАЛЕНДАРНЫХ ДНЕЙ</li>
                <li>ФИЗИЧЕСКИЙ ДОСТУП: СТРОГО ПО РЕГЛАМЕНТУ TIER III</li>
              </ul>
            </div>
          </section>

        </div>

        <aside className="lg:col-span-4">
          <div className="bg-white/[0.02] border border-white/10 p-10 sticky top-28 space-y-12">
            <div>
              <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-10">ДОКУМЕНТАЦИЯ</h4>
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
                    className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-white transition-colors flex items-center gap-3 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-blue-500 transition-colors" />
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
            
            <div className="pt-10 border-t border-white/10">
              <div className="technical-label mb-6">СЕРВИСНЫЙ СТАТУС</div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-white/40 uppercase">Ingress Gateway</span>
                  <span className="text-[9px] text-green-500 font-mono font-black uppercase tracking-widest">Optimal</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-white/40 uppercase">mTLS Auth Service</span>
                  <span className="text-[9px] text-green-500 font-mono font-black uppercase tracking-widest">Enabled</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-white/40 uppercase">Backbone Latency</span>
                  <span className="text-[9px] text-blue-500 font-mono font-black uppercase tracking-widest">0.12ms</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-blue-500/5 border border-blue-500/10">
              <p className="text-[9px] text-blue-400 font-black uppercase leading-relaxed tracking-widest">
                ДЛЯ ПОЛУЧЕНИЯ ДОСТУПА К PRIVATE API И ПРОТОКОЛАМ MTLS, НАПРАВЬТЕ ЗАПРОС ЧЕРЕЗ ТИКЕТ-СИСТЕМУ ЛИЧНОГО КАБИНЕТА.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
