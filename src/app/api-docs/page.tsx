
'use client';

import { useState } from 'react';
import { Terminal, ShieldCheck, Zap, Code, Settings, Copy, Check, Download, Server, Cpu, Activity, ChevronRight, FileCode } from 'lucide-react';

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
      <div className="mb-10 md:mb-16 border-b border-white/5 pb-8 md:pb-12 text-center lg:text-left">
        <div className="flex flex-col lg:flex-row items-center gap-3 md:gap-4 text-primary mb-4 md:mb-6">
          <Settings className="w-8 h-8 md:w-9 md:h-9" />
          <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase">Интеграция агентов</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl text-[10px] md:text-xs font-bold uppercase tracking-widest leading-relaxed mx-auto lg:mx-0">
          Web3CyberServices поддерживает все современные протоколы сбора телеметрии. Используйте наш генератор для быстрой настройки коллекторов.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        <div className="lg:col-span-2 space-y-8 md:space-y-12">
          {/* Быстрая установка CLI */}
          <section className="bg-blue-600/5 border border-blue-500/20 rounded-sm p-6 md:p-8">
            <h3 className="text-[11px] font-black text-white mb-4 uppercase tracking-widest flex items-center gap-2">
              <Download className="w-4 h-4 text-blue-400" /> Web3CyberServices CLI
            </h3>
            <p className="text-[9px] text-slate-400 mb-6 font-bold uppercase tracking-widest">
              Автоматический установщик для Linux систем (x86_64/ARM64).
            </p>
            <div className="bg-black/50 p-4 rounded-sm font-mono text-[10px] flex items-center justify-between border border-white/10 mb-6 overflow-hidden">
              <code className="text-blue-400 truncate pr-4">curl -sL https://pkg.${domain}/install.sh | bash</code>
              <button 
                onClick={() => handleCopy(`curl -sL https://pkg.${domain}/install.sh | bash`, 'cli')}
                className="text-slate-500 hover:text-white transition-colors shrink-0"
              >
                {copied === 'cli' ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </section>

          {/* Генератор конфигов */}
          <div className="space-y-6 md:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-base md:text-lg font-black text-white uppercase tracking-tight">Конфигурация приемников</h2>
              <div className="flex items-center gap-3 bg-slate-900 px-3 py-1.5 rounded-sm border border-white/5">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">API Ключ:</span>
                <input 
                  type="text" 
                  value={apiKey} 
                  onChange={(e) => setApiKey(e.target.value)}
                  className="bg-transparent border-none text-[10px] font-mono text-blue-400 w-32 focus:outline-none"
                />
              </div>
            </div>

            {[
              { id: 'vector', name: 'Vector (Datadog Agent)', code: configs.vector, lang: 'TOML' },
              { id: 'otel', name: 'OpenTelemetry (OTLP)', code: configs.otel, lang: 'YAML' },
              { id: 'fluentd', name: 'Fluentd / Logstash', code: configs.fluentd, lang: 'CONF' }
            ].map((cfg) => (
              <div key={cfg.id} className="bg-slate-900/50 border border-white/5 rounded-sm overflow-hidden">
                <div className="px-4 md:px-6 py-2 bg-white/5 flex items-center justify-between border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{cfg.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[9px] font-mono text-white/20">{cfg.lang}</span>
                    <button 
                      onClick={() => handleCopy(cfg.code, cfg.id)}
                      className="text-[9px] font-black text-slate-500 hover:text-white uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                    >
                      {copied === cfg.id ? <><Check className="w-3 h-3" /> Скопировано</> : <><Copy className="w-3 h-3" /> Копировать</>}
                    </button>
                  </div>
                </div>
                <div className="p-4 md:p-6 overflow-x-auto bg-black/20">
                  <pre className="font-mono text-[10px] md:text-[11px] leading-relaxed text-slate-300">
                    {cfg.code}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900/40 border border-white/5 p-6 md:p-8 rounded-sm">
            <h4 className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-6">Сетевые эндпоинты</h4>
            <div className="space-y-6">
              <div>
                <div className="text-[9px] font-black text-slate-500 uppercase mb-2">gRPC (Бинарный стрим)</div>
                <div className="text-[11px] font-mono text-white break-all">{domain}:443</div>
              </div>
              <div>
                <div className="text-[9px] font-black text-slate-500 uppercase mb-2">REST / HTTP Логи</div>
                <div className="text-[11px] font-mono text-white break-all">https://${domain}/v1/logs</div>
              </div>
              <div className="pt-4 border-t border-white/5">
                <div className="text-[9px] font-black text-slate-500 uppercase mb-2">Метрики Prometheus</div>
                <div className="text-[11px] font-mono text-white break-all">https://${domain}/metrics</div>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-600/10 border border-blue-500/20 p-6 rounded-sm">
            <h4 className="text-[9px] font-black text-white uppercase tracking-widest mb-3">SLA и Поддержка</h4>
            <p className="text-[10px] text-slate-400 mb-4 leading-relaxed font-bold uppercase tracking-wider">
              Enterprise клиентам доступна выделенная линия поддержки и кастомные условия хранения данных.
            </p>
            <button className="text-[10px] font-black uppercase text-blue-400 hover:text-white transition-colors flex items-center gap-1.5">
              Связаться с нами <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
