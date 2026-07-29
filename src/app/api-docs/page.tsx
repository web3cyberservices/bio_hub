
'use client';

import { useState } from 'react';
import { Terminal, ShieldCheck, Zap, Code, Settings, Copy, Check, Download, Server, Cpu, Activity } from 'lucide-react';

export default function ApiDocsPage() {
  const [apiKey, setApiKey] = useState('cl_live_xxxxxxxxxxxx');
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const configs = {
    vector: `[sinks.cyberlog_enterprise]
  type = "http"
  inputs = ["log_source"]
  uri = "https://api.cyberlog.io/api/v1/grpc"
  compression = "gzip"
  method = "post"
  content_type = "application/grpc"
  
  [sinks.cyberlog_enterprise.auth]
    type = "bearer"
    token = "${apiKey}"`,
    
    otel: `exporters:
  otlp/cyberlog:
    endpoint: "api.cyberlog.io:443"
    tls:
      insecure: false
    headers:
      x-api-key: "${apiKey}"

service:
  pipelines:
    logs:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp/cyberlog]`,

    fluentd: `<match **>
  @type http
  endpoint https://api.cyberlog.io/api/v1/logs
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
    <div className="py-24 container mx-auto px-6 max-w-6xl">
      <div className="mb-16 border-b border-white/5 pb-12">
        <div className="flex items-center gap-4 text-primary mb-6">
          <Settings className="w-10 h-10" />
          <h1 className="text-4xl font-black tracking-tight">Интеграция агентов</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl font-medium">
          CyberLog поддерживает все современные протоколы сбора телеметрии. Используйте наш генератор конфигураций для быстрой настройки ваших коллекторов.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-16">
        <div className="lg:col-span-2 space-y-12">
          {/* Быстрая установка CLI */}
          <section className="bg-blue-600/5 border border-blue-500/20 rounded-2xl p-8">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Download className="w-5 h-5 text-blue-400" /> CyberLog CLI & Agent
            </h3>
            <p className="text-sm text-slate-400 mb-6 font-medium">
              Автоматический установщик CyberLog Agent для Linux систем (x86_64/ARM64). Включает утилиту для тестирования пропускной способности.
            </p>
            <div className="bg-black/50 p-4 rounded-xl font-mono text-sm flex items-center justify-between border border-white/10 mb-6">
              <code className="text-blue-400">curl -sL https://pkg.cyberlog.io/install.sh | bash</code>
              <button 
                onClick={() => handleCopy('curl -sL https://pkg.cyberlog.io/install.sh | bash', 'cli')}
                className="text-slate-500 hover:text-white transition-colors"
              >
                {copied === 'cli' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex gap-4">
              <button className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2">
                <Download className="w-4 h-4" /> Скачать для Linux
              </button>
              <button className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2">
                <Download className="w-4 h-4" /> Скачать для Windows
              </button>
            </div>
          </section>

          {/* Генератор конфигов */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Конфигурация приемников</h2>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Ваш API ключ:</span>
                <input 
                  type="text" 
                  value={apiKey} 
                  onChange={(e) => setApiKey(e.target.value)}
                  className="bg-slate-900 border border-white/10 rounded-md px-3 py-1 text-xs font-mono text-blue-400 w-48 focus:outline-none focus:border-blue-500/50"
                />
              </div>
            </div>

            {[
              { id: 'vector', name: 'Vector (Datadog Agent)', code: configs.vector, lang: 'toml' },
              { id: 'otel', name: 'OpenTelemetry (OTLP)', code: configs.otel, lang: 'yaml' },
              { id: 'fluentd', name: 'Fluentd / Logstash', code: configs.fluentd, lang: 'xml' }
            ].map((cfg) => (
              <div key={cfg.id} className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 bg-white/5 flex items-center justify-between border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-bold text-white">{cfg.name}</span>
                  </div>
                  <button 
                    onClick={() => handleCopy(cfg.code, cfg.id)}
                    className="text-xs font-bold text-slate-500 hover:text-white flex items-center gap-2"
                  >
                    {copied === cfg.id ? <><Check className="w-3 h-3" /> Скопировано</> : <><Copy className="w-3 h-3" /> Копировать</>}
                  </button>
                </div>
                <div className="p-6 overflow-x-auto">
                  <pre className="font-mono text-[13px] leading-relaxed text-slate-300">
                    {cfg.code}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900/50 border border-white/5 p-8 rounded-2xl">
            <h4 className="text-xs font-black text-blue-500 uppercase tracking-widest mb-6">Сетевые эндпоинты</h4>
            <div className="space-y-6">
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">gRPC (Binary Stream)</div>
                <div className="text-sm font-mono text-white">api.cyberlog.io:443</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">REST / HTTP logs</div>
                <div className="text-sm font-mono text-white">https://api.cyberlog.io/v1/logs</div>
              </div>
              <div className="pt-4 border-t border-white/5">
                <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Prometheus Metrics</div>
                <div className="text-sm font-mono text-white">https://api.cyberlog.io/metrics</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-white/5 p-8 rounded-2xl">
            <div className="flex items-center gap-2 text-blue-400 mb-4 font-bold uppercase tracking-widest text-[10px]">
              <Activity className="w-4 h-4" /> Мониторинг платформы
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-medium mb-4">
              Мы предоставляем эндпоинт для внешнего скрейпинга метрик (Prometheus/Grafana).
            </p>
            <div className="bg-black/30 p-3 rounded font-mono text-[10px] text-green-400">
              # HELP ingested_events_total<br/>
              # TYPE ingested_events_total counter<br/>
              ingested_events_total 1.28e+09
            </div>
          </div>

          <div className="bg-blue-600/10 border border-blue-500/20 p-8 rounded-2xl">
            <div className="flex items-center gap-2 text-blue-400 mb-4 font-bold">
              <ShieldCheck className="w-5 h-5" />
              SSO & Security
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Для Enterprise-клиентов доступна интеграция с SAML 2.0 и Okta. Настройка авторизации агентов через mTLS 1.3.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
