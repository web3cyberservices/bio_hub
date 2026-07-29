'use client';

import { useState } from 'react';
import { Terminal, ShieldCheck, Zap, Code, Settings, Copy, Check, Download, Server, Cpu, Activity, ChevronRight } from 'lucide-react';

export default function ApiDocsPage() {
  const [apiKey, setApiKey] = useState('w3_live_xxxxxxxxxxxx');
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const domain = 'web3cyberservices.xyz';

  const configs = {
    vector: `[sinks.web3cyberservices_ingest]
  type = "http"
  inputs = ["log_source"]
  uri = "https://${domain}/api/v1/grpc"
  compression = "gzip"
  method = "post"
  content_type = "application/grpc"
  
  [sinks.web3cyberservices_ingest.auth]
    type = "bearer"
    token = "${apiKey}"`,
    
    otel: `exporters:
  otlp/web3:
    endpoint: "${domain}:443"
    tls:
      insecure: false
    headers:
      x-api-key: "${apiKey}"

service:
  pipelines:
    logs:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp/web3]`,

    fluentd: `<match **>
  @type http
  endpoint https://${domain}/api/v1/logs
  open_timeout 2
  <format>
    @type json
  </format>
  <auth>
    method bearer
    token ${apiKey}
  </auth>
</match>`
  };

  return (
    <div className="py-12 md:py-24 container mx-auto px-4 md:px-6 max-w-6xl overflow-x-hidden">
      <div className="mb-10 md:mb-16 border-b border-white/5 pb-8 md:pb-12">
        <div className="flex items-center gap-3 md:gap-4 text-primary mb-4 md:mb-6">
          <Settings className="w-8 h-8 md:w-10 md:h-10" />
          <h1 className="text-2xl md:text-4xl font-black tracking-tight">Интеграция агентов</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl text-sm md:text-base font-medium">
          Web3CyberServices поддерживает все современные протоколы сбора телеметрии. Используйте наш генератор конфигураций для быстрой настройки ваших коллекторов.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        <div className="lg:col-span-2 space-y-8 md:space-y-12">
          {/* Быстрая установка CLI */}
          <section className="bg-blue-600/5 border border-blue-500/20 rounded-xl md:rounded-2xl p-6 md:p-8">
            <h3 className="text-base md:text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Download className="w-4 h-4 md:w-5 md:h-5 text-blue-400" /> Web3CyberServices CLI
            </h3>
            <p className="text-[11px] md:text-sm text-slate-400 mb-6 font-medium">
              Автоматический установщик Web3CyberServices Agent для Linux систем (x86_64/ARM64). Включает утилиту для тестирования пропускной способности.
            </p>
            <div className="bg-black/50 p-3 md:p-4 rounded-xl font-mono text-[11px] md:text-sm flex items-center justify-between border border-white/10 mb-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
              <code className="text-blue-400 shrink-0 pr-4">curl -sL https://pkg.${domain}/install.sh | bash</code>
              <button 
                onClick={() => handleCopy(`curl -sL https://pkg.${domain}/install.sh | bash`, 'cli')}
                className="text-slate-500 hover:text-white transition-colors sticky right-0 bg-black/50 pl-2"
              >
                {copied === 'cli' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </section>

          {/* Генератор конфигов */}
          <div className="space-y-6 md:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-xl md:text-2xl font-bold text-white">Конфигурация приемников</h2>
              <div className="flex items-center gap-3 bg-slate-900 p-2 rounded-lg border border-white/5 self-start sm:self-auto">
                <span className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">API ключ:</span>
                <input 
                  type="text" 
                  value={apiKey} 
                  onChange={(e) => setApiKey(e.target.value)}
                  className="bg-transparent border-none text-[10px] md:text-xs font-mono text-blue-400 w-32 md:w-48 focus:outline-none"
                />
              </div>
            </div>

            {[
              { id: 'vector', name: 'Vector (Datadog Agent)', code: configs.vector, lang: 'toml' },
              { id: 'otel', name: 'OpenTelemetry (OTLP)', code: configs.otel, lang: 'yaml' },
              { id: 'fluentd', name: 'Fluentd / Logstash', code: configs.fluentd, lang: 'xml' }
            ].map((cfg) => (
              <div key={cfg.id} className="bg-slate-900/50 border border-white/5 rounded-xl md:rounded-2xl overflow-hidden">
                <div className="px-4 md:px-6 py-3 md:py-4 bg-white/5 flex items-center justify-between border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <Server className="w-3 h-3 md:w-4 md:h-4 text-blue-500" />
                    <span className="text-[11px] md:text-sm font-bold text-white">{cfg.name}</span>
                  </div>
                  <button 
                    onClick={() => handleCopy(cfg.code, cfg.id)}
                    className="text-[9px] md:text-xs font-bold text-slate-500 hover:text-white flex items-center gap-1.5 md:gap-2"
                  >
                    {copied === cfg.id ? <><Check className="w-2.5 h-2.5 md:w-3 md:h-3" /> Скопировано</> : <><Copy className="w-2.5 h-2.5 md:w-3 md:h-3" /> Копировать</>}
                  </button>
                </div>
                <div className="p-4 md:p-6 overflow-x-auto bg-black/20">
                  <pre className="font-mono text-[11px] md:text-[13px] leading-relaxed text-slate-300">
                    {cfg.code}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900/50 border border-white/5 p-6 md:p-8 rounded-xl md:rounded-2xl">
            <h4 className="text-[9px] md:text-[10px] font-black text-blue-500 uppercase tracking-widest mb-6">Сетевые эндпоинты</h4>
            <div className="space-y-6">
              <div>
                <div className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase mb-2">gRPC (Binary Stream)</div>
                <div className="text-xs md:text-sm font-mono text-white break-all">{domain}:443</div>
              </div>
              <div>
                <div className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase mb-2">REST / HTTP logs</div>
                <div className="text-xs md:text-sm font-mono text-white break-all">https://${domain}/v1/logs</div>
              </div>
              <div className="pt-4 border-t border-white/5">
                <div className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase mb-2">Prometheus Metrics</div>
                <div className="text-xs md:text-sm font-mono text-white break-all">https://${domain}/metrics</div>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-600/10 border border-blue-500/20 p-6 rounded-xl md:rounded-2xl">
            <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-3">Нужна помощь?</h4>
            <p className="text-[11px] text-slate-400 mb-4 leading-relaxed font-medium">
              Наши архитекторы помогут настроить пайплайны данных для вашей инфраструктуры.
            </p>
            <button className="text-[10px] font-black uppercase text-blue-400 hover:text-white transition-colors flex items-center gap-1.5">
              Связаться с поддержкой <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
